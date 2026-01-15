import OpenAI from 'openai';
import { BaseModelAdapter } from '../model-adapter';
import { Message, ChatParameters, ModelConfig } from '@/types/database';
import { decryptApiKey } from '@/lib/utils/encryption';

export class DeepSeekAdapter extends BaseModelAdapter {
  provider = 'deepseek';

  async testConnection(config: ModelConfig): Promise<boolean> {
    try {
      const apiKey = config.apiKey ? decryptApiKey(config.apiKey) : '';
      const client = new OpenAI({
        apiKey,
        baseURL: config.baseUrl || 'https://api.deepseek.com',
      });

      // 简单测试：列出模型
      await client.models.list();
      return true;
    } catch (error) {
      console.error('DeepSeek连接测试失败:', error);
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
        baseURL: config.baseUrl || 'https://api.deepseek.com',
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
    return false; // DeepSeek目前不支持多模态
  }
}
