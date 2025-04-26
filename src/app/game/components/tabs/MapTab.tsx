import React from 'react';
import HexMap from '../map-management/HexMap';
import { HexTile, Unit } from '@/services/gameService';

interface MapTabProps {
  gameId: string;
  selectedTile: HexTile | null;
  onTileClick: (tile: HexTile) => void;
  onUnitMove: (unit: Unit, q: number, r: number) => void;
}

export default function MapTab({
  gameId,
  selectedTile,
  onTileClick,
  onUnitMove
}: MapTabProps) {
  return (
    <HexMap 
      gameId={gameId}
      onTileClick={onTileClick}
      selectedTile={selectedTile}
      onUnitMove={onUnitMove}
    />
  );
} 