import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    // 测试数据库连接
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Supabase连接失败',
        error: error.message,
      }, { status: 500 });
    }

    // 检查表是否存在
    const tables = ['users', 'invite_codes', 'model_configs', 'sessions', 'messages'];
    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabaseAdmin
          .from(table)
          .select('count')
          .limit(1);
        return { table, exists: !error };
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Supabase连接成功',
      tables: tableChecks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '测试失败',
      error: String(error),
    }, { status: 500 });
  }
}
