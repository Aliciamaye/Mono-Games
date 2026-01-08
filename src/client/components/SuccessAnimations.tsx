import React, { useEffect, useState } from 'react';
import './SuccessAnimations.css';

interface ConfettiProps {
  duration?: number;
  particleCount?: number;
}

/**
 * Confetti celebration animation
 */
export const Confetti: React.FC<ConfettiProps> = ({ 
  duration = 3000, 
  particleCount = 50 
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    const colors = ['#FF6B35', '#F7931E', '#FDC830', '#4ECDC4', '#44A08D', '#A8E6CF', '#FF6B9D', '#C96DD8'];
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [duration, particleCount]);

  return (
    <div className="confetti-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            left: `${particle.left}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${duration}ms`
          }}
        />
      ))}
    </div>
  );
};

interface StarBurstProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

/**
 * Star burst effect for achievements
 */
export const StarBurst: React.FC<StarBurstProps> = ({ 
  size = 'medium',
  color = '#FFD700'
}) => {
  const sizeMap = {
    small: 100,
    medium: 150,
    large: 200
  };

  return (
    <div className="starburst-container">
      <div 
        className="starburst"
        style={{
          width: sizeMap[size],
          height: sizeMap[size]
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="starburst-ray"
            style={{
              transform: `rotate(${i * 45}deg)`,
              background: `linear-gradient(to right, ${color}, transparent)`
            }}
          />
        ))}
      </div>
      <div className="starburst-glow" style={{ background: color }} />
    </div>
  );
};

interface CelebrationProps {
  message?: string;
  subMessage?: string;
  icon?: string;
  onComplete?: () => void;
  duration?: number;
}

/**
 * Full celebration overlay for achievements/high scores
 */
export const CelebrationOverlay: React.FC<CelebrationProps> = ({
  message = '🎉 Congratulations! 🎉',
  subMessage,
  icon = '🏆',
  onComplete,
  duration = 4000
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="celebration-overlay">
      <Confetti />
      <div className="celebration-content">
        <StarBurst size="large" />
        <div className="celebration-icon">{icon}</div>
        <h1 className="celebration-message">{message}</h1>
        {subMessage && <p className="celebration-submessage">{subMessage}</p>}
      </div>
    </div>
  );
};

interface ScorePulseProps {
  score: number;
  x: number;
  y: number;
  color?: string;
}

/**
 * Floating score indicator for games
 */
export const FloatingScore: React.FC<ScorePulseProps> = ({
  score,
  x,
  y,
  color = '#FFD700'
}) => {
  return (
    <div
      className="floating-score"
      style={{
        left: x,
        top: y,
        color
      }}
    >
      +{score}
    </div>
  );
};

/**
 * Ripple effect for button clicks
 */
export const Ripple: React.FC<{ x: number; y: number; color?: string }> = ({ 
  x, 
  y, 
  color = 'rgba(255, 255, 255, 0.6)' 
}) => {
  return (
    <span
      className="ripple-effect"
      style={{
        left: x,
        top: y,
        background: color
      }}
    />
  );
};

interface ProgressCelebrationProps {
  progress: number;
  icon?: string;
}

/**
 * Progress milestone celebration (25%, 50%, 75%, 100%)
 */
export const ProgressCelebration: React.FC<ProgressCelebrationProps> = ({
  progress,
  icon = '⭐'
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    if (milestones.includes(progress)) {
      setShouldShow(true);
      const timer = setTimeout(() => setShouldShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!shouldShow) return null;

  return (
    <div className="progress-celebration">
      <div className="progress-celebration-icon">{icon}</div>
      <div className="progress-celebration-text">{progress}% Complete!</div>
    </div>
  );
};

/**
 * Sparkle effect for premium items
 */
export const Sparkles: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="sparkles-container">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

/**
 * Level up animation
 */
export const LevelUpAnimation: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="level-up-animation">
      <StarBurst size="large" color="#FFD700" />
      <div className="level-up-content">
        <div className="level-up-icon">🎖️</div>
        <h2 className="level-up-title">Level Up!</h2>
        <div className="level-up-level">Level {level}</div>
      </div>
      <Confetti particleCount={30} />
    </div>
  );
};

export default {
  Confetti,
  StarBurst,
  CelebrationOverlay,
  FloatingScore,
  Ripple,
  ProgressCelebration,
  Sparkles,
  LevelUpAnimation
};
