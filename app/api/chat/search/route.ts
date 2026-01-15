import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

// 搜索历史对话
export async function GET(req: NextRequest) {
  try {
    const authResult = authenticate(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || '未授权' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '搜索关键词不能为空' },
        { status: 400 }
      );
    }

    // 使用全文搜索查询消息
    // 注意：这里使用ilike进行简单搜索，如果需要更高级的全文搜索，需要在数据库中配置
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*, sessions!inner(user_id, title)')
      .ilike('content', `%${query}%`)
      .eq('sessions.user_id', authResult.user.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('搜索消息失败:', error);
      return NextResponse.json(
        { error: '搜索失败' },
        { status: 500 }
      );
    }

    // 按会话分组结果
    const resultsBySession = messages.reduce((acc: any, msg: any) => {
      const sessionId = msg.session_id;
      if (!acc[sessionId]) {
        acc[sessionId] = {
          sessionId,
          sessionTitle: msg.sessions.title,
          messages: [],
        };
      }
      acc[sessionId].messages.push({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at,
      });
      return acc;
    }, {});

    const results = Object.values(resultsBySession);

    return NextResponse.json({
      query,
      results,
      total: messages.length,
    });
  } catch (error) {
    console.error('搜索错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
