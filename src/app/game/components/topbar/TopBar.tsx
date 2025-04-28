import React from 'react';

interface Resources {
  food: number;
  production: number;
  gold: number;
  science: number;
  culture: number;
  faith?: number;
  happiness?: number;
}

interface TopBarProps {
  resources?: Resources;
  turn: number;
  year: number;
}

export default function TopBar({ resources, turn, year }: TopBarProps) {
  // 기본 리소스 값 설정
  const defaultResources: Resources = {
    food: 0,
    production: 0,
    gold: 0,
    science: 0,
    culture: 0
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

  // 연도 표시 형식 개선
  const formatYear = (year: number): string => {
    if (year < 0) {
      return `BC ${Math.abs(year)}년`;
    } else {
      return `AD ${year}년`;
    }
  };

  // 현재 시대 계산
  const { era, koreanEra } = getEra(year);

  // 리소스가 없는 경우 기본값 사용
  const safeResources = resources || defaultResources;

  return (
    <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700">
      {/* 왼쪽: 게임 정보 */}
      <div className="flex items-center">
        <div className="text-xl font-bold mr-4">문명 게임</div>
        <div className="text-sm flex space-x-3">
          <span>턴: {turn}</span>
          <span>년도: {formatYear(year)}</span>
          <span>시대: <span className="text-indigo-400 font-semibold">{koreanEra}</span></span>
        </div>
      </div>
      
      {/* 오른쪽: 리소스 정보 */}
      <div className="flex space-x-4 text-sm">
        <div className="flex items-center">
          <div className="px-2 py-0.5 bg-green-400 text-white rounded-full mr-2 text-xs">식량</div>
          <span>{safeResources.food}</span>
        </div>
        <div className="flex items-center">
          <div className="px-2 py-0.5 bg-red-400 text-white rounded-full mr-2 text-xs">생산력</div>
          <span>{safeResources.production}</span>
        </div>
        <div className="flex items-center">
          <div className="px-2 py-0.5 bg-yellow-400 text-white rounded-full mr-2 text-xs">금</div>
          <span>{safeResources.gold}</span>
        </div>
        <div className="flex items-center">
          <div className="px-2 py-0.5 bg-blue-400 text-white rounded-full mr-2 text-xs">과학</div>
          <span>{safeResources.science}</span>
        </div>
        <div className="flex items-center">
          <div className="px-2 py-0.5 bg-purple-400 text-white rounded-full mr-2 text-xs">문화</div>
          <span>{safeResources.culture}</span>
        </div>
      </div>
    </div>
  );
} 