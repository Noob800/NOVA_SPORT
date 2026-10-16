import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ShieldAlert } from 'lucide-react';
import { adminStore } from '../../services/adminStore';
import { matchStore } from '../../services/matchStore';
import './TeamProfile.css';

export function TeamProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'squad' | 'fixtures' | 'results' | 'stats'>('overview');
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubAdmin = adminStore.subscribe(() => setTick(t => t + 1));
    const unsubMatch = matchStore.subscribe(() => setTick(t => t + 1));
    return () => {
      unsubAdmin();
      unsubMatch();
    };
  }, []);

  const team = adminStore.getTeamById(id || '') || adminStore.getTeams()[0];
  const squad = team ? adminStore.getPlayers(team.id) : [];
  const standings = adminStore.calculateStandings();
  const teamStanding = standings.find(s => s.teamId === team?.id);

  const teamMatches = matchStore.getAllMatches().filter(m => 
    team && (m.homeTeam.id === team.id || m.awayTeam.id === team.id)
  );

  const upcomingMatches = teamMatches.filter(m => ['SCHEDULED', 'READY'].includes(m.status));
  const recentResults = teamMatches.filter(m => m.status === 'VERIFIED_PUBLISHED');
  const nextMatch = upcomingMatches[0];

  if (!team) {
    return (
      <div className="team-profile-container" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <ShieldAlert size={48} className="icon-orange" style={{ margin: '0 auto var(--space-4)' }} />
        <h2>Team Not Found</h2>
        <p className="text-muted">The requested team profile does not exist or has been decommissioned.</p>
        <button onClick={() => window.history.back()} className="view-all-btn" style={{ marginTop: 'var(--space-4)' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="team-profile-container">
      <div className="tp-header-nav">
        <button onClick={() => window.history.back()} className="icon-button"><ChevronLeft size={20} /></button>
        <button className="follow-btn"><Star size={16} /> Follow Team</button>
      </div>

      <header className="tp-header">
        <div className="tp-logo-container">
          <div className="tp-logo">{team.logo}</div>
        </div>
        <div className="tp-title">
          <h1>{team.name}</h1>
          <p className="tp-competition">
            {team.city ? `${team.city} • ` : ''}{team.division || 'KeMU Super League'}
          </p>
        </div>
      </header>

      <div className="comp-nav">
        <button className={`comp-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`comp-tab ${activeTab === 'squad' ? 'active' : ''}`} onClick={() => setActiveTab('squad')}>Squad</button>
        <button className={`comp-tab ${activeTab === 'fixtures' ? 'active' : ''}`} onClick={() => setActiveTab('fixtures')}>Fixtures</button>
        <button className={`comp-tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>Results</button>
        <button className={`comp-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
      </div>

      <div className="tp-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <section className="card-panel">
              <div className="panel-header">
                <h3>Team Form</h3>
              </div>
              <div className="form-badges">
                {teamStanding?.form && teamStanding.form.length > 0 ? (
                  teamStanding.form.map((f, i) => (
                    <span key={i} className={`form-badge form-${f.toLowerCase()}`}>{f}</span>
                  ))
                ) : (
                  <span className="text-muted text-sm">No matches concluded yet</span>
                )}
              </div>
            </section>

            {nextMatch && (
              <section className="card-panel">
                <div className="panel-header">
                  <h3>Next Fixture</h3>
                </div>
                <Link to={`/matches/${nextMatch.id}`} className="match-card-expanded" style={{ border: 'none', padding: 'var(--space-2) 0' }}>
                  <div className="expanded-header">
                    <span className="match-status tabular-nums">{nextMatch.date} • {nextMatch.time}</span>
                  </div>
                  <div className="match-scoreboard">
                    <div className="team">
                      <span className="team-logo-medium">{nextMatch.homeTeam.logo}</span>
                      <span style={{ fontWeight: 600, textAlign: 'center' }}>{nextMatch.homeTeam.shortName}</span>
                    </div>
                    <div className="score-wrapper">
                      <span className="score-divider">vs</span>
                    </div>
                    <div className="team">
                      <span className="team-logo-medium">{nextMatch.awayTeam.logo}</span>
                      <span style={{ fontWeight: 600, textAlign: 'center' }}>{nextMatch.awayTeam.shortName}</span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            <section className="card-panel">
              <div className="panel-header">
                <h3>Top Scorers</h3>
              </div>
              <div className="players-list">
                {squad.filter(p => p.goals > 0).length === 0 ? (
                  <p className="text-muted text-sm" style={{ padding: 'var(--space-2) 0' }}>No player goals recorded yet this season.</p>
                ) : (
                  squad.slice(0, 3).map(player => (
                    <Link to={`/players/${player.id}`} key={player.id} className="player-list-item" style={{ border: 'none', padding: 'var(--space-2) 0' }}>
                      <div className="player-avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                        {player.position === 'GK' ? '🧤' : player.position === 'DF' ? '🛡️' : player.position === 'MF' ? '⚡' : '⚽'}
                      </div>
                      <div className="player-info">
                        <h4>{player.name}</h4>
                      </div>
                      <div className="tabular-nums" style={{ fontWeight: 800, fontSize: '1.25rem' }}>{player.goals}</div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'squad' && (
          <div className="players-list">
            {squad.length === 0 ? (
              <div className="card-panel" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <p className="text-muted">No players officially registered to this roster yet.</p>
              </div>
            ) : (
              squad.map(player => (
                <Link to={`/players/${player.id}`} key={player.id} className="player-list-item card-panel" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="player-avatar">
                    {player.position === 'GK' ? '🧤' : player.position === 'DF' ? '🛡️' : player.position === 'MF' ? '⚡' : '⚽'}
                  </div>
                  <div className="player-info">
                    <h4>{player.name}</h4>
                    <p>#{player.number} • {player.position} • {player.eligibility === 'ELIGIBLE' ? 'Approved' : player.eligibility}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="fixtures-panel">
            {upcomingMatches.length === 0 ? (
              <div className="card-panel" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <p className="text-muted">No scheduled upcoming fixtures for this team.</p>
              </div>
            ) : (
              <div className="match-list-expanded">
                {upcomingMatches.map(match => (
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
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-panel">
            {recentResults.length === 0 ? (
              <div className="card-panel" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <p className="text-muted">No verified match results published yet for this team.</p>
              </div>
            ) : (
              <div className="match-list-expanded">
                {recentResults.map(match => (
                  <Link to={`/matches/${match.id}`} key={match.id} className="match-card-expanded" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="expanded-header">
                      <span className="match-status tabular-nums">{match.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="match-scoreboard">
                      <div className="team">
                        <span className="team-logo-medium">{match.homeTeam.logo}</span>
                        <span style={{ fontWeight: 600, textAlign: 'center' }}>{match.homeTeam.shortName}</span>
                      </div>
                      <div className="score-wrapper">
                        <span className="score tabular-nums">{match.homeScore}</span>
                        <span className="score-divider">-</span>
                        <span className="score tabular-nums">{match.awayScore}</span>
                      </div>
                      <div className="team">
                        <span className="team-logo-medium">{match.awayTeam.logo}</span>
                        <span style={{ fontWeight: 600, textAlign: 'center' }}>{match.awayTeam.shortName}</span>
                      </div>
                    </div>
                    <div className="expanded-footer">
                      <span className="competition-name">View Match Report</span>
                      <ChevronRight size={16} className="chevron" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="overview-grid">
            <section className="card-panel">
              <div className="panel-header">
                <h3>Season Performance</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', textAlign: 'center', padding: 'var(--space-3) 0' }}>
                <div>
                  <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-stadium-white)' }}>
                    {teamStanding?.played || 0}
                  </div>
                  <div className="text-muted text-sm">Matches</div>
                </div>
                <div>
                  <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                    {teamStanding?.won || 0}
                  </div>
                  <div className="text-muted text-sm">Wins</div>
                </div>
                <div>
                  <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-orange)' }}>
                    {teamStanding?.points || 0}
                  </div>
                  <div className="text-muted text-sm">Points</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
