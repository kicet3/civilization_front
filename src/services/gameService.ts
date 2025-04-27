import apiClient from './apiClient';
import { ApiResponse } from '@/types';

/**
 * 게임 관련 API 서비스
 */
class GameService {
  /**
   * 새 게임을 생성합니다.
   */
  async createNewGame(gameConfig: {
    userName: string;
    gameMode: string;
    difficulty: string;
    civilization: string;
    mapType: string;
    civCount: number;
  }): Promise<ApiResponse<{ gameId: string }>> {
    return apiClient.post<ApiResponse<{ gameId: string }>>('/games/create', gameConfig);
  }
  
  /**
   * 특정 게임의 상태를 가져옵니다.
   */
  async getGameStatus(gameId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/games/${gameId}/status`);
  }
  
  /**
   * 게임 행동을 제출합니다.
   */
  async submitAction(gameId: string, action: any): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/games/${gameId}/actions`, action);
  }
  
  /**
   * 게임을 저장합니다.
   */
  async saveGame(gameId: string): Promise<ApiResponse<{ saveId: string }>> {
    return apiClient.post<ApiResponse<{ saveId: string }>>(`/games/${gameId}/save`);
  }
  
  /**
   * 저장된 게임 목록을 가져옵니다.
   */
  async getSavedGames(userId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>(`/users/${userId}/saved-games`);
  }
  
  /**
   * 저장된 게임을 불러옵니다.
   */
  async loadGame(saveId: string): Promise<ApiResponse<{ gameId: string }>> {
    return apiClient.post<ApiResponse<{ gameId: string }>>(`/games/load`, { saveId });
  }
  
  /**
   * 게임을 종료합니다.
   */
  async endGame(gameId: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/games/${gameId}/end`);
  }

  /**
   * 새 게임 맵을 초기화합니다.
   */
  async initMap(mapConfig: {
    user_name: string;
  }): Promise<ApiResponse<{
    game_id: string;
    user_name: string;
    mapRadius: number;
    turnLimit: number;
    player_civ_id: string;
    ai_civ_ids: string[];
    tileCount: number;
  }>> {
    console.log('initMap 호출:', mapConfig);
    try {
      // 백엔드 API가 snake_case를 기대하는 것 같습니다
      const response = await apiClient.post<
        ApiResponse<{
          game_id: string;
          user_name: string;
          mapRadius: number;
          turnLimit: number;
          player_civ_id: string;
          ai_civ_ids: string[];
          tileCount: number;
        }>
      >('/map/init', mapConfig);
      console.log('initMap 응답:', response);
      return response;
    } catch (error: any) {
      console.error('initMap 오류:', error);
      if (error.response) {
        console.error('오류 상태 코드:', error.response.status);
        console.error('오류 응답 데이터:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * 맵 데이터를 조회합니다.
   */
  async getMapData(gameId: string, turn?: number): Promise<ApiResponse<any>> {
    const params = turn ? { game_id: gameId, turn } : { game_id: gameId };
    return apiClient.get<ApiResponse<any>>('/map/data', { params });
  }

  /**
   * 특정 좌표의 인접 타일 정보를 가져옵니다.
   */
  async getAdjacentTiles(gameId: string, q: number, r: number): Promise<ApiResponse<{
    origin: { q: number; r: number; s: number };
    hexagons: any[];
  }>> {
    return apiClient.get<
      ApiResponse<{
        origin: { q: number; r: number; s: number };
        hexagons: any[];
      }>
    >('/map/adjacent', {
      params: { game_id: gameId, q, r }
    });
  }
}

// 서비스 인스턴스 생성 및 내보내기
const gameService = new GameService();
export default gameService;
