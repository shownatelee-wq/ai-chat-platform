import OpenAI from 'openai';
import { BaseModelAdapter } from '../model-adapter';
import { Message, ChatParameters, ModelConfig } from '@/types/database';
import { decryptApiKey } from '@/lib/utils/encryption';

export class QwenAdapter extends BaseModelAdapter {
  provider = 'qwen';

  async testConnection(config: ModelConfig): Promise<boolean> {
    try {
      const apiKey = config.apiKey ? decryptApiKey(config.apiKey) : '';
      const client = new OpenAI({
        apiKey,
        baseURL: config.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });

      // 简单测试：发送一个最小请求
      await client.chat.completions.create({
        model: config.modelName,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      console.error('通义千问连接测试失败:', error);
      return false;
    }
  }

  async streamChat(
    config: ModelConfig,
    messages: Message[],
    parameters: ChatParameters,
    onChunk: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const apiKey = config.apiKey ? decryptApiKey(config.apiKey) : '';
      const client = new OpenAI({
        apiKey,
        baseURL: config.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });

      const formattedMessages = this.formatMessages(messages);

      // 添加系统提示词
      if (parameters.systemPrompt) {
        formattedMessages.unshift({
          role: 'system',
          content: parameters.systemPrompt,
        });
      }

      const stream = await client.chat.completions.create({
        model: config.modelName,
        messages: formattedMessages as any,
        temperature: parameters.temperature,
        max_tokens: parameters.maxTokens,
        top_p: parameters.topP,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }

      onEnd();
    } catch (error) {
      this.handleError(error, onError);
    }
  }

  supportsMultimodal(): boolean {
    return true; // 通义千问VL支持多模态
  }
}
