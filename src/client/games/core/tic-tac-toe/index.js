import BaseGame from '../../shared/framework/BaseGame.js';
import { getAI, AI_LEVELS } from '../../shared/AIOpponent.js';

/**
 * Tic Tac Toe with AI and Local Multiplayer
 */
class TicTacToe extends BaseGame {
    constructor(containerId) {
        super(containerId, 'tic-tac-toe', 400, 500);

        this.ai = getAI(3);
        this.aiLevel = 3;

        // Game mode: 'ai' or 'local'
        this.gameMode = 'local';
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.winningLine = null;
        this.gameOver = false;
        this.aiThinking = false;
        
        // Scores
        this.xScore = 0;
        this.oScore = 0;
    }

    setup() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.winningLine = null;
        this.gameOver = false;
        this.aiThinking = false;
        this.score = 0;

        this.setupControls();
    }

    setupControls() {
        // Click handling
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || this.aiThinking) return;
            if (this.gameMode === 'ai' && this.currentPlayer !== 'X') return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check mode button (top area)
            if (y < 50) {
                const buttonWidth = 180;
                const buttonX = this.canvas.width / 2 - buttonWidth / 2;
                if (x >= buttonX && x <= buttonX + buttonWidth && y >= 10 && y <= 40) {
                    this.toggleGameMode();
                    return;
                }
            }

            const offsetY = 80;
            const gameY = y - offsetY;
            if (gameY < 0) return;

            const cellSize = this.canvas.width / 3;
            const col = Math.floor(x / cellSize);
            const row = Math.floor(gameY / cellSize);
            const index = row * 3 + col;

            if (index >= 0 && index < 9 && this.board[index] === null) {
                this.makeMove(index);
            }
        });

        this.addKeyHandler('r', () => { this.reset(); });
        this.addKeyHandler('m', () => { this.toggleGameMode(); });
    }

    toggleGameMode() {
        this.gameMode = this.gameMode === 'ai' ? 'local' : 'ai';
        this.reset();
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;

        // Check for winner
        const result = this.checkWinner();
        if (result) {
            this.winner = result.winner;
            this.winningLine = result.line;
            this.gameOver = true;

            if (this.winner === 'X') {
                this.xScore += 1;
                this.score += 100;
            } else if (this.winner === 'O') {
                this.oScore += 1;
            }
            return;
        }

        // Check for draw
        if (!this.board.includes(null)) {
            this.gameOver = true;
            this.score += 25;
            return;
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

        // AI turn in AI mode
        if (this.gameMode === 'ai' && this.currentPlayer === 'O' && !this.gameOver) {
            this.aiThinking = true;
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeAIMove() {
        const move = this.ai.getTicTacToeMove(this.board, 'O');
        this.aiThinking = false;

        if (move !== null) {
            this.makeMove(move);
        }
    }

    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return { winner: this.board[a], line };
            }
        }
        return null;
    }

    update(deltaTime) {
        // Not much to update - game is turn-based
    }

    render() {
        this.clearCanvas();

        // Background
        const bgGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        bgGradient.addColorStop(0, '#FFF8DC');
        bgGradient.addColorStop(1, '#FFE5B4');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Mode toggle button
        const buttonWidth = 180;
        const buttonHeight = 30;
        const buttonX = this.canvas.width / 2 - buttonWidth / 2;
        const buttonY = 10;

        this.ctx.fillStyle = this.gameMode === 'local' ? '#4ECDC4' : '#FF6B35';
        this.ctx.beginPath();
        this.ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
        this.ctx.fill();

        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px "Comic Sans MS", cursive';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            this.gameMode === 'local' ? 'Local 1v1 (M)' : 'vs AI (M)',
            this.canvas.width / 2,
            buttonY + buttonHeight / 2
        );

        // Scores
        this.ctx.font = 'bold 18px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`X: ${this.xScore}`, 20, 60);

        this.ctx.fillStyle = '#E63946';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`O: ${this.oScore}`, this.canvas.width - 20, 60);

        // Grid
        const offsetY = 80;
        const cellSize = this.canvas.width / 3;

        this.ctx.strokeStyle = '#FF6B35';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';

        // Vertical lines
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * cellSize, offsetY + 10);
            this.ctx.lineTo(i * cellSize, offsetY + 3 * cellSize - 10);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(10, offsetY + i * cellSize);
            this.ctx.lineTo(this.canvas.width - 10, offsetY + i * cellSize);
            this.ctx.stroke();
        }

        // Draw pieces
        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const centerX = col * cellSize + cellSize / 2;
            const centerY = offsetY + row * cellSize + cellSize / 2;

            if (this.board[i] === 'X') {
                this.drawX(centerX, centerY, 40);
            } else if (this.board[i] === 'O') {
                this.drawO(centerX, centerY, 35);
            }
        }

        // Draw winning line
        if (this.winningLine) {
            const [a, , c] = this.winningLine;
            const startRow = Math.floor(a / 3);
            const startCol = a % 3;
            const endRow = Math.floor(c / 3);
            const endCol = c % 3;

            this.ctx.strokeStyle = '#FFD93D';
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.moveTo(startCol * cellSize + cellSize / 2, offsetY + startRow * cellSize + cellSize / 2);
            this.ctx.lineTo(endCol * cellSize + cellSize / 2, offsetY + endRow * cellSize + cellSize / 2);
            this.ctx.stroke();
        }

        // Game status
        this.ctx.font = 'bold 20px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.textAlign = 'center';

        if (this.gameOver) {
            let statusText;
            if (this.winner) {
                if (this.gameMode === 'local') {
                    statusText = `Player ${this.winner} Wins!`;
                } else {
                    statusText = this.winner === 'X' ? 'You Win!' : 'AI Wins!';
                }
            } else {
                statusText = "It's a Draw!";
            }
            this.ctx.fillText(statusText, this.canvas.width / 2, offsetY + 3 * cellSize + 30);

            this.ctx.font = '16px "Comic Sans MS", cursive';
            this.ctx.fillStyle = '#FF6B35';
            this.ctx.fillText('Press R to play again', this.canvas.width / 2, offsetY + 3 * cellSize + 55);
        } else if (this.aiThinking) {
            this.ctx.fillText('AI thinking...', this.canvas.width / 2, offsetY + 3 * cellSize + 30);
        } else {
            let turnText;
            if (this.gameMode === 'local') {
                turnText = `Player ${this.currentPlayer}'s Turn`;
            } else {
                turnText = this.currentPlayer === 'X' ? 'Your Turn' : "AI's Turn";
            }
            this.ctx.fillText(turnText, this.canvas.width / 2, offsetY + 3 * cellSize + 30);
        }

        // Footer
        this.ctx.font = '14px "Comic Sans MS", cursive';
        this.ctx.fillStyle = '#90A4AE';
        if (this.gameMode === 'ai') {
            this.ctx.fillText(`AI: ${AI_LEVELS[this.aiLevel].name}`, this.canvas.width / 2, this.canvas.height - 10);
        }
    }

    drawX(x, y, size) {
        this.ctx.strokeStyle = '#4ECDC4';
        this.ctx.lineWidth = 10;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y - size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x + size, y - size);
        this.ctx.lineTo(x - size, y + size);
        this.ctx.stroke();
    }

    drawO(x, y, radius) {
        this.ctx.strokeStyle = '#E63946';
        this.ctx.lineWidth = 10;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}

export default TicTacToe;
