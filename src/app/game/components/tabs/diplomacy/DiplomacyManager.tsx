import React, { useState, useEffect } from 'react';
import { DiplomacyState } from '@/types/game';

// 외교 관계 상태 정의
export type RelationshipStatus = 
  | '전쟁' 
  | '적대적' 
  | '중립' 
  | '우호적' 
  | '동맹';

interface Civilization {
  id: string;
  name: string;
  leader: string;
  leaderImage?: string;
  relationshipStatus?: RelationshipStatus;
}

interface DiplomacyManagerProps {
  playerCivId: string;
  discoveredCivs: Civilization[];
  diplomacyState?: DiplomacyState;
  onRelationshipChange: (civId: string, newStatus: RelationshipStatus) => void;
  onOpenDiplomacyChat: (civ: Civilization) => void;
}

const DiplomacyManager: React.FC<DiplomacyManagerProps> = ({
  playerCivId,
  discoveredCivs,
  diplomacyState,
  onRelationshipChange,
  onOpenDiplomacyChat
}) => {
  const [relationships, setRelationships] = useState<{ [key: string]: RelationshipStatus }>({});

  // 초기 외교 관계 설정
  useEffect(() => {
    if (diplomacyState?.civRelations) {
      // civRelations가 올바른 타입인지 확인하고 변환
      const typedRelations: { [key: string]: RelationshipStatus } = {};
      
      Object.entries(diplomacyState.civRelations).forEach(([civId, status]) => {
        typedRelations[civId] = status as RelationshipStatus;
      });
      
      setRelationships(typedRelations);
    } else {
      // 기본값 설정
      const defaultRelations: { [key: string]: RelationshipStatus } = {};
      discoveredCivs.forEach(civ => {
        defaultRelations[civ.id] = '중립';
      });
      setRelationships(defaultRelations);
    }
  }, [diplomacyState, discoveredCivs]);

  // 관계 상태에 따른 색상 반환
  const getRelationshipColor = (status: RelationshipStatus): string => {
    switch (status) {
      case '전쟁': return 'bg-red-600';
      case '적대적': return 'bg-red-400';
      case '중립': return 'bg-gray-400';
      case '우호적': return 'bg-green-400';
      case '동맹': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  // 외교적 행동 옵션 반환
  const getDiplomaticActions = (civ: Civilization): { label: string; action: () => void }[] => {
    const status = relationships[civ.id] || '중립';
    const actions: { label: string; action: () => void }[] = [];
    
    // 상태에 따라 가능한 행동 추가
    switch (status) {
      case '전쟁':
        actions.push({ 
          label: '평화 제안', 
          action: () => onRelationshipChange(civ.id, '적대적') 
        });
        break;
      case '적대적':
        actions.push({ 
          label: '관계 개선', 
          action: () => onRelationshipChange(civ.id, '중립') 
        });
        actions.push({ 
          label: '전쟁 선포', 
          action: () => onRelationshipChange(civ.id, '전쟁')
        });
        break;
      case '중립':
        actions.push({ 
          label: '우호 제안', 
          action: () => onRelationshipChange(civ.id, '우호적') 
        });
        actions.push({ 
          label: '전쟁 선포', 
          action: () => onRelationshipChange(civ.id, '전쟁') 
        });
        break;
      case '우호적':
        actions.push({ 
          label: '동맹 제안', 
          action: () => onRelationshipChange(civ.id, '동맹') 
        });
        actions.push({ 
          label: '관계 악화', 
          action: () => onRelationshipChange(civ.id, '중립') 
        });
        break;
      case '동맹':
        actions.push({ 
          label: '동맹 파기', 
          action: () => onRelationshipChange(civ.id, '우호적') 
        });
        break;
    }

    // 모든 상태에서 대화 가능
    actions.push({ 
      label: '대화하기', 
      action: () => onOpenDiplomacyChat(civ) 
    });

    return actions;
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4">외교 관계 관리</h3>
      
      <div className="space-y-4">
        {discoveredCivs.length > 0 ? (
          discoveredCivs.map(civ => (
            <div key={civ.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                    {civ.leaderImage ? (
                      <img 
                        src={civ.leaderImage} 
                        alt={civ.leader} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <span>{civ.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold">{civ.name}</h4>
                    <p className="text-sm">{civ.leader}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`px-3 py-1 rounded-full text-white text-sm ${getRelationshipColor(relationships[civ.id] || '중립')}`}>
                    {relationships[civ.id] || '중립'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {getDiplomaticActions(civ).map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm transition"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">발견된 문명이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default DiplomacyManager; 