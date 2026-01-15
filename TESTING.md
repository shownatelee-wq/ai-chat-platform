# 测试指南

## 前提条件

在测试之前，你需要完成以下配置：

### 1. 配置Supabase

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 在Supabase Dashboard中，进入 **SQL Editor**
3. 复制 `database/schema.sql` 的全部内容并执行
4. 记录以下信息：
   - Project URL: `https://your-project.supabase.co`
   - Anon Key: 在 Settings > API 中找到
   - Service Role Key: 在 Settings > API 中找到

### 2. 配置环境变量

编辑 `.env.local` 文件，填入实际值：

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
JWT_SECRET=your_jwt_secret_change_this
ENCRYPTION_KEY=your_32_character_encryption_key
\`\`\`

### 3. 生成邀请码

在Supabase SQL Editor中执行：

\`\`\`sql
INSERT INTO invite_codes (code, status) 
VALUES (generate_invite_code(), 'unused');

-- 查看生成的邀请码
SELECT code FROM invite_codes WHERE status = 'unused';
\`\`\`

记录生成的邀请码，用于注册测试。

### 4. 重启开发服务器

配置环境变量后，重启开发服务器：

\`\`\`bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
\`\`\`

---

## 测试步骤

### 测试1：用户注册

1. 打开浏览器访问 http://localhost:3000/register
2. 填写注册表单：
   - 用户名：testuser
   - 密码：test123456
   - 确认密码：test123456
   - 邀请码：（使用上面生成的邀请码）
3. 点击"注册"按钮

**预期结果**：
- ✅ 注册成功，跳转到登录页面
- ✅ 在Supabase中可以看到新用户记录
- ✅ 邀请码状态变为"used"

**可能的错误**：
- ❌ "邀请码无效或已被使用" - 检查邀请码是否正确
- ❌ "用户名已存在" - 使用不同的用户名
- ❌ "服务器内部错误" - 检查环境变量配置

### 测试2：用户登录

1. 访问 http://localhost:3000/login
2. 填写登录表单：
   - 用户名：testuser
   - 密码：test123456
3. 点击"登录"按钮

**预期结果**：
- ✅ 登录成功，跳转到 /chat 页面
- ✅ 浏览器LocalStorage中保存了token和用户信息
- ✅ 可以在浏览器开发者工具中看到 auth-storage

**可能的错误**：
- ❌ "用户名或密码错误" - 检查用户名和密码
- ❌ 跳转到 /chat 后显示404 - 正常，因为chat页面还未实现

### 测试3：管理员登录

1. 访问 http://localhost:3000/login
2. 使用默认管理员账号：
   - 用户名：admin
   - 密码：admin123
3. 点击"登录"按钮

**预期结果**：
- ✅ 登录成功
- ✅ 用户角色为 "admin"

**重要**：首次登录后应立即修改管理员密码！

### 测试4：API端点测试

使用curl或Postman测试API：

#### 注册API

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "password": "test123456",
    "inviteCode": "YOUR_INVITE_CODE"
  }'
\`\`\`

**预期响应**：
\`\`\`json
{
  "success": true,
  "message": "注册成功"
}
\`\`\`

#### 登录API

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456"
  }'
\`\`\`

**预期响应**：
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "testuser",
    "role": "user"
  }
}
\`\`\`

#### 获取当前用户API

\`\`\`bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

**预期响应**：
\`\`\`json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "testuser",
    "role": "user",
    "theme": "light",
    "createdAt": "2025-01-15T..."
  }
}
\`\`\`

---

## 验证数据库

在Supabase SQL Editor中执行以下查询验证数据：

### 查看用户

\`\`\`sql
SELECT id, username, role, created_at FROM users;
\`\`\`

### 查看邀请码使用情况

\`\`\`sql
SELECT code, status, used_by, used_at FROM invite_codes;
\`\`\`

### 验证密码哈希

\`\`\`sql
SELECT username, password_hash FROM users WHERE username = 'testuser';
\`\`\`

密码哈希应该以 `$2a$10$` 开头（bcrypt格式）。

---

## 常见问题

### Q: 注册时提示"邀请码无效"
**A**: 
1. 检查邀请码是否正确复制
2. 确认邀请码状态为"unused"
3. 重新生成一个新的邀请码

### Q: 登录后跳转到404页面
**A**: 这是正常的，因为 /chat 页面还未实现。可以在浏览器开发者工具中检查LocalStorage，确认token已保存。

### Q: API返回"服务器内部错误"
**A**: 
1. 检查 `.env.local` 配置是否正确
2. 查看终端中的错误日志
3. 确认Supabase数据库已正确创建

### Q: 无法连接到Supabase
**A**: 
1. 检查Supabase项目是否正常运行
2. 验证API密钥是否正确
3. 检查网络连接

---

## 测试清单

完成以下测试后，认证系统即可投入使用：

- [ ] 成功注册新用户
- [ ] 邀请码正确标记为已使用
- [ ] 成功登录普通用户
- [ ] 成功登录管理员账号
- [ ] Token正确保存到LocalStorage
- [ ] 获取当前用户信息API正常工作
- [ ] 密码错误时显示正确的错误信息
- [ ] 邀请码无效时显示正确的错误信息
- [ ] 用户名重复时显示正确的错误信息

---

## 下一步

测试通过后，可以继续开发：
- 任务4：管理员功能（邀请码管理、模型配置）
- 任务7：对话功能
- 任务10：前端UI组件
