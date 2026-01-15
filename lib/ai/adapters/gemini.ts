import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseModelAdapter } from '../model-adapter';
import { Message, ChatParameters, ModelConfig } from '@/types/database';
import { decryptApiKey } from '@/lib/utils/encryption';

export class GeminiAdapter extends BaseModelAdapter {
  provider = 'gemini';

  async testConnection(config: ModelConfig): Promise<boolean> {
    try {
      const apiKey = config.apiKey ? decryptApiKey(config.apiKey) : '';
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: config.modelName });

      // 简单测试：发送一个最小请求
      await model.generateContent('Hi');
      return true;
    } catch (error) {
      console.error('Gemini连接测试失败:', error);
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
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: config.modelName,
        generationConfig: {
          temperature: parameters.temperature,
          maxOutputTokens: parameters.maxTokens,
          topP: parameters.topP,
        },
        systemInstruction: parameters.systemPrompt,
      });

      // 转换消息格式为Gemini格式
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];
      const chat = model.startChat({ history });

      const result = await chat.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          onChunk(text);
        }
      }

      onEnd();
    } catch (error) {
      this.handleError(error, onError);
    }
  }

  supportsMultimodal(): boolean {
    return true; // Gemini支持图片和视频
  }
}
