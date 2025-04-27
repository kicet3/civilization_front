import React, { memo } from 'react';

interface ScienceBarProps {
  current: number;
  max: number;
}

const ScienceBar: React.FC<ScienceBarProps> = ({ current, max }) => {
  const percentage = (current / max) * 100;

  return (
    <div className="w-full bg-slate-700 rounded-full h-4">
      <div
        className="bg-blue-500 h-full rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
      <div className="text-white text-sm mt-1">
        {current} / {max} 과학
      </div>
    </div>
  );
};

export default memo(ScienceBar); 