// Diamond Balance Display Component
import { useState, useEffect } from 'react';
import achievementService from '../services/achievementService';
import { useNavigate } from 'react-router-dom';
import type React from 'react';

const DiamondBalance: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
    const [diamonds, setDiamonds] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        loadDiamonds();

        // Refresh every 2 seconds to catch achievement unlocks
        const interval = setInterval(loadDiamonds, 2000);
        return () => clearInterval(interval);
    }, []);

    const loadDiamonds = async () => {
        await achievementService.init();
        setDiamonds(achievementService.getDiamonds());
    };

    const sizes = {
        small: {
            container: '0.75rem',
            fontSize: '1rem',
            iconSize: '1.2rem'
        },
        medium: {
            container: '1rem',
            fontSize: '1.2rem',
            iconSize: '1.5rem'
        },
        large: {
            container: '1.5rem',
            fontSize: '2rem',
            iconSize: '2.5rem'
        }
    };

    const currentSize = sizes[size];

    return (
        <div
            onClick={() => navigate('/store')}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: '3px solid var(--text-primary)',
                borderRadius: 'var(--radius-pill)',
                padding: `${currentSize.container} 1.25rem`,
                cursor: 'pointer',
                boxShadow: '0 4px 0 var(--text-primary)',
                transition: 'all 0.2s ease',
                fontFamily: "'Comic Sans MS', cursive",
                fontWeight: 900,
                color: 'var(--text-primary)',
                userSelect: 'none'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 0 var(--text-primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 0 var(--text-primary)';
            }}
        >
            <span
                style={{
                    fontSize: currentSize.iconSize,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    animation: 'diamondShine 2s infinite'
                }}
            >
                💎
            </span>
            <span style={{ fontSize: currentSize.fontSize }}>
                {diamonds.toLocaleString()}
            </span>
        </div>
    );
};

// Add diamond shine animation to global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes diamondShine {
    0%, 100% {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
    50% {
      filter: drop-shadow(0 0 15px #FFD700) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
  }
`;
document.head.appendChild(style);

export default DiamondBalance;
