import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Unit, City, HexTile } from '@/types/game';
import gameService from '@/services/gameService';
import Spinner from "@/components/ui/spinner";
import { toast } from 'sonner';
import { Map, X } from 'lucide-react';
import HexMap from './map/HexMap';
import { useGame } from '../../context/GameContext';

// 유닛 카테고리 타입 정의
type UnitCategory = 'Melee' | 'Ranged' | 'Cavalry' | 'Siege' | 'Modern' | 'Civilian' | 'All';

// 시대 타입 정의
type EraType = 'Medieval' | 'Industrial' | 'Modern' | 'All';

// 유닛 템플릿 인터페이스
interface UnitTemplate {
  id: number;
  name: string;
  category: UnitCategory;
  era: EraType;
  maintenance: number;
  movement: number;
  sight: number;
  buildTime: number;
  prereqTechId: number;
  description?: string; // API에서 제공하지 않으면 선택적으로 설정
  strength?: number;    // API에서 제공하지 않으면 선택적으로 설정
  cost?: number;        // API에서 제공하지 않으면 선택적으로 설정
  abilities?: string[]; // API에서 제공하지 않으면 선택적으로 설정
  prereqTech?: string;  // API에서 제공하지 않으면 선택적으로 설정
}

interface GameState {
  units: Unit[];
  cities: City[];
  currentPlayer: string;
}

const UnitsTab: React.FC = () => {
  const { gameState, showToast, mapData } = useGame();
  const [state, setState] = useState<GameState>({
    units: [],
    cities: [],
    currentPlayer: 'player1'
  });
  const [unitTemplates, setUnitTemplates] = useState<UnitTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<UnitCategory>('All');
  const [eraFilter, setEraFilter] = useState<EraType>('All');
  
  // 위치 선택 관련 상태
  const [selectedUnit, setSelectedUnit] = useState<UnitTemplate | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [selectedTile, setSelectedTile] = useState<HexTile | null>(null);

  // API에서 유닛 템플릿 가져오기
  useEffect(() => {
    const fetchUnitTemplates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 직접 API 호출로 변경
        const response = await fetch('http://localhost:8000/units/');
        const data = await response.json();
        
        if (data && data.success && data.data) {
          setUnitTemplates(data.data);
        } else {
          setError('유닛 데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('API 호출 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitTemplates();
  }, []);

  // 게임 상태를 불러오는 효과
  useEffect(() => {
    // 실제 구현에서는 실제 게임 상태를 불러오는 코드로 대체
    // 여기서는 더미 데이터로 대체
    setState({
      units: [],
      cities: [],
      currentPlayer: 'player1'
    });
  }, []);

  // 유닛 생산 시작 전 확인 핸들러
  const handleConfirmProduction = (unitId: number) => {
    const selectedUnit = unitTemplates.find(unit => unit.id === unitId);
    if (!selectedUnit) {
      toast.error('선택한 유닛 정보를 찾을 수 없습니다.');
      return;
    }
    
    // 재화 확인 (게임 상태에서 보유한 생산력 확인)
    const availableProduction = gameState?.resources?.production || 0;
    const unitCost = selectedUnit.cost || 0;
    
    if (availableProduction < unitCost) {
      toast.error(`유닛 생산에 필요한 생산력이 부족합니다. (필요: ${unitCost}, 보유: ${availableProduction})`);
      return;
    }
    
    // 유닛 정보 저장하고 위치 선택 모달 열기
    setSelectedUnit(selectedUnit);
    setIsLocationModalOpen(true);
    setIsModalOpen(false); // 기존 모달 닫기
  };
  
  // 취소 함수
  const handleCancelProduction = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('current_unit_production');
    toast.success('유닛 생산이 취소되었습니다.');
    
    // UI 리렌더링을 위한 이벤트 발생
    window.dispatchEvent(new Event('storage'));
  };
  
  // 위치 선택 후 유닛 생산 최종 확정
  const handleStartProduction = (tile: HexTile) => {
    if (!selectedUnit) {
      toast.error('선택한 유닛 정보가 없습니다.');
      return;
    }
    
    setLoadingProduction(true);
    try {
      // 재화 차감 (실제로는 서버에서 처리될 예정)
      const unitCost = selectedUnit.cost || 0;
      const currentProduction = gameState?.resources?.production || 0;
      const newProduction = currentProduction - unitCost;
      
      // 로컬 스토리지에 생산 정보 저장 (위치 정보 포함)
      const productionData = {
        unitId: selectedUnit.id,
        unitName: selectedUnit.name,
        unitCategory: selectedUnit.category,
        turnsLeft: selectedUnit.buildTime,
        startedAt: new Date().toISOString(),
        location: {
          q: tile.q,
          r: tile.r,
          s: tile.s
        },
        cost: unitCost
      };
      
      localStorage.setItem('current_unit_production', JSON.stringify(productionData));
      
      // 재화 차감 정보 저장 (실제로는 턴 종료 시 서버에서 처리)
      if (gameState && gameState.resources) {
        const updatedResources = {
          ...gameState.resources,
          production: newProduction
        };
        localStorage.setItem('temp_resources', JSON.stringify(updatedResources));
      }
      
      toast.success(`${selectedUnit.name} 생산을 시작했습니다. (${selectedUnit.buildTime}턴 소요)`);
      
      // 상태 업데이트
      setIsLocationModalOpen(false);
      setSelectedUnit(null);
      setSelectedTile(null);
      
      // 턴 종료시 API로 전송하도록 수정
      console.log('유닛 생산 정보가 저장되었습니다. 턴 종료시 서버로 전송됩니다:', productionData);
    } catch (err) {
      console.error('유닛 생산 시작 실패:', err);
      toast.error('유닛 생산 시작에 실패했습니다.');
    } finally {
      setLoadingProduction(false);
    }
  };

  // 유닛 목록 필터링
  const filteredUnits = state.units.filter((unit: Unit) => 
    unit.typeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 내 도시 목록
  const myCities = state.cities.filter((city: City) => city.owner === state.currentPlayer);
  
  // 유닛 템플릿 필터링 - 검색어, 카테고리, 시대에 따라 필터링
  const filteredTemplates = unitTemplates.filter(template => {
    const nameMatch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = categoryFilter === 'All' || template.category === categoryFilter;
    const eraMatch = eraFilter === 'All' || template.era === eraFilter;
    
    return nameMatch && categoryMatch && eraMatch;
  });

  const categories: UnitCategory[] = ['All', 'Melee', 'Ranged', 'Cavalry', 'Siege', 'Modern', 'Civilian'];
  const eras: EraType[] = ['All', 'Medieval', 'Industrial', 'Modern'];

  // 현재 생산 중인 유닛 정보 가져오기
  const getCurrentProduction = () => {
    if (typeof window === 'undefined') return null;
    
    const productionData = localStorage.getItem('current_unit_production');
    if (!productionData) return null;
    
    try {
      return JSON.parse(productionData);
    } catch (e) {
      console.error('유닛 생산 데이터 파싱 오류:', e);
      return null;
    }
  };
  
  // 현재 생산 중인 유닛 정보
  const currentProduction = getCurrentProduction();

  return (
    <div className="p-4 h-full bg-slate-900 text-white">
      <Tabs defaultValue="current">
        <TabsList className="mb-4 bg-slate-800">
          <TabsTrigger value="current" className="data-[state=active]:bg-slate-700">현재 유닛</TabsTrigger>
          <TabsTrigger value="production" className="data-[state=active]:bg-slate-700">유닛 생산</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="flex justify-between mb-4">
            <Input
              placeholder="유닛 검색..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {filteredUnits.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-lg">
              <p className="text-slate-400">보유한 유닛이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnits.map(unit => (
                <div key={unit.id} className="border border-slate-700 p-4 rounded-lg shadow bg-slate-800">
                  <h3 className="font-semibold text-lg">{unit.typeName}</h3>
                  <p>위치: ({unit.location.q}, {unit.location.r})</p>
                  <p>이동력: {unit.movement}/{unit.maxMovement}</p>
                  <p>체력: {unit.hp}/{unit.maxHp}</p>
                  <p>상태: {unit.hasActed ? '행동 완료' : '대기 중'}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <div className="flex justify-between mb-4">
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              유닛 생산 시작
            </Button>
          </div>
          
          {/* 현재 생산 중인 유닛 표시 */}
          {currentProduction && (
            <div className="mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-3">현재 생산 중</h3>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleCancelProduction}
                >
                  <X size={16} />
                  취소
                </Button>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center mr-3">
                  {currentProduction.unitCategory === 'Melee' ? '⚔️' : 
                   currentProduction.unitCategory === 'Ranged' ? '🏹' :
                   currentProduction.unitCategory === 'Cavalry' ? '🐎' :
                   currentProduction.unitCategory === 'Siege' ? '🛡️' :
                   currentProduction.unitCategory === 'Modern' ? '🔫' : '👨‍🚀'}
                </div>
                <span className="font-medium">{currentProduction.unitName}</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full">
                <div 
                  className="bg-indigo-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(0, (1 - Number(currentProduction.turnsLeft) / (unitTemplates.find(u => u.id === Number(currentProduction.unitId))?.buildTime || 1)) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <p className="text-slate-400">{currentProduction.turnsLeft}턴 남음</p>
                
                {currentProduction.location && (
                  <p className="text-slate-400">
                    배치 위치: ({currentProduction.location.q}, {currentProduction.location.r})
                  </p>
                )}
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-slate-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">유닛 생산</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-slate-300">유닛 검색:</label>
                  <Input
                    placeholder="유닛 이름으로 검색..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="mb-6">
                  <div className="mb-4">
                    <label className="block mb-2 text-slate-300">카테고리:</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Button
                          key={category}
                          variant={categoryFilter === category ? "default" : "outline"}
                          onClick={() => setCategoryFilter(category)}
                          size="sm"
                          className={categoryFilter === category 
                            ? "bg-indigo-600 hover:bg-indigo-700" 
                            : "border-slate-600 text-slate-300 hover:bg-slate-800"}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-slate-300">시대:</label>
                    <div className="flex flex-wrap gap-2">
                      {eras.map(era => (
                        <Button
                          key={era}
                          variant={eraFilter === era ? "default" : "outline"}
                          onClick={() => setEraFilter(era)}
                          size="sm"
                          className={eraFilter === era 
                            ? "bg-indigo-600 hover:bg-indigo-700" 
                            : "border-slate-600 text-slate-300 hover:bg-slate-800"}
                        >
                          {era}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center my-12">
                    <Spinner className="h-8 w-8 text-indigo-500" />
                  </div>
                ) : error ? (
                  <div className="text-red-400 text-center my-12 p-4 bg-red-900/20 rounded-lg border border-red-900">
                    {error}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {filteredTemplates.map(unit => (
                      <div key={unit.id} className="border border-slate-700 p-4 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{unit.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${unit.category === 'Melee' ? 'bg-red-600 text-white' : 
                            unit.category === 'Ranged' ? 'bg-blue-600 text-white' : 
                            unit.category === 'Cavalry' ? 'bg-yellow-600 text-black' : 
                            unit.category === 'Siege' ? 'bg-purple-600 text-white' : 
                            unit.category === 'Modern' ? 'bg-green-600 text-white' : 
                            'bg-gray-600 text-white'}`}>
                            {unit.category}
                          </span>
                        </div>
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center mr-3">
                            {unit.category === 'Melee' ? '⚔️' : 
                             unit.category === 'Ranged' ? '🏹' :
                             unit.category === 'Cavalry' ? '🐎' :
                             unit.category === 'Siege' ? '🛡️' :
                             unit.category === 'Modern' ? '🔫' : '👨‍🚀'}
                          </div>
                          <p className="text-sm text-slate-300">
                            {unit.era} 시대 • {unit.category} 유닛
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3 bg-slate-800 p-3 rounded">
                          <div className="flex items-center">
                            <span className="mr-2">🏃</span>
                            <p>이동력: {unit.movement}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">👁️</span>
                            <p>시야: {unit.sight}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">💰</span>
                            <p>유지비: {unit.maintenance}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">⏱️</span>
                            <p>생산: {unit.buildTime}턴</p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs bg-slate-800 p-2 rounded mb-3">
                          <p className="flex items-center">
                            <span className="mr-2">🔬</span>
                            필요 기술 ID: {unit.prereqTechId}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleConfirmProduction(unit.id)}
                          disabled={loadingProduction}
                          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400"
                        >
                          {loadingProduction ? <Spinner className="h-4 w-4" /> : '생산 시작'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-6 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 위치 선택 모달 */}
          {isLocationModalOpen && selectedUnit && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-slate-900 rounded-lg p-6 w-full max-w-4xl h-[80vh] overflow-auto border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">유닛 배치 위치 선택</h2>
                  <button 
                    onClick={() => setIsLocationModalOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-slate-300">
                    <span className="font-bold">{selectedUnit.name}</span> 유닛을 배치할 위치를 선택하세요.
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    도시 주변 타일에만 배치할 수 있습니다. (이동력: {selectedUnit.movement})
                  </p>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-md mb-4 h-[60vh] flex items-center justify-center">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {/* HexMap을 위치 선택용으로 표시 */}
                    <div className="w-full h-96 mb-4">
                      <HexMap
                        hexagons={mapData}
                        selectedTile={selectedTile}
                        onTileClick={(tile) => setSelectedTile(tile)}
                      />
                    </div>
                    <p className="text-slate-400 text-center mt-2">
                      원하는 위치의 타일을 클릭하여 유닛 배치 위치를 선택하세요.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsLocationModalOpen(false)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    취소
                  </Button>
                  <Button 
                    disabled={!selectedTile || loadingProduction}
                    onClick={() => selectedTile && handleStartProduction(selectedTile)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loadingProduction ? <Spinner className="h-4 w-4" /> : '위치 확정'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4 text-slate-200">생산 중인 유닛</h3>
            {myCities.filter(city => city.production && city.turnsLeft !== undefined && city.turnsLeft > 0).length === 0 ? (
              <div className="text-center py-12 bg-slate-800 rounded-lg">
                <p className="text-slate-400">현재 생산 중인 유닛이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCities
                  .filter(city => city.production && city.turnsLeft !== undefined && city.turnsLeft > 0)
                  .map(city => (
                    <div key={city.id} className="border border-slate-700 p-4 rounded-lg shadow bg-slate-800">
                      <h4 className="font-medium text-white">{city.name}</h4>
                      <p className="text-slate-300">생산 중: {city.production}</p>
                      <p className="text-slate-300">남은 턴: {city.turnsLeft}</p>
                      <div className="w-full bg-slate-700 h-2 rounded-full mt-3">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${city.turnsLeft ? 100 - (city.turnsLeft * 100 / (city.turnsLeft || 1)) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnitsTab; 