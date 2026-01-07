import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '../components/Icons';

function PrivacyPolicy() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'var(--bg-card)',
        border: '4px solid var(--border-color)',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 8px 0 var(--border-color)'
      }}>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--primary)',
          textDecoration: 'none',
          fontSize: '1.1rem',
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 700,
          marginBottom: '2rem'
        }}>
          <ChevronLeftIcon size={20} /> Back to Home
        </Link>

        <h1 style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: '3rem',
          color: 'var(--primary)',
          marginBottom: '1rem',
          fontWeight: 900
        }}>
          🔒 Privacy Policy
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Last Updated: January 7, 2026
        </p>

        <div style={{
          color: 'var(--text-primary)',
          fontSize: '1.1rem',
          lineHeight: '1.8',
          fontFamily: "'Segoe UI', sans-serif"
        }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Our Commitment
            </h2>
            <p>
              At Mono Games, we respect your privacy and are committed to protecting your personal data. 
              This policy explains what data we collect, how we use it, and your rights regarding your information.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Information We Collect
            </h2>
            
            <h3 style={{ fontWeight: 700, marginTop: '1rem' }}>Account Information:</h3>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Username (required)</li>
              <li>Email address (required)</li>
              <li>Password (encrypted)</li>
            </ul>

            <h3 style={{ fontWeight: 700, marginTop: '1rem' }}>Game Data:</h3>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Game scores and statistics</li>
              <li>Achievements and progress</li>
              <li>Save game data</li>
              <li>Leaderboard rankings</li>
            </ul>

            <h3 style={{ fontWeight: 700, marginTop: '1rem' }}>Technical Data:</h3>
            <ul style={{ marginLeft: '2rem' }}>
              <li>IP address (for security and analytics)</li>
              <li>Browser type and version</li>
              <li>Device type (mobile, tablet, desktop)</li>
              <li>Operating system</li>
              <li>Time zone and locale</li>
            </ul>

            <h3 style={{ fontWeight: 700, marginTop: '1rem' }}>Usage Data:</h3>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Games played and time spent</li>
              <li>Feature usage patterns</li>
              <li>Error logs and crash reports</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              How We Use Your Information
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li><strong>Provide Services:</strong> Enable gameplay, save progress, and display leaderboards</li>
              <li><strong>Authentication:</strong> Verify your identity and prevent unauthorized access</li>
              <li><strong>Improve Platform:</strong> Analyze usage to enhance games and features</li>
              <li><strong>Communication:</strong> Send important updates (account security, service changes)</li>
              <li><strong>Security:</strong> Detect and prevent fraud, cheating, and abuse</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Data Storage and Security
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li><strong>Local Storage:</strong> Game saves and settings stored on your device</li>
              <li><strong>Cloud Backup:</strong> Optional cloud sync for cross-device play</li>
              <li><strong>Encryption:</strong> All passwords are hashed and salted</li>
              <li><strong>Secure Connection:</strong> HTTPS encryption for all data transmission</li>
              <li><strong>Access Control:</strong> Limited staff access to user data</li>
              <li><strong>Data Retention:</strong> Account data kept until deletion; logs for 90 days</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Third-Party Services
            </h2>
            <p>We use minimal third-party services:</p>
            <ul style={{ marginLeft: '2rem' }}>
              <li><strong>CDN:</strong> For fast content delivery (Cloudflare)</li>
              <li><strong>Analytics:</strong> Privacy-focused analytics (no personal data sold)</li>
              <li><strong>No Advertising:</strong> We don't use ad networks or trackers</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Cookies and Local Storage
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li><strong>Essential Cookies:</strong> Required for authentication and functionality</li>
              <li><strong>Settings Cookie:</strong> Stores theme, volume, and preferences</li>
              <li><strong>Analytics Cookies:</strong> Optional, can be disabled in settings</li>
              <li><strong>Local Storage:</strong> Game saves, high scores, and offline data</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul style={{ marginLeft: '2rem' }}>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Delete your account and associated data</li>
              <li><strong>Export:</strong> Download your game saves and statistics</li>
              <li><strong>Object:</strong> Opt out of analytics and optional data collection</li>
              <li><strong>Portability:</strong> Transfer your data to another service</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Children's Privacy
            </h2>
            <p>
              We comply with COPPA (Children's Online Privacy Protection Act):
            </p>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Users under 13 require parental consent</li>
              <li>We don't knowingly collect data from children under 13 without consent</li>
              <li>Parents can request deletion of their child's data</li>
              <li>Guest mode available for children without account creation</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              International Users
            </h2>
            <p>
              For users in the EU (GDPR) and California (CCPA):
            </p>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Legal basis: Consent and legitimate interest</li>
              <li>Data minimization: We collect only necessary data</li>
              <li>Right to be forgotten: Full account deletion available</li>
              <li>Do Not Sell: We never sell personal information</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. We'll notify users of significant changes 
              via email or platform announcement. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '2rem',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 800
            }}>
              Contact Us
            </h2>
            <p>
              Questions about privacy? Contact us:
            </p>
            <ul style={{ marginLeft: '2rem' }}>
              <li>📧 Email: privacy@monogames.com</li>
              <li>💻 GitHub: <a href="https://github.com/Raft-The-Crab/Mono-Games" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Raft-The-Crab/Mono-Games</a></li>
              <li>⚙️ Settings: Manage data preferences in your account settings</li>
            </ul>
          </section>

          <div style={{
            background: 'rgba(78, 205, 196, 0.1)',
            border: '3px solid #4ECDC4',
            borderRadius: '15px',
            padding: '1.5rem',
            marginTop: '3rem'
          }}>
            <p style={{ margin: 0, fontWeight: 700 }}>
              🔒 Your privacy matters! We never sell your data and collect only what's necessary to provide great gaming experiences. 🎮
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
