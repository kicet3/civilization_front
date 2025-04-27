import React, { useState, useEffect } from "react";
import { Unit } from "@/types/unit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

interface UnitProductionProps {
  onProduceUnit?: (unitId: number) => void;
}

const UnitProduction: React.FC<UnitProductionProps> = ({ onProduceUnit }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState<string>("Medieval");

  useEffect(() => {
    // 실제 환경에서는 API 호출로 대체할 수 있습니다
    const fetchUnits = async () => {
      try {
        setLoading(true);
        // 예시 데이터를 사용 (실제로는 API 호출)
        const response = {
          "success": true,
          "data": [
            {
              "id": 1,
              "name": "보병",
              "category": "Melee",
              "era": "Medieval",
              "maintenance": 1,
              "movement": 1,
              "sight": 1,
              "buildTime": 2,
              "prereqTechId": 1
            },
            {
              "id": 2,
              "name": "창병",
              "category": "Melee",
              "era": "Medieval",
              "maintenance": 1,
              "movement": 1,
              "sight": 1,
              "buildTime": 3,
              "prereqTechId": 2
            },
            {
              "id": 3,
              "name": "검병",
              "category": "Melee",
              "era": "Medieval",
              "maintenance": 1,
              "movement": 1,
              "sight": 1,
              "buildTime": 4,
              "prereqTechId": 4
            },
            {
              "id": 4,
              "name": "장창병",
              "category": "Melee",
              "era": "Medieval",
              "maintenance": 1,
              "movement": 1,
              "sight": 1,
              "buildTime": 3,
              "prereqTechId": 4
            },
            {
              "id": 5,
              "name": "궁수",
              "category": "Ranged",
              "era": "Medieval",
              "maintenance": 1,
              "movement": 1,
              "sight": 2,
              "buildTime": 3,
              "prereqTechId": 1
            },
            {
              "id": 6,
              "name": "석궁병",
              "category": "Ranged",
              "era": "Medieval",
              "maintenance": 1,
              "movement": 1,
              "sight": 2,
              "buildTime": 3,
              "prereqTechId": 4
            },
            {
              "id": 7,
              "name": "기마병",
              "category": "Cavalry",
              "era": "Medieval",
              "maintenance": 2,
              "movement": 2,
              "sight": 1,
              "buildTime": 4,
              "prereqTechId": 3
            },
            {
              "id": 8,
              "name": "용병",
              "category": "Cavalry",
              "era": "Medieval",
              "maintenance": 2,
              "movement": 2,
              "sight": 1,
              "buildTime": 5,
              "prereqTechId": 3
            },
            {
              "id": 9,
              "name": "머스킷병",
              "category": "Ranged",
              "era": "Industrial",
              "maintenance": 2,
              "movement": 1,
              "sight": 2,
              "buildTime": 4,
              "prereqTechId": 5
            },
            {
              "id": 10,
              "name": "랜서",
              "category": "Cavalry",
              "era": "Industrial",
              "maintenance": 2,
              "movement": 2,
              "sight": 1,
              "buildTime": 5,
              "prereqTechId": 7
            },
            {
              "id": 11,
              "name": "대포",
              "category": "Siege",
              "era": "Industrial",
              "maintenance": 3,
              "movement": 1,
              "sight": 2,
              "buildTime": 6,
              "prereqTechId": 6
            },
            {
              "id": 12,
              "name": "포병",
              "category": "Siege",
              "era": "Industrial",
              "maintenance": 3,
              "movement": 1,
              "sight": 2,
              "buildTime": 6,
              "prereqTechId": 6
            },
            {
              "id": 13,
              "name": "기관총 부대",
              "category": "Ranged",
              "era": "Industrial",
              "maintenance": 3,
              "movement": 1,
              "sight": 2,
              "buildTime": 4,
              "prereqTechId": 35
            },
            {
              "id": 14,
              "name": "소총병",
              "category": "Ranged",
              "era": "Industrial",
              "maintenance": 2,
              "movement": 1,
              "sight": 2,
              "buildTime": 4,
              "prereqTechId": 5
            },
            {
              "id": 15,
              "name": "장갑차",
              "category": "Modern",
              "era": "Modern",
              "maintenance": 4,
              "movement": 2,
              "sight": 2,
              "buildTime": 8,
              "prereqTechId": 8
            },
            {
              "id": 16,
              "name": "기갑사단",
              "category": "Modern",
              "era": "Modern",
              "maintenance": 5,
              "movement": 2,
              "sight": 2,
              "buildTime": 9,
              "prereqTechId": 8
            },
            {
              "id": 17,
              "name": "탱크",
              "category": "Modern",
              "era": "Modern",
              "maintenance": 5,
              "movement": 2,
              "sight": 2,
              "buildTime": 8,
              "prereqTechId": 8
            },
            {
              "id": 18,
              "name": "전투기",
              "category": "Modern",
              "era": "Modern",
              "maintenance": 4,
              "movement": 3,
              "sight": 3,
              "buildTime": 8,
              "prereqTechId": 9
            },
            {
              "id": 19,
              "name": "폭격기",
              "category": "Modern",
              "era": "Modern",
              "maintenance": 4,
              "movement": 3,
              "sight": 3,
              "buildTime": 9,
              "prereqTechId": 9
            },
            {
              "id": 20,
              "name": "정찰기",
              "category": "Modern",
              "era": "Modern",
              "maintenance": 3,
              "movement": 4,
              "sight": 4,
              "buildTime": 7,
              "prereqTechId": 9
            }
          ],
          "error": null
        };

        if (response.success) {
          setUnits(response.data);
        } else {
          setError(response.error || "유닛 데이터를 가져오지 못했습니다.");
        }
      } catch (err) {
        setError("유닛 데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const eras = [...new Set(units.map(unit => unit.era))];
  const categories = [...new Set(units.map(unit => unit.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">유닛 생산</h2>
      
      <Tabs defaultValue="Medieval" onValueChange={setSelectedEra}>
        <TabsList className="w-full">
          {eras.map(era => (
            <TabsTrigger key={era} value={era} className="flex-1">
              {era}
            </TabsTrigger>
          ))}
        </TabsList>

        {eras.map(era => (
          <TabsContent key={era} value={era}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {units
                .filter(unit => unit.era === era)
                .map(unit => (
                  <div 
                    key={unit.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{unit.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {unit.category}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm">
                      <p>유지비: {unit.maintenance}</p>
                      <p>이동력: {unit.movement}</p>
                      <p>시야: {unit.sight}</p>
                      <p>생산 시간: {unit.buildTime} 턴</p>
                    </div>
                    
                    <Button 
                      className="w-full mt-3"
                      onClick={() => onProduceUnit && onProduceUnit(unit.id)}
                    >
                      생산
                    </Button>
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UnitProduction; 