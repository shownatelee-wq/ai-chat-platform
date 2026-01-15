import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt';
import { ErrorCode } from '@/types/api';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// 认证中间件 - 验证用户身份
export function authenticate(req: NextRequest): { 
  success: boolean; 
  user?: JWTPayload; 
  error?: { code: string; message: string } 
} {
  const authHeader = req.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: '未提供认证令牌',
      },
    };
  }

  const user = verifyToken(token);

  if (!user) {
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: '无效或过期的令牌',
      },
    };
  }

  return {
    success: true,
    user,
  };
}

// 管理员权限检查
export function requireAdmin(user: JWTPayload): {
  success: boolean;
  error?: { code: string; message: string };
} {
  if (user.role !== 'admin') {
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: '需要管理员权限',
      },
    };
  }

  return { success: true };
}

// 组合中间件 - 认证 + 管理员权限
export function authenticateAdmin(req: NextRequest): {
  success: boolean;
  user?: JWTPayload;
  error?: { code: string; message: string };
} {
  const authResult = authenticate(req);
  
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  const adminCheck = requireAdmin(authResult.user);
  
  if (!adminCheck.success) {
    return adminCheck;
  }

  return authResult;
}
