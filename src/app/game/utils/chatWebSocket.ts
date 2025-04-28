// 문명 외교 채팅 WebSocket 유틸리티

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  is_error?: boolean;
};

export class DiplomacyChatWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private chatId: string;
  private onMessage: (msg: ChatMessage) => void;
  private onError: (err: any) => void;
  private onOpen?: () => void;
  private onClose?: () => void;

  constructor({
    chatId,
    url,
    onMessage,
    onError,
    onOpen,
    onClose
  }: {
    chatId: string;
    url: string;
    onMessage: (msg: ChatMessage) => void;
    onError: (err: any) => void;
    onOpen?: () => void;
    onClose?: () => void;
  }) {
    this.url = url;
    this.chatId = chatId;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onOpen = onOpen;
    this.onClose = onClose;
  }

  connect() {
    const wsUrl = `${this.url}/chat/${this.chatId}`.replace('http', 'ws');
    try {
      this.ws = new WebSocket(wsUrl);
    } catch (err) {
      console.error('[DiplomacyChatWebSocket] WebSocket 생성 실패:', wsUrl, err);
      this.onError({ message: 'WebSocket 생성 실패', url: wsUrl, original: err });
      return;
    }
    this.ws.onopen = () => {
      console.log('[DiplomacyChatWebSocket] WebSocket 연결 성공:', wsUrl);
      this.onOpen?.();
    };
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (e) {
        console.error('[DiplomacyChatWebSocket] 메시지 파싱 오류:', event, e);
        this.onError({ message: '메시지 파싱 오류', event, original: e });
      }
    };
    this.ws.onerror = (event) => {
      console.error('[DiplomacyChatWebSocket] WebSocket 오류:', wsUrl, event);
      this.onError({ message: 'WebSocket 오류', url: wsUrl, event });
    };
    this.ws.onclose = (event) => {
      console.warn('[DiplomacyChatWebSocket] WebSocket 연결 종료:', wsUrl, event);
      this.onClose?.();
    };
  }

  sendMessage(message: string, gameState?: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          message,
          game_state: gameState,
        })
      );
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
