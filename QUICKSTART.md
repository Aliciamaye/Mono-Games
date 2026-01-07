# 🎮 MONO GAMES - QUICK REFERENCE

## 🚀 How to Start

### Development Servers Running:
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:5000

### Start Frontend
```bash
cd src/client
npm run dev
```

### Start Backend
```bash
cd src/server
node server.js
```

### Start Both
```bash
npm run dev:all
```

## 📂 Important Files

| File | Purpose |
|------|---------|
| `src/client/main.jsx` | Frontend entry point |
| `src/server/server.js` | Backend entry point |
| `src/client/games/shared/framework/BaseGame.js` | Game base class |
| `src/server/services/antiCheat.js` | Score validation |
| `src/client/utils/security.js` | Security utilities |
| `src/server/database/schema.sql` | Database schema |
| `.env` | Environment variables |

## 🎮 Playable Games (5/15)

1. ✅ **Snake** - `/play/snake`
2. ✅ **Tetris** - `/play/tetris`
3. ✅ **2048** - `/play/2048`
4. ✅ **Pong** - `/play/pong`
5. ✅ **Memory Match** - `/play/memory-match`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Games
- `GET /api/games` - List all games
- `GET /api/games/:id` - Get game details

### Leaderboard
- `GET /api/leaderboard/:gameId` - Get scores
- `POST /api/leaderboard/:gameId` - Submit score

### User
- `GET /api/user/profile` - Get profile (auth required)
- `PUT /api/user/profile` - Update profile (auth required)

### Cloud Saves
- `GET /api/saves/:gameId` - Get save (auth required)
- `POST /api/saves/:gameId` - Upload save (auth required)

## 🎨 Theme Colors

```css
Primary: #FF6B35 (Warm Orange)
Secondary: #F7931E (Golden)
Background: #FFF8DC (Cream)
Text: #2C3E50 (Dark Blue)
Accent: #41EAD4 (Teal)
Border: #FFB347 (Light Orange)
```

## 🛠️ Common Tasks

### Create New Game
```bash
# 1. Create folder
mkdir src/client/games/core/new-game

# 2. Create index.js
# Extend BaseGame class

# 3. Create manifest.json
# Add game metadata

# 4. Add to gameStore.js
# Include in coreGames array
```

### Test API
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'
```

### Check Errors
- Frontend: F12 → Console
- Backend: Terminal output
- API: Network tab (F12)

## 📊 Progress

- [x] Frontend setup with React + Vite
- [x] Backend setup with Express
- [x] 5 games implemented
- [x] Authentication system
- [x] Anti-cheat system
- [x] Leaderboard system
- [x] Cloud save system
- [x] Security features
- [ ] 10 more games
- [ ] Database setup (Supabase)
- [ ] TypeScript migration
- [ ] UI theme finalization
- [ ] Desktop app (Electron)
- [ ] Android app (Capacitor)

## 🐛 Troubleshooting

### Frontend won't start
```bash
cd src/client
rm -rf node_modules
npm install
npm run dev
```

### Backend won't start
```bash
cd src/server
rm -rf node_modules
npm install
node server.js
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📚 Documentation

- `README.md` - Project overview
- `STATUS.md` - Current progress
- `DEVELOPMENT.md` - Developer guide
- `ARCHITECTURE.md` - System design
- `PROJECT_STRUCTURE.md` - File organization

## 🔐 Security Notes

- Never commit `.env` files
- Always validate scores server-side
- Use HTTPS in production
- Rotate JWT secrets regularly
- Keep dependencies updated

## 💡 Tips

1. **Games**: Use BaseGame class for consistent behavior
2. **State**: Use Zustand stores for global state
3. **API**: Use configured axios instance from services/api
4. **Security**: Use utils/security for encryption
5. **Styling**: Use cartoony-* class names (not retro-*)

## 🎯 Next Priority

1. Complete UI theme conversion (retro → cartoony)
2. Finish remaining 10 core games
3. Set up Supabase database
4. Convert to TypeScript
5. Test all features end-to-end

---

**Status**: 🟢 Development Ready
**Version**: 1.0.0-dev
**Last Updated**: $(Get-Date -Format "yyyy-MM-dd")
