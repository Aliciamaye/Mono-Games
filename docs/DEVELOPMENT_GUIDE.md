# 🛠️ Development Guide
**Mono Games - Setup & Development Workflow**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- Code editor (VS Code recommended)
- Redis (optional - will fallback to in-memory)

### Initial Setup
```bash
# Clone repository
git clone https://github.com/your-username/mono-games.git
cd mono-games

# Install root dependencies
npm install

# Install server dependencies
cd src/server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ../..
```

### Environment Setup

**src/server/.env:**
```env
NODE_ENV=development
PORT=5000

# Supabase (get free account at supabase.com)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis (optional)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
FRONTEND_URL=http://localhost:3000
```

**src/client/.env:**
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🏃 Running Development Servers

### Start Backend
```bash
# Option 1: Using npm script (from root)
npm run start:backend

# Option 2: Direct command
cd src/server
npm run dev

# Backend will run on: http://localhost:5000
# WebSocket on: ws://localhost:5000/ws
```

### Start Frontend
```bash
# Option 1: Using npm script (from root)
npm run start:frontend

# Option 2: Direct command
cd src/client
npm run dev

# Frontend will run on: http://localhost:3000 or http://localhost:5173
```

### Start Both (Recommended)
```bash
# Windows
.\scripts\start-frontend.bat
.\scripts\start-backend.bat

# Or manually in 2 terminals:
# Terminal 1
cd src/server && npm run dev

# Terminal 2
cd src/client && npm run dev
```

---

## 📁 Project Structure

```
mono-games/
├── src/
│   ├── client/                 # Frontend (React + Vite)
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── games/             # Game implementations
│   │   │   ├── core/          # Built-in games (Tetris, Snake, etc.)
│   │   │   ├── downloadable/  # Premium games (Poker, Kart)
│   │   │   └── shared/        # Shared game utilities
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API clients, game services
│   │   ├── store/             # Zustand state management
│   │   ├── styles/            # Global styles
│   │   └── utils/             # Helper functions
│   │
│   └── server/                # Backend (Node.js + Express)
│       ├── routes/            # API routes
│       ├── services/          # Business logic
│       │   ├── antiCheat.js   # Score validation
│       │   ├── realtimeManager.js  # WebSocket
│       │   └── redisService.js     # Caching
│       ├── middleware/        # Express middleware
│       ├── utils/             # Utilities
│       └── database/          # Database schemas
│
├── docs/                      # Documentation
├── public/                    # Static assets
└── config/                    # Configuration files
```

---

## 🎮 Adding a New Game

### 1. Create Game File

**src/client/games/core/MyNewGame.ts:**
```typescript
import { Engine, Scene, Vector3, MeshBuilder } from '@babylonjs/core';
import { BaseGame } from '../shared/BaseGame';

export class MyNewGame extends BaseGame {
  private score: number = 0;
  private gameOver: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Create game objects
    const box = MeshBuilder.CreateBox('box', { size: 2 }, this.scene);
    box.position.y = 1;
    
    // Set up game loop
    this.scene.onBeforeRenderObservable.add(() => {
      if (!this.gameOver) {
        this.updateGame();
      }
    });
  }

  private updateGame(): void {
    // Game logic here
    this.score += 1;
    
    // Update info display
    this.updateInfo({
      score: this.score,
      status: 'Playing'
    });
  }

  public getGameInfo(): { [key: string]: string | number } {
    return {
      score: this.score,
      status: this.gameOver ? 'Game Over' : 'Playing'
    };
  }

  public pause(): void {
    this.gameOver = true;
  }

  public resume(): void {
    this.gameOver = false;
  }

  public dispose(): void {
    super.dispose();
  }
}
```

### 2. Register Game

**src/client/config/gameRegistry.js:**
```javascript
import { MyNewGame } from '../games/core/MyNewGame';

export const GAMES = {
  // ... existing games
  
  'my-new-game': {
    id: 'my-new-game',
    name: 'My New Game',
    description: 'An awesome new game!',
    thumbnail: '/images/games/my-game.jpg',
    category: 'ACTION',
    difficulty: 'medium',
    is3D: true,
    new: true,
    hot: true,
    rating: 5.0,
    plays: 0,
    renderer: RENDERER_TYPES.THREE, // or CANVAS2D
    component: MyNewGame,
    controls: {
      keyboard: {
        'WASD': 'Move',
        'Space': 'Jump'
      },
      touch: 'Tap to jump',
      mouse: 'Click to shoot'
    },
    features: [
      'Beautiful 3D graphics',
      'Smooth gameplay',
      'Progressive difficulty'
    ]
  }
};
```

### 3. Add Catalog Entry (Optional - for premium games)

**src/client/config/premiumGames.ts:**
```typescript
export const premiumGames = [
  // ... existing games
  
  {
    id: 'my-new-game',
    name: 'My New Game',
    description: 'An awesome new game!',
    price: 50, // Diamond cost
    image: '/images/games/my-game.jpg',
    category: 'Action',
    difficulty: 'medium',
    is3D: true,
    tier: 3,
    fileSize: '8 MB',
    features: ['Feature 1', 'Feature 2']
  }
];
```

### 4. Test Game
```bash
# Start dev server
cd src/client
npm run dev

# Navigate to:
http://localhost:3000/play/my-new-game
```

---

## 🧪 Testing

### Backend Tests
```bash
cd src/server
npm test

# Run specific test
npm test -- --grep "leaderboard"

# Watch mode
npm test -- --watch
```

### Frontend Tests
```bash
cd src/client
npm test

# Coverage report
npm test -- --coverage
```

### E2E Tests
```bash
# Install Playwright
npm install -D @playwright/test

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui
```

---

## 🎨 Styling Guidelines

### Component Styles
```css
/* Use BEM naming convention */
.game-card { }
.game-card__header { }
.game-card__header--active { }

/* Use CSS variables for theming */
.button {
  background: var(--primary-color);
  color: var(--text-color);
  border-radius: var(--border-radius);
}
```

### Theme Variables
**src/client/styles/theme.css:**
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --accent-color: #ec4899;
  --background-color: #0f172a;
  --surface-color: #1e293b;
  --text-color: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-radius: 8px;
  --spacing-unit: 8px;
}
```

---

## 🔧 Common Development Tasks

### Add New API Route

**src/server/routes/myRoute.js:**
```javascript
import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Your logic here
    
    res.json({
      success: true,
      data: { /* ... */ }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

**src/server/server.js:**
```javascript
import myRoute from './routes/myRoute.js';

// ... other imports

app.use('/api/my-route', myRoute);
```

### Add New API Client Method

**src/client/services/api.ts:**
```typescript
export const api = {
  // ... existing methods
  
  async getMyData() {
    const response = await fetch(`${API_URL}/my-route`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    return response.json();
  }
};
```

### Add New Zustand Store

**src/client/store/myStore.ts:**
```typescript
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface MyState {
  data: any[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      data: [],
      loading: false,
      
      fetchData: async () => {
        set({ loading: true });
        try {
          const response = await api.getMyData();
          set({ data: response.data, loading: false });
        } catch (error) {
          console.error('Failed to fetch data:', error);
          set({ loading: false });
        }
      }
    }),
    {
      name: 'my-store',
      partialize: (state) => ({ data: state.data })
    }
  )
);
```

---

## 🐛 Debugging

### Backend Debugging
```bash
# Use Node debugger
node --inspect server.js

# Or with breakpoints in VS Code:
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/src/server/server.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Frontend Debugging
```javascript
// Use React DevTools (Chrome extension)

// Add debug logs
console.log('Component mounted:', props);

// Use debugger statement
debugger;

// Check performance
React.Profiler
```

### WebSocket Debugging
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:5000/ws');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.send(JSON.stringify({ type: 'ping' }));
```

---

## 📊 Performance Monitoring

### Frontend Performance
```javascript
// Measure component render time
import { Profiler } from 'react';

<Profiler id="GameComponent" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}}>
  <GameComponent />
</Profiler>
```

### Backend Performance
```javascript
// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path}: ${duration}ms`);
  });
  next();
});
```

---

## 🔄 Git Workflow

### Branching Strategy
```bash
# Main branch: main (production-ready)
# Development branch: dev
# Feature branches: feature/my-feature
# Bug fixes: fix/my-bug

# Create feature branch
git checkout -b feature/new-game

# Work on feature
git add .
git commit -m "feat: Add new game with 3D graphics"

# Push to remote
git push origin feature/new-game

# Create pull request on GitHub
# After review and approval, merge to main
```

### Commit Message Convention
```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructuring
test: Tests
chore: Maintenance

# Examples:
git commit -m "feat(games): Add Space Explorer game"
git commit -m "fix(leaderboard): Fix caching issue"
git commit -m "docs: Update deployment guide"
git commit -m "refactor(api): Improve error handling"
```

---

## 📝 Code Standards

### TypeScript/JavaScript
```typescript
// Use TypeScript for new files
// Use async/await over promises
// Use arrow functions
// Use template literals
// Use optional chaining

// Good
const score = player?.stats?.score ?? 0;
const message = `Score: ${score}`;

// Bad
var score = player && player.stats && player.stats.score || 0;
var message = 'Score: ' + score;
```

### React Components
```typescript
// Use functional components with hooks
// Use TypeScript interfaces for props
// Destructure props
// Use meaningful names

// Good
interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return <div onClick={onClick}>{game.name}</div>;
};

// Bad
export function GameCard(props) {
  return <div onClick={props.onClick}>{props.game.name}</div>;
}
```

---

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Find and kill process using port 5000
```

**Module not found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**WebSocket connection failed:**
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check firewall settings
# Ensure CORS is configured correctly
```

**Babylon.js not loading:**
```bash
# Check canvas element exists
# Verify WebGL is supported
# Check browser console for errors
```

---

## 📚 Resources

### Documentation
- React: https://react.dev/
- Babylon.js: https://doc.babylonjs.com/
- Zustand: https://docs.pmnd.rs/zustand
- Express: https://expressjs.com/
- Supabase: https://supabase.com/docs

### Tools
- VS Code Extensions:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin (Volar)
  - GitLens
  - Error Lens

---

**Happy Coding! 🚀**
