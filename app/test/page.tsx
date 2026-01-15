'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/supabase');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: '连接失败', details: String(error) });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          系统测试页面
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            环境变量检查
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium w-48">Supabase URL:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ 已配置' : '✗ 未配置'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-48">Supabase Anon Key:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ 已配置' : '✗ 未配置'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Supabase连接测试
          </h2>
          <button
            onClick={testSupabaseConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试Supabase连接'}
          </button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            快速链接
          </h2>
          <div className="space-y-2">
            <a
              href="/register"
              className="block text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              → 注册页面
            </a>
            <a
              href="/login"
              className="block text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              → 登录页面
            </a>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            <strong>提示：</strong> 在测试之前，请确保已经：
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-400 mt-2 space-y-1">
            <li>在Supabase中执行了 database/schema.sql</li>
            <li>配置了 .env.local 文件</li>
            <li>生成了至少一个邀请码</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
