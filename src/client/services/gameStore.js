import { openDB } from 'idb';
import { calculateChecksum, verifyFileIntegrity } from '../utils/security';
import api from './api';

const DB_NAME = 'mono-games-store';
const DB_VERSION = 1;
const GAMES_STORE = 'games';
const MANIFESTS_STORE = 'manifests';

// Core games that come pre-installed
export const CORE_GAMES = [
  'snake',
  '2048',
  'tetris',
  'pong',
  'memory-match',
  'breakout',
  'space-invaders',
  'flappy-bird',
  'typing-test',
  'tic-tac-toe',
  'connect-four',
  'minesweeper',
  'sudoku',
  'chess',
  'checkers'
];

/**
 * Initialize IndexedDB
 */
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(GAMES_STORE)) {
        db.createObjectStore(GAMES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MANIFESTS_STORE)) {
        db.createObjectStore(MANIFESTS_STORE, { keyPath: 'id' });
      }
    }
  });
};

/**
 * Get all available games (core + downloadable)
 */
export const getAllGames = async () => {
  try {
    const response = await api.get('/games');
    return response.data.games;
  } catch (error) {
    console.error('Failed to fetch games:', error);
    
    // Fallback to core games if offline
    return CORE_GAMES.map((id) => ({
      id,
      name: formatGameName(id),
      installed: true,
      core: true,
      size: '2MB',
      version: '1.0.0'
    }));
  }
};

/**
 * Get installed games from IndexedDB
 */
export const getInstalledGames = async () => {
  try {
    const db = await initDB();
    const manifests = await db.getAll(MANIFESTS_STORE);
    
    // Always include core games
    const coreGameManifests = CORE_GAMES.map((id) => ({
      id,
      name: formatGameName(id),
      installed: true,
      core: true,
      size: '2MB',
      version: '1.0.0',
      path: `/games/core/${id}/index.js`
    }));
    
    return [...coreGameManifests, ...manifests.filter((m) => !m.core)];
  } catch (error) {
    console.error('Failed to get installed games:', error);
    return [];
  }
};

/**
 * Download and install a game
 */
export const downloadGame = async (gameId, onProgress) => {
  try {
    // Get game metadata
    const gameResponse = await api.get(`/games/${gameId}`);
    const gameMetadata = gameResponse.data;

    // Download game package
    const downloadResponse = await api.get(`/games/${gameId}/download`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(progress);
      }
    });

    const gameBlob = downloadResponse.data;

    // Verify integrity
    const checksum = await calculateChecksum(gameBlob);
    if (checksum !== gameMetadata.checksum) {
      throw new Error('Game integrity verification failed');
    }

    // Extract and store game files
    const gameFiles = await extractGamePackage(gameBlob);
    const db = await initDB();

    // Store game data
    await db.put(GAMES_STORE, {
      id: gameId,
      files: gameFiles,
      downloadedAt: Date.now()
    });

    // Store manifest
    await db.put(MANIFESTS_STORE, {
      id: gameId,
      ...gameMetadata,
      installed: true,
      installedAt: Date.now()
    });

    return {
      id: gameId,
      ...gameMetadata,
      installed: true
    };
  } catch (error) {
    console.error('Failed to download game:', error);
    throw error;
  }
};

/**
 * Uninstall a game
 */
export const uninstallGame = async (gameId) => {
  try {
    // Prevent uninstalling core games
    if (CORE_GAMES.includes(gameId)) {
      throw new Error('Cannot uninstall core game');
    }

    const db = await initDB();
    await db.delete(GAMES_STORE, gameId);
    await db.delete(MANIFESTS_STORE, gameId);

    return true;
  } catch (error) {
    console.error('Failed to uninstall game:', error);
    throw error;
  }
};

/**
 * Load a game
 */
export const loadGame = async (gameId) => {
  try {
    // Check if it's a core game
    if (CORE_GAMES.includes(gameId)) {
      // Dynamically import core game
      const gameModule = await import(`../games/core/${gameId}/index.js`);
      return gameModule.default;
    }

    // Load from IndexedDB
    const db = await initDB();
    const gameData = await db.get(GAMES_STORE, gameId);

    if (!gameData) {
      throw new Error('Game not found');
    }

    // Create blob URL for game files
    const gameBlob = new Blob([gameData.files.main], { type: 'application/javascript' });
    const gameUrl = URL.createObjectURL(gameBlob);

    // Dynamically import game
    const gameModule = await import(/* @vite-ignore */ gameUrl);

    return gameModule.default;
  } catch (error) {
    console.error('Failed to load game:', error);
    throw error;
  }
};

/**
 * Check for game updates
 */
export const checkForUpdates = async (gameId) => {
  try {
    const db = await initDB();
    const manifest = await db.get(MANIFESTS_STORE, gameId);

    if (!manifest) {
      return null;
    }

    const response = await api.get(`/games/${gameId}`);
    const latestVersion = response.data.version;

    if (latestVersion !== manifest.version) {
      return {
        hasUpdate: true,
        currentVersion: manifest.version,
        latestVersion
      };
    }

    return {
      hasUpdate: false,
      currentVersion: manifest.version
    };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return null;
  }
};

/**
 * Extract game package (zip file)
 */
const extractGamePackage = async (blob) => {
  // For now, assume the blob is the game code directly
  // In production, you'd use a library like JSZip to extract
  const arrayBuffer = await blob.arrayBuffer();
  const decoder = new TextDecoder();
  const code = decoder.decode(arrayBuffer);

  return {
    main: code,
    manifest: {}
  };
};

/**
 * Format game name from ID
 */
const formatGameName = (id) => {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get game manifest
 */
export const getGameManifest = async (gameId) => {
  const db = await initDB();
  return db.get(MANIFESTS_STORE, gameId);
};

/**
 * Get total storage used
 */
export const getStorageUsed = async () => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { used: 0, quota: 0 };
  }

  const estimate = await navigator.storage.estimate();
  return {
    used: estimate.usage || 0,
    quota: estimate.quota || 0,
    percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
  };
};

export default {
  getAllGames,
  getInstalledGames,
  downloadGame,
  uninstallGame,
  loadGame,
  checkForUpdates,
  getGameManifest,
  getStorageUsed
};
