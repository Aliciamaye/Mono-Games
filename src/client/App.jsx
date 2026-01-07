import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useSettingsStore from './store/settingsStore';
import useAuthStore from './store/authStore';

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

function App() {
  const { loadSettings } = useSettingsStore();
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

  return (
    <Router>
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
