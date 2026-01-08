// Premium Game Definitions
// These games require diamonds to unlock

export interface PremiumGame {
    id: string;
    name: string;
    description: string;
    diamondCost: number;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    is3D: boolean;
    fileSize: string;
    features: string[];
    thumbnail: string;
}

export const PREMIUM_GAMES: PremiumGame[] = [
    // Tier 1: Light games (25 diamonds) - Very affordable!
    {
        id: 'chess',
        name: 'Chess Master',
        description: 'Classic chess with AI opponent and tutorials',
        diamondCost: 25,
        category: 'Strategy',
        difficulty: 'medium',
        is3D: false,
        fileSize: '2MB',
        features: ['AI Opponent', 'Move Hints', 'Game Analysis'],
        thumbnail: '♟️'
    },
    {
        id: 'sudoku',
        name: 'Sudoku Pro',
        description: 'Challenging Sudoku puzzles with hints',
        diamondCost: 25,
        category: 'Puzzle',
        difficulty: 'easy',
        is3D: false,
        fileSize: '1.5MB',
        features: ['Multiple Difficulties', 'Hint System', 'Daily Challenges'],
        thumbnail: '🔢'
    },
    {
        id: 'mahjong',
        name: 'Mahjong Solitaire',
        description: 'Beautiful tile-matching game',
        diamondCost: 25,
        category: 'Puzzle',
        difficulty: 'easy',
        is3D: false,
        fileSize: '3MB',
        features: ['Multiple Layouts', 'Time Trials', 'Relaxing Music'],
        thumbnail: '🀄'
    },

    // Tier 2: Medium games (75 diamonds) - Great value!
    {
        id: 'tower-defense',
        name: 'Tower Defense Pro',
        description: 'Strategic tower defense with 20+ levels',
        diamondCost: 75,
        category: 'Strategy',
        difficulty: 'hard',
        is3D: false,
        fileSize: '5MB',
        features: ['20+ Levels', '10 Tower Types', 'Boss Battles'],
        thumbnail: '🏰'
    },
    {
        id: 'rpg-dungeon',
        name: 'Dungeon Crawler RPG',
        description: 'Roguelike dungeon crawler with procedural levels',
        diamondCost: 75,
        category: 'RPG',
        difficulty: 'hard',
        is3D: false,
        fileSize: '6MB',
        features: ['Procedural Levels', 'Loot System', 'Character Classes'],
        thumbnail: '⚔️'
    },
    {
        id: 'rhythm-game',
        name: 'Rhythm Master',
        description: 'Music rhythm game with original tracks',
        diamondCost: 75,
        category: 'Music',
        difficulty: 'medium',
        is3D: false,
        fileSize: '8MB',
        features: ['15 Original Tracks', 'Combo System', 'Leaderboards'],
        thumbnail: '🎵'
    },

    // Tier 3: Premium 3D games (150 diamonds) - Best experience!
    {
        id: 'fps-shooter',
        name: 'FPS Arena',
        description: '3D first-person shooter with multiplayer',
        diamondCost: 150,
        category: 'Action',
        difficulty: 'expert',
        is3D: true,
        fileSize: '15MB',
        features: ['3D Graphics', 'Multiplayer', '5 Game Modes', 'Weapon Customization'],
        thumbnail: '🔫'
    },
    {
        id: 'open-world',
        name: 'Open World Adventure',
        description: '3D open world exploration game',
        diamondCost: 150,
        category: 'Adventure',
        difficulty: 'expert',
        is3D: true,
        fileSize: '20MB',
        features: ['3D Graphics', 'Free Roam', 'Quests', 'NPCs'],
        thumbnail: '🗺️'
    },
    {
        id: 'racing-3d',
        name: '3D Racing Pro',
        description: 'Realistic 3D racing with physics',
        diamondCost: 150,
        category: 'Racing',
        difficulty: 'hard',
        is3D: true,
        fileSize: '18MB',
        features: ['3D Graphics', '10 Tracks', 'Car Customization', 'Time Trials'],
        thumbnail: '🏎️'
    },
    {
        id: 'survival-craft',
        name: 'Survival Crafter',
        description: 'Minecraft-style survival crafting game',
        diamondCost: 150,
        category: 'Survival',
        difficulty: 'expert',
        is3D: true,
        fileSize: '25MB',
        features: ['3D Voxel World', 'Crafting System', 'Building', 'Day/Night Cycle'],
        thumbnail: '⛏️'
    }
];

// Check if a game is premium
export function isPremiumGame(gameId: string): boolean {
    return PREMIUM_GAMES.some(game => game.id === gameId);
}

// Get premium game info
export function getPremiumGame(gameId: string): PremiumGame | undefined {
    return PREMIUM_GAMES.find(game => game.id === gameId);
}

// Check if user has unlocked a premium game
export function isGameUnlocked(gameId: string): boolean {
    if (!isPremiumGame(gameId)) return true; // Free games are always unlocked

    const unlocked = JSON.parse(localStorage.getItem('unlockedGames') || '[]');
    return unlocked.includes(gameId);
}

// Unlock a premium game
export function unlockGame(gameId: string): boolean {
    const game = getPremiumGame(gameId);
    if (!game) return false;

    const unlocked = JSON.parse(localStorage.getItem('unlockedGames') || '[]');
    if (!unlocked.includes(gameId)) {
        unlocked.push(gameId);
        localStorage.setItem('unlockedGames', JSON.stringify(unlocked));
    }

    return true;
}

// Get all unlocked premium games
export function getUnlockedGames(): string[] {
    return JSON.parse(localStorage.getItem('unlockedGames') || '[]');
}
