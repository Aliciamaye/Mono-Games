import React from 'react';
import './LoadingSkeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  style?: React.CSSProperties;
}

/**
 * Skeleton loading component for various UI elements
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className = '',
  variant = 'rectangular',
  style
}) => {
  const getStyles = () => {
    const base = {
      width,
      height,
      borderRadius,
      ...style
    };

    switch (variant) {
      case 'text':
        return { ...base, borderRadius: '4px', height: '1rem' };
      case 'circular':
        return { ...base, borderRadius: '50%', width: height };
      case 'card':
        return { ...base, borderRadius: '12px', height: '200px' };
      default:
        return base;
    }
  };

  return (
    <div
      className={`skeleton ${className}`}
      style={getStyles()}
    />
  );
};

/**
 * Game card skeleton for store/launcher pages
 */
export const GameCardSkeleton: React.FC = () => (
  <div className="game-card-skeleton" style={{
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '1rem',
    border: '2px solid var(--border-color)'
  }}>
    <Skeleton variant="rectangular" height="180px" borderRadius="8px" />
    <div style={{ marginTop: '1rem' }}>
      <Skeleton variant="text" width="70%" height="1.5rem" />
      <Skeleton variant="text" width="90%" height="1rem" style={{ marginTop: '0.5rem' }} />
      <Skeleton variant="text" width="60%" height="1rem" style={{ marginTop: '0.25rem' }} />
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
      <Skeleton variant="rectangular" width="48%" height="2.5rem" borderRadius="8px" />
      <Skeleton variant="rectangular" width="48%" height="2.5rem" borderRadius="8px" />
    </div>
  </div>
);

/**
 * Profile header skeleton
 */
export const ProfileHeaderSkeleton: React.FC = () => (
  <div style={{
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '2rem',
    border: '2px solid var(--border-color)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <Skeleton variant="circular" width="120px" height="120px" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="200px" height="2rem" />
        <Skeleton variant="text" width="150px" height="1rem" style={{ marginTop: '0.5rem' }} />
        <Skeleton variant="text" width="300px" height="1rem" style={{ marginTop: '0.5rem' }} />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
      <Skeleton variant="rectangular" width="120px" height="2.5rem" borderRadius="8px" />
      <Skeleton variant="rectangular" width="120px" height="2.5rem" borderRadius="8px" />
    </div>
  </div>
);

/**
 * Leaderboard row skeleton
 */
export const LeaderboardRowSkeleton: React.FC = () => (
  <div style={{
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid var(--border-color)',
    marginBottom: '0.5rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Skeleton variant="text" width="30px" height="1.5rem" />
      <Skeleton variant="circular" width="40px" height="40px" />
      <Skeleton variant="text" width="150px" height="1.25rem" style={{ flex: 1 }} />
      <Skeleton variant="text" width="80px" height="1.5rem" />
      <Skeleton variant="text" width="60px" height="1rem" />
    </div>
  </div>
);

/**
 * Stats card skeleton
 */
export const StatsCardSkeleton: React.FC = () => (
  <div style={{
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '2px solid var(--border-color)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <Skeleton variant="circular" width="48px" height="48px" />
      <Skeleton variant="text" width="120px" height="1.25rem" />
    </div>
    <Skeleton variant="text" width="80px" height="2rem" />
    <Skeleton variant="text" width="100px" height="0.875rem" style={{ marginTop: '0.5rem' }} />
  </div>
);

/**
 * Full page loader with skeleton grid
 */
export const PageLoader: React.FC<{ type?: 'grid' | 'list' | 'profile' }> = ({ type = 'grid' }) => (
  <div className="page-loader" style={{ padding: '2rem' }}>
    {type === 'grid' && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    )}
    
    {type === 'list' && (
      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
    )}
    
    {type === 'profile' && (
      <div>
        <ProfileHeaderSkeleton />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )}
  </div>
);

export default Skeleton;
