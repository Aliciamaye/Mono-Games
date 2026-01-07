import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high';
  effects: boolean;
  particles: boolean;
  scanlines: boolean;
  crtEffect: boolean;
}

interface GameplaySettings {
  difficulty: 'easy' | 'normal' | 'hard';
  vibration: boolean;
  autoSave: boolean;
  aiEnabled: boolean;
  aiLevel: number;
}

interface DisplaySettings {
  theme: 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'purple';
  fps: boolean;
  fullscreen: boolean;
}

interface NotificationSettings {
  achievements: boolean;
  updates: boolean;
  friends: boolean;
}

interface Settings {
  audio: AudioSettings;
  graphics: GraphicsSettings;
  gameplay: GameplaySettings;
  display: DisplaySettings;
  notifications: NotificationSettings;
}

interface SettingsStore {
  settings: Settings;
  updateSetting: (category: keyof Settings, key: string, value: any) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  toggleFullscreen: () => void;
  toggleMute: () => void;
  loadSettings: () => void;
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Settings state
      settings: {
        audio: {
          masterVolume: 70,
          musicVolume: 60,
          sfxVolume: 80,
          muted: false
        },
        graphics: {
          quality: 'high', // low, medium, high
          effects: true,
          particles: true,
          scanlines: true,
          crtEffect: false
        },
        gameplay: {
          difficulty: 'normal', // easy, normal, hard
          vibration: true,
          autoSave: true,
          aiEnabled: true, // Enable AI mode for offline play
          aiLevel: 3 // 1=Very Easy, 2=Easy, 3=Normal, 4=Hard, 5=Expert
        },
        display: {
          theme: 'light', // light, dark, ocean, sunset, forest, purple
          fps: false,
          fullscreen: false
        },
        notifications: {
          achievements: true,
          updates: true,
          friends: false
        }
      },

      // Actions
      updateSetting: (category, key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: {
              ...state.settings[category],
              [key]: value
            }
          }
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings
          }
        }));
      },

      resetSettings: () => {
        set({
          settings: {
            audio: {
              masterVolume: 70,
              musicVolume: 60,
              sfxVolume: 80,
              muted: false
            },
            graphics: {
              quality: 'high',
              effects: true,
              particles: true,
              scanlines: true,
              crtEffect: false
            },
            gameplay: {
              difficulty: 'normal',
              vibration: true,
              autoSave: true,
              aiEnabled: true,
              aiLevel: 3
            },
            display: {
              theme: 'light',
              fps: false,
              fullscreen: false
            },
            notifications: {
              achievements: true,
              updates: true,
              friends: false
            }
          }
        });
      },

      loadSettings: () => {
        // Settings are automatically loaded from localStorage via persist middleware
        console.log('Settings loaded:', get().settings);
      },

      toggleFullscreen: () => {
        const { settings } = get();
        const newFullscreen = !settings.display.fullscreen;

        if (newFullscreen) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }

        set((state) => ({
          settings: {
            ...state.settings,
            display: {
              ...state.settings.display,
              fullscreen: newFullscreen
            }
          }
        }));
      },

      toggleMute: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            audio: {
              ...state.settings.audio,
              muted: !state.settings.audio.muted
            }
          }
        }));
      }
    }),
    {
      name: 'mono-games-settings',
      version: 1
    }
  )
);

export default useSettingsStore;
