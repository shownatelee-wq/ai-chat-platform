import { NextResponse } from 'next/server';

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 常见错误类型
 */
export const ErrorCodes = {
  // 认证错误 (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 权限错误 (403)
  FORBIDDEN: 'FORBIDDEN',
  ADMIN_ONLY: 'ADMIN_ONLY',
  
  // 请求错误 (400)
  BAD_REQUEST: 'BAD_REQUEST',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  
  // 资源错误 (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // 冲突错误 (409)
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // 服务器错误 (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
};

/**
 * 错误响应格式
 */
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

/**
 * 处理 API 错误并返回标准化的响应
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  // 自定义 API 错误
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // 数据库错误
  if (error instanceof Error && error.message.includes('duplicate key')) {
    return NextResponse.json(
      {
        error: '资源已存在',
        code: ErrorCodes.ALREADY_EXISTS,
      },
      { status: 409 }
    );
  }

  // 验证错误
  if (error instanceof Error && error.message.includes('validation')) {
    return NextResponse.json(
      {
        error: error.message,
        code: ErrorCodes.INVALID_INPUT,
      },
      { status: 400 }
    );
  }

  // 通用错误
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || '服务器内部错误',
        code: ErrorCodes.INTERNAL_ERROR,
      },
      { status: 500 }
    );
  }

  // 未知错误
  return NextResponse.json(
    {
      error: '未知错误',
      code: ErrorCodes.INTERNAL_ERROR,
    },
    { status: 500 }
  );
}

/**
 * 包装异步 API 处理函数，自动处理错误
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * 验证必填字段
 */
export function validateRequiredFields(
  data: Record<string, any>,
  fields: string[]
): void {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new ApiError(
      400,
      `缺少必填字段: ${missing.join(', ')}`,
      ErrorCodes.MISSING_FIELD
    );
  }
}

/**
 * 验证字段类型
 */
export function validateFieldType(
  value: any,
  expectedType: string,
  fieldName: string
): void {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    throw new ApiError(
      400,
      `字段 ${fieldName} 类型错误，期望 ${expectedType}，实际 ${actualType}`,
      ErrorCodes.INVALID_INPUT
    );
  }
}

/**
 * 验证数值范围
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw new ApiError(
      400,
      `字段 ${fieldName} 超出范围，应在 ${min} 到 ${max} 之间`,
      ErrorCodes.INVALID_INPUT
    );
  }
}

/**
 * 记录错误日志（生产环境可以发送到日志服务）
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  };

  // 开发环境：输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', JSON.stringify(errorInfo, null, 2));
  }

  // 生产环境：可以发送到日志服务（如 Sentry、LogRocket 等）
  // 这里可以添加发送到外部日志服务的代码
}
