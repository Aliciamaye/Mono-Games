# Mono Games - Development Guide

## 🎮 What We've Built

A comprehensive cross-platform gaming platform with:
- **Frontend**: React 18 + Vite 5 with cartoony classic UI
- **Backend**: Express.js REST API with Supabase
- **Security**: Anti-cheat, encryption, JWT authentication
- **Games**: Snake, Tetris, 2048, Pong, Memory Match (5 playable games so far!)

## 🚀 Quick Start

### Start Frontend (Development)
```bash
cd src/client
npm run dev
```
Visit: http://localhost:5173

### Start Backend (API Server)
```bash
cd src/server
node server.js
```
API runs on: http://localhost:5000

## 📁 Project Structure

```
mono-games/
├── src/
│   ├── client/          # React frontend
│   │   ├── games/
│   │   │   ├── core/    # Pre-installed games
│   │   │   │   ├── snake/
│   │   │   │   ├── tetris/
│   │   │   │   ├── 2048/
│   │   │   │   ├── pong/
│   │   │   │   └── memory-match/
│   │   │   └── shared/framework/  # BaseGame class
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand state
│   │   ├── services/    # API & game management
│   │   ├── utils/       # Security utilities
│   │   └── styles/      # CSS (cartoony theme!)
│   │
│   └── server/          # Express backend
│       ├── routes/      # API endpoints
│       ├── middleware/  # Auth, validation, errors
│       ├── services/    # Anti-cheat service
│       ├── utils/       # Database helpers
│       └── database/    # SQL schema
│
├── config/              # Vite config
├── public/              # Static assets
└── scripts/             # Start scripts
```

## 🎨 UI Theme

**Style**: Cartoony Classic
- **Colors**: Warm orange (#FF6B35), cream (#FFF8DC), friendly teal (#41EAD4)
- **Fonts**: Comic Sans MS, Segoe UI (rounded, friendly)
- **Design**: Rounded borders (12-32px), playful animations, speech bubbles
- **No**: Neon, futuristic, dark themes

## 🎯 Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout

### Games
- `GET /api/games` - Get all games
- `GET /api/games/:gameId` - Get game details
- `GET /api/games/:gameId/download` - Download game

### Leaderboard
- `GET /api/leaderboard/:gameId` - Get leaderboard
- `POST /api/leaderboard/:gameId` - Submit score (requires auth)
- `GET /api/leaderboard/:gameId/position/:userId` - Get user rank

### User
- `GET /api/user/profile` - Get profile (requires auth)
- `PUT /api/user/profile` - Update profile (requires auth)
- `GET /api/user/:userId/stats` - Get user stats

### Achievements
- `GET /api/achievements/:userId` - Get user achievements
- `POST /api/achievements/:achievementId/unlock` - Unlock achievement (requires auth)

### Cloud Saves
- `GET /api/saves/:gameId` - Get save (requires auth)
- `POST /api/saves/:gameId` - Upload save (requires auth)
- `DELETE /api/saves/:gameId` - Delete save (requires auth)

## 🔒 Security Features

### Anti-Cheat System
- Score signature validation (HMAC-SHA256)
- Timestamp verification (prevent replay attacks)
- Game-specific score validation rules
- Suspicious activity detection

### Encryption
- AES-256 for local data encryption
- SHA-256 for file integrity checks
- JWT for authentication
- bcrypt for password hashing

## 🎮 Creating a New Game

1. Create game folder: `src/client/games/core/your-game/`

2. Create `index.js`:
```javascript
import BaseGame from '../../shared/framework/BaseGame.js';

export default class YourGame extends BaseGame {
  constructor(containerId) {
    super(containerId, 'your-game', width, height);
  }

  setup() {
    // Initialize game
  }

  update(deltaTime) {
    // Game logic (60 FPS)
  }

  render() {
    // Draw to canvas
  }
}
```

3. Create `manifest.json`:
```json
{
  "id": "your-game",
  "name": "Your Game",
  "version": "1.0.0",
  "description": "Game description",
  "category": "arcade",
  "core": true
}
```

4. Add to game list in `src/client/services/gameStore.js`

## 🗄️ Database Setup

### Supabase Configuration

1. Create a Supabase project
2. Run the SQL schema from `src/server/database/schema.sql`
3. Add credentials to `.env`:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
ANTI_CHEAT_SECRET=your-anti-cheat-secret
```

### Database Tables
- `users` - User accounts
- `games` - Game metadata
- `scores` - Leaderboard scores
- `achievements` - Achievement definitions
- `user_achievements` - User achievement progress
- `game_saves` - Cloud save data
- `user_stats` - User statistics

## 📝 TODO

### Remaining Core Games (10 more)
- [ ] Breakout
- [ ] Space Invaders
- [ ] Flappy Bird
- [ ] Typing Test
- [ ] Tic-Tac-Toe
- [ ] Connect Four
- [ ] Minesweeper
- [ ] Sudoku
- [ ] Chess
- [ ] Checkers

### Features
- [ ] Convert JSX to TSX (TypeScript)
- [ ] Update all components to use cartoony theme classes
- [ ] Achievement system implementation
- [ ] User profile page with stats
- [ ] Cloud save synchronization
- [ ] Game download system
- [ ] Electron desktop app wrapper
- [ ] Capacitor Android app wrapper

### UI Updates
- [ ] Replace all `retro-*` class names with `cartoony-*`
- [ ] Add game thumbnails
- [ ] Create 404 page design
- [ ] Settings page implementation
- [ ] Profile page design

## 🧪 Testing

### Test Accounts
Create test users via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'
```

### Test Score Submission
```bash
curl -X POST http://localhost:5000/api/leaderboard/snake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"score":1000,"gameId":"snake","timestamp":1234567890,"signature":"..."}'
```

## 🚢 Deployment (Future)

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway)
```bash
railway login
railway init
railway up
```

## 💡 Tips

1. **Game Development**: Use BaseGame class methods:
   - `this.addKeyHandler(key, callback)` for keyboard
   - `this.addTouchHandler(event, callback)` for touch
   - `this.clearCanvas()` before rendering
   - `this.endGame(message)` when game ends

2. **State Management**: Use Zustand stores:
   - `authStore` for user auth
   - `settingsStore` for app settings
   - `gameStore` for installed games

3. **API Calls**: Use the configured axios instance:
   ```javascript
   import api from '../services/api';
   const response = await api.get('/games');
   ```

4. **Security**: Always validate scores on backend with anti-cheat service

## 🐛 Known Issues

- None yet! (Keep this updated)

## 📞 Support

- Check console for errors (F12)
- Backend logs in terminal
- Frontend HMR updates automatically

---

**Quality First**: Everything is well-made, not rushed!
