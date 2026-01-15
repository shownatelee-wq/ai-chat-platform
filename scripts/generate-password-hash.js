/**
 * 生成密码哈希工具
 * 用于生成管理员账号的密码哈希
 * 
 * 使用方法：
 * node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('错误：请提供密码');
  console.log('使用方法：node scripts/generate-password-hash.js <password>');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('生成密码哈希失败：', err);
    process.exit(1);
  }
  
  console.log('密码：', password);
  console.log('哈希：', hash);
  console.log('\n将此哈希值用于数据库中的password_hash字段');
});
