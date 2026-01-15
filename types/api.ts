import { Message, ChatParameters, ModelConfig, Session, InviteCode } from './database';

// 认证相关
export interface RegisterRequest {
  username: string;
  password: string;
  inviteCode: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
}

// 对话相关
export interface ChatStreamRequest {
  sessionId: string;
  modelId: string;
  message: string;
  fileUrl?: string;
  context: Message[];
  parameters: ChatParameters;
}

export interface StreamEvent {
  type: 'start' | 'chunk' | 'end' | 'error';
  data: string;
  messageId?: string;
}

export interface SessionListResponse {
  sessions: Session[];
}

export interface CreateSessionRequest {
  title?: string;
}

// 模型管理相关
export interface ModelListResponse {
  models: ModelConfig[];
}

export interface CreateModelRequest {
  name: string;
  provider: 'openai' | 'claude' | 'deepseek' | 'gemini' | 'zhipu' | 'qwen';
  apiKey: string;
  baseUrl?: string;
  modelName: string;
  isMultimodal: boolean;
  enabled: boolean;
  defaultParams: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
}

export interface UpdateModelRequest extends CreateModelRequest {
  id: string;
}

export interface TestModelResponse {
  success: boolean;
  message: string;
  latency?: number;
}

// 文件上传相关
export interface UploadRequest {
  file: File;
  sessionId: string;
}

export interface UploadResponse {
  success: boolean;
  fileUrl: string;
  fileType: 'image' | 'document' | 'video';
  fileSize: number;
}

// 错误响应
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// 错误代码
export enum ErrorCode {
  // 认证错误 (1xxx)
  INVALID_CREDENTIALS = '1001',
  INVALID_INVITE_CODE = '1002',
  USERNAME_EXISTS = '1003',
  UNAUTHORIZED = '1004',
  
  // 模型错误 (2xxx)
  MODEL_NOT_FOUND = '2001',
  MODEL_API_ERROR = '2002',
  MODEL_TIMEOUT = '2003',
  INVALID_MODEL_CONFIG = '2004',
  
  // 文件错误 (3xxx)
  FILE_TOO_LARGE = '3001',
  UNSUPPORTED_FILE_TYPE = '3002',
  UPLOAD_FAILED = '3003',
  
  // 数据错误 (4xxx)
  SESSION_NOT_FOUND = '4001',
  MESSAGE_NOT_FOUND = '4002',
  INVALID_PARAMETERS = '4003',
  
  // 系统错误 (5xxx)
  INTERNAL_ERROR = '5001',
  DATABASE_ERROR = '5002',
  RATE_LIMIT_EXCEEDED = '5003',
}
