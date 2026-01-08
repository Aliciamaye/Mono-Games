import api from './api';

interface GameStats {
  gameId: string;
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  averageScore: number;
  totalPlayTime: number; // milliseconds
  wins: number;
  losses: number;
  winRate: number;
  lastPlayed: string;
}

interface UserStats {
  totalGamesPlayed: number;
  totalPlayTime: number;
  totalScore: number;
  favoriteGame: string;
  gamesPerDay: number;
  averageSessionLength: number;
  gameStats: GameStats[];
}

interface GlobalStats {
  totalPlayers: number;
  totalGamesPlayed: number;
  mostPopularGame: string;
  activePlayersToday: number;
}

class StatisticsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Track game event (start, end, pause, resume)
   */
  async trackEvent(gameId: string, eventType: 'start' | 'end' | 'pause' | 'resume', metadata?: {
    score?: number;
    duration?: number;
    result?: 'win' | 'loss' | 'quit';
  }): Promise<void> {
    try {
      await api.post('/statistics/track', {
        gameId,
        eventType,
        metadata
      });

      // Invalidate cache
      this.cache.delete(`user-stats-${gameId}`);
      this.cache.delete('user-stats');
    } catch (error) {
      console.error('Failed to track event:', error);
      // Store locally for offline sync
      this.storeOfflineEvent(gameId, eventType, metadata);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId?: string): Promise<UserStats> {
    try {
      const cacheKey = userId ? `user-stats-${userId}` : 'user-stats';
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const endpoint = userId ? `/statistics/user/${userId}` : '/statistics/user';
      const response = await api.get(endpoint);
      const stats = response.data.data;

      this.cache.set(cacheKey, { data: stats, timestamp: Date.now() });
      return stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return this.getDefaultUserStats();
    }
  }

  /**
   * Get game-specific statistics
   */
  async getGameStats(gameId: string): Promise<GameStats> {
    try {
      const cacheKey = `game-stats-${gameId}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/statistics/game/${gameId}`);
      const stats = response.data.data;

      this.cache.set(cacheKey, { data: stats, timestamp: Date.now() });
      return stats;
    } catch (error) {
      console.error('Failed to get game stats:', error);
      return this.getDefaultGameStats(gameId);
    }
  }

  /**
   * Get global statistics
   */
  async getGlobalStats(): Promise<GlobalStats> {
    try {
      const cached = this.cache.get('global-stats');

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get('/statistics/global');
      const stats = response.data.data;

      this.cache.set('global-stats', { data: stats, timestamp: Date.now() });
      return stats;
    } catch (error) {
      console.error('Failed to get global stats:', error);
      return this.getDefaultGlobalStats();
    }
  }

  /**
   * Format play time for display
   */
  formatPlayTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Calculate win rate percentage
   */
  calculateWinRate(wins: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  }

  /**
   * Store offline event for sync later
   */
  private storeOfflineEvent(gameId: string, eventType: string, metadata?: any): void {
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_stats_events') || '[]');
      offlineEvents.push({
        gameId,
        eventType,
        metadata,
        timestamp: Date.now()
      });

      // Keep only last 100 events
      if (offlineEvents.length > 100) {
        offlineEvents.shift();
      }

      localStorage.setItem('offline_stats_events', JSON.stringify(offlineEvents));
    } catch (error) {
      console.error('Failed to store offline event:', error);
    }
  }

  /**
   * Sync offline events
   */
  async syncOfflineEvents(): Promise<void> {
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_stats_events') || '[]');

      if (offlineEvents.length === 0) return;

      for (const event of offlineEvents) {
        await this.trackEvent(event.gameId, event.eventType, event.metadata);
      }

      localStorage.removeItem('offline_stats_events');
      console.log(`Synced ${offlineEvents.length} offline events`);
    } catch (error) {
      console.error('Failed to sync offline events:', error);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Default/fallback data
  private getDefaultUserStats(): UserStats {
    return {
      totalGamesPlayed: 0,
      totalPlayTime: 0,
      totalScore: 0,
      favoriteGame: 'snake',
      gamesPerDay: 0,
      averageSessionLength: 0,
      gameStats: []
    };
  }

  private getDefaultGameStats(gameId: string): GameStats {
    return {
      gameId,
      gamesPlayed: 0,
      totalScore: 0,
      highScore: 0,
      averageScore: 0,
      totalPlayTime: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      lastPlayed: new Date().toISOString()
    };
  }

  private getDefaultGlobalStats(): GlobalStats {
    return {
      totalPlayers: 0,
      totalGamesPlayed: 0,
      mostPopularGame: 'snake',
      activePlayersToday: 0
    };
  }
}

export default new StatisticsService();
export type { GameStats, UserStats, GlobalStats };
