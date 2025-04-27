import React from 'react';
import HexMap from './map/HexMap';
import { HexTile } from '@/types/game';

interface MapTabProps {
  hexagons: HexTile[];
  selectedTile: HexTile | null;
  onTileClick: (tile: HexTile) => void;
  onUnitClick: (unit: any) => void;
  onCityClick: (city: any) => void;
}

const MapTab: React.FC<MapTabProps> = ({
  hexagons,
  selectedTile,
  onTileClick,
  onUnitClick,
  onCityClick
}) => {
  return (
    <div className="h-full">
      <HexMap
        hexagons={hexagons}
        selectedTile={selectedTile}
        onTileClick={onTileClick}
        onUnitClick={onUnitClick}
        onCityClick={onCityClick}
      />
    </div>
  );
};

export default MapTab; 