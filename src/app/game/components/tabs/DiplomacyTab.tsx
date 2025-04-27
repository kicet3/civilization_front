import React from 'react';
import { useGame } from '../../context/GameContext';
import { Globe, MessageSquare, ExternalLink, HelpCircle } from 'lucide-react';
import { Civilization } from '@/types/game';

export default function DiplomacyTab() {
  const { gameState, isLoading } = useGame();
  
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
                    <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
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
        
        <div>
          <h3 className="text-xl mb-4">외교 상태</h3>
          <div className="bg-slate-800 p-4 rounded-md">
            <p className="text-center text-slate-400">문명을 선택하여 외교 관계를 관리하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 