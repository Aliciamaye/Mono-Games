import BaseGame from '../../shared/framework/BaseGame.js';
import audioManager, { Sounds } from '../../../utils/audioManager.ts';

export default class RacingGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'racing', 800, 600);
    
    // Initialize audio
    audioManager.init();
    
    // Player car
    this.car = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 120,
      width: 40,
      height: 70,
      speed: 0,
      maxSpeed: 12,
      acceleration: 0.3,
      friction: 0.95,
      handling: 5,
      angle: 0,
      drifting: false,
      nitro: 100,
      maxNitro: 100,
      health: 100
    };

    // Track settings
    this.trackSpeed = 5;
    this.trackOffset = 0;
    this.laneWidth = 150;
    this.lanes = [200, 350, 500, 650];
    this.currentLane = 1;
    
    // Traffic & obstacles
    this.obstacles = [];
    this.powerUps = [];
    this.particles = [];
    
    // Game state
    this.distance = 0;
    this.level = 1;
    this.combo = 0;
    this.coins = 0;
    this.lap = 1;
    this.checkpoints = [0, 1000, 2000, 3000];
    this.passedCheckpoints = new Set();
    
    // Controls
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false
    };
    
    // Colors
    this.colors = {
      car: '#FF6B35',
      road: '#3A3A3A',
      grass: '#51CF66',
      line: '#FFF8DC',
      obstacle: '#FF6B6B',
      powerUp: '#FFD43B',
      nitro: '#74C0FC'
    };
    
    // Timer
    this.gameTime = 0;
    this.bestTime = localStorage.getItem('racing-best-time') || Infinity;
  }

  setup() {
    this.setupControls();
    this.spawnObstacle();
    this.spawnPowerUp();
    
    // Play engine sound and background music
    Sounds.start();
    this.playEngineSound();
  }

  setupControls() {
    // Keyboard
    this.addKeyHandler('ArrowLeft', () => { this.keys.left = true; });
    this.addKeyHandler('ArrowRight', () => { this.keys.right = true; });
    this.addKeyHandler('ArrowUp', () => { this.keys.up = true; });
    this.addKeyHandler('ArrowDown', () => { this.keys.down = true; });
    this.addKeyHandler(' ', () => this.activateNitro());
    
    this.addKeyHandler('a', () => { this.keys.left = true; });
    this.addKeyHandler('d', () => { this.keys.right = true; });
    this.addKeyHandler('w', () => { this.keys.up = true; });
    this.addKeyHandler('s', () => { this.keys.down = true; });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') this.keys.left = false;
      if (key === 'arrowright' || key === 'd') this.keys.right = false;
      if (key === 'arrowup' || key === 'w') this.keys.up = false;
      if (key === 'arrowdown' || key === 's') this.keys.down = false;
      if (key === ' ') this.keys.space = false;
    });

    // Touch controls for mobile
    let touchStartX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      this.keys.up = true;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const touchX = e.touches[0].clientX;
      const diff = touchX - touchStartX;
      
      if (Math.abs(diff) > 30) {
        this.keys.left = diff < 0;
        this.keys.right = diff > 0;
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.keys.left = false;
      this.keys.right = false;
      this.keys.up = false;
    });
  }

  playEngineSound() {
    // Simulate engine sound with varying frequency
    if (this.engineSoundInterval) clearInterval(this.engineSoundInterval);
    
    this.engineSoundInterval = setInterval(() => {
      if (this.isPlaying && !this.isPaused) {
        const freq = 100 + (this.car.speed / this.car.maxSpeed) * 200;
        audioManager.playTone(freq, 0.1, 'sawtooth');
      }
    }, 200);
  }

  activateNitro() {
    if (this.car.nitro > 20 && !this.car.nitroActive) {
      this.car.nitroActive = true;
      this.car.maxSpeed = 18;
      Sounds.powerUp();
      
      // Create nitro particles
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: this.car.x,
          y: this.car.y + this.car.height,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          life: 30,
          color: '#74C0FC'
        });
      }
    }
  }

  spawnObstacle() {
    if (!this.isPlaying) return;

    const types = ['car', 'rock', 'oil'];
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    this.obstacles.push({
      x: lane,
      y: -100,
      width: type === 'car' ? 40 : 50,
      height: type === 'car' ? 70 : 50,
      speed: this.trackSpeed + Math.random() * 2,
      type,
      passed: false
    });

    const delay = Math.max(800, 2000 - this.level * 100);
    setTimeout(() => this.spawnObstacle(), delay);
  }

  spawnPowerUp() {
    if (!this.isPlaying) return;

    const types = ['coin', 'nitro', 'shield', 'magnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    this.powerUps.push({
      x: lane,
      y: -100,
      radius: 20,
      speed: this.trackSpeed,
      type,
      rotation: 0
    });

    setTimeout(() => this.spawnPowerUp(), 3000 + Math.random() * 2000);
  }

  update(deltaTime) {
    if (!this.isPlaying) return;

    this.gameTime += deltaTime / 1000;

    // Update car movement
    if (this.keys.up) {
      this.car.speed += this.car.acceleration;
    } else if (this.keys.down) {
      this.car.speed -= this.car.acceleration * 0.5;
    }

    this.car.speed *= this.car.friction;
    this.car.speed = Math.max(-this.car.maxSpeed * 0.5, Math.min(this.car.maxSpeed, this.car.speed));

    // Lane switching
    if (this.keys.left && this.currentLane > 0) {
      this.currentLane--;
      this.keys.left = false;
      this.car.drifting = true;
      Sounds.click();
      setTimeout(() => this.car.drifting = false, 200);
    }
    if (this.keys.right && this.currentLane < this.lanes.length - 1) {
      this.currentLane++;
      this.keys.right = false;
      this.car.drifting = true;
      Sounds.click();
      setTimeout(() => this.car.drifting = false, 200);
    }

    // Smooth lane transition
    const targetX = this.lanes[this.currentLane];
    this.car.x += (targetX - this.car.x) * 0.2;

    // Update nitro
    if (this.car.nitroActive) {
      this.car.nitro -= 0.5;
      if (this.car.nitro <= 0) {
        this.car.nitroActive = false;
        this.car.maxSpeed = 12;
        this.car.nitro = 0;
      }
    } else if (this.car.nitro < this.car.maxNitro) {
      this.car.nitro += 0.1;
    }

    // Update track
    this.trackSpeed = 5 + this.level * 0.5;
    this.trackOffset += this.trackSpeed;
    this.distance += this.trackSpeed / 60;

    // Level progression
    if (this.distance > this.level * 500) {
      this.level++;
      Sounds.powerUp();
    }

    // Update obstacles
    this.obstacles.forEach((obstacle, index) => {
      obstacle.y += obstacle.speed;

      // Check collision
      if (this.checkCollision(this.car, obstacle)) {
        if (!obstacle.hit) {
          obstacle.hit = true;
          this.car.health -= 20;
          Sounds.hit();
          this.createExplosion(obstacle.x, obstacle.y);
          
          if (this.car.health <= 0) {
            this.endGame(`Game Over! Distance: ${Math.floor(this.distance)}m`);
          }
        }
      }

      // Near miss combo
      if (!obstacle.passed && obstacle.y > this.car.y) {
        const distance = Math.abs(obstacle.x - this.car.x);
        if (distance < 80) {
          this.combo++;
          this.score += 50 * this.combo;
          Sounds.collect();
        }
        obstacle.passed = true;
      }

      // Remove off-screen obstacles
      if (obstacle.y > this.canvas.height + 50) {
        this.obstacles.splice(index, 1);
      }
    });

    // Update power-ups
    this.powerUps.forEach((powerUp, index) => {
      powerUp.y += powerUp.speed;
      powerUp.rotation += 0.1;

      // Check collection
      const dx = powerUp.x - this.car.x;
      const dy = powerUp.y - this.car.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 40) {
        this.collectPowerUp(powerUp);
        this.powerUps.splice(index, 1);
      }

      // Remove off-screen
      if (powerUp.y > this.canvas.height + 50) {
        this.powerUps.splice(index, 1);
      }
    });

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });

    // Check checkpoints
    this.checkpoints.forEach((checkpoint, index) => {
      if (this.distance > checkpoint && !this.passedCheckpoints.has(index)) {
        this.passedCheckpoints.add(index);
        this.score += 500;
        Sounds.win();
      }
    });

    // Update score
    this.score += Math.floor(this.car.speed / 2);
  }

  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  collectPowerUp(powerUp) {
    Sounds.collect();

    switch (powerUp.type) {
      case 'coin':
        this.coins++;
        this.score += 100;
        break;
      case 'nitro':
        this.car.nitro = Math.min(this.car.maxNitro, this.car.nitro + 50);
        break;
      case 'shield':
        this.car.health = Math.min(100, this.car.health + 30);
        break;
      case 'magnet':
        // Attract nearby power-ups
        this.powerUps.forEach(p => {
          const dx = this.car.x - p.x;
          const dy = this.car.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            p.x += dx * 0.1;
            p.y += dy * 0.1;
          }
        });
        break;
    }

    this.createParticles(powerUp.x, powerUp.y, '#FFD43B');
  }

  createExplosion(x, y) {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * (Math.random() * 5 + 2),
        vy: Math.sin(angle) * (Math.random() * 5 + 2),
        life: 40,
        color: ['#FF6B35', '#F7931E', '#FFD43B'][Math.floor(Math.random() * 3)]
      });
    }
    Sounds.explosion();
  }

  createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 30,
        color
      });
    }
  }

  render() {
    this.clearCanvas();

    // Draw grass background
    this.ctx.fillStyle = this.colors.grass;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw road
    this.ctx.fillStyle = this.colors.road;
    this.ctx.fillRect(100, 0, 600, this.canvas.height);

    // Draw road lines
    this.ctx.strokeStyle = this.colors.line;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([20, 20]);
    
    for (let i = 0; i < this.lanes.length - 1; i++) {
      const x = (this.lanes[i] + this.lanes[i + 1]) / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, -this.trackOffset % 40);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);

    // Draw obstacles
    this.obstacles.forEach(obstacle => {
      if (obstacle.type === 'car') {
        this.drawCar(obstacle.x, obstacle.y, obstacle.width, obstacle.height, '#FF6B6B');
      } else if (obstacle.type === 'rock') {
        this.ctx.fillStyle = '#8E8E8E';
        this.ctx.beginPath();
        this.ctx.arc(obstacle.x, obstacle.y, obstacle.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      } else if (obstacle.type === 'oil') {
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.beginPath();
        this.ctx.ellipse(obstacle.x, obstacle.y, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Draw power-ups
    this.powerUps.forEach(powerUp => {
      this.ctx.save();
      this.ctx.translate(powerUp.x, powerUp.y);
      this.ctx.rotate(powerUp.rotation);

      // Glow effect
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, powerUp.radius * 1.5);
      gradient.addColorStop(0, this.colors.powerUp);
      gradient.addColorStop(1, 'rgba(255, 212, 59, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, powerUp.radius * 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Power-up icon
      this.ctx.fillStyle = this.colors.powerUp;
      this.ctx.strokeStyle = '#2C3E50';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Icon text
      this.ctx.fillStyle = '#2C3E50';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const icons = { coin: '💰', nitro: '⚡', shield: '🛡️', magnet: '🧲' };
      this.ctx.fillText(icons[powerUp.type] || '?', 0, 0);

      this.ctx.restore();
    });

    // Draw particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life / 30;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Draw player car
    this.drawCar(this.car.x, this.car.y, this.car.width, this.car.height, this.colors.car, this.car.drifting);

    // Draw nitro flames
    if (this.car.nitroActive) {
      for (let i = 0; i < 3; i++) {
        const flameY = this.car.y + this.car.height + i * 15;
        const gradient = this.ctx.createLinearGradient(this.car.x, flameY, this.car.x, flameY + 20);
        gradient.addColorStop(0, '#74C0FC');
        gradient.addColorStop(1, 'rgba(116, 192, 252, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.car.x - 10, flameY, this.car.width + 20, 20);
      }
    }

    // Draw UI
    this.drawUI();
  }

  drawCar(x, y, width, height, color, drifting = false) {
    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);
    
    if (drifting) {
      this.ctx.rotate(0.2);
    }

    // Car body
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = '#2C3E50';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(-width / 2, -height / 2, width, height, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Windows
    this.ctx.fillStyle = '#74C0FC';
    this.ctx.fillRect(-width / 2 + 5, -height / 2 + 10, width - 10, height / 3);

    // Wheels
    this.ctx.fillStyle = '#2C3E50';
    const wheelSize = 8;
    this.ctx.fillRect(-width / 2 - 3, -height / 2 + 5, wheelSize, 15);
    this.ctx.fillRect(width / 2 - 5, -height / 2 + 5, wheelSize, 15);
    this.ctx.fillRect(-width / 2 - 3, height / 2 - 20, wheelSize, 15);
    this.ctx.fillRect(width / 2 - 5, height / 2 - 20, wheelSize, 15);

    this.ctx.restore();
  }

  drawUI() {
    const padding = 20;

    // Distance
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 28px "Comic Sans MS"';
    this.ctx.fillText(`${Math.floor(this.distance)}m`, padding, 40);

    // Level
    this.ctx.fillText(`Level ${this.level}`, padding, 75);

    // Score
    this.ctx.fillText(`Score: ${this.score}`, padding, 110);

    // Combo
    if (this.combo > 1) {
      this.ctx.fillStyle = '#FF6B35';
      this.ctx.font = 'bold 24px "Comic Sans MS"';
      this.ctx.fillText(`Combo x${this.combo}!`, padding, 140);
    }

    // Health bar
    this.ctx.fillStyle = '#E0E0E0';
    this.ctx.fillRect(padding, this.canvas.height - 80, 200, 20);
    
    const healthColor = this.car.health > 50 ? '#51CF66' : this.car.health > 25 ? '#FFD43B' : '#FF6B6B';
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(padding, this.canvas.height - 80, (this.car.health / 100) * 200, 20);
    
    this.ctx.strokeStyle = '#2C3E50';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(padding, this.canvas.height - 80, 200, 20);
    
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillText(`Health: ${Math.floor(this.car.health)}%`, padding, this.canvas.height - 85);

    // Nitro bar
    this.ctx.fillStyle = '#E0E0E0';
    this.ctx.fillRect(padding, this.canvas.height - 50, 200, 20);
    
    this.ctx.fillStyle = this.colors.nitro;
    this.ctx.fillRect(padding, this.canvas.height - 50, (this.car.nitro / this.car.maxNitro) * 200, 20);
    
    this.ctx.strokeRect(padding, this.canvas.height - 50, 200, 20);
    
    this.ctx.fillText(`Nitro: ${Math.floor(this.car.nitro)}%`, padding, this.canvas.height - 55);

    // Timer
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 24px "Comic Sans MS"';
    this.ctx.fillText(`Time: ${this.gameTime.toFixed(1)}s`, this.canvas.width - padding, 40);
    
    // Best time
    if (this.bestTime < Infinity) {
      this.ctx.font = '16px "Comic Sans MS"';
      this.ctx.fillText(`Best: ${this.bestTime.toFixed(1)}s`, this.canvas.width - padding, 65);
    }

    this.ctx.textAlign = 'left';
  }
  
  stop() {
    super.stop();
    if (this.engineSoundInterval) {
      clearInterval(this.engineSoundInterval);
    }
    
    // Save best time
    if (this.gameTime < this.bestTime) {
      localStorage.setItem('racing-best-time', this.gameTime);
    }
  }
}
