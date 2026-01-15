import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ErrorCode } from '@/types/api';

export async function GET(req: NextRequest) {
  try {
    // 验证用户身份
    const authResult = authenticate(req);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: 401 }
      );
    }

    // 获取用户完整信息
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, role, theme, created_at')
      .eq('id', authResult.user.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '获取用户信息失败',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        theme: user.theme,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
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
