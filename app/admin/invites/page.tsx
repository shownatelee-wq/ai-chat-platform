'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

interface InviteCode {
  id: string;
  code: string;
  status: 'unused' | 'used' | 'invalid';
  created_at: string;
  used_at?: string;
  used_by?: string;
}

export default function InviteCodesPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // 检查管理员权限
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'admin') {
      router.push('/chat');
      return;
    }
    fetchInviteCodes();
  }, [isAuthenticated, user, router]);

  const fetchInviteCodes = async () => {
    try {
      const response = await fetch('/api/admin/invites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error?.message || '获取邀请码失败');
        return;
      }

      setInviteCodes(data.inviteCodes);
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error?.message || '生成邀请码失败');
        setCreating(false);
        return;
      }

      // 刷新列表
      await fetchInviteCodes();
    } catch (err) {
      setError('网络错误');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个邀请码吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/invites/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error?.message || '删除邀请码失败');
        return;
      }

      // 刷新列表
      await fetchInviteCodes();
    } catch (err) {
      setError('网络错误');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('邀请码已复制到剪贴板');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      unused: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      used: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      invalid: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    const labels = {
      unused: '未使用',
      used: '已使用',
      invalid: '已失效',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              邀请码管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              管理用户注册邀请码
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? '生成中...' : '生成新邀请码'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  邀请码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  使用时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {inviteCodes.map((invite) => (
                <tr key={invite.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <code className="text-sm font-mono text-gray-900 dark:text-white">
                        {invite.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(invite.code)}
                        className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        title="复制"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invite.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(invite.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {invite.used_at
                      ? new Date(invite.used_at).toLocaleString('zh-CN')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {invite.status === 'unused' && (
                      <button
                        onClick={() => handleDelete(invite.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {inviteCodes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                暂无邀请码，点击上方按钮生成
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
