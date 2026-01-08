import type React from 'react';
import { CheckIcon, LockIcon } from './Icons';

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  diamondReward?: number;
  category?: 'account' | 'game';
  unlockedAt?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
  animated?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  showProgress = true,
  animated = true
}) => {
  const IconComponent = achievement.icon;
  const hasProgress = achievement.maxProgress && achievement.maxProgress > 0;
  const progressPercent = hasProgress && achievement.progress && achievement.maxProgress
    ? (achievement.progress / achievement.maxProgress) * 100
    : 0;

  return (
    <div
      className={`cartoony-card achievement-card ${animated ? 'achievement-animated' : ''}`}
      style={{
        padding: '1.25rem',
        opacity: achievement.unlocked ? 1 : 0.7,
        filter: achievement.unlocked ? 'none' : 'grayscale(30%)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      data-unlocked={achievement.unlocked}
    >
      {/* Sparkle effect for unlocked achievements */}
      {achievement.unlocked && (
        <div 
          className="achievement-sparkles"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            opacity: 0.2,
            background: 'radial-gradient(circle at 50% 50%, var(--secondary) 0%, transparent 70%)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <div
          className={achievement.unlocked ? 'achievement-icon-unlocked' : 'achievement-icon-locked'}
          style={{
            width: '56px',
            height: '56px',
            minWidth: '56px',
            borderRadius: 'var(--radius-circle)',
            background: achievement.unlocked
              ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)'
              : 'var(--bg-pattern)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid var(--border-color)',
            boxShadow: achievement.unlocked ? '0 4px 0 var(--primary-dark)' : 'none',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          <IconComponent 
            size={28} 
            color={achievement.unlocked ? 'white' : 'var(--text-secondary)'} 
          />
          {!achievement.unlocked && (
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: 'var(--bg-card)',
                borderRadius: '50%',
                padding: '2px',
                border: '2px solid var(--border-color)'
              }}
            >
              <LockIcon size={12} color="var(--text-secondary)" />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {achievement.name}
                {achievement.unlocked && (
                  <CheckIcon size={18} color="var(--success)" />
                )}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                {achievement.desc}
              </div>
            </div>

            {/* Diamond reward */}
            {achievement.diamondReward && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #2563EB',
                  boxShadow: '0 2px 0 #1E40AF',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'white',
                  whiteSpace: 'nowrap'
                }}
              >
                💎 {achievement.diamondReward}
              </div>
            )}
          </div>

          {/* Progress bar */}
          {showProgress && hasProgress && !achievement.unlocked && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 600
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                <span style={{ 
                  color: 'var(--primary)',
                  fontFamily: "'Comic Sans MS', cursive"
                }}>
                  {achievement.progress || 0} / {achievement.maxProgress}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--bg-pattern)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  border: '2px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                <div
                  className="achievement-progress-fill"
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Shine effect */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: progressPercent > 0 ? 'progressShine 2s infinite' : 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Completion date */}
          {achievement.unlocked && achievement.unlockedAt && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic'
            }}>
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }

        @keyframes progressShine {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        .achievement-card {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .achievement-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .achievement-card[data-unlocked="true"]:hover .achievement-icon-unlocked {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 6px 0 var(--primary-dark);
        }

        .achievement-icon-unlocked {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .achievement-icon-locked {
          transition: all 0.3s ease;
        }

        .achievement-card[data-unlocked="false"]:hover .achievement-icon-locked {
          transform: scale(1.05);
        }

        .achievement-animated[data-unlocked="true"] .achievement-icon-unlocked {
          animation: unlockBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes unlockBounce {
          0% { transform: scale(0) rotate(0deg); }
          50% { transform: scale(1.2) rotate(10deg); }
          75% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .achievement-progress-fill {
          position: relative;
        }

        .achievement-progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 50%,
            rgba(0, 0, 0, 0.1) 100%
          );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

// Category filter tabs
interface AchievementFiltersProps {
  activeFilter: 'all' | 'unlocked' | 'locked' | 'account' | 'game';
  onFilterChange: (filter: 'all' | 'unlocked' | 'locked' | 'account' | 'game') => void;
  counts: {
    all: number;
    unlocked: number;
    locked: number;
    account: number;
    game: number;
  };
}

export const AchievementFilters: React.FC<AchievementFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts
}) => {
  const filters: Array<{ id: 'all' | 'unlocked' | 'locked' | 'account' | 'game', label: string, icon: string }> = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'unlocked', label: 'Unlocked', icon: '✅' },
    { id: 'locked', label: 'Locked', icon: '🔒' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'game', label: 'Games', icon: '🎮' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginBottom: '1.5rem'
    }}>
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: `3px solid ${activeFilter === filter.id ? 'var(--primary)' : 'var(--border-color)'}`,
            background: activeFilter === filter.id
              ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)'
              : 'var(--bg-card)',
            color: activeFilter === filter.id ? 'white' : 'var(--text-primary)',
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeFilter === filter.id ? '0 3px 0 var(--primary-dark)' : 'none',
            transform: activeFilter === filter.id ? 'translateY(0)' : 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            if (activeFilter !== filter.id) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeFilter !== filter.id) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <span>{filter.icon}</span>
          <span>{filter.label}</span>
          <span style={{
            padding: '0.125rem 0.375rem',
            background: activeFilter === filter.id ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-pattern)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {counts[filter.id]}
          </span>
        </button>
      ))}
    </div>
  );
};
