import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import achievementService from '../services/achievementService';
import DiamondBalance from '../components/DiamondBalance';
import {
  SnakeIcon,
  PongIcon,
  TetrisIcon,
  PuzzleIcon,
  MemoryIcon,
  RacingIcon,
  TicTacToeIcon,
  ConnectFourIcon,
  GamepadIcon,
  SearchIcon,
  DownloadIcon,
  PlayIcon,
  CheckIcon,
  ShoppingCartIcon
} from '../components/Icons';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

type StoreGame = {
  id: string;
  name: string;
  category: string;
  installed: boolean;
  core: boolean;
  rating: number;
  downloads: number;
  size: string;
  description: string;
  isNew?: boolean;
  hasAI?: boolean;
  cost?: number;
};

const GAME_COSTS: Record<string, number> = {
  'minesweeper': 2000,
  'flappy-bird': 3000,
  'space-invaders': 5000,
  'sudoku': 1500,
  'typing-test': 1000,
  'chess': 5000,
  'checkers': 2500
};

const categories = [
  { id: 'all', name: 'All Games', icon: GamepadIcon },
  { id: 'arcade', name: 'Arcade', icon: GamepadIcon },
  { id: 'puzzle', name: 'Puzzle', icon: PuzzleIcon },
  { id: 'strategy', name: 'Strategy', icon: TicTacToeIcon },
  { id: 'sports', name: 'Sports', icon: PongIcon },
  { id: 'racing', name: 'Racing', icon: RacingIcon }
];

const allGames: StoreGame[] = [
  { id: 'snake', name: 'Snake', category: 'arcade', installed: true, core: true, rating: 0, downloads: 0, size: '2MB', description: 'Classic snake gameplay with power-ups!' },
  { id: 'pong', name: 'Pong', category: 'sports', installed: true, core: true, rating: 0, downloads: 0, size: '1.5MB', description: 'Classic paddle game with AI opponent' },
  { id: 'tetris', name: 'Tetris', category: 'puzzle', installed: true, core: true, rating: 0, downloads: 0, size: '2MB', description: 'Stack blocks and clear lines!' },
  { id: '2048', name: '2048', category: 'puzzle', installed: true, core: true, rating: 0, downloads: 0, size: '1MB', description: 'Merge tiles to reach 2048', isNew: true },
  { id: 'memory-match', name: 'Memory Match', category: 'puzzle', installed: true, core: true, rating: 0, downloads: 0, size: '1.5MB', description: 'Match pairs of cards!' },
  { id: 'racing', name: 'Turbo Racer', category: 'racing', installed: true, core: true, rating: 0, downloads: 0, size: '3MB', description: 'High-speed racing action!' },
  { id: 'breakout', name: 'Breakout', category: 'arcade', installed: true, core: true, rating: 0, downloads: 0, size: '1.5MB', description: 'Break all the bricks!' },
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', category: 'strategy', installed: true, core: true, rating: 0, downloads: 0, size: '0.5MB', description: 'Classic X and O game with AI', isNew: true, hasAI: true },
  { id: 'connect-four', name: 'Connect Four', category: 'strategy', installed: true, core: true, rating: 0, downloads: 0, size: '1MB', description: 'Drop discs and connect four!', isNew: true, hasAI: true },
  { id: 'minesweeper', name: 'Minesweeper', category: 'puzzle', installed: false, core: false, rating: 0, downloads: 0, size: '1MB', description: 'Find mines without exploding!', cost: 2000 },
  { id: 'flappy-bird', name: 'Flappy Bird', category: 'arcade', installed: false, core: false, rating: 0, downloads: 0, size: '1.5MB', description: 'Tap to fly through pipes!', cost: 3000 },
  { id: 'space-invaders', name: 'Space Invaders', category: 'arcade', installed: false, core: false, rating: 0, downloads: 0, size: '2MB', description: 'Defend Earth from aliens!', cost: 5000 },
  { id: 'sudoku', name: 'Sudoku', category: 'puzzle', installed: false, core: false, rating: 0, downloads: 0, size: '1MB', description: 'Number puzzles for your brain', cost: 1500 },
  { id: 'typing-test', name: 'Typing Test', category: 'puzzle', installed: false, core: false, rating: 0, downloads: 0, size: '0.5MB', description: 'Test your typing speed!', cost: 1000 },
  { id: 'chess', name: 'Chess', category: 'strategy', installed: false, core: false, rating: 0, downloads: 0, size: '2.5MB', description: 'The ultimate strategy game', hasAI: true, cost: 5000 },
  { id: 'checkers', name: 'Checkers', category: 'strategy', installed: false, core: false, rating: 0, downloads: 0, size: '1MB', description: 'Classic board game with AI', hasAI: true, cost: 2500 }
];

const StoreIcon = ({ size = 24, color = 'currentColor', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
  </svg>
);

function getGameIcon(id: string) {
  const icons: Record<string, typeof GamepadIcon> = {
    'snake': SnakeIcon,
    'pong': PongIcon,
    'tetris': TetrisIcon,
    '2048': PuzzleIcon,
    'memory-match': MemoryIcon,
    'racing': RacingIcon,
    'breakout': TetrisIcon,
    'tic-tac-toe': TicTacToeIcon,
    'connect-four': ConnectFourIcon,
    'minesweeper': PuzzleIcon,
    'flappy-bird': GamepadIcon,
    'space-invaders': GamepadIcon,
    'sudoku': PuzzleIcon,
    'typing-test': GamepadIcon,
    'chess': TicTacToeIcon,
    'checkers': TicTacToeIcon
  };
  return icons[id] || GamepadIcon;
}

function GameStore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [userDiamonds, setUserDiamonds] = useState(0);
  const [purchasedGames, setPurchasedGames] = useState<string[]>([]);
  const [installedGames, setInstalledGames] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await achievementService.init();
      setUserDiamonds(achievementService.getDiamonds());

      const owned = JSON.parse(localStorage.getItem('my_games') || '[]') as string[];
      setPurchasedGames(owned);

      const baseInstalls = allGames.filter(g => g.core).map(g => g.id);
      setInstalledGames(Array.from(new Set([...baseInstalls, ...owned])));
    };

    loadData();

    const interval = setInterval(() => {
      setUserDiamonds(achievementService.getDiamonds());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const purchaseGame = async (gameId: string, gameName: string) => {
    const cost = GAME_COSTS[gameId] || 0;
    if (userDiamonds < cost) {
      showNotification('Not enough diamonds');
      return;
    }

    const success = await achievementService.spendDiamonds(cost, `Purchased ${gameName}`);
    if (!success) {
      showNotification('Transaction failed');
      return;
    }

    const owned = Array.from(new Set([...purchasedGames, gameId]));
    setPurchasedGames(owned);
    localStorage.setItem('my_games', JSON.stringify(owned));
    setUserDiamonds(achievementService.getDiamonds());
    showNotification(`Purchased ${gameName}!`);
  };

  const handleInstall = (gameId: string) => {
    if (downloading.includes(gameId)) return;
    setDownloading(prev => [...prev, gameId]);

    setTimeout(() => {
      setDownloading(prev => prev.filter(id => id !== gameId));
      setInstalledGames(prev => prev.includes(gameId) ? prev : [...prev, gameId]);
      showNotification('Installed!');
    }, 1400);
  };

  const filteredGames = useMemo(() => {
    const filtered = allGames.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return parseFloat(a.size) - parseFloat(b.size);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0;
    });

    return sorted;
  }, [searchTerm, selectedCategory, sortBy]);

  const installedCount = installedGames.length;
  const totalCount = allGames.length;

  const renderActionButton = (game: StoreGame) => {
    const isInstalled = installedGames.includes(game.id);
    const isOwned = game.core || purchasedGames.includes(game.id);
    const isDownloading = downloading.includes(game.id);
    const cost = game.cost ?? 0;
    const canAfford = userDiamonds >= cost;

    if (isInstalled) {
      return (
        <>
          <Link to={`/play/${game.id}`} style={{ flex: 1 }}>
            <button
              className="cartoony-btn"
              style={{ width: '100%', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <PlayIcon size={16} color="white" /> Play
            </button>
          </Link>
          <button
            className="cartoony-btn cartoony-btn-secondary"
            style={{ fontSize: '0.9rem', padding: '0.75rem' }}
            title="Installed"
          >
            <CheckIcon size={18} color="var(--success)" />
          </button>
        </>
      );
    }

    if (isOwned) {
      return (
        <button
          className="cartoony-btn"
          style={{ width: '100%', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          onClick={() => handleInstall(game.id)}
          disabled={isDownloading}
        >
          {isDownloading ? 'Installing...' : (<><DownloadIcon size={16} color="white" /> Install</>)}
        </button>
      );
    }

    return (
      <button
        className="cartoony-btn"
        style={{
          width: '100%',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          background: canAfford ? 'var(--primary)' : '#b0b0b0',
          cursor: canAfford ? 'pointer' : 'not-allowed'
        }}
        disabled={!canAfford}
        onClick={() => purchaseGame(game.id, game.name)}
      >
        <ShoppingCartIcon size={18} color="white" /> Buy {cost} diamonds
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="cartoony-title" style={{ marginBottom: '0.25rem' }}>
              <StoreIcon size={40} color="var(--primary)" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Game Store
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontFamily: "'Comic Sans MS', cursive" }}>
              {installedCount} of {totalCount} games installed
            </p>
          </div>
          <DiamondBalance size="small" />
        </div>

        {notification && (
          <div className="cartoony-card" style={{ marginTop: '1rem', marginBottom: '1rem', padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
            {notification}
          </div>
        )}

        <div className="cartoony-card" style={{ padding: '1.5rem', marginTop: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 2, minWidth: '250px' }}>
              <label style={{ fontFamily: "'Comic Sans MS', cursive", fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                <SearchIcon size={18} /> Search
              </label>
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cartoony-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontFamily: "'Comic Sans MS', cursive", fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cartoony-input"
                style={{ width: '100%' }}
              >
                <option value="name">Name (A-Z)</option>
                <option value="category">Category</option>
                <option value="size">Size</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {categories.map(cat => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '0.75rem 1.25rem',
                      border: isActive ? '3px solid var(--primary)' : '3px solid var(--border-color)',
                      borderRadius: 'var(--radius-pill)',
                      background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                      color: isActive ? 'white' : 'var(--text-primary)',
                      fontFamily: "'Comic Sans MS', cursive",
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'var(--transition-normal)',
                      boxShadow: isActive ? '0 4px 0 var(--primary-dark)' : '0 3px 0 var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <IconComponent size={18} color={isActive ? 'white' : 'var(--text-primary)'} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredGames.map(game => {
            const IconComponent = getGameIcon(game.id);
            return (
              <div key={game.id} className="cartoony-card pop-on-hover" style={{ padding: '1.5rem', position: 'relative', overflow: 'visible' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                  {game.core && (<span className="cartoony-badge">CORE</span>)}
                  {game.isNew && (<span className="cartoony-badge cartoony-badge-new">NEW</span>)}
                  {game.hasAI && (<span className="cartoony-badge cartoony-badge-online">AI</span>)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--bg-pattern) 0%, var(--bg-main) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--border-color)' }}>
                    <IconComponent size={32} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Comic Sans MS', cursive", fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
                      {game.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                        {game.category}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {game.size}
                      </span>
                      {game.cost && !game.core && !installedGames.includes(game.id) && (
                        <span className="cartoony-badge" style={{ background: '#FFE066', color: '#2C3E50' }}>
                          {game.cost} diamonds
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {game.description}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {renderActionButton(game)}
                </div>
              </div>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="cartoony-card" style={{ padding: '4rem', textAlign: 'center', marginTop: '1rem' }}>
            <SearchIcon size={64} color="var(--text-secondary)" />
            <h3 className="cartoony-subtitle" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              No Games Found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameStore;
