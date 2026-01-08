/**
 * GitHub Sync Settings Component
 * Configure GitHub token and monitor backup status
 */

import React, { useState, useEffect } from 'react';
import { githubSync } from '../services/githubSync';

export const GitHubSyncSettings: React.FC = () => {
  const [token, setToken] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [syncStats, setSyncStats] = useState(githubSync.getSyncStats());
  const [currentSize, setCurrentSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load saved token (show as masked)
    const savedToken = githubSync.getToken();
    if (savedToken) {
      setToken('*'.repeat(40));
      setTokenSaved(true);
    }

    // Update current size
    updateStorageSize();

    // Refresh stats every 10 seconds
    const interval = setInterval(() => {
      setSyncStats(githubSync.getSyncStats());
      updateStorageSize();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const updateStorageSize = async () => {
    const size = await githubSync['getLocalStorageSize']();
    setCurrentSize(size);
  };

  const handleSaveToken = () => {
    if (token && !token.startsWith('*')) {
      githubSync.setToken(token);
      githubSync.init(token);
      setTokenSaved(true);
      setToken('*'.repeat(40));
      alert('✅ GitHub token saved successfully!');
    }
  };

  const handleManualSync = async () => {
    if (!githubSync.getToken()) {
      alert('❌ Please set your GitHub token first!');
      return;
    }

    setIsSyncing(true);
    const success = await githubSync.manualSync();
    setIsSyncing(false);

    if (success) {
      alert('✅ Backup completed successfully!');
      setSyncStats(githubSync.getSyncStats());
    } else {
      alert('❌ Backup failed. Check console for errors.');
    }
  };

  const handleRestoreData = async () => {
    if (!githubSync.getToken()) {
      alert('❌ Please set your GitHub token first!');
      return;
    }

    if (!confirm('⚠️ This will restore data from GitHub and may overwrite local data. Continue?')) {
      return;
    }

    setIsSyncing(true);
    const success = await githubSync.restoreFromGitHub();
    setIsSyncing(false);

    if (success) {
      alert('✅ Data restored successfully!');
      window.location.reload();
    } else {
      alert('❌ Restore failed. Check console for errors.');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const sizeThreshold = 150 * 1024 * 1024; // 150MB
  const sizePercentage = Math.min((currentSize / sizeThreshold) * 100, 100);
  const nextSyncAllowed = syncStats.nextAllowedSync > Date.now();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>☁️ GitHub Cloud Backup</h2>
      <p style={styles.description}>
        Your game data automatically backs up to GitHub when it reaches 150MB.
        <br />
        Repository: <a href="https://github.com/Raft-The-Crab/Mono-Data" target="_blank" style={styles.link}>Raft-The-Crab/Mono-Data</a>
      </p>

      {/* Token Configuration */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔑 GitHub Token</h3>
        <p style={styles.sectionDesc}>
          Create a Personal Access Token at{' '}
          <a href="https://github.com/settings/tokens" target="_blank" style={styles.link}>
            github.com/settings/tokens
          </a>
          <br />
          Required permissions: <code style={styles.code}>repo</code> (Full control of private repositories)
        </p>

        <div style={styles.inputGroup}>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            style={styles.input}
            disabled={tokenSaved && token.startsWith('*')}
          />
          <button 
            onClick={handleSaveToken} 
            style={styles.button}
            disabled={!token || token.startsWith('*')}
          >
            {tokenSaved ? '✅ Token Saved' : '💾 Save Token'}
          </button>
        </div>

        {tokenSaved && (
          <button 
            onClick={() => {
              setToken('');
              setTokenSaved(false);
            }}
            style={styles.buttonSecondary}
          >
            🔄 Change Token
          </button>
        )}
      </div>

      {/* Storage Status */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📊 Storage Status</h3>
        
        <div style={styles.statGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Current Size</div>
            <div style={styles.statValue}>{formatBytes(currentSize)}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Threshold</div>
            <div style={styles.statValue}>{formatBytes(sizeThreshold)}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Progress</div>
            <div style={styles.statValue}>{sizePercentage.toFixed(1)}%</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Syncs</div>
            <div style={styles.statValue}>{syncStats.totalSyncs}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${sizePercentage}%`,
              backgroundColor: sizePercentage >= 90 ? '#f59e0b' : sizePercentage >= 70 ? '#3b82f6' : '#10b981'
            }}
          />
        </div>
        <div style={styles.progressText}>
          {sizePercentage >= 100 
            ? '🚨 Backup needed!' 
            : `${formatBytes(sizeThreshold - currentSize)} remaining until auto-backup`}
        </div>
      </div>

      {/* Sync History */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📜 Sync History</h3>
        
        <div style={styles.infoGrid}>
          <div>
            <strong>Last Sync:</strong> {formatDate(syncStats.lastSyncTime)}
          </div>
          <div>
            <strong>Last Size:</strong> {formatBytes(syncStats.lastSyncSize)}
          </div>
          <div>
            <strong>Next Allowed:</strong> {formatDate(syncStats.nextAllowedSync)}
          </div>
        </div>

        {syncStats.syncHistory.length > 0 && (
          <div style={styles.historyList}>
            <h4 style={styles.historyTitle}>Recent Backups:</h4>
            {syncStats.syncHistory.slice(-5).reverse().map((entry, idx) => (
              <div key={idx} style={styles.historyItem}>
                <span style={styles.historyIcon}>{entry.success ? '✅' : '❌'}</span>
                <span style={styles.historyDate}>{formatDate(entry.timestamp)}</span>
                <span style={styles.historySize}>{formatBytes(entry.sizeBytes)}</span>
                <span style={styles.historyFiles}>{entry.filesUploaded} files</span>
                {entry.error && <span style={styles.historyError}>{entry.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚡ Actions</h3>
        
        <div style={styles.buttonGroup}>
          <button 
            onClick={handleManualSync}
            style={{...styles.button, ...styles.buttonPrimary}}
            disabled={isSyncing || !tokenSaved || nextSyncAllowed}
          >
            {isSyncing ? '⏳ Syncing...' : '☁️ Backup Now'}
          </button>

          <button 
            onClick={handleRestoreData}
            style={{...styles.button, ...styles.buttonWarning}}
            disabled={isSyncing || !tokenSaved}
          >
            {isSyncing ? '⏳ Restoring...' : '📥 Restore from Cloud'}
          </button>
        </div>

        {nextSyncAllowed && (
          <p style={styles.warning}>
            ⏰ Rate limit active. Next sync allowed: {formatDate(syncStats.nextAllowedSync)}
          </p>
        )}

        <div style={styles.infoBox}>
          <strong>⚠️ Important Notes:</strong>
          <ul style={styles.infoList}>
            <li>Backups happen automatically when storage reaches 150MB</li>
            <li>Rate limit: Max 1 backup per hour (20 per day)</li>
            <li>Each file is kept under 100MB to comply with GitHub limits</li>
            <li>Your data is stored in a private repository</li>
            <li>Keep your GitHub token safe and never share it</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Comic Sans MS, cursive'
  },
  title: {
    fontSize: '32px',
    color: '#2c3e50',
    marginBottom: '10px',
    textAlign: 'center' as const
  },
  description: {
    textAlign: 'center' as const,
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6'
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#2c3e50',
    marginBottom: '10px'
  },
  sectionDesc: {
    color: '#666',
    marginBottom: '15px',
    lineHeight: '1.6'
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  code: {
    backgroundColor: '#e9ecef',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '14px'
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontFamily: 'monospace'
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontFamily: 'Comic Sans MS, cursive',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: 'bold'
  },
  buttonSecondary: {
    padding: '8px 16px',
    fontSize: '14px',
    fontFamily: 'Comic Sans MS, cursive',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    fontWeight: 'bold'
  },
  buttonPrimary: {
    backgroundColor: '#10b981'
  },
  buttonWarning: {
    backgroundColor: '#f59e0b'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center' as const
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  progressBar: {
    width: '100%',
    height: '20px',
    backgroundColor: '#e9ecef',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  progressText: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '14px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '20px'
  },
  historyList: {
    marginTop: '15px'
  },
  historyTitle: {
    fontSize: '18px',
    marginBottom: '10px'
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px',
    marginBottom: '8px'
  },
  historyIcon: {
    fontSize: '18px'
  },
  historyDate: {
    flex: 1,
    fontSize: '14px'
  },
  historySize: {
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  historyFiles: {
    fontSize: '12px',
    color: '#666'
  },
  historyError: {
    fontSize: '12px',
    color: '#ef4444'
  },
  warning: {
    backgroundColor: '#fef3c7',
    padding: '10px',
    borderRadius: '6px',
    color: '#92400e',
    marginBottom: '15px',
    textAlign: 'center' as const
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: '15px',
    borderRadius: '8px',
    color: '#1e40af'
  },
  infoList: {
    marginTop: '10px',
    paddingLeft: '20px',
    lineHeight: '1.8'
  }
};

export default GitHubSyncSettings;
