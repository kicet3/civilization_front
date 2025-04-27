import React, { useState, useEffect } from 'react';
import { GameState } from '@/types/game';

interface ResourcesTabProps {
  gameState: GameState;
}

type ResourceKey = 'food' | 'production' | 'gold' | 'science' | 'culture' | 'faith' | 'happiness';

type ResourcesState = {
  [key in ResourceKey]: number;
};

type ProductionState = {
  [key in ResourceKey]: {
    produced: number;
    consumed: number;
  };
};

const ResourcesTab: React.FC<ResourcesTabProps> = ({ gameState }) => {
  const [resources, setResources] = useState<ResourcesState>({
    food: 0,
    production: 0,
    gold: 0,
    science: 0,
    culture: 0,
    faith: 0,
    happiness: 0
  });

  // 자원 생산량과 소비량 계산
  const [production, setProduction] = useState<ProductionState>({
    food: { produced: 0, consumed: 0 },
    production: { produced: 0, consumed: 0 },
    gold: { produced: 0, consumed: 0 },
    science: { produced: 0, consumed: 0 },
    culture: { produced: 0, consumed: 0 },
    faith: { produced: 0, consumed: 0 },
    happiness: { produced: 0, consumed: 0 }
  });

  useEffect(() => {
    if (gameState?.resources) {
      setResources(gameState.resources);

      // 실제 게임 로직에서는 이 부분을 도시, 타일, 건물, 유닛 등에 따라 계산합니다
      // 여기서는 데모 데이터만 설정합니다
      const cities = gameState.cities || [];
      const totalPopulation = cities.reduce((total: number, city) => total + (city.population || 0), 0);
      
      setProduction({
        food: { 
          produced: cities.reduce((total: number, city) => total + (city.food || 0), 0), 
          consumed: totalPopulation * 2 
        },
        production: { 
          produced: cities.reduce((total: number, city) => total + (city.production || 0), 0), 
          consumed: 0 
        },
        gold: { 
          produced: cities.reduce((total: number, city) => total + (city.gold || 0), 0), 
          consumed: gameState.units?.length * 1 || 0 
        },
        science: { 
          produced: Math.floor(totalPopulation * 1.5), 
          consumed: 0 
        },
        culture: { 
          produced: cities.reduce((total: number, city) => total + (city.culture || 0), 0), 
          consumed: 0 
        },
        faith: { 
          produced: cities.reduce((total: number, city) => total + (city.faith || 0), 0), 
          consumed: 0 
        },
        happiness: { 
          produced: 10, 
          consumed: totalPopulation 
        }
      });
    }
  }, [gameState]);

  const resourceColors: Record<ResourceKey, string> = {
    food: 'bg-green-400',
    production: 'bg-red-400',
    gold: 'bg-yellow-400',
    science: 'bg-blue-400',
    culture: 'bg-purple-400',
    faith: 'bg-indigo-400',
    happiness: 'bg-pink-400'
  };

  const resourceNames: Record<ResourceKey, string> = {
    food: '식량',
    production: '생산력',
    gold: '금',
    science: '과학',
    culture: '문화',
    faith: '신앙',
    happiness: '행복도'
  };

  const resourceIcons: Record<ResourceKey, string> = {
    food: '🌾',
    production: '⚒️',
    gold: '💰',
    science: '🔬',
    culture: '🎭',
    faith: '⛪',
    happiness: '😊'
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-6">자원 관리</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(resources) as ResourceKey[]).map((key) => (
          <div key={key} className="bg-slate-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center mb-2">
              <div className={`${resourceColors[key]} w-10 h-10 rounded-full flex items-center justify-center text-white mr-3`}>
                <span className="text-lg">{resourceIcons[key]}</span>
              </div>
              <h3 className="text-lg font-semibold">{resourceNames[key]}</h3>
              <span className="ml-auto text-xl font-bold">{resources[key]}</span>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-green-400">생산</span>
                <span>+{production[key].produced}/턴</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-red-400">소비</span>
                <span>-{production[key].consumed}/턴</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-slate-700">
                <span>순 수익</span>
                <span className={production[key].produced - production[key].consumed > 0 ? 'text-green-400' : 'text-red-400'}>
                  {production[key].produced - production[key].consumed > 0 ? '+' : ''}
                  {production[key].produced - production[key].consumed}/턴
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">자원 설명</h3>
        <ul className="space-y-2">
          <li><span className="font-bold text-green-400">식량</span>: 도시 성장에 필요합니다. 식량이 부족하면 인구가 감소합니다.</li>
          <li><span className="font-bold text-red-400">생산력</span>: 건물과 유닛 생산 속도를 결정합니다.</li>
          <li><span className="font-bold text-yellow-400">금</span>: 건물 유지, 유닛 유지, 외교 등에 사용됩니다.</li>
          <li><span className="font-bold text-blue-400">과학</span>: 새로운 기술 연구 속도를 결정합니다.</li>
          <li><span className="font-bold text-purple-400">문화</span>: 정책과 사회 제도 발전에 필요합니다.</li>
          <li><span className="font-bold text-indigo-400">신앙</span>: 종교 설립과 종교적 유닛 구매에 사용됩니다.</li>
          <li><span className="font-bold text-pink-400">행복도</span>: 도시 성장과 제국 확장에 영향을 줍니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default ResourcesTab; 