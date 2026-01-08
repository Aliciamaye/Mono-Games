import BaseGame from '../../shared/framework/BaseGame.js';
import { getAI, AI_LEVELS } from '../../shared/AIOpponent.js';
import useSettingsStore from '../../../store/settingsStore';

/**
 * Classic Pong Game with AI and Local Multiplayer
 */
class PongGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'pong', 800, 500);

    // Get settings
    const settings = useSettingsStore.getState().settings;
    this.aiLevel = settings.gameplay.aiLevel || 3;
    this.ai = getAI(this.aiLevel);

    // Game mode: 'ai' or 'local'
    this.gameMode = 'local';

    // Paddle settings
    this.paddleWidth = 15;
    this.paddleHeight = 80;
    this.paddleSpeed = 8;

    // Ball settings
    this.ballSize = 12;
    this.ballSpeedX = 5;
    this.ballSpeedY = 3;

    // Player 2 keys for local multiplayer
    this.player2Keys = { up: false, down: false };
  }

  setup() {
    // Paddle positions
    this.paddle1Y = this.canvas.height / 2 - this.paddleHeight / 2;
    this.paddle2Y = this.canvas.height / 2 - this.paddleHeight / 2;

    // Ball position and velocity
    this.ballX = this.canvas.width / 2;
    this.ballY = this.canvas.height / 2;
    this.ballVelX = this.ballSpeedX * (Math.random() > 0.5 ? 1 : -1);
    this.ballVelY = this.ballSpeedY * (Math.random() > 0.5 ? 1 : -1);

    // Scores
    this.playerScore = 0;
    this.aiScore = 0;

    // Keys
    this.keys = { up: false, down: false };

    this.setupControls();
  }

  setupControls() {
    // Player 1 controls
    this.addKeyHandler('arrowup', () => { this.keys.up = true; });
    this.addKeyHandler('w', () => { this.keys.up = true; });
    this.addKeyHandler('arrowdown', () => { this.keys.down = true; });
    this.addKeyHandler('s', () => { this.keys.down = true; });
    
    // Player 2 controls (only for local multiplayer)
    this.addKeyHandler('i', () => { this.player2Keys.up = true; });
    this.addKeyHandler('k', () => { this.player2Keys.down = true; });

    this.addKeyHandler(' ', () => {
      this.isPaused ? this.resume() : this.pause();
    });
    this.addKeyHandler('r', () => { this.reset(); });
    this.addKeyHandler('m', () => { this.toggleGameMode(); });

    // Key up handling
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') this.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') this.keys.down = false;
      if (e.key === 'i') this.player2Keys.up = false;
      if (e.key === 'k') this.player2Keys.down = false;
    });
  }

  toggleGameMode() {
    this.gameMode = this.gameMode === 'ai' ? 'local' : 'ai';
    this.reset();
  }

  update(deltaTime) {
    // Player paddle movement
    if (this.keys.up && this.paddle1Y > 0) {
      this.paddle1Y -= this.paddleSpeed;
    }
    if (this.keys.down && this.paddle1Y < this.canvas.height - this.paddleHeight) {
      this.paddle1Y += this.paddleSpeed;
    }

    // AI paddle movement (only in AI mode)
    if (this.gameMode === 'ai') {
      const aiConfig = AI_LEVELS[this.aiLevel];
      const targetY = this.ballY - this.paddleHeight / 2;
      const diff = targetY - this.paddle2Y;

      if (Math.abs(diff) > 5) {
        const aiSpeed = this.paddleSpeed * (aiConfig.accuracy / 100);
        if (diff > 0) {
          this.paddle2Y += Math.min(aiSpeed, diff);
        } else {
          this.paddle2Y -= Math.min(aiSpeed, -diff);
        }
      }

      // Keep AI paddle in bounds
      this.paddle2Y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.paddle2Y));
    } else {
      // Player 2 paddle movement (local multiplayer)
      if (this.player2Keys.up && this.paddle2Y > 0) {
        this.paddle2Y -= this.paddleSpeed;
      }
      if (this.player2Keys.down && this.paddle2Y < this.canvas.height - this.paddleHeight) {
        this.paddle2Y += this.paddleSpeed;
      }
    }

    // Ball movement
    this.ballX += this.ballVelX;
    this.ballY += this.ballVelY;

    // Top/bottom wall collision
    if (this.ballY <= 0 || this.ballY >= this.canvas.height) {
      this.ballVelY = -this.ballVelY;
      this.ballY = Math.max(0, Math.min(this.canvas.height, this.ballY));
    }

    // Paddle collisions
    // Player paddle
    if (this.ballX - this.ballSize / 2 <= 30 + this.paddleWidth &&
      this.ballX > 30 &&
      this.ballY >= this.paddle1Y &&
      this.ballY <= this.paddle1Y + this.paddleHeight) {
      this.ballVelX = Math.abs(this.ballVelX) * 1.05;
      const hitPos = (this.ballY - this.paddle1Y) / this.paddleHeight;
      this.ballVelY = (hitPos - 0.5) * 8;
    }

    // AI paddle
    if (this.ballX + this.ballSize / 2 >= this.canvas.width - 30 - this.paddleWidth &&
      this.ballX < this.canvas.width - 30 &&
      this.ballY >= this.paddle2Y &&
      this.ballY <= this.paddle2Y + this.paddleHeight) {
      this.ballVelX = -Math.abs(this.ballVelX) * 1.05;
      const hitPos = (this.ballY - this.paddle2Y) / this.paddleHeight;
      this.ballVelY = (hitPos - 0.5) * 8;
    }

    // Scoring
    if (this.ballX < 0) {
      this.aiScore++;
      this.resetBall();
      if (this.aiScore >= 5) {
        this.endGame('AI Wins! 🤖');
      }
    }
    if (this.ballX > this.canvas.width) {
      this.playerScore++;
      this.score = this.playerScore * 100;
      this.resetBall();
      if (this.playerScore >= 5) {
        this.endGame('You Win! 🎉');
      }
    }
  }

  resetBall() {
    this.ballX = this.canvas.width / 2;
    this.ballY = this.canvas.height / 2;
    this.ballVelX = this.ballSpeedX * (Math.random() > 0.5 ? 1 : -1);
    this.ballVelY = this.ballSpeedY * (Math.random() > 0.5 ? 1 : -1);
  }

  render() {
    this.clearCanvas();

    // Background
    const bgGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    bgGradient.addColorStop(0, '#1A1A2E');
    bgGradient.addColorStop(0.5, '#16213E');
    bgGradient.addColorStop(1, '#1A1A2E');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Mode toggle button (top-right)
    const buttonWidth = 150;
    const buttonHeight = 30;
    const buttonX = this.canvas.width - buttonWidth - 10;
    const buttonY = 10;

    this.ctx.fillStyle = this.gameMode === 'local' ? '#4ECDC4' : '#FF6B35';
    this.ctx.beginPath();
    this.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
    this.ctx.fill();

    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.gameMode === 'local' ? 'Local 1v1 (M)' : 'vs AI (M)',
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2
    );
    this.ctx.textAlign = 'left';

    // Center line
    this.ctx.setLineDash([10, 10]);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Player paddle (left) - teal
    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#4ECDC4';
    this.roundRect(30, this.paddle1Y, this.paddleWidth, this.paddleHeight, 8);
    this.ctx.fill();

    // AI paddle (right) - orange
    this.ctx.fillStyle = '#FF6B35';
    this.ctx.shadowColor = '#FF6B35';
    this.roundRect(this.canvas.width - 30 - this.paddleWidth, this.paddle2Y, this.paddleWidth, this.paddleHeight, 8);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;

    // Ball
    this.ctx.fillStyle = '#FFD93D';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#FFD93D';
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, this.ballSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Ball highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(this.ballX - 3, this.ballY - 3, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Scores
    this.ctx.font = 'bold 64px "Comic Sans MS", cursive';
    this.ctx.textAlign = 'center';

    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.fillText(this.playerScore, this.canvas.width / 4, 80);

    this.ctx.fillStyle = '#FF6B35';
    this.ctx.fillText(this.aiScore, 3 * this.canvas.width / 4, 80);

    // Labels
    this.ctx.font = '16px "Comic Sans MS", cursive';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    const label1 = this.gameMode === 'local' ? 'P1' : 'YOU';
    const label2 = this.gameMode === 'local' ? 'P2' : 'AI';
    this.ctx.fillText(label1, this.canvas.width / 4, 110);
    this.ctx.fillText(label2, 3 * this.canvas.width / 4, 110);

    // Controls hint for local multiplayer
    if (this.gameMode === 'local') {
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('P1: W/S', 10, this.canvas.height - 10);
      this.ctx.textAlign = 'right';
      this.ctx.fillText('P2: I/K', this.canvas.width - 10, this.canvas.height - 10);
    } else {
      // AI Level indicator
      this.ctx.font = '14px "Comic Sans MS", cursive';
      this.ctx.fillStyle = '#90A4AE';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`AI Level: ${AI_LEVELS[this.aiLevel].name}`, this.canvas.width / 2, this.canvas.height - 15);
    }

    // Paused overlay
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.font = 'bold 48px "Comic Sans MS", cursive';
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);

      this.ctx.font = '20px "Comic Sans MS", cursive';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }

  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }
}

export default PongGame;
