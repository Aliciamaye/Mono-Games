# Mono Games - System Architecture

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **State Management**: Zustand (lightweight, perfect for games)
- **Routing**: React Router v6
- **UI Framework**: Custom components with retro aesthetic
- **PWA**: Vite PWA Plugin (offline support)
- **Game Engines**: 
  - Phaser.js 3 (2D games)
  - Three.js + React Three Fiber (3D games)
- **Styling**: CSS Modules + Tailwind CSS (customized for retro theme)

### Desktop (Windows)
- **Framework**: Electron 28+
- **Builder**: electron-builder
- **Auto-Update**: electron-updater
- **Security**: contextIsolation, nodeIntegration disabled

### Mobile (Android)
- **Framework**: Capacitor 5
- **Target**: Android 6.0+ (API 23+)
- **APK Size**: 150-255 MB with core games
- **Build**: Gradle + Capacitor CLI

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL, free tier, includes auth)
- **File Storage**: Cloudflare R2 (free 10GB, S3-compatible)
- **Cache**: Redis (Upstash free tier)

### Hosting & Deployment
- **Web App**: Vercel (free, auto-deploy from GitHub)
- **Backend API**: Railway.app (free tier, 500MB RAM)
- **Static Assets/Games**: Cloudflare R2 + CDN
- **Landing Page**: GitHub Pages
- **Releases**: GitHub Releases (Windows .exe, Android .apk)

### Security Stack
- **Encryption**: crypto-js (AES-256)
- **Hashing**: bcrypt (passwords), SHA-256 (file integrity)
- **Authentication**: JWT tokens + HttpOnly cookies
- **API Security**: helmet.js, express-rate-limit, cors
- **Obfuscation**: javascript-obfuscator (for production builds)
- **Anti-Cheat**: Server-side score validation + timestamp verification
- **Input Validation**: Zod (schema validation)
- **HTTPS**: Enforced on all platforms

### Development Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest, React Testing Library
- **Build**: Vite (web), electron-builder (desktop), Gradle (Android)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Devices                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │   Windows    │  │   Android    │     │
│  │   (PWA)      │  │  (Electron)  │  │ (Capacitor)  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   React Web App │
                    │   (PWA + Vite)  │
                    └────────┬────────┘
                             │
          ┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━┓
          ▼                                      ▼
┌────────────────────┐              ┌────────────────────┐
│   Offline Games    │              │   Online Features  │
│  - Pre-installed   │              │   - Backend API    │
│  - Local Storage   │              │   - Supabase DB    │
│  - IndexedDB       │              │   - Cloudflare R2  │
│  - Service Worker  │              │   - Leaderboards   │
└────────────────────┘              └────────────────────┘
```

## Game Download System

### Architecture
```
GitHub Releases / Cloudflare R2
         │
         ▼
  [Game Manifest API]
         │
    ┌────┴────┐
    ▼         ▼
[Desktop]  [Mobile]
    │         │
    ▼         ▼
[Game Store UI]
    │
    ▼
[Download Manager]
    │
    ├──► Download Package (.zip)
    ├──► Verify Integrity (SHA-256)
    ├──► Extract & Install
    ├──► Update Local Manifest
    └──► Ready to Play
```

### Game Package Structure
```
game-name-v1.0.0.zip
├── manifest.json (metadata, version, integrity hash)
├── assets/
│   ├── sprites/
│   ├── audio/
│   └── fonts/
├── game.js (main game code, obfuscated)
└── config.json (game configuration)
```

## Security Architecture

### Multi-Layer Security Approach

1. **Client-Side Security**
   - Local data encryption (AES-256)
   - Code obfuscation (production builds)
   - Input validation (all user inputs)
   - Integrity checks on game files
   - Secure storage (encrypted IndexedDB)

2. **Transport Security**
   - HTTPS only (all platforms)
   - JWT tokens with short expiry
   - CORS configuration
   - Rate limiting

3. **Server-Side Security**
   - Score validation (server-authoritative)
   - Anti-cheat detection (impossible scores, timing analysis)
   - Request signing (HMAC)
   - Database parameterized queries
   - File upload restrictions

4. **Anti-Cheat System**
   ```
   Game Event → Client Timestamp → Encrypt & Sign → Server
                                                        ↓
   Server validates: timestamp, signature, score feasibility
                                                        ↓
   If valid → Save to DB, else → Flag/Reject
   ```

## Data Flow

### Offline Mode
```
User → Game → Local Storage (Encrypted) → IndexedDB
                                              ↓
                            [Sync Queue when online]
```

### Online Mode
```
User → Game → Validation → API (HTTPS + JWT)
                              ↓
                        Supabase DB
                              ↓
                        Leaderboards
```

## Directory Structure Overview

```
mono-games/
├── web-app/          # React PWA (core application)
├── desktop/          # Electron wrapper
├── mobile/           # Capacitor Android app
├── backend/          # Node.js API server
├── games/            # All game source code
│   ├── core/         # Pre-installed games
│   └── downloadable/ # Downloadable games
├── shared/           # Shared utilities & types
├── docs/             # Documentation
├── scripts/          # Build & deployment scripts
└── landing-page/     # Static landing page
```

## Development Workflow

1. **Development**: Local development with Vite HMR
2. **Build Web**: `npm run build` → Optimized production build
3. **Build Desktop**: `npm run build:electron` → Windows .exe
4. **Build Mobile**: `npm run build:android` → Android .apk
5. **Deploy**: GitHub Actions → Auto-deploy to Vercel/Railway
6. **Release**: Tag version → GitHub Actions → Create Release with binaries

## Performance Targets

- **Web App Initial Load**: < 3 seconds
- **Game Launch Time**: < 1 second
- **Offline Support**: 100% for core games
- **API Response Time**: < 200ms (95th percentile)
- **Game Download**: Parallel downloads, resume capability
- **Memory Usage**: < 512MB (desktop), < 256MB (mobile)

## Scalability Considerations

- **Modular Game System**: Easy to add/remove games
- **CDN for Assets**: Fast downloads globally
- **Lazy Loading**: Load games on-demand
- **Code Splitting**: Reduce initial bundle size
- **Database Indexing**: Optimized queries
- **Caching Strategy**: Service Worker + Redis
- **Horizontal Scaling**: Stateless API design

---

**Last Updated**: January 2026
**Version**: 1.0.0
