// Premium Game Store Component
import { useState, useEffect } from 'react';
import achievementService from '../services/achievementService';
import { PREMIUM_GAMES, isPremiumGame, isGameUnlocked, unlockGame, getPremiumGame } from '../config/premiumGames';
import type React from 'react';

function PremiumGameStore() {
    const [diamonds, setDiamonds] = useState(0);
    const [unlockedGames, setUnlockedGames] = useState<string[]>([]);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);

    useEffect(() => {
        loadDiamonds();
        loadUnlockedGames();
    }, []);

    const loadDiamonds = () => {
        setDiamonds(achievementService.getDiamonds());
    };

    const loadUnlockedGames = () => {
        const unlocked = JSON.parse(localStorage.getItem('unlockedGames') || '[]');
        setUnlockedGames(unlocked);
    };

    const handleUnlock = async (gameId: string) => {
        const game = getPremiumGame(gameId);
        if (!game) return;

        // Check if enough diamonds
        if (diamonds < game.diamondCost) {
            alert(`Not enough diamonds! You need ${game.diamondCost} diamonds but only have ${diamonds}.`);
            return;
        }

        // Spend diamonds
        const success = await achievementService.spendDiamonds(game.diamondCost, `Unlock ${game.name}`);

        if (success) {
            unlockGame(gameId);
            loadDiamonds();
            loadUnlockedGames();
            alert(`🎉 ${game.name} unlocked!`);
        }
    };

    const groupedGames = {
        tier1: PREMIUM_GAMES.filter(g => g.diamondCost === 25),
        tier2: PREMIUM_GAMES.filter(g => g.diamondCost === 75),
        tier3: PREMIUM_GAMES.filter(g => g.diamondCost === 150)
    };

    return (
        <div style={{
            padding: '2rem',
            background: 'var(--bg-gradient)',
            minHeight: '100vh'
        }}>
            {/* Diamond Balance */}
            <div style={{
                background: 'var(--bg-card)',
                border: '4px solid var(--primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'center',
                boxShadow: '0 8px 0 var(--text-primary)'
            }}>
                <h2 style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '2rem',
                    color: 'var(--primary)',
                    margin: '0 0 0.5rem 0'
                }}>
                    💎 Premium Game Store
                </h2>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#FFD700',
                    textShadow: '0 0 20px #FFD700',
                    fontFamily: "'Comic Sans MS', cursive"
                }}>
                    {diamonds} Diamonds
                </div>
            </div>

            {/* Tier 1 Games */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '1.5rem',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                }}>
                    🌟 Tier 1 - Light Games (Only 25 💎!)
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {groupedGames.tier1.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            diamonds={diamonds}
                            isUnlocked={unlockedGames.includes(game.id)}
                            onUnlock={() => handleUnlock(game.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Tier 2 Games */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '1.5rem',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                }}>
                    ⭐⭐ Tier 2 - Medium Games (Only 75 💎!)
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {groupedGames.tier2.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            diamonds={diamonds}
                            isUnlocked={unlockedGames.includes(game.id)}
                            onUnlock={() => handleUnlock(game.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Tier 3 Games */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: '1.5rem',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                }}>
                    ⭐⭐⭐ Tier 3 - Premium 3D Games (Only 150 💎!)
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {groupedGames.tier3.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            diamonds={diamonds}
                            isUnlocked={unlockedGames.includes(game.id)}
                            onUnlock={() => handleUnlock(game.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Game Card Component
const GameCard: React.FC<{
    game: any;
    diamonds: number;
    isUnlocked: boolean;
    onUnlock: () => void;
}> = ({ game, diamonds, isUnlocked, onUnlock }) => {
    const canAfford = diamonds >= game.diamondCost;

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: `4px solid ${isUnlocked ? '#4ECDC4' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            position: 'relative',
            boxShadow: '0 6px 0 var(--text-primary)',
            opacity: isUnlocked ? 0.7 : 1
        }}>
            {/* Locked/Unlocked Badge */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: isUnlocked ? '#4ECDC4' : '#FFD93D',
                color: 'var(--text-primary)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 900,
                fontSize: '0.9rem',
                border: '3px solid var(--text-primary)'
            }}>
                {isUnlocked ? '✅ OWNED' : '🔒 LOCKED'}
            </div>

            {/* Game Icon */}
            <div style={{
                fontSize: '4rem',
                textAlign: 'center',
                marginBottom: '1rem',
                filter: isUnlocked ? 'grayscale(50%)' : 'none'
            }}>
                {game.thumbnail}
            </div>

            {/* Game Info */}
            <h4 style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontSize: '1.3rem',
                color: 'var(--primary)',
                margin: '0 0 0.5rem 0'
            }}>
                {game.name}
            </h4>

            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                marginBottom: '1rem'
            }}>
                {game.description}
            </p>

            {/* Tags */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1rem'
            }}>
                <span style={{
                    background: 'var(--accent)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                }}>
                    {game.category}
                </span>
                {game.is3D && (
                    <span style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.8rem',
                        fontWeight: 700
                    }}>
                        3D
                    </span>
                )}
                <span style={{
                    background: 'var(--text-secondary)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                }}>
                    {game.fileSize}
                </span>
            </div>

            {/* Features */}
            <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 1rem 0',
                fontSize: '0.9rem'
            }}>
                {game.features.map((feature: string, i: number) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        ✓ {feature}
                    </li>
                ))}
            </ul>

            {/* Unlock Button */}
            {!isUnlocked && (
                <button
                    onClick={onUnlock}
                    disabled={!canAfford}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: canAfford
                            ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                            : '#999',
                        color: 'white',
                        border: '3px solid var(--text-primary)',
                        borderRadius: 'var(--radius-lg)',
                        fontFamily: "'Comic Sans MS', cursive",
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        boxShadow: '0 4px 0 var(--text-primary)'
                    }}
                >
                    {canAfford ? `Unlock for ${game.diamondCost} 💎` : `Need ${game.diamondCost - diamonds} more 💎`}
                </button>
            )}

            {isUnlocked && (
                <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    background: '#4ECDC4',
                    borderRadius: 'var(--radius-lg)',
                    color: 'white',
                    fontWeight: 900
                }}>
                    ✅ Game Unlocked! Play from Launcher
                </div>
            )}
        </div>
    );
}

export default PremiumGameStore;
