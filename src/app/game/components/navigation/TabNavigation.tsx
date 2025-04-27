import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Map, User, Globe, IndentIncrease, Sword, Building
} from 'lucide-react';

interface TabNavigationProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({
  selectedTab,
  onTabChange
}: TabNavigationProps) {
  const tabs = [
    { id: 'map', icon: Map, label: '지도' },
    { id: 'research', icon: IndentIncrease, label: '연구' },
    { id: 'units', icon: User, label: '유닛' },
    { id: 'construction', icon: Building, label: '건설' },
    { id: 'turn', icon: Sword, label: '턴' },
    { id: 'diplomacy', icon: Globe, label: '외교' },
  ];

  return (
    <>
      {tabs.map(({ id, icon: Icon }) => (
        <button
          key={id}
          className={cn(
            "w-12 h-12 mb-4 rounded-lg flex items-center justify-center",
            selectedTab === id ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
          )}
          onClick={() => onTabChange(id)}
        >
          <Icon size={24} />
        </button>
      ))}
    </>
  );
} 