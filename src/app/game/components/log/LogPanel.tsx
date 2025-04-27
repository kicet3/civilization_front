import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function LogPanel() {
  return (
    <div className="w-72 border-l border-slate-700 bg-slate-800 h-full flex flex-col">
      <div className="p-2 border-b border-slate-700 flex items-center">
        <MessageSquare size={18} className="mr-2" />
        <h3 className="font-medium text-sm">게임 로그</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 text-sm text-slate-300">
        <p className="mb-2 text-green-400">시스템: 게임이 시작되었습니다.</p>
        <p className="mb-2 text-blue-400">조언가: 새로운 문명의 지도자님, 환영합니다!</p>
        <p className="mb-2">이제 우리는 새로운 문명을 건설하여 역사에 이름을 남길 것입니다.</p>
      </div>
      
      <div className="p-2 border-t border-slate-700">
        <div className="relative">
          <input 
            type="text"
            placeholder="메시지 입력..."
            className="w-full bg-slate-700 text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled
          />
        </div>
      </div>
    </div>
  );
} 