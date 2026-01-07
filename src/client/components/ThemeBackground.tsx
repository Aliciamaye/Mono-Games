import { useEffect, useState } from 'react';
import useSettingsStore from '../store/settingsStore';
import '../styles/theme-backgrounds.css';
import type React from 'react';

interface ClickCount {
  [key: string]: number;
}

interface EasterEggs {
  [key: string]: boolean;
}

const ThemeBackground: React.FC = () => {
  const { settings } = useSettingsStore();
  const [clickCount, setClickCount] = useState<ClickCount>({});
  const [easterEggsActive, setEasterEggsActive] = useState<EasterEggs>({});
  const currentTheme = settings.display.theme || 'light';

  useEffect(() => {
    // Apply theme classes to body
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  const handleEasterEggClick = (eggId: string) => {
    const newCount = (clickCount[eggId] || 0) + 1;
    setClickCount({ ...clickCount, [eggId]: newCount });

    if (newCount >= 5) {
      setEasterEggsActive({ ...easterEggsActive, [eggId]: true });
      setTimeout(() => {
        setEasterEggsActive({ ...easterEggsActive, [eggId]: false });
        setClickCount({ ...clickCount, [eggId]: 0 });
      }, 10000);
    }
  };

  const renderDarkTheme = () => (
    <div className="theme-bg theme-dark">
      {/* Animated starfield */}
      <div className="starfield">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="shooting-stars">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="shooting-star"
            style={{
              top: `${Math.random() * 50}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          />
        ))}
      </div>

      {/* Night clouds with clickable moon easter egg */}
      <div className="night-clouds">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`night-cloud night-cloud-${i + 1}`}
            style={{
              animationDelay: `${i * 5}s`
            }}
          >
            <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="40" rx="40" ry="20" fill="rgba(30, 30, 60, 0.6)" />
              <ellipse cx="80" cy="30" rx="50" ry="25" fill="rgba(30, 30, 60, 0.6)" />
              <ellipse cx="130" cy="35" rx="45" ry="22" fill="rgba(30, 30, 60, 0.6)" />
              <ellipse cx="160" cy="42" rx="35" ry="18" fill="rgba(30, 30, 60, 0.6)" />
            </svg>
          </div>
        ))}
      </div>

      {/* Clickable Moon Easter Egg */}
      <div
        className={`moon ${easterEggsActive.moon ? 'moon-active' : ''}`}
        onClick={() => handleEasterEggClick('moon')}
        title="Click me 5 times!"
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#F4F4F4" />
          <circle cx="35" cy="35" r="8" fill="#D0D0D0" opacity="0.4" />
          <circle cx="65" cy="40" r="6" fill="#D0D0D0" opacity="0.3" />
          <circle cx="50" cy="60" r="10" fill="#D0D0D0" opacity="0.35" />
          <circle cx="70" cy="65" r="5" fill="#D0D0D0" opacity="0.3" />
        </svg>
        {easterEggsActive.moon && (
          <div className="moon-message">🌙 You found the moon secret! 🌙</div>
        )}
      </div>

      {/* Aurora Borealis effect */}
      <div className="aurora">
        <div className="aurora-line aurora-1"></div>
        <div className="aurora-line aurora-2"></div>
        <div className="aurora-line aurora-3"></div>
      </div>
    </div>
  );

  const renderLightTheme = () => (
    <div className="theme-bg theme-light">
      {/* Sun */}
      <div className="sun" onClick={() => handleEasterEggClick('sun')}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="20" fill="#FFD700" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 50 + Math.cos(angle) * 25;
            const y1 = 50 + Math.sin(angle) * 25;
            const x2 = 50 + Math.cos(angle) * 35;
            const y2 = 50 + Math.sin(angle) * 35;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FFD700"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        {easterEggsActive.sun && (
          <div className="sun-message">☀️ Sunshine! You're radiant! ☀️</div>
        )}
      </div>

      {/* Flying birds */}
      <div className="birds">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bird"
            style={{
              top: `${20 + Math.random() * 30}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + Math.random() * 5}s`
            }}
          >
            <svg width="30" height="20" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5,10 Q10,5 15,10 Q20,5 25,10" fill="none" stroke="#333" strokeWidth="2" />
            </svg>
          </div>
        ))}
      </div>

      {/* Day clouds */}
      <div className="day-clouds">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`day-cloud day-cloud-${i + 1}`}
            style={{
              animationDelay: `${i * 3}s`
            }}
            onClick={() => handleEasterEggClick(`cloud${i}`)}
          >
            <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="40" rx="40" ry="20" fill="rgba(255, 255, 255, 0.9)" />
              <ellipse cx="80" cy="30" rx="50" ry="25" fill="rgba(255, 255, 255, 0.9)" />
              <ellipse cx="130" cy="35" rx="45" ry="22" fill="rgba(255, 255, 255, 0.9)" />
              <ellipse cx="160" cy="42" rx="35" ry="18" fill="rgba(255, 255, 255, 0.9)" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOceanTheme = () => (
    <div className="theme-bg theme-ocean">
      {/* Animated waves */}
      <div className="ocean-waves">
        <svg className="wave wave-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 Q150,20 300,50 T600,50 T900,50 T1200,50 L1200,120 L0,120 Z" fill="rgba(78, 205, 196, 0.3)" />
        </svg>
        <svg className="wave wave-2" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,70 Q150,40 300,70 T600,70 T900,70 T1200,70 L1200,120 L0,120 Z" fill="rgba(78, 205, 196, 0.5)" />
        </svg>
        <svg className="wave wave-3" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,90 Q150,60 300,90 T600,90 T900,90 T1200,90 L1200,120 L0,120 Z" fill="rgba(78, 205, 196, 0.7)" />
        </svg>
      </div>

      {/* Swimming fish */}
      <div className="fish-container">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="fish"
            style={{
              top: `${30 + Math.random() * 50}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${10 + Math.random() * 5}s`
            }}
            onClick={() => handleEasterEggClick(`fish${i}`)}
          >
            <svg width="40" height="20" viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="25" cy="10" rx="12" ry="6" fill="#FF6B35" />
              <path d="M13,10 L5,5 L5,15 Z" fill="#FF6B35" />
              <circle cx="30" cy="8" r="2" fill="white" />
              <circle cx="31" cy="8" r="1" fill="black" />
            </svg>
          </div>
        ))}
      </div>

      {/* Bubbles */}
      <div className="bubbles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderSunsetTheme = () => (
    <div className="theme-bg theme-sunset">
      {/* Gradient sky transition */}
      <div className="sunset-sky"></div>

      {/* Silhouette mountains */}
      <div className="mountains">
        <svg className="mountain-layer mountain-1" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <path d="M0,300 L0,150 L200,50 L400,150 L600,80 L800,160 L1000,100 L1200,180 L1200,300 Z" fill="rgba(0, 0, 0, 0.3)" />
        </svg>
        <svg className="mountain-layer mountain-2" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <path d="M0,300 L0,200 L300,100 L500,180 L700,120 L900,200 L1200,140 L1200,300 Z" fill="rgba(0, 0, 0, 0.5)" />
        </svg>
      </div>

      {/* Fireflies */}
      <div className="fireflies">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="firefly"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${30 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
            onClick={() => handleEasterEggClick(`firefly${i}`)}
          />
        ))}
      </div>
    </div>
  );

  const renderForestTheme = () => (
    <div className="theme-bg theme-forest">
      {/* Trees silhouettes */}
      <div className="trees">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="tree"
            style={{
              left: `${i * 10}%`,
              animationDelay: `${i * 0.2}s`
            }}
          >
            <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
              <rect x="45" y="100" width="10" height="50" fill="#654321" />
              <path d="M50,20 L20,70 L80,70 Z" fill="#2D6A4F" />
              <path d="M50,40 L25,85 L75,85 Z" fill="#2D6A4F" opacity="0.8" />
              <path d="M50,60 L30,100 L70,100 Z" fill="#2D6A4F" opacity="0.6" />
            </svg>
          </div>
        ))}
      </div>

      {/* Butterflies */}
      <div className="butterflies">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="butterfly"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 50}%`,
              animationDelay: `${i * 1.5}s`
            }}
            onClick={() => handleEasterEggClick(`butterfly${i}`)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="8" cy="10" rx="6" ry="8" fill="#FFD93D" />
              <ellipse cx="16" cy="10" rx="6" ry="8" fill="#FFD93D" />
              <rect x="11" y="4" width="2" height="16" fill="#333" />
              <circle cx="12" cy="8" r="2" fill="#333" />
            </svg>
          </div>
        ))}
      </div>

      {/* Falling leaves */}
      <div className="leaves">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="leaf"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 3}s`
            }}
          >
            🍃
          </div>
        ))}
      </div>
    </div>
  );

  const renderPurpleTheme = () => (
    <div className="theme-bg theme-purple">
      {/* Cosmic nebula effect */}
      <div className="nebula">
        <div className="nebula-cloud nebula-1"></div>
        <div className="nebula-cloud nebula-2"></div>
        <div className="nebula-cloud nebula-3"></div>
      </div>

      {/* Distant stars */}
      <div className="cosmic-stars">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="cosmic-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating crystals */}
      <div className="crystals">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="crystal"
            style={{
              left: `${10 + i * 12}%`,
              top: `${30 + Math.random() * 40}%`,
              animationDelay: `${i * 0.5}s`
            }}
            onClick={() => handleEasterEggClick(`crystal${i}`)}
          >
            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M15,0 L25,15 L15,40 L5,15 Z" fill="#9D4EDD" opacity="0.7" />
              <path d="M15,0 L5,15 L15,20 Z" fill="#C77DFF" opacity="0.5" />
              <path d="M15,0 L25,15 L15,20 Z" fill="#E0AAFF" opacity="0.3" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );

  // Render appropriate theme
  const renderTheme = () => {
    switch (currentTheme) {
      case 'dark':
        return renderDarkTheme();
      case 'ocean':
        return renderOceanTheme();
      case 'sunset':
        return renderSunsetTheme();
      case 'forest':
        return renderForestTheme();
      case 'purple':
        return renderPurpleTheme();
      case 'light':
      default:
        return renderLightTheme();
    }
  };

  return <div className="theme-background-wrapper">{renderTheme()}</div>;
};

export default ThemeBackground;
