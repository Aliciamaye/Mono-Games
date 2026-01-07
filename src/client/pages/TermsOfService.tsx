import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '../components/Icons';

function TermsOfService() {
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
          📜 Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Mono Games, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform.
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
              2. User Accounts
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li>You may create an account to save progress and compete on leaderboards</li>
              <li>Guest accounts are available for offline play</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>One person or entity may not maintain more than one account</li>
              <li>You must provide accurate and complete information when creating an account</li>
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
              3. Fair Play and Anti-Cheat
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Cheating, hacking, or exploiting bugs is strictly prohibited</li>
              <li>Score manipulation will result in account suspension</li>
              <li>Using bots or automation tools is not allowed</li>
              <li>We reserve the right to reset scores or ban users who violate fair play</li>
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
              4. User Content
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Users may upload custom games (when feature is available)</li>
              <li>You retain ownership of your uploaded content</li>
              <li>By uploading, you grant us a license to host and distribute your content</li>
              <li>Content must not be illegal, offensive, or infringe on others' rights</li>
              <li>We reserve the right to remove any content that violates these terms</li>
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
              5. Service Availability
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li>We strive for 99% uptime but do not guarantee uninterrupted service</li>
              <li>Maintenance periods will be announced when possible</li>
              <li>Offline games remain available during server downtime</li>
              <li>We are not liable for data loss due to service interruptions</li>
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
              6. Intellectual Property
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li>All games and platform code are owned by Mono Games or licensed appropriately</li>
              <li>You may not copy, modify, or distribute our games without permission</li>
              <li>Game names and logos are trademarks of their respective owners</li>
              <li>Open source components are licensed under their respective licenses</li>
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
              7. Privacy
            </h2>
            <p>
              We collect minimal data necessary for service operation. See our 
              <Link to="/privacy" style={{ color: 'var(--primary)', fontWeight: 700 }}> Privacy Policy </Link>
              for details on data collection and usage.
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
              8. Age Requirements
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Users must be at least 13 years old to create an account</li>
              <li>Users under 18 should have parental consent</li>
              <li>We comply with COPPA regulations</li>
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
              9. Limitation of Liability
            </h2>
            <p>
              Mono Games is provided "as is" without warranties of any kind. We are not liable for:
            </p>
            <ul style={{ marginLeft: '2rem' }}>
              <li>Loss of data or progress</li>
              <li>Service interruptions or errors</li>
              <li>Damage caused by viruses or malicious code (though we take precautions)</li>
              <li>Actions of other users</li>
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
              10. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms. 
              You may delete your account at any time through the settings page.
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
              11. Changes to Terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of Mono Games after changes 
              constitutes acceptance of the new terms. Major changes will be announced on the platform.
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
              12. Contact Us
            </h2>
            <p>
              For questions about these Terms of Service, please contact us:
            </p>
            <ul style={{ marginLeft: '2rem' }}>
              <li>📧 Email: support@monogames.com</li>
              <li>💻 GitHub: <a href="https://github.com/Raft-The-Crab/Mono-Games" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Raft-The-Crab/Mono-Games</a></li>
            </ul>
          </section>

          <div style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '3px solid var(--primary)',
            borderRadius: '15px',
            padding: '1.5rem',
            marginTop: '3rem'
          }}>
            <p style={{ margin: 0, fontWeight: 700 }}>
              🎮 By using Mono Games, you agree to play fair, have fun, and respect other players! 🎮
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
