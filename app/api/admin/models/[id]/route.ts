import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { encryptApiKey } from '@/lib/utils/encryption';
import { ErrorCode, UpdateModelRequest } from '@/types/api';

// 更新模型配置
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    const authResult = authenticateAdmin(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: UpdateModelRequest = await req.json();
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

    // 准备更新数据
    const updateData: any = {
      name,
      provider,
      base_url: baseUrl,
      model_name: modelName,
      is_multimodal: isMultimodal,
      enabled,
      default_params: defaultParams,
    };

    // 如果提供了新的API Key，则加密并更新
    if (apiKey) {
      updateData.api_key_encrypted = encryptApiKey(apiKey);
    }

    // 更新模型配置
    const { data: updatedModel, error } = await supabaseAdmin
      .from('model_configs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedModel) {
      console.error('更新模型配置失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '更新模型配置失败',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      model: updatedModel,
    });
  } catch (error) {
    console.error('更新模型配置错误:', error);
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

// 删除模型配置
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    const authResult = authenticateAdmin(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 删除模型配置
    const { error } = await supabaseAdmin
      .from('model_configs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除模型配置失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.DATABASE_ERROR,
            message: '删除模型配置失败',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '模型配置已删除',
    });
  } catch (error) {
    console.error('删除模型配置错误:', error);
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
