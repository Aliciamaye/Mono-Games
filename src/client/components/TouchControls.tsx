/**
 * Mobile Touch Controls Component
 * On-screen buttons for mobile/Android gameplay
 */

import { useEffect, useState } from 'react';
import type React from 'react';

interface TouchControlsProps {
  onLeftDown?: () => void;
  onLeftUp?: () => void;
  onRightDown?: () => void;
  onRightUp?: () => void;
  onUpDown?: () => void;
  onUpUp?: () => void;
  onDownDown?: () => void;
  onDownUp?: () => void;
  onActionDown?: () => void; // Jump, shoot, etc
  onActionUp?: () => void;
  onAction2Down?: () => void; // Secondary action
  onAction2Up?: () => void;
  layout?: 'dpad' | 'arrows' | 'simple';
  visible?: boolean;
}

const TouchControls: React.FC<TouchControlsProps> = ({
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
  onUpDown,
  onUpUp,
  onDownDown,
  onDownUp,
  onActionDown,
  onActionUp,
  onAction2Down,
  onAction2Up,
  layout = 'dpad',
  visible = true
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
    };
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile || !visible) return null;

  const buttonStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '3px solid rgba(255, 255, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    touchAction: 'manipulation',
    userSelect: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.15s ease'
  };

  const handlePress = (callback?: () => void) => {
    if (callback) callback();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '180px',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      {/* D-Pad Controls (Left Side) */}
      {layout === 'dpad' && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '180px',
          height: '180px',
          pointerEvents: 'auto'
        }}>
          {/* Up */}
          {onUpDown && (
            <button
              onPointerDown={() => handlePress(onUpDown)}
              onPointerUp={() => handlePress(onUpUp)}
              onPointerCancel={() => handlePress(onUpUp)}
              style={{
                ...buttonStyle,
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              ▲
            </button>
          )}
          
          {/* Down */}
          {onDownDown && (
            <button
              onPointerDown={() => handlePress(onDownDown)}
              onPointerUp={() => handlePress(onDownUp)}
              onPointerCancel={() => handlePress(onDownUp)}
              style={{
                ...buttonStyle,
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              ▼
            </button>
          )}
          
          {/* Left */}
          {onLeftDown && (
            <button
              onPointerDown={() => handlePress(onLeftDown)}
              onPointerUp={() => handlePress(onLeftUp)}
              onPointerCancel={() => handlePress(onLeftUp)}
              style={{
                ...buttonStyle,
                position: 'absolute',
                left: '0',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              ◀
            </button>
          )}
          
          {/* Right */}
          {onRightDown && (
            <button
              onPointerDown={() => handlePress(onRightDown)}
              onPointerUp={() => handlePress(onRightUp)}
              onPointerCancel={() => handlePress(onRightUp)}
              style={{
                ...buttonStyle,
                position: 'absolute',
                right: '0',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              ▶
            </button>
          )}
        </div>
      )}

      {/* Simple Left/Right (For endless runners, etc) */}
      {layout === 'simple' && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'auto'
        }}>
          {onLeftDown && (
            <button
              onPointerDown={() => handlePress(onLeftDown)}
              onPointerUp={() => handlePress(onLeftUp)}
              onPointerCancel={() => handlePress(onLeftUp)}
              style={buttonStyle}
            >
              ◀
            </button>
          )}
          
          {onRightDown && (
            <button
              onPointerDown={() => handlePress(onRightDown)}
              onPointerUp={() => handlePress(onRightUp)}
              onPointerCancel={() => handlePress(onRightUp)}
              style={buttonStyle}
            >
              ▶
            </button>
          )}
        </div>
      )}

      {/* Action Buttons (Right Side) */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '15px',
        pointerEvents: 'auto'
      }}>
        {onAction2Down && (
          <button
            onPointerDown={() => handlePress(onAction2Down)}
            onPointerUp={() => handlePress(onAction2Up)}
            onPointerCancel={() => handlePress(onAction2Up)}
            style={{
              ...buttonStyle,
              background: 'rgba(78, 205, 196, 0.3)'
            }}
          >
            B
          </button>
        )}
        
        {onActionDown && (
          <button
            onPointerDown={() => handlePress(onActionDown)}
            onPointerUp={() => handlePress(onActionUp)}
            onPointerCancel={() => handlePress(onActionUp)}
            style={{
              ...buttonStyle,
              width: '70px',
              height: '70px',
              background: 'rgba(255, 107, 53, 0.4)'
            }}
          >
            A
          </button>
        )}
      </div>
    </div>
  );
};

export default TouchControls;
