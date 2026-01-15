import { ModelAdapterFactory } from '../model-adapter';
import { OpenAIAdapter } from './openai';
import { ClaudeAdapter } from './claude';
import { DeepSeekAdapter } from './deepseek';
import { GeminiAdapter } from './gemini';
import { ZhipuAdapter } from './zhipu';
import { QwenAdapter } from './qwen';

// 注册所有适配器
export function registerAllAdapters() {
  ModelAdapterFactory.register('openai', new OpenAIAdapter());
  ModelAdapterFactory.register('claude', new ClaudeAdapter());
  ModelAdapterFactory.register('deepseek', new DeepSeekAdapter());
  ModelAdapterFactory.register('gemini', new GeminiAdapter());
  ModelAdapterFactory.register('zhipu', new ZhipuAdapter());
  ModelAdapterFactory.register('qwen', new QwenAdapter());
}

// 导出所有适配器
export {
  OpenAIAdapter,
  ClaudeAdapter,
  DeepSeekAdapter,
  GeminiAdapter,
  ZhipuAdapter,
  QwenAdapter,
};
