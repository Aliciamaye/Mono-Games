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
    hasLocalMultiplayer?: boolean;
    aiUnlockCost?: number; // Cost to unlock AI (15💎)
    requiresLogin?: boolean; // Require login to purchase
}

export const PREMIUM_GAMES: PremiumGame[] = [
    // Tier 1: Light games (25 diamonds)
    {
        id: 'chess',
        name: 'Chess Master',
        description: 'Classic chess with local 2-player mode',
        diamondCost: 25,
        category: 'Strategy',
        difficulty: 'medium',
        is3D: false,
        fileSize: '2MB',
        features: ['Local 2-Player', 'Move Hints', 'Game Analysis'],
        thumbnail: '♟️',
        hasLocalMultiplayer: true,
        aiUnlockCost: 15,
        requiresLogin: true
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

    // Tier 2: Medium games (50 diamonds)
    {
        id: 'tower-defense',
        name: 'Tower Defense Pro',
        description: 'Strategic tower defense with 20+ levels',
        diamondCost: 50,
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
        diamondCost: 50,
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
        diamondCost: 50,
        category: 'Music',
        difficulty: 'medium',
        is3D: false,
        fileSize: '8MB',
        features: ['15 Original Tracks', 'Combo System', 'Leaderboards'],
        thumbnail: '🎵'
    },

    // Tier 3: Premium 3D games (75 diamonds)
    {
        id: 'fps-shooter',
        name: 'FPS Arena',
        description: '3D first-person shooter with local co-op',
        diamondCost: 75,
        category: 'Action',
        difficulty: 'expert',
        is3D: true,
        fileSize: '15MB',
        features: ['3D Graphics', 'Local Co-op', '5 Game Modes', 'Weapon Customization'],
        thumbnail: '🔫',
        hasLocalMultiplayer: true,
        aiUnlockCost: 15,
        requiresLogin: true
    },
    {
        id: 'open-world',
        name: 'Open World Adventure',
        description: '3D open world exploration game',
        diamondCost: 75,
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
        description: 'Realistic 3D racing with split-screen multiplayer',
        diamondCost: 75,
        category: 'Racing',
        difficulty: 'hard',
        is3D: true,
        fileSize: '18MB',
        features: ['3D Graphics', 'Local Split-Screen', '10 Tracks', 'Car Customization'],
        thumbnail: '🏎️',
        hasLocalMultiplayer: true,
        aiUnlockCost: 15,
        requiresLogin: true
    },
    {
        id: 'survival-craft',
        name: 'Survival Crafter',
        description: 'Minecraft-style survival crafting game',
        diamondCost: 75,
        category: 'Survival',
        difficulty: 'expert',
        is3D: true,
        fileSize: '25MB',
        features: ['3D Voxel World', 'Crafting System', 'Building', 'Day/Night Cycle'],
        thumbnail: '⛏️'
    },
    
    // NEW GAMES - Ultimate Update v2.0
    {
        id: 'poker',
        name: 'Texas Hold\'em Poker',
        description: 'Professional poker with AI opponents',
        diamondCost: 50,
        category: 'Card',
        difficulty: 'medium',
        is3D: false,
        fileSize: '3MB',
        features: ['Texas Hold\'em', 'AI Opponent', 'Pot System', 'Hand Rankings'],
        thumbnail: '🃏',
        aiUnlockCost: 15,
        requiresLogin: true
    },
    {
        id: 'kart-racing',
        name: 'Kart Racing',
        description: 'Mario Kart style racing with power-ups',
        diamondCost: 75,
        category: 'Racing',
        difficulty: 'hard',
        is3D: false,
        fileSize: '8MB',
        features: ['Drifting Mechanics', 'Power-Ups', '4 AI Opponents', '3 Lap Races'],
        thumbnail: '🏎️'
    },
    
    // Tier 4: Chill/Relaxation Games (30-40 diamonds)
    {
        id: 'zen-garden',
        name: 'Zen Garden',
        description: 'Peaceful Japanese garden - rake sand, place rocks, grow bonsai',
        diamondCost: 30,
        category: 'Relaxation',
        difficulty: 'easy',
        is3D: true,
        fileSize: '6MB',
        features: ['8 Rake Patterns', '5 Bonsai Species', 'Wildlife Animations', 'Meditation Mode', 'NO SCORING'],
        thumbnail: '🎋'
    },
    {
        id: 'space-explorer',
        name: 'Space Explorer',
        description: 'Peaceful cosmic journey - discover planets, fly through nebulae',
        diamondCost: 35,
        category: 'Relaxation',
        difficulty: 'easy',
        is3D: true,
        fileSize: '5MB',
        features: ['Procedural Universe', '20+ Planets', 'Beautiful Nebulae', 'Free Camera', 'NO COMBAT'],
        thumbnail: '🌌'
    },
    {
        id: 'campfire-simulator',
        name: 'Campfire Simulator',
        description: 'Cozy campfire experience - watch flames, roast marshmallows, relax',
        diamondCost: 25,
        category: 'Relaxation',
        difficulty: 'easy',
        is3D: true,
        fileSize: '4MB',
        features: ['Animated Flames', 'Particle Effects', 'Night Sky', 'Marshmallow Roasting', 'NO GOALS'],
        thumbnail: '🔥'
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
