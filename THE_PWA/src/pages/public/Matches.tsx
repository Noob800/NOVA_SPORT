import { useState, useEffect } from 'react';
import { CalendarDays, Filter, ChevronRight } from 'lucide-react';
import { matchStore } from '../../services/matchStore';
import { Link } from 'react-router-dom';
import './Matches.css';

export function Matches() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'results'>('live');
  const [, setTick] = useState(0);

  useEffect(() => {
    return matchStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const liveMatches = matchStore.getLiveMatches();
  const upcomingMatches = matchStore.getUpcomingMatches();
  const recentResults = matchStore.getRecentResults();

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1><CalendarDays className="icon-orange" /> Match Center</h1>
        <button className="icon-button"><Filter size={20} /></button>
      </div>

      <div className="matches-tabs">
        <button 
          className={`tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          Live & Today ({liveMatches.length})
        </button>
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingMatches.length})
        </button>
        <button 
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Results ({recentResults.length})
        </button>
      </div>

      <div className="matches-content">
        {activeTab === 'live' && (
          <>
            <section className="match-group">
              <h2 className="group-title">LIVE NOW</h2>
              {liveMatches.length === 0 ? (
                <div className="card-panel" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No matches currently in progress.
                </div>
              ) : (
                <div className="match-list-expanded">
                  {liveMatches.map(match => (
                    <Link to={`/matches/${match.id}`} key={match.id} className="match-card-expanded live-expanded" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="expanded-header">
                        <span className="live-badge">LIVE</span>
                        <span className="match-time tabular-nums">{match.minute}</span>
                      </div>
                      
                      <div className="match-scoreboard" style={{ margin: 'var(--space-4) 0' }}>
                        <div className="team">
                          <span className="team-logo-prominent">{match.homeTeam.logo}</span>
                          <span className="team-name" style={{ textAlign: 'center' }}>{match.homeTeam.shortName}</span>
                        </div>
                        <div className="score-wrapper">
                          <span className="score tabular-nums">{match.homeScore}</span>
                          <span className="score-divider">-</span>
                          <span className="score tabular-nums">{match.awayScore}</span>
                        </div>
                        <div className="team">
                          <span className="team-logo-prominent">{match.awayTeam.logo}</span>
                          <span className="team-name" style={{ textAlign: 'center' }}>{match.awayTeam.shortName}</span>
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
                      <div className="expanded-footer">
                        <span className="competition-name">{match.competition.name} • {match.venue}</span>
                        <ChevronRight size={16} className="chevron" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="match-group">
              <h2 className="group-title">TODAY'S FIXTURES</h2>
              <div className="match-list-expanded">
                {upcomingMatches.map(match => (
                  <Link to={`/matches/${match.id}`} key={match.id} className="match-card-expanded" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="expanded-header">
                      <span className="match-status tabular-nums" style={{ color: 'var(--nova-orange)', fontWeight: 700 }}>{match.time}</span>
                    </div>
                    
                    <div className="match-scoreboard" style={{ margin: 'var(--space-4) 0' }}>
                      <div className="team">
                        <span className="team-logo-medium">{match.homeTeam.logo}</span>
                        <span className="team-name" style={{ textAlign: 'center' }}>{match.homeTeam.shortName}</span>
                      </div>
                      <div className="score-wrapper">
                        <span className="score-divider" style={{ fontSize: '1.25rem' }}>vs</span>
                      </div>
                      <div className="team">
                        <span className="team-logo-medium">{match.awayTeam.logo}</span>
                        <span className="team-name" style={{ textAlign: 'center' }}>{match.awayTeam.shortName}</span>
                      </div>
                    </div>

                    <div className="expanded-footer">
                      <span className="competition-name">{match.venue || match.competition.name}</span>
                      <ChevronRight size={16} className="chevron" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'upcoming' && (
          <section className="match-group">
            <h2 className="group-title">UPCOMING FIXTURES</h2>
            <div className="match-list-expanded">
              {upcomingMatches.map(match => (
                <Link to={`/matches/${match.id}`} key={match.id} className="match-card-expanded" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="expanded-header">
                    <span className="match-status tabular-nums" style={{ color: 'var(--text-muted)' }}>{match.date} • {match.time}</span>
                  </div>
                  
                  <div className="match-scoreboard" style={{ margin: 'var(--space-4) 0' }}>
                    <div className="team">
                      <span className="team-logo-medium">{match.homeTeam.logo}</span>
                      <span className="team-name" style={{ textAlign: 'center' }}>{match.homeTeam.name}</span>
                    </div>
                    <div className="score-wrapper">
                      <span className="score-divider" style={{ fontSize: '1.25rem' }}>vs</span>
                    </div>
                    <div className="team">
                      <span className="team-logo-medium">{match.awayTeam.logo}</span>
                      <span className="team-name" style={{ textAlign: 'center' }}>{match.awayTeam.name}</span>
                    </div>
                  </div>

                  <div className="expanded-footer">
                    <span className="competition-name">{match.venue}</span>
                    <ChevronRight size={16} className="chevron" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'results' && (
          <section className="match-group">
            <h2 className="group-title">OFFICIAL VERIFIED RESULTS</h2>
            <div className="match-list-expanded">
              {recentResults.map(match => (
                <Link to={`/matches/${match.id}`} key={match.id} className="match-card-expanded" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="expanded-header">
                    <span className="match-status tabular-nums" style={{ color: '#10B981', fontWeight: 700 }}>OFFICIAL FULL TIME</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{match.date}</span>
                  </div>
                  
                  <div className="match-scoreboard" style={{ margin: 'var(--space-4) 0' }}>
                    <div className="team">
                      <span className="team-logo-medium">{match.homeTeam.logo}</span>
                      <span className="team-name" style={{ textAlign: 'center' }}>{match.homeTeam.shortName}</span>
                    </div>
                    <div className="score-wrapper">
                      <span className="score tabular-nums" style={{ fontWeight: 800, fontSize: '1.5rem' }}>
                        {match.homeScore} - {match.awayScore}
                      </span>
                    </div>
                    <div className="team">
                      <span className="team-logo-medium">{match.awayTeam.logo}</span>
                      <span className="team-name" style={{ textAlign: 'center' }}>{match.awayTeam.shortName}</span>
                    </div>
                  </div>

                  <div className="expanded-footer">
                    <span className="competition-name">{match.venue} • Verified by Referee</span>
                    <ChevronRight size={16} className="chevron" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
