import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/retro-theme.css';

function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="home-page" style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Hero Section */}
      <section className={`hero ${isVisible ? 'fade-in' : ''}`} style={{
        textAlign: 'center',
        padding: '4rem 0',
        position: 'relative'
      }}>
        <div className="retro-grid" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.3,
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="retro-title retro-neon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            MONO GAMES
          </h1>
          
          <p className="retro-subtitle" style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>
            🎮 50+ Games • Offline & Online • Free Forever 🎮
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/launcher">
              <button className="retro-btn">
                🎮 Play Now
              </button>
            </Link>
            
            <Link to="/store">
              <button className="retro-btn retro-btn-secondary">
                📦 Browse Games
              </button>
            </Link>
            
            <Link to="/leaderboard">
              <button className="retro-btn retro-btn-secondary">
                🏆 Leaderboards
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container" style={{
        marginTop: '4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem'
      }}>
        <div className="retro-card">
          <h3 className="retro-subtitle" style={{ marginBottom: '1rem' }}>
            🎯 50+ Games
          </h3>
          <p className="retro-text">
            From classic arcade games to modern 3D experiences. Something for everyone!
          </p>
        </div>

        <div className="retro-card">
          <h3 className="retro-subtitle" style={{ marginBottom: '1rem' }}>
            📱 Cross-Platform
          </h3>
          <p className="retro-text">
            Play on Web, Windows, and Android. Your progress syncs everywhere.
          </p>
        </div>

        <div className="retro-card">
          <h3 className="retro-subtitle" style={{ marginBottom: '1rem' }}>
            🔒 Secure & Private
          </h3>
          <p className="retro-text">
            Advanced security, no tracking, no ads. Just pure gaming fun.
          </p>
        </div>

        <div className="retro-card">
          <h3 className="retro-subtitle" style={{ marginBottom: '1rem' }}>
            🌐 Offline Mode
          </h3>
          <p className="retro-text">
            Play anytime, anywhere. No internet required for core games.
          </p>
        </div>

        <div className="retro-card">
          <h3 className="retro-subtitle" style={{ marginBottom: '1rem' }}>
            🏆 Leaderboards
          </h3>
          <p className="retro-text">
            Compete with players worldwide. Climb the ranks and prove your skills.
          </p>
        </div>

        <div className="retro-card">
          <h3 className="retro-subtitle" style={{ marginBottom: '1rem' }}>
            🎨 Retro Aesthetic
          </h3>
          <p className="retro-text">
            Classic gaming vibes with modern technology. Nostalgia meets innovation.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="stats" style={{
        marginTop: '4rem',
        padding: '3rem',
        background: 'var(--bg-light)',
        border: '3px solid var(--border)',
        textAlign: 'center'
      }}>
        <h2 className="retro-title" style={{ marginBottom: '2rem' }}>
          Platform Statistics
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <div className="retro-title" style={{ color: 'var(--primary)' }}>50+</div>
            <div className="retro-text">Total Games</div>
          </div>
          
          <div>
            <div className="retro-title" style={{ color: 'var(--secondary)' }}>15</div>
            <div className="retro-text">Core Games</div>
          </div>
          
          <div>
            <div className="retro-title" style={{ color: 'var(--accent)' }}>3</div>
            <div className="retro-text">Platforms</div>
          </div>
          
          <div>
            <div className="retro-title" style={{ color: 'var(--primary)' }}>100%</div>
            <div className="retro-text">Free & Open</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" style={{
        marginTop: '4rem',
        textAlign: 'center',
        padding: '3rem 0'
      }}>
        <h2 className="retro-title" style={{ marginBottom: '1rem' }}>
          Ready to Play?
        </h2>
        <p className="retro-subtitle" style={{ marginBottom: '2rem' }}>
          Start your gaming adventure now!
        </p>
        
        <Link to="/launcher">
          <button className="retro-btn" style={{ fontSize: '1.25rem', padding: '1.5rem 3rem' }}>
            🎮 Launch Game Launcher
          </button>
        </Link>
      </section>
    </div>
  );
}

export default Home;
