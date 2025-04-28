import { GameState } from '@/types/game';

// 채팅 메시지 타입 정의
export interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  sender?: 'player' | 'ai';
  is_error?: boolean;
}

// 더미 응답 세트
const DUMMY_RESPONSES = [
  "안녕하세요, 당신의 문명은 인상적입니다.",
  "평화적인 관계를 유지하기를 원합니다.",
  "우리는 당신의 영토에 관심이 있습니다.",
  "무역 협정을 제안하고 싶습니다.",
  "이 요청을 거절해야 할 것 같습니다.",
  "우리 사이의 동맹을 공고히 합시다.",
  "우리의 관계가 악화되면 전쟁도 불사하겠습니다.",
  "새로운 기술 교환에 관심이 있으신가요?",
  "당신의 문화는 참으로 흥미롭습니다.",
];

// 랜덤 지연 시간 생성 (응답에 딜레이 추가)
const getRandomDelay = () => Math.floor(Math.random() * 1000) + 500;

// 랜덤 응답 생성
const getRandomResponse = () => {
  const index = Math.floor(Math.random() * DUMMY_RESPONSES.length);
  return DUMMY_RESPONSES[index];
};

// 더미 DiplomacyChatWebSocket 클래스
export class DiplomacyChatWebSocket {
  private chatId: string;
  private url: string;
  private onMessage: (message: ChatMessage) => void;
  private onError: (error: any) => void;
  private onOpen?: () => void;
  private onClose?: () => void;
  private connected: boolean = false;

  constructor(config: {
    chatId: string;
    url: string;
    onMessage: (message: ChatMessage) => void;
    onError: (error: any) => void;
    onOpen?: () => void;
    onClose?: () => void;
  }) {
    this.chatId = config.chatId;
    this.url = config.url;
    this.onMessage = config.onMessage;
    this.onError = config.onError;
    this.onOpen = config.onOpen;
    this.onClose = config.onClose;
  }

  public connect(): void {
    try {
      console.log(`더미 WebSocket 연결: ${this.url}/ws/diplomacy/${this.chatId}`);
      
      // 연결 성공 시뮬레이션
      setTimeout(() => {
        this.connected = true;
        if (this.onOpen) this.onOpen();
        
        // 자동 웰컴 메시지
        setTimeout(() => {
          this.onMessage({
            role: 'assistant',
            content: '안녕하세요, 외교 채널에 오신 것을 환영합니다. 어떻게 도와드릴까요?',
            timestamp: new Date().toISOString(),
            sender: 'ai'
          });
        }, getRandomDelay());
      }, 500);
    } catch (err) {
      console.error('더미 WebSocket 연결 오류:', err);
      this.onError(err);
    }
  }

  public sendMessage(message: string, gameState?: GameState | null): void {
    if (!this.connected) {
      this.onError(new Error('WebSocket이 연결되어 있지 않습니다.'));
      return;
    }

    try {
      // 플레이어 메시지 생성 및 즉시 UI에 표시 (onMessage 콜백 사용)
      const playerMessage: ChatMessage = {
        role: 'player',
        content: message,
        timestamp: new Date().toISOString(),
        sender: 'player'
      };
      
      // 메시지 전송 시뮬레이션 로그
      console.log('더미 메시지 전송:', {
        message,
        gameState: gameState ? { 
          id: gameState.id,
          turn: gameState.turn
        } : null
      });
      
      // 봇 응답 시뮬레이션 (딜레이 추가)
      setTimeout(() => {
        const botResponse: ChatMessage = {
          role: 'assistant',
          content: getRandomResponse(),
          timestamp: new Date().toISOString(),
          sender: 'ai'
        };
        this.onMessage(botResponse);
      }, getRandomDelay());
    } catch (err) {
      console.error('더미 메시지 전송 오류:', err);
      this.onError(err);
    }
  }

  public close(): void {
    console.log('더미 WebSocket 연결 종료');
    this.connected = false;
    if (this.onClose) this.onClose();
  }
}
