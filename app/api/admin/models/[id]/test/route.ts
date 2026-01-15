import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ModelAdapterFactory } from '@/lib/ai/model-adapter';
import { registerAllAdapters } from '@/lib/ai/adapters';
import { ModelConfig } from '@/types/database';
import { ErrorCode } from '@/types/api';

// 确保适配器已注册
registerAllAdapters();

// 测试模型连接
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    const authResult = authenticateAdmin(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 获取模型配置
    const { data: model, error } = await supabaseAdmin
      .from('model_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !model) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.MODEL_NOT_FOUND,
            message: '模型配置不存在',
          },
        },
        { status: 404 }
      );
    }

    // 获取对应的适配器
    const adapter = ModelAdapterFactory.getAdapter(model.provider);
    if (!adapter) {
      return NextResponse.json(
        {
          success: false,
          message: `不支持的模型提供商: ${model.provider}`,
        },
        { status: 400 }
      );
    }

    // 转换数据库模型为ModelConfig类型
    const modelConfig: ModelConfig = {
      id: model.id,
      name: model.name,
      provider: model.provider,
      apiKey: model.api_key_encrypted,
      baseUrl: model.base_url,
      modelName: model.model_name,
      isMultimodal: model.is_multimodal,
      enabled: model.enabled,
      defaultParams: model.default_params,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
    };

    const startTime = Date.now();

    // 执行真实的连接测试
    const success = await adapter.testConnection(modelConfig);
    const latency = Date.now() - startTime;

    if (success) {
      return NextResponse.json({
        success: true,
        message: '连接测试成功',
        latency,
        provider: model.provider,
        modelName: model.model_name,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '连接测试失败，请检查API配置',
        provider: model.provider,
        modelName: model.model_name,
      });
    }
  } catch (error) {
    console.error('测试模型连接错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
