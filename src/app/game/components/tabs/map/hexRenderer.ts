import { HexTile, Unit, City } from '@/types/game';
import { calculateHexPosition } from './hexUtils';

// 캔버스 컨텍스트 타입 정의
type CanvasContext = CanvasRenderingContext2D;
type Position = { x: number, y: number };

// 육각형 그리드 그리기
export const drawHexGrid = (
  ctx: CanvasContext, 
  hexagons: HexTile[], 
  offset: { x: number, y: number }, 
  scale: number
) => {
  ctx.save();
  ctx.translate(offset.x, offset.y);
  
  // 그리드 라인 스타일 설정
  ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
  ctx.lineWidth = 0.5 * scale;
  
  // 모든 육각형 타일 그리기
  hexagons.forEach(hex => {
    const { x, y } = calculateHexPosition(hex.q, hex.r, { x: 0, y: 0 }, scale);
    
    // 육각형 경로 그리기
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + Math.cos(angle) * 30 * scale;
      const py = y + Math.sin(angle) * 30 * scale;
      
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
  isSelected: boolean,
  isHovered: boolean = false
) => {
  const { x, y } = position;
  
  // 육각형 경로 생성
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = x + Math.cos(angle) * 30 * scale;
    const py = y + Math.sin(angle) * 30 * scale;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  
  // 탐험 상태에 따른 타일 렌더링
  if (tile.exploration === 'unexplored') {
    // 미탐색 지역 - 검은색으로 표시
    ctx.fillStyle = '#000000';
    ctx.fill();
    
    // 테두리
    ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
    ctx.lineWidth = 0.5 * scale;
    ctx.stroke();
    
    return; // 미탐색 지역은 여기에서 렌더링 종료
  }
  
  // 지형에 따른 색상 설정
  let fillColor = '#8B8B8B'; // 기본 색상
  
  switch (tile.terrain) {
    case 'Plains':
    case 'plains':
      fillColor = '#A9D751'; // 평지
      break;
    case 'Grassland':
    case 'grassland':
      fillColor = '#7ABD3E'; // 초원
      break;
    case 'Desert':
    case 'desert':
      fillColor = '#E6C35C'; // 사막
      break;
    case 'Mountain':
    case 'mountain':
      fillColor = '#8B8B8B'; // 산악
      break;
    case 'Hills':
    case 'hills':
      fillColor = '#A0522D'; // 언덕
      break;
    case 'Forest':
    case 'forest':
      fillColor = '#2E8B57'; // 숲
      break;
    case 'Ocean':
    case 'ocean':
      fillColor = '#1E90FF'; // 바다
      break;
    case 'Coast':
    case 'coast':
      fillColor = '#87CEEB'; // 해안
      break;
  }
  
  // 탐험 상태에 따른 색상 처리
  if (tile.exploration === 'explored') {
    // 탐색했지만 현재 시야에는 없는 지역 - 회색으로 어둡게 표시
    fillColor = darkenColor(fillColor, 40);
  }
  
  // 타일 채우기 - 호버/선택 시 밝게 표시
  if (isHovered) {
    // 호버 상태: 약간 밝게
    ctx.fillStyle = lightenColor(fillColor, 20);
  } else if (isSelected) {
    // 선택 상태: 더 밝게
    ctx.fillStyle = lightenColor(fillColor, 40);
  } else {
    ctx.fillStyle = fillColor;
  }
  ctx.fill();
  
  // 테두리 그리기
  if (isSelected) {
    ctx.strokeStyle = '#FFFF00'; // 노란색 테두리
    ctx.lineWidth = 2 * scale;
  } else if (isHovered) {
    ctx.strokeStyle = '#FFFFFF'; // 흰색 테두리
    ctx.lineWidth = 1.5 * scale;
  } else {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1 * scale;
  }
  ctx.stroke();
  
  // 자원 표시 (있는 경우 & 시야가 있는 경우에만)
  if (tile.resource && tile.resource !== 'NoResource' && tile.exploration === 'visible') {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${12 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 자원 아이콘
    let resourceIcon = '💎';
    switch (tile.resource) {
      case 'Food':
      case 'food':
        resourceIcon = '🌽';
        break;
      case 'Production':
      case 'production':
        resourceIcon = '⚒️';
        break;
      case 'Gold':
      case 'gold':
        resourceIcon = '💰';
        break;
      case 'Science':
      case 'science':
        resourceIcon = '🔬';
        break;
    }
    
    ctx.fillText(resourceIcon, x, y);
  }
};

// 색상 밝게 만드는 함수
function lightenColor(color: string, amount: number): string {
  // 색상이 RGB 포맷이라면 (예: #8B8B8B)
  if (color.startsWith('#')) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // 색상이 rgba 포맷이라면
  if (color.startsWith('rgba')) {
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (rgbaMatch) {
      const r = Math.min(255, parseInt(rgbaMatch[1]) + amount);
      const g = Math.min(255, parseInt(rgbaMatch[2]) + amount);
      const b = Math.min(255, parseInt(rgbaMatch[3]) + amount);
      const a = rgbaMatch[4];
      
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }
  
  // 다른 포맷이거나 변환이 실패하면 원래 색상 반환
  return color;
}

// 색상 어둡게 만드는 함수
function darkenColor(color: string, amount: number): string {
  // 색상이 RGB 포맷이라면 (예: #8B8B8B)
  if (color.startsWith('#')) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // 색상이 rgba 포맷이라면
  if (color.startsWith('rgba')) {
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (rgbaMatch) {
      const r = Math.max(0, parseInt(rgbaMatch[1]) - amount);
      const g = Math.max(0, parseInt(rgbaMatch[2]) - amount);
      const b = Math.max(0, parseInt(rgbaMatch[3]) - amount);
      const a = rgbaMatch[4];
      
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }
  
  // 다른 포맷이거나 변환이 실패하면 원래 색상 반환
  return color;
}

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
  city: { name: string; owner: string; population?: number; id?: number }, 
  position: { x: number, y: number }, 
  scale: number
) => {
  const { x, y } = position;
  
  // 도시 아이콘 그리기 (건물 모양)
  ctx.beginPath();
  ctx.moveTo(x, y - 20 * scale);
  ctx.lineTo(x + 15 * scale, y + 10 * scale);
  ctx.lineTo(x - 15 * scale, y + 10 * scale);
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
  ctx.font = `${12 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(city.name, x, y + 25 * scale);
  
  // 인구 표시
  if (city.population) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${8 * scale}px Arial`;
    ctx.fillText(`인구: ${city.population}`, x, y + 35 * scale);
  }
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