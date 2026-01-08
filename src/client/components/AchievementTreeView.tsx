import React, { useEffect, useState } from 'react';
import { ACHIEVEMENT_TREE, AchievementNode, canUnlock, getProgress, getRarityColor } from '../services/achievementTree';
import './AchievementTreeView.css';

/**
 * Minecraft-style Achievement Tree Visualization
 * Shows progression paths with dependencies
 */
export const AchievementTreeView: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementNode[]>(ACHIEVEMENT_TREE);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementNode | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const stored = localStorage.getItem('achievement_tree');
    if (stored) {
      try {
        const progress = JSON.parse(stored);
        const unlocked = new Set<string>(progress.unlocked || []);
        setUnlockedIds(unlocked);
        
        // Update achievement states
        setAchievements(ACHIEVEMENT_TREE.map(ach => ({
          ...ach,
          unlocked: unlocked.has(ach.id),
          progress: progress.progress?.[ach.id] || 0
        })));
      } catch (e) {
        console.error('Failed to load achievement tree:', e);
      }
    }
  };

  const handleAchievementClick = (achievement: AchievementNode) => {
    setSelectedAchievement(achievement);
  };

  const getAchievementClass = (achievement: AchievementNode): string => {
    const classes = ['achievement-node'];
    
    if (achievement.unlocked) {
      classes.push('achievement-node--unlocked');
    } else if (canUnlock(achievement, unlockedIds)) {
      classes.push('achievement-node--available');
    } else {
      classes.push('achievement-node--locked');
    }
    
    classes.push(`achievement-node--${achievement.rarity}`);
    
    return classes.join(' ');
  };

  // Calculate grid dimensions
  const maxX = Math.max(...achievements.map(a => a.x));
  const maxY = Math.max(...achievements.map(a => a.y));

  return (
    <div className="achievement-tree-view">
      <div className="achievement-tree-header">
        <h2 className="tree-title">🏆 Achievement Tree</h2>
        <div className="tree-stats">
          <span>{unlockedIds.size}/{achievements.length} Unlocked</span>
          <span>💎 Total: {achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.diamondReward, 0)}</span>
        </div>
      </div>

      <div className="achievement-tree-legend">
        <div className="legend-item">
          <span className="legend-icon" style={{ background: '#9E9E9E' }}></span>
          <span>Common</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ background: '#4CAF50' }}></span>
          <span>Uncommon</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ background: '#2196F3' }}></span>
          <span>Rare</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ background: '#9C27B0' }}></span>
          <span>Epic</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ background: '#FF9800' }}></span>
          <span>Legendary</span>
        </div>
      </div>

      <div className="achievement-tree-scroll">
        <div 
          className="achievement-tree-grid"
          style={{
            gridTemplateColumns: `repeat(${maxX + 1}, 150px)`,
            gridTemplateRows: `repeat(${maxY + 1}, 150px)`
          }}
        >
          {/* Draw connection lines first */}
          {achievements.map(achievement => (
            achievement.requires?.map(reqId => {
              const required = achievements.find(a => a.id === reqId);
              if (!required) return null;

              const startX = required.x * 150 + 75;
              const startY = required.y * 150 + 75;
              const endX = achievement.x * 150 + 75;
              const endY = achievement.y * 150 + 75;

              const isUnlocked = unlockedIds.has(reqId);

              return (
                <svg
                  key={`${reqId}-${achievement.id}`}
                  className="achievement-connection"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                >
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={isUnlocked ? '#4CAF50' : '#555'}
                    strokeWidth="3"
                    strokeDasharray={isUnlocked ? '0' : '5,5'}
                  />
                </svg>
              );
            })
          ))}

          {/* Achievement nodes */}
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={getAchievementClass(achievement)}
              style={{
                gridColumn: achievement.x + 1,
                gridRow: achievement.y + 1,
                borderColor: getRarityColor(achievement.rarity)
              }}
              onClick={() => handleAchievementClick(achievement)}
            >
              <div className="achievement-node-icon">
                {achievement.icon}
              </div>
              <div className="achievement-node-name">
                {achievement.name}
              </div>
              {achievement.maxProgress && (
                <div className="achievement-node-progress">
                  <div 
                    className="achievement-progress-bar"
                    style={{ width: `${getProgress(achievement)}%` }}
                  />
                  <span className="achievement-progress-text">
                    {achievement.progress || 0}/{achievement.maxProgress}
                  </span>
                </div>
              )}
              <div className="achievement-node-reward">
                💎 {achievement.diamondReward}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedAchievement && (
        <div className="achievement-detail-panel" onClick={() => setSelectedAchievement(null)}>
          <div className="achievement-detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close" onClick={() => setSelectedAchievement(null)}>
              ✕
            </button>
            
            <div className="achievement-detail-icon">
              {selectedAchievement.icon}
            </div>
            
            <h3 className="achievement-detail-name">
              {selectedAchievement.name}
            </h3>
            
            <div 
              className="achievement-detail-rarity"
              style={{ color: getRarityColor(selectedAchievement.rarity) }}
            >
              {selectedAchievement.rarity.toUpperCase()}
            </div>
            
            <p className="achievement-detail-description">
              {selectedAchievement.description}
            </p>
            
            <div className="achievement-detail-reward">
              <span className="reward-label">Reward:</span>
              <span className="reward-value">💎 {selectedAchievement.diamondReward}</span>
            </div>
            
            {selectedAchievement.maxProgress && (
              <div className="achievement-detail-progress">
                <div className="progress-label">
                  Progress: {selectedAchievement.progress || 0}/{selectedAchievement.maxProgress}
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${getProgress(selectedAchievement)}%`,
                      background: getRarityColor(selectedAchievement.rarity)
                    }}
                  />
                </div>
              </div>
            )}
            
            {selectedAchievement.requires && selectedAchievement.requires.length > 0 && (
              <div className="achievement-detail-requires">
                <div className="requires-label">Requires:</div>
                {selectedAchievement.requires.map(reqId => {
                  const required = achievements.find(a => a.id === reqId);
                  if (!required) return null;
                  
                  return (
                    <div 
                      key={reqId}
                      className={`requires-item ${unlockedIds.has(reqId) ? 'requires-item--unlocked' : ''}`}
                    >
                      <span>{required.icon}</span>
                      <span>{required.name}</span>
                      {unlockedIds.has(reqId) && <span>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
            
            {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
              <div className="achievement-detail-unlocked">
                Unlocked: {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementTreeView;
