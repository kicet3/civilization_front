import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, AlertCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ChatWsClient, ChatMessage } from '../utils/chatWsClient';

// 게임당 최대 조언 사용 횟수
const MAX_ADVICE_COUNT = 7;

export default function LogPanel() {
  const { gameState } = useGame();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatClient, setChatClient] = useState<ChatWsClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 사용자가 보낸 메시지 수를 추적
  const [adviceUsedCount, setAdviceUsedCount] = useState<number>(0);
  
  // 사용 가능한 조언 횟수
  const remainingAdvice = MAX_ADVICE_COUNT - adviceUsedCount;
  
  // 조언 사용 가능 여부
  const canUseAdvice = remainingAdvice > 0;

  // 로컬 스토리지에서 사용 횟수 로드 (클라이언트 사이드에서만 실행)
  useEffect(() => {
    // localStorage는 브라우저에서만 사용 가능
    if (typeof window !== 'undefined') {
      const savedCount = localStorage.getItem(`advice-count-${gameState?.id || 'current-game'}`);
      if (savedCount) {
        setAdviceUsedCount(parseInt(savedCount, 10));
      }
    }
  }, [gameState?.id]);

  // 메시지 자동 스크롤 기능
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 사용 횟수가 변경될 때마다 로컬 스토리지에 저장 (클라이언트 사이드에서만 실행)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`advice-count-${gameState?.id || 'current-game'}`, adviceUsedCount.toString());
    }
  }, [adviceUsedCount, gameState?.id]);

  // 컴포넌트 마운트 시 웹소켓 연결
  useEffect(() => {
    const initChat = async () => {
      try {
        // 채팅 ID 생성 (간단히 'game-log'로 고정)
        const chatId = 'game-log';
        // WebSocket 연결 URL 설정
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        
        // WebSocket 클라이언트 생성
        const client = new ChatWsClient({
          chatId,
          url: `${wsUrl}/ws`,
          onMessage: (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
            setLoading(false);
          },
          onError: (err: any) => {
            console.error('채팅 오류:', err);
            setMessages(prev => [
              ...prev, 
              { 
                role: 'system', 
                content: '채팅 연결 중 오류가 발생했습니다. 다시 시도해주세요.', 
                timestamp: new Date().toISOString(),
                is_error: true 
              }
            ]);
            setLoading(false);
          },
          onOpen: () => {
            console.log('채팅 연결 성공');
            // 시스템 메시지 추가
            setMessages([
              { 
                role: 'system', 
                content: `조언가와 연결되었습니다. 게임에 관한 질문을 해보세요! (남은 조언: ${remainingAdvice}/${MAX_ADVICE_COUNT})`,
                timestamp: new Date().toISOString()
              }
            ]);
          },
          onClose: () => {
            console.log('채팅 연결 종료');
          }
        });
        
        // 채팅 초기화 및 연결
        await client.initializeChat(gameState);
        client.connect();
        setChatClient(client);
        
        // 채팅 기록 로드
        const history = await client.loadChatHistory();
        if (history.length > 0) {
          setMessages(history);
        }
      } catch (err) {
        console.error('채팅 초기화 오류:', err);
      }
    };
    
    initChat();
    
    // 컴포넌트 언마운트 시 웹소켓 연결 종료
    return () => {
      if (chatClient) {
        chatClient.close();
      }
    };
  }, []);
  
  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (!message.trim() || loading || !chatClient) return;
    
    // 조언 횟수 제한 체크
    if (!canUseAdvice) {
      setMessages(prev => [
        ...prev,
        {
          role: 'system',
          content: `조언 사용 횟수를 모두 소진했습니다. 한 게임당 최대 ${MAX_ADVICE_COUNT}번의 조언을 받을 수 있습니다.`,
          timestamp: new Date().toISOString(),
          is_error: true
        }
      ]);
      return;
    }
    
    // 사용자 메시지 추가 (UI 즉시 업데이트)
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    // 메시지 전송
    chatClient.sendMessage(message, gameState);
    
    // 조언 사용 횟수 증가
    setAdviceUsedCount(prev => prev + 1);
    
    // 입력창 초기화
    setMessage('');
  };
  
  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 롤 표시 함수
  const getMessageRoleStyle = (role: string, isError?: boolean) => {
    if (isError) return 'text-red-400';
    switch (role) {
      case 'system': return 'text-green-400';
      case 'assistant': return 'text-blue-400';
      case 'user': return 'text-slate-300';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="border-l border-slate-700 bg-slate-800 h-full flex flex-col">
      <div className="p-2 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare size={18} className="mr-2" />
          <h3 className="font-medium text-sm">게임 조언가</h3>
        </div>
        <div className={`text-xs ${remainingAdvice > 2 ? 'text-green-400' : remainingAdvice > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
          남은 조언: {remainingAdvice}/{MAX_ADVICE_COUNT}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 text-sm text-slate-300">
        {messages.length === 0 ? (
          <>
            <p className="mb-2 text-green-400">시스템: 게임이 시작되었습니다.</p>
            <p className="mb-2 text-blue-400">조언가: 새로운 문명의 지도자님, 환영합니다!</p>
            <p className="mb-2">이제 우리는 새로운 문명을 건설하여 역사에 이름을 남길 것입니다.</p>
            <p className="mb-2 text-yellow-400">※ 한 게임당 조언가에게 최대 {MAX_ADVICE_COUNT}번 질문할 수 있습니다.</p>
          </>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-3">
              <p className={`${getMessageRoleStyle(msg.role, msg.is_error)}`}>
                {msg.role === 'system' ? '시스템: ' : 
                msg.role === 'assistant' ? '조언가: ' : 
                '당신: '}{msg.content}
              </p>
              <span className="text-xs text-slate-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-2 border-t border-slate-700">
        {!canUseAdvice && (
          <div className="mb-2 p-2 bg-red-900/30 text-red-300 text-xs rounded flex items-center">
            <AlertCircle size={14} className="mr-1" />
            조언 사용 횟수를 모두 소진했습니다. 한 게임당 최대 {MAX_ADVICE_COUNT}번의 조언을 받을 수 있습니다.
          </div>
        )}
        <div className="flex">
          <input 
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || !canUseAdvice}
            placeholder={canUseAdvice ? "메시지 입력..." : "조언 횟수를 모두 소진했습니다"}
            className={`flex-1 text-sm p-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              canUseAdvice ? 'bg-slate-700' : 'bg-slate-800 text-slate-500'
            }`}
          />
          <button 
            className={`flex items-center justify-center p-2 rounded-r-md ${
              loading || !message.trim() || !canUseAdvice
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={handleSendMessage}
            disabled={loading || !message.trim() || !canUseAdvice}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 