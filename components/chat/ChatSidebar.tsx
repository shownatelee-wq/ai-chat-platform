'use client';

import { useState } from 'react';
import { Session } from '@/types/database';

interface ChatSidebarProps {
  sessions: Session[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onPinSession: (sessionId: string, isPinned: boolean) => void;
}

export default function ChatSidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onPinSession,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤会话
  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 分组：置顶和非置顶
  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.isPinned);

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onNewSession}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
        >
          + 新建对话
        </button>
      </div>

      {/* 搜索框 */}
      <div className="p-4">
        <input
          type="text"
          placeholder="搜索会话..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {/* 置顶会话 */}
        {pinnedSessions.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              置顶
            </div>
            {pinnedSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onSelect={() => onSessionSelect(session.id)}
                onDelete={() => onDeleteSession(session.id)}
                onPin={() => onPinSession(session.id, false)}
              />
            ))}
          </div>
        )}

        {/* 普通会话 */}
        {unpinnedSessions.length > 0 && (
          <div>
            {pinnedSessions.length > 0 && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                全部会话
              </div>
            )}
            {unpinnedSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onSelect={() => onSessionSelect(session.id)}
                onDelete={() => onDeleteSession(session.id)}
                onPin={() => onPinSession(session.id, true)}
              />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {filteredSessions.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? '未找到匹配的会话' : '暂无会话'}
          </div>
        )}
      </div>
    </div>
  );
}

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onPin: () => void;
}

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
  onPin,
}: SessionItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`
        relative px-4 py-3 cursor-pointer transition-colors
        ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {session.isPinned && (
              <svg
                className="w-3 h-3 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.409 1.574 1.195 1.574H6.5a1 1 0 01.894.553l.448.894a1 1 0 001.788 0l.448-.894A1 1 0 0111 13.4h1.123c.786 0 1.445-.794 1.195-1.574L12.5 9.274V3a1 1 0 10-2 0v6.274z" />
              </svg>
            )}
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {session.title}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(session.lastActiveAt).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* 菜单按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* 下拉菜单 */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-4 top-12 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {session.isPinned ? '取消置顶' : '置顶'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('确定要删除这个会话吗？')) {
                  onDelete();
                }
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              删除
            </button>
          </div>
        </>
      )}
    </div>
  );
}
