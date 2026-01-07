import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { GamepadIcon, UserIcon, SparklesIcon, TrophyIcon, CloudIcon, HeartIcon, StarIcon } from '../components/Icons';
import '../styles/cartoony-theme.css';
import type React from 'react';

interface FeaturedGame {
  id: string;
  name: string;
  desc: string;
  badge: string | null;
}

interface Feature {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  desc: string;
}

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { user } = useAuthStore();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const featuredGames: FeaturedGame[] = [
    { id: 'snake', name: 'Snake Classic', desc: 'Classic snake game with modern twist', badge: null },
    { id: 'tetris', name: 'Tetris', desc: 'Iconic block-stacking puzzle', badge: null },
    { id: 'pong', name: 'Pong', desc: 'Retro paddle game with AI', badge: 'AI' },
    { id: 'infinite-roads', name: 'Infinite Roads', desc: '3D driving simulation', badge: 'NEW' },
    { id: 'space-shooter', name: 'Space Shooter', desc: 'Arcade shooter action', badge: 'NEW' },
    { id: 'cube-runner', name: 'Cube Runner 3D', desc: '3D obstacle avoidance', badge: 'NEW' }
  ];

  const features: Feature[] = [
    { icon: GamepadIcon, title: '50+ Games', desc: 'Classic & modern games' },
    { icon: CloudIcon, title: 'Play Anywhere', desc: 'Web, mobile, desktop' },
    { icon: SparklesIcon, title: 'Offline Ready', desc: 'No internet? No problem!' },
    { icon: TrophyIcon, title: 'Leaderboards', desc: 'Compete globally' },
    { icon: UserIcon, title: 'AI Opponents', desc: '5 difficulty levels' },
    { icon: StarIcon, title: '6 Themes', desc: 'Customize your experience' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating decorations */}
      <div className="decoration-container">
        <div className="floating-icon" style={{ position: 'absolute', top: '10%', left: '5%', animation: 'float 6s ease-in-out infinite' }}>
          <GamepadIcon size={48} color="var(--primary)" />
        </div>
        <div className="floating-icon" style={{ position: 'absolute', top: '20%', right: '10%', animation: 'float 8s ease-in-out infinite' }}>
          <StarIcon size={36} color="var(--secondary)" />
        </div>
        <div className="floating-icon" style={{ position: 'absolute', bottom: '30%', left: '15%', animation: 'float 7s ease-in-out infinite' }}>
          <TrophyIcon size={42} color="var(--accent)" />
        </div>
        <div className="floating-icon" style={{ position: 'absolute', bottom: '15%', right: '5%', animation: 'float 9s ease-in-out infinite' }}>
          <SparklesIcon size={48} color="var(--primary)" />
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontSize: 'clamp(3rem, 15vw, 6rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            marginBottom: '0.5rem',
            animation: 'bounceGentle 3s ease-in-out infinite'
          }}>
            MONO GAMES
          </h1>
          <p style={{
            fontSize: 'clamp(1.2rem, 4vw, 2rem)',
            color: 'var(--text-secondary)',
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <GamepadIcon size={32} /> Your Ultimate Gaming Platform <GamepadIcon size={32} />
          </p>
        </div>

        {/* Speech Bubble */}
        <div style={{
          background: 'white',
          border: '4px solid var(--primary)',
          borderRadius: '30px',
          padding: '1.5rem 2.5rem',
          margin: '2rem auto',
          maxWidth: '600px',
          position: 'relative',
          boxShadow: '0 8px 0 var(--primary-dark), 0 12px 20px rgba(0,0,0,0.2)'
        }}>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            color: '#2C3E50',
            margin: 0,
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700
          }}>
            50+ Games • Play Online & Offline • Free Forever!
          </p>
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderTop: '20px solid var(--primary)'
          }}></div>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          margin: '3rem 0'
        }}>
          {user ? (
            <Link to="/launcher">
              <button className="cartoony-btn" style={{
                fontSize: '1.5rem',
                padding: '1.25rem 3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <GamepadIcon size={28} /> Continue Playing
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button className="cartoony-btn" style={{
                  fontSize: '1.5rem',
                  padding: '1.25rem 3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <UserIcon size={28} /> Sign In
                </button>
              </Link>
              
              <Link to="/register">
                <button className="cartoony-btn cartoony-btn-secondary" style={{
                  fontSize: '1.5rem',
                  padding: '1.25rem 3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <SparklesIcon size={28} /> Sign Up
                </button>
              </Link>
            </>
          )}
          
          <Link to="/launcher">
            <button className="cartoony-btn cartoony-btn-secondary" style={{
              fontSize: '1.5rem',
              padding: '1.25rem 3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <GamepadIcon size={28} /> Play as Guest
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div style={{
          maxWidth: '1200px',
          margin: '4rem auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          padding: '0 1rem'
        }}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} style={{
                background: 'var(--bg-card)',
                border: '4px solid var(--border-color)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 6px 0 var(--border-color)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <IconComponent size={48} color="var(--primary)" />
                </div>
                <h3 style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontSize: '1.5rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: 800
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  fontFamily: "'Segoe UI', sans-serif"
                }}>
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div style={{
          background: 'var(--bg-card)',
          border: '4px solid var(--border-color)',
          borderRadius: '30px',
          padding: '3rem',
          maxWidth: '800px',
          margin: '4rem auto',
          boxShadow: '0 8px 0 var(--border-color)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: 'var(--primary)',
                fontFamily: "'Comic Sans MS', cursive"
              }}>
                50+
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Games
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: 'var(--primary)',
                fontFamily: "'Comic Sans MS', cursive"
              }}>
                10K+
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Players
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: 'var(--primary)',
                fontFamily: "'Comic Sans MS', cursive"
              }}>
                100%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Free
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          borderTop: '3px dashed var(--border-color)',
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <Link to="/tos" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Terms of Service
          </Link>
          <Link to="/privacy" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Privacy Policy
          </Link>
          <a href="https://github.com/Raft-The-Crab/Mono-Games" target="_blank" rel="noopener noreferrer" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            GitHub
          </a>
        </div>

        {/* Copyright */}
        <p style={{
          marginTop: '2rem',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          © 2026 Mono Games. Made with <HeartIcon size={16} color="#E63946" /> by awesome developers
        </p>
      </div>
    </div>
  );
}

export default Home;
