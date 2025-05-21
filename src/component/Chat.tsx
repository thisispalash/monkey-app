'use client';

import { useState } from 'react';
import { useAPI } from '@/context/APIContext';
import type { APIResponse } from '@/lib/client/axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  message: string;
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { chat } = useAPI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat({ messages: [...messages, userMessage] }) as APIResponse<ChatResponse>;
      if (response.data) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 overflow-y-auto mb-4 p-4 ${messages.length > 0 ? 'border border-foreground rounded-lg' : ''}`}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {/* {isLoading && (
          <div className="text-center text-gray-500">
            <span className="animate-pulse">Thinking...</span>
          </div>
        )} */}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-lg hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}