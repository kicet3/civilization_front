import React, { useEffect, useRef, useState } from 'react';
import { HexTile, Unit } from '@/types/game';
import gameService from '@/services/gameService';
import { drawHexGrid, drawHexTile, drawUnit, drawCity } from './hexRenderer';
import { calculateHexPosition, getHexAtPoint } from './hexUtils';

interface HexMapProps {
  gameId: string;
  selectedTile: HexTile | null;
  onTileClick: (tile: HexTile) => void;
  onUnitMove: (unit: Unit, q: number, r: number) => void;
}

const HexMap: React.FC<HexMapProps> = ({
  gameId,
  selectedTile,
  onTileClick,
  onUnitMove
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapData, setMapData] = useState<HexTile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // 맵 데이터 로드
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const response = await gameService.getMap();
        setMapData(response.data.hexagons);
      } catch (error) {
        console.error('맵 데이터 로드 실패:', error);
      }
    };

    loadMapData();
  }, [gameId]);

  // 캔버스 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mapData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 그리드 그리기
    drawHexGrid(ctx, mapData, offset, scale);

    // 타일 그리기
    mapData.forEach(tile => {
      const position = calculateHexPosition(tile.q, tile.r, offset, scale);
      drawHexTile(ctx, tile, position, scale, selectedTile?.id === tile.id);
    });

    // 유닛과 도시 그리기
    mapData.forEach(tile => {
      const position = calculateHexPosition(tile.q, tile.r, offset, scale);
      if (tile.unit) {
        drawUnit(ctx, tile.unit, position, scale);
      }
      if (tile.city) {
        drawCity(ctx, tile.city, position, scale);
      }
    });
  }, [mapData, selectedTile, offset, scale]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 2));
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hex = getHexAtPoint(x, y, mapData, offset, scale);
    if (hex) {
      onTileClick(hex);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    />
  );
};

export default HexMap; 