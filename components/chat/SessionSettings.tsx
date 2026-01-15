'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/types/database';

interface SessionSettingsProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onSave: (parameters: Session['parameters']) => void;
}

export default function SessionSettings({
  session,
  isOpen,
  onClose,
  onSave,
}: SessionSettingsProps) {
  const [temperature, setTemperature] = useState(session.parameters.temperature);
  const [maxTokens, setMaxTokens] = useState(session.parameters.maxTokens);
  const [topP, setTopP] = useState(session.parameters.topP);
  const [systemPrompt, setSystemPrompt] = useState(session.parameters.systemPrompt || '');

  // 当session变化时更新状态
  useEffect(() => {
    if (session) {
      setTemperature(session.parameters.temperature);
      setMaxTokens(session.parameters.maxTokens);
      setTopP(session.parameters.topP);
      setSystemPrompt(session.parameters.systemPrompt || '');
    }
  }, [session]);

  const handleSave = () => {
    onSave({
      temperature,
      maxTokens,
      topP,
      systemPrompt: systemPrompt.trim() || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setTemperature(0.7);
    setMaxTokens(2000);
    setTopP(1);
    setSystemPrompt('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* 对话框 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              会话参数设置
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6 space-y-6">
            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Temperature
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                控制输出的随机性。较低的值使输出更确定，较高的值使输出更随机和创造性。
              </p>
            </div>

            {/* Max Tokens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Tokens
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {maxTokens}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                限制AI回复的最大长度。1个token约等于0.75个英文单词或1.5个中文字符。
              </p>
            </div>

            {/* Top P */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Top P
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {topP.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                控制输出的多样性。较低的值使输出更集中，较高的值使输出更多样化。
              </p>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                系统提示词
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="输入系统提示词，用于设定AI的角色和行为..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                系统提示词会在每次对话开始时发送给AI，用于设定AI的角色、风格和行为规则。
              </p>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">注意</p>
                  <p>这些参数仅对当前会话生效，不会影响其他会话。</p>
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              重置为默认值
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
