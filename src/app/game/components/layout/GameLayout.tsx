import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GameLayoutProps {
  children: ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="w-full h-screen bg-slate-900 text-white overflow-hidden">
      {children}
    </div>
  );
} 