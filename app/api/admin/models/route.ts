import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { encryptApiKey } from '@/lib/utils/encryption';
import { ErrorCode, CreateModelRequest } from '@/types/api';

// 获取所有模型配置（管理员）
export async function GET(req: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = authenticateAdmin(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // 查询所有模型配置
    const { data: models, error } = await supabaseAdmin
      .from('model_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查询模型配置失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '查询模型配置失败',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      models,
    });
  } catch (error) {
    console.error('获取模型配置列表错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}

// 创建新模型配置
export async function POST(req: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = authenticateAdmin(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const body: CreateModelRequest = await req.json();
    const {
      name,
      provider,
      apiKey,
      baseUrl,
      modelName,
      isMultimodal,
      enabled,
      defaultParams,
    } = body;

    // 验证必填字段
    if (!name || !provider || !apiKey || !modelName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_PARAMETERS,
            message: '缺少必填字段',
          },
        },
        { status: 400 }
      );
    }

    // 加密API Key
    const encryptedApiKey = encryptApiKey(apiKey);

    // 插入模型配置
    const { data: newModel, error: insertError } = await supabaseAdmin
      .from('model_configs')
      .insert({
        name,
        provider,
        api_key_encrypted: encryptedApiKey,
        base_url: baseUrl,
        model_name: modelName,
        is_multimodal: isMultimodal,
        enabled,
        default_params: defaultParams,
      })
      .select()
      .single();

    if (insertError || !newModel) {
      console.error('创建模型配置失败:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '创建模型配置失败',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        model: newModel,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建模型配置错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
