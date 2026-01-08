// Kart Racing Game - Mario Kart Style with Power-ups and Drifting
export default class KartRacing {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Player kart
  private kartX: number = 400;
  private kartY: number = 500;
  private kartSpeed: number = 0;
  private kartAngle: number = 0;
  private kartMaxSpeed: number = 8;
  private acceleration: number = 0.2;
  private friction: number = 0.95;
  
  // Drifting
  private isDrifting: boolean = false;
  private driftDirection: number = 0;
  private driftPower: number = 0;
  private boostPower: number = 0;
  
  // Track
  private trackSegments: TrackSegment[] = [];
  private cameraY: number = 0;
  private lapProgress: number = 0;
  private currentLap: number = 1;
  private totalLaps: number = 3;
  
  // Power-ups
  private powerUp: PowerUpType | null = null;
  private powerUpBoxes: PowerUpBox[] = [];
  
  // Opponents
  private opponents: Opponent[] = [];
  
  // Controls
  private keys: { [key: string]: boolean } = {};
  
  // Callbacks
  public onScoreUpdate?: (score: number) => void;
  public onGameOver?: (finalScore: number) => void;
  public onLevelComplete?: (level: number) => void;
  
  private score: number = 0;
  private highScore: number = 0;
  private raceTime: number = 0;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');

    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not found');
    this.ctx = ctx;

    this.loadHighScore();
    this.setupInput();
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Space for drift
      if (e.key === ' ') {
        this.isDrifting = true;
        if (this.keys['arrowleft'] || this.keys['a']) this.driftDirection = -1;
        else if (this.keys['arrowright'] || this.keys['d']) this.driftDirection = 1;
      }
      
      // Power-up activation
      if (e.key === 'shift' && this.powerUp) {
        this.usePowerUp();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      
      if (e.key === ' ') {
        // Release drift boost
        if (this.driftPower > 20) {
          this.boostPower = Math.min(this.driftPower / 10, 3);
        }
        this.isDrifting = false;
        this.driftPower = 0;
        this.driftDirection = 0;
      }
    });
  }

  setup(): void {
    this.isRunning = true;
    this.isPaused = false;
    this.generateTrack();
    this.spawnOpponents();
    this.spawnPowerUpBoxes();
    this.raceTime = 0;
    this.currentLap = 1;
    this.lapProgress = 0;
  }

  private generateTrack(): void {
    this.trackSegments = [];
    const segmentLength = 100;
    const totalSegments = 50;
    
    for (let i = 0; i < totalSegments; i++) {
      const curve = Math.sin(i * 0.3) * 100;
      this.trackSegments.push({
        y: i * segmentLength,
        centerX: 400 + curve,
        width: 300,
        color: i % 2 === 0 ? '#555555' : '#666666'
      });
    }
  }

  private spawnOpponents(): void {
    this.opponents = [];
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00'];
    
    for (let i = 0; i < 4; i++) {
      this.opponents.push({
        x: 350 + i * 25,
        y: 400 - i * 100,
        speed: 5 + Math.random() * 2,
        color: colors[i],
        lapProgress: 0
      });
    }
  }

  private spawnPowerUpBoxes(): void {
    this.powerUpBoxes = [];
    
    for (let i = 5; i < this.trackSegments.length; i += 10) {
      const segment = this.trackSegments[i];
      this.powerUpBoxes.push({
        x: segment.centerX + (Math.random() - 0.5) * 200,
        y: segment.y,
        type: this.randomPowerUp(),
        collected: false
      });
    }
  }

  private randomPowerUp(): PowerUpType {
    const types: PowerUpType[] = ['mushroom', 'star', 'banana', 'shell'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private usePowerUp(): void {
    if (!this.powerUp) return;
    
    switch (this.powerUp) {
      case 'mushroom':
        this.boostPower = 5;
        break;
      case 'star':
        this.kartMaxSpeed = 12;
        setTimeout(() => this.kartMaxSpeed = 8, 3000);
        break;
      case 'banana':
        // Drop banana behind (simplified)
        break;
      case 'shell':
        // Hit nearest opponent ahead (simplified)
        if (this.opponents.length > 0) {
          this.opponents[0].speed *= 0.5;
          setTimeout(() => this.opponents[0].speed *= 2, 2000);
        }
        break;
    }
    
    this.powerUp = null;
  }

  update(deltaTime: number): void {
    if (!this.isRunning || this.isPaused) return;
    
    this.raceTime += deltaTime;
    
    // Player movement
    if (this.keys['arrowup'] || this.keys['w']) {
      this.kartSpeed = Math.min(this.kartSpeed + this.acceleration, this.kartMaxSpeed);
    } else {
      this.kartSpeed *= this.friction;
    }
    
    if (this.keys['arrowdown'] || this.keys['s']) {
      this.kartSpeed = Math.max(this.kartSpeed - this.acceleration * 2, -this.kartMaxSpeed / 2);
    }
    
    // Apply boost
    if (this.boostPower > 0) {
      this.kartSpeed += this.boostPower;
      this.boostPower *= 0.95;
      if (this.boostPower < 0.1) this.boostPower = 0;
    }
    
    // Steering
    const turnSpeed = this.isDrifting ? 0.05 : 0.03;
    if (this.keys['arrowleft'] || this.keys['a']) {
      this.kartAngle -= turnSpeed * Math.abs(this.kartSpeed);
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      this.kartAngle += turnSpeed * Math.abs(this.kartSpeed);
    }
    
    // Drift power build-up
    if (this.isDrifting && Math.abs(this.kartSpeed) > 3) {
      this.driftPower = Math.min(this.driftPower + 1, 60);
    }
    
    // Move kart
    const dx = Math.sin(this.kartAngle) * this.kartSpeed;
    const dy = -Math.cos(this.kartAngle) * this.kartSpeed;
    this.kartX += dx;
    this.kartY += dy;
    
    // Track bounds (keep kart centered, move camera)
    this.cameraY += dy;
    
    // Get current track segment
    const currentSegmentIndex = Math.floor(this.cameraY / 100);
    const currentSegment = this.trackSegments[currentSegmentIndex % this.trackSegments.length];
    
    if (currentSegment) {
      const distFromCenter = Math.abs(this.kartX - currentSegment.centerX);
      if (distFromCenter > currentSegment.width / 2) {
        // Slow down on grass
        this.kartSpeed *= 0.8;
      }
    }
    
    // Lap progress
    this.lapProgress = (this.cameraY / (this.trackSegments.length * 100)) % 1;
    if (this.lapProgress < 0.1 && this.lapProgress > -0.1 && this.cameraY > 100) {
      const oldLap = this.currentLap;
      this.currentLap = Math.floor(this.cameraY / (this.trackSegments.length * 100)) + 1;
      
      if (this.currentLap > oldLap && this.currentLap <= this.totalLaps) {
        this.score += 1000;
        this.onScoreUpdate?.(this.score);
      }
      
      if (this.currentLap > this.totalLaps) {
        this.finishRace();
      }
    }
    
    // Check power-up collection
    for (const box of this.powerUpBoxes) {
      if (!box.collected) {
        const dx = this.kartX - box.x;
        const dy = (this.cameraY) - box.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
          box.collected = true;
          this.powerUp = box.type;
          this.score += 50;
          this.onScoreUpdate?.(this.score);
        }
      }
    }
    
    // Update opponents
    for (const opp of this.opponents) {
      opp.y += opp.speed;
      opp.lapProgress = (opp.y / (this.trackSegments.length * 100)) % 1;
      
      // Simple AI: follow track center
      const oppSegmentIndex = Math.floor(opp.y / 100);
      const oppSegment = this.trackSegments[oppSegmentIndex % this.trackSegments.length];
      if (oppSegment) {
        opp.x += (oppSegment.centerX - opp.x) * 0.05;
      }
    }
  }

  render(): void {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Sky
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, 300);
    
    // Ground
    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillRect(0, 300, this.canvas.width, 300);
    
    // Draw track segments (pseudo-3D)
    for (let i = 0; i < 20; i++) {
      const segmentIndex = Math.floor(this.cameraY / 100) + i;
      const segment = this.trackSegments[segmentIndex % this.trackSegments.length];
      
      if (!segment) continue;
      
      const relativeY = segment.y - this.cameraY;
      const scale = 1 / (1 + relativeY / 1000);
      const screenY = 300 + (relativeY * scale * 0.3);
      const screenWidth = segment.width * scale;
      const screenX = segment.centerX - screenWidth / 2;
      
      if (screenY > 0 && screenY < 600) {
        // Track
        this.ctx.fillStyle = segment.color;
        this.ctx.fillRect(screenX, screenY, screenWidth, 20 * scale);
        
        // Track edges
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(screenX, screenY, 5 * scale, 20 * scale);
        this.ctx.fillRect(screenX + screenWidth - 5 * scale, screenY, 5 * scale, 20 * scale);
      }
    }
    
    // Draw power-up boxes
    for (const box of this.powerUpBoxes) {
      if (box.collected) continue;
      
      const relativeY = box.y - this.cameraY;
      const scale = 1 / (1 + relativeY / 1000);
      const screenY = 300 + (relativeY * scale * 0.3);
      const screenX = box.x;
      
      if (screenY > 0 && screenY < 600 && scale > 0.3) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(screenX - 15 * scale, screenY - 15 * scale, 30 * scale, 30 * scale);
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${20 * scale}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('?', screenX, screenY + 8 * scale);
      }
    }
    
    // Draw opponents
    for (const opp of this.opponents) {
      const relativeY = opp.y - this.cameraY;
      const scale = 1 / (1 + relativeY / 1000);
      const screenY = 300 + (relativeY * scale * 0.3);
      const screenX = opp.x;
      
      if (screenY > 0 && screenY < 600 && scale > 0.3) {
        this.ctx.fillStyle = opp.color;
        this.ctx.fillRect(screenX - 20 * scale, screenY - 30 * scale, 40 * scale, 50 * scale);
      }
    }
    
    // Draw player kart
    this.ctx.save();
    this.ctx.translate(this.kartX, this.kartY);
    this.ctx.rotate(this.kartAngle);
    
    // Kart body
    this.ctx.fillStyle = '#FF0000';
    this.ctx.fillRect(-20, -30, 40, 50);
    
    // Wheels
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(-25, -20, 10, 15);
    this.ctx.fillRect(15, -20, 10, 15);
    this.ctx.fillRect(-25, 5, 10, 15);
    this.ctx.fillRect(15, 5, 10, 15);
    
    // Drift smoke
    if (this.isDrifting) {
      this.ctx.fillStyle = `rgba(200, 200, 200, ${Math.min(this.driftPower / 60, 0.8)})`;
      this.ctx.beginPath();
      this.ctx.arc(-this.driftDirection * 20, 30, 15, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
    
    // UI
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Lap: ${this.currentLap}/${this.totalLaps}`, 20, 40);
    this.ctx.fillText(`Speed: ${Math.floor(Math.abs(this.kartSpeed) * 10)}`, 20, 70);
    this.ctx.fillText(`Score: ${this.score}`, 20, 100);
    this.ctx.fillText(`Time: ${(this.raceTime / 1000).toFixed(1)}s`, 20, 130);
    
    // Power-up indicator
    if (this.powerUp) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillRect(700, 20, 80, 80);
      this.ctx.fillStyle = '#000000';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.powerUp.toUpperCase(), 740, 50);
      this.ctx.font = '12px Arial';
      this.ctx.fillText('(SHIFT)', 740, 85);
    }
    
    // Drift meter
    if (this.isDrifting) {
      const meterWidth = 200;
      const meterHeight = 20;
      const meterX = 300;
      const meterY = 550;
      
      this.ctx.fillStyle = '#444444';
      this.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
      
      const driftPercent = this.driftPower / 60;
      const color = driftPercent < 0.33 ? '#4444FF' : driftPercent < 0.66 ? '#FFAA00' : '#FF00FF';
      this.ctx.fillStyle = color;
      this.ctx.fillRect(meterX, meterY, meterWidth * driftPercent, meterHeight);
      
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('DRIFT BOOST', 400, 545);
    }
  }

  private finishRace(): void {
    this.isRunning = false;
    const finalScore = this.score + Math.floor(10000 / (this.raceTime / 1000));
    
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      this.saveHighScore();
    }
    
    this.onGameOver?.(finalScore);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  restart(): void {
    this.kartX = 400;
    this.kartY = 500;
    this.kartSpeed = 0;
    this.kartAngle = 0;
    this.cameraY = 0;
    this.score = 0;
    this.currentLap = 1;
    this.powerUp = null;
    this.setup();
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('kartracing_highscore');
    this.highScore = saved ? parseInt(saved, 10) : 0;
  }

  private saveHighScore(): void {
    localStorage.setItem('kartracing_highscore', this.highScore.toString());
  }

  destroy(): void {
    this.isRunning = false;
    this.canvas.remove();
  }

  setOnScoreUpdate(callback: (score: number) => void): void {
    this.onScoreUpdate = callback;
  }

  setOnGameOver(callback: (finalScore: number) => void): void {
    this.onGameOver = callback;
  }

  setOnLevelComplete(callback: (level: number) => void): void {
    this.onLevelComplete = callback;
  }
}

interface TrackSegment {
  y: number;
  centerX: number;
  width: number;
  color: string;
}

type PowerUpType = 'mushroom' | 'star' | 'banana' | 'shell';

interface PowerUpBox {
  x: number;
  y: number;
  type: PowerUpType;
  collected: boolean;
}

interface Opponent {
  x: number;
  y: number;
  speed: number;
  color: string;
  lapProgress: number;
}
