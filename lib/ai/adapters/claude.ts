import Anthropic from '@anthropic-ai/sdk';
import { BaseModelAdapter } from '../model-adapter';
import { Message, ChatParameters, ModelConfig } from '@/types/database';
import { decryptApiKey } from '@/lib/utils/encryption';

export class ClaudeAdapter extends BaseModelAdapter {
  provider = 'claude';

  async testConnection(config: ModelConfig): Promise<boolean> {
    try {
      const apiKey = config.apiKey ? decryptApiKey(config.apiKey) : '';
      const client = new Anthropic({
        apiKey,
        baseURL: config.baseUrl,
      });

      // 简单测试：发送一个最小请求
      await client.messages.create({
        model: config.modelName,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return true;
    } catch (error) {
      console.error('Claude连接测试失败:', error);
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
      const client = new Anthropic({
        apiKey,
        baseURL: config.baseUrl,
      });

      const formattedMessages = this.formatMessages(messages);

      const stream = await client.messages.create({
        model: config.modelName,
        max_tokens: parameters.maxTokens,
        temperature: parameters.temperature,
        top_p: parameters.topP,
        system: parameters.systemPrompt,
        messages: formattedMessages as any,
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          onChunk(event.delta.text);
        }
      }

      onEnd();
    } catch (error) {
      this.handleError(error, onError);
    }
  }

  supportsMultimodal(): boolean {
    return true; // Claude支持图片输入
  }
}
