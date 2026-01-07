# Mono Games - Project Structure

## Simplified Directory Structure

```
mono-games/
│
├── src/                          # Main source code
│   ├── client/                   # React Frontend (Web App)
│   │   ├── games/                # All Game Source Code
│   │   │   ├── core/             # Pre-installed Games (10-15)
│   │   │   ├── downloadable/     # Downloadable Games (40+)
│   │   │   └── shared/           # Shared Game Utilities
│   │   ├── assets/               # Images, fonts, icons
│   │   ├── components/           # React components
│   │   │   ├── common/           # Reusable components
│   │   │   ├── game-launcher/    # Game launcher UI
│   │   │   ├── game-store/       # Game download store UI
│   │   │   ├── leaderboard/      # Leaderboard components
│   │   │   └── settings/         # Settings UI
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── GameLauncher.jsx
│   │   │   ├── GameStore.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/             # API services
│   │   │   ├── api.js            # API client
│   │   │   ├── auth.js           # Authentication
│   │   │   ├── gameStore.js      # Game download service
│   │   │   └── storage.js        # Local storage (encrypted)
│   │   ├── store/                # State management (Zustand)
│   │   │   ├── authStore.js
│   │   │   ├── gameStore.js
│   │   │   └── settingsStore.js
│   │   ├── styles/               # Global styles
│   │   │   ├── global.css
│   │   │   ├── retro-theme.css
│   │   │   └── variables.css
│   │   ├── utils/                # Utility functions
│   │   │   ├── security.js       # Encryption, validation
│   │   │   ├── gameLoader.js     # Dynamic game loading
│   │   │   └── offline.js        # Offline detection
│   │   ├── App.jsx               # Root component
│   │   ├── main.jsx              # Entry point
│   │   └── router.jsx            # React Router config
│   │
│   ├── server/                   # Node.js Backend (Express API)
│   │   ├── controllers/          # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── gameController.js
│   │   │   ├── leaderboardController.js
│   │   │   └── userController.js
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.js           # JWT authentication
│   │   │   ├── rateLimit.js      # Rate limiting
│   │   │   ├── validation.js     # Input validation
│   │   │   └── security.js       # Security headers
│   │   ├── models/               # Database models
│   │   │   ├── User.js
│   │   │   ├── Score.js
│   │   │   └── Game.js
│   │   ├── routes/               # API routes
│   │   │   ├── auth.js
│   │   │   ├── games.js
│   │   │   ├── leaderboard.js
│   │   │   └── user.js
│   │   ├── services/             # Business logic
│   │   │   ├── antiCheat.js      # Anti-cheat validation
│   │   │   ├── gamePackager.js   # Game packaging
│   │   │   └── analytics.js      # Analytics service
│   │   ├── utils/                # Server utilities
│   │   │   ├── crypto.js         # Encryption/hashing
│   │   │   ├── db.js             # Database connection
│   │   │   └── logger.js         # Logging
│   │   ├── config/               # Server configuration
│   │   │   ├── database.js
│   │   │   └── environment.js
│   │   └── server.js             # Express app entry
│   │
│   ├── desktop/                  # Electron Wrapper (Windows)
│   │   ├── assets/               # Desktop-specific assets
│   │   │   ├── icons/            # App icons
│   │   │   └── splash.png
│   │   ├── preload.js            # Electron preload script
│   │   ├── main.js               # Electron main process
│   │   ├── menu.js               # Native menu configuration
│   │   ├── updater.js            # Auto-update logic
│   │   └── electron-builder.yml  # Build configuration
│   │
│   └── mobile/                   # Capacitor Wrapper (Android)
│       ├── android/              # Generated Android project
│       ├── assets/               # Mobile-specific assets
│       │   ├── icons/            # App icons
│       │   └── splash/           # Splash screens
│       ├── capacitor.config.ts   # Capacitor configuration
│       └── build.gradle          # Android build config
│
├── public/                       # Static Public Assets
│   ├── favicon.ico
│   ├── manifest.json             # PWA manifest
│   ├── robots.txt
│   └── sw.js                     # Service worker
│
├── config/                       # Configuration Files
│   ├── vite.config.js            # Vite configuration
│   ├── electron.vite.config.js   # Electron Vite config
│   └── capacitor.config.ts       # Capacitor config
│
├── docs/                         # Documentation
│   ├── README.md                 # Main documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── API.md                    # API documentation
│   ├── SECURITY.md               # Security guide
│   ├── DEVELOPMENT.md            # Development setup
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── GAME_DEVELOPMENT.md       # How to add games
│   └── CHANGELOG.md              # Version history
│
├── scripts/                      # Build & Deployment Scripts
│   ├── build-web.js              # Build web app
│   ├── build-desktop.js          # Build Electron app
│   ├── build-mobile.js           # Build Android APK
│   ├── package-games.js          # Package downloadable games
│   ├── deploy.js                 # Deployment automation
│   └── generate-icons.js         # Icon generation
│
├── .github/                      # GitHub Configuration
│   ├── workflows/                # GitHub Actions
│   │   ├── build.yml             # Build workflow
│   │   ├── deploy.yml            # Deploy workflow
│   │   └── release.yml           # Release workflow
│   └── ISSUE_TEMPLATE/
│
├── landing-page/                 # Static Landing Page (GitHub Pages)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── assets/
│
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore file
├── package.json                  # Root package.json (monorepo)
├── package-lock.json
├── tsconfig.json                 # TypeScript config
├── eslint.config.js              # ESLint configuration
├── prettier.config.js            # Prettier configuration
├── README.md                     # Project README
└── LICENSE                       # License file
```

## Key Improvements

### 1. **Unified Source Directory (`src/`)**
   - All application source code in one place
   - Clear separation: `client`, `server`, `desktop`, `mobile`
   - Easier to navigate and maintain

### 2. **Combined Frontend & Backend**
   - `src/client/` - React web app (PWA)
   - `src/server/` - Express API
   - Shared types and utilities easily accessible
   - Single repository for the entire web application

### 3. **Platform Wrappers Together**
   - `src/desktop/` - Electron wrapper
   - `src/mobile/` - Capacitor wrapper
   - Both load the same web app with platform-specific features

### 4. **Games Organization**
   - `src/client/games/core/` - Pre-installed (bundled with app)
   - `src/client/games/downloadable/` - Available for download
   - `src/client/games/shared/` - Common game utilities and engine
   - Each game is self-contained with its own manifest
   - All games are part of the web app bundle

### 5. **Reduced Top-Level Folders**
   - Only 6 main folders: `src/`, `public/`, `config/`, `docs/`, `scripts/`, `landing-page/`
   - Clear purpose for each folder
   - Easier to understand project structure

## Build System

### Development
```bash
npm run dev          # Start web app dev server
npm run dev:server   # Start backend dev server
npm run dev:all      # Start both (concurrently)
```

### Production Builds
```bash
npm run build:web      # Build optimized web app
npm run build:desktop  # Build Windows .exe
npm run build:mobile   # Build Android .apk
npm run build:all      # Build everything
```

### Game Packaging
```bash
npm run package:games  # Package downloadable games
```

## File Size Distribution

### Pre-installed Package (Core)
- **Web App Bundle**: ~3-5 MB (minified + gzipped)
- **Core Games (15 games)**: ~80-120 MB
- **Assets & Dependencies**: ~30-50 MB
- **Total Desktop App**: ~150-200 MB
- **Total Android APK**: ~180-255 MB

### Downloadable Games
- **Simple Games**: 2-10 MB each
- **Medium Games**: 10-30 MB each
- **High-End/3D Games**: 30-100 MB each
- **Average**: ~25 MB per game

## Technology Stack per Folder

### `src/client/`
- React 18 + Vite
- Zustand (state management)
- React Router
- Phaser.js (2D games)
- Three.js (3D games)
- PWA with service worker

### `src/server/`
- Node.js + Express
- Supabase (PostgreSQL)
- JWT authentication
- Cloudflare R2 (file storage)

### `src/desktop/`
- Electron 28+
- electron-builder
- electron-updater

### `src/mobile/`
- Capacitor 5
- Android Studio integration
- Native plugins

### `games/`
- Phaser.js (most 2D games)
- Three.js (3D games)
- Canvas API (simple games)
- Custom game engine

**Note:** Games are now located at `src/client/games/` as part of the web app.

---

**Structure Version**: 2.0
**Last Updated**: January 2026
