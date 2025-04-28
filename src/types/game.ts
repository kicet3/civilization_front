// 지도 타입
export interface MapType {
  id: string;
  name: string;
  description: string;
}

// 난이도 타입
export interface Difficulty {
  id: string;
  name: string;
  description: string;
}

// 문명 타입
export interface Civilization {
  id: string;
  name: string;
  leader: string;
  specialAbility: string;
  // 추가 속성들은 백엔드 응답에 따라 선택적으로 추가
  type?: string;
  color?: string;
  unit?: string;
  building?: string;
  capital_tile?: {
    q: number;
    r: number;
    s: number;
  };
  units?: string[];
  leaderImage?: string;
  capital?: string;
  cities?: any[];
  militaryStrength?: number;
}

// 게임 모드 타입
export interface GameMode {
  id: string;
  name: string;
  turns: string;
  estimatedTime: string;
  description: string;
}

// 승리 조건 타입
export interface VictoryType {
  id: string;
  name: string;
}

// 저장된 게임 타입
export interface SavedGame {
  id: string;
  name: string;
  date: string;
  civName: string;
  turn: number;
}

// 게임 옵션 타입
export interface GameOptions {
  mapTypes: MapType[];
  difficulties: Difficulty[];
  civilizations: Civilization[];
  gameModes: GameMode[];
  victoryTypes?: VictoryType[];
}

// 자원 수익 타입
export interface YieldValues {
  food: number;
  production: number;
  gold: number;
  science: number;
  culture: number;
  faith: number;
}

// 헥스 타일 타입
export interface HexTile {
  q: number;
  r: number;
  s: number;
  terrain: string;
  resource?: string;
  improvement?: string;
  naturalWonder?: string;
  occupant?: string;
  city_id?: string;
  unit_id?: string;
  exploration: 'visible' | 'explored' | 'unexplored'; // 시야 상태: 현재 보임, 탐색됨, 미탐색
  visible?: boolean; // 이전 버전과의 호환성을 위해 유지
  explored?: boolean; // 이전 버전과의 호환성을 위해 유지
  movementCost?: number;
  yields?: YieldValues;
  city?: {
    name: string;
    owner: string;
    population: number;
  };
  unit?: Unit | null;
}

// 게임 맵 상태 타입
export interface GameMapState {
  tiles: HexTile[];
  civs: Civilization[];
  turn: number;
  game_id: string;
}

// 게임 상태 타입
export interface GameState {
  id: string;
  turn: number;
  year: number;
  resources: {
    food: number;
    production: number;
    gold: number;
    science: number;
    culture: number;
    faith?: number;
    happiness?: number;
  };
  map?: GameMapState;
  cities: City[];
  units: Unit[];
  researchState?: ResearchState;
  policyState?: PolicyState;
  religionState?: ReligionState;
  diplomacyState?: DiplomacyState;
}

// 도시 타입
export interface City {
  id: number;
  name: string;
  owner: string;
  population: number;
  hp?: number;
  defense?: number;
  happiness?: number;
  food?: number;
  production?: number;
  gold?: number;
  science?: number;
  culture?: number;
  faith?: number;
  productionQueue?: { name: string; turnsLeft: number }[];
  garrisonedUnit?: string;
  foodToNextPop?: number;
  turnsLeft?: number;
  cultureToNextBorder?: number;
  location?: {
    q: number;
    r: number;
    s: number;
  };
}

// 유닛 타입
export interface Unit {
  id: string;
  name: string;
  type: string;
  typeName: string;
  owner?: string;
  hp: number;
  maxHp: number;
  movement: number;
  maxMovement: number;
  status: string;
  hasActed?: boolean;
  location: {
    q: number;
    r: number;
    s: number;
  };
}

// 연구 상태 타입
export interface ResearchState {
  science: number;
  gameCivId?: number; // 플레이어 문명 ID
  current?: {
    techId: number;
    points: number;
    required: number;
  };
  completed: number[];
  available: number[];
  queue?: ResearchQueueEntry[];
  treeSelection?: {
    main: string;
    sub: string;
  };
}

// 정책 상태 타입
export interface PolicyState {
  culture: number;
  adopted: string[];
  ideology: string | null;
}

// 종교 상태 타입
export interface ReligionState {
  faith: number;
  foundedReligionId: string | null;
  followerReligionId: string | null;
}

// 외교 상태 타입
export interface DiplomacyState {
  civRelations: { [civId: string]: string };
  cityStateRelations: { [csId: string]: number };
  cityStateAllies: { [csId: string]: boolean };
}

// 이벤트 타입
export interface GameEvent {
  type: 'system' | 'advisor' | 'event' | 'player';
  content: string;
  turn: number;
  importance?: 'low' | 'medium' | 'high';
}

// 기술(Technology) 타입
export interface Technology {
  id: number;
  name: string;
  description: string;
  era: 'Medieval' | 'Industrial' | 'Modern';
  treeType: string;
  researchCost: number;
  researchTimeModifier: number;
  icon?: string;
  unlocks?: string[]; // 해금되는 유닛, 건물 등
  position?: {
    x: number;
    y: number;
  };
  prerequisites?: number[]; // 선행 기술 ID 목록
}

// 연구 큐 엔트리 타입
export interface ResearchQueueEntry {
  queueId: number;
  techId: number;
  queuePosition: number;
}

// 로그 아이템 타입
export interface LogEntry {
  type: 'system' | 'advisor' | 'event' | 'player';
  content: string;
  turn: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 이동 경로 타입
export interface MovementPath {
  path: { q: number, r: number, s: number }[];
  totalCost: number;
  possibleInTurn: boolean;
}

// 게임 초기화 요청 타입
export interface GameInitRequest {
  mapType: string;
  playerName: string;
  playerCiv: string;
  difficulty: string;
  civCount: number;
  userId?: string;
}

// 턴 단계 타입
export type TurnPhase = "player" | "ai" | "resolve";

// 정보 패널 타입
export interface InfoPanel {
  open: boolean;
  type: 'tile' | 'city' | 'unit' | 'research' | 'policy' | null;
  data: any | null;
}