// 用户类型
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  theme: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}

// 邀请码类型
export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  usedBy?: string;
  status: 'unused' | 'used' | 'invalid';
  createdAt: string;
  usedAt?: string;
}

// 模型配置类型
export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'claude' | 'deepseek' | 'gemini' | 'zhipu' | 'qwen';
  apiKey?: string; // 仅管理员可见
  baseUrl?: string;
  modelName: string;
  isMultimodal: boolean;
  enabled: boolean;
  defaultParams: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 会话类型
export interface Session {
  id: string;
  userId: string;
  title: string;
  modelId: string;
  isPinned: boolean;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    systemPrompt?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

// 消息类型
export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  modelId?: string;
  fileUrl?: string;
  fileType?: 'image' | 'document' | 'video';
  createdAt: string;
}

// 对话参数类型
export interface ChatParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt?: string;
}
