import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadGame } from '../services/gameStore';

function GamePlay() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameInfo, setGameInfo] = useState({
    score: 0,
    highScore: 0
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load game module
        const GameClass = await loadGame(gameId);

        if (!mounted) return;

        // Create canvas if not exists
        if (!canvasRef.current) {
          const canvas = document.createElement('canvas');
          canvas.id = 'game-canvas';
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto';
          canvas.style.border = '3px solid var(--primary)';
          canvas.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.5)';
          document.getElementById('game-container').appendChild(canvas);
          canvasRef.current = canvas;
        }

        // Initialize game
        const game = new GameClass({
          onScoreChange: (score, highScore) => {
            setGameInfo({ score, highScore });
          },
          onGameOver: (result) => {
            console.log('Game Over:', result);
            // Could show game over modal here
          },
          onPause: () => setIsPaused(true),
          onResume: () => setIsPaused(false)
        });

        game.init('game-canvas');
        game.start();

        gameInstanceRef.current = game;
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to load game:', err);
        if (mounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    initGame();

    return () => {
      mounted = false;
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, [gameId]);

  const handlePause = () => {
    if (gameInstanceRef.current) {
      if (isPaused) {
        gameInstanceRef.current.resume();
      } else {
        gameInstanceRef.current.pause();
      }
    }
  };

  const handleRestart = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.reset();
      gameInstanceRef.current.start();
    }
  };

  const handleExit = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy();
    }
    navigate('/launcher');
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <div className="retro-title pulse" style={{ marginBottom: '2rem' }}>
          Loading Game...
        </div>
        <div className="retro-progress" style={{ width: '300px' }}>
          <div className="retro-progress-bar" style={{ width: '100%' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <div className="retro-card" style={{
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 className="retro-title" style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
            Error
          </h2>
          <p className="retro-text" style={{ marginBottom: '2rem' }}>
            {error}
          </p>
          <button onClick={handleExit} className="retro-btn">
            ← Back to Launcher
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-play" style={{
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Game Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 className="retro-subtitle">{formatGameName(gameId)}</h2>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <div className="retro-text" style={{ marginRight: '1rem' }}>
            Score: <span style={{ color: 'var(--primary)' }}>{gameInfo.score}</span> |
            High: <span style={{ color: 'var(--secondary)' }}>{gameInfo.highScore}</span>
          </div>
          
          <button
            onClick={handlePause}
            className="retro-btn"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          
          <button
            onClick={handleRestart}
            className="retro-btn retro-btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            🔄 Restart
          </button>
          
          <button
            onClick={handleExit}
            className="retro-btn retro-btn-danger"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            ← Exit
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div
        id="game-container"
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}
      />

      {/* Instructions */}
      <div style={{
        marginTop: '1rem',
        textAlign: 'center'
      }}>
        <p className="retro-text" style={{ color: 'var(--text-dark)' }}>
          Use Arrow Keys or WASD to move • Space to Pause • Swipe on mobile
        </p>
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

export default GamePlay;
