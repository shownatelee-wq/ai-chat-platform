import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ModelAdapterFactory } from '@/lib/ai/model-adapter';
import { registerAllAdapters } from '@/lib/ai/adapters';
import { ModelConfig, Message } from '@/types/database';

// 确保适配器已注册
registerAllAdapters();

// 生成会话标题（基于首条用户消息）
function generateTitle(content: string): string {
  // 取前30个字符作为标题
  const title = content.trim().slice(0, 30);
  return title.length < content.trim().length ? title + '...' : title;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = authenticate(req);
    if (!authResult.success || !authResult.user) {
      return new Response(
        JSON.stringify({ error: authResult.error || '未授权' }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sessionId, content, fileUrl, fileType } = body;

    if (!sessionId || !content) {
      return new Response(
        JSON.stringify({ error: '会话ID和消息内容不能为空' }),
        { status: 400 }
      );
    }

    // 获取会话信息
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*, model_configs(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: '会话不存在' }),
        { status: 404 }
      );
    }

    if (session.user_id !== authResult.user.userId) {
      return new Response(
        JSON.stringify({ error: '无权限访问此会话' }),
        { status: 403 }
      );
    }

    // 检查模型是否启用
    if (!session.model_configs.enabled) {
      return new Response(
        JSON.stringify({ error: '模型未启用' }),
        { status: 400 }
      );
    }

    // 获取适配器
    const adapter = ModelAdapterFactory.getAdapter(session.model_configs.provider);
    if (!adapter) {
      return new Response(
        JSON.stringify({ error: '不支持的模型提供商' }),
        { status: 400 }
      );
    }

    // 检查多模态支持
    if (fileUrl && !adapter.supportsMultimodal()) {
      return new Response(
        JSON.stringify({ error: '当前模型不支持文件上传' }),
        { status: 400 }
      );
    }

    // 保存用户消息
    const { data: userMessage, error: userMsgError } = await supabaseAdmin
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content,
        file_url: fileUrl,
        file_type: fileType,
        model_id: session.model_id,
      })
      .select()
      .single();

    if (userMsgError || !userMessage) {
      return new Response(
        JSON.stringify({ error: '保存用户消息失败' }),
        { status: 500 }
      );
    }

    // 获取历史消息（用于上下文）
    const { data: historyMessages, error: historyError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (historyError) {
      return new Response(
        JSON.stringify({ error: '获取历史消息失败' }),
        { status: 500 }
      );
    }

    // 检查是否是第一条消息，如果是则自动生成标题
    const isFirstMessage = historyMessages.length === 1;
    if (isFirstMessage && session.title === '新对话') {
      const newTitle = generateTitle(content);
      await supabaseAdmin
        .from('sessions')
        .update({ title: newTitle })
        .eq('id', sessionId);
    }

    // 转换模型配置
    const modelConfig: ModelConfig = {
      id: session.model_configs.id,
      name: session.model_configs.name,
      provider: session.model_configs.provider,
      apiKey: session.model_configs.api_key_encrypted,
      baseUrl: session.model_configs.base_url,
      modelName: session.model_configs.model_name,
      isMultimodal: session.model_configs.is_multimodal,
      enabled: session.model_configs.enabled,
      defaultParams: session.model_configs.default_params,
      createdAt: session.model_configs.created_at,
      updatedAt: session.model_configs.updated_at,
    };

    // 创建SSE流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let assistantContent = '';
        let assistantMessageId: string | null = null;

        try {
          // 调用模型适配器进行流式对话
          await adapter.streamChat(
            modelConfig,
            historyMessages as Message[],
            session.parameters,
            // onChunk: 处理每个文本块
            (chunk: string) => {
              assistantContent += chunk;
              const data = JSON.stringify({ type: 'chunk', content: chunk });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            },
            // onEnd: 对话结束
            async () => {
              // 保存助手消息
              const { data: assistantMessage, error: assistantMsgError } = await supabaseAdmin
                .from('messages')
                .insert({
                  session_id: sessionId,
                  role: 'assistant',
                  content: assistantContent,
                  model_id: session.model_id,
                })
                .select()
                .single();

              if (assistantMsgError) {
                console.error('保存助手消息失败:', assistantMsgError);
              } else {
                assistantMessageId = assistantMessage.id;
              }

              // 更新会话的最后活跃时间（由数据库触发器自动处理）
              
              const data = JSON.stringify({
                type: 'done',
                messageId: assistantMessageId,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              controller.close();
            },
            // onError: 错误处理
            (error: Error) => {
              console.error('流式对话错误:', error);
              const data = JSON.stringify({
                type: 'error',
                error: error.message,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              controller.close();
            }
          );
        } catch (error) {
          console.error('流式对话异常:', error);
          const data = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : '未知错误',
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('流式对话API错误:', error);
    return new Response(
      JSON.stringify({ error: '服务器内部错误' }),
      { status: 500 }
    );
  }
}
