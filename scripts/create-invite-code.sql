-- 生成邀请码的SQL脚本
-- 在Supabase SQL Editor中执行

-- 生成一个新的邀请码
INSERT INTO invite_codes (code, status) 
VALUES (generate_invite_code(), 'unused');

-- 查看所有未使用的邀请码
SELECT 
  code,
  status,
  created_at
FROM invite_codes 
WHERE status = 'unused'
ORDER BY created_at DESC;

-- 如果需要生成多个邀请码，可以执行：
-- INSERT INTO invite_codes (code, status) 
-- SELECT generate_invite_code(), 'unused'
-- FROM generate_series(1, 10);  -- 生成10个邀请码
