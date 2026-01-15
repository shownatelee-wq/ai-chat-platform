import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ErrorCode } from '@/types/api';

// 删除邀请码
export async function DELETE(
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

    // 删除邀请码（实际上是标记为invalid）
    const { error } = await supabaseAdmin
      .from('invite_codes')
      .update({ status: 'invalid' })
      .eq('id', id);

    if (error) {
      console.error('删除邀请码失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '删除邀请码失败',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '邀请码已删除',
    });
  } catch (error) {
    console.error('删除邀请码错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
