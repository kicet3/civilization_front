import React, { memo } from 'react';

interface TechTreeProps {
  onTechClick: (techId: string) => void;
}

const TechTree: React.FC<TechTreeProps> = ({ onTechClick }) => {
  // 임시 데이터
  const techs = [
    { id: 'writing', name: '문자', era: 'ancient', prerequisites: [] },
    { id: 'pottery', name: '도자기', era: 'ancient', prerequisites: [] },
    { id: 'mining', name: '채굴', era: 'ancient', prerequisites: [] },
    { id: 'masonry', name: '석공', era: 'ancient', prerequisites: ['mining'] },
    { id: 'bronze_working', name: '청동기', era: 'ancient', prerequisites: ['mining'] },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {techs.map(tech => (
        <div
          key={tech.id}
          className="bg-slate-700 p-4 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
          onClick={() => onTechClick(tech.id)}
        >
          <h3 className="text-white font-semibold">{tech.name}</h3>
          <p className="text-slate-400 text-sm">{tech.era}</p>
          {tech.prerequisites.length > 0 && (
            <div className="mt-2">
              <p className="text-slate-400 text-xs">필요 기술:</p>
              <ul className="text-slate-400 text-xs">
                {tech.prerequisites.map(prereq => (
                  <li key={prereq}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default memo(TechTree); 