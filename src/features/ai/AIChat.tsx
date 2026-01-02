import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Trash2, Loader2, Bot, User, Wrench } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Markdown } from '../../components/ui/Markdown';

const CHAT_GREETING = `안녕하세요! Hummingbot AI 어시스턴트입니다. 🤖

다음과 같은 도움을 드릴 수 있습니다:
- 📊 **포트폴리오 분석**: 자산 현황, 분포, 히스토리 조회
- 🤖 **봇 관리**: 봇 상태 확인, 시작/중지, 성과 분석
- 📈 **시장 데이터**: 가격, 오더북, 캔들 데이터 조회

무엇을 도와드릴까요?`;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolsUsed?: string[];
  timestamp: number;
}

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const stored = localStorage.getItem('hb_auth_credentials');
  let authHeader = '';

  if (stored) {
    try {
      const decoded = atob(stored);
      const credentials = JSON.parse(decoded);
      authHeader = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
    } catch {
      // Ignore parse errors
    }
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.details || `API error: ${response.status}`);
  }

  return response.json();
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Load chat history
      loadHistory();
    }
  }, [isOpen]);

  async function loadHistory() {
    try {
      interface HistoryMessage extends ChatMessage {
        createdAt?: number;
      }
      const history = await fetchWithAuth<HistoryMessage[]>('/storage/chat-history?limit=50');
      if (history.length > 0) {
        setMessages(
          history.map((msg, i) => ({
            ...msg,
            id: msg.id?.toString() || `hist-${i}`,
            timestamp: msg.createdAt || Date.now(),
          }))
        );
      } else {
        // Show greeting if no history
        setMessages([
          {
            id: 'greeting',
            role: 'assistant',
            content: CHAT_GREETING,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      // Show greeting on error
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: CHAT_GREETING,
          timestamp: Date.now(),
        },
      ]);
    }
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth<{ message: string; toolsUsed: string[] }>(
        '/ai/chat',
        {
          method: 'POST',
          body: JSON.stringify({
            message: userMessage.content,
            history: messages
              .filter((m) => m.role !== 'system')
              .slice(-10)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        }
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        toolsUsed: response.toolsUsed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }

  async function clearHistory() {
    try {
      await fetchWithAuth('/storage/chat-history', { method: 'DELETE' });
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: CHAT_GREETING,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-green text-dark-900 shadow-lg hover:bg-accent-green/90 transition-all flex items-center justify-center z-40 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Open AI Chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 w-[420px] h-[600px] bg-dark-800 rounded-2xl shadow-2xl border border-dark-700 flex flex-col z-50 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
              <p className="text-xs text-dark-400">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearHistory}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4 text-dark-400" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-dark-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-accent-green/20 text-white'
                    : 'bg-dark-700 text-dark-200'
                } rounded-2xl px-4 py-2.5`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 text-accent-green" />
                    <span className="text-xs text-accent-green font-medium">AI</span>
                  </div>
                )}
                {msg.role === 'assistant' ? (
                  <Markdown content={msg.content} className="text-sm" />
                ) : (
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                )}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <Wrench className="w-3 h-3 text-dark-400" />
                    {msg.toolsUsed.map((tool, i) => (
                      <span
                        key={i}
                        className="text-xs bg-dark-600 text-dark-300 px-1.5 py-0.5 rounded"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-dark-700 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-accent-green animate-spin" />
                  <span className="text-sm text-dark-400">분석 중...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pb-2">
            <div className="p-2 bg-loss/10 border border-loss/20 rounded-lg">
              <p className="text-loss text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-dark-700">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-accent-green placeholder-dark-400"
              rows={1}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

