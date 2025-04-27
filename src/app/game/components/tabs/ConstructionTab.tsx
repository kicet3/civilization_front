import React, { useState } from 'react';
import { City } from '@/types/game';

interface Building {
  id: string;
  name: string;
  description: string;
  cost: number;
  turnsToBuild: number;
  category: 'production' | 'culture' | 'science' | 'defense' | 'utility';
  icon: string;
}

interface ConstructionTabProps {
  cities: City[];
  onConstructBuilding: (cityId: number, buildingId: string) => void;
}

const ConstructionTab: React.FC<ConstructionTabProps> = ({
  cities,
  onConstructBuilding
}) => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 임시 건물 데이터 (실제로는 API에서 가져올 것)
  const buildings: Building[] = [
    {
      id: 'granary',
      name: '곡물창고',
      description: '도시의 식량 생산을 증가시킵니다.',
      cost: 100,
      turnsToBuild: 5,
      category: 'production',
      icon: '🌾'
    },
    {
      id: 'library',
      name: '도서관',
      description: '과학 연구 속도를 증가시킵니다.',
      cost: 80,
      turnsToBuild: 4,
      category: 'science',
      icon: '📚'
    },
    {
      id: 'monument',
      name: '기념비',
      description: '문화 생산을 증가시킵니다.',
      cost: 60,
      turnsToBuild: 3,
      category: 'culture',
      icon: '🏛️'
    },
    {
      id: 'barracks',
      name: '병영',
      description: '군사 유닛의 경험치 획득을 증가시킵니다.',
      cost: 120,
      turnsToBuild: 6,
      category: 'defense',
      icon: '⚔️'
    },
    {
      id: 'market',
      name: '시장',
      description: '금화 생산을 증가시킵니다.',
      cost: 100,
      turnsToBuild: 5,
      category: 'utility',
      icon: '💰'
    }
  ];

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'production', name: '생산' },
    { id: 'culture', name: '문화' },
    { id: 'science', name: '과학' },
    { id: 'defense', name: '방어' },
    { id: 'utility', name: '유틸리티' }
  ];

  const filteredBuildings = selectedCategory === 'all'
    ? buildings
    : buildings.filter(building => building.category === selectedCategory);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
  };

  const handleConstructBuilding = (buildingId: string) => {
    if (selectedCity) {
      onConstructBuilding(selectedCity.id, buildingId);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">도시 선택</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => (
            <div
              key={city.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedCity?.id === city.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleCitySelect(city)}
            >
              <h3 className="font-bold">{city.name}</h3>
              <p className="text-sm text-gray-600">인구: {city.population}</p>
              <p className="text-sm text-gray-600">생산: {city.production}</p>
              {city.productionQueue && city.productionQueue.length > 0 && (
                <p className="text-sm text-gray-600">
                  건설 중: {city.productionQueue[0].name} ({city.productionQueue[0].turnsLeft}턴 남음)
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedCity && (
        <div>
          <h2 className="text-xl font-bold mb-4">건물 건설</h2>
          
          <div className="mb-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded-lg ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuildings.map((building) => (
              <div
                key={building.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{building.icon}</span>
                  <h3 className="font-bold">{building.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{building.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">비용: {building.cost}</p>
                    <p className="text-sm text-gray-600">건설 시간: {building.turnsToBuild}턴</p>
                  </div>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    onClick={() => handleConstructBuilding(building.id)}
                  >
                    건설
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionTab; 