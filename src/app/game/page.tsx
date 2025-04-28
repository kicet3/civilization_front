"use client";

import React, { lazy, Suspense } from 'react';
import { useGame } from './context/GameContext';
import GameLayout from './components/layout/GameLayout';
import TabNavigation from './components/navigation/TabNavigation';
import LogPanel from './components/log/LogPanel';
import TopBar from './components/topbar/TopBar';

// 지연 로딩을 위한 탭 컴포넌트
const MapTab = lazy(() => import('./components/tabs/MapTab'));
const ResearchTab = lazy(() => import('./components/tabs/ResearchTab'));
const UnitsTab = lazy(() => import('./components/tabs/UnitsTab'));
const TurnTab = lazy(() => import('./components/tabs/TurnTab'));
const DiplomacyTab = lazy(() => import('./components/tabs/DiplomacyTab'));
const ConstructionTab = lazy(() => import('./components/tabs/ConstructionTab'));

// 로딩 중 표시할 컴포넌트
const TabLoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-white text-xl">로딩 중...</div>
  </div>
);

export default function GamePage() {
  // GameContext에서 상태 가져오기
  const { 
    gameState, 
    isLoading, 
    selectedTab, 
    setSelectedTab,
    endTurn
  } = useGame();

  // 탭 전환 핸들러
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  // 탭 콘텐츠 렌더링
  const renderTabContent = () => {
    if (isLoading) {
      return <TabLoadingFallback />;
    }

    switch (selectedTab) {
      case 'map':
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <MapTab />
          </Suspense>
        );
      case 'research':
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <ResearchTab />
          </Suspense>
        );
      case 'units':
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <UnitsTab />
          </Suspense>
        );
      case 'construction':
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <ConstructionTab />
          </Suspense>
        );
      case 'turn':
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <TurnTab onEndTurn={endTurn} />
          </Suspense>
        );
      case 'diplomacy':
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <DiplomacyTab />
          </Suspense>
        );
      default:
        return <div>탭을 선택해주세요.</div>;
    }
  };

  return (
    <GameLayout>
      <div className="w-full h-full flex flex-col">
        {/* 상단 바 */}
        <TopBar 
          resources={gameState?.resources} 
          turn={gameState?.turn || 1} 
          year={gameState?.year || 1000} 
        />
        
        <div className="flex flex-grow overflow-hidden">
          {/* 좌측 네비게이션 */}
          <div className="w-16 bg-slate-800 p-2 flex flex-col items-center">
            <TabNavigation 
              selectedTab={selectedTab} 
              onTabChange={handleTabChange} 
            />
          </div>
          
          {/* 메인 콘텐츠 */}
          <div className="flex-grow overflow-auto bg-slate-900">
            {renderTabContent()}
          </div>
          
          {/* 우측 로그 패널 - 너비 고정 */}
          {selectedTab !== 'diplomacy' && (
            <div className="w-72 flex-shrink-0">
              <LogPanel />
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}