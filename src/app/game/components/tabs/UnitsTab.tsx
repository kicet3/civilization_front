import React from 'react';
import UnitPanel from '../unit-management/UnitPanel';
import { Unit } from '@/services/gameService';

interface UnitsTabProps {
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
  onUnitCommand: (unit: Unit, command: string) => void;
}

export default function UnitsTab({
  units,
  onSelectUnit,
  onUnitCommand
}: UnitsTabProps) {
  return (
    <UnitPanel 
      units={units}
      onSelectUnit={onSelectUnit}
      onUnitCommand={onUnitCommand}
    />
  );
} 