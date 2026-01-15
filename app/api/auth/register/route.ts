import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/password';
import { validateUsername, validatePassword, validateInviteCode } from '@/lib/utils/validation';
import { RegisterRequest, RegisterResponse, ErrorCode } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json();
    const { username, password, inviteCode } = body;

    // 验证输入
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_PARAMETERS,
            message: usernameValidation.error,
          },
        },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_PARAMETERS,
            message: passwordValidation.error,
          },
        },
        { status: 400 }
      );
    }

    const inviteCodeValidation = validateInviteCode(inviteCode);
    if (!inviteCodeValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_INVITE_CODE,
            message: inviteCodeValidation.error,
          },
        },
        { status: 400 }
      );
    }

    // 检查邀请码是否有效
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode)
      .eq('status', 'unused')
      .single();

    if (inviteError || !inviteData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_INVITE_CODE,
            message: '邀请码无效或已被使用',
          },
        },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.USERNAME_EXISTS,
            message: '用户名已存在',
          },
        },
        { status: 400 }
      );
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        role: 'user',
        theme: 'light',
      })
      .select('id')
      .single();

    if (createError || !newUser) {
      console.error('创建用户失败:', createError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '创建用户失败',
          },
        },
        { status: 500 }
      );
    }

    // 标记邀请码为已使用
    const { error: updateError } = await supabaseAdmin
      .from('invite_codes')
      .update({
        status: 'used',
        used_by: newUser.id,
        used_at: new Date().toISOString(),
      })
      .eq('id', inviteData.id);

    if (updateError) {
      console.error('更新邀请码状态失败:', updateError);
      // 不影响注册流程，只记录错误
    }

    const response: RegisterResponse = {
      success: true,
      message: '注册成功',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('注册错误:', error);
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
