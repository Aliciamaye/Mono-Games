import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { validatePassword, isValidEmail, isValidUsername } from '../utils/security';

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    const validation = validatePassword(password);
    setPasswordStrength(validation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidUsername(formData.username)) {
      setError('Username must be 3-20 characters, letters, numbers and underscores only');
      return;
    }

    if (!passwordStrength?.isValid) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        setUser(response.data.data.user);
        setToken(response.data.data.token);
        navigate('/launcher');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (!passwordStrength) return '#ccc';
    if (passwordStrength.strength < 30) return '#FF6B6B';
    if (passwordStrength.strength < 60) return '#FFB347';
    return '#51CF66';
  };

  const getStrengthText = () => {
    if (!passwordStrength) return '';
    if (passwordStrength.strength < 30) return 'Weak 😟';
    if (passwordStrength.strength < 60) return 'Good 😊';
    return 'Strong 💪';
  };

  return (
    <div className="register-page">
      <div className="register-container cartoony-container">
        {/* Decorative elements */}
        <div className="doodle-star doodle-1">🌟</div>
        <div className="doodle-star doodle-2">⭐</div>
        <div className="doodle-star doodle-3">✨</div>
        <div className="doodle-cloud cloud-1">☁️</div>
        <div className="doodle-cloud cloud-2">☁️</div>
        <div className="floating-gamepad">🎮</div>
        <div className="floating-trophy">🏆</div>

        <div className="register-box cartoony-card">
          {/* Header */}
          <div className="register-header">
            <h1 className="cartoony-title" style={{ fontSize: '3rem' }}>
              ✨ Join Mono Games!
            </h1>
            <div className="cartoony-divider"></div>
            <p className="cartoony-subtitle">Create your account and start playing!</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-bubble cartoony-badge" style={{ backgroundColor: '#FF6B6B' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label className="cartoony-label">
                👤 Username
              </label>
              <input
                type="text"
                className="cartoony-input"
                placeholder="CoolGamer123"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
                maxLength={20}
              />
              <small className="form-hint">3-20 characters, letters, numbers, underscores</small>
            </div>

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
                  onChange={(e) => handlePasswordChange(e.target.value)}
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
              {passwordStrength && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${passwordStrength.strength}%`,
                        backgroundColor: getStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="cartoony-label">
                🔐 Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="cartoony-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                />
                <span className="cartoony-text">
                  I agree to the <Link to="/terms" className="cartoony-link">Terms of Service</Link> and <Link to="/privacy" className="cartoony-link">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="cartoony-btn cartoony-btn-primary"
                disabled={loading || !agreedToTerms}
              >
                {loading ? '⏳ Creating Account...' : '🚀 Create Account!'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="register-divider">
            <span className="cartoony-text">or sign up with</span>
          </div>

          {/* Social Signup Buttons */}
          <div className="social-signup">
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
          <div className="register-footer">
            <span className="cartoony-text">Already have an account?</span>
            <Link to="/login" className="cartoony-link">
              🎮 Login Here
            </Link>
          </div>
        </div>

        {/* Benefits bubble */}
        <div className="benefits-bubble cartoony-speech-bubble">
          <strong>🎁 Free Account Benefits:</strong>
          <ul>
            <li>☁️ Cloud Saves</li>
            <li>🏆 Achievements</li>
            <li>📊 Leaderboards</li>
            <li>👥 Friends & Chat</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
