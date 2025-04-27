import React from 'react';
import { Technology } from '@/types/game';

interface ResearchTabProps {
  technologies: Technology[];
  currentResearch: Technology | null;
  onResearchSelect: (tech: Technology) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({
  technologies,
  currentResearch,
  onResearchSelect
}) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">연구</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technologies.map((tech) => (
          <div
            key={tech.id}
            className={`p-4 rounded-lg border ${
              currentResearch?.id === tech.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <h3 className="font-bold">{tech.name}</h3>
            <p className="text-sm text-gray-600">{tech.description}</p>
            <div className="mt-2">
              <span className="text-sm font-medium">
                비용: {tech.cost} 과학
              </span>
            </div>
            <button
              onClick={() => onResearchSelect(tech)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={currentResearch?.id === tech.id}
            >
              {currentResearch?.id === tech.id ? '연구 중...' : '연구 시작'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchTab; 