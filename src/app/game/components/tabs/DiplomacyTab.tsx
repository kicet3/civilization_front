import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Globe, MessageSquare, ExternalLink, HelpCircle, X } from 'lucide-react';
import { Civilization } from '@/types/game';
import DiplomacyChat from './diplomacy/DiplomacyChat';
import { DiplomacyChatWebSocket, ChatMessage } from '../utils/chatWebSocket';

export default function DiplomacyTab() {
  const { gameState, isLoading } = useGame();
  const [selectedCiv, setSelectedCiv] = useState<Civilization | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSocket, setChatSocket] = useState<DiplomacyChatWebSocket | null>(null);
  const [sending, setSending] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // 문명별 고유 chatId 생성 (테스트용: 문명 id 사용)
  const getChatId = (civ: Civilization) => `civ-${civ.id}`;

  // 채팅 시작
  const openChat = (civ: Civilization) => {
    setSelectedCiv(civ);
    setIsChatOpen(true);
    // 실제 WebSocket 연결 생성
    const playerName = gameState?.currentPlayer || 'player';
    const civilizationId = civ.id;
    const wsBase = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:8000';
    const wsUrl = `${wsBase.replace(/^http/, 'ws')}/diplomacy/ws/${playerName}/${civilizationId}`;
    const ws = new WebSocket(wsUrl);
    setChatSocket(ws as any); // 호환성 위해 any로 저장
    setChatMessages([]); // 새로 시작

    ws.onopen = () => {
      // 연결 성공 시
      // 필요시 초기 메시지 요청 등 처리
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setChatMessages((prev) => [...prev, {
          role: data.role || 'assistant',
          content: data.message || data.content,
          timestamp: new Date().toISOString(),
          sender: data.role === 'user' ? 'player' : 'ai',
        }]);
        setSending(false);
      } catch (e) {
        setChatMessages((prev) => [...prev, { role: 'system', content: '메시지 파싱 오류', timestamp: new Date().toISOString(), is_error: true }]);
        setSending(false);
      }
    };
    ws.onerror = () => {
      setChatMessages((prev) => [...prev, { role: 'system', content: '채팅 오류 발생', timestamp: new Date().toISOString(), is_error: true }]);
      setSending(false);
    };
    ws.onclose = () => {
      // 연결 종료 시
    };

  };

  // 채팅 종료
  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedCiv(null);
    chatSocket?.close();
    setChatSocket(null);
    setChatMessages([]);
  };

  // 메시지 전송
  const handleSendMessage = async (message: string) => {
    if (!chatSocket || !selectedCiv || sending) return;
    setSending(true);
    // WebSocket 직접 송신
    try {
      (chatSocket as WebSocket).send(JSON.stringify({ type: 'message', content: message }));
    } catch (e) {
      setChatMessages((prev) => [...prev, { role: 'system', content: '메시지 전송 오류', timestamp: new Date().toISOString(), is_error: true }]);
      setSending(false);
    }
  };

  // 메시지 입력 및 전송 처리
  const handleSend = () => {
    if (chatInput.trim() && !sending) {
      handleSendMessage(chatInput);
      setChatInput('');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-6">외교</h2>
        <div className="flex items-center justify-center h-64">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 플레이어가 아닌 모든 문명 가져오기
  const allCivilizations = gameState?.map?.civs.filter(civ => 
    typeof civ === 'object' && civ !== null && !('isPlayer' in civ && civ.isPlayer)
  ) || [];

  // 맵 데이터에서 발견된 문명과 미발견 문명 구분
  const discoveredCivs: Civilization[] = [];
  const undiscoveredCivs: Civilization[] = [];

  allCivilizations.forEach(civ => {
    // 문명이 발견되었는지 여부를 확인 (맵에서 문명의 타일이 explored 또는 visible인 경우)
    const isDiscovered = gameState?.map?.tiles.some(tile => 
      (tile.city?.owner === civ.name) && 
      (tile.exploration === 'visible' || tile.exploration === 'explored')
    );

    if (isDiscovered) {
      discoveredCivs.push(civ);
    } else {
      undiscoveredCivs.push(civ);
    }
  });

  // 로마 문명 강제 추가 (id 또는 name으로 식별)
  const romeCiv = allCivilizations.find(civ => 
    (civ.name && civ.name.includes('로마')) || (civ.id && String(civ.id).toLowerCase().includes('rome'))
  );
  if (romeCiv && !discoveredCivs.some(civ => civ.id === romeCiv.id)) {
    discoveredCivs.push(romeCiv);
    // undiscoveredCivs에서 제거
    const idx = undiscoveredCivs.findIndex(civ => civ.id === romeCiv.id);
    if (idx !== -1) undiscoveredCivs.splice(idx, 1);
  }


  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6">외교</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-xl mb-4">발견된 문명</h3>
          
          {discoveredCivs.length > 0 ? (
            <div className="space-y-3">
              {discoveredCivs.map(civ => (
                <div key={civ.id} className="bg-slate-800 p-3 rounded-md flex justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                      {civ.leaderImage ? (
                        <img 
                          src={civ.leaderImage} 
                          alt={civ.leader} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <Globe size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{civ.name}</p>
                      <p className="text-xs text-slate-400">지도자: {civ.leader || '알 수 없음'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded" onClick={() => openChat(civ)}>
                      <MessageSquare size={16} />
                    </button>
                    <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 p-4 rounded-md text-center">
              <p className="text-slate-400">아직 발견된 문명이 없습니다.</p>
            </div>
          )}

          {undiscoveredCivs.length > 0 && (
            <>
              <h3 className="text-xl mb-4 mt-6">미발견 문명</h3>
              <div className="space-y-3">
                {undiscoveredCivs.map(civ => (
                  <div key={civ.id} className="bg-slate-800 p-3 rounded-md flex justify-between opacity-70">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                        <HelpCircle size={24} />
                      </div>
                      <div>
                        <p className="font-medium">??? 문명</p>
                        <p className="text-xs text-slate-400">지도자: ???</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-col h-full">
          <h3 className="text-xl mb-4">외교 상태</h3>
          <div className="bg-slate-800 p-4 rounded-md flex flex-col flex-1">
            {selectedCiv ? (
              <DiplomacyChat 
                civilization={selectedCiv}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onClose={() => setSelectedCiv(null)}
                isSending={sending}
              />
            ) : (
              <p className="text-center text-slate-400">문명을 선택하여 외교 관계를 관리하세요.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}