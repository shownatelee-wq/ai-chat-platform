# 数据库设置指南

本目录包含AI对话平台的数据库Schema和迁移脚本。

## 快速开始

### 1. 创建Supabase项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目URL和API密钥

### 2. 执行Schema脚本

1. 在Supabase Dashboard中，进入 **SQL Editor**
2. 创建新查询
3. 复制 `schema.sql` 的全部内容
4. 点击 **Run** 执行

执行完成后，你将看到：
- ✅ 5个核心表已创建
- ✅ 所有索引已创建
- ✅ RLS策略已配置
- ✅ 默认管理员账号已创建

### 3. 配置Storage

1. 在Supabase Dashboard中，进入 **Storage**
2. 创建新bucket：`chat-files`
3. 设置为 **Public** bucket
4. 配置文件大小限制：50MB

### 4. 配置环境变量

在项目根目录的 `.env.local` 文件中配置：

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## 数据库表结构

### 1. users（用户表）

存储用户账号信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password_hash | VARCHAR(255) | 密码哈希 |
| role | VARCHAR(20) | 角色（admin/user） |
| theme | VARCHAR(20) | 主题（light/dark） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2. invite_codes（邀请码表）

管理用户注册邀请码。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| code | VARCHAR(32) | 邀请码（唯一） |
| created_by | UUID | 创建者ID |
| used_by | UUID | 使用者ID |
| status | VARCHAR(20) | 状态（unused/used/invalid） |
| created_at | TIMESTAMP | 创建时间 |
| used_at | TIMESTAMP | 使用时间 |

### 3. model_configs（模型配置表）

存储AI模型的配置信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 模型名称 |
| provider | VARCHAR(50) | 提供商 |
| api_key_encrypted | TEXT | 加密的API Key |
| base_url | VARCHAR(255) | API基础URL |
| model_name | VARCHAR(100) | 模型标识 |
| is_multimodal | BOOLEAN | 是否支持多模态 |
| enabled | BOOLEAN | 是否启用 |
| default_params | JSONB | 默认参数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 4. sessions（会话表）

存储用户的对话会话。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID |
| title | VARCHAR(255) | 会话标题 |
| model_id | UUID | 使用的模型ID |
| is_pinned | BOOLEAN | 是否置顶 |
| parameters | JSONB | 会话参数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| last_active_at | TIMESTAMP | 最后活跃时间 |

### 5. messages（消息表）

存储对话消息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| session_id | UUID | 会话ID |
| role | VARCHAR(20) | 角色（user/assistant） |
| content | TEXT | 消息内容 |
| model_id | UUID | 使用的模型ID |
| file_url | VARCHAR(500) | 附件URL |
| file_type | VARCHAR(20) | 附件类型 |
| created_at | TIMESTAMP | 创建时间 |

## RLS（Row Level Security）策略

所有表都启用了RLS，确保数据安全：

- **users**: 用户只能查看和更新自己的信息
- **invite_codes**: 仅管理员可以管理
- **model_configs**: 普通用户只能查看已启用的模型，管理员可以完全管理
- **sessions**: 用户只能访问自己的会话
- **messages**: 用户只能访问自己会话的消息

## 辅助函数

### generate_invite_code()

生成32位随机邀请码。

\`\`\`sql
SELECT generate_invite_code();
\`\`\`

### update_session_last_active()

自动更新会话的最后活跃时间（在插入消息时触发）。

## 默认账号

执行schema.sql后会创建一个默认管理员账号：

- **用户名**: admin
- **密码**: admin123

⚠️ **重要**: 首次登录后请立即修改密码！

## 数据迁移

如果需要更新数据库结构，请：

1. 在 `migrations/` 目录创建新的迁移文件
2. 按照时间戳命名：`YYYYMMDD_description.sql`
3. 在Supabase SQL Editor中执行

## 故障排查

### 问题：RLS策略导致无法访问数据

**解决方案**: 确保在API调用中正确设置了认证token。

### 问题：全文搜索不工作

**解决方案**: 检查是否正确创建了GIN索引：

\`\`\`sql
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('simple', content));
\`\`\`

### 问题：级联删除不工作

**解决方案**: 确保外键约束正确设置了 `ON DELETE CASCADE`。

## 备份建议

1. 定期备份数据库
2. 使用Supabase的自动备份功能
3. 导出重要数据到本地

## 性能优化

1. 定期运行 `VACUUM ANALYZE` 清理和分析表
2. 监控慢查询日志
3. 根据实际使用情况调整索引

## 安全建议

1. 定期轮换API密钥
2. 使用强密码策略
3. 启用Supabase的审计日志
4. 定期检查RLS策略
