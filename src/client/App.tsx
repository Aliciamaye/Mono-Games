import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useSettingsStore from './store/settingsStore';
import useAuthStore from './store/authStore';
import type React from 'react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameLauncher from './pages/GameLauncher';
import GameStore from './pages/GameStore';
import GamePlay from './pages/GamePlay';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Layout
import Layout from './components/layout/Layout';
import FPSCounter from './components/FPSCounter';

// Styles
import './styles/responsive.css';

const App: React.FC = () => {
  const { loadSettings, settings } = useSettingsStore();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    // Initialize app
    loadSettings();
    initAuth();
    
    // Check for updates (PWA)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
    }
  }, [loadSettings, initAuth]);

  // Apply theme globally
  useEffect(() => {
    const themes = {
      light: { primary: '#FF6B35', bg: '#FFF8DC' },
      dark: { primary: '#FF6B35', bg: '#1A1A2E' },
      ocean: { primary: '#4ECDC4', bg: '#E8F6F3' },
      sunset: { primary: '#E63946', bg: '#FFF0F0' },
      forest: { primary: '#2D6A4F', bg: '#F0F7F4' },
      purple: { primary: '#7B2CBF', bg: '#F5F0FF' }
    };

    const currentTheme = settings.display.theme || 'light';
    const theme = themes[currentTheme] || themes.light;

    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--bg-main', theme.bg);

    if (currentTheme === 'dark') {
      document.documentElement.style.setProperty('--text-primary', '#FFFFFF');
      document.documentElement.style.setProperty('--text-secondary', '#B0B0B0');
      document.documentElement.style.setProperty('--bg-card', '#252542');
      document.documentElement.style.setProperty('--bg-pattern', '#1E1E36');
      document.documentElement.style.setProperty('--border-color', '#3D3D5C');
      document.documentElement.style.setProperty('--bg-gradient', 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)');
    } else {
      document.documentElement.style.setProperty('--text-primary', '#2C3E50');
      document.documentElement.style.setProperty('--text-secondary', '#7F8C8D');
      document.documentElement.style.setProperty('--bg-card', '#FFFFFF');
      document.documentElement.style.setProperty('--bg-pattern', '#FFF8DC');
      document.documentElement.style.setProperty('--border-color', '#FFB347');
      document.documentElement.style.setProperty('--bg-gradient', 'linear-gradient(180deg, #87CEEB 0%, #FFE5B4 100%)');
    }
  }, [settings.display.theme]);

  return (
    <Router>
      <FPSCounter />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/launcher" element={<GameLauncher />} />
          <Route path="/store" element={<GameStore />} />
          <Route path="/play/:gameId" element={<GamePlay />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
