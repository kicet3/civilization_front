import React from 'react';
import { useGame } from '../../context/GameContext';
import { Sword, Clock } from 'lucide-react';

interface TurnTabProps {
  onEndTurn: () => Promise<void>;
}

export default function TurnTab({ onEndTurn }: TurnTabProps) {
  const { gameState, isLoading } = useGame();
  
  // 시대 결정 함수
  const getEra = (year: number): { era: string, koreanEra: string } => {
    if (year < 1300) {
      return { era: 'Medieval', koreanEra: '중세' };
    } else if (year < 1900) {
      return { era: 'Industrial', koreanEra: '산업' };
    } else {
      return { era: 'Modern', koreanEra: '현대' };
    }
  };

  // 연도 표시 형식 개선
  const formatYear = (year: number): string => {
    if (year < 0) {
      return `BC ${Math.abs(year)}년`;
    } else {
      return `AD ${year}년`;
    }
  };

  // 턴당 지나는 시간 계산 (현재 시대에 따라 다름)
  const getYearsPerTurn = (era: string): number => {
    switch (era) {
      case 'Medieval': return 20; // 중세시대는 턴당 20년
      case 'Industrial': return 10; // 산업시대는 턴당 10년
      case 'Modern': return 5; // 현대시대는 턴당 5년
      default: return 20;
    }
  };

  const year = gameState?.year || 0;
  const { era, koreanEra } = getEra(year);
  const yearsPerTurn = getYearsPerTurn(era);
  
  const handleEndTurn = async () => {
    if (isLoading) return;
    await onEndTurn();
  };
  
  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6">턴 관리</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-md">
          <h3 className="text-xl mb-4">현재 턴 정보</h3>
          <div className="space-y-3 mb-6">
            <p className="flex justify-between">
              <span>턴 번호:</span>
              <span className="font-bold">{gameState?.turn || 1}</span>
            </p>
            <p className="flex justify-between">
              <span>년도:</span>
              <span className="font-bold">{formatYear(year)}</span>
            </p>
            <p className="flex justify-between">
              <span>현재 시대:</span>
              <span className="font-bold text-indigo-400">{koreanEra}</span>
            </p>
            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center text-slate-400 text-sm mb-1">
                <Clock size={16} className="mr-1" />
                <span>턴당 {yearsPerTurn}년씩 진행됩니다.</span>
              </div>
              <div className="text-slate-400 text-sm">
                <span>다음 턴: {formatYear(year + yearsPerTurn)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={handleEndTurn}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sword className="mr-2" size={20} />
              <span className="font-bold">턴 종료</span>
            </button>
            {isLoading && (
              <p className="text-center mt-2 text-slate-400">처리 중...</p>
            )}
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-md">
          <h3 className="text-xl mb-4">이벤트</h3>
          <div className="h-64 overflow-y-auto bg-slate-900 p-3 rounded-md">
            <p className="text-gray-400">이번 턴에는 특별한 이벤트가 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 