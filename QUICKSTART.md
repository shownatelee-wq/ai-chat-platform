# 快速开始指南

5 分钟快速部署和使用 AI 对话平台。

## 🚀 快速部署（推荐）

### 1. 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

点击按钮后：
1. 登录 Vercel
2. 导入项目
3. 配置环境变量（见下方）
4. 点击 Deploy

### 2. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目（选择 Hong Kong 区域）
3. 等待项目创建完成

### 3. 配置数据库

1. 在 Supabase 项目中，进入 SQL Editor
2. 复制 `database/schema.sql` 的全部内容
3. 粘贴并执行

### 4. 创建 Storage Bucket

1. 进入 Storage 页面
2. 创建名为 `chat-files` 的 bucket
3. 设置为 Public

### 5. 配置环境变量

在 Vercel 项目设置中添加：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=你的Supabase service role key
JWT_SECRET=随机生成的32字符密钥
ENCRYPTION_KEY=随机生成的32字符密钥
```

生成密钥：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. 重新部署

在 Vercel 中触发重新部署，使环境变量生效。

---

## 💻 本地开发

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-chat-platform
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 填入实际值。

### 4. 创建数据库

在 Supabase SQL Editor 中执行 `database/schema.sql`。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 🎯 首次使用

### 1. 登录管理员账号

默认管理员：
- 用户名: `admin`
- 密码: `admin123`

⚠️ **重要**：首次登录后立即修改密码！

### 2. 添加 AI 模型

1. 进入"管理员" > "模型配置"
2. 点击"添加模型"
3. 填写模型信息和 API Key
4. 点击"测试"验证配置
5. 保存

**快速配置示例（OpenAI）**：
- 提供商: OpenAI
- 模型名称: gpt-3.5-turbo
- 显示名称: GPT-3.5 Turbo
- API Key: sk-xxx...
- API 端点: 留空
- 多模态: 不勾选

### 3. 生成邀请码

1. 进入"管理员" > "邀请码管理"
2. 点击"生成邀请码"
3. 复制邀请码

### 4. 注册普通用户

1. 退出管理员账号
2. 点击"注册"
3. 使用邀请码注册新账号

### 5. 开始对话

1. 登录新账号
2. 点击"新建对话"
3. 选择模型
4. 开始聊天！

---

## 📝 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 生成密码哈希
node scripts/generate-password-hash.js
```

---

## 🔧 快速配置检查清单

- [ ] Supabase 项目已创建
- [ ] 数据库 Schema 已执行
- [ ] Storage bucket 已创建
- [ ] 环境变量已配置
- [ ] 管理员账号可以登录
- [ ] 至少添加了一个 AI 模型
- [ ] 模型测试通过
- [ ] 生成了邀请码
- [ ] 普通用户可以注册和登录
- [ ] 可以创建会话并对话

---

## 🆘 遇到问题？

### 无法连接数据库
- 检查 Supabase URL 和 Key 是否正确
- 确认 Supabase 项目状态正常

### 模型测试失败
- 验证 API Key 是否正确
- 检查 API Key 配额
- 确认网络连接

### 文件上传失败
- 确认 Storage bucket 名称为 `chat-files`
- 检查 bucket 是否为 Public
- 验证文件大小

### 更多帮助
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 详细部署指南
- 查看 [USER_GUIDE.md](./USER_GUIDE.md) 用户手册
- 查看 [API.md](./API.md) API 文档

---

## 🎉 完成！

现在你可以：
- ✅ 与多个 AI 模型对话
- ✅ 上传图片和文件
- ✅ 管理对话会话
- ✅ 搜索历史对话
- ✅ 切换主题
- ✅ 调整参数

享受你的 AI 对话平台吧！

---

## 📚 下一步

- 阅读 [USER_GUIDE.md](./USER_GUIDE.md) 了解所有功能
- 阅读 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解生产部署
- 查看 [API.md](./API.md) 了解 API 接口
- 根据需要添加更多 AI 模型

---

**需要帮助？** 查看项目文档或提交 Issue。
