import React from 'react';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface LogEntry {
  type: 'system' | 'advisor' | 'event' | 'player';
  content: string;
  turn: number;
}

interface LogPanelProps {
  log: LogEntry[];
  commandInput: string;
  onCommandInputChange: (value: string) => void;
  onCommandSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  infoPanel: {
    open: boolean;
    type: 'tile' | 'city' | 'unit' | 'research' | 'policy' | null;
    data: any | null;
  };
  onInfoPanelClose: () => void;
}

export default function LogPanel({
  log,
  commandInput,
  onCommandInputChange,
  onCommandSubmit,
  infoPanel,
  onInfoPanelClose
}: LogPanelProps) {
  return (
    <div className="h-[25vh] bg-slate-800 border-t border-slate-700 flex">
      {/* 로그 영역 */}
      <div className="flex-1 p-3 overflow-auto flex flex-col-reverse">
        <div className="space-y-3">
          {log.slice().reverse().map((entry: LogEntry, idx: number) => (
            <div key={idx} className={cn(
              "p-2 rounded",
              entry.type === 'system' ? 'bg-slate-700 text-gray-300' :
              entry.type === 'advisor' ? 'bg-indigo-900' :
              entry.type === 'event' ? 'bg-amber-900' : 'bg-slate-600'
            )}>
              <div className="flex items-start">
                <div className="text-sm">
                  {entry.type === 'system' && <span className="font-bold text-xs mr-1">[시스템]</span>}
                  {entry.type === 'advisor' && <span className="font-bold text-xs mr-1">[조언자]</span>}
                  {entry.type === 'event' && <span className="font-bold text-xs mr-1">[이벤트]</span>}
                  {entry.type === 'player' && <span className="font-bold text-xs mr-1">[명령]</span>}
                  {entry.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 명령 입력 및 정보 패널 영역 */}
      <div className="w-1/3 border-l border-slate-700 p-3 flex flex-col">
        <div className="flex-1 overflow-auto mb-3">
          {/* 현재 선택된 타일/유닛/도시 정보 */}
          {infoPanel.open && infoPanel.data && (
            <div className="bg-slate-700 p-3 rounded mb-3">
              {/* 타일 정보 */}
              {infoPanel.type === 'tile' && (
                <>
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold">타일 정보</h4>
                    <button onClick={onInfoPanelClose}>✕</button>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>위치: ({infoPanel.data.q}, {infoPanel.data.r})</p>
                    <p>지형: {infoPanel.data.terrain}</p>
                    {infoPanel.data.resource && <p>자원: {infoPanel.data.resource}</p>}
                    {infoPanel.data.naturalWonder && <p>자연경관: {infoPanel.data.naturalWonder}</p>}
                    {infoPanel.data.city && <p>도시: {infoPanel.data.city.name} (인구: {infoPanel.data.city.population})</p>}
                    {infoPanel.data.unit && <p>유닛: {infoPanel.data.unit.typeName}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* 명령 입력 */}
        <form onSubmit={onCommandSubmit} className="flex">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => onCommandInputChange(e.target.value)}
            placeholder="명령을 입력하세요..."
            className="flex-1 bg-slate-700 rounded-l p-2 focus:outline-none"
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-4 rounded-r flex items-center"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
} 