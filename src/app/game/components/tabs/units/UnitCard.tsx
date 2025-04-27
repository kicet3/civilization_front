import React, { memo } from 'react';
import { Unit } from '@/services/gameService';

interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
  onCommandClick: () => void;
}

const UnitCard: React.FC<UnitCardProps> = memo(({
  unit,
  onClick,
  onCommandClick
}) => {
  return (
    <div 
      className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-white">{unit.name}</h3>
        <span className="text-sm text-slate-300">레벨 {unit.level}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">체력:</span>
          <span className="text-white">{unit.health}/{unit.maxHealth}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">공격력:</span>
          <span className="text-white">{unit.attack}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">방어력:</span>
          <span className="text-white">{unit.defense}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">이동력:</span>
          <span className="text-white">{unit.movement}</span>
        </div>
      </div>

      <button
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onCommandClick();
        }}
      >
        명령
      </button>
    </div>
  );
});

UnitCard.displayName = 'UnitCard';

export default UnitCard; 