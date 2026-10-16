import { useState, useEffect } from 'react';
import { Calendar, Flame, ChevronRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { matchStore } from '../../services/matchStore';
import { mockNews } from '../../mockData';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

export function Home() {
  const { user } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    return matchStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const liveMatches = matchStore.getLiveMatches();
  const upcomingMatches = matchStore.getUpcomingMatches();
  const recentResults = matchStore.getRecentResults();

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">MORE THAN<br/><span className="text-orange">FOOTBALL</span></h1>
        {user ? (
          <p className="subtitle">Welcome back, {user.name}. Here is your football feed.</p>
        ) : (
          <p className="subtitle">The digital home of your favorite competitions</p>
        )}
      </section>

      <div className="dashboard-grid">
        {/* Live & Upcoming Matches Column */}
        <div className="dashboard-column">
          <div className="section-header">
            <h2><Flame className="icon-orange" size={24} /> Match Center</h2>
          </div>
          
          {liveMatches.length > 0 && (
            <div className="live-matches">
              {liveMatches.map(match => (
                <div key={match.id} className="match-card live-card">
                  <Link to={`/matches/${match.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card-header">
                      <span className="live-badge">LIVE</span>
                      <span className="match-time tabular-nums">{match.minute}</span>
                    </div>
                    <div className="match-scoreboard">
                      <div className="team">
                        <span className="team-logo-prominent">{match.homeTeam.logo}</span>
                        <span className="team-name">{match.homeTeam.shortName}</span>
                      </div>
                      <div className="score-wrapper">
                        <span className="score tabular-nums">{match.homeScore}</span>
                        <span className="score-divider">-</span>
                        <span className="score tabular-nums">{match.awayScore}</span>
                      </div>
                      <div className="team">
                        <span className="team-logo-prominent">{match.awayTeam.logo}</span>
                        <span className="team-name">{match.awayTeam.shortName}</span>
                      </div>
                    </div>
                    {match.events && match.events.length > 0 && (
                      <div className="match-events-preview">
                        <div className="home-events">
                          {match.events.filter(e => e.teamId === match.homeTeam.id).map(e => (
                            <div key={e.id} className="event-preview-item">
                              {e.type === 'goal' ? '⚽' : e.type === 'yellow_card' ? '🟨' : e.type === 'red_card' ? '🟥' : '🔄'} {e.playerName} {e.time}
                            </div>
                          ))}
                        </div>
                        <div className="away-events">
                          {match.events.filter(e => e.teamId === match.awayTeam.id).map(e => (
                            <div key={e.id} className="event-preview-item">
                              {e.time} {e.playerName} {e.type === 'goal' ? '⚽' : e.type === 'yellow_card' ? '🟨' : e.type === 'red_card' ? '🟥' : '🔄'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="upcoming-matches card-panel">
            <div className="panel-header">
              <h3><Calendar size={18} /> Upcoming</h3>
              <Link to="/matches" className="view-all">Full Fixtures <ChevronRight size={16}/></Link>
            </div>
            <ul className="match-list" style={{ listStyle: 'none', padding: 0 }}>
              {upcomingMatches.map(match => (
                <li key={match.id}>
                  <Link to={`/matches/${match.id}`} className="match-list-item" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div className="match-meta" style={{ alignSelf: 'center', alignItems: 'center' }}>
                      <span className="match-date">{match.date}</span>
                      <span className="match-time tabular-nums">{match.time}</span>
                    </div>
                    <div className="match-teams" style={{ justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <span className="team-logo-medium">{match.homeTeam.logo}</span>
                        <span>{match.homeTeam.shortName}</span>
                      </div>
                      <span className="vs" style={{ alignSelf: 'center', fontSize: '1.2rem' }}>vs</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <span className="team-logo-medium">{match.awayTeam.logo}</span>
                        <span>{match.awayTeam.shortName}</span>
                      </div>
                    </div>
                    <div style={{ alignSelf: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{match.venue}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="recent-results card-panel">
            <div className="panel-header">
              <h3>Recent Results</h3>
            </div>
            <ul className="match-list" style={{ listStyle: 'none', padding: 0 }}>
              {recentResults.map(match => (
                <li key={match.id}>
                  <Link to={`/matches/${match.id}`} className="match-list-item result-item" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
                    <div className="match-teams" style={{ gap: 'var(--space-4)' }}>
                      <span className={match.homeScore > match.awayScore ? 'winner' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.25rem' }}>{match.homeTeam.logo}</span>
                        <span>{match.homeTeam.shortName}</span>
                      </span>
                      <span className="result-score tabular-nums">{match.homeScore} - {match.awayScore}</span>
                      <span className={match.awayScore > match.homeScore ? 'winner' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{match.awayTeam.shortName}</span>
                        <span style={{ fontSize: '1.25rem' }}>{match.awayTeam.logo}</span>
                      </span>
                    </div>
                    <span className="status-badge">FT</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* News & Updates Column */}
        <div className="dashboard-column">
          <div className="section-header">
            <h2><Newspaper size={24} /> Latest News</h2>
          </div>
          
          <div className="news-feed">
            {mockNews.map(news => (
              <Link to={`/news/${news.id}`} key={news.id} className="news-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="news-image" style={{ backgroundImage: `url(${news.image})` }}>
                  <span className="news-category">{news.category}</span>
                </div>
                <div className="news-content">
                  <h3 className="news-title">{news.title}</h3>
                  <span className="news-date tabular-nums">{news.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
