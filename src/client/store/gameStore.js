import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllGames, getInstalledGames, downloadGame } from '../services/gameStore';

const useGameStore = create(
  persist(
    (set, get) => ({
      // Game state
      installedGames: [],
      availableGames: [],
      currentGame: null,
      downloadQueue: [],
      isLoading: false,
      error: null,

      // Actions
      loadGames: async () => {
        set({ isLoading: true, error: null });
        try {
          const installed = await getInstalledGames();
          const available = await getAllGames();
          
          set({
            installedGames: installed,
            availableGames: available,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error.message,
            isLoading: false
          });
        }
      },

      setCurrentGame: (game) => {
        set({ currentGame: game });
      },

      installGame: async (gameId) => {
        set({ isLoading: true, error: null });
        try {
          const game = await downloadGame(gameId, (progress) => {
            // Update download progress
            set((state) => ({
              downloadQueue: state.downloadQueue.map((item) =>
                item.id === gameId ? { ...item, progress } : item
              )
            }));
          });

          set((state) => ({
            installedGames: [...state.installedGames, game],
            downloadQueue: state.downloadQueue.filter((item) => item.id !== gameId),
            isLoading: false
          }));

          return { success: true };
        } catch (error) {
          set({
            error: error.message,
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      uninstallGame: (gameId) => {
        set((state) => ({
          installedGames: state.installedGames.filter((game) => game.id !== gameId)
        }));
      },

      addToDownloadQueue: (game) => {
        set((state) => ({
          downloadQueue: [...state.downloadQueue, { ...game, progress: 0 }]
        }));
      },

      removeFromDownloadQueue: (gameId) => {
        set((state) => ({
          downloadQueue: state.downloadQueue.filter((item) => item.id !== gameId)
        }));
      },

      updateGameProgress: (gameId, progress) => {
        set((state) => ({
          installedGames: state.installedGames.map((game) =>
            game.id === gameId ? { ...game, progress } : game
          )
        }));
      },

      isGameInstalled: (gameId) => {
        const { installedGames } = get();
        return installedGames.some((game) => game.id === gameId);
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'mono-games-store',
      version: 1,
      partialize: (state) => ({
        installedGames: state.installedGames
      })
    }
  )
);

export default useGameStore;
