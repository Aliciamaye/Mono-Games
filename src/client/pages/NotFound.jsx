import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <div className="retro-card" style={{ padding: '3rem' }}>
        <h1 className="retro-title" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          404
        </h1>
        <p className="retro-subtitle" style={{ marginBottom: '2rem' }}>
          Page Not Found
        </p>
        <Link to="/">
          <button className="retro-btn">
            ← Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
