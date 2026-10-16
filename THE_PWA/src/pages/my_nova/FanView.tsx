import { Link } from 'react-router-dom';
import { mockTeams, mockUpcomingMatches } from '../../mockData';
import { ChevronRight, Calendar, Star, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FanViewProps {
  isGuest: boolean;
}

export function FanView({ isGuest }: FanViewProps) {
  const { user } = useAuth();
  
  if (isGuest) {
    return (
      <div className="fan-view">
        <section className="card-panel" style={{ marginTop: 'var(--space-6)' }}>
          <div className="panel-header">
            <h3><Star size={18} /> Discover NovaSport</h3>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to follow your favorite teams and personalize your feed.</p>
          
          <h4 style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Popular Teams</h4>
          <div className="teams-grid">
            {mockTeams.slice(0, 3).map(team => (
              <Link to={`/teams/${team.id}`} key={team.id} className="team-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="team-card-logo">{team.logo}</span>
                <span className="team-card-name">{team.name}</span>
                <span className="view-profile-btn">View Profile <ChevronRight size={16} /></span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fan-view">
      <section className="card-panel" style={{ marginTop: 'var(--space-6)' }}>
        <div className="panel-header">
          <h3><Star size={18} /> Followed Teams</h3>
          <Link to="/explore" className="view-all">Manage <ChevronRight size={16} /></Link>
        </div>
        {user?.followedTeams?.length ? (
          <div className="teams-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {mockTeams.filter(t => user.followedTeams.includes(t.id)).slice(0, 2).map(team => (
              <Link to={`/teams/${team.id}`} key={team.id} className="team-card" style={{ textDecoration: 'none', color: 'inherit', padding: 'var(--space-4)' }}>
                <span className="team-card-logo" style={{ fontSize: '2rem' }}>{team.logo}</span>
                <span className="team-card-name" style={{ fontSize: '1.1rem' }}>{team.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: 'var(--space-4) 0' }}>
            You haven't followed any teams yet. Explore NovaSport to personalize your feed.
          </div>
        )}
      </section>

      <section className="card-panel" style={{ marginTop: 'var(--space-6)' }}>
        <div className="panel-header">
          <h3><Calendar size={18} /> Upcoming for You</h3>
          <Link to="/matches" className="view-all">All Fixtures <ChevronRight size={16} /></Link>
        </div>
        <div className="match-list-expanded">
          {mockUpcomingMatches.map(match => (
            <Link to={`/matches/${match.id}`} key={match.id} className="match-card-expanded" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="expanded-header">
                <span className="match-status tabular-nums">{match.date} • {match.time}</span>
              </div>
              <div className="match-scoreboard">
                <div className="team">
                  <span className="team-logo-medium">{match.homeTeam.logo}</span>
                  <span style={{ fontWeight: 600, textAlign: 'center' }}>{match.homeTeam.shortName}</span>
                </div>
                <div className="score-wrapper">
                  <span className="score-divider">vs</span>
                </div>
                <div className="team">
                  <span className="team-logo-medium">{match.awayTeam.logo}</span>
                  <span style={{ fontWeight: 600, textAlign: 'center' }}>{match.awayTeam.shortName}</span>
                </div>
              </div>
              <div className="expanded-footer">
                <span className="competition-name">{match.venue || 'TBA'}</span>
                <ChevronRight size={16} className="chevron" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="card-panel" style={{ marginTop: 'var(--space-6)' }}>
        <div className="panel-header">
          <h3><Bell size={18} /> Recent Announcements</h3>
        </div>
        <div style={{ color: 'var(--text-muted)', padding: 'var(--space-4) 0' }}>
          No new announcements relevant to your followed teams.
        </div>
      </section>
    </div>
  );
}
