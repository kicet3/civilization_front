import React, { useState } from "react";
import UnitProduction from "./UnitProduction";

const UnitDemo: React.FC = () => {
  const [producedUnits, setProducedUnits] = useState<number[]>([]);

  const handleProduceUnit = (unitId: number) => {
    setProducedUnits(prev => [...prev, unitId]);
    alert(`유닛 ID: ${unitId}가 생산 대기열에 추가되었습니다.`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">유닛 생산 시스템</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <UnitProduction onProduceUnit={handleProduceUnit} />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">생산 대기열</h2>
          {producedUnits.length > 0 ? (
            <ul className="space-y-2">
              {producedUnits.map((unitId, index) => (
                <li key={index} className="bg-white p-2 rounded border">
                  유닛 ID: {unitId}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">생산 대기열이 비어 있습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitDemo; 