/**
 * Diamond Earning Service
 * Awards diamonds based on score milestones, wins, achievements
 */

import achievementService from './achievementService';

interface DiamondReward {
  amount: number;
  source: string;
  timestamp: number;
}

class DiamondEarningService {
  private recentRewards: DiamondReward[] = [];
  private scoreThresholds = [
    { score: 100, reward: 5, name: 'Century' },
    { score: 250, reward: 8, name: 'Quarter-Master' },
    { score: 500, reward: 12, name: 'Half-Millennium' },
    { score: 1000, reward: 20, name: 'Millennium' },
    { score: 2500, reward: 40, name: 'Grand Master' },
    { score: 5000, reward: 75, name: 'Legend' },
    { score: 10000, reward: 150, name: 'Epic Achiever' }
  ];

  /**
   * Calculate diamond reward for a score
   * Awards diamonds for reaching milestones
   */
  async calculateScoreReward(score: number, gameId: string): Promise<number> {
    let totalReward = 0;
    const earnedMilestones: string[] = [];

    // Check each threshold
    for (const threshold of this.scoreThresholds) {
      if (score >= threshold.score) {
        // Check if already earned for this game
        const storageKey = `milestone_${gameId}_${threshold.score}`;
        const alreadyEarned = localStorage.getItem(storageKey);

        if (!alreadyEarned) {
          totalReward += threshold.reward;
          earnedMilestones.push(threshold.name);
          localStorage.setItem(storageKey, 'true');
          console.log(`💎 Milestone "${threshold.name}" reached! +${threshold.reward} diamonds`);
        }
      }
    }

    // Award diamonds
    if (totalReward > 0) {
      await achievementService.addDiamonds(
        totalReward,
        `Score milestones in ${gameId}: ${earnedMilestones.join(', ')}`
      );

      this.recentRewards.push({
        amount: totalReward,
        source: `${gameId} milestones`,
        timestamp: Date.now()
      });
    }

    return totalReward;
  }

  /**
   * Award diamonds for winning a game
   */
  async awardWinBonus(gameId: string, finalScore: number): Promise<number> {
    // Base win bonus
    let reward = 5;

    // Bonus for high scores
    if (finalScore >= 5000) reward += 15;
    else if (finalScore >= 2500) reward += 10;
    else if (finalScore >= 1000) reward += 7;
    else if (finalScore >= 500) reward += 5;

    await achievementService.addDiamonds(reward, `Win bonus for ${gameId}`);

    this.recentRewards.push({
      amount: reward,
      source: `${gameId} win`,
      timestamp: Date.now()
    });

    console.log(`💎 Win bonus! +${reward} diamonds`);
    return reward;
  }

  /**
   * Award diamonds for leaderboard position
   */
  async awardLeaderboardReward(gameId: string, position: number, isNewRecord: boolean): Promise<number> {
    let reward = 0;

    // Position-based rewards (reduced for balance)
    if (position === 1) reward = 50;
    else if (position === 2) reward = 30;
    else if (position === 3) reward = 20;
    else if (position <= 10) reward = 15;
    else if (position <= 25) reward = 10;
    else if (position <= 50) reward = 5;

    // Bonus for new personal record
    if (isNewRecord) {
      reward += 10;
    }

    if (reward > 0) {
      await achievementService.addDiamonds(
        reward,
        `Leaderboard #${position} in ${gameId}${isNewRecord ? ' (NEW RECORD!)' : ''}`
      );

      this.recentRewards.push({
        amount: reward,
        source: `Leaderboard #${position}`,
        timestamp: Date.now()
      });

      console.log(`💎 Leaderboard reward! Position #${position} = +${reward} diamonds`);
    }

    return reward;
  }

  /**
   * Get total diamonds earned in session
   */
  getSessionEarnings(): number {
    return this.recentRewards.reduce((sum, r) => sum + r.amount, 0);
  }

  /**
   * Get recent rewards (last 10)
   */
  getRecentRewards(): DiamondReward[] {
    return this.recentRewards.slice(-10);
  }

  /**
   * Clear session data (on logout)
   */
  clearSession(): void {
    this.recentRewards = [];
  }
}

const diamondEarningService = new DiamondEarningService();
export default diamondEarningService;
export type { DiamondReward };
