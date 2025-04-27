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
  Technology
} from '@/types/game';

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
      const mapResponse = await gameService.getMapData(currentGameId);
      
      if (mapResponse.success && mapResponse.data) {
        const gameData = mapResponse.data;
        
        // 게임 상태 설정
        const initialState: GameState = {
          id: currentGameId,
          turn: gameData.currentTurn || 1,
          year: gameData.year || -4000,
          resources: gameData.resources || {
            food: 10,
            production: 5,
            gold: 20,
            science: 3,
            culture: 2,
            faith: 1,
            happiness: 10
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
  
  // 턴 종료 함수
  const endTurn = async () => {
    try {
      setIsLoading(true);
      
      // 턴 종료 시 백엔드로 현재 상태 전송
      // 실제 API는 구현 시 수정 필요
      // const turnResult = await gameService.endTurn(gameState?.id || '');
      
      // 새로운 턴 데이터 로드
      await loadGameData();
      
      showToast('턴을 종료했습니다.', 'info');
      setIsLoading(false);
    } catch (err) {
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