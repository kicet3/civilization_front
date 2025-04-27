import { HexTile, Unit, City } from '@/services/gameService';

// 캔버스 컨텍스트 타입 정의
type CanvasContext = CanvasRenderingContext2D;

// 육각형 그리드 그리기
export const drawHexGrid = (
  ctx: CanvasContext, 
  hexagons: HexTile[], 
  offset: { x: number, y: number }, 
  scale: number
) => {
  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(scale, scale);
  
  // 그리드 라인 스타일 설정
  ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
  ctx.lineWidth = 0.5;
  
  // 모든 육각형 타일 그리기
  hexagons.forEach(hex => {
    const { x, y } = calculateHexPosition(hex.q, hex.r, { x: 0, y: 0 }, 1);
    
    // 육각형 경로 그리기
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + Math.cos(angle) * 30;
      const py = y + Math.sin(angle) * 30;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.stroke();
  });
  
  ctx.restore();
};

// 육각형 타일 그리기
export const drawHexTile = (
  ctx: CanvasContext, 
  tile: HexTile, 
  position: { x: number, y: number }, 
  scale: number,
  isSelected: boolean
) => {
  const { x, y } = position;
  
  // 육각형 경로 생성
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = x + Math.cos(angle) * 30;
    const py = y + Math.sin(angle) * 30;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  
  // 지형에 따른 색상 설정
  let fillColor = '#8B8B8B'; // 기본 색상
  
  switch (tile.terrain) {
    case 'plains':
      fillColor = '#A9D751'; // 평지
      break;
    case 'grassland':
      fillColor = '#7ABD3E'; // 초원
      break;
    case 'desert':
      fillColor = '#E6C35C'; // 사막
      break;
    case 'mountain':
      fillColor = '#8B8B8B'; // 산악
      break;
    case 'hills':
      fillColor = '#A0522D'; // 언덕
      break;
    case 'forest':
      fillColor = '#2E8B57'; // 숲
      break;
    case 'ocean':
      fillColor = '#1E90FF'; // 바다
      break;
    case 'coast':
      fillColor = '#87CEEB'; // 해안
      break;
  }
  
  // 선택된 타일 강조
  if (isSelected) {
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
  }
  
  // 타일 채우기 및 테두리 그리기
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.stroke();
  
  // 자원 표시 (있는 경우)
  if (tile.resource) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tile.resource, x, y);
  }
};

// 유닛 그리기
export const drawUnit = (
  ctx: CanvasContext, 
  unit: Unit, 
  position: { x: number, y: number }, 
  scale: number
) => {
  const { x, y } = position;
  
  // 유닛 원 그리기
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  
  // 유닛 소유자에 따른 색상 설정
  let fillColor = '#FFFFFF'; // 기본 색상
  
  switch (unit.owner) {
    case 'player':
      fillColor = '#3498DB'; // 플레이어
      break;
    case 'enemy':
      fillColor = '#E74C3C'; // 적
      break;
    case 'neutral':
      fillColor = '#95A5A6'; // 중립
      break;
  }
  
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // 유닛 아이콘 또는 문자 표시
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 유닛 타입에 따른 아이콘
  let icon = '?';
  switch (unit.type) {
    case 'military':
      icon = '⚔️';
      break;
    case 'worker':
      icon = '🔨';
      break;
    case 'settler':
      icon = '🏠';
      break;
  }
  
  ctx.fillText(icon, x, y);
};

// 도시 그리기
export const drawCity = (
  ctx: CanvasContext, 
  city: City, 
  position: { x: number, y: number }, 
  scale: number
) => {
  const { x, y } = position;
  
  // 도시 아이콘 그리기 (건물 모양)
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x + 15, y + 10);
  ctx.lineTo(x - 15, y + 10);
  ctx.closePath();
  
  // 도시 소유자에 따른 색상 설정
  let fillColor = '#FFFFFF'; // 기본 색상
  
  switch (city.owner) {
    case 'player':
      fillColor = '#3498DB'; // 플레이어
      break;
    case 'enemy':
      fillColor = '#E74C3C'; // 적
      break;
    case 'neutral':
      fillColor = '#95A5A6'; // 중립
      break;
  }
  
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // 도시 이름 표시
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(city.name, x, y + 25);
};

// 유틸리티 함수들
const getHexPoints = (q: number, r: number, offset: Position, scale: number): Position[] => {
  const size = 30 * scale;
  const x = offset.x + size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const y = offset.y + size * (3/2 * r);

  return [
    { x: x + size * Math.cos(0), y: y + size * Math.sin(0) },
    { x: x + size * Math.cos(Math.PI / 3), y: y + size * Math.sin(Math.PI / 3) },
    { x: x + size * Math.cos(2 * Math.PI / 3), y: y + size * Math.sin(2 * Math.PI / 3) },
    { x: x + size * Math.cos(Math.PI), y: y + size * Math.sin(Math.PI) },
    { x: x + size * Math.cos(4 * Math.PI / 3), y: y + size * Math.sin(4 * Math.PI / 3) },
    { x: x + size * Math.cos(5 * Math.PI / 3), y: y + size * Math.sin(5 * Math.PI / 3) }
  ];
};

const getTerrainColor = (terrain: string): string => {
  const colors: { [key: string]: string } = {
    plains: '#90EE90',
    grassland: '#32CD32',
    desert: '#F4A460',
    tundra: '#E0FFFF',
    snow: '#FFFFFF',
    ocean: '#1E90FF',
    mountain: '#808080',
    forest: '#228B22'
  };
  return colors[terrain] || '#CCCCCC';
};

const getResourceColor = (resource: string): string => {
  const colors: { [key: string]: string } = {
    gold: '#FFD700',
    iron: '#A9A9A9',
    horses: '#8B4513',
    food: '#FFA500'
  };
  return colors[resource] || '#FFFFFF';
};

const getUnitIcon = (type: string): string => {
  const icons: { [key: string]: string } = {
    warrior: '⚔️',
    archer: '🏹',
    spearman: '🗡️',
    settler: '👥',
    builder: '🏗️'
  };
  return icons[type] || '❓';
}; 