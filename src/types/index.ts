/**
 * API 응답의 기본 형식을 정의하는 인터페이스
 */
export interface ApiResponse<T = any> {
  status: number;        // HTTP 상태 코드
  success: boolean;      // 요청 성공 여부
  message?: string;      // 응답 메시지
  data?: T;              // 응답 데이터
  error?: string;        // 에러 메시지
  timestamp?: string;    // 응답 시간
}

/**
 * 육각 타일 좌표
 */
export interface HexCoord {
  q: number;   // x 좌표 (수평)
  r: number;   // y 좌표 (수직)
  s: number;   // z 좌표 (q + r + s = 0)
}

/**
 * 유닛 정보
 */
export interface Unit {
  id: number;
  typeName: string;
  owner: string;
  location: HexCoord;
  movement: number;
  maxMovement: number;
  strength: number;
  health: number;
  hasActed: boolean;
}

/**
 * 도시 정보
 */
export interface City {
  id: number;
  name: string;
  owner: string;
  location: HexCoord;
  population: number;
  production: string;
  turnsLeft: number;
  buildings: string[];
}

/**
 * 육각 타일 정보
 */
export interface HexTile {
  q: number;
  r: number;
  s: number;
  terrain: string;
  feature?: string;
  resource?: string;
  improvement?: string;
  unit: Unit | null;
  city: City | null;
  owner?: string;
  fog?: boolean;
  discovered?: boolean;
}

/**
 * 게임 상태 정보
 */
export interface GameState {
  gameId: string;
  turn: number;
  year: number;
  resources: {
    food: number;
    production: number;
    gold: number;
    science: number;
    culture: number;
    faith: number;
    happiness: number;
  };
  cities: City[];
  units: Unit[];
  discoveredCivs?: any[];
  undiscoveredCivs?: any[];
}

/**
 * 턴 단계 정의
 */
export type TurnPhase = 'player' | 'ai' | 'resolve'; 