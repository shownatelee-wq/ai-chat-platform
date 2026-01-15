'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (content: string, file?: File) => void;
  onStop?: () => void;
  isLoading?: boolean;
  supportsFiles?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading = false,
  supportsFiles = false,
  disabled = false,
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!content.trim() && !file) return;
    if (disabled || isLoading) return;

    onSend(content, file || undefined);
    setContent('');
    setFile(null);

    // 重置textarea高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // 自动调整高度
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      {/* 文件预览 */}
      {file && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
            {file.name}
          </span>
          <button
            onClick={() => setFile(null)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg
              className="w-4 h-4"
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
      )}

      {/* 输入区域 */}
      <div className="flex items-end gap-2">
        {/* 文件上传按钮 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || !supportsFiles || isLoading}
          className={`
            p-2 rounded-lg transition-colors
            ${
              disabled || !supportsFiles || isLoading
                ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          title={!supportsFiles ? '当前模型不支持文件上传' : '上传文件'}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.txt,.doc,.docx,.md"
          onChange={handleFileSelect}
        />

        {/* 文本输入框 */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Shift+Enter 换行)"
          disabled={disabled || isLoading}
          className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] max-h-[200px]"
          rows={1}
        />

        {/* 发送/停止按钮 */}
        {isLoading ? (
          <button
            onClick={onStop}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="停止生成"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || (!content.trim() && !file)}
            className={`
              p-2 rounded-lg transition-colors
              ${
                disabled || (!content.trim() && !file)
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
            title="发送消息"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 提示文本 */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        按 Enter 发送，Shift+Enter 换行
      </div>
    </div>
  );
}
