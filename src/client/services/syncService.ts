// Sync Service - Local-first data sync with cloud
import { openDB } from 'idb';

const DB_NAME = 'mono-games-sync';
const DB_VERSION = 1;
const PLAYER_DATA_STORE = 'playerData';
const SYNC_META_STORE = 'syncMeta';

// Configuration
const SYNC_THRESHOLD = {
    gamesPlayed: 100,
    daysSinceLastSync: 7,
    dataSize: 5 * 1024 * 1024 // 5MB
};

interface PlayerData {
    userId: string;
    gamesPlayed: number;
    scores: Record<string, number>;
    achievements: string[];
    stats: Record<string, any>;
    lastPlayed: number;
}

interface SyncMeta {
    lastSyncTime: number;
    pendingChanges: number;
    syncStatus: 'idle' | 'syncing' | 'error';
    errorMessage?: string;
}

class SyncService {
    private db: any = null;

    async init() {
        this.db = await openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(PLAYER_DATA_STORE)) {
                    db.createObjectStore(PLAYER_DATA_STORE, { keyPath: 'userId' });
                }
                if (!db.objectStoreNames.contains(SYNC_META_STORE)) {
                    db.createObjectStore(SYNC_META_STORE, { keyPath: 'key' });
                }
            }
        });
    }

    // Save data locally
    async saveLocalData(data: PlayerData): Promise<void> {
        if (!this.db) await this.init();
        if (!this.db) throw new Error('Database not initialized');
        await this.db.put(PLAYER_DATA_STORE, {
            ...data,
            lastUpdated: Date.now()
        });

        // Update pending changes counter
        const meta = await this.getSyncMeta();
        await this.db.put(SYNC_META_STORE, {
            key: 'sync',
            ...meta,
            pendingChanges: meta.pendingChanges + 1
        });

        // Auto-sync if threshold reached
        if (await this.shouldSync()) {
            await this.syncToCloud();
        }
    }

    // Check if sync threshold is reached
    async shouldSync(): Promise<boolean> {
        const meta = await this.getSyncMeta();

        // Check games played threshold
        if (meta.pendingChanges >= SYNC_THRESHOLD.gamesPlayed) {
            return true;
        }

        // Check time threshold
        const daysSinceSync = (Date.now() - meta.lastSyncTime) / (1000 * 60 * 60 * 24);
        if (daysSinceSync >= SYNC_THRESHOLD.daysSinceLastSync) {
            return true;
        }

        return false;
    }

    // Manual sync trigger
    async syncToCloud(): Promise<{ success: boolean; error?: string }> {
        try {
            if (!navigator.onLine) {
                return { success: false, error: 'No internet connection' };
            }

            // Update status
            await this.updateSyncStatus('syncing');

            // Get local data
            if (!this.db) throw new Error('Database not initialized');
            const playerData = await this.db.getAll(PLAYER_DATA_STORE);

            // Compress and encrypt data before sending
            const compressed = await this.compressData(playerData);

            // Send to server
            const response = await fetch('/api/sync/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({ data: compressed })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Sync failed');
            }

            // Update sync metadata
            await this.db.put(SYNC_META_STORE, {
                key: 'sync',
                lastSyncTime: Date.now(),
                pendingChanges: 0,
                syncStatus: 'idle'
            });

            return { success: true };

        } catch (error: any) {
            await this.updateSyncStatus('error', error?.message || 'Unknown error');
            return { success: false, error: error?.message || 'Unknown error' };
        }
    }

    // Download data from cloud
    async syncFromCloud(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await fetch('/api/sync/download', {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Download failed');
            }

            // Decompress data
            const decompressed = await this.decompressData(result.data);

            // Merge with local data
            await this.mergeData(decompressed);

            return { success: true, data: decompressed };

        } catch (error: any) {
            return { success: false, error: error?.message || 'Unknown error' };
        }
    }

    // Get sync status
    async getSyncStatus(): Promise<SyncMeta> {
        return await this.getSyncMeta();
    }

    // Helper methods
    private async getSyncMeta(): Promise<SyncMeta> {
        if (!this.db) await this.init();
        if (!this.db) throw new Error('Database not initialized');
        const meta = await this.db.get(SYNC_META_STORE, 'sync');
        return meta || {
            lastSyncTime: 0,
            pendingChanges: 0,
            syncStatus: 'idle'
        };
    }

    private async updateSyncStatus(status: 'idle' | 'syncing' | 'error', errorMessage?: string) {
        if (!this.db) await this.init();
        if (!this.db) throw new Error('Database not initialized');
        const meta = await this.getSyncMeta();
        await this.db.put(SYNC_META_STORE, {
            ...meta,
            key: 'sync',
            syncStatus: status,
            errorMessage
        });
    }

    private async getAuthToken(): Promise<string> {
        return localStorage.getItem('authToken') || '';
    }

    private async compressData(data: any): Promise<string> {
        // Simple compression - in production use pako or similar
        return btoa(JSON.stringify(data));
    }

    private async decompressData(data: string): Promise<any> {
        return JSON.parse(atob(data));
    }

    private async mergeData(cloudData: any) {
        // Merge strategy: cloud wins for conflicts
        if (!this.db) throw new Error('Database not initialized');
        for (const item of cloudData) {
            await this.db.put(PLAYER_DATA_STORE, item);
        }
    }
}

export default new SyncService();
