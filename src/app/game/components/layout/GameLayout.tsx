import React from 'react';
import { cn } from '@/lib/utils';

interface GameLayoutProps {
  children: React.ReactNode;
  topBar: React.ReactNode;
  leftNav: React.ReactNode;
  bottomPanel: React.ReactNode;
}

export default function GameLayout({
  children,
  topBar,
  leftNav,
  bottomPanel
}: GameLayoutProps) {
  return (
    <div className="h-[100vh] min-h-screen bg-slate-900 text-white flex flex-col">
      {/* 상단 네비게이션 */}
      <nav className="h-[7vh] bg-slate-800 p-2 flex items-center justify-center border-b border-slate-700">
        {topBar}
      </nav>
      
      <div className="h-[calc(100vh-3rem)] flex-1 flex flex-row">
        {/* 왼쪽 탭 네비게이션 */}
        <div className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4">
          {leftNav}
        </div>
        
        {/* 메인 콘텐츠 영역 */}
        <div className="h-[93vh] flex-1 flex flex-col overflow-hidden">
          <div className="h-[100%] flex-1 overflow-hidden">
            {children}
          </div>
          
          {/* 하단 패널 */}
          {bottomPanel}
        </div>
      </div>
    </div>
  );
} 