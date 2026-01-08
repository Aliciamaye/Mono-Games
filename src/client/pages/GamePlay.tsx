import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadGame } from '../services/gameStore';
import achievementService from '../services/achievementService';
import leaderboardService from '../services/leaderboardService';
import diamondEarningService from '../services/diamondEarningService';
import dailyChallengeService from '../services/dailyChallengeService';
import useSettingsStore from '../store/settingsStore';
import TouchControls from '../components/TouchControls';
import { useLeaderboardUpdates } from '../hooks/useWebSocket';
import { CelebrationOverlay } from '../components/SuccessAnimations';
import { PlayIcon, PauseIcon, HomeIcon, GamepadIcon, RefreshIcon } from '../components/Icons';
import type React from 'react';
import api from '../services/api';

interface GameInfo {
  score: number;
  highScore: number;
}

interface GameInstance {
  score?: number;
  highScore?: number;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  destroy: () => void;
}

const GamePlay: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const gameInstanceRef = useRef<GameInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitializing = useRef<boolean>(false);
  const sessionIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo>({ score: 0, highScore: 0 });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<{ show: boolean; message?: string; type?: string }>({ show: false });

  // WebSocket for live leaderboard updates
  useLeaderboardUpdates(gameId || null, () => {
    console.log('[GamePlay] Received live leaderboard update');
  });

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 820 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile());
    const onResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', onResize);

    // Prevent double initialization in React StrictMode
    if (isInitializing.current) {
      console.log('[GamePlay] Already initializing, skipping...');
      return;
    }

    isInitializing.current = true;
    let mounted = true;
    let scoreInterval: ReturnType<typeof setInterval> | null = null;

    const initGame = async () => {
      try {
        console.log('[GamePlay] Starting game initialization for:', gameId);
        setIsLoading(true);
        setError(null);

        // Wait a bit for React to finish rendering
        await new Promise(resolve => setTimeout(resolve, 150));

        if (!mounted) {
          console.log('[GamePlay] Component unmounted before init');
          return;
        }

        // Check if container exists
        const container = containerRef.current;
        if (!container) {
          console.error('[GamePlay] Container ref is null after wait!');
          setError('Game container failed to initialize');
          setIsLoading(false);
          return;
        }

        console.log('[GamePlay] Container found, loading game class...');

        // Load game class
        const GameClass = await loadGame(gameId);
        console.log('[GamePlay] Game class loaded');

        if (!mounted) {
          console.log('[GamePlay] Component unmounted after loading');
          return;
        }

        // Set container ID
        container.id = 'game-container';

        // Start game session
        try {
          const sessionResponse = await api.post('/api/sessions/start', {
            gameId,
            metadata: {
              platform: isMobile ? 'mobile' : 'desktop',
              userAgent: navigator.userAgent
            }
          });
          sessionIdRef.current = sessionResponse.data.data.sessionId;
          console.log('[GamePlay] Session started:', sessionIdRef.current);
        } catch (err) {
          console.warn('[GamePlay] Failed to start session:', err);
          // Continue without session tracking
        }

        // Initialize game
        console.log('[GamePlay] Creating game instance...');
        const game = new GameClass('game-container');

        // Setup Game Over Handler (Economy & specific logic)
        if (game.setOnGameOver) {
          game.setOnGameOver(async (score: number) => {
             console.log('🎮 Game Over! Processing rewards...');
             
             // Get settings for difficulty multiplier
             const settings = useSettingsStore.getState().settings;
             const aiLevel = settings.gameplay.aiLevel || 3;
             const difficultyMultiplier = 0.7 + (aiLevel * 0.1); // Lvl 1 = 0.8x, Lvl 3 = 1.0x, Lvl 5 = 1.2x

             const adjustedScore = Math.floor(score * difficultyMultiplier);
             let totalDiamonds = 0;
             
             // 1. Calculate score milestone rewards
             const scoreReward = await diamondEarningService.calculateScoreReward(adjustedScore, gameId as string);
             if (scoreReward > 0) {
               totalDiamonds += scoreReward;
               console.log(`[GamePlay] Score reward: ${scoreReward} diamonds`);
             }
             
             // 2. Award win bonus for high scores
             const winBonus = await diamondEarningService.awardWinBonus(gameId as string, adjustedScore);
             if (winBonus > 0) {
               totalDiamonds += winBonus;
               console.log(`[GamePlay] Win bonus: ${winBonus} diamonds`);
             }
             
             // 3. Submit to Leaderboard with session
             let leaderboardPosition = null;
             let isNewRecord = false;
             if (score > 0 && sessionIdRef.current) {
                 try {
                   const result = await leaderboardService.submitScore(
                     gameId as string, 
                     adjustedScore, 
                     {
                       sessionId: sessionIdRef.current,
                       duration: Date.now() - (game.startTime || Date.now()),
                       metadata: {
                         difficulty: aiLevel,
                         platform: isMobile ? 'mobile' : 'desktop'
                       }
                     }
                   );
                   
                   // Check if we got a leaderboard position
                   if (result?.rank) {
                     leaderboardPosition = result.rank;
                     isNewRecord = false; // Can determine from previous calls
                   }
                 } catch (err) {
                   console.warn('Failed to submit score:', err);
                 }
             }
             
             // 4. Award leaderboard rewards if applicable
             if (leaderboardPosition && leaderboardPosition <= 50) {
               const leaderboardReward = await diamondEarningService.awardLeaderboardReward(
                 gameId as string, 
                 leaderboardPosition,
                 isNewRecord
               );
               if (leaderboardReward > 0) {
                 totalDiamonds += leaderboardReward;
                 console.log(`[GamePlay] Leaderboard reward: ${leaderboardReward} diamonds for rank #${leaderboardPosition}`);
                 
                 // Show celebration for top 3
                 if (leaderboardPosition <= 3) {
                   setShowCelebration({
                     show: true,
                     message: leaderboardPosition === 1 ? '🏆 CHAMPION! 🏆' : `🥉 TOP ${leaderboardPosition}! 🥉`,
                     type: 'champion'
                   });
                   setTimeout(() => setShowCelebration({ show: false }), 4000);
                 }
               }
             }
             
             // Log total rewards
             if (totalDiamonds > 0) {
               console.log(`💎 Total diamonds earned: ${totalDiamonds}`);
             }
             
             // Track daily challenges
             dailyChallengeService.trackScore(gameId as string, adjustedScore);
             if (leaderboardPosition) {
               dailyChallengeService.trackLeaderboardPosition(leaderboardPosition);
             }
             // Track win (if score > 500 consider it a win)
             dailyChallengeService.trackWin(adjustedScore > 500);
             
             // Update local state to show new high score immediately
             setGameInfo(prev => ({
                 ...prev,
                 score: score,
                 highScore: Math.max(prev.highScore, score)
             }));
          });
        }

        console.log('[GamePlay] Initializing game...');
        game.init();

        console.log('[GamePlay] Starting game...');
        game.start();

        gameInstanceRef.current = game;
        console.log('[GamePlay] ✅ Game ready!');
        setIsLoading(false);

        // Check achievement for playing a game
        achievementService.checkAchievements({
          type: 'game_played',
          gameId: gameId
        });

        // Track game played for daily challenges
        dailyChallengeService.trackGamePlayed(gameId as string);

        // Poll for score updates
        scoreInterval = setInterval(() => {
          if (gameInstanceRef.current) {
            setGameInfo({
              score: gameInstanceRef.current.score || 0,
              highScore: gameInstanceRef.current.highScore || 0
            });
          }
        }, 100);

      } catch (err: any) {
        console.error('❌ Failed to load game:', err);
        if (mounted) {
          setError(err?.message || 'Failed to load game');
          setIsLoading(false);
        }
      }
    };

    initGame();

    return () => {
      console.log('[GamePlay] Cleanup');
      mounted = false;
      isInitializing.current = false;
      if (scoreInterval) clearInterval(scoreInterval);
      if (gameInstanceRef.current) {
        try {
          gameInstanceRef.current.destroy();
        } catch (e) {
          console.warn('[GamePlay] Error during game cleanup:', e);
        }
        gameInstanceRef.current = null;
      }
      window.removeEventListener('resize', onResize);
    };
  }, [gameId]);

  const handlePause = () => {
    if (gameInstanceRef.current) {
      if (isPaused) {
        gameInstanceRef.current.resume();
        setIsPaused(false);
      } else {
        gameInstanceRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleRestart = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.reset();
      setIsPaused(false);
    }
  };

  const handleExit = () => {
    if (gameInstanceRef.current) {
      try {
        gameInstanceRef.current.destroy();
      } catch (e) { }
      gameInstanceRef.current = null;
    }
    navigate('/launcher');
  };

  const formatGameName = (id: string) => {
    return id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const sendKeyEvent = (type: 'keydown' | 'keyup', key: string, codeOverride?: string) => {
    const code = codeOverride || (key === ' ' ? 'Space' : key);
    const event = new KeyboardEvent(type, {
      key,
      code,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  const handleDirectionalPress = (type: 'keydown' | 'keyup', direction: 'left' | 'right' | 'up' | 'down') => {
    const mapping: Record<typeof direction, string> = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown'
    };
    sendKeyEvent(type, mapping[direction]);
  };

  const handleActionPress = (type: 'keydown' | 'keyup') => {
    sendKeyEvent(type, ' ');
  };

  const handleSecondaryPress = (type: 'keydown' | 'keyup') => {
    sendKeyEvent(type, 'z', 'KeyZ');
  };

  if (error) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', flexDirection: 'column',
        background: 'linear-gradient(180deg, #87CEEB 0%, #FFE5B4 100%)'
      }}>
        <div style={{
          background: 'white', padding: '3rem', borderRadius: '24px',
          textAlign: 'center', maxWidth: '500px', border: '4px solid #FFB347',
          boxShadow: '0 8px 0 #FF6B35'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(230, 57, 70, 0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', border: '4px solid #E63946'
          }}>
            <GamepadIcon size={40} color="#E63946" />
          </div>
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive",
            color: '#E63946', marginBottom: '1rem', fontSize: '1.75rem'
          }}>
            Oops! Game Error
          </h2>
          <p style={{ color: '#7F8C8D', marginBottom: '2rem' }}>
            {error}
          </p>
          <button onClick={handleExit} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#FF6B35', color: 'white', border: 'none',
            padding: '1rem 2rem', borderRadius: '50px', fontSize: '1rem',
            fontWeight: 700, fontFamily: "'Comic Sans MS', cursive",
            cursor: 'pointer', boxShadow: '0 4px 0 #C64F25'
          }}>
            <HomeIcon size={18} color="white" /> Back to Launcher
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '1.5rem', display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #87CEEB 0%, #FFE5B4 100%)'
    }}>
      {/* Game Header */}
      <div className="gameplay-header" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', padding: '1rem 1.5rem', flexWrap: 'wrap', gap: '1rem',
        background: 'white', borderRadius: '16px', border: '4px solid #FFB347',
        boxShadow: '0 4px 0 #FF6B35'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <GamepadIcon size={28} color="#FF6B35" />
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive", fontWeight: 900,
            fontSize: '1.5rem', color: '#2C3E50', margin: 0
          }}>
            {formatGameName(gameId || '')}
          </h2>
        </div>

        <div className="gameplay-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginRight: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Comic Sans MS', cursive", fontWeight: 900,
                fontSize: '1.5rem', color: '#FF6B35'
              }}>
                {gameInfo.score}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7F8C8D' }}>SCORE</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Comic Sans MS', cursive", fontWeight: 900,
                fontSize: '1.5rem', color: '#4ECDC4'
              }}>
                {gameInfo.highScore}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7F8C8D' }}>BEST</div>
            </div>
          </div>

          <button onClick={handlePause} style={{
            padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', background: '#FFF8DC', border: '3px solid #FFB347',
            borderRadius: '50px', fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 0 #FFB347'
          }}>
            {isPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button onClick={handleRestart} style={{
            padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', background: '#FFF8DC',
            border: '3px solid #FFB347', borderRadius: '50px',
            fontFamily: "'Comic Sans MS', cursive", fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 3px 0 #FFB347'
          }}>
            <RefreshIcon size={16} /> Restart
          </button>

          <button onClick={handleExit} style={{
            padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', background: '#E63946', color: 'white', border: 'none',
            borderRadius: '50px', fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 0 #B91C2C'
          }}>
            <HomeIcon size={16} color="white" /> Exit
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div ref={containerRef} style={{
        flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative', minHeight: '500px'
      }}>
        {isLoading && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', margin: '0 auto 1rem',
              border: '5px solid #FFB347', borderTop: '5px solid #FF6B35',
              borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
            <div style={{
              fontFamily: "'Comic Sans MS', cursive", fontSize: '1.25rem',
              fontWeight: 700, color: '#FF6B35'
            }}>
              Loading {formatGameName(gameId || '')}...
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="gameplay-controls" style={{
        marginTop: '1rem', textAlign: 'center', padding: '1rem',
        background: 'white', borderRadius: '16px', border: '3px solid #FFB347'
      }}>
        <p style={{
          color: '#7F8C8D', fontFamily: "'Comic Sans MS', cursive", margin: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
        }}>
          <GamepadIcon size={18} /> Arrow Keys / WASD to move • Space to pause • R to restart • Touch overlay appears on mobile
        </p>
      </div>

      {isMobile && !isLoading && (
        <div
          className="mobile-action-bar"
          style={{
            position: 'fixed',
            right: '16px',
            bottom: '210px',
            display: 'flex',
            gap: '8px',
            zIndex: 1100
          }}
        >
          <button
            onClick={handlePause}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '3px solid #FFB347',
              background: '#FFF8DC',
              boxShadow: '0 3px 0 #FFB347',
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700,
              minWidth: '110px'
            }}
          >
            {isPaused ? <PlayIcon size={14} /> : <PauseIcon size={14} />} {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleRestart}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '3px solid #FFB347',
              background: '#FFF8DC',
              boxShadow: '0 3px 0 #FFB347',
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700,
              minWidth: '110px'
            }}
          >
            <RefreshIcon size={14} /> Restart
          </button>
          <button
            onClick={handleExit}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '3px solid #B91C2C',
              background: '#E63946',
              color: 'white',
              boxShadow: '0 3px 0 #B91C2C',
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 700,
              minWidth: '110px'
            }}
          >
            <HomeIcon size={14} color="white" /> Exit
          </button>
        </div>
      )}

      <TouchControls
        visible={!isLoading}
        layout="dpad"
        onLeftDown={() => handleDirectionalPress('keydown', 'left')}
        onLeftUp={() => handleDirectionalPress('keyup', 'left')}
        onRightDown={() => handleDirectionalPress('keydown', 'right')}
        onRightUp={() => handleDirectionalPress('keyup', 'right')}
        onUpDown={() => handleDirectionalPress('keydown', 'up')}
        onUpUp={() => handleDirectionalPress('keyup', 'up')}
        onDownDown={() => handleDirectionalPress('keydown', 'down')}
        onDownUp={() => handleDirectionalPress('keyup', 'down')}
        onActionDown={() => handleActionPress('keydown')}
        onActionUp={() => handleActionPress('keyup')}
        onAction2Down={() => handleSecondaryPress('keydown')}
        onAction2Up={() => handleSecondaryPress('keyup')}
      />

      {/* Celebration Overlay */}
      {showCelebration.show && (
        <CelebrationOverlay
          message={showCelebration.message || 'Amazing!'}
          onComplete={() => setShowCelebration({ show: false })}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GamePlay;
