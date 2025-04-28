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
   * 다음 턴으로 진행합니다.
   */
  async endTurn(gameId: string, userName?: string, gameSummary?: any): Promise<ApiResponse<any>> {
    const params = userName ? { user_name: userName } : {};
    return apiClient.post<ApiResponse<any>>(`/games/${gameId}/turn/next`, gameSummary, { params });
  }

  /**
   * 새 게임 맵을 초기화합니다.
   */
  async initMap(gameConfig: {
    user_name: string;
    game_mode?: string;
    difficulty?: string;
    civilization?: string;
    map_type?: string;
    civ_count?: number;
    map_radius?: number;
    turn_limit?: number;
  }): Promise<ApiResponse<{
    game_id: string;
    user_name: string;
    mapRadius: number;
    turnLimit: number;
    player_civ_id: string;
    ai_civ_ids: string[];
    tileCount: number;
  }>> {
    console.log('initMap 호출:', gameConfig);
    
    // user_name 필수 체크
    if (!gameConfig.user_name) {
      throw new Error('user_name이 필요합니다.');
    }
    
    try {
      // 백엔드가 user_name을 쿼리 파라미터로 요구하는 것으로 보입니다
      const queryParams = new URLSearchParams({
        user_name: gameConfig.user_name
      });
      
      // 나머지 데이터는 요청 본문으로 보냅니다
      const requestPayload = {
        game_mode: gameConfig.game_mode || 'short',
        difficulty: gameConfig.difficulty || 'easy',
        civilization: gameConfig.civilization || 'korea',
        map_type: gameConfig.map_type || 'small_continents',
        civ_count: gameConfig.civ_count || 6,
        map_radius: gameConfig.map_radius || 5,
        turn_limit: gameConfig.turn_limit || 50
      };
      
      
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
      >(`/map/init?${queryParams.toString()}`, requestPayload);
      
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

  /**
   * 유닛 목록을 조회합니다.
   */
  async getUnits(params?: string | {
    era?: 'Medieval' | 'Industrial' | 'Modern';
    category?: 'Melee' | 'Ranged' | 'Cavalry' | 'Siege' | 'Modern' | 'Civilian';
    prereqTech?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>('/units', { params });
  }

  /**
   * 특정 유닛의 상세 정보를 조회합니다.
   */
  async getUnitDetail(unitId: number): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/units/${unitId}`);
  }

  /**
   * 전체 기술 목록을 조회합니다.
   */
  async getTechnologies(params?: {
    era?: 'Medieval' | 'Industrial' | 'Modern';
    treeType?: string;
    available?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>('/technologies', { params });
  }

  /**
   * 특정 기술의 상세 정보를 조회합니다.
   */
  async getTechnologyDetail(techId: number): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/technologies/${techId}`);
  }

  /**
   * 문명의 연구 상태를 조회합니다.
   */
  async getResearchStatus(gameCivId: number): Promise<ApiResponse<{
    completed: number[];
    inProgress: { techId: number; points: number; required: number };
    available: number[];
  }>> {
    return apiClient.get<ApiResponse<any>>(`/technologies/game-civs/${gameCivId}/research-status`);
  }

  /**
   * 연구 큐를 조회합니다.
   */
  async getResearchQueue(gameCivId: number): Promise<ApiResponse<{
    queueId: number;
    techId: number;
    queuePosition: number;
  }[]>> {
    return apiClient.get<ApiResponse<any>>(`/technologies/game-civs/${gameCivId}/research-queue`);
  }

  /**
   * 연구 큐에 기술을 추가합니다.
   */
  async addToResearchQueue(gameCivId: number, techId: number): Promise<ApiResponse<{
    queueId: number;
    techId: number;
    queuePosition: number;
  }>> {
    return apiClient.post<ApiResponse<any>>(`/technologies/game-civs/${gameCivId}/research-queue`, { techId });
  }

  /**
   * 연구 큐에서 기술을 제거합니다.
   */
  async removeFromResearchQueue(gameCivId: number, queueId: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/technologies/game-civs/${gameCivId}/research-queue/${queueId}`);
  }

  /**
   * 기술 연구를 바로 시작합니다.
   */
  async startResearch(gameCivId: number, techId: number): Promise<ApiResponse<{
    techId: number;
    status: string;
    points: number;
    required: number;
  }>> {
    return apiClient.post<ApiResponse<any>>(`/technologies/game-civs/${gameCivId}/research/start`, { techId });
  }

  /**
   * 현재 연구 중인 기술을 취소합니다.
   */
  async cancelResearch(gameCivId: number, techId: number): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>(`/technologies/game-civs/${gameCivId}/research/cancel`, { techId });
  }

  /**
   * 연구 트리 선택 정보를 조회합니다.
   */
  async getTreeSelection(gameCivId: number): Promise<ApiResponse<{
    main: string;
    sub: string;
  }>> {
    return apiClient.get<ApiResponse<any>>(`/technologies/game-civs/${gameCivId}/tree-selection`);
  }

  /**
   * 연구 트리를 선택합니다.
   */
  async setTreeSelection(gameCivId: number, main: string, sub?: string): Promise<ApiResponse<{
    main: string;
    sub: string;
  }>> {
    return apiClient.post<ApiResponse<any>>(`/technologies/game-civs/${gameCivId}/tree-selection`, { main, sub });
  }

  /**
   * 도시에서 유닛 생산을 시작합니다.
   */
  async startUnitProduction(cityId: number, unitId: number): Promise<ApiResponse<{
    cityId: number;
    unitId: number;
    turnsLeft: number;
  }>> {
    return apiClient.post<ApiResponse<any>>('/cities/production/unit', { cityId, unitId });
  }
}

// 서비스 인스턴스 생성 및 내보내기
const gameService = new GameService();
export default gameService;