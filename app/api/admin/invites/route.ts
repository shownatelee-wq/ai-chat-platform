import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ErrorCode } from '@/types/api';

// 获取邀请码列表
export async function GET(req: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = authenticateAdmin(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // 查询所有邀请码
    const { data: inviteCodes, error } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查询邀请码失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '查询邀请码失败',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inviteCodes,
    });
  } catch (error) {
    console.error('获取邀请码列表错误:', error);
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

// 生成新邀请码
export async function POST(req: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = authenticateAdmin(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // 生成邀请码
    const { data, error } = await supabaseAdmin.rpc('generate_invite_code');

    if (error) {
      console.error('生成邀请码失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '生成邀请码失败',
          },
        },
        { status: 500 }
      );
    }

    const code = data as string;

    // 插入邀请码
    const { data: newInviteCode, error: insertError } = await supabaseAdmin
      .from('invite_codes')
      .insert({
        code,
        created_by: authResult.user.userId,
        status: 'unused',
      })
      .select()
      .single();

    if (insertError || !newInviteCode) {
      console.error('插入邀请码失败:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '创建邀请码失败',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        inviteCode: newInviteCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建邀请码错误:', error);
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
