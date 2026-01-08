import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isElectron = env.BUILD_TARGET === 'electron';
  const isMobile = env.BUILD_TARGET === 'mobile';
  const isWeb = !isElectron && !isMobile;

  console.log(`[Vite] Building for: ${isElectron ? 'Electron' : isMobile ? 'Mobile' : 'Web'}`);

  return {
    root: resolve(__dirname, '../src/client'),
    base: isElectron || isMobile ? './' : '/', // Relative paths for local builds
    plugins: [
      react(),
      // Only use PWA for web builds
      ...(isWeb ? [
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'robots.txt'],
          manifest: {
            name: 'Mono Games',
            short_name: 'MonoGames',
            description: 'Cross-platform gaming platform with 50+ games',
            theme_color: '#1a1a2e',
            background_color: '#16213e',
            display: 'standalone',
            orientation: 'any',
            icons: [
              {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          },
          workbox: {
            // Only cache for web - Electron/Mobile load locally
            globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/.*\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24
                  }
                }
              }
            ]
          }
        })
      ] : [])
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src/client'),
        '@games': resolve(__dirname, '../src/client/games'),
        '@components': resolve(__dirname, '../src/client/components'),
        '@utils': resolve(__dirname, '../src/client/utils'),
        '@store': resolve(__dirname, '../src/client/store'),
        '@services': resolve(__dirname, '../src/client/services')
      }
    },
    build: {
      outDir: isElectron 
        ? resolve(__dirname, '../dist/electron/renderer')
        : isMobile 
          ? resolve(__dirname, '../dist/mobile/www')
          : resolve(__dirname, '../dist/client'),
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'babylon-engine': ['@babylonjs/core', '@babylonjs/materials', '@babylonjs/loaders'],
            'utils': ['crypto-js', 'zustand']
          }
        }
      },
      chunkSizeWarningLimit: 2000, // Increased for Babylon.js
      // Inline small assets for Electron/Mobile
      assetsInlineLimit: isElectron || isMobile ? 4096 : 4096,
      cssCodeSplit: !isElectron && !isMobile // Keep CSS together for Electron/Mobile
    },
    server: {
      port: 3000,
      open: !isElectron && !isMobile,
      cors: true,
      host: true
    },
    preview: {
      port: 3000
    },
    define: {
      // Inject build target
      'import.meta.env.BUILD_TARGET': JSON.stringify(
        isElectron ? 'electron' : isMobile ? 'mobile' : 'web'
      ),
      // Disable service worker for Electron/Mobile
      'import.meta.env.USE_SERVICE_WORKER': JSON.stringify(isWeb)
    }
  };
});
