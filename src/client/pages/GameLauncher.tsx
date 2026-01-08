import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import { GAME_REGISTRY } from '../config/gameRegistry';
import {
  GamepadIcon, SearchIcon, TrophyIcon, StarIcon, PlayIcon,
  SnakeIcon, PongIcon, TetrisIcon, PuzzleIcon, RacingIcon
} from '../components/Icons';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';
import type React from 'react';

interface Game {
  id: string;
  name: string;
  category: string;
  renderer: string;
  multiplayer: boolean;
  description: string;
  difficulty: string;
  installed: boolean;
  size: string;
  rating: number;
  badge?: string;
}

const GameLauncher: React.FC = () => {
  const navigate = useNavigate();
  const { installedGames, loadGames, isLoading } = useGameStore();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // Game icon mapping
  const getGameIcon = (gameId: string, size: number = 48): React.ReactNode => {
    const iconMap = {
      'snake': <SnakeIcon size={size} color="var(--primary)" />,
      'pong': <PongIcon size={size} color="var(--primary)" />,
      'tetris': <TetrisIcon size={size} color="var(--primary)" />,
      'racing': <RacingIcon size={size} color="var(--primary)" />,
      '2048': <PuzzleIcon size={size} color="var(--primary)" />,
      'memory-match': <PuzzleIcon size={size} color="var(--primary)" />,
    };
    
    return iconMap[gameId] || <GamepadIcon size={size} color="var(--primary)" />;
  };

  const allGames = GAME_REGISTRY.map((game) => ({
    ...game,
    icon: getGameIcon(game.id),
  }));

  // Enhanced filtering and sorting
  const filteredGames = allGames
    .filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory =
        categoryFilter === 'all' ||
        categoryFilter === game.category ||
        (categoryFilter === 'core' && ['arcade', 'puzzle', 'sports'].includes(game.category)) ||
        (categoryFilter === 'premium' && game.premium) ||
        (categoryFilter === 'chill' && game.chill);
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'difficulty':
          const diffOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'expert': 4 };
          return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
        case 'newest':
          return (b.releaseDate || 0) - (a.releaseDate || 0);
        default:
          return 0;
      }
    });

  // Category stats
  const categoryStats = {
    all: allGames.length,
    arcade: allGames.filter(g => g.category === 'arcade').length,
    puzzle: allGames.filter(g => g.category === 'puzzle').length,
    racing: allGames.filter(g => g.category === 'racing').length,
    premium: allGames.filter(g => g.premium).length,
    chill: allGames.filter(g => g.chill).length,
  };

  const handlePlayGame = (gameId) => {
    navigate(`/play/${gameId}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating decorations */}
      <div className="star-container">
        <div className="floating-star star-1"></div>
        <div className="floating-star star-2"></div>
        <div className="floating-star star-3"></div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '2rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="cartoony-title" style={{ marginBottom: '0.5rem' }}>
              🎮 Game Launcher
            </h1>
            <p style={{
              fontFamily: "'Comic Sans MS', cursive",
              color: 'var(--text-secondary)',
              fontSize: '1.125rem'
            }}>
              {allGames.length} games ready to play!
            </p>
          </div>

          {/* Search & Filters */}
          <div className="cartoony-card" style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            border: '4px solid #d97706'
          }}>
            {/* Category Pills */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
              justifyContent: 'center'
            }}>
              {[
                { id: 'all', label: '🎮 All', count: categoryStats.all },
                { id: 'arcade', label: '👾 Arcade', count: categoryStats.arcade },
                { id: 'puzzle', label: '🧩 Puzzle', count: categoryStats.puzzle },
                { id: 'racing', label: '🏎️ Racing', count: categoryStats.racing },
                { id: 'premium', label: '💎 Premium', count: categoryStats.premium },
                { id: 'chill', label: '🧘 Chill', count: categoryStats.chill }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '25px',
                    border: categoryFilter === cat.id
                      ? '4px solid #1f2937'
                      : '4px solid transparent',
                    background: categoryFilter === cat.id
                      ? '#fff'
                      : 'rgba(255,255,255,0.3)',
                    color: categoryFilter === cat.id ? '#1f2937' : '#fff',
                    fontFamily: "'Comic Sans MS', cursive",
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: categoryFilter === cat.id
                      ? '0 4px 12px rgba(0,0,0,0.2)'
                      : 'none',
                    transform: categoryFilter === cat.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseOver={(e) => {
                    if (categoryFilter !== cat.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (categoryFilter !== cat.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    }
                  }}
                >
                  {cat.label} <span style={{ 
                    background: categoryFilter === cat.id ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    marginLeft: '5px',
                    fontSize: '0.85rem'
                  }}>{cat.count}</span>
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr auto',
              gap: '1rem',
              alignItems: 'end'
            }}>
              {/* Search */}
              <div>
                <label style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#fff',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  🔍 Search Games
                </label>
                <input
                  type="text"
                  placeholder="Find your game..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '3px solid #fff',
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Sort By */}
              <div>
                <label style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#fff',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  📊 Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '3px solid #fff',
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="rating">Highest Rated</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Results Count */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: '#fff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: '3px solid #d97706'
                }}>
                  <div style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    color: '#1f2937'
                  }}>
                    {filteredGames.length}
                  </div>
                  <div style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    Games
                  </div>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    border: viewMode === 'grid'
                      ? '3px solid #1f2937'
                      : '3px solid #fff',
                    background: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.3)',
                    color: viewMode === 'grid' ? '#1f2937' : '#fff',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ▦
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List View"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    border: viewMode === 'list'
                      ? '3px solid #1f2937'
                      : '3px solid #fff',
                    background: viewMode === 'list' ? '#fff' : 'rgba(255,255,255,0.3)',
                    color: viewMode === 'list' ? '#1f2937' : '#fff',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ≡
                </button>
              </div>
            </div>
          </div>

          {/* Games Display */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p style={{
                marginTop: '1rem',
                fontFamily: "'Comic Sans MS', cursive",
                color: 'var(--text-secondary)'
              }}>
                Loading games...
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredGames.map((game, index) => (
                <div
                  key={game.id}
                  className="cartoony-card pop-on-hover"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    position: 'relative',
                    animationDelay: `${index * 0.05}s`
                  }}
                  onClick={() => handlePlayGame(game.id)}
                >
                  {/* Badge */}
                  {(game.badge || game.core) && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '12px'
                    }}>
                      <span className={`cartoony-badge ${game.badge === 'NEW' ? 'cartoony-badge-new' :
                          game.badge === 'AI' ? 'cartoony-badge-online' : ''
                        }`}>
                        {game.badge || 'CORE'}
                      </span>
                    </div>
                  )}

                  {/* Game Icon */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--bg-pattern) 0%, var(--bg-main) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    margin: '0 auto 1rem',
                    border: '4px solid var(--border-color)',
                    boxShadow: '0 4px 0 var(--border-color)'
                  }}>
                    {game.icon}
                  </div>

                  {/* Game Name */}
                  <h3 style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    {game.name}
                  </h3>

                  {/* Game Info */}
                  <p style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                  }}>
                    v{game.version} • {game.size}
                  </p>

                  {/* Play Button */}
                  <button
                    className="cartoony-btn"
                    style={{ width: '100%', fontSize: '1rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayGame(game.id);
                    }}
                  >
                    ▶ Play Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredGames.map((game, index) => (
                <div
                  key={game.id}
                  className="cartoony-card"
                  style={{
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePlayGame(game.id)}
                >
                  {/* Icon */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-pattern)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    border: '3px solid var(--border-color)',
                    flexShrink: 0
                  }}>
                    {game.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{
                        fontFamily: "'Comic Sans MS', cursive",
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0
                      }}>
                        {game.name}
                      </h3>
                      {game.badge && (
                        <span className={`cartoony-badge ${game.badge === 'NEW' ? 'cartoony-badge-new' :
                            game.badge === 'AI' ? 'cartoony-badge-online' : ''
                          }`} style={{ transform: 'scale(0.85)' }}>
                          {game.badge}
                        </span>
                      )}
                    </div>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0'
                    }}>
                      v{game.version} • {game.size} • {game.core ? 'Core Game' : 'Downloaded'}
                    </p>
                  </div>

                  {/* Play Button */}
                  <button
                    className="cartoony-btn"
                    style={{ fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayGame(game.id);
                    }}
                  >
                    ▶ Play
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No Games Found */}
          {filteredGames.length === 0 && !isLoading && (
            <div className="cartoony-card" style={{
              padding: '4rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3 className="cartoony-subtitle" style={{ marginBottom: '1rem' }}>
                No games found
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Try adjusting your search or download more games from the store!
              </p>
              <Link to="/store">
                <button className="cartoony-btn">
                  📦 Visit Store
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatGameName(id) {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getRandomDate() {
  const days = Math.floor(Math.random() * 7);
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
}

export default GameLauncher;
