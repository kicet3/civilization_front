import React, { memo } from 'react';
import { Unit } from '@/services/gameService';

interface UnitCommandModalProps {
  unit: Unit;
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

const UnitCommandModal: React.FC<UnitCommandModalProps> = memo(({
  unit,
  isOpen,
  onClose,
  onCommand
}) => {
  if (!isOpen) return null;

  const commands = [
    { id: 'move', label: '이동' },
    { id: 'attack', label: '공격' },
    { id: 'fortify', label: '요새화' },
    { id: 'sleep', label: '휴식' },
    { id: 'wake', label: '깨어남' },
    { id: 'delete', label: '해체' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{unit.name} 명령</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {commands.map((command) => (
            <button
              key={command.id}
              onClick={() => onCommand(command.id)}
              className="w-full bg-slate-700 text-white py-2 px-4 rounded hover:bg-slate-600 transition-colors"
            >
              {command.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

UnitCommandModal.displayName = 'UnitCommandModal';

export default UnitCommandModal; 