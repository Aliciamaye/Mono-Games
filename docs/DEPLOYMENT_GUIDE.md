# 📦 Deployment Guide
**Mono Games - Android APK & Windows EXE**

## 🎯 Platform Focus
This project is optimized for:
- ✅ **Android APK** (Capacitor) - PRIMARY TARGET
- ✅ **Windows EXE** (Electron) - PRIMARY TARGET
- ❌ Web/macOS/Linux - NOT SUPPORTED

---

## 📱 Android APK Deployment

### Prerequisites
- Node.js 18+ 
- Java JDK 11+
- Android Studio (Arctic Fox or newer)
- Android SDK 30+
- Gradle 7+

### Setup Capacitor

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init MonoGames com.monogames.app

# Add Android platform
npx cap add android
```

### Configure Android

**capacitor.config.json:**
```json
{
  "appId": "com.monogames.app",
  "appName": "Mono Games",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "android": {
    "buildOptions": {
      "keystorePath": "release-key.keystore",
      "keystoreAlias": "mono-games",
      "keystorePassword": "YOUR_PASSWORD"
    },
    "minVersion": "24",
    "targetVersion": "34"
  }
}
```

### Build Frontend

```bash
# Build optimized production bundle
cd src/client
npm run build

# Copy to Capacitor
npx cap copy android
npx cap sync android
```

### Generate APK

```bash
# Open Android Studio
npx cap open android

# In Android Studio:
# 1. Build > Generate Signed Bundle/APK
# 2. Select APK
# 3. Choose keystore and sign
# 4. Build Release APK

# Or via command line:
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Android Optimizations

**AndroidManifest.xml:**
```xml
<manifest>
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  
  <application
    android:hardwareAccelerated="true"
    android:usesCleartextTraffic="false"
    android:requestLegacyExternalStorage="false">
    
    <!-- Enable WebGL -->
    <meta-data
      android:name="android.webkit.WebView.EnableWebGL"
      android:value="true" />
  </application>
</manifest>
```

**build.gradle (app):**
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "2.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 🪟 Windows EXE Deployment

### Prerequisites
- Node.js 18+
- Windows 10/11
- Visual Studio Build Tools (optional, for native modules)

### Setup Electron

```bash
# Install Electron
npm install electron electron-builder --save-dev

# Install Electron Forge (easier packaging)
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

### Electron Main Process

**electron/main.js:**
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webgl: true,
      enableWebGL: true
    },
    icon: path.join(__dirname, '../public/icons/icon-512x512.png'),
    title: 'Mono Games'
  });

  // Load production build
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Electron Builder Config

**electron-builder.json:**
```json
{
  "appId": "com.monogames.app",
  "productName": "Mono Games",
  "directories": {
    "output": "dist-electron",
    "buildResources": "public/icons"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "public/icons/**/*"
  ],
  "win": {
    "target": ["nsis", "portable"],
    "icon": "public/icons/icon-512x512.png",
    "artifactName": "MonoGames-Setup-${version}.${ext}"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Mono Games"
  },
  "portable": {
    "artifactName": "MonoGames-Portable-${version}.exe"
  }
}
```

### Build Scripts

**package.json:**
```json
{
  "scripts": {
    "electron:dev": "electron .",
    "electron:build": "npm run build && electron-builder --win --x64",
    "electron:build:portable": "npm run build && electron-builder --win portable",
    "electron:package": "electron-forge package",
    "electron:make": "electron-forge make"
  }
}
```

### Build Windows EXE

```bash
# Build frontend first
cd src/client
npm run build

# Build Windows installer
npm run electron:build

# Build portable EXE
npm run electron:build:portable

# Output:
# dist-electron/MonoGames-Setup-2.0.0.exe (Installer)
# dist-electron/MonoGames-Portable-2.0.0.exe (Portable)
```

---

## 🗄️ Backend Deployment

### Environment Variables

**.env.production:**
```env
# Server
NODE_ENV=production
PORT=5000

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis (Optional - will fallback to in-memory)
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud:
# REDIS_URL=rediss://username:password@host:port

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,capacitor://localhost,file://
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deploy to Cloud

#### Option 1: Railway.app
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up

# Set environment variables in Railway dashboard
```

#### Option 2: Render.com
1. Connect GitHub repo
2. Create new Web Service
3. Build Command: `npm install && npm run build`
4. Start Command: `cd src/server && npm start`
5. Add environment variables in dashboard

#### Option 3: DigitalOcean App Platform
```yaml
# app.yaml
name: mono-games-backend
services:
  - name: api
    github:
      repo: your-username/mono-games
      branch: main
    build_command: npm install
    run_command: cd src/server && npm start
    envs:
      - key: NODE_ENV
        value: production
    health_check:
      path: /health
```

### Redis Setup

#### Local Redis
```bash
# Install Redis (Windows)
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use WSL:
sudo apt install redis-server
redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

#### Cloud Redis (Recommended)
**Redis Cloud (Free 30MB):**
1. Sign up at https://redis.com/try-free/
2. Create database
3. Copy connection string
4. Set `REDIS_URL=rediss://...` in .env

**Upstash Redis:**
1. Sign up at https://upstash.com/
2. Create database
3. Copy REST URL
4. Set `REDIS_URL=...` in .env

### WebSocket Configuration
```javascript
// For Android APK
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${wsProtocol}://your-backend.com/ws`;

// For Windows EXE
const wsUrl = 'ws://localhost:5000/ws'; // Or cloud URL
```

---

## 🚀 Performance Optimizations

### Frontend
```javascript
// vite.config.js
export default {
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'babylon': ['@babylonjs/core'],
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
};
```

### Game Assets
```bash
# Compress textures
npm install -g sharp-cli

# Optimize PNGs
sharp -i input.png -o output.png --quality 80

# Generate WebP
sharp -i input.png -o output.webp --webp
```

### Bundle Size
```bash
# Analyze bundle
npm run build -- --analyze

# Check gzip size
gzip-size dist/assets/*.js
```

---

## 📊 Monitoring

### Health Checks
```bash
# Server health
curl http://localhost:5000/health

# Response:
{
  "status": "healthy",
  "uptime": 3600,
  "environment": "production",
  "cache": { "hits": 1000, "misses": 50 },
  "redis": { "type": "redis", "connected": true },
  "memory": { "used": "150 MB", "total": "200 MB" }
}
```

### Error Tracking
Use Sentry.io:
```bash
npm install @sentry/node @sentry/react
```

---

## 🧪 Testing

### Android APK Testing
```bash
# Install on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Check logs
adb logcat | grep chromium
```

### Windows EXE Testing
```bash
# Test portable version
./dist-electron/MonoGames-Portable-2.0.0.exe

# Test installer
./dist-electron/MonoGames-Setup-2.0.0.exe
```

---

## 📝 Checklist

### Before Android Release
- [ ] Update version in `build.gradle`
- [ ] Generate signed APK with release keystore
- [ ] Test on multiple devices (phone + tablet)
- [ ] Verify WebGL games run smoothly
- [ ] Check permissions in AndroidManifest
- [ ] Test offline functionality
- [ ] Verify touch controls work

### Before Windows Release
- [ ] Update version in `electron-builder.json`
- [ ] Build installer + portable versions
- [ ] Test on Windows 10 and 11
- [ ] Verify auto-updates work
- [ ] Check file associations
- [ ] Test uninstaller
- [ ] Code sign executable (optional)

### Backend
- [ ] Set production environment variables
- [ ] Enable Redis or verify in-memory fallback
- [ ] Test WebSocket connections
- [ ] Configure rate limiting
- [ ] Set up error logging
- [ ] Enable CORS for capacitor://
- [ ] Test health endpoint

---

## 🔐 Security

### Code Signing (Recommended)

**Android:**
```bash
# Generate keystore
keytool -genkey -v -keystore release-key.keystore -alias mono-games -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore release-key.keystore app-release-unsigned.apk mono-games
```

**Windows:**
- Use SignTool.exe (requires code signing certificate)
- Or use free signing tools for open source

---

## 📦 Distribution

### Android
- Google Play Store (requires developer account: $25 one-time)
- Amazon Appstore (free)
- Direct APK download from website
- F-Droid (open source only)

### Windows
- Microsoft Store (requires developer account: $19/year)
- Direct download from website
- GitHub Releases
- Itch.io

---

## 🆘 Troubleshooting

### Android WebGL Issues
```javascript
// Force WebGL 2
const engine = new Engine(canvas, true, { 
  preserveDrawingBuffer: true,
  stencil: true,
  powerPreference: 'high-performance'
});
```

### Windows EXE Crashes
Check console logs:
```javascript
// In main.js
mainWindow.webContents.on('crashed', () => {
  console.error('Renderer process crashed');
});
```

### Redis Connection Fails
Backend automatically falls back to in-memory cache. Check logs:
```
⚠️ Redis initialization failed, using in-memory cache: ECONNREFUSED
🗄️ Redis initialized: memory
```

---

## 📞 Support
- GitHub Issues: https://github.com/your-repo/issues
- Discord: [Your Discord Link]
- Email: support@monogames.com

---

**Last Updated:** January 2026  
**Version:** 2.0.0
