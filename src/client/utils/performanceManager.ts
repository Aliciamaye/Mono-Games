 /**
 * Performance Optimization System
 * - Device detection and quality presets
 * - FPS monitoring and adaptive quality
 * - Object pooling
 * - Texture optimization
 * - Memory management
 */

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isLowEnd: boolean;
  cpuCores: number;
  memory: number; // GB
  gpu: string;
  screenResolution: { width: number; height: number };
}

interface QualityPreset {
  name: 'low' | 'medium' | 'high' | 'ultra';
  targetFPS: number;
  maxParticles: number;
  shadowQuality: number;
  textureQuality: number;
  renderScale: number;
  antialiasing: boolean;
  postProcessing: boolean;
}

class PerformanceManager {
  private deviceInfo: DeviceInfo;
  private currentQuality: QualityPreset;
  private fpsHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;

  constructor() {
    this.deviceInfo = this.detectDevice();
    this.currentQuality = this.selectOptimalQuality();
    this.startMonitoring();
  }

  /**
   * Detect device capabilities
   */
  private detectDevice(): DeviceInfo {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);

    // Estimate device tier based on available info
    const cpuCores = navigator.hardwareConcurrency || 4;
    
    // @ts-ignore - Navigator memory API
    const memory = (navigator.deviceMemory || 4); // GB
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    // @ts-ignore
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    // @ts-ignore
    const gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';

    // Classify as low-end if:
    // - Mobile device with < 4GB RAM
    // - Desktop with < 2 cores or < 4GB RAM
    const isLowEnd = isMobile 
      ? memory < 4 
      : cpuCores < 2 || memory < 4;

    return {
      isMobile,
      isTablet,
      isLowEnd,
      cpuCores,
      memory,
      gpu,
      screenResolution: {
        width: window.screen.width,
        height: window.screen.height
      }
    };
  }

  /**
   * Select optimal quality preset based on device
   */
  private selectOptimalQuality(): QualityPreset {
    const presets: { [key: string]: QualityPreset } = {
      low: {
        name: 'low',
        targetFPS: 30,
        maxParticles: 50,
        shadowQuality: 0,
        textureQuality: 0.5,
        renderScale: 0.75,
        antialiasing: false,
        postProcessing: false
      },
      medium: {
        name: 'medium',
        targetFPS: 60,
        maxParticles: 200,
        shadowQuality: 512,
        textureQuality: 0.75,
        renderScale: 1.0,
        antialiasing: false,
        postProcessing: false
      },
      high: {
        name: 'high',
        targetFPS: 60,
        maxParticles: 500,
        shadowQuality: 1024,
        textureQuality: 1.0,
        renderScale: 1.0,
        antialiasing: true,
        postProcessing: true
      },
      ultra: {
        name: 'ultra',
        targetFPS: 120,
        maxParticles: 1000,
        shadowQuality: 2048,
        textureQuality: 1.0,
        renderScale: 1.5,
        antialiasing: true,
        postProcessing: true
      }
    };

    // Auto-select based on device
    if (this.deviceInfo.isLowEnd || (this.deviceInfo.isMobile && this.deviceInfo.memory < 4)) {
      return presets.low;
    } else if (this.deviceInfo.isMobile || this.deviceInfo.memory < 8) {
      return presets.medium;
    } else if (this.deviceInfo.cpuCores >= 4 && this.deviceInfo.memory >= 8) {
      return presets.high;
    } else {
      return presets.medium;
    }
  }

  /**
   * Start FPS monitoring
   */
  private startMonitoring(): void {
    const monitor = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      const fps = 1000 / delta;

      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      this.lastFrameTime = now;
      this.frameCount++;

      // Check for quality adjustment every 2 seconds
      if (this.frameCount % 120 === 0) {
        this.adaptQuality();
      }

      requestAnimationFrame(monitor);
    };

    requestAnimationFrame(monitor);
  }

  /**
   * Adapt quality based on current FPS
   */
  private adaptQuality(): void {
    const avgFPS = this.getAverageFPS();
    const target = this.currentQuality.targetFPS;

    // If consistently below target FPS, downgrade quality
    if (avgFPS < target * 0.8) {
      this.downgradeQuality();
    }
    // If consistently above target, can try upgrading
    else if (avgFPS > target * 1.2 && this.currentQuality.name !== 'ultra') {
      this.upgradeQuality();
    }
  }

  /**
   * Get current average FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.fpsHistory[this.fpsHistory.length - 1] || 60;
  }

  /**
   * Get device info
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  /**
   * Get current quality preset
   */
  getQualityPreset(): QualityPreset {
    return { ...this.currentQuality };
  }

  /**
   * Manually set quality
   */
  setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    const presets: { [key: string]: QualityPreset } = {
      low: {
        name: 'low',
        targetFPS: 30,
        maxParticles: 50,
        shadowQuality: 0,
        textureQuality: 0.5,
        renderScale: 0.75,
        antialiasing: false,
        postProcessing: false
      },
      medium: {
        name: 'medium',
        targetFPS: 60,
        maxParticles: 200,
        shadowQuality: 512,
        textureQuality: 0.75,
        renderScale: 1.0,
        antialiasing: false,
        postProcessing: false
      },
      high: {
        name: 'high',
        targetFPS: 60,
        maxParticles: 500,
        shadowQuality: 1024,
        textureQuality: 1.0,
        renderScale: 1.0,
        antialiasing: true,
        postProcessing: true
      },
      ultra: {
        name: 'ultra',
        targetFPS: 120,
        maxParticles: 1000,
        shadowQuality: 2048,
        textureQuality: 1.0,
        renderScale: 1.5,
        antialiasing: true,
        postProcessing: true
      }
    };

    this.currentQuality = presets[quality];
    console.log(`Quality set to: ${quality}`);
  }

  /**
   * Downgrade quality preset
   */
  private downgradeQuality(): void {
    const downgrades: { [key: string]: 'low' | 'medium' | 'high' | 'ultra' } = {
      ultra: 'high',
      high: 'medium',
      medium: 'low',
      low: 'low'
    };

    const newQuality = downgrades[this.currentQuality.name];
    if (newQuality !== this.currentQuality.name) {
      this.setQuality(newQuality);
      console.warn(`Performance issue detected. Quality downgraded to: ${newQuality}`);
    }
  }

  /**
   * Upgrade quality preset
   */
  private upgradeQuality(): void {
    const upgrades: { [key: string]: 'low' | 'medium' | 'high' | 'ultra' } = {
      low: 'medium',
      medium: 'high',
      high: 'ultra',
      ultra: 'ultra'
    };

    const newQuality = upgrades[this.currentQuality.name];
    if (newQuality !== this.currentQuality.name) {
      this.setQuality(newQuality);
      console.log(`Performance good. Quality upgraded to: ${newQuality}`);
    }
  }

  /**
   * Object Pool for frequently created/destroyed objects
   */
  createObjectPool<T>(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize: number = 20
  ) {
    const pool: T[] = [];
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      pool.push(factory());
    }

    return {
      acquire(): T {
        return pool.length > 0 ? pool.pop()! : factory();
      },
      release(obj: T): void {
        reset(obj);
        pool.push(obj);
      },
      getSize(): number {
        return pool.length;
      }
    };
  }

  /**
   * Throttle function execution
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  /**
   * Debounce function execution
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Request idle callback fallback
   */
  requestIdleCallback(callback: () => void, timeout: number = 1000): void {
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      window.requestIdleCallback(callback, { timeout });
    } else {
      setTimeout(callback, timeout);
    }
  }

  /**
   * Optimize canvas resolution based on device pixel ratio
   */
  optimizeCanvasResolution(canvas: HTMLCanvasElement): void {
    const dpr = Math.min(window.devicePixelRatio || 1, this.currentQuality.renderScale * 2);
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  /**
   * Get memory usage (Chrome only)
   */
  getMemoryUsage(): { used: number; limit: number } | null {
    // @ts-ignore
    if (performance.memory) {
      // @ts-ignore
      return {
        // @ts-ignore
        used: performance.memory.usedJSHeapSize / 1048576, // MB
        // @ts-ignore
        limit: performance.memory.jsHeapSizeLimit / 1048576 // MB
      };
    }
    return null;
  }
}

const performanceManager = new PerformanceManager();
export default performanceManager;
export type { DeviceInfo, QualityPreset };
