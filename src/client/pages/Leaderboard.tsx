import { useState } from 'react';
import { TrophyIcon, CrownIcon, StarIcon, SearchIcon, GamepadIcon } from '../components/Icons';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');

  const games = [
    { id: 'all', name: 'All Games' },
    { id: 'snake', name: 'Snake' },
    { id: 'pong', name: 'Pong' },
    { id: 'tetris', name: 'Tetris' },
    { id: '2048', name: '2048' },
    { id: 'tic-tac-toe', name: 'Tic Tac Toe' },
    { id: 'connect-four', name: 'Connect Four' }
  ];

  const periods = [
    { id: 'daily', label: 'Today' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'all-time', label: 'All Time' }
  ];

  // Empty leaderboard - no fake data
  const leaderboardData = [];

  // Current user's rank (will be populated when user plays games)
  const currentUserRank = null;

  const EmptyState = () => (
    <div className="cartoony-card" style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      marginTop: '2rem'
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        margin: '0 auto 1.5rem',
        borderRadius: 'var(--radius-circle)',
        background: 'var(--bg-pattern)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid var(--border-color)'
      }}>
        <TrophyIcon size={60} color="var(--text-secondary)" />
      </div>

      <h3 className="cartoony-subtitle" style={{ marginBottom: '1rem' }}>
        No Scores Yet!
      </h3>

      <p style={{
        color: 'var(--text-secondary)',
        maxWidth: '400px',
        margin: '0 auto 2rem',
        lineHeight: 1.6
      }}>
        Be the first to claim a spot on the leaderboard! Play games and your scores will appear here.
      </p>

      <a href="/launcher">
        <button className="cartoony-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <GamepadIcon size={20} color="white" /> Start Playing
        </button>
      </a>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '2rem'
    }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="cartoony-title" style={{
          textAlign: 'center',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem'
        }}>
          <TrophyIcon size={40} color="var(--secondary)" /> Leaderboards
        </h1>

        {/* Filters */}
        <div className="cartoony-card" style={{
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {/* Game Filter */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                <GamepadIcon size={18} /> Game
              </label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="cartoony-input"
                style={{ width: '100%' }}
              >
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                Time Period
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {periods.map(period => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: selectedPeriod === period.id
                        ? '3px solid var(--primary)'
                        : '3px solid var(--border-color)',
                      borderRadius: 'var(--radius-pill)',
                      background: selectedPeriod === period.id
                        ? 'var(--primary)'
                        : 'var(--bg-card)',
                      color: selectedPeriod === period.id
                        ? 'white'
                        : 'var(--text-primary)',
                      fontFamily: "'Comic Sans MS', cursive",
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-normal)'
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State or Leaderboard */}
        {leaderboardData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Top 3 Podium would go here */}
            {/* Full Rankings would go here */}
          </>
        )}

        {/* Your Stats Card */}
        <div className="cartoony-card" style={{
          padding: '1.5rem',
          marginTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-circle)',
            background: 'var(--bg-pattern)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid var(--border-color)'
          }}>
            <StarIcon size={30} color="var(--text-secondary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700,
              fontSize: '1.25rem',
              color: 'var(--text-primary)'
            }}>
              Your Stats
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem'
            }}>
              Play games to track your progress and compete!
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontWeight: 900,
                fontSize: '1.5rem',
                color: 'var(--primary)',
                fontFamily: "'Comic Sans MS', cursive"
              }}>
                0
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Games</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontWeight: 900,
                fontSize: '1.5rem',
                color: 'var(--primary)',
                fontFamily: "'Comic Sans MS', cursive"
              }}>
                0
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontWeight: 900,
                fontSize: '1.5rem',
                color: 'var(--text-secondary)',
                fontFamily: "'Comic Sans MS', cursive"
              }}>
                —
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rank</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
