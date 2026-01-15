# API 文档

本文档列出了所有可用的API端点及其使用方法。

## 认证

所有API请求（除了登录和注册）都需要在请求头中包含JWT token：

```
Authorization: Bearer <your-jwt-token>
```

## 认证相关 API

### 用户注册

**端点**: `POST /api/auth/register`

**请求体**:
```json
{
  "username": "string",
  "password": "string",
  "inviteCode": "string"
}
```

**响应**:
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "user"
  },
  "token": "string"
}
```

### 用户登录

**端点**: `POST /api/auth/login`

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "admin" | "user"
  },
  "token": "string"
}
```

### 获取当前用户信息

**端点**: `GET /api/auth/me`

**响应**:
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "admin" | "user",
    "theme": "light" | "dark"
  }
}
```

## 模型相关 API

### 获取可用模型列表

**端点**: `GET /api/models`

**响应**:
```json
{
  "models": [
    {
      "id": "string",
      "name": "string",
      "provider": "openai" | "claude" | "deepseek" | "gemini" | "zhipu" | "qwen",
      "model_name": "string",
      "is_multimodal": boolean,
      "default_params": {
        "temperature": number,
        "maxTokens": number,
        "topP": number
      }
    }
  ]
}
```

## 会话管理 API

### 获取会话列表

**端点**: `GET /api/chat/sessions`

**响应**:
```json
{
  "sessions": [
    {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "model_id": "string",
      "is_pinned": boolean,
      "parameters": {
        "temperature": number,
        "maxTokens": number,
        "topP": number,
        "systemPrompt": "string"
      },
      "created_at": "string",
      "updated_at": "string",
      "last_active_at": "string"
    }
  ]
}
```

### 创建新会话

**端点**: `POST /api/chat/sessions`

**请求体**:
```json
{
  "modelId": "string",
  "title": "string" // 可选，默认为"新对话"
}
```

**响应**:
```json
{
  "session": {
    "id": "string",
    "user_id": "string",
    "title": "string",
    "model_id": "string",
    "is_pinned": boolean,
    "parameters": { ... },
    "created_at": "string",
    "updated_at": "string",
    "last_active_at": "string"
  }
}
```

### 更新会话

**端点**: `PATCH /api/chat/sessions/[id]`

**请求体**:
```json
{
  "title": "string", // 可选
  "isPinned": boolean, // 可选
  "parameters": { // 可选
    "temperature": number,
    "maxTokens": number,
    "topP": number,
    "systemPrompt": "string"
  }
}
```

**响应**:
```json
{
  "session": { ... }
}
```

### 删除会话

**端点**: `DELETE /api/chat/sessions/[id]`

**响应**:
```json
{
  "success": true
}
```

### 获取会话消息

**端点**: `GET /api/chat/sessions/[id]/messages`

**响应**:
```json
{
  "messages": [
    {
      "id": "string",
      "session_id": "string",
      "role": "user" | "assistant",
      "content": "string",
      "model_id": "string",
      "file_url": "string", // 可选
      "file_type": "image" | "document" | "video", // 可选
      "created_at": "string"
    }
  ]
}
```

## 对话 API

### 流式对话

**端点**: `POST /api/chat/stream`

**请求体**:
```json
{
  "sessionId": "string",
  "content": "string",
  "fileUrl": "string", // 可选
  "fileType": "image" | "document" | "video" // 可选
}
```

**响应**: Server-Sent Events (SSE) 流

事件格式：
```
data: {"type": "chunk", "content": "文本块"}
data: {"type": "done", "messageId": "string"}
data: {"type": "error", "error": "错误信息"}
```

### 搜索历史对话

**端点**: `GET /api/chat/search?q=关键词`

**响应**:
```json
{
  "query": "string",
  "results": [
    {
      "sessionId": "string",
      "sessionTitle": "string",
      "messages": [
        {
          "id": "string",
          "role": "user" | "assistant",
          "content": "string",
          "createdAt": "string"
        }
      ]
    }
  ],
  "total": number
}
```

## 文件上传 API

### 上传文件

**端点**: `POST /api/upload`

**请求**: multipart/form-data

**表单字段**:
- `file`: File

**响应**:
```json
{
  "success": true,
  "fileUrl": "string",
  "fileType": "image" | "document" | "video",
  "fileName": "string",
  "fileSize": number
}
```

**文件限制**:
- 图片和文档：最大 10MB
- 视频：最大 50MB
- 支持格式：
  - 图片：jpg, jpeg, png, gif, webp
  - 文档：pdf, txt, doc, docx, md
  - 视频：mp4, mov, avi

## 管理员 API

所有管理员API都需要管理员权限。

### 邀请码管理

#### 获取邀请码列表

**端点**: `GET /api/admin/invites`

**响应**:
```json
{
  "invites": [
    {
      "id": "string",
      "code": "string",
      "created_by": "string",
      "used_by": "string",
      "status": "unused" | "used" | "invalid",
      "created_at": "string",
      "used_at": "string"
    }
  ]
}
```

#### 生成邀请码

**端点**: `POST /api/admin/invites`

**响应**:
```json
{
  "invite": {
    "id": "string",
    "code": "string",
    "created_by": "string",
    "status": "unused",
    "created_at": "string"
  }
}
```

#### 删除邀请码

**端点**: `DELETE /api/admin/invites/[id]`

**响应**:
```json
{
  "success": true
}
```

### 模型配置管理

#### 获取模型配置列表

**端点**: `GET /api/admin/models`

**响应**:
```json
{
  "models": [
    {
      "id": "string",
      "name": "string",
      "provider": "openai" | "claude" | "deepseek" | "gemini" | "zhipu" | "qwen",
      "api_key_encrypted": "string",
      "base_url": "string",
      "model_name": "string",
      "is_multimodal": boolean,
      "enabled": boolean,
      "default_params": {
        "temperature": number,
        "maxTokens": number,
        "topP": number
      },
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}
```

#### 创建模型配置

**端点**: `POST /api/admin/models`

**请求体**:
```json
{
  "name": "string",
  "provider": "openai" | "claude" | "deepseek" | "gemini" | "zhipu" | "qwen",
  "apiKey": "string",
  "baseUrl": "string", // 可选
  "modelName": "string",
  "isMultimodal": boolean,
  "enabled": boolean,
  "defaultParams": {
    "temperature": number,
    "maxTokens": number,
    "topP": number
  }
}
```

**响应**:
```json
{
  "model": { ... }
}
```

#### 更新模型配置

**端点**: `PUT /api/admin/models/[id]`

**请求体**: 同创建模型配置

**响应**:
```json
{
  "model": { ... }
}
```

#### 删除模型配置

**端点**: `DELETE /api/admin/models/[id]`

**响应**:
```json
{
  "success": true
}
```

#### 测试模型连接

**端点**: `POST /api/admin/models/[id]/test`

**响应**:
```json
{
  "success": true,
  "message": "连接测试成功",
  "latency": number,
  "provider": "string",
  "modelName": "string"
}
```

## 错误响应

所有API在出错时都会返回以下格式的错误响应：

```json
{
  "error": "错误信息"
}
```

或者：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息"
  }
}
```

常见HTTP状态码：
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

## 使用示例

### JavaScript/TypeScript

```typescript
// 登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123',
  }),
});
const { token } = await loginResponse.json();

// 获取会话列表
const sessionsResponse = await fetch('/api/chat/sessions', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const { sessions } = await sessionsResponse.json();

// 流式对话
const eventSource = new EventSource('/api/chat/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'chunk') {
    console.log(data.content);
  } else if (data.type === 'done') {
    console.log('完成');
    eventSource.close();
  }
};
```

### cURL

```bash
# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取会话列表
curl http://localhost:3000/api/chat/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"

# 上传文件
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.jpg"
```
