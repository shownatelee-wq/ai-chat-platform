# AI模型适配器

本目录包含所有AI模型的适配器实现，用于统一不同模型提供商的API接口。

## 架构

### 核心组件

1. **ModelAdapter接口** (`model-adapter.ts`)
   - 定义了所有适配器必须实现的方法
   - `testConnection()`: 测试API连接
   - `streamChat()`: 流式对话
   - `supportsMultimodal()`: 是否支持多模态
   - `supportsStreaming()`: 是否支持流式输出

2. **BaseModelAdapter抽象类** (`model-adapter.ts`)
   - 提供通用的辅助方法
   - `formatMessages()`: 格式化消息
   - `handleError()`: 统一错误处理

3. **ModelAdapterFactory工厂类** (`model-adapter.ts`)
   - 管理所有适配器实例
   - `register()`: 注册适配器
   - `getAdapter()`: 获取适配器
   - `getAllProviders()`: 获取所有提供商

## 已实现的适配器

### 1. OpenAI (`adapters/openai.ts`)
- **SDK**: `openai`
- **多模态**: ✅ (GPT-4 Vision)
- **流式输出**: ✅
- **默认Base URL**: https://api.openai.com/v1

### 2. Claude (`adapters/claude.ts`)
- **SDK**: `@anthropic-ai/sdk`
- **多模态**: ✅ (图片)
- **流式输出**: ✅
- **默认Base URL**: https://api.anthropic.com

### 3. DeepSeek (`adapters/deepseek.ts`)
- **SDK**: `openai` (兼容)
- **多模态**: ❌
- **流式输出**: ✅
- **默认Base URL**: https://api.deepseek.com

### 4. Gemini (`adapters/gemini.ts`)
- **SDK**: `@google/generative-ai`
- **多模态**: ✅ (图片、视频)
- **流式输出**: ✅
- **默认Base URL**: 由SDK管理

### 5. 智谱AI (`adapters/zhipu.ts`)
- **SDK**: `openai` (兼容)
- **多模态**: ✅ (GLM-4V)
- **流式输出**: ✅
- **默认Base URL**: https://open.bigmodel.cn/api/paas/v4

### 6. 通义千问 (`adapters/qwen.ts`)
- **SDK**: `openai` (兼容)
- **多模态**: ✅ (Qwen-VL)
- **流式输出**: ✅
- **默认Base URL**: https://dashscope.aliyuncs.com/compatible-mode/v1

## 使用方法

### 1. 注册适配器

在应用启动时注册所有适配器：

```typescript
import { registerAllAdapters } from '@/lib/ai/adapters';

registerAllAdapters();
```

### 2. 获取适配器

```typescript
import { ModelAdapterFactory } from '@/lib/ai/model-adapter';

const adapter = ModelAdapterFactory.getAdapter('openai');
```

### 3. 测试连接

```typescript
const config: ModelConfig = {
  id: '...',
  name: 'GPT-4',
  provider: 'openai',
  apiKey: 'encrypted_api_key',
  baseUrl: 'https://api.openai.com/v1',
  modelName: 'gpt-4',
  isMultimodal: true,
  enabled: true,
  defaultParams: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
  },
  createdAt: '...',
  updatedAt: '...',
};

const success = await adapter.testConnection(config);
```

### 4. 流式对话

```typescript
await adapter.streamChat(
  config,
  messages,
  parameters,
  (chunk) => {
    // 处理每个文本块
    console.log(chunk);
  },
  () => {
    // 对话结束
    console.log('完成');
  },
  (error) => {
    // 错误处理
    console.error(error);
  }
);
```

## 添加新适配器

1. 创建新的适配器类，继承`BaseModelAdapter`
2. 实现所有必需的方法
3. 在`adapters/index.ts`中注册新适配器

示例：

```typescript
import { BaseModelAdapter } from '../model-adapter';
import { Message, ChatParameters, ModelConfig } from '@/types/database';

export class NewModelAdapter extends BaseModelAdapter {
  provider = 'new-model';

  async testConnection(config: ModelConfig): Promise<boolean> {
    // 实现连接测试
  }

  async streamChat(
    config: ModelConfig,
    messages: Message[],
    parameters: ChatParameters,
    onChunk: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    // 实现流式对话
  }

  supportsMultimodal(): boolean {
    return false;
  }
}
```

## 注意事项

1. **API Key加密**: 所有API Key在数据库中都是加密存储的，使用前需要通过`decryptApiKey()`解密
2. **错误处理**: 所有适配器都应该使用`handleError()`方法统一处理错误
3. **流式输出**: 所有适配器都支持流式输出，通过`onChunk`回调逐步返回内容
4. **多模态支持**: 根据模型能力正确设置`supportsMultimodal()`返回值
5. **Base URL**: 支持自定义Base URL，用于代理或私有部署

## 依赖包

```json
{
  "openai": "^4.x",
  "@anthropic-ai/sdk": "^0.x",
  "@google/generative-ai": "^0.x"
}
```
