import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import leaderboardService from '../services/leaderboardService';
import achievementService from '../services/achievementService';
import { AchievementCard, AchievementFilters } from '../components/AchievementCard';
import { StatsDashboard } from '../components/StatsDashboard';
import AchievementTreeView from '../components/AchievementTreeView';
import DailyChallenges from '../components/DailyChallenges';
import { ProfileHeaderSkeleton, PageLoader } from '../components/LoadingSkeleton';
import {
  UserIcon, TrophyIcon, StarIcon, GamepadIcon,
  ChartIcon, SaveIcon
} from '../components/Icons';
import '../styles/cartoony-theme.css';
import '../styles/decorations.css';

function Profile() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('stats');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked' | 'account' | 'game'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Real user data - populated on load
  interface UserAchievement {
    id: string;
    name: string;
    desc: string;
    icon: any;
    unlocked: boolean;
    category: 'account' | 'game';
    progress?: number;
    maxProgress?: number;
    diamondReward: number;
    unlockedAt?: number;
  }

  interface RecentGame {
    name: string;
    date: string;
    score: number;
  }

  const [userData, setUserData] = useState<{
    username: string;
    email: string;
    avatar: string;
    level: number;
    xp: number;
    xpToNext: number;
    joinDate: string;
    stats: {
      gamesPlayed: number;
      totalScore: number;
      timePlayed: string;
      achievements: number;
      highScores: number;
      winRate: number;
    };
    recentGames: RecentGame[];
    achievements: UserAchievement[];
  }>({
    username: user?.username || 'Guest',
    email: user?.email || '',
    avatar: 'avatar1',
    level: 1,
    xp: 0,
    xpToNext: 100,
    joinDate: new Date().toLocaleDateString(),
    stats: {
      gamesPlayed: 0,
      totalScore: 0,
      timePlayed: '0h 0m',
      achievements: 0,
      highScores: 0,
      winRate: 0
    },
    recentGames: [],
    achievements: []
  });

    useEffect(() => {
      const loadProfile = async () => {
         setIsLoading(true);
         try {
             // 1. Get achievements
             await achievementService.init();
             const unlocked = achievementService.getUnlocked();
             const allAchievements = achievementService.getAchievements();
             
             // 2. Get leaderboard stats (we can approximate total score from this)
             const globalRankings = await leaderboardService.getGlobalLeaderboard(500);
             // Find user in rankings (mock ID search for now since auth might be loose)
             const userRank = globalRankings.find(r => r.username === user?.username);
             
             // 3. Mock stats that we don't strictly track yet (Time Played)
             setUserData(prev => ({
                 ...prev,
                 username: user?.username || 'Guest',
                 stats: {
                     gamesPlayed: userRank?.gamesPlayed || 0,
                     totalScore: userRank?.score || 0,
                     timePlayed: `${Math.floor(Math.random() * 10)}h ${Math.floor(Math.random()*60)}m`, // Mock
                     achievements: unlocked.length,
                     highScores: userRank?.score || 0,
                     winRate: 0 
                 },
                 achievements: allAchievements.map(a => ({
                     id: a.id,
                     name: a.name,
                     desc: a.description,
                     icon: a.icon === '👋' ? GamepadIcon : TrophyIcon, // Simple mapping
                     unlocked: a.unlocked,
                     category: a.category || 'game',
                     progress: a.progress,
                     maxProgress: a.maxProgress,
                     diamondReward: a.diamondReward,
                     unlockedAt: a.unlockedAt
                 }))
             }));
             
         } catch(e) {
             console.error("Failed to load profile", e);
         } finally {
             setIsLoading(false);
         }
     };
     
     if (isAuthenticated || true) { // Always try to load even for guest
         loadProfile();
     }
  }, [user, isAuthenticated]);


  const avatarOptions = [
    { id: 'avatar1', color: '#FF6B35' },
    { id: 'avatar2', color: '#4ECDC4' },
    { id: 'avatar3', color: '#95E1D3' },
    { id: 'avatar4', color: '#F7931E' },
    { id: 'avatar5', color: '#E63946' },
    { id: 'avatar6', color: '#7B2CBF' }
  ];

  const xpPercentage = userData.xpToNext > 0 ? (userData.xp / userData.xpToNext) * 100 : 0;

  const getAvatarColor = () => {
    const avatar = avatarOptions.find(a => a.id === userData.avatar);
    return avatar?.color || '#FF6B35';
  };

  const renderStats = () => (
    <div>
      <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ChartIcon size={24} color="var(--primary)" /> Your Statistics
      </h3>

      {/* Daily Challenges */}
      <DailyChallenges />

      {/* New Stats Dashboard */}
      <StatsDashboard userId={user?.id} />

      {userData.recentGames.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-pattern)',
          borderRadius: 'var(--radius-lg)',
          border: '3px solid var(--border-color)'
        }}>
          <GamepadIcon size={48} color="var(--text-secondary)" />
          <p style={{
            marginTop: '1rem',
            color: 'var(--text-secondary)',
            fontFamily: "'Comic Sans MS', cursive"
          }}>
            No games played yet. Start playing to see your history!
          </p>
          <a href="/launcher" style={{ display: 'inline-block', marginTop: '1rem' }}>
            <button className="cartoony-btn">
              Play Now
            </button>
          </a>
        </div>
      ) : (
        <>
          <h4 style={{
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700,
            marginBottom: '1rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <GamepadIcon size={18} color="var(--primary)" /> Recent Games
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {userData.recentGames.map((game, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-pattern)',
                  borderRadius: 'var(--radius-md)',
                  border: '3px solid var(--border-color)'
                }}
              >
                <div>
                  <span style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}>
                    {game.name}
                  </span>
                  <span style={{
                    marginLeft: '1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {game.date}
                  </span>
                </div>
                <span style={{
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  fontFamily: "'Comic Sans MS', cursive",
                  fontWeight: 700
                }}>
                  {game.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderAchievements = () => {
    // Filter achievements
    const filteredAchievements = userData.achievements.filter(achievement => {
      if (achievementFilter === 'all') return true;
      if (achievementFilter === 'unlocked') return achievement.unlocked;
      if (achievementFilter === 'locked') return !achievement.unlocked;
      if (achievementFilter === 'account') return achievement.category === 'account';
      if (achievementFilter === 'game') return achievement.category === 'game';
      return true;
    });

    // Calculate counts for filters
    const filterCounts = {
      all: userData.achievements.length,
      unlocked: userData.achievements.filter(a => a.unlocked).length,
      locked: userData.achievements.filter(a => !a.unlocked).length,
      account: userData.achievements.filter(a => a.category === 'account').length,
      game: userData.achievements.filter(a => a.category === 'game').length
    };

    return (
      <div>
        <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrophyIcon size={24} color="var(--primary)" /> Achievements
          </div>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '3px solid var(--primary-dark)',
            boxShadow: '0 3px 0 var(--primary-dark)',
            fontFamily: "'Comic Sans MS', cursive",
            fontWeight: 700,
            color: 'white',
            fontSize: '1rem'
          }}>
            {filterCounts.unlocked} / {filterCounts.all} 🏆
          </div>
        </h3>

        <AchievementFilters
          activeFilter={achievementFilter}
          onFilterChange={setAchievementFilter}
          counts={filterCounts}
        />

        {filteredAchievements.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontFamily: "'Comic Sans MS', cursive"
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              No achievements found
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Try a different filter
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1rem'
          }}>
            {filteredAchievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={true}
                animated={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEditProfile = () => (
    <div>
      <h3 className="cartoony-subtitle" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UserIcon size={24} color="var(--primary)" /> Edit Profile
      </h3>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          display: 'block',
          marginBottom: '0.75rem',
          color: 'var(--text-primary)'
        }}>
          Choose Avatar Color
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {avatarOptions.map(avatar => (
            <button
              key={avatar.id}
              onClick={() => setUserData({ ...userData, avatar: avatar.id })}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-circle)',
                border: userData.avatar === avatar.id
                  ? '4px solid var(--text-primary)'
                  : '3px solid var(--border-color)',
                background: avatar.color,
                cursor: 'pointer',
                transition: 'var(--transition-normal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserIcon size={28} color="white" />
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          display: 'block',
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Username
        </label>
        <input
          type="text"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
          className="cartoony-input"
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          display: 'block',
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Email
        </label>
        <input
          type="email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          className="cartoony-input"
          style={{ width: '100%' }}
          placeholder="your@email.com"
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          className="cartoony-btn"
          onClick={() => setIsEditing(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <SaveIcon size={18} color="white" /> Save Changes
        </button>
        <button
          className="cartoony-btn cartoony-btn-secondary"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="cartoony-card" style={{
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            borderRadius: 'var(--radius-circle)',
            background: 'var(--bg-pattern)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid var(--border-color)'
          }}>
            <UserIcon size={40} color="var(--text-secondary)" />
          </div>
          <h2 className="cartoony-subtitle" style={{ marginBottom: '1rem' }}>
            Login Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please login to view your profile and stats.
          </p>
          <a href="/login">
            <button className="cartoony-btn">
              Login Now
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '2rem'
    }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Profile Header */}
        {isLoading ? (
          <div className="cartoony-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <ProfileHeaderSkeleton />
          </div>
        ) : (
        <div className="cartoony-card" style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          alignItems: 'center'
        }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: 'var(--radius-circle)',
            background: getAvatarColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid var(--text-primary)',
            boxShadow: '0 6px 0 var(--text-primary)'
          }}>
            <UserIcon size={50} color="white" />
          </div>

          {/* User Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              {userData.username}
            </h1>
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              <span className="cartoony-badge">Level {userData.level}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Joined {userData.joinDate}
              </span>
            </div>

            {/* XP Bar */}
            <div style={{ maxWidth: '300px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>XP</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {userData.xp} / {userData.xpToNext}
                </span>
              </div>
              <div className="cartoony-progress" style={{ height: '24px' }}>
                <div
                  className="cartoony-progress-bar"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            className="cartoony-btn cartoony-btn-secondary"
            onClick={() => setIsEditing(!isEditing)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UserIcon size={18} /> Edit Profile
          </button>
        </div>
        )}

        {/* Tabs */}
        {!isEditing && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('stats')}
              className={activeTab === 'stats' ? 'cartoony-btn' : 'cartoony-btn cartoony-btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ChartIcon size={18} color={activeTab === 'stats' ? 'white' : 'var(--text-primary)'} /> Stats
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={activeTab === 'achievements' ? 'cartoony-btn' : 'cartoony-btn cartoony-btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <TrophyIcon size={18} color={activeTab === 'achievements' ? 'white' : 'var(--text-primary)'} /> Achievements
            </button>
            <button
              onClick={() => setActiveTab('tree')}
              className={activeTab === 'tree' ? 'cartoony-btn' : 'cartoony-btn cartoony-btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <StarIcon size={18} color={activeTab === 'tree' ? 'white' : 'var(--text-primary)'} /> Achievement Tree
            </button>
          </div>
        )}

        {/* Content */}
        <div className="cartoony-card" style={{ padding: '2rem' }}>
          {isLoading ? (
            <PageLoader type={activeTab === 'stats' ? 'profile' : 'grid'} />
          ) : isEditing ? (
            renderEditProfile()
          ) : activeTab === 'stats' ? (
            renderStats()
          ) : activeTab === 'tree' ? (
            <AchievementTreeView />
          ) : (
            renderAchievements()
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
