import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Classic Snake Game
 */
class SnakeGame extends BaseGame {
  constructor(config = {}) {
    super({
      id: 'snake',
      name: 'Snake',
      version: '1.0.0',
      width: 600,
      height: 600,
      fps: 10,
      ...config
    });
    
    this.gridSize = 20;
    this.tileCount = this.settings.width / this.gridSize;
    
    this.snake = [];
    this.apple = { x: 0, y: 0 };
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
  }

  setup() {
    // Initialize snake in the center
    const centerX = Math.floor(this.tileCount / 2);
    const centerY = Math.floor(this.tileCount / 2);
    
    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY }
    ];
    
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    
    this.spawnApple();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (this.direction.y === 0) {
            this.nextDirection = { x: 0, y: -1 };
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (this.direction.y === 0) {
            this.nextDirection = { x: 0, y: 1 };
          }
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (this.direction.x === 0) {
            this.nextDirection = { x: -1, y: 0 };
          }
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (this.direction.x === 0) {
            this.nextDirection = { x: 1, y: 0 };
          }
          e.preventDefault();
          break;
        case ' ':
          this.isPaused ? this.resume() : this.pause();
          e.preventDefault();
          break;
      }
    };
    
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    
    this.handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && this.direction.x === 0) {
          this.nextDirection = { x: 1, y: 0 };
        } else if (deltaX < 0 && this.direction.x === 0) {
          this.nextDirection = { x: -1, y: 0 };
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && this.direction.y === 0) {
          this.nextDirection = { x: 0, y: 1 };
        } else if (deltaY < 0 && this.direction.y === 0) {
          this.nextDirection = { x: 0, y: -1 };
        }
      }
    };
    
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }

  update(deltaTime) {
    // Update direction
    this.direction = { ...this.nextDirection };
    
    // Move snake
    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };
    
    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      this.endGame();
      return;
    }
    
    // Check self collision
    for (let i = 0; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.endGame();
        return;
      }
    }
    
    this.snake.unshift(head);
    
    // Check apple collision
    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.updateScore(10);
      this.spawnApple();
    } else {
      this.snake.pop();
    }
  }

  render() {
    this.clearCanvas();
    
    // Draw background grid
    this.ctx.fillStyle = '#16213e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid lines
    this.ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i <= this.tileCount; i++) {
      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();
      
      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }
    
    // Draw snake
    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      const isHead = i === 0;
      
      if (isHead) {
        // Head gradient
        const gradient = this.ctx.createLinearGradient(
          segment.x * this.gridSize,
          segment.y * this.gridSize,
          (segment.x + 1) * this.gridSize,
          (segment.y + 1) * this.gridSize
        );
        gradient.addColorStop(0, '#00d9ff');
        gradient.addColorStop(1, '#00ff88');
        this.ctx.fillStyle = gradient;
      } else {
        this.ctx.fillStyle = '#00d9ff';
      }
      
      this.ctx.fillRect(
        segment.x * this.gridSize + 2,
        segment.y * this.gridSize + 2,
        this.gridSize - 4,
        this.gridSize - 4
      );
      
      // Add glow effect to head
      if (isHead) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00d9ff';
        this.ctx.fillRect(
          segment.x * this.gridSize + 2,
          segment.y * this.gridSize + 2,
          this.gridSize - 4,
          this.gridSize - 4
        );
        this.ctx.shadowBlur = 0;
      }
    }
    
    // Draw apple
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#ff6b6b';
    this.ctx.fillRect(
      this.apple.x * this.gridSize + 2,
      this.apple.y * this.gridSize + 2,
      this.gridSize - 4,
      this.gridSize - 4
    );
    this.ctx.shadowBlur = 0;
    
    // Draw score
    this.drawText(`Score: ${this.score}`, 10, 10, {
      font: '24px VT323',
      fillStyle: '#00d9ff'
    });
    
    this.drawText(`High Score: ${this.highScore}`, 10, 40, {
      font: '20px VT323',
      fillStyle: '#00ff88'
    });
    
    // Draw pause indicator
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.drawText('PAUSED', this.canvas.width / 2, this.canvas.height / 2, {
        font: '48px Press Start 2P',
        fillStyle: '#00d9ff',
        textAlign: 'center',
        textBaseline: 'middle'
      });
      
      this.drawText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 60, {
        font: '20px VT323',
        fillStyle: '#ffffff',
        textAlign: 'center',
        textBaseline: 'middle'
      });
    }
  }

  spawnApple() {
    let validPosition = false;
    
    while (!validPosition) {
      this.apple = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
      
      // Check if apple spawned on snake
      validPosition = true;
      for (const segment of this.snake) {
        if (segment.x === this.apple.x && segment.y === this.apple.y) {
          validPosition = false;
          break;
        }
      }
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    }
    super.destroy();
  }
}

export default SnakeGame;
