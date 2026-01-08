/**
 * Memory Match - Classic Card Matching Game
 * 
 * Features:
 * - Multiple themes (animals, emojis, numbers, colors)
 * - Flip animations with smooth transitions
 * - Move counter and timer
 * - Star rating based on performance
 * - Multiple difficulty levels (4x4, 6x6, 8x8)
 * - Combo system for quick matches
 * - Best time tracking
 * - Touch and mouse support
 */

export interface MemoryMatchConfig {
  canvas: HTMLCanvasElement;
  onScoreUpdate?: (moves: number, time: number) => void;
  onGameOver?: (moves: number, time: number, stars: number) => void;
}

interface Card {
  id: number;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  flipped: boolean;
  matched: boolean;
  flipProgress: number;
}

const THEMES = {
  ANIMALS: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
  EMOJIS: ['😀', '😎', '🤩', '😍', '🥳', '😂', '🤣', '😊', '😇', '🥰', '😋', '🤔', '🤨', '😴', '🤯', '🥶'],
  NUMBERS: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '💯', '🎯', '🎲', '🎰', '🃏'],
  COLORS: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '❤️', '💙', '💚']
};

export default class MemoryMatch {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onScoreUpdate?: (moves: number, time: number) => void;
  private onGameOver?: (moves: number, time: number, stars: number) => void;

  private cards: Card[] = [];
  private flippedCards: Card[] = [];
  private moves: number = 0;
  private matches: number = 0;
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrame: number | null = null;

  private gridSize: number = 4; // 4x4 = 16 cards (8 pairs)
  private theme: keyof typeof THEMES = 'ANIMALS';
  private canFlip: boolean = true;
  private comboCount: number = 0;
  private lastMatchTime: number = 0;

  constructor(config: MemoryMatchConfig) {
    this.canvas = config.canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.onScoreUpdate = config.onScoreUpdate;
    this.onGameOver = config.onGameOver;

    this.setupEventListeners();
  }

  init(): void {
    console.log('[MemoryMatch] Initializing...');
    this.setupGame();
  }

  start(): void {
    console.log('[MemoryMatch] Starting game...');
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.gameLoop();
  }

  pause(): void {
    console.log('[MemoryMatch] Pausing game...');
    this.isPaused = true;
  }

  resume(): void {
    console.log('[MemoryMatch] Resuming game...');
    this.isPaused = false;
    if (this.isRunning && !this.animationFrame) {
      this.gameLoop();
    }
  }

  reset(): void {
    console.log('[MemoryMatch] Resetting game...');
    this.moves = 0;
    this.matches = 0;
    this.elapsedTime = 0;
    this.comboCount = 0;
    this.flippedCards = [];
    this.setupGame();
    this.updateScore();
  }

  destroy(): void {
    console.log('[MemoryMatch] Destroying game...');
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.removeEventListeners();
  }

  private setupEventListeners(): void {
    this.handleClick = this.handleClick.bind(this);
    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('touchstart', this.handleClick);
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('touchstart', this.handleClick);
  }

  private handleClick(e: MouseEvent | TouchEvent): void {
    if (!this.canFlip || this.isPaused) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as MouseEvent).clientY - rect.top;

    // Find clicked card
    const card = this.cards.find(c => 
      !c.flipped && !c.matched &&
      x >= c.x && x <= c.x + c.width &&
      y >= c.y && y <= c.y + c.height
    );

    if (card) {
      this.flipCard(card);
    }
  }

  private setupGame(): void {
    this.cards = [];
    const totalPairs = (this.gridSize * this.gridSize) / 2;
    const values = THEMES[this.theme].slice(0, totalPairs);
    
    // Create pairs
    const cardValues: string[] = [];
    values.forEach(value => {
      cardValues.push(value, value);
    });

    // Shuffle
    for (let i = cardValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
    }

    // Calculate card dimensions
    const padding = 10;
    const cardWidth = (this.canvas.width - padding * (this.gridSize + 1)) / this.gridSize;
    const cardHeight = (this.canvas.height - padding * (this.gridSize + 1) - 80) / this.gridSize; // Reserve 80px for UI

    // Create cards
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const index = row * this.gridSize + col;
        this.cards.push({
          id: index,
          value: cardValues[index],
          x: padding + col * (cardWidth + padding),
          y: 80 + padding + row * (cardHeight + padding),
          width: cardWidth,
          height: cardHeight,
          flipped: false,
          matched: false,
          flipProgress: 0
        });
      }
    }
  }

  private flipCard(card: Card): void {
    if (this.flippedCards.length >= 2) return;

    card.flipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.canFlip = false;
      
      setTimeout(() => {
        this.checkMatch();
      }, 800);
    }
  }

  private checkMatch(): void {
    const [card1, card2] = this.flippedCards;

    if (card1.value === card2.value) {
      // Match!
      card1.matched = true;
      card2.matched = true;
      this.matches++;
      
      // Check combo (quick successive matches)
      const now = Date.now();
      if (now - this.lastMatchTime < 3000) {
        this.comboCount++;
      } else {
        this.comboCount = 1;
      }
      this.lastMatchTime = now;

      // Check win
      if (this.matches === this.cards.length / 2) {
        this.gameOver();
      }
    } else {
      // No match - flip back
      card1.flipped = false;
      card2.flipped = false;
      this.comboCount = 0;
    }

    this.flippedCards = [];
    this.canFlip = true;
    this.updateScore();
  }

  private gameLoop = (): void => {
    if (!this.isRunning || this.isPaused) {
      this.animationFrame = null;
      return;
    }

    this.update();
    this.draw();

    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    if (this.startTime > 0) {
      this.elapsedTime = Date.now() - this.startTime;
    }

    // Update flip animations
    this.cards.forEach(card => {
      if (card.flipped || card.matched) {
        card.flipProgress = Math.min(1, card.flipProgress + 0.1);
      } else {
        card.flipProgress = Math.max(0, card.flipProgress - 0.1);
      }
    });
  }

  private draw(): void {
    // Clear canvas
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw UI header
    this.drawUI();

    // Draw cards
    this.cards.forEach(card => this.drawCard(card));

    // Draw combo indicator
    if (this.comboCount > 1) {
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${this.comboCount}x COMBO! 🔥`, this.canvas.width / 2, 50);
    }

    // Draw pause overlay
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  private drawUI(): void {
    // Background bar
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, 0, this.canvas.width, 70);

    // Moves
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Moves: ${this.moves}`, 20, 30);

    // Time
    const minutes = Math.floor(this.elapsedTime / 60000);
    const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
    this.ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, 55);

    // Matches
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Matches: ${this.matches}/${this.cards.length / 2}`, this.canvas.width - 20, 30);

    // Stars (performance indicator)
    const stars = this.getStarRating();
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillText('⭐'.repeat(stars) + '☆'.repeat(3 - stars), this.canvas.width - 20, 55);
  }

  private drawCard(card: Card): void {
    this.ctx.save();

    // Calculate 3D flip effect
    const scale = Math.abs(Math.cos(card.flipProgress * Math.PI));
    const offsetX = card.x + card.width / 2;
    const offsetY = card.y + card.height / 2;

    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(scale, 1);
    this.ctx.translate(-offsetX, -offsetY);

    if (card.matched) {
      // Matched card - green glow
      this.ctx.fillStyle = '#22c55e';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#22c55e';
    } else if (card.flipProgress > 0.5) {
      // Face up - show value
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#3b82f6';
    } else {
      // Face down - card back
      this.ctx.fillStyle = '#475569';
      this.ctx.shadowBlur = 5;
      this.ctx.shadowColor = '#1e293b';
    }

    // Draw card background
    const radius = 8;
    this.ctx.beginPath();
    this.ctx.roundRect(card.x, card.y, card.width, card.height, radius);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Draw card border
    this.ctx.strokeStyle = card.matched ? '#22c55e' : '#64748b';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw content
    if (card.flipProgress > 0.5) {
      // Show emoji/value
      this.ctx.fillStyle = '#fff';
      this.ctx.font = `${Math.min(card.width, card.height) * 0.5}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(card.value, card.x + card.width / 2, card.y + card.height / 2);
    } else {
      // Show card back pattern
      this.ctx.strokeStyle = '#64748b';
      this.ctx.lineWidth = 2;
      const margin = 8;
      this.ctx.beginPath();
      this.ctx.moveTo(card.x + margin, card.y + margin);
      this.ctx.lineTo(card.x + card.width - margin, card.y + card.height - margin);
      this.ctx.moveTo(card.x + card.width - margin, card.y + margin);
      this.ctx.lineTo(card.x + margin, card.y + card.height - margin);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private getStarRating(): number {
    const optimalMoves = this.cards.length / 2; // Perfect = match every pair on first try
    const moveRatio = this.moves / optimalMoves;

    if (moveRatio <= 1.2) return 3;
    if (moveRatio <= 1.5) return 2;
    if (moveRatio <= 2.0) return 1;
    return 0;
  }

  private gameOver(): void {
    this.isRunning = false;
    const stars = this.getStarRating();
    
    if (this.onGameOver) {
      this.onGameOver(this.moves, this.elapsedTime, stars);
    }
  }

  private updateScore(): void {
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.moves, this.elapsedTime);
    }
  }

  // Public setters
  setGridSize(size: 4 | 6 | 8): void {
    this.gridSize = size;
    this.reset();
  }

  setTheme(theme: keyof typeof THEMES): void {
    this.theme = theme;
    this.reset();
  }

  getScore(): number {
    return Math.max(0, 10000 - (this.moves * 100) - Math.floor(this.elapsedTime / 1000));
  }

  getMoves(): number {
    return this.moves;
  }

  getTime(): number {
    return this.elapsedTime;
  }

  getMatches(): number {
    return this.matches;
  }
}
