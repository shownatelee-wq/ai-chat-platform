'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import ModelSelector from '@/components/chat/ModelSelector';
import SessionSettings from '@/components/chat/SessionSettings';
import { Session, Message, ModelConfig } from '@/types/database';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 加载模型列表
  const loadModels = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/models', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
        if (data.models.length > 0 && !selectedModelId) {
          setSelectedModelId(data.models[0].id);
        }
      }
    } catch (error) {
      console.error('加载模型失败:', error);
    }
  };

  // 加载会话列表
  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/sessions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('加载会话失败:', error);
    }
  };

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadModels();
    loadSessions();
  }, [router]);

  // 加载会话消息
  const loadMessages = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  // 创建新会话
  const handleNewSession = async () => {
    if (!selectedModelId) {
      alert('请先选择一个模型');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          modelId: selectedModelId,
        }),
      });
      const data = await res.json();
      if (data.session) {
        setSessions([data.session, ...sessions]);
        setCurrentSession(data.session);
        setMessages([]);
      }
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  // 选择会话
  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setSelectedModelId(session.modelId);
      loadMessages(sessionId);
    }
  };

  // 删除会话
  const handleDeleteSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSessions(sessions.filter((s) => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };

  // 置顶会话
  const handlePinSession = async (sessionId: string, isPinned: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned }),
      });
      loadSessions();
    } catch (error) {
      console.error('置顶会话失败:', error);
    }
  };

  // 重命名会话
  const handleRenameSession = async (newTitle: string) => {
    if (!currentSession) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/sessions/${currentSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
      loadSessions();
      setCurrentSession({ ...currentSession, title: newTitle });
    } catch (error) {
      console.error('重命名会话失败:', error);
    }
  };

  // 清空对话
  const handleClearChat = async () => {
    if (!currentSession) return;
    
    if (!confirm('确定要清空当前对话吗？此操作不可恢复。')) {
      return;
    }

    // 简化处理：直接清空UI显示
    setMessages([]);
  };

  // 保存会话参数
  const handleSaveParameters = async (parameters: Session['parameters']) => {
    if (!currentSession) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/sessions/${currentSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parameters }),
      });
      setCurrentSession({ ...currentSession, parameters });
    } catch (error) {
      console.error('保存参数失败:', error);
    }
  };

  // 发送消息
  const handleSendMessage = async (content: string, file?: File) => {
    if (!currentSession) {
      alert('请先创建或选择一个会话');
      return;
    }

    let fileUrl: string | undefined;
    let fileType: 'image' | 'document' | 'video' | undefined;

    // 上传文件
    if (file) {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await res.json();
        if (data.fileUrl) {
          fileUrl = data.fileUrl;
          fileType = data.fileType;
        }
      } catch (error) {
        console.error('文件上传失败:', error);
        alert('文件上传失败');
        return;
      }
    }

    // 添加用户消息到UI
    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: currentSession.id,
      role: 'user',
      content,
      fileUrl,
      fileType,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, userMessage]);
    setIsLoading(true);

    // 发送到后端
    try {
      const token = localStorage.getItem('token');
      const controller = new AbortController();
      setAbortController(controller);

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          content,
          fileUrl,
          fileType,
        }),
        signal: controller.signal,
      });

      // 处理SSE流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = '';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: currentSession.id,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    assistantMessageContent += parsed.content;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMessage.id
                          ? { ...m, content: assistantMessageContent }
                          : m
                      )
                    );
                  }
                  if (parsed.error) {
                    console.error('流式响应错误:', parsed.error);
                    alert('对话出错: ' + parsed.error);
                  }
                } catch {
                  // 忽略解析错误
                }
              }
            }
          }
        } catch (error) {
          console.error('读取流失败:', error);
        }
      }

      // 刷新会话列表（更新最后活跃时间）
      loadSessions();
      setIsLoading(false);
      setAbortController(null);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求已取消');
      } else {
        console.error('发送消息失败:', error);
        alert('发送消息失败，请重试');
      }
      setIsLoading(false);
      setAbortController(null);
    }
  };

  // 停止生成
  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const selectedModel = models.find((m) => m.id === selectedModelId);

  if (!user) {
    return <div>加载中...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 导航栏 */}
      <Navbar user={user} />

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onPinSession={handlePinSession}
        />

        {/* 对话区域 */}
        <div className="flex-1 flex flex-col">
          {currentSession ? (
            <>
              {/* 头部 */}
              <ChatHeader
                session={currentSession}
                onRename={handleRenameSession}
                onClear={handleClearChat}
                onSettings={() => setShowSettings(true)}
              />

              {/* 消息列表 */}
              <MessageList messages={messages} isLoading={isLoading} />

              {/* 输入区域 */}
              <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="max-w-4xl mx-auto space-y-3">
                  {/* 模型选择器 */}
                  <ModelSelector
                    models={models}
                    selectedModelId={selectedModelId}
                    onModelChange={setSelectedModelId}
                  />

                  {/* 输入框 */}
                  <ChatInput
                    onSend={handleSendMessage}
                    onStop={handleStopGeneration}
                    isLoading={isLoading}
                    supportsFiles={selectedModel?.isMultimodal}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p className="text-lg font-medium mb-2">开始新的对话</p>
                <p className="text-sm">选择一个会话或创建新会话开始对话</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 会话设置对话框 */}
      {currentSession && (
        <SessionSettings
          session={currentSession}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveParameters}
        />
      )}
    </div>
  );
}
