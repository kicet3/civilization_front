import { GameState } from '@/types/game';

export interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  sender?: 'player' | 'ai'; // system 메시지는 undefined로 처리
  is_error?: boolean;
}

interface DiplomacyChatWebSocketConfig {
  chatId: string;
  url: string;
  onMessage: (message: ChatMessage) => void;
  onError: (error: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export class DiplomacyChatWebSocket {
  private chatId: string;
  private url: string;
  private onMessage: (message: ChatMessage) => void;
  private onError: (error: Error | string) => void;
  private onOpen?: () => void;
  private onClose?: () => void;

  constructor(config: DiplomacyChatWebSocketConfig) {
    this.chatId = config.chatId;
    this.url = config.url;
    this.onMessage = config.onMessage;
    this.onError = config.onError;
    this.onOpen = config.onOpen;
    this.onClose = config.onClose;
  }

  // REST 기반: 첫 조우
  public async firstEncounter(playerId: number, civilizationId: number) {
    try {
      const res = await fetch(`${this.url}/diplomacy/first-encounter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, civilization_id: civilizationId })
      });
      const data = await res.json();
      if (data.success && data.data) {
        this.onMessage({
          role: 'system',
          content: data.data.initial_message,
          timestamp: new Date().toISOString(),
          sender: undefined
        });
        if (this.onOpen) this.onOpen();
      } else {
        this.onError(data.error || '첫 조우 실패');
      }
    } catch (err) {
      this.onError(err);
    }
  }

  // REST 기반: 메시지 전송
  public async sendMessage(message: string, gameState?: GameState | null) {
    try {
      const playerId = gameState?.map?.civs.find(civ => 'isPlayer' in civ && civ.isPlayer)?.id;
      const civId = this.chatId.replace(/^civ-/, '');
      const gameId = gameState?.id;

      const res = await fetch(`${this.url}/diplomacy/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          civilization_id: civId,
          game_id: gameId,
          message
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        this.onMessage({
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toISOString(),
          sender: 'ai'
        });
      } else {
        this.onError(data.error || '메시지 전송 실패');
      }
    } catch (err) {
      this.onError(err);
    }
  }

  // REST 기반: 외교 재개
  public async resumeDiplomacy(playerId: number, civilizationId: number, gameId: number) {
    try {
      const res = await fetch(`${this.url}/diplomacy/resume-diplomacy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, civilization_id: civilizationId, game_id: gameId })
      });
      const data = await res.json();
      if (data.success && data.data) {
        this.onMessage({
          role: 'system',
          content: `${data.data.civilization_name}와의 외교를 재개했습니다.`,
          timestamp: new Date().toISOString(),
          sender: undefined
        });
        // 최근 메시지들 UI에 표시
        if (data.data.previous_messages) {
          data.data.previous_messages.forEach((msg: { role: string; content: string; timestamp: string }) => {
            this.onMessage({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
              sender: msg.role === 'user' ? 'player' : 'ai'
            });
          });
        }
      } else {
        this.onError(data.error || '외교 재개 실패');
      }
    } catch (err) {
      this.onError(err);
    }
  }

  public close(): void {
    // 아무 동작 없음 (REST 기반)
    if (this.onClose) this.onClose();
  }
}
 