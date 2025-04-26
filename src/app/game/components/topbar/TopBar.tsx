import React from 'react';

interface Resources {
  food: number;
  production: number;
  gold: number;
  science: number;
  culture: number;
  faith: number;
  happiness: number;
}

interface TopBarProps {
  turn: number;
  year: number;
  resources: Resources;
}

export default function TopBar({ turn, year, resources }: TopBarProps) {
  return (
    <>
      <div className="fixed left-5 flex items-center">
        <span className="font-bold text-lg">문명</span>
      </div>
      <div className="flex space-x-6">
        <div className="flex items-center">
          <span className="font-bold">턴: {turn}</span>
        </div>
        <div className="flex items-center">
          <span>{year < 0 ? `BC ${Math.abs(year)}` : `AD ${year}`}</span>
        </div>
      </div>
      <div className="fixed flex items-center space-x-4 right-4">
        {/* 자원 표시 */}
        <div className="flex items-center space-x-4 text-base">
          <div className="flex items-center">
            <div className="px-2 py-0.5 bg-green-400 text-white rounded-full mr-2 text-xs">식량</div>
            <span>{resources.food}</span>
          </div>
          <div className="flex items-center">
            <div className="px-2 py-0.5 bg-red-400 text-white rounded-full mr-2 text-xs">생산력</div>
            <span>{resources.production}</span>
          </div>
          <div className="flex items-center">
            <div className="px-2 py-0.5 bg-yellow-400 text-white rounded-full mr-2 text-xs">골드</div>
            <span>{resources.gold}</span>
          </div>
          <div className="flex items-center">
            <div className="px-2 py-0.5 bg-blue-400 text-white rounded-full mr-2 text-xs">과학</div>
            <span>{resources.science}</span>
          </div>
          <div className="flex items-center">
            <div className="px-2 py-0.5 bg-purple-400 text-white rounded-full mr-2 text-xs">문화</div>
            <span>{resources.culture}</span>
          </div>
          <div className="flex items-center">
            <div className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full mr-2 text-xs">신앙</div>
            <span>{resources.faith}</span>
          </div>
        </div>
      </div>
    </>
  );
} 