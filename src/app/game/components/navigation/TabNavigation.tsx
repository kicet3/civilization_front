import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Map, Beaker, Sword, Award, ChevronDown 
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
    { id: 'research', icon: Beaker, label: '연구' },
    { id: 'units', icon: Sword, label: '유닛' },
    { id: 'religion', icon: Award, label: '종교' },
    { id: 'turn', icon: ChevronDown, label: '턴' }
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