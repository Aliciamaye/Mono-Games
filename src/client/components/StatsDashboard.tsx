import type React from 'react';
import { useState, useEffect } from 'react';
import statisticsService, { type UserStats } from '../services/statisticsService';
import { ChartIcon, ClockIcon, TrophyIcon, GamepadIcon, StarIcon, FireIcon } from './Icons';

interface StatsDashboardProps {
  userId?: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ userId }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const userStats = await statisticsService.getUserStats(userId);
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading-spinner" />
        <div style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Loading statistics...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No statistics available
      </div>
    );
  }

  const topGames = [...stats.gameStats]
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5);

  return (
    <div>
      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={GamepadIcon}
          label="Games Played"
          value={stats.totalGamesPlayed.toLocaleString()}
          color="var(--primary)"
        />
        <StatCard
          icon={ClockIcon}
          label="Play Time"
          value={statisticsService.formatPlayTime(stats.totalPlayTime)}
          color="var(--secondary)"
        />
        <StatCard
          icon={TrophyIcon}
          label="Total Score"
          value={stats.totalScore.toLocaleString()}
          color="#F59E0B"
        />
        <StatCard
          icon={FireIcon}
          label="Avg Session"
          value={statisticsService.formatPlayTime(stats.averageSessionLength)}
          color="#EF4444"
        />
      </div>

      {/* Favorite Game */}
      {stats.favoriteGame && (
        <div className="cartoony-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h4 style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <StarIcon size={20} color="var(--primary)" />
            Favorite Game
          </h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--bg-pattern)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-color)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🎮
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                fontSize: '1.125rem',
                textTransform: 'capitalize'
              }}>
                {stats.favoriteGame.replace(/-/g, ' ')}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                You play this game the most!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Games Table */}
      {topGames.length > 0 && (
        <div className="cartoony-card" style={{ padding: '1.5rem' }}>
          <h4 style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ChartIcon size={20} color="var(--primary)" />
            Top Games
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid var(--border-color)',
                  textAlign: 'left'
                }}>
                  <th style={{ padding: '0.75rem', fontFamily: "'Comic Sans MS', cursive" }}>
                    Game
                  </th>
                  <th style={{ padding: '0.75rem', fontFamily: "'Comic Sans MS', cursive" }}>
                    Played
                  </th>
                  <th style={{ padding: '0.75rem', fontFamily: "'Comic Sans MS', cursive" }}>
                    High Score
                  </th>
                  <th style={{ padding: '0.75rem', fontFamily: "'Comic Sans MS', cursive" }}>
                    Avg Score
                  </th>
                  <th style={{ padding: '0.75rem', fontFamily: "'Comic Sans MS', cursive" }}>
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {topGames.map((game, index) => (
                  <tr
                    key={game.gameId}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-pattern)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: index === 0
                            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                            : index === 1
                              ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                              : index === 2
                                ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'
                                : 'var(--bg-pattern)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: index < 3 ? 'white' : 'var(--text-secondary)'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {game.gameId.replace(/-/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                      {game.gamesPlayed}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {game.highScore.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {Math.round(game.averageScore).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: 'var(--bg-pattern)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${game.winRate}%`,
                            height: '100%',
                            background: game.winRate >= 50
                              ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                              : 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          minWidth: '45px',
                          textAlign: 'right'
                        }}>
                          {game.winRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  return (
    <div
      className="cartoony-card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-circle)',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 0 ${color}dd`
      }}>
        <Icon size={24} color="white" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.25rem'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          fontFamily: "'Comic Sans MS', cursive",
          color: 'var(--text-primary)'
        }}>
          {value}
        </div>
      </div>
    </div>
  );
};
