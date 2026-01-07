import BaseGame from '../../shared/framework/BaseGame.js';

export default class Pong extends BaseGame {
  constructor(containerId) {
    super(containerId, 'pong', 800, 600);
    
    // Paddles
    this.paddleWidth = 15;
    this.paddleHeight = 100;
    this.paddleSpeed = 6;
    
    this.leftPaddle = {
      x: 20,
      y: this.canvas.height / 2 - this.paddleHeight / 2,
      score: 0
    };
    
    this.rightPaddle = {
      x: this.canvas.width - 20 - this.paddleWidth,
      y: this.canvas.height / 2 - this.paddleHeight / 2,
      score: 0
    };
    
    // Ball
    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      radius: 10,
      speedX: 5,
      speedY: 5
    };
    
    // Keys pressed
    this.keys = {};
    
    // AI difficulty
    this.aiSpeed = 4;
  }

  setup() {
    this.setupControls();
    this.resetBall();
  }

  setupControls() {
    // Player controls (left paddle)
    this.addKeyHandler('w', () => { this.keys.w = true; });
    this.addKeyHandler('s', () => { this.keys.s = true; });
    
    // Key up handlers
    window.addEventListener('keyup', (e) => {
      if (e.key === 'w') this.keys.w = false;
      if (e.key === 's') this.keys.s = false;
    });
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    
    const angle = (Math.random() - 0.5) * Math.PI / 3; // -30 to 30 degrees
    const direction = Math.random() < 0.5 ? 1 : -1;
    const speed = 5;
    
    this.ball.speedX = Math.cos(angle) * speed * direction;
    this.ball.speedY = Math.sin(angle) * speed;
  }

  update(deltaTime) {
    if (!this.isPlaying) return;
    
    // Player paddle movement
    if (this.keys.w && this.leftPaddle.y > 0) {
      this.leftPaddle.y -= this.paddleSpeed;
    }
    if (this.keys.s && this.leftPaddle.y < this.canvas.height - this.paddleHeight) {
      this.leftPaddle.y += this.paddleSpeed;
    }
    
    // AI paddle movement (right paddle)
    const paddleCenter = this.rightPaddle.y + this.paddleHeight / 2;
    if (paddleCenter < this.ball.y - 10) {
      this.rightPaddle.y += this.aiSpeed;
    } else if (paddleCenter > this.ball.y + 10) {
      this.rightPaddle.y -= this.aiSpeed;
    }
    
    // Keep AI paddle in bounds
    this.rightPaddle.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.rightPaddle.y));
    
    // Ball movement
    this.ball.x += this.ball.speedX;
    this.ball.y += this.ball.speedY;
    
    // Top/bottom collision
    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
      this.ball.speedY *= -1;
    }
    
    // Left paddle collision
    if (
      this.ball.x - this.ball.radius <= this.leftPaddle.x + this.paddleWidth &&
      this.ball.y >= this.leftPaddle.y &&
      this.ball.y <= this.leftPaddle.y + this.paddleHeight
    ) {
      this.ball.speedX = Math.abs(this.ball.speedX);
      this.ball.speedX *= 1.05; // Increase speed slightly
      this.score += 10;
    }
    
    // Right paddle collision
    if (
      this.ball.x + this.ball.radius >= this.rightPaddle.x &&
      this.ball.y >= this.rightPaddle.y &&
      this.ball.y <= this.rightPaddle.y + this.paddleHeight
    ) {
      this.ball.speedX = -Math.abs(this.ball.speedX);
      this.ball.speedX *= 1.05;
      this.rightPaddle.score++;
    }
    
    // Score (ball out of bounds)
    if (this.ball.x < 0) {
      this.rightPaddle.score++;
      this.resetBall();
      if (this.rightPaddle.score >= 10) {
        this.endGame('AI Wins! Your score: ' + this.score);
      }
    } else if (this.ball.x > this.canvas.width) {
      this.leftPaddle.score++;
      this.score += 100;
      this.resetBall();
      if (this.leftPaddle.score >= 10) {
        this.endGame('You Win! Score: ' + this.score);
      }
    }
  }

  render() {
    this.clearCanvas();
    
    // Background
    this.ctx.fillStyle = '#FFF8DC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Center line
    this.ctx.strokeStyle = '#FFB347';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([15, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Left paddle (player)
    this.ctx.fillStyle = '#FF6B35';
    this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.paddleWidth, this.paddleHeight);
    
    // Right paddle (AI)
    this.ctx.fillStyle = '#41EAD4';
    this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.paddleWidth, this.paddleHeight);
    
    // Ball
    this.ctx.fillStyle = '#F7931E';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Ball glow
    const gradient = this.ctx.createRadialGradient(
      this.ball.x, this.ball.y, this.ball.radius / 2,
      this.ball.x, this.ball.y, this.ball.radius * 2
    );
    gradient.addColorStop(0, 'rgba(247, 147, 30, 0.5)');
    gradient.addColorStop(1, 'rgba(247, 147, 30, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius * 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Scores
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 48px "Comic Sans MS"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.leftPaddle.score, this.canvas.width / 4, 60);
    this.ctx.fillText(this.rightPaddle.score, (this.canvas.width * 3) / 4, 60);
    
    // Labels
    this.ctx.font = 'bold 20px "Comic Sans MS"';
    this.ctx.fillText('YOU', this.canvas.width / 4, 90);
    this.ctx.fillText('AI', (this.canvas.width * 3) / 4, 90);
    
    // Total score
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 20, this.canvas.height - 20);
  }
}
