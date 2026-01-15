// 验证用户名
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: '用户名至少需要3个字符' };
  }
  if (username.length > 50) {
    return { valid: false, error: '用户名不能超过50个字符' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: '用户名只能包含字母、数字、下划线和连字符' };
  }
  return { valid: true };
}

// 验证密码
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: '密码至少需要8个字符' };
  }
  if (password.length > 100) {
    return { valid: false, error: '密码不能超过100个字符' };
  }
  return { valid: true };
}

// 验证邀请码
export function validateInviteCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.length < 8) {
    return { valid: false, error: '邀请码格式不正确' };
  }
  return { valid: true };
}

// 验证Temperature参数
export function validateTemperature(temp: number): { valid: boolean; error?: string } {
  if (temp < 0 || temp > 2) {
    return { valid: false, error: 'Temperature必须在0到2之间' };
  }
  return { valid: true };
}

// 验证文件大小
export function validateFileSize(
  fileSize: number,
  fileType: 'image' | 'document' | 'video'
): { valid: boolean; error?: string } {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    document: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024, // 50MB
  };

  if (fileSize > maxSizes[fileType]) {
    return {
      valid: false,
      error: `${fileType === 'video' ? '视频' : fileType === 'image' ? '图片' : '文档'}文件大小不能超过${
        maxSizes[fileType] / (1024 * 1024)
      }MB`,
    };
  }
  return { valid: true };
}

// 验证文件类型
export function validateFileType(fileName: string): {
  valid: boolean;
  fileType?: 'image' | 'document' | 'video';
  error?: string;
} {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const documentExts = ['pdf', 'txt', 'doc', 'docx', 'md'];
  const videoExts = ['mp4', 'mov', 'avi'];

  if (ext && imageExts.includes(ext)) {
    return { valid: true, fileType: 'image' };
  }
  if (ext && documentExts.includes(ext)) {
    return { valid: true, fileType: 'document' };
  }
  if (ext && videoExts.includes(ext)) {
    return { valid: true, fileType: 'video' };
  }

  return { valid: false, error: '不支持的文件类型' };
}
