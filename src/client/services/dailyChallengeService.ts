/**
 * Daily Challenges System
 * Provides rotating daily challenges with diamond rewards
 */

import achievementService from './achievementService';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number; // Diamond reward
  type: 'score' | 'games' | 'leaderboard' | 'streak' | 'specific';
  target: number;
  progress: number;
  completed: boolean;
  gameId?: string; // Optional: specific game required
}

interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  type: 'score' | 'games' | 'leaderboard' | 'streak' | 'specific';
  target: number;
  gameId?: string;
}

// Challenge templates that rotate daily
const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // Score Challenges
  {
    id: 'score_500',
    title: 'Score Hunter',
    description: 'Score 500+ points in any game',
    icon: '🎯',
    reward: 10,
    type: 'score',
    target: 500
  },
  {
    id: 'score_1000',
    title: 'High Achiever',
    description: 'Score 1000+ points in any game',
    icon: '🏆',
    reward: 15,
    type: 'score',
    target: 1000
  },
  {
    id: 'score_2000',
    title: 'Score Master',
    description: 'Score 2000+ points in any game',
    icon: '⭐',
    reward: 25,
    type: 'score',
    target: 2000
  },
  
  // Games Played Challenges
  {
    id: 'play_3',
    title: 'Game Explorer',
    description: 'Play 3 different games',
    icon: '🎮',
    reward: 12,
    type: 'games',
    target: 3
  },
  {
    id: 'play_5',
    title: 'Game Master',
    description: 'Play 5 different games',
    icon: '🕹️',
    reward: 20,
    type: 'games',
    target: 5
  },
  
  // Leaderboard Challenges
  {
    id: 'leaderboard_top50',
    title: 'Climb the Ranks',
    description: 'Reach top 50 in any leaderboard',
    icon: '📈',
    reward: 15,
    type: 'leaderboard',
    target: 50
  },
  {
    id: 'leaderboard_top25',
    title: 'Rising Star',
    description: 'Reach top 25 in any leaderboard',
    icon: '🌟',
    reward: 25,
    type: 'leaderboard',
    target: 25
  },
  
  // Win Streak Challenges
  {
    id: 'streak_2',
    title: 'On a Roll',
    description: 'Win 2 games in a row',
    icon: '🔥',
    reward: 15,
    type: 'streak',
    target: 2
  },
  {
    id: 'streak_3',
    title: 'Unstoppable',
    description: 'Win 3 games in a row',
    icon: '💪',
    reward: 30,
    type: 'streak',
    target: 3
  },
  
  // Specific Game Challenges
  {
    id: 'snake_200',
    title: 'Snake Charmer',
    description: 'Score 200+ in Snake',
    icon: '🐍',
    reward: 12,
    type: 'specific',
    target: 200,
    gameId: 'snake'
  },
  {
    id: 'tetris_1000',
    title: 'Tetris Pro',
    description: 'Score 1000+ in Tetris',
    icon: '🧱',
    reward: 15,
    type: 'specific',
    target: 1000,
    gameId: 'tetris'
  },
  {
    id: 'pong_500',
    title: 'Pong Champion',
    description: 'Score 500+ in Pong',
    icon: '🏓',
    reward: 12,
    type: 'specific',
    target: 500,
    gameId: 'pong'
  },
  {
    id: '2048_1024',
    title: '2048 Strategist',
    description: 'Score 1024+ in 2048',
    icon: '🔢',
    reward: 18,
    type: 'specific',
    target: 1024,
    gameId: '2048'
  }
];

class DailyChallengeService {
  private storageKey = 'daily_challenges';
  private lastResetKey = 'daily_challenges_last_reset';
  private progressKey = 'daily_challenges_progress';

  /**
   * Get current daily challenges (auto-reset at midnight)
   */
  getDailyChallenges(): DailyChallenge[] {
    this.checkAndResetChallenges();
    
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Generate new challenges
    return this.generateDailyChallenges();
  }

  /**
   * Generate 3-5 random challenges for the day
   */
  private generateDailyChallenges(): DailyChallenge[] {
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 challenges
    const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    const challenges: DailyChallenge[] = selected.map(template => ({
      ...template,
      progress: 0,
      completed: false
    }));
    
    this.saveChallenges(challenges);
    return challenges;
  }

  /**
   * Check if challenges need to reset (daily at midnight)
   */
  private checkAndResetChallenges(): void {
    const lastReset = localStorage.getItem(this.lastResetKey);
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
      // Reset challenges
      this.generateDailyChallenges();
      localStorage.setItem(this.lastResetKey, today);
      localStorage.removeItem(this.progressKey);
    }
  }

  /**
   * Update challenge progress
   */
  updateProgress(type: string, value: number, gameId?: string): void {
    const challenges = this.getDailyChallenges();
    let updated = false;
    
    challenges.forEach(challenge => {
      if (challenge.completed) return;
      
      // Check if challenge matches
      if (challenge.type === type) {
        if (type === 'specific' && challenge.gameId !== gameId) return;
        
        // Update progress based on type
        switch (type) {
          case 'score':
          case 'specific':
            if (value >= challenge.target) {
              challenge.progress = challenge.target;
              challenge.completed = true;
              updated = true;
            }
            break;
            
          case 'games':
            // Track unique games played
            const gamesPlayed = this.getGamesPlayedToday();
            if (gameId && !gamesPlayed.includes(gameId)) {
              gamesPlayed.push(gameId);
              localStorage.setItem('daily_games_played', JSON.stringify(gamesPlayed));
            }
            challenge.progress = gamesPlayed.length;
            if (challenge.progress >= challenge.target) {
              challenge.completed = true;
              updated = true;
            }
            break;
            
          case 'leaderboard':
            if (value <= challenge.target) {
              challenge.progress = challenge.target - value + 1;
              challenge.completed = true;
              updated = true;
            }
            break;
            
          case 'streak':
            const streak = this.getWinStreak();
            challenge.progress = streak;
            if (streak >= challenge.target) {
              challenge.completed = true;
              updated = true;
            }
            break;
        }
      }
    });
    
    if (updated) {
      this.saveChallenges(challenges);
      
      // Award diamonds for completed challenges
      challenges.forEach(async (challenge) => {
        if (challenge.completed && challenge.progress === challenge.target) {
          await achievementService.addDiamonds(challenge.reward, `daily_challenge_${challenge.id}`);
          console.log(`💎 Daily Challenge Complete! +${challenge.reward} diamonds`);
        }
      });
    }
  }

  /**
   * Track score achievements
   */
  trackScore(gameId: string, score: number): void {
    this.updateProgress('score', score);
    this.updateProgress('specific', score, gameId);
  }

  /**
   * Track game played
   */
  trackGamePlayed(gameId: string): void {
    this.updateProgress('games', 1, gameId);
  }

  /**
   * Track leaderboard position
   */
  trackLeaderboardPosition(position: number): void {
    this.updateProgress('leaderboard', position);
  }

  /**
   * Track win for streak
   */
  trackWin(isWin: boolean): void {
    if (isWin) {
      const streak = this.getWinStreak() + 1;
      localStorage.setItem('win_streak', streak.toString());
      this.updateProgress('streak', streak);
    } else {
      localStorage.setItem('win_streak', '0');
    }
  }

  /**
   * Get current win streak
   */
  private getWinStreak(): number {
    return parseInt(localStorage.getItem('win_streak') || '0', 10);
  }

  /**
   * Get games played today
   */
  private getGamesPlayedToday(): string[] {
    const stored = localStorage.getItem('daily_games_played');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Save challenges to storage
   */
  private saveChallenges(challenges: DailyChallenge[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(challenges));
  }

  /**
   * Get total diamonds earned today
   */
  getTodaysDiamondsEarned(): number {
    const challenges = this.getDailyChallenges();
    return challenges
      .filter(c => c.completed)
      .reduce((sum, c) => sum + c.reward, 0);
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    const challenges = this.getDailyChallenges();
    if (challenges.length === 0) return 0;
    const completed = challenges.filter(c => c.completed).length;
    return Math.round((completed / challenges.length) * 100);
  }
}

export default new DailyChallengeService();
