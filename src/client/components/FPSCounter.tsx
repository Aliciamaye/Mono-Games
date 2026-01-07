import { useState, useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';
import type React from 'react';

/**
 * FPS Counter Component
 * Shows frames per second in top-left corner when enabled in settings
 */
const FPSCounter: React.FC = () => {
  const { settings } = useSettingsStore();
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    if (!settings.display.fps) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const updateFPS = (currentTime: number) => {
      frameCount++;
      
      const deltaTime = currentTime - lastTime;
      
      // Update FPS every second
      if (deltaTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / deltaTime));
        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [settings.display.fps]);

  if (!settings.display.fps) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.7)',
      color: fps < 30 ? '#FF6B6B' : fps < 50 ? '#FFD93D' : '#4ECDC4',
      padding: '0.5rem 0.75rem',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      pointerEvents: 'none',
      backdropFilter: 'blur(10px)',
      border: '2px solid currentColor',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
    }}>
      {fps} FPS
    </div>
  );
}

export default FPSCounter;
