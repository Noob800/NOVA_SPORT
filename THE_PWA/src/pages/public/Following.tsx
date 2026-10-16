import { Star, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Following.css';

export function Following() {
  const { user, login } = useAuth();

  if (!user) {
    return (
      <div className="following-container">
        <section className="following-hero">
          <div className="icon-circle">
            <Star size={40} className="icon-orange" />
          </div>
          <h1 className="hero-title">Your Football</h1>
          <p className="subtitle">Sign in to follow competitions, teams, and players.</p>
          <button onClick={() => login('REGISTERED_FAN')} className="login-button" style={{ marginTop: 'var(--space-4)' }}>
            Sign In to Personalize
          </button>
        </section>

        <section className="popular-suggestions">
          <h2>Popular Right Now</h2>
          <div className="suggestion-grid">
            <div className="explore-card">
              <div className="card-image team-logo-placeholder">NC</div>
              <div className="card-info">
                <h3>Nova City FC</h3>
                <p>Trending Team</p>
              </div>
            </div>
            <div className="explore-card">
              <div className="card-image team-logo-placeholder">UC</div>
              <div className="card-info">
                <h3>United Campus</h3>
                <p>Trending Team</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="following-container">
      <div className="following-header">
        <h1><Star className="icon-orange" /> Following</h1>
        <button className="icon-button"><Bell size={20} /></button>
      </div>

      <section className="feed-section">
        <div className="followed-teams">
          {user.followedTeams.length > 0 ? (
            user.followedTeams.map((team, index) => (
              <div key={index} className="followed-badge">
                <div className="badge-logo">{team.substring(0, 2).toUpperCase()}</div>
                <span>{team}</span>
              </div>
            ))
          ) : (
            <p className="empty-state-text">You aren't following any teams yet.</p>
          )}
          <button className="add-follow-button">+ Find Teams</button>
        </div>
      </section>

      <section className="activity-feed">
        <h2>Activity Feed</h2>
        <div className="feed-list">
          <div className="feed-item card-panel">
            <p className="feed-time">2 hours ago</p>
            <h3>Nova City FC won 3-1 against Metro United</h3>
            <p>Super League • Matchday 4</p>
          </div>
          <div className="feed-item card-panel">
            <p className="feed-time">5 hours ago</p>
            <h3>David Kiptoo scored a hat-trick</h3>
            <p>Player you follow</p>
          </div>
        </div>
      </section>
    </div>
  );
}
