import React from 'react';
import { useGame } from '../../context/GameContext';
import { Sword } from 'lucide-react';

interface TurnTabProps {
  onEndTurn: () => Promise<void>;
}

export default function TurnTab({ onEndTurn }: TurnTabProps) {
  const { gameState, isLoading } = useGame();
  
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
          <div className="space-y-2 mb-6">
            <p className="flex justify-between">
              <span>턴 번호:</span>
              <span className="font-bold">{gameState?.turn || 1}</span>
            </p>
            <p className="flex justify-between">
              <span>년도:</span>
              <span className="font-bold">
                {gameState?.year && gameState.year < 0 
                  ? `BC ${Math.abs(gameState.year)}` 
                  : `AD ${gameState?.year || 0}`}
              </span>
            </p>
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