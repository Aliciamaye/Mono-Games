# 📚 Mono Games Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Game Development](#game-development)
5. [API Reference](#api-reference)
6. [Security](#security)
7. [Contributing](#contributing)

---

## Introduction

**Mono Games** is a comprehensive cross-platform gaming platform featuring 50+ games, built with modern web technologies. The platform emphasizes:

- **Accessibility** - Play anywhere, on any device
- **Security** - Anti-cheat and encryption built-in
- **Performance** - Optimized for smooth gameplay
- **Design** - Beautiful cartoony hand-drawn aesthetic

### Key Statistics

- 🎮 **6+ Games** (15 core games planned)
- 👥 **Real-time leaderboards** via GitHub API
- ☁️ **Cloud saves** with Supabase
- 🔒 **Enterprise-grade security**
- 📱 **Cross-platform** (Web, Desktop, Mobile)

---

## Features

### 🎮 Gaming Features

1. **Diverse Game Library**
   - Classic arcade games (Snake, Tetris, Pong)
   - Puzzle games (2048, Memory Match)
   - Racing games (Turbo Racer with power-ups)
   - Strategy games (Chess, Checkers, Sudoku) - Coming soon

2. **Advanced Game Engine**
   - Custom BaseGame class for consistency
   - 60 FPS game loop
   - Particle systems for visual effects
   - Touch and keyboard controls
   - Save state management

3. **Audio System**
   - Background music support
   - Sound effects for all actions
   - Procedural audio generation
   - Volume controls and muting

4. **Social Features**
   - Global leaderboards
   - Achievement system
   - User profiles
   - Cloud save synchronization

### 🎨 User Interface

1. **Cartoony Design Language**
   - Warm color palette (Orange #FF6B35, Cream #FFF8DC)
   - Comic Sans and rounded fonts
   - Hand-drawn borders and doodles
   - Playful animations (bounce, wiggle, float)

2. **Responsive Layout**
   - Desktop-optimized (1920x1080)
   - Tablet support (768px+)
   - Mobile-friendly (320px+)
   - Touch gesture controls

3. **Accessibility**
   - High contrast colors
   - Keyboard navigation
   - Screen reader friendly
   - Adjustable text sizes

### 🔒 Security Features

1. **Authentication**
   - JWT token-based auth
   - bcrypt password hashing
   - Session management
   - OAuth2 integration (Google, GitHub, Discord)

2. **Anti-Cheat**
   - Score signature validation
   - Timestamp verification
   - Game-specific rule checking
   - Suspicious activity detection

3. **Data Protection**
   - AES-256 encryption for local storage
   - HTTPS everywhere
   - CSRF protection
   - Rate limiting
   - Input sanitization

---

## Installation

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Git

### Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/mono-games.git
cd mono-games
```

2. **Install dependencies:**
```bash
npm run install:all
```

3. **Set up environment variables:**
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your credentials
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - JWT_SECRET
# - ANTI_CHEAT_SECRET
```

4. **Start development servers:**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:server

# Or start both
npm run dev:all
```

5. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Build

```bash
# Build frontend
npm run build

# The built files will be in dist/ directory
```

### Desktop App (Windows)

```bash
# Build Electron app
npm run build:desktop

# Output in src/desktop/dist/
```

### Mobile App (Android)

```bash
# Build APK
npm run build:mobile

# Output in src/mobile/android/app/build/outputs/apk/
```

---

## Game Development

### BaseGame Class

All games extend the `BaseGame` class, which provides:

- Game loop management (60 FPS)
- Canvas setup and rendering
- Input handling (keyboard, mouse, touch)
- Score tracking with high scores
- Pause/resume functionality
- Anti-cheat integration

### Creating a New Game

#### Step 1: Create Game Directory

```bash
mkdir -p src/client/games/core/my-game
cd src/client/games/core/my-game
```

#### Step 2: Create Game Class (index.js)

```javascript
import BaseGame from '../../shared/framework/BaseGame.js';
import audioManager, { Sounds } from '../../../utils/audioManager.js';

export default class MyGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'my-game', 800, 600);
    
    // Initialize audio
    audioManager.init();
    
    // Game state
    this.player = {
      x: 400,
      y: 300,
      size: 20,
      speed: 5
    };
  }

  setup() {
    // Called once when game starts
    this.setupControls();
    Sounds.start();
  }

  setupControls() {
    // Keyboard
    this.addKeyHandler('ArrowLeft', () => this.player.x -= this.player.speed);
    this.addKeyHandler('ArrowRight', () => this.player.x += this.player.speed);
    this.addKeyHandler('ArrowUp', () => this.player.y -= this.player.speed);
    this.addKeyHandler('ArrowDown', () => this.player.y += this.player.speed);
    
    // Touch
    this.addTouchHandler('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.player.x = e.touches[0].clientX - rect.left;
      this.player.y = e.touches[0].clientY - rect.top;
    });
  }

  update(deltaTime) {
    // Called every frame (~60 FPS)
    // Update game logic here
    
    // Keep player in bounds
    this.player.x = Math.max(0, Math.min(this.canvas.width, this.player.x));
    this.player.y = Math.max(0, Math.min(this.canvas.height, this.player.y));
    
    // Update score
    this.score += 1;
  }

  render() {
    // Called every frame after update
    this.clearCanvas();
    
    // Draw background
    this.ctx.fillStyle = '#FFF8DC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw player
    this.ctx.fillStyle = '#FF6B35';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw score
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 24px "Comic Sans MS"';
    this.ctx.fillText(`Score: ${this.score}`, 20, 40);
  }
}
```

#### Step 3: Create Manifest (manifest.json)

```json
{
  "id": "my-game",
  "name": "My Awesome Game",
  "version": "1.0.0",
  "description": "An amazing game that does cool things!",
  "author": "Your Name",
  "category": "arcade",
  "tags": ["action", "arcade", "fun"],
  "thumbnail": "/games/my-game/thumb.png",
  "controls": {
    "keyboard": {
      "ArrowKeys": "Move player"
    },
    "touch": {
      "Touch": "Move to position"
    }
  },
  "features": [
    "Smooth controls",
    "Progressive difficulty",
    "High score tracking"
  ],
  "highScoreEnabled": true,
  "leaderboardEnabled": true,
  "achievementsEnabled": true,
  "size": "100KB",
  "core": true
}
```

#### Step 4: Register Game

Add to `src/client/services/gameStore.js`:

```javascript
const coreGames = [
  // ... existing games
  {
    id: 'my-game',
    name: 'My Awesome Game',
    category: 'arcade',
    size: 100 * 1024,
    core: true
  }
];
```

#### Step 5: Test Your Game

1. Restart dev server
2. Navigate to `/launcher`
3. Click on your game
4. Play and iterate!

### Game Development Best Practices

1. **Performance**
   - Keep update() logic efficient
   - Avoid creating objects in game loop
   - Use object pooling for particles
   - Profile with browser dev tools

2. **Audio**
   - Initialize audio after user interaction
   - Use Sounds helpers for common effects
   - Keep audio files small (<100KB)
   - Provide mute option

3. **Controls**
   - Support both keyboard and touch
   - Show control hints in-game
   - Make controls responsive and intuitive
   - Add haptic feedback for mobile

4. **Visuals**
   - Follow cartoony design language
   - Use rounded shapes and warm colors
   - Add particle effects for feedback
   - Animate transitions smoothly

5. **Anti-Cheat**
   - Never trust client-side scores
   - Use the built-in signature system
   - Validate on backend
   - Set reasonable score limits

---

## API Reference

### Authentication API

#### POST /api/auth/register

Register a new user.

**Request:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "player123",
      "email": "player@example.com"
    },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login

**Request:**
```json
{
  "email": "player@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

### Leaderboard API

#### GET /api/leaderboard/:gameId

Get leaderboard for a game.

**Query Parameters:**
- `limit` (optional): Number of entries (default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "snake",
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "username": "ProGamer",
        "score": 9999,
        "submittedAt": "2026-01-07T10:30:00Z"
      }
    ]
  }
}
```

#### POST /api/leaderboard/:gameId

Submit a score (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "score": 9999,
  "gameId": "snake",
  "timestamp": 1704623400000,
  "signature": "abc123def456",
  "duration": 120000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "score": 9999,
    "isNewBest": true,
    "previousBest": 8000
  }
}
```

### Cloud Saves API

#### GET /api/saves/:gameId

Download save data (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "save": {
      "saveData": { "level": 5, "coins": 100 },
      "updatedAt": "2026-01-07T10:30:00Z"
    }
  }
}
```

#### POST /api/saves/:gameId

Upload save data (requires authentication).

**Request:**
```json
{
  "saveData": {
    "level": 5,
    "coins": 100,
    "upgrades": ["speed", "shield"]
  }
}
```

---

## Security

### Anti-Cheat System

Every score submission is validated:

1. **Signature Validation**
   - Scores are signed using HMAC-SHA256
   - Includes userId, gameId, score, and timestamp
   - Verified on backend

2. **Timestamp Validation**
   - Scores can't be from the future
   - Max age: 24 hours
   - Prevents replay attacks

3. **Game-Specific Rules**
   - Max score limits per game
   - Minimum time requirements
   - Score progression validation

4. **Suspicious Activity Detection**
   - Too many high scores
   - Impossible score jumps
   - Identical scores

### Data Encryption

- **Local Storage**: AES-256 encryption
- **Transport**: HTTPS/TLS 1.3
- **Database**: Encrypted at rest
- **Passwords**: bcrypt (cost factor 10)

### Rate Limiting

- **API Endpoints**: 100 requests per 15 minutes
- **Login Attempts**: 5 per hour per IP
- **Score Submissions**: 10 per minute

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Quick start:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Happy Gaming! 🎮**
