import React from 'react';
import { Unit } from '@/types/game';
import UnitPanel from './units/UnitPanel';

interface UnitsTabProps {
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
  onUnitCommand: (unit: Unit, command: string) => void;
}

const UnitsTab: React.FC<UnitsTabProps> = ({
  units,
  onSelectUnit,
  onUnitCommand
}) => {
  return (
    <div className="h-full">
      <UnitPanel
        units={units}
        onSelectUnit={onSelectUnit}
        onUnitCommand={onUnitCommand}
      />
    </div>
  );
};

export default UnitsTab; 