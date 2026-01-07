import BaseGame from '../../shared/framework/BaseGame.js';

export default class Tetris extends BaseGame {
  constructor(containerId) {
    super(containerId, 'tetris', 400, 800);
    
    // Grid dimensions
    this.cols = 10;
    this.rows = 20;
    this.blockSize = this.canvas.width / this.cols;
    
    // Game state
    this.grid = [];
    this.currentPiece = null;
    this.nextPiece = null;
    this.level = 1;
    this.lines = 0;
    this.dropSpeed = 1000; // ms
    this.lastDrop = 0;
    
    // Tetromino shapes
    this.shapes = {
      I: [[1,1,1,1]],
      O: [[1,1],[1,1]],
      T: [[0,1,0],[1,1,1]],
      S: [[0,1,1],[1,1,0]],
      Z: [[1,1,0],[0,1,1]],
      J: [[1,0,0],[1,1,1]],
      L: [[0,0,1],[1,1,1]]
    };
    
    // Colors
    this.colors = {
      I: '#FF6B35',
      O: '#F7931E',
      T: '#FF3E41',
      S: '#FDCA40',
      Z: '#41EAD4',
      J: '#FF99C8',
      L: '#A8DADC'
    };
  }

  setup() {
    // Initialize grid
    for (let y = 0; y < this.rows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.grid[y][x] = null;
      }
    }
    
    // Spawn first piece
    this.nextPiece = this.randomPiece();
    this.spawnPiece();
    
    // Setup controls
    this.setupControls();
  }

  setupControls() {
    this.addKeyHandler('ArrowLeft', () => this.movePiece(-1, 0));
    this.addKeyHandler('ArrowRight', () => this.movePiece(1, 0));
    this.addKeyHandler('ArrowDown', () => this.movePiece(0, 1));
    this.addKeyHandler('ArrowUp', () => this.rotatePiece());
    this.addKeyHandler(' ', () => this.hardDrop());
  }

  randomPiece() {
    const shapes = Object.keys(this.shapes);
    const type = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      type,
      shape: this.shapes[type],
      x: Math.floor(this.cols / 2) - 1,
      y: 0,
      color: this.colors[type]
    };
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.randomPiece();
    
    // Check game over
    if (this.checkCollision(this.currentPiece, 0, 0)) {
      this.endGame('Game Over! Lines: ' + this.lines);
    }
  }

  movePiece(dx, dy) {
    if (!this.currentPiece) return;
    
    if (!this.checkCollision(this.currentPiece, dx, dy)) {
      this.currentPiece.x += dx;
      this.currentPiece.y += dy;
    } else if (dy > 0) {
      // Piece hit bottom, lock it
      this.lockPiece();
    }
  }

  rotatePiece() {
    if (!this.currentPiece) return;
    
    const rotated = this.rotate(this.currentPiece.shape);
    const newPiece = { ...this.currentPiece, shape: rotated };
    
    if (!this.checkCollision(newPiece, 0, 0)) {
      this.currentPiece.shape = rotated;
    }
  }

  rotate(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = [];
    
    for (let x = 0; x < cols; x++) {
      rotated[x] = [];
      for (let y = rows - 1; y >= 0; y--) {
        rotated[x][rows - 1 - y] = shape[y][x];
      }
    }
    
    return rotated;
  }

  hardDrop() {
    if (!this.currentPiece) return;
    
    while (!this.checkCollision(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
    }
    this.lockPiece();
  }

  checkCollision(piece, dx, dy) {
    const newX = piece.x + dx;
    const newY = piece.y + dy;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const gridX = newX + x;
          const gridY = newY + y;
          
          // Check boundaries
          if (gridX < 0 || gridX >= this.cols || gridY >= this.rows) {
            return true;
          }
          
          // Check grid collision
          if (gridY >= 0 && this.grid[gridY][gridX]) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  lockPiece() {
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const gridY = this.currentPiece.y + y;
          const gridX = this.currentPiece.x + x;
          if (gridY >= 0) {
            this.grid[gridY][gridX] = this.currentPiece.color;
          }
        }
      }
    }
    
    this.clearLines();
    this.spawnPiece();
  }

  clearLines() {
    let linesCleared = 0;
    
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell !== null)) {
        this.grid.splice(y, 1);
        this.grid.unshift(new Array(this.cols).fill(null));
        linesCleared++;
        y++; // Check same row again
      }
    }
    
    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += linesCleared * 100 * this.level;
      
      // Level up every 10 lines
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
    }
  }

  update(deltaTime) {
    if (!this.isPlaying) return;
    
    this.lastDrop += deltaTime;
    
    if (this.lastDrop >= this.dropSpeed) {
      this.movePiece(0, 1);
      this.lastDrop = 0;
    }
  }

  render() {
    this.clearCanvas();
    
    // Draw grid
    this.ctx.strokeStyle = '#FFB347';
    this.ctx.lineWidth = 1;
    for (let y = 0; y <= this.rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.blockSize);
      this.ctx.lineTo(this.canvas.width, y * this.blockSize);
      this.ctx.stroke();
    }
    for (let x = 0; x <= this.cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.blockSize, 0);
      this.ctx.lineTo(x * this.blockSize, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw locked blocks
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x]) {
          this.drawBlock(x, y, this.grid[y][x]);
        }
      }
    }
    
    // Draw current piece
    if (this.currentPiece) {
      for (let y = 0; y < this.currentPiece.shape.length; y++) {
        for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
          if (this.currentPiece.shape[y][x]) {
            this.drawBlock(
              this.currentPiece.x + x,
              this.currentPiece.y + y,
              this.currentPiece.color
            );
          }
        }
      }
    }
    
    // Draw UI
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 24px "Comic Sans MS"';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`Lines: ${this.lines}`, 10, 60);
    this.ctx.fillText(`Level: ${this.level}`, 10, 90);
  }

  drawBlock(x, y, color) {
    const px = x * this.blockSize;
    const py = y * this.blockSize;
    
    // Main block
    this.ctx.fillStyle = color;
    this.ctx.fillRect(px + 2, py + 2, this.blockSize - 4, this.blockSize - 4);
    
    // Highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(px + 2, py + 2, this.blockSize - 4, 6);
    
    // Border
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(px + 2, py + 2, this.blockSize - 4, this.blockSize - 4);
  }
}
