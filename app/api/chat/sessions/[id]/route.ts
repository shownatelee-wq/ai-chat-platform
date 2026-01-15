import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

// 更新会话（重命名、置顶等）
export async function PATCH(
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
    const body = await req.json();
    const { title, isPinned, parameters } = body;

    // 验证会话所有权
    const { data: existingSession, error: fetchError } = await supabaseAdmin
      .from('sessions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSession) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    if (existingSession.user_id !== authResult.user.userId) {
      return NextResponse.json(
        { error: '无权限操作此会话' },
        { status: 403 }
      );
    }

    // 构建更新数据
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (isPinned !== undefined) updateData.is_pinned = isPinned;
    if (parameters !== undefined) updateData.parameters = parameters;

    // 更新会话
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新会话失败:', error);
      return NextResponse.json(
        { error: '更新会话失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('更新会话错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 删除会话
export async function DELETE(
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
    const { data: existingSession, error: fetchError } = await supabaseAdmin
      .from('sessions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSession) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    if (existingSession.user_id !== authResult.user.userId) {
      return NextResponse.json(
        { error: '无权限操作此会话' },
        { status: 403 }
      );
    }

    // 删除会话（级联删除消息由数据库触发器处理）
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除会话失败:', error);
      return NextResponse.json(
        { error: '删除会话失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除会话错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
