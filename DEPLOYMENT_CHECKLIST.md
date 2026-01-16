# 🚀 AI 对话平台 - 部署清单

本文档提供详细的部署步骤清单，请按顺序完成每一步。

---

## 📋 部署前准备

### 需要的账号
- [ ] GitHub 账号
- [ ] Vercel 账号（可用 GitHub 登录）
- [ ] Supabase 账号（可用 GitHub 登录）
- [ ] 至少一个 AI API Key（OpenAI、Claude 等）

### 需要的工具
- [ ] Node.js 18+ 已安装
- [ ] Git 已安装
- [ ] 文本编辑器

---

## 第一步：配置 Supabase

### 1.1 创建项目
- [ ] 访问 https://supabase.com
- [ ] 点击 "New Project"
- [ ] 填写信息：
  - Project Name: `ai-chat-platform`
  - Database Password: **设置强密码并记录到 deployment-config.txt**
  - Region: 选择 `Hong Kong`
- [ ] 点击 "Create new project"
- [ ] 等待 2 分钟完成创建

### 1.2 执行数据库迁移
- [ ] 点击左侧 "SQL Editor"
- [ ] 点击 "New Query"
- [ ] 打开本地 `ai-chat-platform/database/schema.sql`
- [ ] 复制全部内容（Ctrl+A, Ctrl+C）
- [ ] 粘贴到 SQL 编辑器
- [ ] 点击 "Run" 执行
- [ ] 确认看到 "Success. No rows returned"

### 1.3 创建 Storage Bucket
- [ ] 点击左侧 "Storage"
- [ ] 点击 "Create a new bucket"
- [ ] 输入名称: `chat-files`
- [ ] 勾选 "Public bucket"
- [ ] 点击 "Create bucket"
- [ ] 确认 bucket 创建成功

### 1.4 获取 API 密钥
- [ ] 点击左侧 "Settings" > "API"
- [ ] 复制以下信息到 `deployment-config.txt`：
  - Project URL
  - anon public key
  - service_role key（保密！）

---

## 第二步：生成加密密钥

在终端运行以下命令：

### 2.1 生成 JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] 复制输出，记录到 `deployment-config.txt` 的 JWT_SECRET

### 2.2 生成 ENCRYPTION_KEY
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] 复制输出，记录到 `deployment-config.txt` 的 ENCRYPTION_KEY

---

## 第三步：推送代码到 GitHub

### 3.1 初始化 Git（如果还没有）
```bash
cd ai-chat-platform
git init
git add .
git commit -m "Initial commit: AI Chat Platform"
```

### 3.2 创建 GitHub 仓库
- [ ] 访问 https://github.com/new
- [ ] Repository name: `ai-chat-platform`
- [ ] 选择 Private 或 Public
- [ ] 不要勾选任何初始化选项
- [ ] 点击 "Create repository"

### 3.3 推送代码
```bash
git remote add origin https://github.com/shownatelee-wq/ai-chat-platform.git
git branch -M main
git push -u origin main
```
- [ ] 确认代码已推送成功
- [ ] 刷新 GitHub 页面确认文件已上传

---

## 第四步：部署到 Vercel

### 4.1 导入项目
- [ ] 访问 https://vercel.com
- [ ] 点击 "Add New..." > "Project"
- [ ] 找到并选择 `ai-chat-platform` 仓库
- [ ] 点击 "Import"

### 4.2 配置环境变量
在 "Environment Variables" 部分，添加以下 5 个变量：

**从 deployment-config.txt 复制对应的值**

1. **NEXT_PUBLIC_SUPABASE_URL**
   - [ ] 粘贴 Supabase Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - [ ] 粘贴 Supabase anon public key

3. **SUPABASE_SERVICE_ROLE_KEY**
   - [ ] 粘贴 Supabase service_role key

4. **JWT_SECRET**
   - [ ] 粘贴生成的 JWT_SECRET

5. **ENCRYPTION_KEY**
   - [ ] 粘贴生成的 ENCRYPTION_KEY

### 4.3 开始部署
- [ ] 点击 "Deploy"
- [ ] 等待 2-3 分钟
- [ ] 看到 "Congratulations!" 页面
- [ ] 复制部署 URL，记录到 `deployment-config.txt`

---

## 第五步：首次登录

### 5.1 访问网站
- [ ] 打开部署的 URL
- [ ] 确认页面正常加载

### 5.2 登录管理员账号
- [ ] 点击 "登录"
- [ ] 输入：
  - 用户名: `admin`
  - 密码: `admin123`
- [ ] 点击 "登录"
- [ ] 确认成功进入系统

### 5.3 修改管理员密码（重要！）

**方法 1：通过 Supabase（推荐）**

在本地终端：
```bash
cd ai-chat-platform
node scripts/generate-password-hash.js
# 输入新密码，复制生成的哈希值
```

在 Supabase SQL Editor：
```sql
UPDATE users 
SET password_hash = '粘贴刚才生成的哈希值'
WHERE username = 'admin';
```

- [ ] 执行 SQL
- [ ] 退出登录
- [ ] 用新密码重新登录测试
- [ ] 记录新密码到 `deployment-config.txt`

---

## 第六步：配置 AI 模型

### 6.1 添加第一个模型

**以 OpenAI 为例：**

- [ ] 登录管理员账号
- [ ] 点击右上角 "管理员" > "模型配置"
- [ ] 点击 "添加模型"
- [ ] 填写：
  - 提供商: `OpenAI`
  - 模型名称: `gpt-3.5-turbo`
  - 显示名称: `GPT-3.5 Turbo`
  - API Key: 输入你的 OpenAI API Key
  - API 端点: 留空
  - 多模态: 不勾选
- [ ] 点击 "添加"
- [ ] 点击 "测试" 验证
- [ ] 确认测试成功

### 6.2 添加更多模型（可选）

根据你拥有的 API Key 添加：

**Claude:**
- [ ] 提供商: `Claude`
- [ ] 模型名称: `claude-3-opus-20240229`
- [ ] 显示名称: `Claude 3 Opus`
- [ ] API Key: Anthropic API Key
- [ ] 多模态: 勾选

**DeepSeek:**
- [ ] 提供商: `DeepSeek`
- [ ] 模型名称: `deepseek-chat`
- [ ] 显示名称: `DeepSeek Chat`
- [ ] API Key: DeepSeek API Key
- [ ] 多模态: 不勾选

**Gemini:**
- [ ] 提供商: `Gemini`
- [ ] 模型名称: `gemini-pro`
- [ ] 显示名称: `Gemini Pro`
- [ ] API Key: Google API Key
- [ ] 多模态: 勾选

**智谱 AI:**
- [ ] 提供商: `智谱AI`
- [ ] 模型名称: `glm-4`
- [ ] 显示名称: `GLM-4`
- [ ] API Key: 智谱 API Key
- [ ] 多模态: 勾选

**通义千问:**
- [ ] 提供商: `通义千问`
- [ ] 模型名称: `qwen-turbo`
- [ ] 显示名称: `通义千问 Turbo`
- [ ] API Key: 阿里云 API Key
- [ ] 多模态: 勾选

---

## 第七步：生成邀请码

- [ ] 点击 "管理员" > "邀请码管理"
- [ ] 点击 "生成邀请码"
- [ ] 点击 "生成"
- [ ] 复制邀请码
- [ ] 记录到 `deployment-config.txt`

---

## 第八步：测试用户功能

### 8.1 注册新用户
- [ ] 退出管理员账号
- [ ] 点击 "注册"
- [ ] 填写：
  - 用户名: `testuser`
  - 密码: 设置测试密码
  - 邀请码: 粘贴刚才的邀请码
- [ ] 点击 "注册"
- [ ] 确认注册成功

### 8.2 测试对话
- [ ] 点击 "新建对话"
- [ ] 选择一个模型
- [ ] 输入: "你好，请介绍一下你自己"
- [ ] 按 Enter 发送
- [ ] 确认看到流式响应
- [ ] 确认对话完成

### 8.3 测试其他功能
- [ ] 重命名会话
- [ ] 置顶会话
- [ ] 调整会话参数
- [ ] 切换主题
- [ ] 搜索历史（如果有多条消息）
- [ ] 删除会话

---

## 第九步：最终验证

### 9.1 功能检查
- [ ] ✅ 用户注册正常
- [ ] ✅ 用户登录正常
- [ ] ✅ 管理员功能正常
- [ ] ✅ 模型配置正常
- [ ] ✅ 邀请码生成正常
- [ ] ✅ 对话功能正常
- [ ] ✅ 流式响应正常
- [ ] ✅ 会话管理正常
- [ ] ✅ 主题切换正常
- [ ] ✅ 文件上传正常（如果模型支持）

### 9.2 性能检查
- [ ] 页面加载速度正常（< 3 秒）
- [ ] 对话响应及时
- [ ] 无明显卡顿
- [ ] 移动端显示正常

### 9.3 错误检查
- [ ] 按 F12 打开开发者工具
- [ ] 查看 Console 标签
- [ ] 确认无红色错误
- [ ] 查看 Network 标签
- [ ] 确认 API 请求正常（状态码 200）

---

## 🎉 部署完成！

恭喜！你已经成功部署了 AI 对话平台。

### 下一步
- [ ] 分享邀请码给团队成员
- [ ] 根据使用情况调整模型配置
- [ ] 定期备份 Supabase 数据
- [ ] 监控 API 使用量

### 维护建议
- 每周检查错误日志
- 每月检查 API 使用量
- 定期更新依赖包
- 备份重要数据

---

## ❓ 遇到问题？

### 常见问题

**Q: 部署失败，显示构建错误**
- 检查环境变量是否正确配置
- 确认所有 5 个环境变量都已添加
- 查看 Vercel 构建日志

**Q: 登录后显示数据库错误**
- 检查 Supabase 项目是否正常运行
- 确认 SQL 迁移是否成功执行
- 检查 service_role key 是否正确

**Q: 模型测试失败**
- 验证 API Key 是否正确
- 检查 API Key 是否有配额
- 确认模型名称是否正确

**Q: 文件上传失败**
- 确认 Storage bucket 名称为 `chat-files`
- 检查 bucket 是否设置为 Public
- 验证文件大小是否超限

### 获取帮助
- 查看 `DEPLOYMENT.md` 详细文档
- 查看 `USER_GUIDE.md` 使用手册
- 查看浏览器控制台错误信息
- 查看 Vercel 部署日志

---

**部署日期**: ___________
**部署人**: ___________
**版本**: 1.0.0
