"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, Clock, Calendar, Users, Globe, Wand2, Zap, Award, PlayCircle, Map, Star, User, Sword,
  Save, Loader2, XCircle, CheckCircle, Lock, Database, School, Castle, BookOpen, Milestone, Mountain,
  Crown, GraduationCap, Library, Landmark, Shell, Ship, Sparkles
} from 'lucide-react';
import { gameService } from '@/services';

export default function GameModeSelect() {
  const router = useRouter();
  
  // 게임 선택 상태
  const [selectedMode, setSelectedMode] = useState<string | null>('short');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>('easy');
  const [selectedCivilization, setSelectedCivilization] = useState<string | null>('korea');
  const [selectedMapType, setSelectedMapType] = useState<string | null>('small_continents');
  const [selectedCivCount, setSelectedCivCount] = useState<number>(6);
  const [step, setStep] = useState(1);

  // 초기 선택 상태
  const [showInitialChoice, setShowInitialChoice] = useState(true);
  const [loadGameMode, setLoadGameMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [registrationType, setRegistrationType] = useState<'login' | 'register'>('login');

  // 고정 데이터 (API 응답 대신 사용)
  const gameModes = [
    {
      id: 'short',
      name: '짧은 게임',
      estimatedTime: '약 1시간',
      description: '빠르게 진행되는 게임 모드로, 기본 규칙이 적용됩니다.'
    }
  ];

  const difficulties = [
    {
      id: 'easy',
      name: '쉬움',
      description: '초보자에게 적합한 난이도입니다. AI가 덜 공격적으로 행동합니다.'
    }
  ];

  const civilizations = [
    {
      id: 'korea',
      name: '한국',
      leader: '세종대왕',
      specialAbility: '과학과 기술 발전에 보너스'
    }
  ];

  const mapTypes = [
    {
      id: 'small_continents',
      name: '작은 대륙',
      description: '여러 작은 대륙으로 이루어진 지도입니다. 해상 확장에 유리합니다.'
    }
  ];

  // 문명 타입 정의
  const civTypes = [
    { type: 'military', name: '군사', color: 'from-red-700 to-red-900', icon: <Sword size={24} /> },
    { type: 'culture', name: '문화', color: 'from-pink-700 to-pink-900', icon: <Library size={24} /> },
    { type: 'science', name: '과학', color: 'from-blue-700 to-blue-900', icon: <GraduationCap size={24} /> },
    { type: 'economic', name: '경제', color: 'from-yellow-700 to-yellow-900', icon: <Landmark size={24} /> },
    { type: 'expansion', name: '확장', color: 'from-green-700 to-green-900', icon: <Globe size={24} /> },
    { type: 'naval', name: '해상', color: 'from-cyan-700 to-cyan-900', icon: <Ship size={24} /> },
    { type: 'religious', name: '종교', color: 'from-purple-700 to-purple-900', icon: <Milestone size={24} /> },
    { type: 'defensive', name: '방어', color: 'from-indigo-700 to-indigo-900', icon: <Castle size={24} /> },
  ];

  // 각 문명에 타입 할당
  const civTypeMap: Record<string, string> = {
    'korea': 'science',
  };

  // 문명에 색상 할당
  const civColorMap: Record<string, string> = {
    'korea': 'from-blue-700 to-blue-900',
  };

  // 새 게임 시작하기
  const handleStartNewGame = () => {
    setShowInitialChoice(false);
    setLoadGameMode(false);
    setRegistrationType('register');
  };

  const goToNextStep = () => {
    console.log('goToNextStep 호출, 현재 단계:', step);
    if (step < 6) {
      setStep(step + 1);
    }
  };

  // 게임 초기화 및 시작
  const startGame = async () => {
    try {
      console.log('startGame 함수 실행 시작');
      setIsLoading(true);
      
      console.log('게임 시작 - 사용자 이름:', userName);
      
      // map/init API 호출 - snake_case로 백엔드와 맞춤
      const mapConfig = {
        user_name: userName
      };
      console.log('전송할 데이터:', mapConfig);
      
      const response = await gameService.initMap(mapConfig);
      
      if (response.success) {
        // 게임 ID를 로컬 스토리지에 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('current_game_id', response.data?.game_id || '');
        }
        
        // 게임 페이지로 이동
        router.push('/game');
      } else {
        setErrorMessage(response.message || '게임 초기화 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('게임 초기화 중 오류 발생:', error);
      setErrorMessage('게임 초기화 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (loadGameMode || (step === 1 && !showInitialChoice)) {
      // 로드 게임 모드이거나, 1단계에서 뒤로가면 초기 선택으로 돌아감
      setShowInitialChoice(true);
      setLoadGameMode(false);
      setErrorMessage("");
      setUserName("");
    } else if (step > 1) {
      setStep(step - 1);
    } else {
      // 메인 페이지로 돌아가기 (여기서는 콘솔 로그만)
      console.log("메인 페이지로 이동");
    }
  };

  // 현재 단계에 따른 버튼 텍스트
  const getNextButtonText = () => {
    if (loadGameMode) return '선택한 게임 불러오기';
    if (step === 6) return '게임 시작';
    return '다음';
  };

  // 단계별 선택 여부 확인
  const isCurrentStepSelected = () => {
    if (loadGameMode) return userName && password;
    
    switch (step) {
      case 1: return !!userName;
      case 2: return !!selectedMode;
      case 3: return !!selectedDifficulty;
      case 4: return !!selectedCivilization;
      case 5: return !!selectedMapType;
      case 6: return !!selectedCivCount;
      default: return false;
    }
  };

  // 문명 타입에 따른 아이콘 반환
  const getCivTypeIcon = (civId: string) => {
    const type = civTypeMap[civId] || 'expansion';
    const civType = civTypes.find(ct => ct.type === type);
    return civType?.icon || <Star size={20} />;
  };

  // 문명 타입에 따른 색상 반환
  const getCivTypeColor = (civId: string) => {
    return civColorMap[civId] || 'from-gray-700 to-gray-900';
  };

  // 초기 선택 화면 렌더링
  const renderInitialChoice = () => {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">게임 선택</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 새 게임 시작 */}
          <div 
            className="border-2 border-gray-700 rounded-xl p-6 cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg bg-slate-800 hover:bg-opacity-80"
            onClick={handleStartNewGame}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
                <PlayCircle size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">새 게임 시작하기</h3>
            <p className="text-gray-400 text-center">
              새로운 문명의 역사를 시작하세요.<br />
              게임 모드, 난이도, 문명을 선택할 수 있습니다.
            </p>
          </div>

          <div 
            className="border-2 border-gray-700 rounded-xl p-6 cursor-not-allowed bg-slate-800 opacity-50"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center">
                <Save size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">게임 불러오기</h3>
            <p className="text-gray-400 text-center">
              이전에 저장한 게임을 계속 플레이하세요.<br />
              저장된 게임 목록에서 선택할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 게임 불러오기 화면 렌더링
  const renderLoadGame = () => {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">게임 불러오기</h2>
        
        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-md text-center text-red-300 flex items-center justify-center">
            <XCircle size={20} className="mr-2" />
            {errorMessage}
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">사용자 인증</h3>
          <p className="text-gray-400 mb-6">저장된 게임을 불러오려면 사용자 이름과 비밀번호를 입력하세요.</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-1">사용자 이름</label>
              <input 
                type="text" 
                id="userName" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="사용자 이름 입력"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">비밀번호</label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="비밀번호 입력"
              />
            </div>
            
            <button 
              onClick={() => setIsLoading(!isLoading)} // 로딩 토글 (실제로는 API 요청 대신)
              disabled={!userName || !password || isLoading}
              className={cn(
                "w-full mt-2 py-3 px-4 rounded-md font-medium flex items-center justify-center",
                (userName && password && !isLoading) 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  인증 중...
                </>
              ) : (
                <>
                  <Lock size={20} className="mr-2" />
                  시작하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    // 초기 선택 화면
    if (showInitialChoice) {
      return renderInitialChoice();
    }
    
    // 게임 불러오기 화면
    if (loadGameMode) {
      return renderLoadGame();
    }
    
   // 새 게임 시작 화면 (6단계)
   switch (step) {
    case 1:
      return (
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">사용자 이름 입력</h2>
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <p className="text-gray-400 mb-6">게임에서 사용할 사용자 이름을 입력하세요.</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-1">사용자 이름</label>
                <input 
                  type="text" 
                  id="userName" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  className="w-full px-4 py-2 bg-slate-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="사용자 이름 입력"
                />
              </div>
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">게임 모드 선택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModes.map((gameMode) => (
              <div
                key={gameMode.id}
                className={cn(
                  "border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg",
                  selectedMode === gameMode.id
                    ? "bg-blue-900 bg-opacity-20 border-blue-500"
                    : "border-gray-700"
                    
                )}
                onClick={() => setSelectedMode(gameMode.id)}
                tabIndex={0}
                role="button"
                aria-label={gameMode.name + ' 선택'}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
                    {gameMode.id === 'short' && <Zap size={28} />}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{gameMode.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{gameMode.estimatedTime}</p>
                <p className="text-xs text-gray-300">{gameMode.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 3:
      return (
        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">난이도 선택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {difficulties.map((difficulty) => (
              <div
                key={difficulty.id}
                className={cn(
                  "border-2 rounded-lg p-4 cursor-pointer transition-all",
                  selectedDifficulty === difficulty.id 
                    ? "border-blue-500 bg-blue-900 bg-opacity-20" 
                    : "border-gray-700 hover:border-gray-500"
                )}
                onClick={() => setSelectedDifficulty(difficulty.id)}
              >
                <h3 className="text-lg font-bold">{difficulty.name}</h3>
                <p className="text-gray-400 text-sm">{difficulty.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 4:
      return (
        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">문명 선택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {civilizations.map((civ) => (
              <div
                key={civ.id}
                className={cn(
                  "border-2 rounded-lg p-6 cursor-pointer transition-all flex flex-col items-start",
                  selectedCivilization === civ.id
                    ? "border-blue-500 bg-blue-900 bg-opacity-20"
                    : "border-gray-700 hover:border-gray-500"
                )}
                onClick={() => setSelectedCivilization(civ.id)}
                tabIndex={0}
                role="button"
                aria-label={civ.name + ' 선택'}
              >
                <div className="flex items-center justify-center mb-4 w-full">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getCivTypeColor(civ.id)} flex items-center justify-center`}>
                    {getCivTypeIcon(civ.id)}
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-2 text-left w-full">{civ.name}</h4>
                <ul className="text-xs text-left w-full space-y-1">
                  <li><span className="font-semibold">지도자:</span> {civ.leader}</li>
                  <li><span className="font-semibold">부가 효과:</span> {civ.specialAbility}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    case 5:
      return (
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">지도 유형 선택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center w-full">
            {mapTypes.map((mapType) => (
              <button
                key={mapType.id}
                type="button"
                className={cn(
                  "w-full max-w-xs min-h-[190px] rounded-xl p-6 flex flex-col items-center border-2 shadow-md bg-slate-800 hover:bg-blue-900 hover:bg-opacity-60 transition-all",
                  selectedMapType === mapType.id
                    ? "border-blue-500 bg-blue-900 bg-opacity-70 scale-105 ring-2 ring-blue-400"
                    : "border-gray-700"
                )}
                onClick={() => setSelectedMapType(mapType.id)}
                aria-label={mapType.name + ' 선택'}
              >
                <div className="flex items-center justify-center mb-4 w-full">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow">
                    <Map size={28} />
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-2 text-center w-full whitespace-pre-line break-keep">{mapType.name}</h4>
                <p className="text-xs text-center w-full text-gray-200 whitespace-pre-line break-keep">{mapType.description}</p>
              </button>
            ))}
          </div>
        </div>
      );
    case 6:
      return (
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">문명 수 선택</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 justify-items-center">
            {[6].map((count: number) => (
              <button
                key={count}
                type="button"
                className={cn(
                  "rounded-full w-14 h-14 flex items-center justify-center text-lg font-bold border-2 transition-all",
                  selectedCivCount === count
                    ? "bg-blue-600 text-white border-blue-400 scale-110 shadow-lg"
                    : "bg-slate-800 text-blue-200 border-gray-700 hover:border-blue-400 hover:bg-blue-900"
                )}
                onClick={() => setSelectedCivCount(count)}
                aria-label={`${count}개 문명`}
              >
                {count}
              </button>
            ))}
          </div>
          <p className="text-center text-gray-400 mt-3 text-sm">현재 6개의 문명만 선택 가능 합니다.</p>
        </div>
      );
    default:
      return null;
  }
};

const handleNextButtonClick = () => {
  console.log('handleNextButtonClick 호출, 현재 단계:', step, '로드 게임 모드:', loadGameMode);
  if (loadGameMode) {
    // 로딩 상태 토글 (실제로는 API 요청이 아님)
    setIsLoading(!isLoading);
  } else if (step === 6) {
    // 마지막 단계에서는 직접 startGame 호출
    console.log('마지막 단계에서 startGame 직접 호출');
    startGame();
  } else {
    console.log('handleNextButtonClick에서 goToNextStep 호출');
    goToNextStep();
  }
};

return (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
    {/* 헤더 영역 */}
    <header className="w-full p-4 flex items-center">
      <button 
        onClick={goToPreviousStep}
        className="flex items-center text-gray-300 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-2" size={20} />
        {showInitialChoice ? '메인으로 돌아가기' : '이전으로 돌아가기'}
      </button>
      <div className="flex-1 text-center">
        <h1 className="text-2xl font-bold">문명</h1>
      </div>
    </header>

    {/* 단계 표시 (로드 게임 모드이거나 초기 선택 화면에서는 표시 안함) */}
    {!loadGameMode && !showInitialChoice && (
      <div className="w-full max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-8 relative">
          {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center z-10">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                step === stepNumber 
                  ? "bg-blue-600" 
                  : step > stepNumber 
                    ? "bg-green-600" 
                    : "bg-gray-700"
              )}>
                {stepNumber}
              </div>
              <span className="text-xs mt-1 text-gray-400">
                {stepNumber === 1 && '사용자 이름'}
                {stepNumber === 2 && '게임 모드'}
                {stepNumber === 3 && '난이도'}
                {stepNumber === 4 && '문명'}
                {stepNumber === 5 && '지도 유형'}
                {stepNumber === 6 && '문명 수'}
              </span>
            </div>
          ))}
          <div className="absolute left-0 right-0 h-0.5 bg-gray-700" style={{ top: '20px' }}></div>
        </div>
      </div>
    )}

    {/* 메인 콘텐츠 영역 */}
    <main className="flex-1 p-4 pb-24 flex flex-col items-center">
      {renderStepContent()}
      
      {/* 에러 메시지 */}
      {errorMessage && !loadGameMode && (
        <div className="mt-6 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-md text-center text-red-300 flex items-center justify-center max-w-md">
          <XCircle size={20} className="mr-2" />
          {errorMessage}
        </div>
      )}
    </main>
    
    {/* 고정된 푸터 영역 */}
    <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 border-t border-gray-800 py-4 px-4 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <button
          onClick={goToPreviousStep}
          className="py-3 px-8 rounded-full font-bold flex items-center bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white transition-all"
        >
          <ArrowLeft className="mr-2" size={20} /> 이전
        </button>
        
        {/* 다음 버튼 */}
        <button
          onClick={handleNextButtonClick}
          disabled={!isCurrentStepSelected() || isLoading}
          className={cn(
            "py-3 px-8 rounded-full font-bold flex items-center",
            isCurrentStepSelected() && !isLoading
              ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              : "bg-gray-700 cursor-not-allowed opacity-50"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={20} />
              처리 중...
            </>
          ) : (
            <>
              {getNextButtonText()}
              {loadGameMode || step === 6 ? (
                <PlayCircle className="ml-2" size={20} />
              ) : (
                <ArrowLeft className="ml-2 rotate-180" size={20} />
              )}
            </>
          )}
        </button>
      </div>
    </footer>
  </div>
);
}