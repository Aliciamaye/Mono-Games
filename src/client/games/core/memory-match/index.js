import BaseGame from '../../shared/framework/BaseGame.js';

export default class MemoryMatch extends BaseGame {
  constructor(containerId) {
    super(containerId, 'memory-match', 800, 600);
    
    this.gridRows = 4;
    this.gridCols = 4;
    this.cardWidth = 120;
    this.cardHeight = 160;
    this.cardPadding = 20;
    
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.canFlip = true;
    
    // Emojis for cards
    this.symbols = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'];
    
    // Colors
    this.cardBackColor = '#FF6B35';
    this.cardFrontColor = '#FFF8DC';
  }

  setup() {
    // Create card pairs
    const cardSymbols = [...this.symbols, ...this.symbols]; // Duplicate for pairs
    this.shuffle(cardSymbols);
    
    // Initialize cards
    const startX = (this.canvas.width - (this.gridCols * (this.cardWidth + this.cardPadding))) / 2;
    const startY = 100;
    
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const index = row * this.gridCols + col;
        this.cards.push({
          x: startX + col * (this.cardWidth + this.cardPadding),
          y: startY + row * (this.cardHeight + this.cardPadding),
          width: this.cardWidth,
          height: this.cardHeight,
          symbol: cardSymbols[index],
          flipped: false,
          matched: false
        });
      }
    }
    
    // Setup controls
    this.setupControls();
  }

  setupControls() {
    this.canvas.addEventListener('click', (e) => {
      if (!this.canFlip) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.handleClick(x, y);
    });
  }

  handleClick(x, y) {
    // Find clicked card
    for (const card of this.cards) {
      if (
        x >= card.x && x <= card.x + card.width &&
        y >= card.y && y <= card.y + card.height &&
        !card.flipped && !card.matched
      ) {
        this.flipCard(card);
        break;
      }
    }
  }

  flipCard(card) {
    if (this.flippedCards.length >= 2) return;
    
    card.flipped = true;
    this.flippedCards.push(card);
    
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.canFlip = false;
      
      setTimeout(() => {
        this.checkMatch();
      }, 1000);
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;
    
    if (card1.symbol === card2.symbol) {
      // Match!
      card1.matched = true;
      card2.matched = true;
      this.matchedPairs++;
      this.score += 100;
      
      if (this.matchedPairs === this.symbols.length) {
        this.endGame('You Win! Moves: ' + this.moves);
      }
    } else {
      // No match
      card1.flipped = false;
      card2.flipped = false;
    }
    
    this.flippedCards = [];
    this.canFlip = true;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  update(deltaTime) {
    // No continuous updates needed
  }

  render() {
    this.clearCanvas();
    
    // Background
    this.ctx.fillStyle = '#FFF8DC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw cards
    for (const card of this.cards) {
      if (card.matched) {
        // Matched cards fade out
        this.ctx.globalAlpha = 0.3;
      }
      
      if (card.flipped || card.matched) {
        // Front (show symbol)
        this.ctx.fillStyle = this.cardFrontColor;
        this.ctx.strokeStyle = '#FFB347';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.roundRect(card.x, card.y, card.width, card.height, 12);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Symbol
        this.ctx.font = '72px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
          card.symbol,
          card.x + card.width / 2,
          card.y + card.height / 2
        );
      } else {
        // Back (hidden)
        this.ctx.fillStyle = this.cardBackColor;
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.roundRect(card.x, card.y, card.width, card.height, 12);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Pattern
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const offset = i * 20 + 10;
          this.ctx.beginPath();
          this.ctx.moveTo(card.x + offset, card.y);
          this.ctx.lineTo(card.x, card.y + offset);
          this.ctx.stroke();
          
          this.ctx.beginPath();
          this.ctx.moveTo(card.x + card.width - offset, card.y + card.height);
          this.ctx.lineTo(card.x + card.width, card.y + card.height - offset);
          this.ctx.stroke();
        }
      }
      
      this.ctx.globalAlpha = 1.0;
    }
    
    // Draw UI
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 32px "Comic Sans MS"';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Moves: ${this.moves}`, 20, 40);
    this.ctx.fillText(`Pairs: ${this.matchedPairs}/${this.symbols.length}`, 20, 80);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 20, 40);
  }
}
