import React, { useEffect, useState } from 'react';
import offlineQueue, { SyncStatus } from '../services/offlineQueue';
import './SyncStatusIndicator.css';

/**
 * Shows connection status and sync progress
 * Displays in top-right corner
 */
export const SyncStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>(offlineQueue.getStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  if (status.isOnline && status.queueSize === 0 && !status.isSyncing) {
    // Everything is synced, don't show indicator
    return null;
  }

  const getStatusIcon = () => {
    if (!status.isOnline) return '⚠️';
    if (status.isSyncing) return '🔄';
    if (status.queueSize > 0) return '📤';
    return '✅';
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (status.isSyncing) return 'Syncing...';
    if (status.queueSize > 0) return `${status.queueSize} pending`;
    return 'Synced';
  };

  const getStatusClass = () => {
    if (!status.isOnline) return 'sync-indicator--offline';
    if (status.isSyncing) return 'sync-indicator--syncing';
    if (status.queueSize > 0) return 'sync-indicator--pending';
    return 'sync-indicator--synced';
  };

  return (
    <div 
      className={`sync-status-indicator ${getStatusClass()}`}
      onClick={() => setShowDetails(!showDetails)}
      title="Click for details"
    >
      <div className="sync-indicator-compact">
        <span className="sync-icon">{getStatusIcon()}</span>
        <span className="sync-text">{getStatusText()}</span>
      </div>

      {showDetails && (
        <div className="sync-indicator-details">
          <div className="sync-detail-row">
            <span>Status:</span>
            <span>{status.isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="sync-detail-row">
            <span>Queue:</span>
            <span>{status.queueSize} items</span>
          </div>
          {status.lastSyncTime && (
            <div className="sync-detail-row">
              <span>Last sync:</span>
              <span>{new Date(status.lastSyncTime).toLocaleTimeString()}</span>
            </div>
          )}
          {status.failedItems > 0 && (
            <div className="sync-detail-row sync-detail-error">
              <span>Failed:</span>
              <span>{status.failedItems} items</span>
            </div>
          )}
          {status.queueSize > 0 && status.isOnline && (
            <button 
              className="sync-manual-button"
              onClick={(e) => {
                e.stopPropagation();
                offlineQueue.sync();
              }}
            >
              Sync Now
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
