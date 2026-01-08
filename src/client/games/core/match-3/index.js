import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Match-3 Puzzle Game
 * Classic gem-matching puzzle with cascades and combos
 */
class Match3Game extends BaseGame {
  constructor(containerId) {
    super(containerId, 'match-3', 600, 700);
    
    this.gridSize = 8;
    this.tileSize = 60;
    this.offsetX = 60;
    this.offsetY = 100;
    this.grid = [];
    this.selected = null;
    this.swapping = false;
    this.matches = [];
    this.animatingGems = [];
    this.gemTypes = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];
    this.movesLeft = 30;
    this.targetScore = 1000;
    this.combo = 0;
  }

  setup() {
    this.score = 0;
    this.movesLeft = 30;
    this.combo = 0;
    this.selected = null;
    this.swapping = false;
    this.matches = [];
    this.animatingGems = [];
    
    this.initializeGrid();
    this.setupControls();
  }

  setupControls() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.addKeyHandler('r', () => this.reset());
  }

  initializeGrid() {
    // Create grid
    this.grid = [];
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col] = {
          type: this.getRandomGemType(),
          row,
          col,
          y: row * this.tileSize,
          targetY: row * this.tileSize,
          scale: 1
        };
      }
    }
    
    // Remove initial matches
    while (this.findMatches().length > 0) {
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          this.grid[row][col].type = this.getRandomGemType();
        }
      }
    }
  }

  getRandomGemType() {
    return this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
  }

  handleClick(e) {
    if (this.swapping || this.movesLeft <= 0) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor((x - this.offsetX) / this.tileSize);
    const row = Math.floor((y - this.offsetY) / this.tileSize);
    
    if (col < 0 || col >= this.gridSize || row < 0 || row >= this.gridSize) return;
    
    if (!this.selected) {
      // First selection
      this.selected = { row, col };
      this.grid[row][col].scale = 1.2;
    } else {
      // Second selection - check if adjacent
      const dr = Math.abs(this.selected.row - row);
      const dc = Math.abs(this.selected.col - col);
      
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        // Adjacent - swap
        this.swapGems(this.selected.row, this.selected.col, row, col);
      } else {
        // Not adjacent - change selection
        this.grid[this.selected.row][this.selected.col].scale = 1;
        this.selected = { row, col };
        this.grid[row][col].scale = 1.2;
      }
    }
  }

  async swapGems(row1, col1, row2, col2) {
    this.swapping = true;
    
    // Swap in grid
    const temp = this.grid[row1][col1];
    this.grid[row1][col1] = this.grid[row2][col2];
    this.grid[row2][col2] = temp;
    
    // Update positions
    this.grid[row1][col1].row = row1;
    this.grid[row1][col1].col = col1;
    this.grid[row2][col2].row = row2;
    this.grid[row2][col2].col = col2;
    
    // Wait for animation
    await this.wait(200);
    
    // Check for matches
    const matches = this.findMatches();
    
    if (matches.length > 0) {
      // Valid move
      this.movesLeft--;
      this.selected = null;
      this.grid[row1][col1].scale = 1;
      this.combo = 0;
      await this.processMatches();
    } else {
      // Invalid move - swap back
      const temp = this.grid[row1][col1];
      this.grid[row1][col1] = this.grid[row2][col2];
      this.grid[row2][col2] = temp;
      
      this.grid[row1][col1].row = row1;
      this.grid[row1][col1].col = col1;
      this.grid[row2][col2].row = row2;
      this.grid[row2][col2].col = col2;
      
      await this.wait(200);
      this.selected = null;
      this.grid[row2][col2].scale = 1;
    }
    
    this.swapping = false;
    
    // Check win/lose
    if (this.score >= this.targetScore) {
      this.endGame('Victory! 🎉');
    } else if (this.movesLeft <= 0) {
      this.endGame('Out of moves! 😢');
    }
  }

  async processMatches() {
    let cascading = true;
    
    while (cascading) {
      const matches = this.findMatches();
      
      if (matches.length === 0) {
        cascading = false;
        break;
      }
      
      // Score matches with combo multiplier
      this.combo++;
      const points = matches.length * 10 * this.combo;
      this.score += points;
      
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }
      
      // Remove matched gems
      for (const { row, col } of matches) {
        this.grid[row][col].type = null;
        this.grid[row][col].scale = 0;
      }
      
      await this.wait(300);
      
      // Drop gems
      await this.dropGems();
      
      // Fill empty spaces
      this.fillGrid();
      
      await this.wait(300);
    }
  }

  findMatches() {
    const matches = [];
    const matched = new Set();
    
    // Check horizontal matches
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize - 2; col++) {
        const type = this.grid[row][col].type;
        if (!type) continue;
        
        let matchLength = 1;
        while (col + matchLength < this.gridSize && this.grid[row][col + matchLength].type === type) {
          matchLength++;
        }
        
        if (matchLength >= 3) {
          for (let i = 0; i < matchLength; i++) {
            const key = `${row},${col + i}`;
            if (!matched.has(key)) {
              matched.add(key);
              matches.push({ row, col: col + i });
            }
          }
        }
      }
    }
    
    // Check vertical matches
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize - 2; row++) {
        const type = this.grid[row][col].type;
        if (!type) continue;
        
        let matchLength = 1;
        while (row + matchLength < this.gridSize && this.grid[row + matchLength][col].type === type) {
          matchLength++;
        }
        
        if (matchLength >= 3) {
          for (let i = 0; i < matchLength; i++) {
            const key = `${row + i},${col}`;
            if (!matched.has(key)) {
              matched.add(key);
              matches.push({ row: row + i, col });
            }
          }
        }
      }
    }
    
    return matches;
  }

  async dropGems() {
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = this.gridSize - 1; row >= 0; row--) {
        if (this.grid[row][col].type === null) {
          // Find gem above
          for (let checkRow = row - 1; checkRow >= 0; checkRow--) {
            if (this.grid[checkRow][col].type !== null) {
              // Move it down
              this.grid[row][col] = this.grid[checkRow][col];
              this.grid[row][col].row = row;
              this.grid[row][col].targetY = row * this.tileSize;
              
              this.grid[checkRow][col] = {
                type: null,
                row: checkRow,
                col,
                y: checkRow * this.tileSize,
                targetY: checkRow * this.tileSize,
                scale: 1
              };
              break;
            }
          }
        }
      }
    }
  }

  fillGrid() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].type === null) {
          this.grid[row][col].type = this.getRandomGemType();
          this.grid[row][col].scale = 0.5;
          this.grid[row][col].y = -this.tileSize;
        }
      }
    }
  }

  update(deltaTime) {
    // Animate gem drops and scales
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const gem = this.grid[row][col];
        
        // Lerp Y position
        if (gem.y !== gem.targetY) {
          gem.y += (gem.targetY - gem.y) * 0.2;
          if (Math.abs(gem.y - gem.targetY) < 0.5) {
            gem.y = gem.targetY;
          }
        }
        
        // Lerp scale
        const targetScale = (this.selected && this.selected.row === row && this.selected.col === col) ? 1.2 : 1;
        if (gem.scale !== targetScale) {
          gem.scale += (targetScale - gem.scale) * 0.15;
        }
      }
    }
  }

  render() {
    this.clearCanvas();
    
    // Background
    const bgGradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    bgGradient.addColorStop(0, '#667eea');
    bgGradient.addColorStop(1, '#764ba2');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Header
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillRect(0, 0, this.width, 90);
    
    this.ctx.font = 'bold 24px "Comic Sans MS", cursive';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`💎 Score: ${this.score}`, 20, 35);
    this.ctx.fillText(`🎯 Target: ${this.targetScore}`, 20, 65);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`🔀 Moves: ${this.movesLeft}`, this.width - 20, 35);
    
    if (this.combo > 1) {
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.fillText(`🔥 Combo x${this.combo}`, this.width - 20, 65);
    }
    
    // Grid background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(
      this.offsetX - 5,
      this.offsetY - 5,
      this.gridSize * this.tileSize + 10,
      this.gridSize * this.tileSize + 10
    );
    
    // Draw grid
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const gem = this.grid[row][col];
        if (!gem.type) continue;
        
        const x = this.offsetX + col * this.tileSize;
        const y = this.offsetY + gem.y;
        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;
        
        // Gem background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.beginPath();
        this.ctx.roundRect(
          centerX - (this.tileSize / 2 - 5) * gem.scale,
          centerY - (this.tileSize / 2 - 5) * gem.scale,
          (this.tileSize - 10) * gem.scale,
          (this.tileSize - 10) * gem.scale,
          8
        );
        this.ctx.fill();
        
        // Gem
        this.ctx.font = `${40 * gem.scale}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(gem.type, centerX, centerY);
        
        // Selection highlight
        if (this.selected && this.selected.row === row && this.selected.col === col) {
          this.ctx.strokeStyle = '#FFD93D';
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          this.ctx.roundRect(
            x + 3,
            y + 3,
            this.tileSize - 6,
            this.tileSize - 6,
            8
          );
          this.ctx.stroke();
        }
      }
    }
    
    // Paused overlay
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.font = 'bold 48px "Comic Sans MS", cursive';
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default Match3Game;
