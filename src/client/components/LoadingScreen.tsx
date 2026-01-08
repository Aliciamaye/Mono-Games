/**
 * Animated Loading Screen
 * Beautiful loading animations for better UX
 */

import React from 'react';
import { GamepadIcon } from './Icons';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  progress,
  fullScreen = true 
}) => {
  return (
    <div style={{
      position: fullScreen ? 'fixed' : 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: fullScreen ? 10000 : 1,
      fontFamily: "'Comic Sans MS', cursive"
    }}>
      {/* Animated gamepad icon */}
      <div style={{
        animation: 'bounce 1s ease-in-out infinite',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '50%',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <GamepadIcon size={80} color="#667eea" />
        </div>
      </div>

      {/* Loading message */}
      <h2 style={{
        color: '#fff',
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 0 20px 0',
        textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        {message}
      </h2>

      {/* Loading dots */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: '#fff',
              animation: `dotPulse 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div style={{
          width: '300px',
          height: '30px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '15px',
          overflow: 'hidden',
          border: '3px solid #fff',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
            transition: 'width 0.3s ease',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* Floating circles decoration */}
      <div className="floating-circles">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${50 + i * 20}px`,
              height: `${50 + i * 20}px`,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.2)',
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              animation: `float ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -10px) rotate(90deg);
          }
          50% {
            transform: translate(0, -20px) rotate(180deg);
          }
          75% {
            transform: translate(-10px, -10px) rotate(270deg);
          }
        }
      `}</style>
    </div>
  );
};

export const MiniLoader: React.FC<{ size?: number; color?: string }> = ({ 
  size = 40, 
  color = '#667eea' 
}) => {
  return (
    <div style={{
      width: size,
      height: size,
      border: `${size / 10}px solid rgba(102, 126, 234, 0.2)`,
      borderTop: `${size / 10}px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const SkeletonLoader: React.FC<{ 
  width?: string; 
  height?: string;
  borderRadius?: string;
}> = ({ 
  width = '100%', 
  height = '20px',
  borderRadius = '8px'
}) => {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite'
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
