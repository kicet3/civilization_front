import React, { useState, useCallback } from 'react';
import TechTree from './TechTree';
import TechDetailModal from './TechDetailModal';
import ScienceBar from './ScienceBar';

interface ResearchPanelProps {
  onResearchComplete?: (techId: string) => void;
}

const ResearchPanel: React.FC<ResearchPanelProps> = ({ onResearchComplete }) => {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleTechClick = useCallback((techId: string) => {
    setSelectedTech(techId);
    setShowModal(true);
  }, []);

  const handleResearchStart = useCallback((techId: string) => {
    // 연구 시작 로직
    onResearchComplete?.(techId);
    setShowModal(false);
  }, [onResearchComplete]);

  return (
    <div className="flex flex-col h-full bg-slate-800 p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">연구 관리</h2>
        <ScienceBar current={50} max={100} />
      </div>
      
      <div className="flex-1 overflow-auto">
        <TechTree onTechClick={handleTechClick} />
      </div>

      {showModal && selectedTech && (
        <TechDetailModal
          techId={selectedTech}
          onClose={() => setShowModal(false)}
          onResearch={handleResearchStart}
        />
      )}
    </div>
  );
};

export default ResearchPanel; 