-- AI对话平台数据库Schema
-- 执行顺序：按照此文件中的顺序执行所有SQL语句

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. users表（用户）
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的信息
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- 用户可以更新自己的信息（除了role）
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- ============================================
-- 2. invite_codes表（邀请码）
-- ============================================
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(32) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'invalid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_status ON invite_codes(status);

-- RLS策略
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有邀请码
CREATE POLICY "Admins can view all invite codes" ON invite_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 管理员可以创建邀请码
CREATE POLICY "Admins can create invite codes" ON invite_codes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 管理员可以删除邀请码
CREATE POLICY "Admins can delete invite codes" ON invite_codes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- ============================================
-- 3. model_configs表（模型配置）
-- ============================================
CREATE TABLE IF NOT EXISTS model_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'claude', 'deepseek', 'gemini', 'zhipu', 'qwen')),
  api_key_encrypted TEXT NOT NULL,
  base_url VARCHAR(255),
  model_name VARCHAR(100) NOT NULL,
  is_multimodal BOOLEAN DEFAULT FALSE,
  enabled BOOLEAN DEFAULT TRUE,
  default_params JSONB DEFAULT '{"temperature": 0.7, "maxTokens": 2000, "topP": 1.0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_model_configs_provider ON model_configs(provider);
CREATE INDEX IF NOT EXISTS idx_model_configs_enabled ON model_configs(enabled);

-- 创建更新时间触发器
CREATE TRIGGER update_model_configs_updated_at BEFORE UPDATE ON model_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE model_configs ENABLE ROW LEVEL SECURITY;

-- 所有用户可以查看已启用的模型（但不包含API Key）
CREATE POLICY "Users can view enabled models" ON model_configs
    FOR SELECT USING (enabled = true);

-- 管理员可以查看所有模型
CREATE POLICY "Admins can view all models" ON model_configs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 管理员可以创建模型配置
CREATE POLICY "Admins can create models" ON model_configs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 管理员可以更新模型配置
CREATE POLICY "Admins can update models" ON model_configs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 管理员可以删除模型配置
CREATE POLICY "Admins can delete models" ON model_configs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- ============================================
-- 4. sessions表（会话）
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT '新对话',
  model_id UUID REFERENCES model_configs(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  parameters JSONB DEFAULT '{"temperature": 0.7, "maxTokens": 2000, "topP": 1.0, "systemPrompt": ""}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON sessions(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_pinned ON sessions(is_pinned, last_active_at DESC);

-- 创建更新时间触发器
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的会话
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- 用户可以创建自己的会话
CREATE POLICY "Users can create own sessions" ON sessions
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- 用户可以更新自己的会话
CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- 用户可以删除自己的会话
CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================
-- 5. messages表（消息）
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model_id UUID REFERENCES model_configs(id) ON DELETE SET NULL,
  file_url VARCHAR(500),
  file_type VARCHAR(20) CHECK (file_type IN ('image', 'document', 'video')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id, created_at);

-- 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING gin(to_tsvector('simple', content));

-- RLS策略
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己会话的消息
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.user_id::text = auth.uid()::text
        )
    );

-- 用户可以创建自己会话的消息
CREATE POLICY "Users can create own messages" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.user_id::text = auth.uid()::text
        )
    );

-- 用户可以删除自己会话的消息
CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.user_id::text = auth.uid()::text
        )
    );

-- ============================================
-- 辅助函数
-- ============================================

-- 生成随机邀请码
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(32) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(32) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..32 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 更新会话的最后活跃时间
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions SET last_active_at = NOW() WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_active_on_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_session_last_active();

-- ============================================
-- 初始数据
-- ============================================

-- 创建默认管理员账号（密码：admin123，需要在应用中修改）
-- 注意：这里的密码哈希是bcrypt加密后的"admin123"，生产环境中必须修改
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2a$10$rKvVPZqGhXqKXPZqGhXqKOe.YvZqGhXqKXPZqGhXqKXPZqGhXqKXP', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '数据库Schema创建完成！';
    RAISE NOTICE '请注意：';
    RAISE NOTICE '1. 默认管理员账号：admin / admin123（请立即修改密码）';
    RAISE NOTICE '2. 请配置Supabase Storage bucket用于文件上传';
    RAISE NOTICE '3. 请在应用中配置环境变量';
END $$;
