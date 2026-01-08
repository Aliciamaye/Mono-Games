import React from 'react';
import dailyChallengeService, { DailyChallenge } from '../services/dailyChallengeService';
import { CheckIcon } from './Icons';
import './DailyChallenges.css';

const DailyChallenges: React.FC = () => {
  const [challenges, setChallenges] = React.useState<DailyChallenge[]>([]);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    loadChallenges();
    
    // Refresh every minute to check for resets
    const interval = setInterval(loadChallenges, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadChallenges = () => {
    const dailyChallenges = dailyChallengeService.getDailyChallenges();
    setChallenges(dailyChallenges);
  };

  const getProgressPercentage = (challenge: DailyChallenge): number => {
    if (challenge.completed) return 100;
    return Math.min(100, (challenge.progress / challenge.target) * 100);
  };

  const completionPercentage = dailyChallengeService.getCompletionPercentage();
  const todaysDiamonds = dailyChallengeService.getTodaysDiamondsEarned();

  return (
    <div className="daily-challenges">
      {/* Compact Header */}
      <button
        className="daily-challenges-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-content">
          <span className="header-icon">📅</span>
          <div className="header-info">
            <h3>Daily Challenges</h3>
            <p>{challenges.filter(c => c.completed).length}/{challenges.length} Complete • {todaysDiamonds}💎 Earned</p>
          </div>
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="daily-challenges-content">
          {/* Progress Bar */}
          <div className="overall-progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${completionPercentage}%`,
                  background: completionPercentage === 100 
                    ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
                    : 'linear-gradient(90deg, #4ECDC4 0%, #44B3A6 100%)'
                }}
              />
            </div>
            <span className="progress-text">{completionPercentage}% Complete</span>
          </div>

          {/* Challenge List */}
          <div className="challenges-list">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`challenge-card ${challenge.completed ? 'completed' : ''}`}
              >
                <div className="challenge-icon">{challenge.icon}</div>
                
                <div className="challenge-details">
                  <div className="challenge-header">
                    <h4>{challenge.title}</h4>
                    {challenge.completed && (
                      <span className="completed-badge">
                        <CheckIcon size={14} color="white" /> Complete
                      </span>
                    )}
                  </div>
                  
                  <p className="challenge-description">{challenge.description}</p>
                  
                  {/* Progress Bar */}
                  {!challenge.completed && (
                    <div className="challenge-progress">
                      <div className="progress-bar-container small">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${getProgressPercentage(challenge)}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {challenge.progress}/{challenge.target}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="challenge-reward">
                  <span className="reward-value">{challenge.reward}</span>
                  <span className="reward-icon">💎</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reset Timer */}
          <div className="reset-timer">
            <span>⏰ Resets at midnight</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyChallenges;
