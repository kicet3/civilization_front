import React, { useState, useCallback } from 'react';
import { Unit } from '@/services/gameService';
import UnitCard from '@/app/game/components/tabs/units/UnitCard';
import UnitCommandModal from '@/app/game/components/tabs/units/UnitCommandModal';

interface UnitPanelProps {
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
  onUnitCommand: (unit: Unit, command: string) => void;
}

const UnitPanel: React.FC<UnitPanelProps> = ({
  units,
  onSelectUnit,
  onUnitCommand
}) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showCommandModal, setShowCommandModal] = useState(false);

  const handleUnitClick = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
    onSelectUnit(unit);
  }, [onSelectUnit]);

  const handleCommandClick = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
    setShowCommandModal(true);
  }, []);

  const handleCommandSubmit = useCallback((command: string) => {
    if (selectedUnit) {
      onUnitCommand(selectedUnit, command);
      setShowCommandModal(false);
    }
  }, [selectedUnit, onUnitCommand]);

  return (
    <div className="flex flex-col h-full bg-slate-800 p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">유닛 관리</h2>
        <p className="text-slate-400">보유 유닛: {units.length}개</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {units.map(unit => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onClick={() => handleUnitClick(unit)}
            onCommandClick={() => handleCommandClick(unit)}
          />
        ))}
      </div>

      {showCommandModal && selectedUnit && (
        <UnitCommandModal
          unit={selectedUnit}
          isOpen={showCommandModal}
          onClose={() => setShowCommandModal(false)}
          onCommand={handleCommandSubmit}
        />
      )}
    </div>
  );
};

export default UnitPanel; 