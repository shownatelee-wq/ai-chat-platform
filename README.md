# AI对话平台

一个功能完整的多模型 AI 对话平台，支持主流大模型 API，提供流畅的对话体验。

## ✨ 功能特性

### 核心功能
- 🤖 **多模型支持**: 集成 6 个主流大模型（OpenAI、Claude、DeepSeek、Gemini、智谱AI、通义千问）
- 💬 **流式对话**: SSE 实时流式输出，即时显示 AI 回复
- 📁 **多模态支持**: 支持图片、文档、视频上传（支持多模态的模型）
- 🎨 **主题切换**: 亮色/暗色主题，自动保存偏好
- 🔍 **智能搜索**: 全文搜索历史对话，快速定位内容
- ⚙️ **参数配置**: 灵活调整 Temperature、Max Tokens、Top P、系统提示词
- 📌 **会话管理**: 会话置顶、重命名、删除，智能排序
- 🔐 **安全可靠**: 密码加密、API Key 加密存储、JWT 认证

### 用户角色
- 👤 **普通用户**: 创建对话、切换模型、上传文件、搜索历史
- 👨‍💼 **管理员**: 管理模型配置、生成邀请码、测试模型连接

### 技术亮点
- ⚡ **高性能**: Next.js 14 App Router，优化的数据库查询
- 🎯 **类型安全**: 完整的 TypeScript 类型定义
- 🔒 **安全性**: RLS 策略、加密存储、权限控制
- 📱 **响应式**: 适配不同屏幕尺寸
- 🚀 **易部署**: 一键部署到 Vercel + Supabase

## 技术栈

- **前端**: React 18 + Next.js 14 + TypeScript + Tailwind CSS
- **状态管理**: Zustand
- **数据库**: Supabase PostgreSQL
- **文件存储**: Supabase Storage
- **部署**: Vercel + Supabase Cloud

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号（免费版即可）

### 本地开发

1. **克隆项目**

\`\`\`bash
git clone <repository-url>
cd ai-chat-platform
\`\`\`

2. **安装依赖**

\`\`\`bash
npm install
\`\`\`

3. **配置环境变量**

复制 \`.env.local.example\` 为 \`.env.local\`：

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

编辑 \`.env.local\` 并填入实际值：

\`\`\`env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=你的Supabase service role key

# JWT密钥（使用 node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 生成）
JWT_SECRET=你的JWT密钥

# 加密密钥（使用 node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 生成）
ENCRYPTION_KEY=你的加密密钥
\`\`\`

4. **创建数据库**

在 Supabase SQL 编辑器中执行 \`database/schema.sql\` 的全部内容。

详细步骤请参考 \`database/README.md\`。

5. **运行开发服务器**

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000)

6. **登录管理员账号**

默认管理员账号：
- 用户名: \`admin\`
- 密码: \`admin123\`

⚠️ **重要**: 首次登录后请立即修改密码！

### 生产部署

详细的部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

快速步骤：
1. 创建 Supabase 项目并执行数据库迁移
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署
5. 配置 AI 模型和生成邀请码

## 📁 项目结构

\`\`\`
ai-chat-platform/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # 认证页面（登录、注册）
│   ├── admin/               # 管理员页面
│   │   ├── invites/        # 邀请码管理
│   │   └── models/         # 模型配置管理
│   ├── api/                 # API Routes
│   │   ├── auth/           # 认证 API
│   │   ├── chat/           # 对话 API
│   │   ├── admin/          # 管理员 API
│   │   ├── models/         # 模型列表 API
│   │   └── upload/         # 文件上传 API
│   ├── chat/                # 主对话页面
│   └── test/                # 测试页面
├── components/              # React 组件
│   ├── chat/               # 对话相关组件
│   │   ├── ChatSidebar.tsx      # 会话侧边栏
│   │   ├── ChatHeader.tsx       # 对话头部
│   │   ├── MessageList.tsx      # 消息列表
│   │   ├── ChatInput.tsx        # 输入框
│   │   ├── ModelSelector.tsx    # 模型选择器
│   │   └── SessionSettings.tsx  # 会话设置
│   ├── Navbar.tsx          # 导航栏
│   └── ThemeToggle.tsx     # 主题切换
├── lib/                     # 工具库
│   ├── ai/                 # AI 模型适配器
│   │   ├── adapters/       # 各模型适配器实现
│   │   └── model-adapter.ts # 适配器基类和工厂
│   ├── auth/               # 认证相关
│   │   ├── jwt.ts          # JWT 工具
│   │   ├── password.ts     # 密码加密
│   │   └── middleware.ts   # 认证中间件
│   ├── supabase/           # Supabase 客户端
│   │   ├── client.ts       # 客户端
│   │   └── server.ts       # 服务端
│   └── utils/              # 工具函数
│       ├── encryption.ts   # 加密工具
│       └── validation.ts   # 验证工具
├── stores/                  # Zustand 状态管理
│   └── auth-store.ts       # 认证状态
├── types/                   # TypeScript 类型定义
│   ├── database.ts         # 数据库类型
│   └── api.ts              # API 类型
├── database/                # 数据库相关
│   ├── schema.sql          # 数据库 Schema
│   └── README.md           # 数据库文档
├── scripts/                 # 脚本工具
│   └── generate-password-hash.js
└── public/                  # 静态资源
\`\`\`

## 📚 文档

- [快速开始](./QUICKSTART.md) - 5 分钟快速部署指南 ⚡
- [用户手册](./USER_GUIDE.md) - 完整的使用说明
- [API 文档](./API.md) - 完整的 API 接口文档
- [部署指南](./DEPLOYMENT.md) - 详细的部署步骤
- [测试指南](./TESTING.md) - 测试说明
- [数据库文档](./database/README.md) - 数据库设置
- [开发进度](./PROGRESS.md) - 当前开发状态
- [更新日志](./CHANGELOG.md) - 版本更新记录

## 🛠️ 开发指南

### 添加新的 AI 模型

1. 在 \`lib/ai/adapters/\` 创建新适配器文件
2. 实现 \`ModelAdapter\` 接口：
   \`\`\`typescript
   export class NewModelAdapter extends BaseModelAdapter {
     async streamChat(messages, onChunk, onComplete, onError) {
       // 实现流式对话逻辑
     }
     
     async testConnection() {
       // 实现连接测试
     }
   }
   \`\`\`
3. 在 \`lib/ai/adapters/index.ts\` 注册适配器
4. 在管理员界面添加模型配置

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式写法
- 使用 Tailwind CSS 进行样式开发

### 调试技巧

1. **查看 API 日志**: 检查浏览器 Network 面板
2. **数据库查询**: 使用 Supabase SQL 编辑器
3. **测试页面**: 访问 \`/test\` 进行环境检查

## 🔧 常见问题

### 无法连接数据库

- 检查 Supabase 环境变量是否正确
- 确认 Supabase 项目状态正常
- 验证 RLS 策略是否正确设置

### 模型测试失败

- 验证 API Key 是否正确
- 检查 API Key 配额
- 确认模型名称正确

### 文件上传失败

- 确认 Storage bucket 已创建（名称: \`chat-files\`）
- 检查 Storage 策略
- 验证文件大小（图片/文档 10MB，视频 50MB）

更多问题请查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 的常见问题部分。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

如有问题或建议，欢迎提 Issue！
