/**
 * Audio Manager - Handles all game music and sound effects
 * Supports background music, sound effects, volume control, and audio preloading
 */

class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.music = null;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.muted = false;
    this.initialized = false;
  }

  /**
   * Initialize audio context (call after user interaction)
   */
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;
      console.log('🎵 Audio Manager initialized');
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  /**
   * Load a sound effect
   */
  async loadSound(name, url) {
    if (this.sounds.has(name)) return;

    try {
      const audio = new Audio(url);
      audio.volume = this.sfxVolume;
      audio.preload = 'auto';
      this.sounds.set(name, audio);
      console.log(`Loaded sound: ${name}`);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  /**
   * Play a sound effect
   */
  playSound(name, options = {}) {
    if (this.muted || !this.initialized) return;

    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    const {
      volume = 1,
      loop = false,
      playbackRate = 1
    } = options;

    try {
      const clone = sound.cloneNode();
      clone.volume = this.sfxVolume * volume;
      clone.loop = loop;
      clone.playbackRate = playbackRate;
      clone.play().catch(e => console.warn('Play failed:', e));
      
      return clone; // Return for manual control if needed
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }

  /**
   * Load and play background music
   */
  async playMusic(url, options = {}) {
    this.stopMusic();

    const {
      volume = 1,
      loop = true,
      fadeIn = true
    } = options;

    try {
      this.music = new Audio(url);
      this.music.loop = loop;
      this.music.volume = fadeIn ? 0 : this.musicVolume * volume;
      
      await this.music.play();

      if (fadeIn) {
        this.fadeVolume(this.music, this.musicVolume * volume, 2000);
      }

      console.log('🎵 Music playing');
    } catch (error) {
      console.warn('Failed to play music:', error);
    }
  }

  /**
   * Stop background music
   */
  stopMusic(fadeOut = true) {
    if (!this.music) return;

    if (fadeOut) {
      this.fadeVolume(this.music, 0, 1000, () => {
        this.music.pause();
        this.music = null;
      });
    } else {
      this.music.pause();
      this.music = null;
    }
  }

  /**
   * Fade volume over time
   */
  fadeVolume(audio, targetVolume, duration, callback) {
    if (!audio) return;

    const startVolume = audio.volume;
    const startTime = Date.now();

    const fade = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress < 1) {
        requestAnimationFrame(fade);
      } else if (callback) {
        callback();
      }
    };

    fade();
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }

  /**
   * Set sound effects volume (0-1)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.muted = !this.muted;
    
    if (this.music) {
      this.music.muted = this.muted;
    }

    this.sounds.forEach(sound => {
      sound.muted = this.muted;
    });

    return this.muted;
  }

  /**
   * Stop all audio
   */
  stopAll() {
    this.stopMusic(false);
    this.sounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  /**
   * Generate a simple tone (for games without audio files)
   */
  playTone(frequency, duration, type = 'sine') {
    if (!this.initialized || this.muted) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play tone:', error);
    }
  }

  /**
   * Play a sequence of tones (melody)
   */
  playMelody(notes, tempo = 200) {
    if (!this.initialized || this.muted) return;

    let time = this.audioContext.currentTime;

    notes.forEach(({ frequency, duration = 0.2, type = 'sine' }) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);

      oscillator.start(time);
      oscillator.stop(time + duration);

      time += tempo / 1000;
    });
  }
}

// Create singleton instance
const audioManager = new AudioManager();

// Export ready-to-use sound effects generators
export const Sounds = {
  // Game event sounds
  jump: () => audioManager.playTone(400, 0.1, 'square'),
  collect: () => audioManager.playMelody([
    { frequency: 523, duration: 0.05 },
    { frequency: 659, duration: 0.05 },
    { frequency: 784, duration: 0.1 }
  ], 50),
  powerUp: () => audioManager.playMelody([
    { frequency: 392, duration: 0.1 },
    { frequency: 523, duration: 0.1 },
    { frequency: 659, duration: 0.1 },
    { frequency: 784, duration: 0.2 }
  ], 100),
  hit: () => audioManager.playTone(100, 0.2, 'sawtooth'),
  explosion: () => {
    audioManager.playTone(100, 0.3, 'sawtooth');
    setTimeout(() => audioManager.playTone(50, 0.2, 'square'), 100);
  },
  win: () => audioManager.playMelody([
    { frequency: 523, duration: 0.2 },
    { frequency: 659, duration: 0.2 },
    { frequency: 784, duration: 0.2 },
    { frequency: 1047, duration: 0.4 }
  ], 150),
  lose: () => audioManager.playMelody([
    { frequency: 392, duration: 0.3 },
    { frequency: 330, duration: 0.3 },
    { frequency: 262, duration: 0.5 }
  ], 200),
  click: () => audioManager.playTone(800, 0.05, 'square'),
  countdown: () => audioManager.playTone(600, 0.1, 'sine'),
  start: () => audioManager.playMelody([
    { frequency: 523, duration: 0.1 },
    { frequency: 659, duration: 0.1 },
    { frequency: 784, duration: 0.2 }
  ], 80)
};

export default audioManager;
