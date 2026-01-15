import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

// 文件类型配置
const FILE_TYPES = {
  image: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  document: {
    extensions: ['pdf', 'txt', 'doc', 'docx', 'md'],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ],
  },
  video: {
    extensions: ['mp4', 'mov', 'avi'],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  },
};

// 获取文件扩展名
function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// 验证文件类型和大小
function validateFile(file: File): {
  valid: boolean;
  error?: string;
  fileType?: 'image' | 'document' | 'video';
} {
  const extension = getFileExtension(file.name);
  const fileSize = file.size;

  // 检查文件类型
  let fileType: 'image' | 'document' | 'video' | null = null;
  let config: typeof FILE_TYPES.image | null = null;

  for (const [type, typeConfig] of Object.entries(FILE_TYPES)) {
    if (typeConfig.extensions.includes(extension)) {
      fileType = type as 'image' | 'document' | 'video';
      config = typeConfig;
      break;
    }
  }

  if (!fileType || !config) {
    return {
      valid: false,
      error: `不支持的文件格式。支持的格式：图片（${FILE_TYPES.image.extensions.join(', ')}）、文档（${FILE_TYPES.document.extensions.join(', ')}）、视频（${FILE_TYPES.video.extensions.join(', ')}）`,
    };
  }

  // 检查文件大小
  if (fileSize > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `文件大小超过限制。${fileType === 'video' ? '视频' : '图片和文档'}文件最大${maxSizeMB}MB`,
    };
  }

  // 检查MIME类型
  if (!config.mimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: '文件MIME类型不匹配',
    };
  }

  return {
    valid: true,
    fileType,
  };
}

export async function POST(req: NextRequest) {
  try {
    const authResult = authenticate(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || '未授权' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 验证文件
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = getFileExtension(file.name);
    const fileName = `${authResult.user.userId}/${timestamp}-${randomStr}.${extension}`;

    // 上传到Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data, error } = await supabaseAdmin.storage
      .from('chat-files')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('文件上传失败:', error);
      return NextResponse.json(
        { error: '文件上传失败: ' + error.message },
        { status: 500 }
      );
    }

    // 获取公开URL
    const { data: urlData } = supabaseAdmin.storage
      .from('chat-files')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileUrl: urlData.publicUrl,
      fileType: validation.fileType,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
