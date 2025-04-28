import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HexTile, Unit, City } from '@/types/game';
import { drawHexGrid, drawHexTile, drawUnit, drawCity } from './hexRenderer';
import { calculateHexPosition, getHexAtPoint } from './hexUtils';

interface HexMapProps {
  hexagons: HexTile[];
  selectedTile: HexTile | null;
  onTileClick: (tile: HexTile) => void;
  onUnitClick?: (unit: Unit) => void;
  onCityClick?: (city: any) => void;
}

const HexMap: React.FC<HexMapProps> = ({
  hexagons,
  selectedTile,
  onTileClick,
  onUnitClick,
  onCityClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  // 디버깅용 로그
  console.log("HexMap 마운트됨, hexagons 길이:", hexagons.length);
  
  // 호버 상태 관리
  const [hoveredTile, setHoveredTile] = useState<HexTile | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 윈도우 크기 변경 감지 및 캔버스 크기 조정
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      console.log("캔버스 크기 조정:", container.clientWidth, container.clientHeight);
      
      // 컨테이너 크기에 맞게 캔버스 크기 조정
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // 맵 중앙 위치 계산을 위한 로직
      if (hexagons.length > 0) {
        // 맵의 중심점 계산 (모든 타일의 평균 위치)
        const centerQ = hexagons.reduce((sum, hex) => sum + hex.q, 0) / hexagons.length;
        const centerR = hexagons.reduce((sum, hex) => sum + hex.r, 0) / hexagons.length;
        
        console.log("맵 중심점 계산:", centerQ, centerR);
        
        // 중심점을 캔버스 중심에 위치시키기
        const centerPos = calculateHexPosition(centerQ, centerR, { x: 0, y: 0 }, 1);
        console.log("중심점 위치:", centerPos);
        
        setOffset({
          x: canvas.width / 2 - centerPos.x * scale,
          y: canvas.height / 2 - centerPos.y * scale
        });
      }
      
      // 맵 다시 그리기
      renderMap();
    };

    // 초기 렌더링 및 윈도우 크기 변경 이벤트 리스너 등록
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [hexagons, scale]);

  // 키보드 이벤트 핸들러 등록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 방향키 이동 (화살표키)
      const moveSpeed = 30; // 이동 속도
      
      switch (e.key) {
        case 'ArrowUp':
          setOffset(prev => ({ ...prev, y: prev.y + moveSpeed }));
          break;
        case 'ArrowDown':
          setOffset(prev => ({ ...prev, y: prev.y - moveSpeed }));
          break;
        case 'ArrowLeft':
          setOffset(prev => ({ ...prev, x: prev.x + moveSpeed }));
          break;
        case 'ArrowRight':
          setOffset(prev => ({ ...prev, x: prev.x - moveSpeed }));
          break;
        // +/- 확대/축소 (Numpad와 일반 키보드 모두 지원)
        case '+':
        case '=': // 일반 키보드에서 + 는 Shift+= 이므로
          zoomMap(1.1);
          break;
        case '-':
          zoomMap(0.9);
          break;
      }
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('keydown', handleKeyDown);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scale]); // scale이 변경될 때마다 이벤트 핸들러 갱신

  // 확대/축소 함수
  const zoomMap = useCallback((factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const oldScale = scale;
    const newScale = Math.min(Math.max(scale * factor, 0.5), 2);
    
    if (oldScale !== newScale) {
      // 캔버스의 중심을 기준으로 확대/축소
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      setScale(newScale);
      setOffset(prev => ({
        x: centerX - (centerX - prev.x) * (newScale / oldScale),
        y: centerY - (centerY - prev.y) * (newScale / oldScale)
      }));
    }
  }, [scale]);

  // 캔버스 렌더링 함수
  const renderMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || hexagons.length === 0) {
      console.log("렌더링 중단: 캔버스가 없거나 hexagons가 비어 있음", !!canvas, hexagons.length);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log("렌더링 중단: 2D 컨텍스트를 가져올 수 없음");
      return;
    }

    console.log("맵 렌더링 시작. hexagons:", hexagons.length, "offset:", offset, "scale:", scale);
    
    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 그리드 그리기
    drawHexGrid(ctx, hexagons, offset, scale);

    // 타일 그리기
    hexagons.forEach(tile => {
      const position = calculateHexPosition(tile.q, tile.r, offset, scale);
      const isSelected = selectedTile?.q === tile.q && selectedTile?.r === tile.r;
      const isHovered = hoveredTile?.q === tile.q && hoveredTile?.r === tile.r;
      drawHexTile(ctx, tile, position, scale, isSelected, isHovered);
    });

    // 유닛과 도시 그리기
    hexagons.forEach(tile => {
      const position = calculateHexPosition(tile.q, tile.r, offset, scale);
      
      // 시야가 있는 타일에만 유닛과 도시 표시
      if (tile.exploration === 'visible') {
         if (tile.unit) {
          drawUnit(ctx, tile.unit, position, scale);
        }
        if (tile.city) {
          // 도시가 있으면 도시를 더 강조해서 그림 (예: 테두리, 오버레이 등)
          drawCity(ctx, tile.city, position, scale);
          // 도시 강조: 원형 테두리 추가
          ctx.save();
          ctx.beginPath();
          ctx.arc(position.x, position.y, 22 * scale, 0, 2 * Math.PI);
          ctx.strokeStyle = '#FFD700'; // 금색
          ctx.lineWidth = 3 * scale;
          ctx.globalAlpha = 0.7;
          ctx.stroke();
          ctx.restore();
        }
      } 
      // 탐색된 타일에는 도시만 표시 (유닛은 표시하지 않음)
      else if (tile.exploration === 'explored' && tile.city) {
        drawCity(ctx, tile.city, position, scale);
      }
    });
    
    console.log("맵 렌더링 완료");
  }, [hexagons, selectedTile, hoveredTile, offset, scale]);

  // 맵 데이터나 선택된 타일, 오프셋, 스케일이 변경될 때마다 렌더링
  useEffect(() => {
    console.log("렌더링 효과 트리거됨");
    renderMap();
  }, [renderMap]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 드래그 중이면 맵 이동
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // 마우스 아래에 있는 타일 찾기
    const hex = getHexAtPoint(x, y, hexagons, offset, scale);
    if (hex) {
      setHoveredTile(hex);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredTile(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredTile(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hex = getHexAtPoint(x, y, hexagons, offset, scale);
    if (hex) {
      // 도시가 있는 타일을 클릭하면 onCityClick 호출
      if (hex.city && onCityClick) {
        onCityClick(hex.city);
      } else {
        onTileClick(hex);
      }
    }
  };
  
  // 타일 정보 툴팁 렌더링
  const renderTooltip = () => {
    if (!hoveredTile) return null;
    
    // 미탐색 지역일 경우 간단한 정보만 표시
    if (hoveredTile.exploration === 'unexplored') {
      return (
        <div 
          className="absolute bg-slate-800 text-white p-2 rounded shadow-lg z-50 text-sm"
          style={{ 
            left: tooltipPosition.x + 10, 
            top: tooltipPosition.y + 10,
            pointerEvents: 'none'
          }}
        >
          <div className="font-bold">미탐색 지역 ({hoveredTile.q}, {hoveredTile.r})</div>
          <div className="text-gray-400">이 지역은 아직 탐험되지 않았습니다.</div>
        </div>
      );
    }
    
    // 탐색했지만 현재 시야에 없는 지역
    if (hoveredTile.exploration === 'explored') {
      return (
        <div 
          className="absolute bg-slate-800 text-white p-2 rounded shadow-lg z-50 text-sm"
          style={{ 
            left: tooltipPosition.x + 10, 
            top: tooltipPosition.y + 10,
            pointerEvents: 'none'
          }}
        >
          <div className="font-bold border-b border-gray-600 pb-1 mb-1">
            {hoveredTile.terrain} ({hoveredTile.q}, {hoveredTile.r})
          </div>
          
          {hoveredTile.city && (
            <div className="mt-1 border-t border-gray-600 pt-1">
              <div className="font-bold">{hoveredTile.city.name}</div>
              <div>소유: {hoveredTile.city.owner}</div>
            </div>
          )}
          
          <div className="text-gray-400 mt-1">
            <em>이 지역은 탐험됐지만 현재 시야 밖에 있습니다.</em>
          </div>
        </div>
      );
    }
    
    // 현재 시야에 있는 지역 (모든 정보 표시)
    return (
      <div 
        className="absolute bg-slate-800 text-white p-2 rounded shadow-lg z-50 text-sm"
        style={{ 
          left: tooltipPosition.x + 10, 
          top: tooltipPosition.y + 10,
          pointerEvents: 'none'
        }}
      >
        <div className="font-bold border-b border-gray-600 pb-1 mb-1">
          {hoveredTile.terrain} ({hoveredTile.q}, {hoveredTile.r})
        </div>
        
        {hoveredTile.resource && hoveredTile.resource !== 'NoResource' && (
          <div className="flex items-center gap-1 my-1">
            <span>자원:</span>
            <span className="font-bold">{hoveredTile.resource}</span>
          </div>
        )}
        
        {hoveredTile.city && (
          <div className="mt-1 border-t border-gray-600 pt-1">
            <div className="font-bold">{hoveredTile.city.name}</div>
            <div>인구: {hoveredTile.city.population}</div>
            <div>소유: {hoveredTile.city.owner}</div>
          </div>
        )}
        
        {hoveredTile.unit && (
          <div className="mt-1 border-t border-gray-600 pt-1">
            <div className="font-bold">{hoveredTile.unit.typeName}</div>
            <div>소유: {hoveredTile.unit.owner}</div>
            <div>이동력: {hoveredTile.unit.movement}/{hoveredTile.unit.maxMovement}</div>
          </div>
        )}
      </div>
    );
  };

  // 조작 가이드
  const renderControlGuide = () => {
    return (
      <div className="absolute bottom-4 right-4 bg-slate-800 bg-opacity-75 text-white p-2 rounded text-sm">
        <div className="font-bold mb-1">조작 방법</div>
        <div>이동: 방향키 ↑↓←→</div>
        <div>확대: +</div>
        <div>축소: -</div>
        <div>드래그: 마우스 클릭 + 이동</div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        tabIndex={0} // 키보드 이벤트를 받을 수 있도록 tabIndex 설정
      />
      {renderTooltip()}
      {renderControlGuide()}
    </div>
  );
};

export default HexMap; 