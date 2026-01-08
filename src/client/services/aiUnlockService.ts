/**
 * AI Unlock Service
 * Manages AI opponent unlocks for premium games (15💎 each)
 */

import achievementService from './achievementService';

class AIUnlockService {
  private storageKey = 'ai_unlocks';

  /**
   * Check if AI is unlocked for a game
   */
  isAIUnlocked(gameId: string): boolean {
    const unlocked = this.getUnlockedAI();
    return unlocked.includes(gameId);
  }

  /**
   * Get all unlocked AI opponents
   */
  getUnlockedAI(): string[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Unlock AI for a game (costs 15💎)
   */
  async unlockAI(gameId: string): Promise<boolean> {
    // Check if already unlocked
    if (this.isAIUnlocked(gameId)) {
      console.log('AI already unlocked for', gameId);
      return true;
    }

    // Check if user has enough diamonds
    const currentDiamonds = achievementService.getDiamonds();
    if (currentDiamonds < 15) {
      console.log('Not enough diamonds to unlock AI');
      return false;
    }

    // Spend diamonds
    const success = await achievementService.spendDiamonds(15, `AI unlock for ${gameId}`);
    
    if (success) {
      // Add to unlocked list
      const unlocked = this.getUnlockedAI();
      unlocked.push(gameId);
      localStorage.setItem(this.storageKey, JSON.stringify(unlocked));
      console.log(`🤖 AI unlocked for ${gameId}!`);
      return true;
    }

    return false;
  }

  /**
   * Get AI unlock cost
   */
  getAIUnlockCost(): number {
    return 15;
  }

  /**
   * Check if user can afford AI unlock
   */
  canAffordAI(): boolean {
    return achievementService.getDiamonds() >= 15;
  }
}

const aiUnlockService = new AIUnlockService();
export default aiUnlockService;
