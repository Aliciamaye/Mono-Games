// Leaderboard Service - Points to Stars conversion and rankings
import api from './api';

// Points to Stars conversion rates for each game
const CONVERSION_RATES: Record<string, { pointsPerStar: number; maxStars: number }> = {
    'snake': { pointsPerStar: 25, maxStars: 100 },
    'tetris': { pointsPerStar: 30, maxStars: 150 },
    'pong': { pointsPerStar: 20, maxStars: 50 },
    'tic-tac-toe': { pointsPerStar: 10, maxStars: 30 },
    'connect-four': { pointsPerStar: 15, maxStars: 40 },
    '2048': { pointsPerStar: 50, maxStars: 200 },
    'memory-match': { pointsPerStar: 20, maxStars: 60 },
    'breakout': { pointsPerStar: 30, maxStars: 80 },
    'flappy-bird': { pointsPerStar: 15, maxStars: 70 },
    'brick-breaker': { pointsPerStar: 25, maxStars: 75 },
    'doodle-jump': { pointsPerStar: 35, maxStars: 90 },
    'minesweeper': { pointsPerStar: 40, maxStars: 120 },
    'racing': { pointsPerStar: 45, maxStars: 150 },
    'infinite-roads': { pointsPerStar: 30, maxStars: 100 },
    'space-shooter': { pointsPerStar: 35, maxStars: 130 },
    'platformer': { pointsPerStar: 40, maxStars: 140 },
    'cube-runner': { pointsPerStar: 30, maxStars: 110 }
};

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    score: number;
    stars?: number;
    gamesPlayed?: number;
    timestamp: number;
}

class LeaderboardService {
    // Convert points to stars for a specific game
    convertToStars(gameId: string, points: number): number {
        const rates = CONVERSION_RATES[gameId] || { pointsPerStar: 25, maxStars: 100 };
        const stars = points / rates.pointsPerStar;
        return Math.min(stars, rates.maxStars);
    }

    // Submit score to leaderboard
    async submitScore(gameId: string, score: number): Promise<{ success: boolean; stars: number; rank?: number; error?: string }> {
        try {
            const stars = this.convertToStars(gameId, score);

            const response = await api.post('/leaderboard/submit', {
                gameId,
                score,
                stars,
                timestamp: Date.now()
            });

            return {
                success: true,
                stars,
                rank: response.data.rank
            };
        } catch (error: any) {
            console.error('Failed to submit score:', error);

            // Store locally if offline
            this.storeOfflineScore(gameId, score);

            return {
                success: false,
                stars: this.convertToStars(gameId, score),
                error: error.message
            };
        }
    }

    // Get global leaderboard (all games, sorted by total stars)
    async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
        try {
            const response = await api.get(`/leaderboard/global?limit=${limit}`);
            return response.data.leaderboard;
        } catch (error) {
            console.error('Failed to fetch global leaderboard:', error);
            return [];
        }
    }

    // Get game-specific leaderboard
    async getGameLeaderboard(gameId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
        try {
            const response = await api.get(`/leaderboard/game/${gameId}?limit=${limit}`);
            return response.data.leaderboard;
        } catch (error) {
            console.error(`Failed to fetch leaderboard for ${gameId}:`, error);
            return [];
        }
    }

    // Get most active players leaderboard
    async getActivityLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
        try {
            const response = await api.get(`/leaderboard/active?limit=${limit}`);
            return response.data.leaderboard;
        } catch (error) {
            console.error('Failed to fetch activity leaderboard:', error);
            return [];
        }
    }

    // Get user's personal rankings
    async getUserRankings(userId: string): Promise<{
        global?: number;
        games: Record<string, number>;
        totalStars: number;
    }> {
        try {
            const response = await api.get(`/leaderboard/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user rankings:', error);
            return { games: {}, totalStars: 0 };
        }
    }

    // Sync offline scores
    async syncOfflineScores(): Promise<void> {
        const offlineScores = this.getOfflineScores();

        for (const { gameId, score } of offlineScores) {
            await this.submitScore(gameId, score);
        }

        this.clearOfflineScores();
    }

    // Store score offline for later sync
    private storeOfflineScore(gameId: string, score: number) {
        const scores = this.getOfflineScores();
        scores.push({ gameId, score, timestamp: Date.now() });
        localStorage.setItem('offlineScores', JSON.stringify(scores));
    }

    private getOfflineScores(): Array<{ gameId: string; score: number; timestamp: number }> {
        const stored = localStorage.getItem('offlineScores');
        return stored ? JSON.parse(stored) : [];
    }

    private clearOfflineScores() {
        localStorage.removeItem('offlineScores');
    }
}

export default new LeaderboardService();
