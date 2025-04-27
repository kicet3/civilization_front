import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Building, Clock, Plus, X, Hammer, Library, ShoppingBag, Shield } from 'lucide-react';
import axios from 'axios';
import { City as GameCity } from '@/types/game';

// API 기본 URL
const API_BASE_URL = 'http://localhost:8000/buildings';

// 건물 타입 정의
interface BuildingTemplate {
  id: number;
  name: string;
  category?: string;
  description: string;
  buildTime: number;
  resourceCost: {
    Food: number;
    Production: number;
    Gold: number;
    Science: number;
  };
  maintenanceCost: {
    Gold: number;
  };
  prerequisiteTechId: number | null;
  turnsToBuild?: number; // 이전 코드와의 호환성 유지
  cost?: number; // 이전 코드와의 호환성 유지
  maintenance?: number; // 이전 코드와의 호환성 유지
  benefits?: string[]; // 이전 코드와의 호환성 유지
}

// 건설 큐 항목 타입
interface BuildQueueItem {
  queueId: number;
  buildingId: number;
  queuePosition: number;
  progress?: number;
  turnsLeft?: number;
}

// City 타입 (API 통신용)
interface City {
  id: number;
  name: string;
  owner: string;
  population: number;
  location: { q: number; r: number };
  turnsLeft?: number;
  currentBuilding?: number;
  buildProgress?: number;
}

// 도시 건물 타입
interface CityBuilding {
  id: number;
  buildingId: number;
  cityId: number;
  completedTurn: number;
}

// GameState 타입 확장
interface GameState {
  cities: GameCity[];
  buildings: { [cityId: number]: number[] };
  // 다른 속성들...
}

export default function ConstructionTab() {
  const { gameState, isLoading, showToast } = useGame();
  const [buildingTemplates, setBuildingTemplates] = useState<BuildingTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [showConstructionModal, setShowConstructionModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [cityBuildings, setCityBuildings] = useState<{[cityId: string]: CityBuilding[]}>({});
  const [buildQueues, setBuildQueues] = useState<{[cityId: string]: BuildQueueItem[]}>({});
  const [loadingQueues, setLoadingQueues] = useState<boolean>(false);
  const [loadingCityBuildings, setLoadingCityBuildings] = useState<boolean>(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  
  // 도시 목록 가져오기 (GameContext에서 도시 정보 활용 & API 호환성을 위한 변환)
  const cities = useMemo<City[]>(() => {
    if (!gameState || !gameState.cities) return [];
    
    // 플레이어 소유 도시만 필터링하고 API 호환 형식으로 변환
    return gameState.cities
      .filter(city => city.owner === 'player')
      .map(city => ({
        id: city.id,
        name: city.name,
        owner: city.owner,
        population: city.population,
        location: {
          q: city.location?.q || 0,
          r: city.location?.r || 0
        },
        turnsLeft: city.turnsLeft,
        currentBuilding: city.productionQueue && city.productionQueue.length > 0 
          ? parseInt(city.productionQueue[0].name) 
          : undefined,
        buildProgress: city.production
      }));
  }, [gameState]);
  
  // 선택된 도시가 없는 경우 첫 번째 도시를 기본으로 선택
  useEffect(() => {
    if (cities.length > 0 && selectedCityId === null) {
      setSelectedCityId(cities[0].id);
    }
  }, [cities, selectedCityId]);
  
  // 건물 템플릿 로드
  useEffect(() => {
    const loadBuildingTemplates = async () => {
      setLoadingTemplates(true);
      try {
        // API 호출을 통해 건물 목록 가져오기
        const response = await axios.get(`${API_BASE_URL}`, {
          params: {
            category: categoryFilter !== 'All' ? categoryFilter : undefined
          }
        });
        
        if (response.data && response.data.success) {
          // API 응답 구조에 맞게 데이터 변환
          const buildings = response.data.data.map((building: any) => ({
            ...building,
            turnsToBuild: building.buildTime, // 기존 코드 호환용
            cost: building.resourceCost.Production, // 기존 코드 호환용
            maintenance: building.maintenanceCost.Gold, // 기존 코드 호환용
            benefits: [building.description], // 기존 코드 호환용
          }));
          setBuildingTemplates(buildings);
        } else {
          // API 호출 실패 시 임시 데이터 설정
          setBuildingTemplates([
            {
              id: 1,
              name: "대장간",
              cost: 80,
              turnsToBuild: 6,
              benefits: ["생산력 +2", "무기 유닛 생산 속도 10% 증가"],
              description: "도시의 생산력을 높이고 유닛 생산 속도를 증가시킵니다.",
              maintenance: 1,
              category: "Production",
              // 새 API 형식 지원
              buildTime: 6,
              resourceCost: { Food: 0, Production: 80, Gold: 0, Science: 0 },
              maintenanceCost: { Gold: 1 },
              prerequisiteTechId: null
            },
            {
              id: 2,
              name: "도서관",
              cost: 90,
              turnsToBuild: 7,
              benefits: ["과학력 +3", "도시의 과학 산출량 15% 증가"],
              description: "도시의 과학 산출량을 증가시키고 기술 연구를 가속화합니다.",
              maintenance: 2,
              category: "Science",
              // 새 API 형식 지원
              buildTime: 7,
              resourceCost: { Food: 0, Production: 90, Gold: 0, Science: 0 },
              maintenanceCost: { Gold: 2 },
              prerequisiteTechId: null
            },
            {
              id: 3,
              name: "시장",
              cost: 100,
              turnsToBuild: 8,
              benefits: ["금 +3", "도시의 금 산출량 10% 증가"],
              description: "도시의 금 산출량을 증가시키고 경제적 효율성을 높입니다.",
              maintenance: 1,
              category: "Trade",
              // 새 API 형식 지원
              buildTime: 8,
              resourceCost: { Food: 0, Production: 100, Gold: 0, Science: 0 },
              maintenanceCost: { Gold: 1 },
              prerequisiteTechId: null
            },
            {
              id: 4,
              name: "극장",
              cost: 120,
              turnsToBuild: 10,
              benefits: ["문화 +3", "행복도 +1"],
              description: "도시에 문화와 행복을 제공합니다.",
              maintenance: 2,
              category: "Culture",
              // 새 API 형식 지원
              buildTime: 10,
              resourceCost: { Food: 0, Production: 120, Gold: 0, Science: 0 },
              maintenanceCost: { Gold: 2 },
              prerequisiteTechId: null
            },
            {
              id: 5,
              name: "성벽",
              cost: 110,
              turnsToBuild: 8,
              benefits: ["방어력 +5", "도시 공격에 대한 저항 20% 증가"],
              description: "도시의 방어력을 향상시키고 공격에 대한 보호를 제공합니다.",
              maintenance: 1,
              category: "Defense",
              // 새 API 형식 지원
              buildTime: 8,
              resourceCost: { Food: 0, Production: 110, Gold: 0, Science: 0 },
              maintenanceCost: { Gold: 1 },
              prerequisiteTechId: null
            }
          ]);
        }
      } catch (error) {
        console.error("건물 템플릿 로드 실패:", error);
        showToast("건물 목록을 불러오는데 실패했습니다.", "error");
      } finally {
        setLoadingTemplates(false);
      }
    };
    
    loadBuildingTemplates();
  }, [categoryFilter, showToast]);

  // 도시별 건설된 건물 로드
  useEffect(() => {
    const loadCityBuildings = async () => {
      if (!cities?.length) return;
      
      setLoadingCityBuildings(true);
      const cityBuildingsData: {[cityId: string]: CityBuilding[]} = {};
      
      try {
        // 각 도시별로 건설된 건물 가져오기
        for (const city of cities) {
          try {
            const response = await axios.get(`${API_BASE_URL}/cities/${city.id}/buildings`);
            if (response.data && response.data.success) {
              cityBuildingsData[city.id] = response.data.data;
            }
          } catch (err) {
            console.error(`도시 ${city.id} 건물 로드 실패:`, err);
          }
        }
        
        setCityBuildings(cityBuildingsData);
      } catch (error) {
        console.error("도시 건물 로드 실패:", error);
      } finally {
        setLoadingCityBuildings(false);
      }
    };
    
    loadCityBuildings();
  }, [cities]);

  // 도시별 건설 큐 로드
  useEffect(() => {
    const loadBuildQueues = async () => {
      if (!cities?.length) return;
      
      setLoadingQueues(true);
      const queuesData: {[cityId: string]: BuildQueueItem[]} = {};
      
      try {
        // 각 도시별로 건설 큐 가져오기
        for (const city of cities) {
          try {
            const response = await axios.get(`${API_BASE_URL}/cities/${city.id}/build-queue`);
            if (response.data && response.data.success) {
              queuesData[city.id] = response.data.data;
            }
          } catch (err) {
            console.error(`도시 ${city.id} 건설 큐 로드 실패:`, err);
          }
        }
        
        setBuildQueues(queuesData);
      } catch (error) {
        console.error("건설 큐 로드 실패:", error);
      } finally {
        setLoadingQueues(false);
      }
    };
    
    loadBuildQueues();
  }, [cities]);
  
  if (isLoading) {
    return (
      <div className="p-4 text-white bg-slate-900">
        <h2 className="text-2xl font-bold mb-6">건설</h2>
        <div className="flex items-center justify-center h-64">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }
  
  // 건물 건설 시작 처리
  const handleStartConstruction = async (cityId: number, buildingId: number) => {
    try {
      // 선택한 건물 정보 가져오기
      const selectedBuilding = buildingTemplates.find(b => b.id === buildingId);
      if (!selectedBuilding) {
        showToast('선택한 건물 정보를 찾을 수 없습니다.', 'error');
        return;
      }
      
      // 로컬 스토리지에 생산 정보 저장
      const constructionData = {
        buildingId,
        buildingName: selectedBuilding.name,
        turnsLeft: selectedBuilding.turnsToBuild || selectedBuilding.buildTime,
        category: selectedBuilding.category,
        startedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('current_construction', JSON.stringify(constructionData));
      showToast(`${selectedBuilding.name} 건설을 시작했습니다.`, 'success');
      
      // 상태 업데이트
      setShowConstructionModal(false);
      
      // 서버에 정보 전송 (실제 API가 연결되면 사용)
      try {
        const response = await axios.post(`${API_BASE_URL}/cities/${cityId}/build/start`, {
          buildingId
        });
        
        if (response.data && response.data.success) {
          // 서버에서 건설 성공 응답 시 로컬 스토리지 유지
          console.log('건설 시작 성공:', response.data);
        }
      } catch (err) {
        console.error("건설 시작 API 호출 실패:", err);
        // API 실패해도 로컬 스토리지 유지하여 UX 연속성 확보
      }
    } catch (error) {
      console.error("건설 시작 실패:", error);
      showToast('건물 건설 시작 실패', 'error');
    }
  };
  
  // 건설 큐에 추가
  const handleAddToQueue = async (cityId: number, buildingId: number) => {
    try {
      // 건설 큐에 추가 API 호출
      const response = await axios.post(`${API_BASE_URL}/cities/${cityId}/build-queue`, {
        buildingId
      });
      
      if (response.data && response.data.success) {
        showToast(`${buildingTemplates.find(b => b.id === buildingId)?.name}을(를) 건설 큐에 추가했습니다.`, 'success');
        
        // 해당 도시의 건설 큐 다시 불러오기
        try {
          const queueResponse = await axios.get(`${API_BASE_URL}/cities/${cityId}/build-queue`);
          if (queueResponse.data && queueResponse.data.success) {
            setBuildQueues(prev => ({
              ...prev,
              [cityId]: queueResponse.data.data
            }));
          }
        } catch (err) {
          console.error("건설 큐 업데이트 실패:", err);
        }
      } else {
        showToast(response.data?.message || '건설 큐 추가에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error("건설 큐 추가 실패:", error);
      showToast('건설 큐 추가 실패', 'error');
    }
  };
  
  // 건설 취소
  const handleCancelConstruction = async (cityId: number, buildingId: number) => {
    try {
      // 건설 취소 API 호출
      const response = await axios.post(`${API_BASE_URL}/cities/${cityId}/build/cancel`, {
        playerBuildingId: buildingId
      });
      
      if (response.data && response.data.success) {
        showToast('건설이 취소되었습니다.', 'success');
        
        // 해당 도시의 건설 큐 다시 불러오기
        try {
          const queueResponse = await axios.get(`${API_BASE_URL}/cities/${cityId}/build-queue`);
          if (queueResponse.data && queueResponse.data.success) {
            setBuildQueues(prev => ({
              ...prev,
              [cityId]: queueResponse.data.data
            }));
          }
        } catch (err) {
          console.error("건설 큐 업데이트 실패:", err);
        }
      } else {
        showToast(response.data?.message || '건설 취소에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error("건설 취소 실패:", error);
      showToast('건설 취소 실패', 'error');
    }
  };
  
  // 건설 큐에서 제거
  const handleRemoveFromQueue = async (cityId: number, queueId: number) => {
    try {
      // 건설 큐에서 제거 API 호출
      const response = await axios.delete(`${API_BASE_URL}/cities/${cityId}/build-queue/${queueId}`);
      
      if (response.data && response.data.success) {
        showToast('건설 큐에서 제거되었습니다.', 'success');
        
        // 해당 도시의 건설 큐 다시 불러오기
        try {
          const queueResponse = await axios.get(`${API_BASE_URL}/cities/${cityId}/build-queue`);
          if (queueResponse.data && queueResponse.data.success) {
            setBuildQueues(prev => ({
              ...prev,
              [cityId]: queueResponse.data.data
            }));
          }
        } catch (err) {
          console.error("건설 큐 업데이트 실패:", err);
        }
      } else {
        showToast(response.data?.message || '큐에서 제거하는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error("큐 항목 제거 실패:", error);
      showToast('건설 큐에서 제거 실패', 'error');
    }
  };
  
  // 건물 아이콘 선택 함수
  const getBuildingIcon = (buildingName: string, category?: string) => {
    // 카테고리 기반 아이콘 선택
    if (category === "Production") return <Hammer className="mr-2 text-red-400" />;
    if (category === "Science") return <Library className="mr-2 text-blue-400" />;
    if (category === "Trade") return <ShoppingBag className="mr-2 text-yellow-400" />;
    if (category === "Defense") return <Shield className="mr-2 text-green-400" />;
    
    // 이름 기반 폴백
    if (buildingName.includes("대장간")) return <Hammer className="mr-2 text-red-400" />;
    if (buildingName.includes("도서관")) return <Library className="mr-2 text-blue-400" />;
    if (buildingName.includes("시장")) return <ShoppingBag className="mr-2 text-yellow-400" />;
    if (buildingName.includes("성벽")) return <Shield className="mr-2 text-green-400" />;
    
    return <Building className="mr-2 text-gray-400" />;
  };
  
  // 도시의 건물 목록 가져오기
  const getCityBuildings = (cityId: number) => {
    return cityBuildings[cityId] || [];
  };
  
  // 도시의 건설 큐 가져오기
  const getCityBuildQueue = (cityId: number) => {
    return buildQueues[cityId] || [];
  };
  
  // 도시 세부 정보 표시를 위한 함수
  const getCityDetails = (cityId: number) => {
    return cities.find(city => city.id === cityId);
  };
  
  // 도시 위치 정보 표시를 위한 함수
  const getCityLocation = (cityId: number) => {
    const city = cities.find(city => city.id === cityId);
    if (city && city.location) {
      return `(${city.location.q}, ${city.location.r})`;
    }
    return '알 수 없음';
  };
  
  // 건물 필터링
  const filteredBuildings = buildingTemplates.filter(building => {
    const nameMatch = building.name.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = building.description.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = categoryFilter === 'All' || building.category === categoryFilter;
    
    return (nameMatch || descMatch) && categoryMatch;
  });
  
  // 건설 중인 건물 정보 가져오기
  const getCurrentConstruction = () => {
    if (typeof window === 'undefined') return null;
    
    const constructionData = localStorage.getItem('current_construction');
    if (!constructionData) return null;
    
    try {
      return JSON.parse(constructionData);
    } catch (e) {
      console.error('건설 데이터 파싱 오류:', e);
      return null;
    }
  };
  
  // 현재 건설 중인 건물 정보
  const currentConstruction = getCurrentConstruction();
  
  return (
    <div className="p-4 text-white bg-slate-900">
      <h2 className="text-2xl font-bold mb-6">건설</h2>
      
      {/* 현재 건설 중인 건물 표시 */}
      {currentConstruction && (
        <div className="mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold mb-3">현재 건설 중</h3>
          <div className="flex items-center mb-2">
            {getBuildingIcon(currentConstruction.buildingName, currentConstruction.category)}
            <span className="font-medium">{currentConstruction.buildingName}</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full">
            <div 
              className="bg-indigo-500 h-2 rounded-full" 
              style={{ width: `${Math.min(100, Math.max(0, (1 - currentConstruction.turnsLeft / (buildingTemplates.find(b => b.id === currentConstruction.buildingId)?.buildTime || 1)) * 100))}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1 text-slate-400">{currentConstruction.turnsLeft}턴 남음</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">도시 목록</h3>
            <button 
              onClick={() => setShowConstructionModal(true)} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm flex items-center"
            >
              <Plus size={16} className="mr-1" />
              새 건물 건설
            </button>
          </div>
          
          {cities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cities.map((city: City) => (
                <div 
                  key={city.id} 
                  className={`bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border ${
                    selectedCityId === city.id ? 'border-indigo-500' : 'border-slate-700'
                  } shadow-lg cursor-pointer hover:border-indigo-400 transition-colors`}
                  onClick={() => setSelectedCityId(city.id)}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mr-3">
                      <Building size={24} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">{city.name}</p>
                      <div className="flex text-xs text-slate-400 space-x-2">
                        <p>인구: {city.population}</p>
                        <p>위치: {getCityLocation(city.id)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {city.currentBuilding ? (
                    <div className="mt-3 bg-slate-800 p-3 rounded-md">
                      <div className="flex items-center mb-2">
                        <Clock size={16} className="mr-2 text-indigo-400" />
                        <span className="font-medium">건설 중</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">
                        {buildingTemplates.find(b => b.id === city.currentBuilding)?.name || '알 수 없는 건물'}
                      </p>
                      <div className="w-full bg-slate-700 h-2 rounded-full">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${city.turnsLeft ? 100 - (city.turnsLeft * 100 / (buildingTemplates.find(b => b.id === city.currentBuilding)?.turnsToBuild || buildingTemplates.find(b => b.id === city.currentBuilding)?.buildTime || 1)) : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-slate-400">{city.turnsLeft || '?'}턴 남음</p>
                    </div>
                  ) : (
                    <button 
                      className="w-full py-2 mt-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
                      onClick={(e) => {
                        e.stopPropagation(); // 클릭 이벤트 전파 방지
                        setSelectedCityId(city.id);
                        setShowConstructionModal(true);
                      }}
                    >
                      건설 시작
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 p-6 rounded-lg text-center border border-slate-700">
              <p className="text-slate-400">보유 중인 도시가 없습니다.</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-xl mb-4">도시 상세 정보</h3>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            {selectedCityId && getCityDetails(selectedCityId) ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg">{getCityDetails(selectedCityId)?.name}</h4>
                  <span className="text-xs bg-slate-600 px-2 py-1 rounded-full">
                    인구: {getCityDetails(selectedCityId)?.population}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-700 p-2 rounded">
                    <p className="text-xs text-slate-400">위치</p>
                    <p className="text-sm">{getCityLocation(selectedCityId)}</p>
                  </div>
                  
                  <div className="bg-slate-700 p-2 rounded">
                    <p className="text-xs text-slate-400">생산력</p>
                    <p className="text-sm">{getCityDetails(selectedCityId)?.buildProgress || 0} / 턴</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium text-lg mb-3">건설된 건물</h4>
                  
                  {Object.entries(cityBuildings)
                    .filter(([cityId]) => parseInt(cityId) === selectedCityId)
                    .flatMap(([, buildings]) => buildings).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(cityBuildings)
                        .filter(([cityId]) => parseInt(cityId) === selectedCityId)
                        .flatMap(([, buildings]) => buildings)
                        .map((building: CityBuilding) => {
                          const buildingTemplate = buildingTemplates.find(b => b.id === building.buildingId);
                          return buildingTemplate && (
                            <div key={building.id} className="bg-gradient-to-r from-slate-700 to-slate-800 p-3 rounded-lg flex justify-between items-center">
                              <div className="flex items-center">
                                {getBuildingIcon(buildingTemplate.name, buildingTemplate.category)}
                                <div>
                                  <span className="font-medium">{buildingTemplate.name}</span>
                                </div>
                              </div>
                              <span className="text-xs bg-slate-600 px-2 py-1 rounded-full">
                                유지비: {buildingTemplate.maintenance || buildingTemplate.maintenanceCost?.Gold || 0}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-4">건설된 건물이 없습니다.</p>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    setShowConstructionModal(true);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm mt-3"
                >
                  새 건물 건설
                </button>
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">선택된 도시가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 건물 건설 모달 */}
      {showConstructionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-slate-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">건물 건설</h3>
              <button 
                onClick={() => setShowConstructionModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col space-y-2 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="건물 이름으로 검색"
                  className="w-full rounded-md border border-gray-300 p-2 pl-3 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition-colors ${
                    categoryFilter === 'All'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('All')}
                >
                  <Building size={14} />
                  전체
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition-colors ${
                    categoryFilter === 'Production'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('Production')}
                >
                  <Hammer size={14} />
                  생산
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition-colors ${
                    categoryFilter === 'Science'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('Science')}
                >
                  <Library size={14} />
                  과학
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition-colors ${
                    categoryFilter === 'Trade'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('Trade')}
                >
                  <ShoppingBag size={14} />
                  무역
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition-colors ${
                    categoryFilter === 'Defense'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('Defense')}
                >
                  <Shield size={14} />
                  방어
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
              {filteredBuildings.map(building => {
                return (
                  <div 
                    key={building.id} 
                    className="border border-slate-700 p-4 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">{building.name}</h4>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
                        {building.turnsToBuild}턴
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center mr-3">
                        {getBuildingIcon(building.name, building.category)}
                      </div>
                      <p className="text-sm text-slate-300">{building.description}</p>
                    </div>
                    
                    <div className="bg-slate-800 p-3 rounded mb-3">
                      <h5 className="text-sm font-medium mb-2">효과:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {building.benefits ? building.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center bg-slate-700 px-2 py-1 rounded text-xs">
                            <span>✓</span>
                            <span className="ml-1">{benefit}</span>
                          </div>
                        )) : (
                          <div className="flex items-center bg-slate-700 px-2 py-1 rounded text-xs">
                            <span>✓</span>
                            <span className="ml-1">{building.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-3 bg-slate-800 p-2 rounded">
                      <div className="flex items-center">
                        <span className="mr-1">💰</span>
                        <span>비용: {building.cost || building.resourceCost?.Production || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">🔄</span>
                        <span>유지비: {building.maintenance || building.maintenanceCost?.Gold || 0}/턴</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (selectedCityId) {
                          handleStartConstruction(selectedCityId, building.id);
                        } else if (cities.length > 0) {
                          handleStartConstruction(cities[0].id, building.id);
                        } else {
                          showToast('건설할 도시가 없습니다.', 'error');
                        }
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
                    >
                      건설 시작
                    </button>
                  </div>
                );
              })}
            </div>
            
            {filteredBuildings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">검색 결과가 없습니다.</p>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowConstructionModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 