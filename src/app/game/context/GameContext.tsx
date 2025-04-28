"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gameService } from '@/services';
import { 
  GameState, 
  HexTile, 
  Unit, 
  City, 
  ResearchState,
  DiplomacyState, 
  Technology,
  ApiResponse
} from '@/types/game';

// ApiResponse 타입 확장
interface MapResponse extends ApiResponse<any> {
  player_resources?: {
    food: number;
    production: number;
    gold: number;
    science: number;
    culture: number;
  };
}

interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  gameCivId: number;
  mapData: HexTile[];
  technologies: Technology[];
  researchState: ResearchState | null;
  diplomacyState: DiplomacyState | null;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  loadGameData: () => Promise<void>;
  loadResearchData: () => Promise<void>;
  loadDiplomacyData: () => Promise<void>;
  endTurn: () => Promise<void>;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // 게임 상태
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameCivId, setGameCivId] = useState<number>(1); // 기본값 설정
  
  // 게임 데이터
  const [mapData, setMapData] = useState<HexTile[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [researchState, setResearchState] = useState<ResearchState | null>(null);
  const [diplomacyState, setDiplomacyState] = useState<DiplomacyState | null>(null);
  
  // UI 상태
  const [selectedTab, setSelectedTab] = useState<string>('map');
  const [toast, setToast] = useState<{
    message: string;
    show: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({ message: '', show: false, type: 'info' });

  // 최초 로딩 시 게임 데이터 가져오기
  useEffect(() => {
    loadGameData();
  }, []);

  // 게임 데이터 로드 함수
  const loadGameData = async () => {
    try {
      setIsLoading(true);
      
      // 로컬 스토리지에서 현재 게임 ID 가져오기
      let currentGameId = '';
      if (typeof window !== 'undefined') {
        currentGameId = localStorage.getItem('current_game_id') || '';
      }
      
      if (!currentGameId) {
        setError('게임 ID를 찾을 수 없습니다.');
        setIsLoading(false);
        showToast('게임 ID를 찾을 수 없습니다. 다시 시작해주세요.', 'error');
        return;
      }
      
      // 맵 데이터 조회
      const mapResponse = await gameService.getMapData(currentGameId) as MapResponse;
      console.log('맵 데이터 응답:', mapResponse);
      
      if (mapResponse.success && mapResponse.data) {
        const gameData = mapResponse.data;
        console.log('서버에서 받은 게임 데이터:', gameData);
        // 플레이어 리소스 로그 출력
        console.log('서버에서 받은 플레이어 리소스:', mapResponse.player_resources);
        
        // 게임 상태 설정
        const initialState: GameState = {
          id: currentGameId,
          turn: gameData.currentTurn || 1,
          year: gameData.year || -4000,
          resources: mapResponse.player_resources || {
            food: 0,
            production: 0,
            gold: 0,
            science: 0,
            culture: 0
          },
          cities: [],
          units: [],
          map: {
            tiles: gameData.tiles || [],
            civs: gameData.civs || [],
            turn: gameData.currentTurn || 1,
            game_id: currentGameId
          }
        };
        
        // 문명 및 도시 데이터 설정
        if (gameData.civs && gameData.civs.length > 0) {
          const cities: City[] = [];
          const units: Unit[] = [];
          const playerCiv = gameData.civs.find((civ: any) => civ.isPlayer);
          
          if (playerCiv) {
            setGameCivId(playerCiv.id);
          }
          
          gameData.civs.forEach((civ: any) => {
            // 도시 처리
            if (civ.cities && civ.cities.length > 0) {
              civ.cities.forEach((city: any) => {
                cities.push({
                  id: city.id,
                  name: city.name,
                  owner: civ.name,
                  population: city.population || 1,
                  location: {
                    q: city.q,
                    r: city.r,
                    s: -city.q - city.r
                  }
                });
              });
            }
            
            // 유닛 처리
            if (civ.units && civ.units.length > 0) {
              civ.units.forEach((unit: any) => {
                units.push({
                  id: unit.id,
                  name: unit.name,
                  type: unit.type,
                  typeName: unit.typeName || unit.type,
                  owner: civ.name,
                  hp: unit.hp || 100,
                  maxHp: unit.maxHp || 100,
                  movement: unit.movement || 2,
                  maxMovement: unit.maxMovement || 2,
                  status: unit.status || 'idle',
                  location: {
                    q: unit.q,
                    r: unit.r,
                    s: -unit.q - unit.r
                  }
                });
              });
            }
          });
          
          initialState.cities = cities;
          initialState.units = units;
        }
        
        // 게임 상태 저장
        setGameState(initialState);
        
        // 맵 데이터 변환 및 저장
        if (gameData.tiles) {
          console.log("서버에서 받은 원본 타일 데이터:", gameData.tiles.length);
          
          const hexTiles = gameData.tiles.map((tile: any) => {
            const hexTile: HexTile = {
              q: tile.q,
              r: tile.r,
              s: -tile.q - tile.r,
              terrain: tile.terrain,
              resource: tile.resource,
              exploration: tile.exploration || 'visible',
              visible: tile.exploration === 'visible',
              explored: tile.exploration === 'visible' || tile.exploration === 'explored',
            };
            
            return hexTile;
          });
          
          console.log("변환된 hexTiles 데이터:", hexTiles.length);
          setMapData(hexTiles);
          
          // map 객체가 있는지 확인 후 tiles 데이터 설정
          if (initialState.map) {
            initialState.map.tiles = gameData.tiles;
          }
        } else {
          console.error("타일 데이터가 없습니다!");
        }
        
        // 초기 데이터 로드 후 다른 세부 데이터 로드
        await Promise.all([
          loadResearchData(),
          loadDiplomacyData()
        ]);
        
        showToast('게임 데이터 로드 완료', 'success');
      } else {
        setError('맵 데이터를 가져오는 데 실패했습니다.');
        showToast('맵 데이터를 가져오는 데 실패했습니다.', 'error');
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '게임 데이터 로드 실패');
      setIsLoading(false);
      showToast('게임 데이터 로드 실패', 'error');
    }
  };
  
  // 연구 데이터 로드 함수
  const loadResearchData = async () => {
    try {
      // 기술 목록 로드
      const techResult = await gameService.getTechnologies();
      if (techResult.success && techResult.data) {
        setTechnologies(techResult.data);
      }
      
      // 연구 상태 로드
      const statusResult = await gameService.getResearchStatus(gameCivId);
      if (statusResult.success && statusResult.data) {
        // ResearchState 타입에 맞게 변환
        const researchData: ResearchState = {
          science: gameState?.resources?.science || 0,
          gameCivId: gameCivId,
          current: statusResult.data.inProgress,
          completed: statusResult.data.completed,
          available: statusResult.data.available,
        };
        setResearchState(researchData);
      }
      
      // 연구 트리 선택 로드
      const treeResult = await gameService.getTreeSelection(gameCivId);
      if (treeResult.success && treeResult.data && researchState) {
        setResearchState({
          ...researchState,
          treeSelection: {
            main: treeResult.data.main,
            sub: treeResult.data.sub
          }
        });
      }
    } catch (err) {
      console.error('연구 데이터 로드 실패:', err);
    }
  };
  
  // 외교 데이터 로드 함수
  const loadDiplomacyData = async () => {
    try {
      // 외교 데이터 로드 로직 (백엔드 API 구현 시)
      // const diplomacyResult = await gameService.getDiplomacyStatus(gameCivId);
      // if (diplomacyResult.success && diplomacyResult.data) {
      //   setDiplomacyState(diplomacyResult.data);
      // }
      
      // 임시 외교 상태 데이터
      setDiplomacyState({
        civRelations: {},
        cityStateRelations: {},
        cityStateAllies: {}
      });
    } catch (err) {
      console.error('외교 데이터 로드 실패:', err);
    }
  };
  
  // 시대 결정 함수
  const getEra = (year: number): { era: string, koreanEra: string } => {
    if (year < 1300) {
      return { era: 'Medieval', koreanEra: '중세' };
    } else if (year < 1900) {
      return { era: 'Industrial', koreanEra: '산업' };
    } else {
      return { era: 'Modern', koreanEra: '현대' };
    }
  };

  // 턴당 지나는 시간 계산 (현재 시대에 따라 다름)
  const getYearsPerTurn = (era: string): number => {
    switch (era) {
      case 'Medieval': return 20; // 중세시대는 턴당 20년
      case 'Industrial': return 10; // 산업시대는 턴당 10년
      case 'Modern': return 5; // 현대시대는 턴당 5년
      default: return 20;
    }
  };
  
  // 턴 종료 함수
  const endTurn = async () => {
    try {
      setIsLoading(true);
      
      // 로컬 스토리지에서 게임 ID 가져오기 (클라이언트 사이드에서만)
      let gameId = '';
      if (typeof window !== 'undefined') {
        gameId = localStorage.getItem('current_game_id') || '';
      }
      if (!gameId && gameState?.id) {
        // 로컬 스토리지에 없을 경우 게임 상태에서 ID 가져오기
        gameId = gameState.id.toString();
      }
      if (!gameId) {
        throw new Error('게임 ID를 찾을 수 없습니다.');
      }
      
      // 사용자 정보 가져오기 (클라이언트 사이드에서만)
      let userId: string | undefined;
      let userName: string | undefined;
      if (typeof window !== 'undefined') {
        userId = localStorage.getItem('user_id') || undefined;
        userName = localStorage.getItem('user_name') || undefined;
      }
      
      // 현재 시대와 턴당 년수 계산
      const currentYear = gameState?.year || 0;
      const { era } = getEra(currentYear);
      const yearsPerTurn = getYearsPerTurn(era);
      const nextYear = currentYear + yearsPerTurn;
      
      // 로컬 스토리지에서 게임 설정 가져오기
      let difficulty = 'normal';
      let mapType = 'continent';
      let gameMode = 'standard';
      
      if (typeof window !== 'undefined') {
        difficulty = localStorage.getItem('game_difficulty') || 'normal';
        mapType = localStorage.getItem('game_map_type') || 'continent';
        gameMode = localStorage.getItem('game_mode') || 'standard';
      }
      
      // 게임 시작 시간 (없으면 현재 시간으로 설정)
      let startTime = new Date().toISOString();
      if (typeof window !== 'undefined') {
        startTime = localStorage.getItem('game_start_time') || startTime;
      }
      
      // TurnNextRequest 데이터 준비
      const turnNextRequest = {
        achievements: [],
        actionCounts: {},
        actions: [],
        capitalCity: (() => {
          const capital = gameState?.cities?.find((city: any) => city.isCapital === true) || (gameState?.cities?.[0] ?? null);
          if (!capital) return null;
          return {
            ...capital,
            buildings: (capital as any).buildings || [],
            production: (capital as any).production || {
              type: '',
              item: '',
              progress: 0,
              required: 0
            }
          };
        })(),
        capturedCities: [], // 추적 불가, 빈 배열로 전송
        cities: (gameState?.cities ?? []).map(city => ({
          id: city.id,
          name: city.name,
          population: city.population,
          location: city.location ? {
            q: city.location.q,
            r: city.location.r,
            s: city.location.s
          } : { q: 0, r: 0, s: 0 },
          buildings: (city as any).buildings || [],
          production: (city as any).production || {
            type: '',
            item: '',
            progress: 0,
            required: 0
          }
        })),
        civilianUnits: (gameState?.units ?? []).filter(unit => unit.type === 'civilian').map(unit => ({
          id: unit.id,
          type: unit.unitType || 'settler',
          name: unit.name || '',
          location: unit.location ? {
            q: unit.location.q,
            r: unit.location.r,
            s: unit.location.s
          } : { q: 0, r: 0, s: 0 },
          hp: unit.hp,
          maxHp: unit.maxHp,
          movement: unit.movement,
          maxMovement: unit.maxMovement,
          status: unit.status,
          experience: unit.experience || 0,
          level: unit.level || 1,
          abilities: unit.abilities || []
        })),
        civilizationId: gameState?.map?.civs ? 
          gameState.map.civs.find((civ: any) => civ.isPlayer === true)?.id || null : null,
        civilizationName: gameState?.map?.civs ? 
          gameState.map.civs.find((civ: any) => civ.isPlayer === true)?.name || null : null,
        currentResearch: researchState?.current ? [
          technologies.find(t => t.id === researchState.current?.techId)?.name || `기술 ${researchState.current?.techId}`
        ] : [],
        completedResearch: researchState?.completed?.map(techId => ({
          techId,
          name: technologies.find(t => t.id === techId)?.name || `기술 ${techId}`,
          era: technologies.find(t => t.id === techId)?.era || ''
        })) || [],
        difficulty: difficulty,
        diplomacyStates: Object.entries(diplomacyState?.civRelations || {}).map(([civId, status]) => ({
          civId: civId,
          status: status,
          wars: status === 'war' ? 1 : 0,
          alliances: status === 'alliance' ? 1 : 0,
          trades: 0 // 추적 불가
        })),
        endTime: new Date().toISOString(),
        exploredTiles: mapData.filter(tile => tile.explored).length,
        events: [],
        foundedCities: gameState?.cities?.filter((city: any) => city.isFounded).map(city => ({
          id: city.id,
          name: city.name,
          population: city.population,
          location: city.location ? {
            q: city.location.q,
            r: city.location.r,
            s: city.location.s
          } : { q: 0, r: 0, s: 0 },
          buildings: (city as any).buildings || [],
          production: (city as any).production || {
            type: '',
            item: '',
            progress: 0,
            required: 0
          }
        })) ?? [],
        leaderName: gameState?.map?.civs ? 
          (gameState.map.civs.find((civ: any) => civ.isPlayer === true)?.leader ?? '') : '',
        militaryUnits: (gameState?.units ?? []).filter(unit => unit.type !== 'civilian').map(unit => ({
          id: unit.id,
          type: unit.unitType || 'warrior',
          name: unit.name || '',
          location: unit.location ? {
            q: unit.location.q,
            r: unit.location.r,
            s: unit.location.s
          } : { q: 0, r: 0, s: 0 },
          hp: unit.hp,
          maxHp: unit.maxHp,
          movement: unit.movement,
          maxMovement: unit.maxMovement,
          status: unit.status,
          strength: unit.strength || 0,
          rangedStrength: unit.rangedStrength || 0,
          experience: unit.experience || 0,
          level: unit.level || 1,
          abilities: unit.abilities || [],
          promotions: unit.promotions || []
        })),
        researchProgress: researchState?.current?.points ? [String(researchState.current.points)] : [],
        researchQueue: researchState?.queue?.map(tech => ({
          techId: tech.techId,
          name: technologies.find(t => t.id === tech.techId)?.name || `기술 ${tech.techId}`
        })) || [],
        resources: gameState?.resources || {},
        resourceLocations: mapData.filter(tile => tile.resource).map(tile => ({
          resource: tile.resource,
          location: {
            q: tile.q,
            r: tile.r,
            s: tile.s
          }
        })),
        scoreComponents: {},
        selectedTechTrees: researchState?.treeSelection ? [String(researchState.treeSelection)] : [],
        startTime: startTime,
        successfulAttacks: 0,
        successfulDefenses: 0,
        techEra: era,
        territoryCaptured: 0,
        territoryLost: 0,
        totalCities: gameState?.cities?.length || 0,
        totalPlayTime: 0,
        totalScore: 0,
        totalTechsResearched: researchState?.completed?.length || 0,
        totalUnits: gameState?.units?.length || 0,
        unitProduction: (gameState?.cities ?? []).map(city => ({
          cityId: city.id,
          cityName: city.name,
          production: (city as any).production?.type === 'unit' ? {
            unitType: (city as any).production?.item || '',
            progress: (city as any).production?.progress || 0,
            required: (city as any).production?.required || 0
          } : null
        })).filter(city => city.production !== null),
        trades: 0,
        turn: gameState?.turn || 1,
        unexploredTiles: mapData.filter(tile => !tile.explored).length,
        units: (gameState?.units ?? []).map(unit => ({
          id: unit.id,
          type: unit.unitType || (unit.type === 'civilian' ? 'settler' : 'warrior'),
          name: unit.name || '',
          location: unit.location ? {
            q: unit.location.q,
            r: unit.location.r,
            s: unit.location.s
          } : { q: 0, r: 0, s: 0 },
          hp: unit.hp,
          maxHp: unit.maxHp,
          movement: unit.movement,
          maxMovement: unit.maxMovement,
          status: unit.status,
          strength: unit.strength || 0,
          rangedStrength: unit.rangedStrength || 0,
          experience: unit.experience || 0,
          level: unit.level || 1,
          abilities: unit.abilities || [],
          promotions: unit.promotions || []
        })),
        unitsKilled: 0,
        victoryType: '',
        unitsLost: 0,
        visibleTiles: mapData.filter(tile => tile.visible).length,
        wars: Object.values(diplomacyState?.civRelations || {}).filter(status => status === 'war').length,
        year: currentYear,
        gameId: parseInt(gameId),
        tiles: mapData.map(tile => ({
          location: {
            q: tile.q,
            r: tile.r,
            s: tile.s
          },
          resource: tile.resource || '',
          resourceAmount: 0, // 정보 없음
          terrain: tile.terrain,
          movementCost: 1 // 정보 없음
        }))
      };

      
      console.log('턴 종료 요청:', gameId);
      // 턴 종료 API 호출 - TurnNextRequest로 요청
      const turnResult = await gameService.endTurn(turnNextRequest);
      console.log('턴 종료 결과:', turnResult);
      
      if (!turnResult.success) {
        throw new Error(turnResult.message || '턴 종료 실패');
      }
      
      // API 응답에서 새 게임 데이터를 받아왔다면 상태 업데이트
      if (turnResult.data) {
        // 새 턴 정보 로깅 - 속성명 변경 가능성 고려
        console.log('턴 종료 응답 데이터:', turnResult.data);
        
        // 다양한 가능한 속성명 시도
        const newTurn = turnResult.data.current_turn || 
                       turnResult.data.turn || 
                       turnResult.data.currentTurn || 
                       (gameState?.turn || 0) + 1;
        
        console.log(`턴 ${newTurn}으로 업데이트됨`);
        
        // 임시 저장된 로컬 스토리지 데이터 초기화
        if (typeof window !== 'undefined') {
          localStorage.removeItem('temp_resources');
          localStorage.removeItem('current_research');
          localStorage.removeItem('current_unit_production');
          localStorage.removeItem('current_building_construction');
        }
      }
      
      // 새로운 턴 데이터 로드
      await loadGameData();
      
      // 다음 시대로 넘어갔는지 확인하여 메시지 표시
      const newYear = (gameState?.year || 0) + yearsPerTurn;
      const oldEra = getEra(currentYear).koreanEra;
      const newEra = getEra(newYear).koreanEra;
      
      if (oldEra !== newEra) {
        showToast(`축하합니다! ${newEra} 시대에 진입했습니다.`, 'success');
      } else {
        const displayTurn = turnResult.data?.current_turn || 
                           turnResult.data?.turn || 
                           turnResult.data?.currentTurn || 
                           (gameState?.turn || 0) + 1;
        showToast(`턴 ${displayTurn}으로 진행되었습니다.`, 'success');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('턴 종료 오류:', err);
      setError(err instanceof Error ? err.message : '턴 종료 실패');
      setIsLoading(false);
      showToast('턴 종료 실패', 'error');
    }
  };
  
  // 토스트 메시지 표시
  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ message, show: true, type });
    setTimeout(() => {
      setToast({ message: '', show: false, type });
    }, 3000);
  };

  const value = {
    gameState,
    isLoading,
    error,
    gameCivId,
    mapData,
    technologies,
    researchState,
    diplomacyState,
    selectedTab,
    setSelectedTab,
    loadGameData,
    loadResearchData,
    loadDiplomacyData,
    endTurn,
    showToast
  };

  return (
    <GameContext.Provider value={value}>
      {children}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md text-white ${
          toast.type === 'error' ? 'bg-red-600' :
          toast.type === 'warning' ? 'bg-yellow-600' :
          toast.type === 'success' ? 'bg-green-600' :
          'bg-blue-600'
        } shadow-lg z-50 transition-opacity`}>
          {toast.message}
        </div>
      )}
    </GameContext.Provider>
  );
} 