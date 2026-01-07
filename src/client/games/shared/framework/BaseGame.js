import { generateAntiCheatToken, generateScoreSignature, validateTiming } from '../../utils/security';

/**
 * Base Game Class
 * All games should extend this class for consistent behavior
 */
class BaseGame {
  constructor(config = {}) {
    this.id = config.id || 'unknown';
    this.name = config.name || 'Game';
    this.version = config.version || '1.0.0';
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.startTime = null;
    this.endTime = null;
    this.antiCheatToken = null;
    
    // Settings
    this.settings = {
      width: config.width || 800,
      height: config.height || 600,
      fps: config.fps || 60,
      ...config.settings
    };
    
    // Game loop
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / this.settings.fps;
    this.animationFrameId = null;
    
    // Event handlers
    this.onScoreChange = config.onScoreChange || null;
    this.onGameOver = config.onGameOver || null;
    this.onPause = config.onPause || null;
    this.onResume = config.onResume || null;
  }

  /**
   * Initialize the game
   */
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }
    
    this.canvas.width = this.settings.width;
    this.canvas.height = this.settings.height;
    this.ctx = this.canvas.getContext('2d');
    
    // Setup input handlers
    this.setupInput();
    
    // Generate anti-cheat token
    this.antiCheatToken = generateAntiCheatToken();
    
    // Override in child class
    this.setup();
    
    return this;
  }

  /**
   * Setup method - override in child class
   */
  setup() {
    // Override this method in child class
  }

  /**
   * Start the game
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  /**
   * Pause the game
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.onPause?.();
  }

  /**
   * Resume the game
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return;
    
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.onResume?.();
  }

  /**
   * Stop the game
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Game loop
   */
  gameLoop(currentTime) {
    if (!this.isRunning) return;
    
    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    
    if (this.isPaused) return;
    
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime >= this.frameInterval) {
      this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
      
      // Update and render
      this.update(deltaTime);
      this.render();
    }
  }

  /**
   * Update method - override in child class
   */
  update(deltaTime) {
    // Override this method in child class
  }

  /**
   * Render method - override in child class
   */
  render() {
    // Override this method in child class
  }

  /**
   * Setup input handlers - override in child class
   */
  setupInput() {
    // Override this method in child class
  }

  /**
   * Update score
   */
  updateScore(points) {
    this.score += points;
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    this.onScoreChange?.(this.score, this.highScore);
  }

  /**
   * End the game
   */
  endGame() {
    this.endTime = Date.now();
    this.stop();
    
    // Validate timing for anti-cheat
    const validTiming = validateTiming(this.startTime, this.endTime, 1000);
    
    if (!validTiming) {
      console.warn('Invalid game timing detected');
    }
    
    // Save high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    this.onGameOver?.({
      score: this.score,
      highScore: this.highScore,
      duration: this.endTime - this.startTime,
      validTiming
    });
  }

  /**
   * Reset the game
   */
  reset() {
    this.score = 0;
    this.startTime = null;
    this.endTime = null;
    this.antiCheatToken = generateAntiCheatToken();
    this.setup();
  }

  /**
   * Load high score from localStorage
   */
  loadHighScore() {
    const key = `highscore_${this.id}`;
    return parseInt(localStorage.getItem(key)) || 0;
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore() {
    const key = `highscore_${this.id}`;
    localStorage.setItem(key, this.highScore.toString());
  }

  /**
   * Get game state for saving
   */
  getState() {
    return {
      score: this.score,
      highScore: this.highScore,
      startTime: this.startTime,
      timestamp: Date.now()
    };
  }

  /**
   * Load game state
   */
  loadState(state) {
    if (state) {
      this.score = state.score || 0;
      this.highScore = state.highScore || 0;
    }
  }

  /**
   * Prepare score for submission (with anti-cheat)
   */
  prepareScoreSubmission(userId) {
    const timestamp = Date.now();
    const signature = generateScoreSignature(
      userId,
      this.id,
      this.score,
      timestamp
    );
    
    return {
      userId,
      gameId: this.id,
      score: this.score,
      timestamp,
      signature,
      duration: this.endTime - this.startTime,
      antiCheatToken: this.antiCheatToken
    };
  }

  /**
   * Clear canvas
   */
  clearCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Draw text
   */
  drawText(text, x, y, style = {}) {
    const {
      font = '20px VT323',
      fillStyle = '#00d9ff',
      textAlign = 'left',
      textBaseline = 'top'
    } = style;
    
    this.ctx.font = font;
    this.ctx.fillStyle = fillStyle;
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = textBaseline;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop();
    
    if (this.canvas) {
      // Remove event listeners
      this.canvas.removeEventListener('keydown', this.handleKeyDown);
      this.canvas.removeEventListener('keyup', this.handleKeyUp);
      this.canvas.removeEventListener('click', this.handleClick);
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    }
  }
}

export default BaseGame;
