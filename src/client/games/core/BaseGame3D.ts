import { 
  Engine, 
  Scene, 
  ArcRotateCamera, 
  HemisphericLight, 
  Vector3,
  Color4,
  Mesh
} from '@babylonjs/core';

export interface Game3DConfig {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  settings?: {
    antialias?: boolean;
    clearColor?: Color4;
    shadows?: boolean;
    gravity?: Vector3;
  };
}

export interface Game3DState {
  score: number;
  isPaused: boolean;
  isGameOver: boolean;
  level?: number;
}

/**
 * Base class for all 3D games using Babylon.js
 * Provides engine setup, scene management, and common game lifecycle
 */
export abstract class BaseGame3D {
  protected engine: Engine;
  protected scene: Scene;
  protected camera: ArcRotateCamera;
  protected light: HemisphericLight;
  protected canvas: HTMLCanvasElement;
  protected config: Game3DConfig;
  protected state: Game3DState;
  protected animationFrame: number | null = null;
  protected lastTime: number = 0;
  protected deltaTime: number = 0;

  constructor(config: Game3DConfig) {
    this.config = config;
    this.canvas = config.canvas;
    
    // Initialize state
    this.state = {
      score: 0,
      isPaused: false,
      isGameOver: false,
      level: 1
    };

    // Create Babylon.js engine
    this.engine = new Engine(
      this.canvas, 
      config.settings?.antialias ?? true,
      { preserveDrawingBuffer: true, stencil: true }
    );

    // Create scene
    this.scene = new Scene(this.engine);
    this.scene.clearColor = config.settings?.clearColor ?? new Color4(0.1, 0.1, 0.15, 1);

    // Setup default camera (can be overridden)
    this.camera = new ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 3,
      10,
      Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = 5;
    this.camera.upperRadiusLimit = 50;

    // Setup default lighting
    this.light = new HemisphericLight(
      'light',
      new Vector3(0, 1, 0),
      this.scene
    );
    this.light.intensity = 0.7;

    // Enable physics if gravity specified
    if (config.settings?.gravity) {
      this.setupPhysics(config.settings.gravity);
    }

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Setup physics engine (optional)
   */
  protected setupPhysics(gravity: Vector3): void {
    // Can be extended by games that need physics
    this.scene.gravity = gravity;
  }

  /**
   * Initialize game - override this
   */
  abstract init(): Promise<void>;

  /**
   * Update game logic - override this
   */
  abstract update(deltaTime: number): void;

  /**
   * Render game - usually don't need to override
   */
  protected render(): void {
    this.scene.render();
  }

  /**
   * Start game loop
   */
  public start(): void {
    console.log('[BaseGame3D] Starting game:', this.config.name);
    
    this.lastTime = performance.now();
    
    // Start render loop
    this.engine.runRenderLoop(() => {
      if (!this.state.isPaused && !this.state.isGameOver) {
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        this.update(this.deltaTime);
      }
      
      this.render();
    });
  }

  /**
   * Pause game
   */
  public pause(): void {
    this.state.isPaused = true;
    console.log('[BaseGame3D] Game paused');
  }

  /**
   * Resume game
   */
  public resume(): void {
    this.state.isPaused = false;
    this.lastTime = performance.now(); // Reset time to prevent large delta
    console.log('[BaseGame3D] Game resumed');
  }

  /**
   * Reset game
   */
  public async reset(): Promise<void> {
    console.log('[BaseGame3D] Resetting game');
    
    // Dispose all meshes
    this.scene.meshes.forEach(mesh => {
      if (mesh.name !== '__root__') {
        mesh.dispose();
      }
    });

    // Reset state
    this.state = {
      score: 0,
      isPaused: false,
      isGameOver: false,
      level: 1
    };

    // Reinitialize
    await this.init();
  }

  /**
   * Game over handler
   */
  protected gameOver(): void {
    this.state.isGameOver = true;
    console.log('[BaseGame3D] Game over! Final score:', this.state.score);
    this.onGameOver?.(this.state);
  }

  /**
   * Get current state
   */
  public getState(): Game3DState {
    return { ...this.state };
  }

  /**
   * Update score
   */
  protected updateScore(points: number): void {
    this.state.score += points;
    this.onScoreUpdate?.(this.state.score);
  }

  /**
   * Handle window resize
   */
  protected handleResize = (): void => {
    this.engine.resize();
  };

  /**
   * Cleanup and dispose
   */
  public destroy(): void {
    console.log('[BaseGame3D] Destroying game');
    
    window.removeEventListener('resize', this.handleResize);
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.scene.dispose();
    this.engine.dispose();
  }

  // Event callbacks (can be set by GamePlay component)
  public onScoreUpdate?: (score: number) => void;
  public onGameOver?: (state: Game3DState) => void;
  public onLevelComplete?: (level: number) => void;
}

/**
 * Helper function to create mesh collision detection
 */
export function checkCollision(mesh1: Mesh, mesh2: Mesh): boolean {
  return mesh1.intersectsMesh(mesh2, false);
}

/**
 * Helper to create random position within bounds
 */
export function randomPosition(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export default BaseGame3D;
