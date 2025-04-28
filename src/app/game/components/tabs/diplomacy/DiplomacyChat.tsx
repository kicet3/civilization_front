import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Civilization } from '@/types/game';
import { ChatMessage } from '../../utils/chatWebSocket';

interface DiplomacyChatProps {
  civilization: Civilization;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isSending: boolean;
}

export default function DiplomacyChat({
  civilization,
  messages,
  onSendMessage,
  onClose,
  isSending
}: DiplomacyChatProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 스크롤 자동 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && !isSending) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-slate-700 p-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-2">
            {civilization.leaderImage ? (
              <img
                src={civilization.leaderImage}
                alt={civilization.leader}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="bg-blue-600 w-full h-full rounded-full flex items-center justify-center text-white font-bold">
                {civilization.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{civilization.name}</p>
            <p className="text-xs text-slate-400">지도자: {civilization.leader || '알 수 없음'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs break-words ${
                msg.sender === 'player'
                  ? 'bg-blue-600 text-white'
                  : msg.is_error
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {msg.content}
              <div className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-700 p-2">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-slate-700 text-white p-2 rounded-l-md focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className={`p-2 flex items-center justify-center rounded-r-md ${
              isSending || !message.trim()
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 