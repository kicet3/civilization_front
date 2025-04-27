import React, { useState, useEffect, useCallback } from 'react';
import { Technology, ResearchState, ResearchQueueEntry } from '@/types/game';
import { gameService } from '@/services';
import { Beaker, ChevronRight, X, Plus, Info, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '../../context/GameContext';

interface ResearchTabProps {
  gameCivId?: number;
}

const TREE_TYPES = ['military', 'defense', 'economic', 'science', 'diplomacy'];
const TREE_TYPES_KR = {
  'military': '군사',
  'defense': '방어',
  'economic': '경제',
  'science': '과학',
  'diplomacy': '외교'
};

const ERAS = ['Medieval', 'Industrial', 'Modern'];
const ERAS_KR = {
  'Medieval': '중세',
  'Industrial': '산업',
  'Modern': '현대'
};

const ResearchTab: React.FC<ResearchTabProps> = ({ gameCivId = 1 }) => {
  // GameContext에서 데이터 가져오기
  const { 
    technologies, 
    researchState, 
    isLoading, 
    error, 
    loadResearchData,
    showToast
  } = useGame();
  
  const [researchQueue, setResearchQueue] = useState<ResearchQueueEntry[]>([]);
  const [treeSelection, setTreeSelection] = useState<{ main: string; sub: string | null }>({
    main: 'military',
    sub: null
  });
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);
  const [activeEra, setActiveEra] = useState<string>('Medieval');
  const [activeTreeType, setActiveTreeType] = useState<string>('military');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 마우스 이동 이벤트 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 기술 목록과 연구 상태 로드
  useEffect(() => {
    // GameContext에서 이미 데이터를 로드했으므로, 필요시 추가 데이터 로드
    const loadQueueData = async () => {
      try {
        const queueResult = await gameService.getResearchQueue(gameCivId);
        if (queueResult.success && queueResult.data) {
          setResearchQueue(queueResult.data);
        }
      } catch (err) {
        console.error('연구 큐 로드 실패:', err);
      }
    };
    
    loadQueueData();
    
    // 트리 선택 데이터가 있으면 활성화
    if (researchState?.treeSelection) {
      setActiveTreeType(researchState.treeSelection.main);
    }
  }, [gameCivId, researchState]);

  // 연구 시작
  const handleStartResearch = async (techId: number) => {
    try {
      const result = await gameService.startResearch(gameCivId, techId);
      if (result.success) {
        // 상태 업데이트
        await loadResearchData();
        showToast('연구를 시작했습니다.', 'success');
      }
    } catch (err) {
      showToast('연구 시작 실패', 'error');
    }
  };

  // 연구 큐에 추가
  const handleAddToQueue = async (techId: number) => {
    try {
      if (researchQueue.length >= 3) {
        showToast('연구 큐가 가득 찼습니다. (최대 3개)', 'warning');
        return;
      }
      
      const result = await gameService.addToResearchQueue(gameCivId, techId);
      if (result.success) {
        // 큐 상태 업데이트
        const queueResult = await gameService.getResearchQueue(gameCivId);
        if (queueResult.success && queueResult.data) {
          setResearchQueue(queueResult.data);
          showToast('연구 큐에 추가되었습니다.', 'success');
        }
      }
    } catch (err) {
      showToast('연구 큐 추가 실패', 'error');
    }
  };

  // 연구 큐에서 제거
  const handleRemoveFromQueue = async (queueId: number) => {
    try {
      const result = await gameService.removeFromResearchQueue(gameCivId, queueId);
      if (result.success) {
        // 큐 상태 업데이트
        const queueResult = await gameService.getResearchQueue(gameCivId);
        if (queueResult.success && queueResult.data) {
          setResearchQueue(queueResult.data);
          showToast('연구 큐에서 제거되었습니다.', 'info');
        }
      }
    } catch (err) {
      showToast('연구 큐 제거 실패', 'error');
    }
  };

  // 현재 연구 취소
  const handleCancelResearch = async () => {
    if (!researchState?.current?.techId) return;
    
    try {
      const result = await gameService.cancelResearch(gameCivId, researchState.current.techId);
      if (result.success) {
        await loadResearchData();
        showToast('연구가 취소되었습니다.', 'info');
      }
    } catch (err) {
      showToast('연구 취소 실패', 'error');
    }
  };

  // 트리 선택 변경
  const handleTreeSelection = async (main: string, sub?: string) => {
    try {
      const result = await gameService.setTreeSelection(gameCivId, main, sub || undefined);
      if (result.success && result.data) {
        // GameContext 업데이트
        await loadResearchData();
        setActiveTreeType(main);
      }
    } catch (err) {
      showToast('트리 선택 변경 실패', 'error');
    }
  };

  // 기술 카드 렌더링
  const renderTechCard = (tech: Technology) => {
    const isCompleted = researchState?.completed.includes(tech.id);
    const isInProgress = researchState?.current?.techId === tech.id;
    const isAvailable = researchState?.available.includes(tech.id);
    const isInQueue = researchQueue.some(q => q.techId === tech.id);
    
    // 기술이 현재 선택된 시대와 트리 타입에 맞는지 확인
    const matchesFilter = tech.era === activeEra && tech.treeType === activeTreeType;
    if (!matchesFilter) return null;
    
    // 화면 격자에 맞추어 위치 계산 (겹침 방지)
    const gridSize = 180; // 각 카드 사이의 간격
    const xPos = (tech.position?.x || 0) * gridSize + 50; // 여백 추가
    const yPos = (tech.position?.y || 0) * gridSize + 50; // 여백 추가
    
    // 한글로 변환된 시대와 트리 타입
    const eraKr = ERAS_KR[tech.era as keyof typeof ERAS_KR];
    const treeTypeKr = TREE_TYPES_KR[tech.treeType as keyof typeof TREE_TYPES_KR];
    
    return (
      <div 
        key={tech.id}
        className={cn(
          "relative w-40 h-32 rounded-lg border-2 flex flex-col justify-between p-3 text-xs cursor-pointer shadow-md",
          {
            "bg-blue-800 border-blue-400 shadow-blue-900/50": isInProgress,
            "bg-green-800 border-green-400 shadow-green-900/50": isCompleted && !isInProgress,
            "bg-slate-700 border-slate-500 shadow-slate-900/50": !isCompleted && !isInProgress && isAvailable,
            "bg-slate-900 border-slate-700 opacity-60 shadow-none": !isCompleted && !isInProgress && !isAvailable,
          }
        )}
        onClick={() => setSelectedTech(tech)}
        onMouseEnter={() => setHoveredTech(tech)}
        onMouseLeave={() => setHoveredTech(null)}
        style={{ 
          transition: 'all 0.15s ease-in-out',
        }}
      >
        <div className="font-semibold text-sm truncate mb-1">{tech.name}</div>
        
        {/* 상태 아이콘 */}
        <div className="absolute top-2 right-2">
          {isCompleted && <CheckCircle2 size={18} className="text-green-300" />}
          {!isCompleted && !isAvailable && <Lock size={18} className="text-slate-400" />}
          {isInProgress && <Beaker size={18} className="text-blue-300" />}
        </div>
        
        {/* 짧은 설명 */}
        <div className="text-[10px] text-slate-300 line-clamp-2 mb-2 h-8 overflow-hidden">
          {tech.description?.substring(0, 60)}
          {tech.description?.length > 60 ? '...' : ''}
        </div>
        
        {/* 진행 상태 표시바 */}
        {isInProgress && researchState?.current && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-600 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-blue-400" 
              style={{ width: `${(researchState.current.points / researchState.current.required) * 100}%` }}
            />
          </div>
        )}
        
        <div className="text-[10px] text-slate-400 truncate">{eraKr} • {treeTypeKr}</div>
      </div>
    );
  };

  // 연결선 렌더링 (선행 기술 -> 현재 기술)
  const renderTechConnections = () => {
    const gridSize = 180; // 각 카드 사이의 간격 (카드 렌더링 함수와 동일하게 유지)
    
    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {technologies.map(tech => {
          if (tech.era !== activeEra || tech.treeType !== activeTreeType) return null;
          if (!tech.prerequisites || tech.prerequisites.length === 0) return null;
          
          return tech.prerequisites.map(prereqId => {
            const prereq = technologies.find(t => t.id === prereqId);
            if (!prereq || prereq.era !== activeEra || prereq.treeType !== activeTreeType) return null;
            
            const fromX = ((prereq.position?.x || 0) * gridSize) + 50 + 80; // 중앙 (여백 + 카드 너비의 절반)
            const fromY = ((prereq.position?.y || 0) * gridSize) + 50 + 32; // 아래 (여백 + 카드 높이)
            const toX = ((tech.position?.x || 0) * gridSize) + 50 + 80; // 중앙 (여백 + 카드 너비의 절반)
            const toY = ((tech.position?.y || 0) * gridSize) + 50; // 위 (여백)
            
            const isCompleted = researchState?.completed.includes(prereq.id) && 
                                researchState?.completed.includes(tech.id);
            const isPartial = researchState?.completed.includes(prereq.id) && 
                               !researchState?.completed.includes(tech.id);
            
            return (
              <line 
                key={`${prereq.id}-${tech.id}`}
                x1={fromX} 
                y1={fromY} 
                x2={toX} 
                y2={toY}
                stroke={isCompleted ? "#4ade80" : isPartial ? "#60a5fa" : "#64748b"}
                strokeWidth={3}
                strokeDasharray={!isCompleted ? "6 3" : undefined}
              />
            );
          });
        })}
      </svg>
    );
  };

  // 기술 세부 정보 렌더링
  const renderTechDetails = (tech: Technology) => {
    const isCompleted = researchState?.completed.includes(tech.id);
    const isInProgress = researchState?.current?.techId === tech.id;
    const isAvailable = researchState?.available.includes(tech.id);
    const isInQueue = researchQueue.some(q => q.techId === tech.id);
    
    return (
      <div className="bg-slate-800 p-4 rounded-md shadow-md">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{tech.name}</h3>
          <span className="px-2 py-1 text-xs rounded-full bg-slate-700">{tech.era}</span>
        </div>
        
        <p className="text-sm mb-4">{tech.description}</p>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-1">연구 비용</h4>
          <div className="flex items-center text-sm">
            <Beaker size={16} className="mr-1 text-blue-400" />
            <span>{tech.researchCost} 과학</span>
            {tech.researchTimeModifier !== 1.0 && (
              <span className="ml-2 text-xs">
                (x{tech.researchTimeModifier} 소요 시간)
              </span>
            )}
          </div>
        </div>
        
        {tech.unlocks && tech.unlocks.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-1">해금 요소</h4>
            <ul className="text-sm">
              {tech.unlocks.map((unlock, idx) => (
                <li key={idx} className="flex items-center">
                  <ChevronRight size={14} className="mr-1 text-yellow-400" />
                  {unlock}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {tech.prerequisites && tech.prerequisites.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-1">필요 기술</h4>
            <div className="flex flex-wrap gap-1">
              {tech.prerequisites.map(prereqId => {
                const prereq = technologies.find(t => t.id === prereqId);
                const isPrereqCompleted = researchState?.completed.includes(prereqId);
                
                return prereq && (
                  <span 
                    key={prereqId}
                    className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      isPrereqCompleted ? "bg-green-900" : "bg-slate-700"
                    )}
                  >
                    {prereq.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {isAvailable && !isCompleted && !isInProgress && !isInQueue && (
            <>
              <button 
                className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 flex items-center"
                onClick={() => handleStartResearch(tech.id)}
              >
                <Beaker size={14} className="mr-1" />
                지금 연구
              </button>
              <button 
                className="px-3 py-1 text-sm rounded-md bg-slate-600 hover:bg-slate-700 flex items-center"
                onClick={() => handleAddToQueue(tech.id)}
                disabled={researchQueue.length >= 3}
              >
                <Plus size={14} className="mr-1" />
                큐에 추가
              </button>
            </>
          )}
          
          {isInProgress && (
            <button 
              className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 flex items-center"
              onClick={handleCancelResearch}
            >
              <X size={14} className="mr-1" />
              연구 취소
            </button>
          )}
          
          {isInQueue && (
            <div className="px-3 py-1 text-sm rounded-md bg-slate-700">
              연구 대기 중
            </div>
          )}
          
          {isCompleted && (
            <div className="px-3 py-1 text-sm rounded-md bg-green-700 flex items-center">
              <CheckCircle2 size={14} className="mr-1" />
              연구 완료
            </div>
          )}
        </div>
      </div>
    );
  };

  // 시대 선택 탭
  const renderEraTabs = () => {
    return (
      <div className="flex mb-4">
        {ERAS.map(era => (
          <button
            key={era}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-md",
              activeEra === era 
                ? "bg-slate-700 text-white" 
                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            )}
            onClick={() => setActiveEra(era)}
          >
            {ERAS_KR[era as keyof typeof ERAS_KR]}
          </button>
        ))}
      </div>
    );
  };

  // 트리 타입 선택 탭
  const renderTreeTypeTabs = () => {
    return (
      <div className="flex mb-6">
        {TREE_TYPES.map(treeType => (
          <button
            key={treeType}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md mr-2",
              activeTreeType === treeType 
                ? "bg-indigo-700 text-white" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            )}
            onClick={() => {
              setActiveTreeType(treeType);
              handleTreeSelection(treeType);
            }}
          >
            {TREE_TYPES_KR[treeType as keyof typeof TREE_TYPES_KR]}
          </button>
        ))}
      </div>
    );
  };

  // 기술 호버 툴팁
  const renderTechTooltip = () => {
    if (!hoveredTech || selectedTech) return null;
    
    const isAvailable = researchState?.available.includes(hoveredTech.id);
    const isCompleted = researchState?.completed.includes(hoveredTech.id);
    const isLocked = !isAvailable && !isCompleted;
    
    // 한글로 변환된 시대와 트리 타입
    const eraKr = ERAS_KR[hoveredTech.era as keyof typeof ERAS_KR];
    const treeTypeKr = TREE_TYPES_KR[hoveredTech.treeType as keyof typeof TREE_TYPES_KR];
    
    return (
      <div 
        className="fixed bg-slate-800 p-3 rounded shadow-lg max-w-xs z-40 border border-slate-700"
        style={{ 
          left: `${Math.min(window.innerWidth - 250, mousePosition.x + 10)}px`, 
          top: `${Math.min(window.innerHeight - 150, mousePosition.y + 10)}px` 
        }}
      >
        <h4 className="font-bold text-sm">{hoveredTech.name}</h4>
        <p className="text-xs mt-1">{hoveredTech.description}</p>
        <p className="text-xs text-slate-400 mt-1">{eraKr} 시대 • {treeTypeKr} 기술</p>
        <p className="text-xs text-blue-400 mt-1">연구 비용: {hoveredTech.researchCost} 과학</p>
        
        {/* 잠금된 기술에 대한 선행 연구 필요 메시지 */}
        {isLocked && hoveredTech.prerequisites && hoveredTech.prerequisites.length > 0 && (
          <div className="mt-1">
            <p className="text-xs text-red-400 font-semibold">선행 연구가 필요합니다:</p>
            <ul className="text-xs text-red-300">
              {hoveredTech.prerequisites.map(prereqId => {
                const prereq = technologies.find(t => t.id === prereqId);
                return prereq && (
                  <li key={prereqId} className="flex items-center mt-1">
                    <ChevronRight size={10} className="mr-1" />
                    {prereq.name}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {hoveredTech.unlocks && hoveredTech.unlocks.length > 0 && (
          <div className="mt-1">
            <p className="text-xs text-yellow-400">해금: {hoveredTech.unlocks.join(', ')}</p>
          </div>
        )}
      </div>
    );
  };

  // 현재 연구 중인 기술 정보
  const renderCurrentResearch = () => {
    if (!researchState?.current) {
      return (
        <div className="p-4 bg-slate-800 rounded-md mb-4">
          <p>현재 연구 중인 기술이 없습니다.</p>
          <p className="text-sm text-slate-400 mt-2">아래 기술 트리에서 연구할 기술을 선택하세요.</p>
        </div>
      );
    }
    
    const currentTech = technologies.find(t => t.id === researchState.current?.techId);
    if (!currentTech) return null;
    
    const progress = researchState.current.points / researchState.current.required * 100;
    
    return (
      <div className="p-4 bg-slate-800 rounded-md mb-4 relative">
        <div className="flex items-start">
          <div className="w-12 h-12 bg-blue-900 rounded-md flex items-center justify-center mr-4 flex-shrink-0">
            <Beaker size={24} className="text-blue-300" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{currentTech.name}</h3>
            <p className="text-sm text-slate-300">{currentTech.description}</p>
            
            <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span>{researchState.current.points}/{researchState.current.required} 과학</span>
              <span>약 {Math.ceil((researchState.current.required - researchState.current.points) / (researchState.science || 1))} 턴 남음</span>
            </div>
          </div>
        </div>
        
        <button 
          className="absolute top-4 right-4 p-1 rounded-full bg-slate-700 hover:bg-slate-600"
          onClick={handleCancelResearch}
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  // 연구 큐 렌더링
  const renderResearchQueue = () => {
    if (researchQueue.length === 0) {
      return (
        <div className="p-4 bg-slate-800 rounded-md mb-4">
          <p>연구 큐가 비어있습니다.</p>
          <p className="text-sm text-slate-400 mt-2">최대 3개의 기술을 큐에 추가할 수 있습니다.</p>
        </div>
      );
    }
    
    return (
      <div className="p-4 bg-slate-800 rounded-md mb-4">
        <h3 className="text-lg font-semibold mb-3">연구 큐</h3>
        
        <div className="space-y-2">
          {researchQueue.sort((a, b) => a.queuePosition - b.queuePosition).map(queue => {
            const tech = technologies.find(t => t.id === queue.techId);
            if (!tech) return null;
            
            return (
              <div key={queue.queueId} className="flex items-center justify-between p-2 bg-slate-700 rounded-md">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center mr-2">
                    {queue.queuePosition}
                  </span>
                  <span>{tech.name}</span>
                </div>
                
                <button 
                  className="p-1 rounded-full bg-slate-600 hover:bg-slate-500"
                  onClick={() => handleRemoveFromQueue(queue.queueId)}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 기술 트리 영역
  const renderTechTree = () => {
    return (
      <div className="relative w-full overflow-auto p-4 bg-slate-800 rounded-md">
        {/* 시대 선택 */}
        <div className="mb-4 flex space-x-2">
          <span className="text-sm flex items-center mr-2">시대:</span>
          {Object.keys(ERAS_KR).map(era => (
            <button
              key={era}
              className={`px-3 py-1 text-sm rounded ${
                activeEra === era 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              onClick={() => setActiveEra(era as string)}
            >
              {ERAS_KR[era as keyof typeof ERAS_KR]}
            </button>
          ))}
        </div>
        
        {/* 기술 트리 유형 선택 */}
        <div className="mb-4 flex space-x-2">
          <span className="text-sm flex items-center mr-2">유형:</span>
          {Object.keys(TREE_TYPES_KR).map(type => (
            <button
              key={type}
              className={`px-3 py-1 text-sm rounded flex items-center ${
                activeTreeType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              onClick={() => {
                setActiveTreeType(type as string);
                handleTreeSelection(type as string);
              }}
            >
              {TREE_TYPES_KR[type as keyof typeof TREE_TYPES_KR]}
            </button>
          ))}
        </div>
        
        <div className="relative min-h-[600px] w-[2000px]">
          {/* 기술 카드 렌더링 */}
          {technologies.filter(tech => tech.era === activeEra && tech.treeType === activeTreeType).map((tech, index) => {
            const xPos = (tech.position?.x || index) * 220 + 20; // position이 있으면 사용, 없으면 index 기반으로 배치
            const yPos = (tech.position?.y || 0) * 120 + 20; // position이 있으면 사용, 없으면 상단에 배치
            
            const isAvailable = researchState?.available.includes(tech.id);
            const isCompleted = researchState?.completed.includes(tech.id);
            const isResearching = researchState?.current?.techId === tech.id;
            const isLocked = !isAvailable && !isCompleted;
            const isInQueue = researchQueue.some(q => q.techId === tech.id);
            
            const statusClass = isResearching 
              ? 'border-blue-500 bg-blue-900/60' 
              : isCompleted 
                ? 'border-green-500 bg-green-900/30' 
                : isAvailable 
                  ? 'border-slate-400 bg-slate-800/90 hover:bg-slate-700/80' 
                  : 'border-red-900 bg-slate-800/70 opacity-60';
            
            // 한글로 변환된 시대와 트리 타입
            const eraKr = ERAS_KR[tech.era as keyof typeof ERAS_KR];
            const treeTypeKr = TREE_TYPES_KR[tech.treeType as keyof typeof TREE_TYPES_KR];
            
            return (
              <div
                key={tech.id}
                className={`absolute p-3 rounded-md border w-[200px] transition-all ${
                  statusClass
                } ${
                  selectedTech?.id === tech.id ? 'ring-2 ring-white' : ''
                }`}
                style={{
                  left: `${xPos}px`,
                  top: `${yPos}px`
                }}
                onClick={() => setSelectedTech(tech)}
                onMouseEnter={() => setHoveredTech(tech)}
                onMouseLeave={() => setHoveredTech(null)}
              >
                <div className="text-sm font-medium mb-1">{tech.name}</div>
                <div className="text-xs text-slate-400 mb-2 flex items-center">
                  <span className="mr-2">{eraKr}</span>
                  <span className="flex items-center">
                    {TREE_TYPES_KR[tech.treeType as keyof typeof TREE_TYPES_KR]}
                  </span>
                </div>
                
                {/* 연구 비용 또는 진행 상태 */}
                <div className="flex justify-between items-center mt-2 text-xs">
                  <div className="flex items-center">
                    <Beaker size={12} className="mr-1 text-blue-400" />
                    <span>{tech.researchCost}</span>
                  </div>
                  
                  {isCompleted && (
                    <span className="text-green-400 flex items-center">
                      <CheckCircle2 size={12} className="mr-1" />
                      완료
                    </span>
                  )}
                  
                  {isResearching && (
                    <span className="text-blue-400 flex items-center">
                      <Beaker size={12} className="mr-1" />
                      연구중
                    </span>
                  )}
                  
                  {isInQueue && !isResearching && (
                    <span className="text-yellow-400 flex items-center">
                      <Plus size={12} className="mr-1" />
                      큐에 추가됨
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* 선행 기술 연결선 렌더링 */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {technologies
              .filter(tech => tech.era === activeEra && tech.treeType === activeTreeType)
              .map(tech => {
                if (!tech.prerequisites || tech.prerequisites.length === 0) return null;
                
                return tech.prerequisites.map(prereqId => {
                  const prereq = technologies.find(t => t.id === prereqId && t.era === activeEra && t.treeType === activeTreeType);
                  if (!prereq) return null;
                  
                  const startX = (prereq.position?.x || 0) * 220 + 120; // 시작점 카드 중앙
                  const startY = (prereq.position?.y || 0) * 120 + 50; // 시작점 카드 아래
                  
                  const endX = (tech.position?.x || 0) * 220 + 120; // 종료점 카드 중앙
                  const endY = (tech.position?.y || 0) * 120 + 20; // 종료점 카드 위
                  
                  const isCompleted = researchState?.completed.includes(prereq.id) && 
                                     researchState?.completed.includes(tech.id);
                  const isPartial = researchState?.completed.includes(prereq.id) && 
                                   !researchState?.completed.includes(tech.id);
                  
                  return (
                    <line 
                      key={`${prereq.id}-${tech.id}`}
                      x1={startX} 
                      y1={startY} 
                      x2={endX} 
                      y2={endY}
                      stroke={isCompleted ? "#4ade80" : isPartial ? "#60a5fa" : "#64748b"}
                      strokeWidth={2}
                      strokeDasharray={!isCompleted ? "5 3" : undefined}
                    />
                  );
                });
              })}
          </svg>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-6">연구</h2>
        <div className="flex items-center justify-center h-64">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-6">연구</h2>
        <div className="bg-red-900 p-4 rounded-md">
          <p>오류: {error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-slate-700 rounded-md"
            onClick={loadResearchData}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-6">연구</h2>
      
      {/* 상단 연구 상태 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          {/* 현재 연구 진행 상태 */}
          {renderCurrentResearch()}
        </div>
        
        <div>
          {/* 연구 큐 */}
          {renderResearchQueue()}
        </div>
      </div>
      
      {/* 시대 탭 */}
      {renderEraTabs()}
      
      {/* 트리 타입 탭 */}
      {renderTreeTypeTabs()}
      
      {/* 기술 트리 영역 */}
      {renderTechTree()}
      
      {/* 선택된 기술 상세 정보 */}
      {selectedTech && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h3 className="text-xl font-bold">기술 상세 정보</h3>
              <button 
                className="p-1 rounded-full hover:bg-slate-700"
                onClick={() => setSelectedTech(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {renderTechDetails(selectedTech)}
            </div>
          </div>
        </div>
      )}
      
      {/* 기술 호버 툴팁 */}
      {renderTechTooltip()}
    </div>
  );
};

export default ResearchTab; 