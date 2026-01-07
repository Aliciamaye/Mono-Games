import BaseGame from '../../shared/framework/BaseGame.js';

export default class Game2048 extends BaseGame {
  constructor(containerId) {
    super(containerId, '2048', 500, 600);
    
    this.gridSize = 4;
    this.cellSize = 100;
    this.cellPadding = 15;
    this.grid = [];
    
    // Colors
    this.colors = {
      2: '#FFF8DC',
      4: '#FDCA40',
      8: '#FFB347',
      16: '#FF9A56',
      32: '#FF8066',
      64: '#FF6B7B',
      128: '#FF99C8',
      256: '#FF7DC0',
      512: '#FF5FC8',
      1024: '#E056FD',
      2048: '#C94EFF'
    };
  }

  setup() {
    // Initialize empty grid
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = 0;
      }
    }
    
    // Add two starting tiles
    this.addRandomTile();
    this.addRandomTile();
    
    // Setup controls
    this.setupControls();
  }

  setupControls() {
    this.addKeyHandler('ArrowUp', () => this.move('up'));
    this.addKeyHandler('ArrowDown', () => this.move('down'));
    this.addKeyHandler('ArrowLeft', () => this.move('left'));
    this.addKeyHandler('ArrowRight', () => this.move('right'));
    
    this.addKeyHandler('w', () => this.move('up'));
    this.addKeyHandler('s', () => this.move('down'));
    this.addKeyHandler('a', () => this.move('left'));
    this.addKeyHandler('d', () => this.move('right'));
  }

  addRandomTile() {
    const emptyCells = [];
    
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  move(direction) {
    let moved = false;
    const oldGrid = JSON.stringify(this.grid);
    
    if (direction === 'left') {
      for (let i = 0; i < this.gridSize; i++) {
        const row = this.grid[i].filter(val => val !== 0);
        const merged = this.mergeTiles(row);
        this.grid[i] = [...merged, ...Array(this.gridSize - merged.length).fill(0)];
      }
    } else if (direction === 'right') {
      for (let i = 0; i < this.gridSize; i++) {
        const row = this.grid[i].filter(val => val !== 0).reverse();
        const merged = this.mergeTiles(row);
        this.grid[i] = [...Array(this.gridSize - merged.length).fill(0), ...merged.reverse()];
      }
    } else if (direction === 'up') {
      for (let j = 0; j < this.gridSize; j++) {
        const col = [];
        for (let i = 0; i < this.gridSize; i++) {
          if (this.grid[i][j] !== 0) col.push(this.grid[i][j]);
        }
        const merged = this.mergeTiles(col);
        for (let i = 0; i < this.gridSize; i++) {
          this.grid[i][j] = merged[i] || 0;
        }
      }
    } else if (direction === 'down') {
      for (let j = 0; j < this.gridSize; j++) {
        const col = [];
        for (let i = this.gridSize - 1; i >= 0; i--) {
          if (this.grid[i][j] !== 0) col.push(this.grid[i][j]);
        }
        const merged = this.mergeTiles(col);
        for (let i = this.gridSize - 1, k = 0; i >= 0; i--, k++) {
          this.grid[i][j] = merged[k] || 0;
        }
      }
    }
    
    moved = oldGrid !== JSON.stringify(this.grid);
    
    if (moved) {
      this.addRandomTile();
      
      if (this.checkGameOver()) {
        this.endGame('Game Over! Score: ' + this.score);
      }
    }
  }

  mergeTiles(tiles) {
    const merged = [];
    let skip = false;
    
    for (let i = 0; i < tiles.length; i++) {
      if (skip) {
        skip = false;
        continue;
      }
      
      if (tiles[i] === tiles[i + 1]) {
        const newValue = tiles[i] * 2;
        merged.push(newValue);
        this.score += newValue;
        skip = true;
      } else {
        merged.push(tiles[i]);
      }
    }
    
    return merged;
  }

  checkGameOver() {
    // Check for empty cells
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === 0) return false;
      }
    }
    
    // Check for possible merges
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const current = this.grid[i][j];
        if (j < this.gridSize - 1 && current === this.grid[i][j + 1]) return false;
        if (i < this.gridSize - 1 && current === this.grid[i + 1][j]) return false;
      }
    }
    
    return true;
  }

  update(deltaTime) {
    // No continuous updates needed for 2048
  }

  render() {
    this.clearCanvas();
    
    // Background
    this.ctx.fillStyle = '#FFF8DC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    const startX = (this.canvas.width - (this.cellSize * this.gridSize + this.cellPadding * (this.gridSize + 1))) / 2;
    const startY = 100;
    
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = startX + j * (this.cellSize + this.cellPadding) + this.cellPadding;
        const y = startY + i * (this.cellSize + this.cellPadding) + this.cellPadding;
        
        const value = this.grid[i][j];
        const color = this.colors[value] || '#CDC1B4';
        
        // Cell background
        this.ctx.fillStyle = value === 0 ? 'rgba(255, 179, 71, 0.2)' : color;
        this.ctx.roundRect(x, y, this.cellSize, this.cellSize, 12);
        this.ctx.fill();
        
        // Cell border
        this.ctx.strokeStyle = '#FFB347';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Number
        if (value !== 0) {
          this.ctx.fillStyle = value <= 4 ? '#2C3E50' : '#FFF8DC';
          this.ctx.font = value >= 1000 ? 'bold 36px "Comic Sans MS"' : 'bold 48px "Comic Sans MS"';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(value, x + this.cellSize / 2, y + this.cellSize / 2);
        }
      }
    }
    
    // Draw UI
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 32px "Comic Sans MS"';
    this.ctx.textAlign = 'left';
    this.drawText(`Score: ${this.score}`, 20, 40);
    this.drawText(`Best: ${this.highScore}`, 20, 70);
  }
}
