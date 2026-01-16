'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/stores/auth-store';

interface ModelConfig {
  id: string;
  provider: string;
  modelName: string;
  displayName: string;
  apiEndpoint: string;
  isEnabled: boolean;
  isMultimodal: boolean;
  createdAt: string;
}

export default function AdminModelsPage() {
  const router = useRouter();
  const { user: authUser, token: authToken, isAuthenticated } = useAuthStore();
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [formData, setFormData] = useState({
    provider: '',
    modelName: '',
    displayName: '',
    apiKey: '',
    apiEndpoint: '',
    isMultimodal: false,
  });

  // 使用独立的 localStorage 键来获取 token（兼容性）- 只在客户端执行
  const token = authToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const user = authUser || (typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);

  useEffect(() => {
    // 检查认证状态
    if (!token || !user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/chat');
      return;
    }

    loadModels();
  }, [router, token, user]);

  const loadModels = async () => {
    try {
      const res = await fetch('/api/admin/models', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (error) {
      console.error('加载模型失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingModel
        ? `/api/admin/models/${editingModel.id}`
        : '/api/admin/models';
      const method = editingModel ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(editingModel ? '模型更新成功' : '模型添加成功');
        setShowForm(false);
        setEditingModel(null);
        setFormData({
          provider: '',
          modelName: '',
          displayName: '',
          apiKey: '',
          apiEndpoint: '',
          isMultimodal: false,
        });
        loadModels();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('操作失败');
    }
  };

  const handleEdit = (model: ModelConfig) => {
    setEditingModel(model);
    setFormData({
      provider: model.provider,
      modelName: model.modelName,
      displayName: model.displayName,
      apiKey: '', // 不显示现有API Key
      apiEndpoint: model.apiEndpoint,
      isMultimodal: model.isMultimodal,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模型配置吗？')) return;

    try {
      const res = await fetch(`/api/admin/models/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('删除成功');
        loadModels();
      } else {
        const data = await res.json();
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleToggleEnabled = async (id: string, isEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/models/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isEnabled: !isEnabled }),
      });

      if (res.ok) {
        loadModels();
      } else {
        const data = await res.json();
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  const handleTest = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/models/${id}/test`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alert('测试成功！\n' + data.message);
      } else {
        alert('测试失败：' + data.error);
      }
    } catch (error) {
      console.error('测试失败:', error);
      alert('测试失败');
    }
  };

  if (!user) {
    return <div>加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            模型配置管理
          </h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingModel(null);
              setFormData({
                provider: '',
                modelName: '',
                displayName: '',
                apiKey: '',
                apiEndpoint: '',
                isMultimodal: false,
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            添加模型
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">加载中...</div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    提供商
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    模型名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    显示名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    多模态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {models.map((model) => (
                  <tr key={model.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {model.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {model.modelName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {model.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {model.isMultimodal ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          支持
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          不支持
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() =>
                          handleToggleEnabled(model.id, model.isEnabled)
                        }
                        className={`px-2 py-1 text-xs rounded-full ${
                          model.isEnabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {model.isEnabled ? '已启用' : '已禁用'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleTest(model.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        测试
                      </button>
                      <button
                        onClick={() => handleEdit(model)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {models.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                暂无模型配置
              </div>
            )}
          </div>
        )}
      </div>

      {/* 添加/编辑模型表单 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingModel ? '编辑模型' : '添加模型'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    提供商
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) =>
                      setFormData({ ...formData, provider: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">选择提供商</option>
                    <option value="openai">OpenAI</option>
                    <option value="claude">Claude</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="gemini">Gemini</option>
                    <option value="zhipu">智谱AI</option>
                    <option value="qwen">通义千问</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    模型名称
                  </label>
                  <input
                    type="text"
                    value={formData.modelName}
                    onChange={(e) =>
                      setFormData({ ...formData, modelName: e.target.value })
                    }
                    placeholder="例如: gpt-4, claude-3-opus"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    显示名称
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="例如: GPT-4, Claude 3 Opus"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key {editingModel && '(留空则不修改)'}
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    placeholder="输入API Key"
                    required={!editingModel}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API 端点 (可选)
                  </label>
                  <input
                    type="text"
                    value={formData.apiEndpoint}
                    onChange={(e) =>
                      setFormData({ ...formData, apiEndpoint: e.target.value })
                    }
                    placeholder="留空使用默认端点"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isMultimodal"
                    checked={formData.isMultimodal}
                    onChange={(e) =>
                      setFormData({ ...formData, isMultimodal: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isMultimodal"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    支持多模态（图片/视频）
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingModel(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingModel ? '保存' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
