import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.success) {
        setUser(response.data.data.user);
        setToken(response.data.data.token);
        navigate('/launcher');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({ email: 'demo@monogames.com', password: 'demo1234' });
  };

  return (
    <div className="login-page">
      <div className="login-container cartoony-container">
        {/* Decorative elements */}
        <div className="doodle-star doodle-1">⭐</div>
        <div className="doodle-star doodle-2">✨</div>
        <div className="doodle-cloud cloud-1">☁️</div>
        <div className="doodle-cloud cloud-2">☁️</div>

        <div className="login-box cartoony-card">
          {/* Logo/Title */}
          <div className="login-header">
            <h1 className="cartoony-title" style={{ fontSize: '3rem' }}>
              🎮 Mono Games
            </h1>
            <div className="cartoony-divider"></div>
            <p className="cartoony-subtitle">Welcome Back, Player!</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-bubble cartoony-badge" style={{ backgroundColor: '#FF6B6B' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="cartoony-label">
                📧 Email
              </label>
              <input
                type="email"
                className="cartoony-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="cartoony-label">
                🔒 Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="cartoony-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle cartoony-btn-small"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="cartoony-btn cartoony-btn-primary"
                disabled={loading}
              >
                {loading ? '⏳ Logging in...' : '🚀 Let\'s Play!'}
              </button>

              <button
                type="button"
                className="cartoony-btn cartoony-btn-secondary"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                🎭 Try Demo Account
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="cartoony-text">or continue with</span>
          </div>

          {/* Social Login Buttons */}
          <div className="social-login">
            <button className="social-btn google-btn cartoony-btn">
              <span className="social-icon">🔴</span> Google
            </button>
            <button className="social-btn github-btn cartoony-btn">
              <span className="social-icon">⚫</span> GitHub
            </button>
            <button className="social-btn discord-btn cartoony-btn">
              <span className="social-icon">🔵</span> Discord
            </button>
          </div>

          {/* Footer Links */}
          <div className="login-footer">
            <Link to="/forgot-password" className="cartoony-link">
              😕 Forgot Password?
            </Link>
            <span className="separator">•</span>
            <Link to="/register" className="cartoony-link">
              ✨ Create Account
            </Link>
          </div>

          {/* Guest Option */}
          <div className="guest-option">
            <button
              className="cartoony-btn cartoony-btn-ghost"
              onClick={() => navigate('/launcher')}
            >
              👻 Continue as Guest
            </button>
          </div>
        </div>

        {/* Fun fact bubble */}
        <div className="fun-fact-bubble cartoony-speech-bubble">
          💡 <strong>Did you know?</strong> Registered players get cloud saves and achievements!
        </div>
      </div>
    </div>
  );
}
