import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import { CORE_GAMES } from '../services/gameStore';

function GameLauncher() {
  const navigate = useNavigate();
  const { installedGames, loadGames, isLoading } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, core, downloaded

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const coreGames = CORE_GAMES.map((id) => ({
    id,
    name: formatGameName(id),
    core: true,
    installed: true,
    size: '2MB',
    version: '1.0.0'
  }));

  const allGames = [...coreGames, ...installedGames.filter((g) => !g.core)];

  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'core' && game.core) ||
      (filter === 'downloaded' && !game.core);
    return matchesSearch && matchesFilter;
  });

  const handlePlayGame = (gameId) => {
    navigate(`/play/${gameId}`);
  };

  return (
    <div className="game-launcher" style={{ padding: '2rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="retro-title" style={{ marginBottom: '1rem' }}>
            🎮 Game Launcher
          </h1>
          <p className="retro-text">
            {installedGames.length + coreGames.length} games installed
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="retro-input"
            style={{ flex: 1, minWidth: '200px' }}
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="retro-input"
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Games</option>
            <option value="core">Core Games</option>
            <option value="downloaded">Downloaded</option>
          </select>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="retro-text pulse">Loading games...</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredGames.map((game) => (
              <div key={game.id} className="retro-card" style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <h3 className="retro-subtitle" style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {game.name}
                  </h3>
                  
                  {game.core && (
                    <span className="retro-badge">CORE</span>
                  )}
                </div>
                
                <div className="retro-text" style={{
                  marginBottom: '1rem',
                  color: 'var(--text-dark)'
                }}>
                  Version: {game.version} • Size: {game.size}
                </div>
                
                <button
                  onClick={() => handlePlayGame(game.id)}
                  className="retro-btn"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  ▶ Play Now
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredGames.length === 0 && !isLoading && (
          <div className="retro-card" style={{
            padding: '4rem',
            textAlign: 'center'
          }}>
            <h3 className="retro-subtitle" style={{ marginBottom: '1rem' }}>
              No games found
            </h3>
            <p className="retro-text">
              Try adjusting your search or download more games from the store!
            </p>
          </div>
        )}
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

export default GameLauncher;
