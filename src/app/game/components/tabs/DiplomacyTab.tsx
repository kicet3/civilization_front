import React, { useState } from 'react';
import { Civilization } from '@/types/game';
import DiplomacyChat from './diplomacy/DiplomacyChat';

interface DiplomacyTabProps {
  discoveredCivilizations: Civilization[];
  undiscoveredCivilizations: Civilization[];
  onSelectCivilization: (civilization: Civilization) => void;
}

const DiplomacyTab: React.FC<DiplomacyTabProps> = ({
  discoveredCivilizations,
  undiscoveredCivilizations,
  onSelectCivilization
}) => {
  const [selectedLeader, setSelectedLeader] = useState<Civilization | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLeaderSelect = (civ: Civilization) => {
    setSelectedLeader(civ);
    setIsChatOpen(true);
  };

  const handleSendMessage = async (message: string) => {
    // TODO: LLM API를 통한 메시지 처리
    console.log('메시지 전송:', message);
    // 임시 응답 메시지 추가
    const response = {
      id: Date.now().toString(),
      sender: 'leader' as const,
      content: '임시 응답 메시지입니다.',
      timestamp: new Date()
    };
    // TODO: 실제 응답 처리
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">발견된 문명</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discoveredCivilizations.map((civ) => (
            <div
              key={civ.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleLeaderSelect(civ)}
            >
              <h3 className="font-bold">{civ.name}</h3>
              <p className="text-sm text-gray-600">수도: {civ.capital}</p>
              <p className="text-sm text-gray-600">도시 수: {civ.cities?.length}</p>
              <p className="text-sm text-gray-600">군사력: {civ.militaryStrength}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">미발견 문명</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {undiscoveredCivilizations.map((civ) => (
            <div
              key={civ.id}
              className="p-4 border rounded-lg bg-gray-100"
            >
              <h3 className="font-bold">???</h3>
              <p className="text-sm text-gray-600">수도: ???</p>
              <p className="text-sm text-gray-600">도시 수: ???</p>
              <p className="text-sm text-gray-600">군사력: ???</p>
            </div>
          ))}
        </div>
      </div>

      {selectedLeader && (
        <DiplomacyChat
          leader={selectedLeader}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default DiplomacyTab; 