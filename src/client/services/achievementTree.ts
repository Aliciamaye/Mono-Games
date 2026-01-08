/**
 * Minecraft-Style Achievement Tree System
 * - Visual progression tree
 * - Achievement dependencies (unlock order)
 * - Categories with branching paths
 * - Progress tracking
 */

export interface AchievementNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  diamondReward: number;
  category: 'starter' | 'explorer' | 'master' | 'legend' | 'leaderboard' | 'secret';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // Dependencies (must unlock these first)
  requires?: string[];
  
  // Progress tracking
  progress?: number;
  maxProgress?: number;
  
  // Visual tree positioning
  x: number; // Column
  y: number; // Row
  
  // State
  unlocked: boolean;
  unlockedAt?: number;
  
  // Game-specific
  gameId?: string;
}

/**
 * Achievement Tree Structure (Minecraft-like)
 */
export const ACHIEVEMENT_TREE: AchievementNode[] = [
  // ═══════════════ STARTER PATH (Column 0) ═══════════════
  {
    id: 'welcome',
    name: 'Welcome!',
    description: 'Create your account',
    icon: '👋',
    diamondReward: 25,
    category: 'starter',
    rarity: 'common',
    x: 0,
    y: 0,
    unlocked: false
  },
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    diamondReward: 10,
    category: 'starter',
    rarity: 'common',
    requires: ['welcome'],
    x: 0,
    y: 1,
    unlocked: false
  },
  {
    id: 'first_win',
    name: 'Victory!',
    description: 'Score 100+ points in any game',
    icon: '🏆',
    diamondReward: 15,
    category: 'starter',
    rarity: 'common',
    requires: ['first_game'],
    maxProgress: 100,
    x: 0,
    y: 2,
    unlocked: false
  },

  // ═══════════════ EXPLORER PATH (Column 1) ═══════════════
  {
    id: 'game_hopper',
    name: 'Game Hopper',
    description: 'Play 5 different games',
    icon: '🦘',
    diamondReward: 20,
    category: 'explorer',
    rarity: 'uncommon',
    requires: ['first_win'],
    maxProgress: 5,
    x: 1,
    y: 2,
    unlocked: false
  },
  {
    id: 'variety_seeker',
    name: 'Variety Seeker',
    description: 'Play 10 different games',
    icon: '🎯',
    diamondReward: 400,
    category: 'explorer',
    rarity: 'uncommon',
    requires: ['game_hopper'],
    maxProgress: 10,
    x: 1,
    y: 3,
    unlocked: false
  },
  {
    id: 'all_games',
    name: 'Completionist',
    description: 'Play all available games',
    icon: '💯',
    diamondReward: 1000,
    category: 'explorer',
    rarity: 'rare',
    requires: ['variety_seeker'],
    maxProgress: 17,
    x: 1,
    y: 4,
    unlocked: false
  },

  // ═══════════════ MASTER PATH (Column 2) ═══════════════
  {
    id: 'score_500',
    name: 'Rising Star',
    description: 'Score 500+ in any game',
    icon: '⭐',
    diamondReward: 250,
    category: 'master',
    rarity: 'uncommon',
    requires: ['first_win'],
    maxProgress: 500,
    x: 2,
    y: 2,
    unlocked: false
  },
  {
    id: 'score_1000',
    name: 'Pro Player',
    description: 'Score 1,000+ in any game',
    icon: '🌟',
    diamondReward: 500,
    category: 'master',
    rarity: 'rare',
    requires: ['score_500'],
    maxProgress: 1000,
    x: 2,
    y: 3,
    unlocked: false
  },
  {
    id: 'score_5000',
    name: 'Gaming Legend',
    description: 'Score 5,000+ in any game',
    icon: '💫',
    diamondReward: 1500,
    category: 'master',
    rarity: 'epic',
    requires: ['score_1000'],
    maxProgress: 5000,
    x: 2,
    y: 4,
    unlocked: false
  },

  // ═══════════════ LEADERBOARD ACHIEVEMENTS ═══════════════
  {
    id: 'leaderboard_debut',
    name: 'On The Board',
    description: 'Appear on any leaderboard',
    icon: '📊',
    diamondReward: 300,
    category: 'leaderboard',
    rarity: 'uncommon',
    requires: ['first_win'],
    x: 3,
    y: 2,
    unlocked: false
  },
  {
    id: 'top_10',
    name: 'Top 10',
    description: 'Reach top 10 on any leaderboard',
    icon: '🥉',
    diamondReward: 500,
    category: 'leaderboard',
    rarity: 'rare',
    requires: ['leaderboard_debut'],
    x: 3,
    y: 3,
    unlocked: false
  },
  {
    id: 'top_3',
    name: 'Podium Finish',
    description: 'Reach top 3 on any leaderboard',
    icon: '🥈',
    diamondReward: 1000,
    category: 'leaderboard',
    rarity: 'epic',
    requires: ['top_10'],
    x: 3,
    y: 4,
    unlocked: false
  },
  {
    id: 'champion',
    name: 'Champion!',
    description: 'Reach #1 on any leaderboard',
    icon: '🥇',
    diamondReward: 2500,
    category: 'leaderboard',
    rarity: 'legendary',
    requires: ['top_3'],
    x: 3,
    y: 5,
    unlocked: false
  },
  {
    id: 'win_streak_3',
    name: 'On Fire!',
    description: 'Win 3 games in a row',
    icon: '🔥',
    diamondReward: 400,
    category: 'leaderboard',
    rarity: 'rare',
    requires: ['leaderboard_debut'],
    maxProgress: 3,
    x: 4,
    y: 3,
    unlocked: false
  },
  {
    id: 'win_streak_10',
    name: 'Unstoppable!',
    description: 'Win 10 games in a row',
    icon: '⚡',
    diamondReward: 1500,
    category: 'leaderboard',
    rarity: 'epic',
    requires: ['win_streak_3'],
    maxProgress: 10,
    x: 4,
    y: 4,
    unlocked: false
  },

  // ═══════════════ LEGEND PATH (Column 5) ═══════════════
  {
    id: 'multi_champion',
    name: 'Multi-Champion',
    description: 'Reach #1 on 3 different leaderboards',
    icon: '👑',
    diamondReward: 5000,
    category: 'legend',
    rarity: 'legendary',
    requires: ['champion'],
    maxProgress: 3,
    x: 5,
    y: 5,
    unlocked: false
  },
  {
    id: 'diamond_collector',
    name: 'Diamond Collector',
    description: 'Earn 10,000 total diamonds',
    icon: '💎',
    diamondReward: 2000,
    category: 'legend',
    rarity: 'legendary',
    requires: ['all_games', 'score_5000'],
    maxProgress: 10000,
    x: 5,
    y: 4,
    unlocked: false
  },

  // ═══════════════ SECRET ACHIEVEMENTS ═══════════════
  {
    id: 'konami_code',
    name: 'Old School',
    description: '↑↑↓↓←→←→BA',
    icon: '🕹️',
    diamondReward: 1000,
    category: 'secret',
    rarity: 'epic',
    x: 6,
    y: 0,
    unlocked: false
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play at 3 AM',
    icon: '🦉',
    diamondReward: 500,
    category: 'secret',
    rarity: 'rare',
    x: 6,
    y: 1,
    unlocked: false
  },
  {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Unlock 5 achievements in 1 hour',
    icon: '⏱️',
    diamondReward: 750,
    category: 'secret',
    rarity: 'epic',
    x: 6,
    y: 2,
    unlocked: false
  },
  {
    id: 'lucky_777',
    name: 'Lucky Seven',
    description: 'Score exactly 777',
    icon: '🍀',
    diamondReward: 777,
    category: 'secret',
    rarity: 'rare',
    x: 6,
    y: 3,
    unlocked: false
  }
];

/**
 * Get achievement rarity color
 */
export const getRarityColor = (rarity: AchievementNode['rarity']): string => {
  const colors = {
    common: '#9E9E9E',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800'
  };
  return colors[rarity];
};

/**
 * Get achievement category color
 */
export const getCategoryColor = (category: AchievementNode['category']): string => {
  const colors = {
    starter: '#4CAF50',
    explorer: '#2196F3',
    master: '#9C27B0',
    legend: '#FF9800',
    leaderboard: '#F44336',
    secret: '#607D8B'
  };
  return colors[category];
};

/**
 * Check if achievement can be unlocked (dependencies met)
 */
export const canUnlock = (achievement: AchievementNode, unlockedIds: Set<string>): boolean => {
  if (achievement.unlocked) return false;
  if (!achievement.requires || achievement.requires.length === 0) return true;
  
  return achievement.requires.every(reqId => unlockedIds.has(reqId));
};

/**
 * Get achievement progress percentage
 */
export const getProgress = (achievement: AchievementNode): number => {
  if (!achievement.maxProgress) return achievement.unlocked ? 100 : 0;
  const progress = achievement.progress || 0;
  return Math.min(100, Math.round((progress / achievement.maxProgress) * 100));
};

export default ACHIEVEMENT_TREE;
