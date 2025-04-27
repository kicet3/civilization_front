import React, { useState } from 'react';
import UnitLibrary from './units/UnitLibrary';

interface EncyclopediaTabProps {}

/**
 * 게임 백과사전 탭 컴포넌트
 * 유닛, 기술, 건물 등의 정보를 제공하는 탭
 */
const EncyclopediaTab: React.FC<EncyclopediaTabProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('units');
  
  // 카테고리 선택 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* 상단 카테고리 탭 */}
      <div className="flex bg-slate-900 border-b border-slate-700">
        <button
          className={`px-4 py-3 text-sm font-medium ${
            selectedCategory === 'units' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => handleCategoryChange('units')}
        >
          유닛
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium ${
            selectedCategory === 'technologies' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => handleCategoryChange('technologies')}
        >
          기술
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium ${
            selectedCategory === 'buildings' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => handleCategoryChange('buildings')}
        >
          건물
        </button>
      </div>
      
      {/* 선택된 카테고리에 따른 컨텐츠 */}
      <div className="flex-grow overflow-auto">
        {selectedCategory === 'units' && <UnitLibrary />}
        {selectedCategory === 'technologies' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">기술 백과사전은 곧 추가될 예정입니다.</div>
          </div>
        )}
        {selectedCategory === 'buildings' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">건물 백과사전은 곧 추가될 예정입니다.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EncyclopediaTab; 