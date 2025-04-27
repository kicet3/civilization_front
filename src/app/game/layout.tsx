"use client";

import React from 'react';
import { GameProvider } from './context/GameContext';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <div className="w-full h-screen bg-slate-900 text-white overflow-hidden">
        {children}
      </div>
    </GameProvider>
  );
} 