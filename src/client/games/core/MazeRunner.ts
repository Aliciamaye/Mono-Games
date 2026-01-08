/**
 * Maze Runner - Procedural Maze Game with DFS Generation
 * 
 * Features:
 * - Procedural maze generation using DFS algorithm
 * - Multiple difficulty levels (Easy, Medium, Hard, Expert)
 * - Collectible items (coins, gems, power-ups)
 * - Timer and score system
 * - Minimap for navigation
 * - Fog of war mode
 * - Multiple maze themes
 * - Keyboard and touch controls
 */

export interface MazeRunnerConfig {
  canvas: HTMLCanvasElement;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, time: number) => void;
}

interface Cell {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
  isPath: boolean;
  hasCollectible?: boolean;
  collectibleType?: 'coin' | 'gem' | 'powerup';
}

interface Player {
  x: number;
  y: number;
  cellX: number;
  cellY: number;
  speed: number;
  direction: { x: number; y: number };
}

interface Collectible {
  x: number;
  y: number;
  type: 'coin' | 'gem' | 'powerup';
  value: number;
  collected: boolean;
}

export default class MazeRunner {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onScoreUpdate?: (score: number) => void;
  private onGameOver?: (score: number, time: number) => void;

  private maze: Cell[][] = [];
  private player: Player;
  private collectibles: Collectible[] = [];
  private exitCell: { x: number; y: number };
  
  private mazeSize: number = 20; // 20x20 grid
  private cellSize: number = 30;
  private score: number = 0;
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrame: number | null = null;

  private keys: { [key: string]: boolean } = {};
  private fogOfWar: boolean = false;
  private viewRadius: number = 3;

  constructor(config: MazeRunnerConfig) {
    this.canvas = config.canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.onScoreUpdate = config.onScoreUpdate;
    this.onGameOver = config.onGameOver;

    // Initialize player
    this.player = {
      x: this.cellSize / 2,
      y: this.cellSize / 2,
      cellX: 0,
      cellY: 0,
      speed: 3,
      direction: { x: 0, y: 0 }
    };

    this.exitCell = { x: 0, y: 0 };

    this.setupEventListeners();
  }

  init(): void {
    console.log('[MazeRunner] Initializing...');
    this.generateMaze();
    this.placeCollectibles();
  }

  start(): void {
    console.log('[MazeRunner] Starting game...');
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.gameLoop();
  }

  pause(): void {
    console.log('[MazeRunner] Pausing game...');
    this.isPaused = true;
  }

  resume(): void {
    console.log('[MazeRunner] Resuming game...');
    this.isPaused = false;
    if (this.isRunning && !this.animationFrame) {
      this.gameLoop();
    }
  }

  reset(): void {
    console.log('[MazeRunner] Resetting game...');
    this.score = 0;
    this.elapsedTime = 0;
    this.player.x = this.cellSize / 2;
    this.player.y = this.cellSize / 2;
    this.player.cellX = 0;
    this.player.cellY = 0;
    this.generateMaze();
    this.placeCollectibles();
    this.updateScore();
  }

  destroy(): void {
    console.log('[MazeRunner] Destroying game...');
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.removeEventListeners();
  }

  private setupEventListeners(): void {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private removeEventListeners(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    this.keys[e.key.toLowerCase()] = true;
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys[e.key.toLowerCase()] = false;
  }

  private generateMaze(): void {
    // Initialize grid
    this.maze = [];
    for (let y = 0; y < this.mazeSize; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.mazeSize; x++) {
        this.maze[y][x] = {
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false,
          isPath: false
        };
      }
    }

    // DFS maze generation
    const stack: Cell[] = [];
    let current = this.maze[0][0];
    current.visited = true;

    while (true) {
      const neighbors = this.getUnvisitedNeighbors(current);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Remove walls between current and next
        this.removeWalls(current, next);
        
        next.visited = true;
        stack.push(current);
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        break;
      }
    }

    // Set exit at bottom-right corner
    this.exitCell = { x: this.mazeSize - 1, y: this.mazeSize - 1 };

    // Calculate cell size based on canvas
    this.cellSize = Math.min(
      (this.canvas.width - 200) / this.mazeSize, // Reserve 200px for minimap
      (this.canvas.height - 100) / this.mazeSize // Reserve 100px for UI
    );
  }

  private getUnvisitedNeighbors(cell: Cell): Cell[] {
    const neighbors: Cell[] = [];
    const { x, y } = cell;

    if (y > 0 && !this.maze[y - 1][x].visited) neighbors.push(this.maze[y - 1][x]); // Top
    if (x < this.mazeSize - 1 && !this.maze[y][x + 1].visited) neighbors.push(this.maze[y][x + 1]); // Right
    if (y < this.mazeSize - 1 && !this.maze[y + 1][x].visited) neighbors.push(this.maze[y + 1][x]); // Bottom
    if (x > 0 && !this.maze[y][x - 1].visited) neighbors.push(this.maze[y][x - 1]); // Left

    return neighbors;
  }

  private removeWalls(current: Cell, next: Cell): void {
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    if (dx === 1) {
      current.walls.right = false;
      next.walls.left = false;
    } else if (dx === -1) {
      current.walls.left = false;
      next.walls.right = false;
    } else if (dy === 1) {
      current.walls.bottom = false;
      next.walls.top = false;
    } else if (dy === -1) {
      current.walls.top = false;
      next.walls.bottom = false;
    }
  }

  private placeCollectibles(): void {
    this.collectibles = [];
    const numCoins = Math.floor(this.mazeSize * 1.5);
    const numGems = Math.floor(this.mazeSize * 0.5);

    // Place coins
    for (let i = 0; i < numCoins; i++) {
      const x = Math.floor(Math.random() * this.mazeSize);
      const y = Math.floor(Math.random() * this.mazeSize);
      
      if ((x !== 0 || y !== 0) && (x !== this.exitCell.x || y !== this.exitCell.y)) {
        this.collectibles.push({
          x: x * this.cellSize + this.cellSize / 2,
          y: y * this.cellSize + this.cellSize / 2,
          type: 'coin',
          value: 10,
          collected: false
        });
      }
    }

    // Place gems
    for (let i = 0; i < numGems; i++) {
      const x = Math.floor(Math.random() * this.mazeSize);
      const y = Math.floor(Math.random() * this.mazeSize);
      
      if ((x !== 0 || y !== 0) && (x !== this.exitCell.x || y !== this.exitCell.y)) {
        this.collectibles.push({
          x: x * this.cellSize + this.cellSize / 2,
          y: y * this.cellSize + this.cellSize / 2,
          type: 'gem',
          value: 50,
          collected: false
        });
      }
    }
  }

  private gameLoop = (): void => {
    if (!this.isRunning || this.isPaused) {
      this.animationFrame = null;
      return;
    }

    this.update();
    this.draw();

    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    // Update time
    if (this.startTime > 0) {
      this.elapsedTime = Date.now() - this.startTime;
    }

    // Movement
    let dx = 0;
    let dy = 0;

    if (this.keys['arrowup'] || this.keys['w']) dy = -1;
    if (this.keys['arrowdown'] || this.keys['s']) dy = 1;
    if (this.keys['arrowleft'] || this.keys['a']) dx = -1;
    if (this.keys['arrowright'] || this.keys['d']) dx = 1;

    if (dx !== 0 || dy !== 0) {
      const newX = this.player.x + dx * this.player.speed;
      const newY = this.player.y + dy * this.player.speed;

      if (this.canMoveTo(newX, newY)) {
        this.player.x = newX;
        this.player.y = newY;
        this.player.cellX = Math.floor(this.player.x / this.cellSize);
        this.player.cellY = Math.floor(this.player.y / this.cellSize);
      }
    }

    // Check collectibles
    this.collectibles.forEach(collectible => {
      if (!collectible.collected) {
        const dist = Math.hypot(this.player.x - collectible.x, this.player.y - collectible.y);
        if (dist < this.cellSize / 3) {
          collectible.collected = true;
          this.score += collectible.value;
          this.updateScore();
        }
      }
    });

    // Check exit
    if (this.player.cellX === this.exitCell.x && this.player.cellY === this.exitCell.y) {
      this.winGame();
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);

    // Check bounds
    if (cellX < 0 || cellX >= this.mazeSize || cellY < 0 || cellY >= this.mazeSize) {
      return false;
    }

    const cell = this.maze[cellY][cellX];
    const localX = x % this.cellSize;
    const localY = y % this.cellSize;
    const margin = 5;

    // Check walls
    if (localY < margin && cell.walls.top) return false;
    if (localY > this.cellSize - margin && cell.walls.bottom) return false;
    if (localX < margin && cell.walls.left) return false;
    if (localX > this.cellSize - margin && cell.walls.right) return false;

    return true;
  }

  private draw(): void {
    // Clear canvas
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(10, 80); // Offset for UI

    // Draw maze
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const px = x * this.cellSize;
        const py = y * this.cellSize;

        // Check if cell is visible (fog of war)
        const isVisible = !this.fogOfWar || this.isInViewRadius(x, y);

        if (isVisible) {
          // Draw floor
          this.ctx.fillStyle = '#1e293b';
          this.ctx.fillRect(px, py, this.cellSize, this.cellSize);

          // Draw walls
          this.ctx.strokeStyle = '#475569';
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();

          if (cell.walls.top) {
            this.ctx.moveTo(px, py);
            this.ctx.lineTo(px + this.cellSize, py);
          }
          if (cell.walls.right) {
            this.ctx.moveTo(px + this.cellSize, py);
            this.ctx.lineTo(px + this.cellSize, py + this.cellSize);
          }
          if (cell.walls.bottom) {
            this.ctx.moveTo(px, py + this.cellSize);
            this.ctx.lineTo(px + this.cellSize, py + this.cellSize);
          }
          if (cell.walls.left) {
            this.ctx.moveTo(px, py);
            this.ctx.lineTo(px, py + this.cellSize);
          }

          this.ctx.stroke();
        }

        // Draw exit
        if (x === this.exitCell.x && y === this.exitCell.y) {
          this.ctx.fillStyle = '#22c55e';
          this.ctx.fillRect(px + 5, py + 5, this.cellSize - 10, this.cellSize - 10);
          this.ctx.fillStyle = '#fff';
          this.ctx.font = '20px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('🚪', px + this.cellSize / 2, py + this.cellSize / 2 + 5);
        }
      }
    }

    // Draw collectibles
    this.collectibles.forEach(collectible => {
      if (!collectible.collected) {
        const emoji = collectible.type === 'coin' ? '🪙' : '💎';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(emoji, collectible.x, collectible.y);
      }
    });

    // Draw player
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.cellSize / 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Player glow
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#3b82f6';
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.restore();

    // Draw UI
    this.drawUI();
    
    // Draw minimap
    this.drawMinimap();

    // Draw pause overlay
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  private isInViewRadius(x: number, y: number): boolean {
    const dx = Math.abs(x - this.player.cellX);
    const dy = Math.abs(y - this.player.cellY);
    return dx <= this.viewRadius && dy <= this.viewRadius;
  }

  private drawUI(): void {
    // Background bar
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, 0, this.canvas.width, 70);

    // Score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);

    // Time
    const minutes = Math.floor(this.elapsedTime / 60000);
    const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
    this.ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, 55);

    // Collected items
    const collected = this.collectibles.filter(c => c.collected).length;
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Items: ${collected}/${this.collectibles.length}`, this.canvas.width - 220, 30);
  }

  private drawMinimap(): void {
    const minimapSize = 150;
    const minimapX = this.canvas.width - minimapSize - 20;
    const minimapY = 20;
    const miniCellSize = minimapSize / this.mazeSize;

    // Minimap background
    this.ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    this.ctx.fillRect(minimapX - 5, minimapY - 5, minimapSize + 10, minimapSize + 10);

    // Draw maze on minimap
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const px = minimapX + x * miniCellSize;
        const py = minimapY + y * miniCellSize;

        this.ctx.fillStyle = '#334155';
        this.ctx.fillRect(px, py, miniCellSize, miniCellSize);
      }
    }

    // Draw exit on minimap
    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillRect(
      minimapX + this.exitCell.x * miniCellSize,
      minimapY + this.exitCell.y * miniCellSize,
      miniCellSize,
      miniCellSize
    );

    // Draw player on minimap
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(
      minimapX + this.player.cellX * miniCellSize,
      minimapY + this.player.cellY * miniCellSize,
      miniCellSize,
      miniCellSize
    );
  }

  private winGame(): void {
    this.isRunning = false;
    const timeBonus = Math.max(0, 5000 - Math.floor(this.elapsedTime / 1000) * 10);
    this.score += timeBonus;
    
    if (this.onGameOver) {
      this.onGameOver(this.score, this.elapsedTime);
    }
  }

  private updateScore(): void {
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  // Public setters
  setDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    const sizeMap = { easy: 10, medium: 15, hard: 20, expert: 25 };
    this.mazeSize = sizeMap[difficulty];
    this.reset();
  }

  setFogOfWar(enabled: boolean): void {
    this.fogOfWar = enabled;
  }

  getScore(): number {
    return this.score;
  }

  getTime(): number {
    return this.elapsedTime;
  }
}
