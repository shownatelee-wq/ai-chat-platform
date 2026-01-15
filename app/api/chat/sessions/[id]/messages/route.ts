import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

// 获取会话的所有消息
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = authenticate(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 验证会话所有权
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    if (session.user_id !== authResult.user.userId) {
      return NextResponse.json(
        { error: '无权限访问此会话' },
        { status: 403 }
      );
    }

    // 获取消息列表
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('查询消息列表失败:', error);
      return NextResponse.json(
        { error: '查询消息列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('获取消息列表错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
