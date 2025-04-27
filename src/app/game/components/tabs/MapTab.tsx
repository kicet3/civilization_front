import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import HexMap from './map/HexMap';
import { HexTile } from '@/types/game';

export default function MapTab() {
  const { gameState, isLoading, showToast } = useGame();
  const [selectedTile, setSelectedTile] = useState<HexTile | null>(null);
  
  if (isLoading) {
    return (
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-6">지도</h2>
        <div className="flex items-center justify-center h-64">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }
  
  const handleTileClick = (tile: HexTile) => {
    setSelectedTile(tile);
    showToast(`선택한 타일: (${tile.q}, ${tile.r}) - ${tile.terrain}`, 'info');
  };
  
  const handleUnitClick = (unit: any) => {
    showToast(`선택한 유닛: ${unit.typeName || '알 수 없는 유닛'}`, 'info');
  };
  
  const handleCityClick = (city: any) => {
    showToast(`선택한 도시: ${city.name || '알 수 없는 도시'}`, 'info');
  };
  
  // 서버에서 받은 맵 데이터를 HexTile 형식으로 변환
  const gameData: any = gameState;
  console.log("원본 게임 데이터:", gameData);
  
  if (gameData?.data) {
    console.log("게임 데이터에 data 객체가 있습니다.");
    
    // 데이터 구조 확인을 위한 로그
    if (gameData.data.civs) {
      console.log("data.civs 존재 여부:", gameData.data.civs.length);
      console.log("첫번째 civ 데이터:", gameData.data.civs[0]);
      
      if (gameData.data.civs[0].cities) {
        console.log("첫번째 civ의 도시 수:", gameData.data.civs[0].cities.length);
      }
      
      if (gameData.data.civs[0].units) {
        console.log("첫번째 civ의 유닛 수:", gameData.data.civs[0].units?.length || 0);
      }
    }
  }
  
  let mapData: HexTile[] = [];
  
  // data 객체와 tiles 배열 존재 여부 확인
  if (gameData?.data?.tiles) {
    console.log("data.tiles에서 데이터 가져옴:", gameData.data.tiles.length);
    
    mapData = gameData.data.tiles.map((tile: any) => {
      // 기본 타일 정보 변환
      const hexTile: HexTile = {
        q: tile.q,
        r: tile.r,
        s: -tile.q - tile.r, // 큐브 좌표 계산
        terrain: tile.terrain,
        resource: tile.resource,
        exploration: tile.exploration || 'visible',
        visible: tile.exploration === 'visible',
        explored: tile.exploration === 'visible' || tile.exploration === 'explored',
      };
      
      // 도시 정보 추가
      if (gameData.data.civs) {
        gameData.data.civs.forEach((civ: any) => {
          if (civ.cities) {
            civ.cities.forEach((city: any) => {
              if (city.q === tile.q && city.r === tile.r) {
                hexTile.city = {
                  name: city.name,
                  owner: civ.name,
                  population: city.population || 1
                };
              }
            });
          }
          
          // 유닛 정보 추가
          if (civ.units) {
            civ.units.forEach((unit: any) => {
              if (unit.q === tile.q && unit.r === tile.r) {
                hexTile.unit = {
                  id: unit.id || "unknown",
                  name: unit.name || "유닛",
                  type: unit.type || "military",
                  typeName: unit.typeName || "군사 유닛",
                  owner: civ.name,
                  hp: unit.hp || 100,
                  maxHp: unit.maxHp || 100,
                  movement: unit.movement || 2,
                  maxMovement: unit.maxMovement || 2,
                  status: unit.status || "idle",
                  location: {
                    q: tile.q,
                    r: tile.r,
                    s: -tile.q - tile.r
                  }
                };
              }
            });
          }
        });
      }
      
      return hexTile;
    });
  } else if (gameData?.tiles) {
    console.log("gameData.tiles에서 데이터 가져옴:", gameData.tiles.length);
    
    mapData = gameData.tiles.map((tile: any) => {
      // 기본 타일 정보 변환
      const hexTile: HexTile = {
        q: tile.q,
        r: tile.r,
        s: -tile.q - tile.r, // 큐브 좌표 계산
        terrain: tile.terrain,
        resource: tile.resource,
        exploration: tile.exploration || 'visible',
        visible: tile.exploration === 'visible',
        explored: tile.exploration === 'visible' || tile.exploration === 'explored',
      };
      
      // 도시 정보 추가
      if (gameData.civs) {
        gameData.civs.forEach((civ: any) => {
          if (civ.cities) {
            civ.cities.forEach((city: any) => {
              if (city.q === tile.q && city.r === tile.r) {
                hexTile.city = {
                  name: city.name,
                  owner: civ.name,
                  population: city.population || 1
                };
              }
            });
          }
          
          // 유닛 정보 추가
          if (civ.units) {
            civ.units.forEach((unit: any) => {
              if (unit.location && unit.location.q === tile.q && unit.location.r === tile.r) {
                hexTile.unit = {
                  id: unit.id || "unknown",
                  name: unit.name || "유닛",
                  type: unit.type || "military",
                  typeName: unit.typeName || "군사 유닛",
                  owner: civ.name,
                  hp: unit.hp || 100,
                  maxHp: unit.maxHp || 100,
                  movement: unit.movement || 2,
                  maxMovement: unit.maxMovement || 2,
                  status: unit.status || "idle",
                  location: {
                    q: tile.q,
                    r: tile.r,
                    s: -tile.q - tile.r
                  }
                };
              }
            });
          }
        });
      }
      
      return hexTile;
    });
  } else if (gameData?.map?.tiles) {
    console.log("gameData.map.tiles에서 데이터 가져옴:", gameData.map.tiles.length);
    
    mapData = gameData.map.tiles.map((tile: any) => {
      // 기본 타일 정보 변환
      const hexTile: HexTile = {
        q: tile.q,
        r: tile.r,
        s: -tile.q - tile.r, // 큐브 좌표 계산
        terrain: tile.terrain,
        resource: tile.resource,
        exploration: tile.exploration || 'visible',
        visible: tile.exploration === 'visible',
        explored: tile.exploration === 'visible' || tile.exploration === 'explored',
      };
      
      return hexTile;
    });
  } else {
    console.error("지원되는 데이터 구조를 찾을 수 없습니다!");
  }
  
  console.log("변환된 맵 데이터:", mapData);
  console.log("맵 데이터 길이:", mapData?.length || 0);
  
  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6">지도</h2>
      
      <div className="bg-slate-800 p-4 rounded-md">
        <div className="relative w-full h-[600px] border border-slate-700 bg-slate-900 flex items-center justify-center rounded-md">
          {mapData.length > 0 ? (
            <HexMap 
              hexagons={mapData}
              selectedTile={selectedTile}
              onTileClick={handleTileClick}
              onUnitClick={handleUnitClick}
              onCityClick={handleCityClick}
            />
          ) : (
            <p className="text-lg text-slate-400">맵 데이터가 없습니다</p>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-slate-700 p-3 rounded">
            <h3 className="font-semibold mb-2">선택한 타일 정보</h3>
            {selectedTile ? (
              <div className="text-sm">
                <p>좌표: ({selectedTile.q}, {selectedTile.r})</p>
                <p>지형: {selectedTile.terrain}</p>
                {selectedTile.resource && selectedTile.resource !== 'NoResource' && (
                  <p>자원: {selectedTile.resource}</p>
                )}
                {selectedTile.city && (
                  <div className="mt-1 bg-blue-900/30 p-1 rounded">
                    <p className="font-bold">{selectedTile.city.name}</p>
                    <p>인구: {selectedTile.city.population}</p>
                    <p>소유: {selectedTile.city.owner}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">타일을 선택해주세요</p>
            )}
          </div>
          
          <div className="bg-slate-700 p-3 rounded">
            <h3 className="font-semibold mb-2">게임 정보</h3>
            <p className="text-sm">턴: {gameData?.currentTurn || 1}</p>
            <p className="text-sm">플레이어: {gameData?.civs?.find((civ: any) => civ.isPlayer)?.name || '알 수 없음'}</p>
            <p className="text-sm">보유 도시: {gameData?.civs?.find((civ: any) => civ.isPlayer)?.cities?.length || 0}개</p>
          </div>
        </div>
      </div>
    </div>
  );
} 