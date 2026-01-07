import { Link, useLocation } from 'react-router-dom';
import ThemeBackground from '../ThemeBackground';
import { GamepadIcon, StoreIcon, TrophyIcon, SettingsIcon } from '../Icons';
import type React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isGamePlay = location.pathname.startsWith('/play/');

  // Don't show navigation on game play page
  if (isGamePlay) {
    return <main>{children}</main>;
  }

  return (
    <>
      <ThemeBackground />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{
        background: 'var(--bg-light)',
        borderBottom: '3px solid var(--border)',
        padding: '1rem 0'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 className="retro-subtitle" style={{ fontSize: '1.5rem', margin: 0 }}>
              MONO GAMES
            </h1>
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/launcher">
              <button className="retro-btn" style={{
                fontSize: '0.75rem',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <GamepadIcon size={16} /> Launcher
              </button>
            </Link>
            
            <Link to="/store">
              <button className="retro-btn retro-btn-secondary" style={{
                fontSize: '0.75rem',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <StoreIcon size={16} /> Store
              </button>
            </Link>
            
            <Link to="/leaderboard">
              <button className="retro-btn retro-btn-secondary" style={{
                fontSize: '0.75rem',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <TrophyIcon size={16} /> Leaderboard
              </button>
            </Link>
            
            <Link to="/settings">
              <button className="retro-btn retro-btn-secondary" style={{
                fontSize: '0.75rem',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <SettingsIcon size={16} /> Settings
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-light)',
        borderTop: '3px solid var(--border)',
        padding: '2rem 0',
        marginTop: '4rem'
      }}>
        <div className="container text-center">
          <p className="retro-text" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Made with <span style={{ color: '#E63946', fontSize: '1.2em' }}>❤️</span> by Mono Games Team
          </p>
          <p className="retro-text" style={{
            fontSize: '0.875rem',
            color: 'var(--text-dark)'
          }}>
            © 2026 Mono Games • Open Source • Free Forever
          </p>
        </div>
      </footer>
      </div>
    </>
  );
}

export default Layout;
