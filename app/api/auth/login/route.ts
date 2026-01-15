import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { LoginRequest, LoginResponse, ErrorCode } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();
    const { username, password } = body;

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_PARAMETERS,
            message: '用户名和密码不能为空',
          },
        },
        { status: 400 }
      );
    }

    // 查询用户
    const { data: user, error: queryError } = await supabaseAdmin
      .from('users')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .single();

    if (queryError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_CREDENTIALS,
            message: '用户名或密码错误',
          },
        },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_CREDENTIALS,
            message: '用户名或密码错误',
          },
        },
        { status: 401 }
      );
    }

    // 生成JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role as 'admin' | 'user',
    });

    const response: LoginResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role as 'admin' | 'user',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('登录错误:', error);
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
