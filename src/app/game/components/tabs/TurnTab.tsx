import React from 'react';
import { TurnPhase } from '@/types/game';

interface TurnTabProps {
  currentTurn: number;
  currentPhase: TurnPhase;
  onEndTurn: () => void;
  onNextPhase: () => void;
}

const TurnTab: React.FC<TurnTabProps> = ({
  currentTurn,
  currentPhase,
  onEndTurn,
  onNextPhase
}) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">턴 {currentTurn}</h2>
        <span className="text-sm text-gray-600">단계: {currentPhase}</span>
      </div>
      <div className="flex gap-4">
        <button
          onClick={onNextPhase}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다음 단계
        </button>
        <button
          onClick={onEndTurn}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          턴 종료
        </button>
      </div>
    </div>
  );
};

export default TurnTab; 