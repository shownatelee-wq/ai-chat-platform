import { Message, ChatParameters, ModelConfig } from '@/types/database';

// 模型适配器接口
export interface ModelAdapter {
  provider: string;
  
  // 测试连接
  testConnection(config: ModelConfig): Promise<boolean>;
  
  // 流式对话
  streamChat(
    config: ModelConfig,
    messages: Message[],
    parameters: ChatParameters,
    onChunk: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: Error) => void
  ): Promise<void>;
  
  // 支持的功能
  supportsMultimodal(): boolean;
  supportsStreaming(): boolean;
}

// 模型适配器工厂
export class ModelAdapterFactory {
  private static adapters: Map<string, ModelAdapter> = new Map();

  static register(provider: string, adapter: ModelAdapter) {
    this.adapters.set(provider, adapter);
  }

  static getAdapter(provider: string): ModelAdapter | null {
    return this.adapters.get(provider) || null;
  }

  static getAllProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// 基础适配器类
export abstract class BaseModelAdapter implements ModelAdapter {
  abstract provider: string;

  abstract testConnection(config: ModelConfig): Promise<boolean>;

  abstract streamChat(
    config: ModelConfig,
    messages: Message[],
    parameters: ChatParameters,
    onChunk: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: Error) => void
  ): Promise<void>;

  abstract supportsMultimodal(): boolean;

  supportsStreaming(): boolean {
    return true; // 默认支持流式输出
  }

  // 辅助方法：格式化消息
  protected formatMessages(messages: Message[]): any[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // 辅助方法：处理错误
  protected handleError(error: any, onError: (error: Error) => void) {
    console.error(`${this.provider} 错误:`, error);
    onError(new Error(error.message || '模型调用失败'));
  }
}
