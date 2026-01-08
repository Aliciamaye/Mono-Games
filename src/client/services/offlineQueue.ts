/**
 * Offline Queue Service
 * Stores API requests when offline, auto-syncs when connection returns
 */

interface QueuedRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timestamp: number;
  retries: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  lastSyncTime: number | null;
  failedItems: number;
}

const QUEUE_KEY = 'offline_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

class OfflineQueueService {
  private queue: QueuedRequest[] = [];
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    queueSize: 0,
    lastSyncTime: null,
    failedItems: 0
  };
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        this.syncStatus.queueSize = this.queue.length;
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue:', error);
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
      this.syncStatus.queueSize = this.queue.length;
      this.notifyListeners();
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue:', error);
    }
  }

  /**
   * Setup online/offline listener
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Connection restored');
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Connection lost');
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });

    // Auto-sync on page load if online
    if (navigator.onLine && this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Add request to queue
   */
  public enqueue(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any): string {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: QueuedRequest = {
      id,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    this.queue.push(request);
    this.saveQueue();

    console.log(`[OfflineQueue] Queued ${method} ${endpoint}`, { queueSize: this.queue.length });

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Process all queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.syncStatus.isSyncing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.failedItems = 0;
    this.notifyListeners();

    console.log(`[OfflineQueue] Processing ${this.queue.length} queued requests`);

    const itemsToProcess = [...this.queue];
    
    for (const item of itemsToProcess) {
      try {
        await this.processItem(item);
        // Remove successfully processed item
        this.queue = this.queue.filter(q => q.id !== item.id);
      } catch (error) {
        console.error(`[OfflineQueue] Failed to process ${item.endpoint}:`, error);
        
        // Increment retries
        const queueItem = this.queue.find(q => q.id === item.id);
        if (queueItem) {
          queueItem.retries++;
          
          // Remove if max retries exceeded
          if (queueItem.retries >= MAX_RETRIES) {
            console.warn(`[OfflineQueue] Max retries exceeded for ${item.endpoint}`);
            this.queue = this.queue.filter(q => q.id !== item.id);
            this.syncStatus.failedItems++;
          }
        }
      }

      // Small delay between requests to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }

    this.syncStatus.isSyncing = false;
    this.syncStatus.lastSyncTime = Date.now();
    this.saveQueue();

    if (this.queue.length === 0) {
      console.log('[OfflineQueue] All items processed successfully');
    } else {
      console.log(`[OfflineQueue] ${this.queue.length} items remaining in queue`);
    }
  }

  /**
   * Process single queued item
   */
  private async processItem(item: QueuedRequest): Promise<void> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(item.endpoint, {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: item.data ? JSON.stringify(item.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get current sync status
   */
  public getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Subscribe to status changes
   */
  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.syncStatus); // Send initial state
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  /**
   * Clear entire queue (use with caution)
   */
  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
    console.log('[OfflineQueue] Queue cleared');
  }

  /**
   * Get queue contents (for debugging)
   */
  public getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Manual sync trigger
   */
  public async sync(): Promise<void> {
    if (!navigator.onLine) {
      console.warn('[OfflineQueue] Cannot sync while offline');
      return;
    }

    return this.processQueue();
  }
}

// Singleton instance
const offlineQueue = new OfflineQueueService();

export default offlineQueue;
export type { SyncStatus, QueuedRequest };
