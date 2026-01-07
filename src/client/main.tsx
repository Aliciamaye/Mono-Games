import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/cartoony-theme.css';
import './styles/auth.css';

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered:', registration.scope);
      },
      (error) => {
        console.log('SW registration failed:', error);
      }
    );
  });
}

// Remove loading screen
window.addEventListener('load', () => {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => loadingScreen.remove(), 500);
    }, 1000);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
