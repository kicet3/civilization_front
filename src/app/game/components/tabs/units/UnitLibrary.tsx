import React, { useState, useEffect, useCallback } from 'react';
import { gameService } from '@/services';

interface Unit {
  id: number;
  name: string;
  category: string;
  era: string;
  maintenance: number;
  movement: number;
  sight: number;
  buildTime: number;
  prereqTechId: number | null;
}

interface UnitLibraryProps {
  onSelectUnit?: (unit: Unit) => void;
}

const UnitLibrary: React.FC<UnitLibraryProps> = ({ onSelectUnit }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  
  // 필터링 상태
  const [filter, setFilter] = useState({
    era: '',
    category: '',
    page: 0,
    limit: 10
  });
  
  // 유닛 목록 조회
  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        limit: filter.limit,
        offset: filter.page * filter.limit
      };
      
      if (filter.era) params.era = filter.era;
      if (filter.category) params.category = filter.category;
      
      const response = await gameService.getUnits(params);
      if (response.success && response.data) {
        setUnits(response.data);
      } else {
        setError(response.message || '유닛 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '유닛 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filter]);
  
  // 유닛 상세 정보 조회
  const fetchUnitDetail = useCallback(async (unitId: number) => {
    try {
      setLoading(true);
      const response = await gameService.getUnitDetail(unitId);
      if (response.success && response.data) {
        setSelectedUnit(response.data);
        if (onSelectUnit) onSelectUnit(response.data);
      } else {
        setError(response.message || '유닛 상세 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '유닛 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [onSelectUnit]);
  
  // 초기 로드
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);
  
  // 필터 변경 핸들러
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value,
      page: 0 // 필터 변경 시 페이지 리셋
    }));
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (direction: 'prev' | 'next') => {
    setFilter(prev => ({
      ...prev,
      page: direction === 'prev' ? Math.max(0, prev.page - 1) : prev.page + 1
    }));
  };
  
  return (
    <div className="flex flex-col h-full bg-slate-800 p-4 overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">유닛 백과사전</h2>
        <p className="text-slate-400">다양한 유닛 정보를 확인하세요</p>
      </div>
      
      {/* 필터 영역 */}
      <div className="flex space-x-4 mb-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">시대</label>
          <select
            name="era"
            value={filter.era}
            onChange={handleFilterChange}
            className="bg-slate-700 text-white px-3 py-2 rounded focus:outline-none"
          >
            <option value="">모든 시대</option>
            <option value="Medieval">중세</option>
            <option value="Industrial">산업</option>
            <option value="Modern">현대</option>
          </select>
        </div>
        
        <div>
          <label className="block text-slate-400 text-sm mb-1">유형</label>
          <select
            name="category"
            value={filter.category}
            onChange={handleFilterChange}
            className="bg-slate-700 text-white px-3 py-2 rounded focus:outline-none"
          >
            <option value="">모든 유형</option>
            <option value="Melee">근접</option>
            <option value="Ranged">원거리</option>
            <option value="Cavalry">기병</option>
            <option value="Siege">공성</option>
            <option value="Modern">현대</option>
            <option value="Civilian">민간</option>
          </select>
        </div>
      </div>
      
      {/* 로딩 및 에러 상태 */}
      {loading && <div className="text-white text-center py-4">로딩 중...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      
      {/* 유닛 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto flex-grow">
        {units.map(unit => (
          <div 
            key={unit.id}
            className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
            onClick={() => fetchUnitDetail(unit.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">{unit.name}</h3>
              <span className="text-sm text-slate-300">{unit.era}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">유형:</span>
                <span className="text-white">{unit.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">이동력:</span>
                <span className="text-white">{unit.movement}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">시야:</span>
                <span className="text-white">{unit.sight}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">생산 시간:</span>
                <span className="text-white">{unit.buildTime}턴</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 페이징 */}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={() => handlePageChange('prev')}
          disabled={filter.page === 0}
          className={`px-3 py-1 rounded ${filter.page === 0 ? 'bg-slate-700 text-slate-500' : 'bg-slate-600 text-white hover:bg-slate-500'}`}
        >
          이전
        </button>
        <span className="text-white px-3 py-1">페이지 {filter.page + 1}</span>
        <button
          onClick={() => handlePageChange('next')}
          disabled={units.length < filter.limit}
          className={`px-3 py-1 rounded ${units.length < filter.limit ? 'bg-slate-700 text-slate-500' : 'bg-slate-600 text-white hover:bg-slate-500'}`}
        >
          다음
        </button>
      </div>
      
      {/* 선택된 유닛 상세 정보 */}
      {selectedUnit && (
        <div className="mt-4 bg-slate-700 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-2">{selectedUnit.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400">시대: <span className="text-white">{selectedUnit.era}</span></p>
              <p className="text-slate-400">유형: <span className="text-white">{selectedUnit.category}</span></p>
              <p className="text-slate-400">유지비: <span className="text-white">{selectedUnit.maintenance}</span></p>
            </div>
            <div>
              <p className="text-slate-400">이동력: <span className="text-white">{selectedUnit.movement}</span></p>
              <p className="text-slate-400">시야: <span className="text-white">{selectedUnit.sight}</span></p>
              <p className="text-slate-400">생산 시간: <span className="text-white">{selectedUnit.buildTime}턴</span></p>
            </div>
          </div>
          {selectedUnit.prereqTechId && (
            <p className="text-slate-400 mt-2">필요 기술 ID: <span className="text-white">{selectedUnit.prereqTechId}</span></p>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitLibrary; 