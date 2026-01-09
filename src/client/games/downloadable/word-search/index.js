// Word Search Game - Simple and Fun!
import BaseGame from '../../shared/framework/BaseGame.js';
import { GameMenu } from '../../shared/GameMenu.js';

class WordSearchGame extends BaseGame {
    constructor(containerId) {
        super(containerId, 'word-search', 600, 700);

        this.gridSize = 12;
        this.cellSize = 40;
        this.words = [];
        this.foundWords = new Set();
        this.grid = [];
        this.selection = { start: null, end: null, cells: [] };
        this.menu = new GameMenu(this);

        // Word lists by theme
        this.themes = {
            animals: ['CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'BEAR', 'WOLF', 'DEER'],
            colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE', 'PINK', 'BROWN'],
            food: ['PIZZA', 'BURGER', 'PASTA', 'SALAD', 'CAKE', 'BREAD', 'RICE', 'SOUP']
        };
    }

    setup() {
        this.score = 0;
        this.foundWords.clear();

        // Select random theme
        const themeNames = Object.keys(this.themes);
        const theme = themeNames[Math.floor(Math.random() * themeNames.length)];
        this.words = [...this.themes[theme]];

        // Generate grid
        this.generateGrid();
        this.setupControls();
    }

    generateGrid() {
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill(null).map(() =>
            Array(this.gridSize).fill('')
        );

        // Place words
        this.words.forEach(word => {
            this.placeWord(word);
        });

        // Fill remaining cells with random letters
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid[y][x]) {
                    this.grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }
    }

    placeWord(word) {
        const directions = [
            { dx: 1, dy: 0 },   // Right
            { dx: 0, dy: 1 },   // Down
            { dx: 1, dy: 1 },   // Diagonal down-right
            { dx: -1, dy: 1 }   // Diagonal down-left
        ];

        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const x = Math.floor(Math.random() * this.gridSize);
            const y = Math.floor(Math.random() * this.gridSize);

            if (this.canPlaceWord(word, x, y, dir.dx, dir.dy)) {
                for (let i = 0; i < word.length; i++) {
                    this.grid[y + i * dir.dy][x + i * dir.dx] = word[i];
                }
                placed = true;
            }
            attempts++;
        }
    }

    canPlaceWord(word, x, y, dx, dy) {
        for (let i = 0; i < word.length; i++) {
            const nx = x + i * dx;
            const ny = y + i * dy;

            if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) {
                return false;
            }

            if (this.grid[ny][nx] && this.grid[ny][nx] !== word[i]) {
                return false;
            }
        }
        return true;
    }

    setupControls() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        this.addKeyHandler('escape', () => {
            if (!this.menu.isOpen) {
                this.pause();
                this.menu.show('pause');
            }
        });
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);

        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.selection.start = { x, y };
            this.selection.cells = [{ x, y }];
        }
    }

    handleMouseMove(e) {
        if (!this.selection.start) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);

        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.selection.end = { x, y };
            this.updateSelection();
        }
    }

    handleMouseUp(e) {
        if (this.selection.start && this.selection.end) {
            this.checkWord();
        }
        this.selection = { start: null, end: null, cells: [] };
    }

    updateSelection() {
        const { start, end } = this.selection;
        if (!start || !end) return;

        const dx = Math.sign(end.x - start.x);
        const dy = Math.sign(end.y - start.y);
        const len = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) + 1;

        this.selection.cells = [];
        for (let i = 0; i < len; i++) {
            this.selection.cells.push({
                x: start.x + i * dx,
                y: start.y + i * dy
            });
        }
    }

    checkWord() {
        const word = this.selection.cells
            .map(cell => this.grid[cell.y][cell.x])
            .join('');

        if (this.words.includes(word) && !this.foundWords.has(word)) {
            this.foundWords.add(word);
            this.score += word.length * 10;

            // Check if all words found
            if (this.foundWords.size === this.words.length) {
                this.pause();
                this.menu.show('victory');
            }
        }
    }

    update(deltaTime) {
        // No continuous updates needed
    }

    render() {
        this.clearCanvas();

        // Draw grid
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const px = x * this.cellSize;
                const py = y * this.cellSize;

                // Cell background
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4);

                // Cell border
                this.ctx.strokeStyle = '#2C3E50';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4);

                // Letter
                this.ctx.fillStyle = '#2C3E50';
                this.ctx.font = 'bold 20px "Comic Sans MS"';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    this.grid[y][x],
                    px + this.cellSize / 2,
                    py + this.cellSize / 2
                );
            }
        }

        // Highlight selection
        if (this.selection.cells.length > 0) {
            this.ctx.fillStyle = 'rgba(78, 205, 196, 0.4)';
            this.selection.cells.forEach(cell => {
                this.ctx.fillRect(
                    cell.x * this.cellSize + 2,
                    cell.y * this.cellSize + 2,
                    this.cellSize - 4,
                    this.cellSize - 4
                );
            });
        }

        // Draw word list
        const listY = this.gridSize * this.cellSize + 20;
        this.ctx.font = 'bold 18px "Comic Sans MS"';
        this.ctx.textAlign = 'left';

        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillText('Find these words:', 10, listY);

        this.words.forEach((word, i) => {
            const found = this.foundWords.has(word);
            this.ctx.fillStyle = found ? '#4ECDC4' : '#2C3E50';
            this.ctx.fillText(
                found ? `✓ ${word}` : word,
                10 + (i % 4) * 140,
                listY + 30 + Math.floor(i / 4) * 25
            );
        });

        // Score
        this.ctx.font = 'bold 24px "Comic Sans MS"';
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 4;
        const scoreText = `Score: ${this.score}`;
        this.ctx.strokeText(scoreText, this.canvas.width - 150, 30);
        this.ctx.fillText(scoreText, this.canvas.width - 150, 30);
    }
}

export default WordSearchGame;
