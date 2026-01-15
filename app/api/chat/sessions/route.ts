import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

// 获取会话列表
export async function GET(req: NextRequest) {
  try {
    const authResult = authenticate(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || '未授权' },
        { status: 401 }
      );
    }

    // 查询用户的所有会话，按置顶和最后活跃时间排序
    const { data: sessions, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('user_id', authResult.user.userId)
      .order('is_pinned', { ascending: false })
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error('查询会话列表失败:', error);
      return NextResponse.json(
        { error: '查询会话列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('获取会话列表错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 创建新会话
export async function POST(req: NextRequest) {
  try {
    const authResult = authenticate(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || '未授权' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { modelId, title } = body;

    if (!modelId) {
      return NextResponse.json(
        { error: '模型ID不能为空' },
        { status: 400 }
      );
    }

    // 获取模型的默认参数
    const { data: model, error: modelError } = await supabaseAdmin
      .from('model_configs')
      .select('default_params')
      .eq('id', modelId)
      .eq('enabled', true)
      .single();

    if (modelError || !model) {
      return NextResponse.json(
        { error: '模型不存在或未启用' },
        { status: 404 }
      );
    }

    // 创建新会话
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: authResult.user.userId,
        title: title || '新对话',
        model_id: modelId,
        is_pinned: false,
        parameters: model.default_params,
      })
      .select()
      .single();

    if (error) {
      console.error('创建会话失败:', error);
      return NextResponse.json(
        { error: '创建会话失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('创建会话错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
