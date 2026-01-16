'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (token) {
      // 已登录，跳转到对话页面
      router.push('/chat');
    } else {
      // 未登录，跳转到登录页面
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
      </div>
    </div>
  );
}
