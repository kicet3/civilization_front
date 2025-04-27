import React, { memo } from 'react';

interface TechDetailModalProps {
  techId: string;
  onClose: () => void;
  onResearch: (techId: string) => void;
}

const TechDetailModal: React.FC<TechDetailModalProps> = ({
  techId,
  onClose,
  onResearch
}) => {
  // 임시 데이터
  const techDetails = {
    writing: {
      name: '문자',
      description: '문자를 발명하여 기록과 의사소통을 가능하게 합니다.',
      cost: 50,
      era: 'ancient',
      benefits: ['도서관 건설 가능', '거래 기록 가능']
    },
    pottery: {
      name: '도자기',
      description: '흙을 구워 도자기를 만드는 기술을 개발합니다.',
      cost: 40,
      era: 'ancient',
      benefits: ['도자기 저장소 건설 가능', '식량 저장량 증가']
    }
  };

  const tech = techDetails[techId as keyof typeof techDetails];

  if (!tech) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">{tech.name}</h2>
        <p className="text-slate-300 mb-4">{tech.description}</p>
        
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-2">이점:</h3>
          <ul className="text-slate-300">
            {tech.benefits.map((benefit, index) => (
              <li key={index} className="mb-1">• {benefit}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => onResearch(techId)}
          >
            연구 시작 ({tech.cost} 과학)
          </button>
          <button
            className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(TechDetailModal); 