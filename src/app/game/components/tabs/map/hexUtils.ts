import { HexTile } from '@/types/game';

// 육각형 크기 상수
const HEX_SIZE = 32; // 육각형의 반지름 (조금 더 크게 조정)
const SPACING_FACTOR = 1.0; // 타일 간격 조정 (1.0 = 정확히 붙어있음)

// 육각형 위치 계산 함수
export const calculateHexPosition = (
  q: number, 
  r: number, 
  offset: { x: number, y: number }, 
  scale: number
): { x: number, y: number } => {
  // 큐브 좌표를 픽셀 좌표로 변환 (적절한 간격 유지)
  // 수평 간격: √3 * size
  // 수직 간격: 3/2 * size
  const x = (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r) * (HEX_SIZE * SPACING_FACTOR) * scale + offset.x;
  const y = (3 / 2 * r) * (HEX_SIZE * SPACING_FACTOR) * scale + offset.y;
  
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
  // 오프셋 적용된 좌표 계산
  const adjustedX = x - offset.x;
  const adjustedY = y - offset.y;
  
  // 가장 가까운 육각형 찾기
  let closestHex: HexTile | null = null;
  let minDistance = Infinity;
  
  hexagons.forEach(hex => {
    // 탐색되지 않은 타일은 클릭 불가능하게 함
    if (hex.exploration === 'unexplored') {
      return;
    }
    
    const hexPos = calculateHexPosition(hex.q, hex.r, { x: 0, y: 0 }, scale);
    // 오프셋 적용한 위치와의 거리 계산
    const distance = Math.sqrt(
      Math.pow(adjustedX - hexPos.x, 2) + Math.pow(adjustedY - hexPos.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestHex = hex;
    }
  });
  
  // 일정 거리 내에 있는 경우에만 반환 (클릭 허용 범위가 스케일에 비례)
  return minDistance < HEX_SIZE * scale * 1.2 ? closestHex : null;
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
  const adjacentHexes: HexTile[] = [];
  
  directions.forEach(dir => {
    const adjQ = q + dir.q;
    const adjR = r + dir.r;
    
    // s는 생략 가능 (일부 타일은 s 값이 없을 수 있음)
    const adjacentHex = hexagons.find(hex => 
      hex.q === adjQ && hex.r === adjR
    );
    
    if (adjacentHex) {
      adjacentHexes.push(adjacentHex);
    }
  });
  
  return adjacentHexes;
};

export const calculateDistance = (hex1: HexTile, hex2: HexTile): number => {
  return Math.max(
    Math.abs(hex1.q - hex2.q),
    Math.abs(hex1.r - hex2.r),
    Math.abs(-hex1.q - hex1.r + hex2.q + hex2.r)
  );
}; 