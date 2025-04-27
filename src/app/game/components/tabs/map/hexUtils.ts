import { HexTile } from '@/services/gameService';

// 육각형 크기 상수
const HEX_SIZE = 30; // 육각형의 반지름

// 육각형 위치 계산 함수
export const calculateHexPosition = (
  q: number, 
  r: number, 
  offset: { x: number, y: number }, 
  scale: number
): { x: number, y: number } => {
  // 큐브 좌표를 픽셀 좌표로 변환
  const x = (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r) * HEX_SIZE * scale + offset.x;
  const y = (3 / 2 * r) * HEX_SIZE * scale + offset.y;
  
  return { x, y };
};

// 육각형 포인트 계산 함수
export const getHexPoints = (
  q: number, 
  r: number, 
  offset: { x: number, y: number }, 
  scale: number
): { x: number, y: number }[] => {
  const center = calculateHexPosition(q, r, offset, scale);
  const points: { x: number, y: number }[] = [];
  
  // 육각형의 6개 꼭지점 계산
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    points.push({
      x: center.x + Math.cos(angle) * HEX_SIZE * scale,
      y: center.y + Math.sin(angle) * HEX_SIZE * scale
    });
  }
  
  return points;
};

// 지형 색상 반환 함수
export const getTerrainColor = (terrain: string): string => {
  switch (terrain) {
    case 'plains':
      return '#A9D751'; // 평지
    case 'grassland':
      return '#7ABD3E'; // 초원
    case 'desert':
      return '#E6C35C'; // 사막
    case 'mountain':
      return '#8B8B8B'; // 산악
    case 'hills':
      return '#A0522D'; // 언덕
    case 'forest':
      return '#2E8B57'; // 숲
    case 'ocean':
      return '#1E90FF'; // 바다
    case 'coast':
      return '#87CEEB'; // 해안
    default:
      return '#8B8B8B'; // 기본 색상
  }
};

// 자원 색상 반환 함수
export const getResourceColor = (resource: string): string => {
  switch (resource) {
    case 'iron':
      return '#A9A9A9'; // 철
    case 'gold':
      return '#FFD700'; // 금
    case 'horses':
      return '#8B4513'; // 말
    case 'wheat':
      return '#F4A460'; // 밀
    case 'oil':
      return '#000000'; // 석유
    default:
      return '#FFFFFF'; // 기본 색상
  }
};

// 유닛 아이콘 반환 함수
export const getUnitIcon = (type: string): string => {
  switch (type) {
    case 'military':
      return '⚔️';
    case 'worker':
      return '🔨';
    case 'settler':
      return '🏠';
    default:
      return '?';
  }
};

// 클릭한 위치의 육각형 찾기
export const getHexAtPoint = (
  x: number, 
  y: number, 
  hexagons: HexTile[], 
  offset: { x: number, y: number }, 
  scale: number
): HexTile | null => {
  // 클릭 좌표를 육각형 좌표로 변환
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / (HEX_SIZE * scale);
  const r = (2 / 3 * y) / (HEX_SIZE * scale);
  
  // 가장 가까운 육각형 찾기
  let closestHex: HexTile | null = null;
  let minDistance = Infinity;
  
  hexagons.forEach(hex => {
    const hexPos = calculateHexPosition(hex.q, hex.r, offset, scale);
    const distance = Math.sqrt(
      Math.pow(x - hexPos.x, 2) + Math.pow(y - hexPos.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestHex = hex;
    }
  });
  
  // 일정 거리 내에 있는 경우에만 반환
  return minDistance < HEX_SIZE * scale ? closestHex : null;
};

// 인접한 육각형 찾기
export const getAdjacentHexes = (
  q: number, 
  r: number, 
  hexagons: HexTile[]
): HexTile[] => {
  // 육각형의 6개 방향
  const directions = [
    { q: 1, r: 0, s: -1 },  // 동쪽
    { q: 1, r: -1, s: 0 },  // 북동쪽
    { q: 0, r: -1, s: 1 },  // 북서쪽
    { q: -1, r: 0, s: 1 },  // 서쪽
    { q: -1, r: 1, s: 0 },  // 남서쪽
    { q: 0, r: 1, s: -1 }   // 남동쪽
  ];
  
  // 각 방향에 있는 인접 육각형 찾기
  return directions
    .map(dir => {
      const adjQ = q + dir.q;
      const adjR = r + dir.r;
      const adjS = -adjQ - adjR; // 큐브 좌표 제약 조건: q + r + s = 0
      
      return hexagons.find(hex => 
        hex.q === adjQ && hex.r === adjR && hex.s === adjS
      );
    })
    .filter((hex): hex is HexTile => hex !== undefined);
};

export const calculateDistance = (hex1: HexTile, hex2: HexTile): number => {
  return Math.max(
    Math.abs(hex1.q - hex2.q),
    Math.abs(hex1.r - hex2.r),
    Math.abs(-hex1.q - hex1.r + hex2.q + hex2.r)
  );
}; 