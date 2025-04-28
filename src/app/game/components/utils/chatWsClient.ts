import { GameState } from '@/types/game';

export interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  is_error?: boolean;
}

interface ChatWsClientConfig {
  chatId: string;
  url: string;
  onMessage: (message: ChatMessage) => void;
  onError: (error: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export class ChatWsClient {
  private ws: WebSocket | null = null;
  private chatId: string;
  private url: string;
  private onMessage: (message: ChatMessage) => void;
  private onError: (error: any) => void;
  private onOpen?: () => void;
  private onClose?: () => void;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(config: ChatWsClientConfig) {
    this.chatId = config.chatId;
    this.url = config.url;
    this.onMessage = config.onMessage;
    this.onError = config.onError;
    this.onOpen = config.onOpen;
    this.onClose = config.onClose;
  }

  public connect(): void {
    try {
      // 이미 연결되어 있는 경우 종료
      if (this.ws && this.isConnected) {
        console.log('WebSocket 연결이 이미 열려있습니다.');
        return;
      }

      // WebSocket 엔드포인트에 채팅 ID 연결
      const fullUrl = `${this.url}/chat/${this.chatId}`;
      console.log(`WebSocket 연결 시도: ${fullUrl}`);
      
      // WebSocket 연결 시도
      this.ws = new WebSocket(fullUrl);

      // 이벤트 핸들러 설정
      this.ws.onopen = () => {
        console.log(`WebSocket 연결 성공: ${fullUrl}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        if (this.onOpen) this.onOpen();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 서버 응답 처리
          const message: ChatMessage = {
            role: data.role || 'assistant',
            content: data.content || '',
            timestamp: data.timestamp || new Date().toISOString(),
            is_error: data.is_error || false
          };
          this.onMessage(message);
        } catch (err) {
          console.error('메시지 파싱 오류:', err);
          this.onError(err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        this.onError(error);
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket 연결 종료: ${event.code} ${event.reason}`);
        this.isConnected = false;
        
        // 비정상 종료 시 재연결 시도
        if (!event.wasClean && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts++;
          console.log(`재연결 시도 ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}`);
          setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
        
        if (this.onClose) this.onClose();
      };
    } catch (err) {
      console.error('WebSocket 연결 시도 중 오류:', err);
      this.onError(err);
    }
  }

  public sendMessage(message: string, gameState?: GameState | null): void {
    if (!this.ws || !this.isConnected) {
      this.onError(new Error('WebSocket이 연결되어 있지 않습니다.'));
      return;
    }

    try {
      // 서버에 메시지 전송
      const payload = {
        message,
        game_state: gameState ? {
          turn: gameState.turn,
          era: this.getEra(gameState.year || 0).era,
          player_civ: {
            name: "플레이어 문명",
            research: {
              in_progress: { name: "현재 연구 중인 기술" }
            },
            cities: [
              { name: "수도", population: 5, in_progress: { building: "현재 건설 중인 건물" } }
            ]
          }
        } : null
      };
      
      this.ws.send(JSON.stringify(payload));
    } catch (err) {
      console.error('메시지 전송 중 오류:', err);
      this.onError(err);
    }
  }

  // 시대 결정 함수
  private getEra(year: number): { era: string, koreanEra: string } {
    if (year < 1300) {
      return { era: 'Medieval', koreanEra: '중세' };
    } else if (year < 1900) {
      return { era: 'Industrial', koreanEra: '산업' };
    } else {
      return { era: 'Modern', koreanEra: '현대' };
    }
  }

  public async loadChatHistory(): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.url.replace('ws', 'http')}/chat/history/${this.chatId}`);
      const data = await response.json();
      
      if (data.success && data.history) {
        return data.history as ChatMessage[];
      }
      return [];
    } catch (err) {
      console.error('채팅 히스토리 로드 오류:', err);
      return [];
    }
  }

  public async initializeChat(gameState?: GameState | null): Promise<boolean> {
    try {
      const response = await fetch(`${this.url.replace('ws', 'http')}/chat/init/${this.chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: gameState ? JSON.stringify({
          game_state: {
            turn: gameState.turn,
            era: this.getEra(gameState.year || 0).era,
            player_civ: {
              name: "플레이어 문명",
              research: {
                in_progress: { name: "현재 연구 중인 기술" }
              },
              cities: gameState.cities || []
            }
          }
        }) : JSON.stringify({})
      });
      
      const data = await response.json();
      return data.success === true;
    } catch (err) {
      console.error('채팅 초기화 오류:', err);
      return false;
    }
  }

  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
} 