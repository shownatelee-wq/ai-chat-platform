# 部署指南

本文档提供了将 AI 对话平台部署到 Vercel + Supabase 的完整步骤。

## 前置要求

- Node.js 18+ 
- npm 或 yarn
- Vercel 账号（免费版即可）
- Supabase 账号（免费版即可）
- Git

## 第一步：Supabase 配置

### 1.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Name: 选择一个项目名称
   - Database Password: 设置一个强密码（请保存好）
   - Region: 选择 Hong Kong（或离用户最近的区域）
4. 等待项目创建完成（约 2 分钟）

### 1.2 执行数据库迁移

1. 在 Supabase 项目中，进入 "SQL Editor"
2. 点击 "New Query"
3. 复制 `database/schema.sql` 的全部内容
4. 粘贴到查询编辑器中
5. 点击 "Run" 执行 SQL
6. 确认所有表和策略创建成功

### 1.3 配置 Storage

1. 进入 "Storage" 页面
2. 点击 "Create a new bucket"
3. 创建名为 `chat-files` 的 bucket
4. 设置为 Public bucket
5. 配置 Storage 策略：
   - 允许认证用户上传文件
   - 允许所有人读取文件

### 1.4 获取 API 密钥

1. 进入 "Settings" > "API"
2. 复制以下信息：
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY) - 注意保密！

## 第二步：生成密钥

### 2.1 生成 JWT Secret

在终端运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

保存输出的字符串作为 `JWT_SECRET`

### 2.2 生成 Encryption Key

在终端运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

保存输出的字符串作为 `ENCRYPTION_KEY`

## 第三步：Vercel 部署

### 3.1 准备代码仓库

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 确保 `.env.local` 不在版本控制中（已在 .gitignore）

### 3.2 导入项目到 Vercel

1. 访问 [Vercel](https://vercel.com) 并登录
2. 点击 "Add New..." > "Project"
3. 选择你的 Git 仓库
4. 点击 "Import"

### 3.3 配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=你的Supabase service role key
JWT_SECRET=第二步生成的JWT密钥
ENCRYPTION_KEY=第二步生成的加密密钥
```

### 3.4 部署

1. 点击 "Deploy"
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，Vercel 会提供一个 URL

## 第四步：初始化管理员账号

### 4.1 修改默认密码

默认管理员账号：
- 用户名: `admin`
- 密码: `admin123`

**重要：首次登录后立即修改密码！**

### 4.2 生成密码哈希（可选）

如果要在部署前修改管理员密码：

```bash
cd ai-chat-platform
node scripts/generate-password-hash.js
```

输入新密码，将生成的哈希值更新到 `database/schema.sql` 中的管理员账号。

## 第五步：配置 AI 模型

### 5.1 登录管理员账号

1. 访问你的部署 URL
2. 使用管理员账号登录
3. 进入 "管理员" > "模型配置"

### 5.2 添加模型配置

为每个要使用的 AI 模型添加配置：

**OpenAI 示例：**
- 提供商: OpenAI
- 模型名称: gpt-4
- 显示名称: GPT-4
- API Key: 你的 OpenAI API Key
- API 端点: 留空（使用默认）
- 多模态: 勾选（如果是 GPT-4 Vision）

**Claude 示例：**
- 提供商: Claude
- 模型名称: claude-3-opus-20240229
- 显示名称: Claude 3 Opus
- API Key: 你的 Anthropic API Key
- API 端点: 留空
- 多模态: 勾选

**DeepSeek 示例：**
- 提供商: DeepSeek
- 模型名称: deepseek-chat
- 显示名称: DeepSeek Chat
- API Key: 你的 DeepSeek API Key
- API 端点: 留空
- 多模态: 不勾选

**Gemini 示例：**
- 提供商: Gemini
- 模型名称: gemini-pro-vision
- 显示名称: Gemini Pro Vision
- API Key: 你的 Google API Key
- API 端点: 留空
- 多模态: 勾选

**智谱 AI 示例：**
- 提供商: 智谱AI
- 模型名称: glm-4v
- 显示名称: GLM-4V
- API Key: 你的智谱 API Key
- API 端点: 留空
- 多模态: 勾选

**通义千问示例：**
- 提供商: 通义千问
- 模型名称: qwen-vl-plus
- 显示名称: 通义千问 VL Plus
- API Key: 你的阿里云 API Key
- API 端点: 留空
- 多模态: 勾选

### 5.3 测试模型连接

添加每个模型后，点击 "测试" 按钮验证配置是否正确。

## 第六步：生成邀请码

### 6.1 生成邀请码

1. 进入 "管理员" > "邀请码管理"
2. 点击 "生成邀请码"
3. 设置过期时间和最大使用次数
4. 复制生成的邀请码

### 6.2 分发邀请码

将邀请码分发给需要注册的用户。

## 第七步：验证部署

### 7.1 测试用户注册

1. 使用邀请码注册一个测试账号
2. 验证注册流程是否正常

### 7.2 测试对话功能

1. 登录测试账号
2. 创建新会话
3. 选择一个模型
4. 发送测试消息
5. 验证流式响应是否正常

### 7.3 测试文件上传

1. 选择支持多模态的模型
2. 上传一张图片
3. 发送消息
4. 验证模型是否能识别图片内容

## 常见问题

### Q1: 部署后无法连接数据库

**解决方案：**
- 检查 Supabase 环境变量是否正确配置
- 确认 Supabase 项目状态正常
- 检查 RLS 策略是否正确设置

### Q2: 模型测试失败

**解决方案：**
- 验证 API Key 是否正确
- 检查 API Key 是否有足够的配额
- 确认模型名称是否正确
- 检查网络连接

### Q3: 文件上传失败

**解决方案：**
- 确认 Storage bucket 已创建
- 检查 Storage 策略是否正确
- 验证文件大小是否超过限制（图片/文档 10MB，视频 50MB）

### Q4: JWT 认证失败

**解决方案：**
- 确认 JWT_SECRET 环境变量已设置
- 清除浏览器缓存和 localStorage
- 重新登录

### Q5: 流式响应不工作

**解决方案：**
- 检查浏览器是否支持 SSE
- 查看浏览器控制台错误信息
- 验证模型配置是否正确

## 性能优化建议

### 数据库优化

1. 定期清理过期的邀请码
2. 为常用查询添加索引（已在 schema 中配置）
3. 定期备份数据库

### 前端优化

1. 启用 Vercel 的 Edge Caching
2. 使用 CDN 加速静态资源
3. 实现消息虚拟滚动（长对话）

### 成本控制

1. 监控 AI API 使用量
2. 设置 API 调用限制
3. 使用 Vercel 和 Supabase 的免费额度

## 免费额度说明

### Vercel 免费版

- 100 GB 带宽/月
- 100 小时构建时间/月
- 无限部署
- 自动 HTTPS

### Supabase 免费版

- 500 MB 数据库存储
- 1 GB 文件存储
- 50,000 月活跃用户
- 2 GB 带宽/月

### 建议

对于小型团队（<50 用户），免费版完全够用。如果需要更多资源，可以升级到付费版。

## 监控和维护

### 日志查看

1. Vercel 日志：在 Vercel 项目页面查看
2. Supabase 日志：在 Supabase 项目的 Logs 页面查看

### 定期维护

1. 每周检查错误日志
2. 每月检查 API 使用量
3. 定期更新依赖包
4. 备份重要数据

## 安全建议

1. 定期更新 JWT_SECRET 和 ENCRYPTION_KEY
2. 启用 Supabase 的 2FA
3. 限制管理员账号数量
4. 定期审查用户活动
5. 监控异常 API 调用

## 技术支持

如遇到问题，请检查：
1. Vercel 部署日志
2. Supabase 数据库日志
3. 浏览器控制台错误
4. 网络请求详情

## 更新部署

当代码更新后：

1. 推送代码到 Git 仓库
2. Vercel 会自动触发重新部署
3. 等待部署完成
4. 验证新功能是否正常

## 回滚

如果新版本有问题：

1. 在 Vercel 项目页面找到 "Deployments"
2. 找到上一个稳定版本
3. 点击 "..." > "Promote to Production"
4. 确认回滚

---

部署完成！现在你可以开始使用 AI 对话平台了。
