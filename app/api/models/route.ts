import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

// 获取所有启用的模型配置（普通用户可见）
export async function GET(req: NextRequest) {
  try {
    const authResult = authenticate(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || '未授权' },
        { status: 401 }
      );
    }

    // 查询所有启用的模型
    const { data: models, error } = await supabaseAdmin
      .from('model_configs')
      .select('id, name, provider, model_name, is_multimodal, default_params')
      .eq('enabled', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('查询模型列表失败:', error);
      return NextResponse.json(
        { error: '查询模型列表失败' },
        { status: 500 }
      );
    }

    // 返回模型列表（不包含API Key等敏感信息）
    return NextResponse.json({ models });
  } catch (error) {
    console.error('获取模型列表错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
