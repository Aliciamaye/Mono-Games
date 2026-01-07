import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllGames, getInstalledGames, downloadGame } from '../services/gameStore';

interface Game {
  id: string;
  name: string;
  category: string;
  renderer: string;
  multiplayer: boolean;
  description: string;
  difficulty: string;
  installed: boolean;
  size: string;
  rating: number;
  badge?: string;
  core?: boolean;
}

interface GameStore {
  installedGames: Game[];
  availableGames: Game[];
  currentGame: Game | null;
  downloadQueue: string[];
  isLoading: boolean;
  error: string | null;
  loadGames: () => Promise<void>;
  setCurrentGame: (game: Game | null) => void;
  installGame: (gameId: string) => Promise<{ success: boolean; error?: string }>;
  uninstallGame: (gameId: string) => Promise<void>;
  clearError: () => void;
}

const useGameStore = create<GameStore>()(
  persist(
    (set, _get) => ({
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
        } catch (error: any) {
          set({
            error: error?.message || 'Failed to load games',
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
          const game = await downloadGame(gameId, () => {});
          set((state) => ({
            installedGames: [...state.installedGames, game as Game],
            isLoading: false
          }));
          return { success: true };
        } catch (error: any) {
          set({
            error: error?.message || 'Installation failed',
            isLoading: false
          });
          return { success: false, error: error?.message };
        }
      },

      uninstallGame: async (gameId) => {
        set((state) => ({
          installedGames: state.installedGames.filter((game) => game.id !== gameId)
        }));
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
