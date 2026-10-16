import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, ChevronRight, Newspaper, CalendarDays, ShieldAlert } from 'lucide-react';
import { adminStore } from '../../services/adminStore';
import { matchStore } from '../../services/matchStore';
import './CompetitionHub.css';

export function CompetitionHub() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'table' | 'fixtures' | 'results' | 'teams'>('overview');
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubAdmin = adminStore.subscribe(() => setTick(t => t + 1));
    const unsubMatch = matchStore.subscribe(() => setTick(t => t + 1));
    return () => {
      unsubAdmin();
      unsubMatch();
    };
  }, []);

  const competitions = adminStore.getCompetitions();
  const competition = competitions.find(c => c.id === id) || competitions[0];
  const activeSeason = competition 
    ? (adminStore.getActiveSeason(competition.id) || adminStore.getSeasons(competition.id)[0])
    : undefined;

  const standings = activeSeason ? adminStore.calculateStandings(activeSeason.id) : [];
  const compTeams = activeSeason ? adminStore.getTeams(activeSeason.id) : adminStore.getTeams();
  const allMatches = matchStore.getAllMatches();
  const compMatches = allMatches.filter(m => 
    (!competition || m.competition?.id === competition.id || m.competition?.name === competition.name) &&
    ['SCHEDULED', 'READY'].includes(m.status)
  );
  const compResults = allMatches.filter(m => 
    (!competition || m.competition?.id === competition.id || m.competition?.name === competition.name) &&
    m.status === 'VERIFIED_PUBLISHED'
  );
  const compNews = adminStore.getAnnouncements();

  if (!competition) {
    return (
      <div className="comp-hub-container" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <Trophy size={48} className="icon-orange" style={{ margin: '0 auto var(--space-4)' }} />
        <h2>Competition Not Found</h2>
        <p className="text-muted">No competition records currently match this identifier.</p>
        <Link to="/explore" className="view-all-btn" style={{ display: 'inline-block', marginTop: 'var(--space-4)' }}>
          Browse Competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="comp-hub-container">
      {/* Competition Header */}
      <header className="comp-header">
        <div className="comp-brand">
          <Trophy size={48} className="comp-icon icon-orange" />
          <div className="comp-title-group">
            <h1>{competition.name}</h1>
            <span className="comp-season">{activeSeason ? `${activeSeason.name} • ${activeSeason.year}` : 'Active Season'}</span>
            <span className={`status-badge ${competition.status === 'ACTIVE' ? 'status-ongoing' : ''}`}>
              {competition.status === 'ACTIVE' ? 'Ongoing' : competition.status}
            </span>
          </div>
        </div>
        
        <div className="comp-nav">
          <button className={`comp-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`comp-tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>Table</button>
          <button className={`comp-tab ${activeTab === 'fixtures' ? 'active' : ''}`} onClick={() => setActiveTab('fixtures')}>Fixtures</button>
          <button className={`comp-tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>Results</button>
          <button className={`comp-tab ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>Teams</button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="comp-content">
        {activeTab === 'overview' && (
          <div className="overview-panel">
            <div className="overview-grid">
              <section className="card-panel">
                <div className="panel-header">
                  <h3><Newspaper size={18} /> Official Announcements</h3>
                </div>
                {compNews.length === 0 ? (
                  <p className="text-muted text-sm" style={{ padding: 'var(--space-3) 0' }}>No announcements published yet for this competition.</p>
                ) : (
                  <div className="news-list">
                    {compNews.slice(0, 3).map(news => (
                      <Link to={`/news/${news.id}`} key={news.id} className="news-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="news-content">
                          <span className="news-category">{news.category}</span>
                          <h4>{news.title}</h4>
                          <span className="news-date">{news.publishedAt ? news.publishedAt.split('T')[0] : 'Today'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="card-panel">
                <div className="panel-header">
                  <h3><CalendarDays size={18} /> Next Fixtures</h3>
                </div>
                {compMatches.length === 0 ? (
                  <div style={{ padding: 'var(--space-4) 0', textAlign: 'center' }}>
                    <p className="text-muted text-sm">No upcoming fixtures currently scheduled.</p>
                  </div>
                ) : (
                  <>
                    <div className="fixtures-list">
                      {compMatches.slice(0, 3).map(match => (
                        <Link to={`/matches/${match.id}`} key={match.id} className="fixture-item">
                          <div className="fixture-time tabular-nums">{match.time}</div>
                          <div className="fixture-teams" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, gap: 'var(--space-2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                              <span className="team-name" style={{ textAlign: 'right' }}>{match.homeTeam.name}</span>
                              <span style={{ fontSize: '1.25rem' }}>{match.homeTeam.logo}</span>
                            </div>
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>vs</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-start' }}>
                              <span style={{ fontSize: '1.25rem' }}>{match.awayTeam.logo}</span>
                              <span className="team-name" style={{ textAlign: 'left' }}>{match.awayTeam.name}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-muted" style={{ marginLeft: 'var(--space-2)' }} />
                        </Link>
                      ))}
                    </div>
                    <button className="view-all-btn" onClick={() => setActiveTab('fixtures')}>View All Fixtures</button>
                  </>
                )}
              </section>
            </div>
          </div>
        )}

        {activeTab === 'table' && (
          <div className="standings-panel card-panel">
            {standings.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <ShieldAlert size={36} className="text-muted" style={{ margin: '0 auto var(--space-2)' }} />
                <p className="text-muted">No official table standings calculated yet for this season.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th className="col-pos">#</th>
                      <th className="col-team">Club</th>
                      <th className="col-num" title="Played">MP</th>
                      <th className="col-num" title="Won">W</th>
                      <th className="col-num" title="Drawn">D</th>
                      <th className="col-num" title="Lost">L</th>
                      <th className="col-num" title="Goal Difference">GD</th>
                      <th className="col-num col-pts" title="Points">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, index) => (
                      <tr key={row.teamId} className={index < 3 ? 'promo-zone' : (index > standings.length - 3 ? 'relegation-zone' : '')}>
                        <td className="col-pos tabular-nums">{row.position}</td>
                        <td className="col-team">
                          <Link to={`/teams/${row.teamId}`} className="team-cell-link">
                            <span className="team-logo">{row.logo}</span>
                            <span className="team-name">{row.teamName}</span>
                            <span className="team-short hide-desktop">{row.shortName}</span>
                          </Link>
                        </td>
                        <td className="col-num tabular-nums">{row.played}</td>
                        <td className="col-num tabular-nums">{row.won}</td>
                        <td className="col-num tabular-nums">{row.drawn}</td>
                        <td className="col-num tabular-nums">{row.lost}</td>
                        <td className="col-num tabular-nums">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                        <td className="col-num col-pts tabular-nums">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="fixtures-panel">
            {compMatches.length === 0 ? (
              <div className="card-panel" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <p className="text-muted">No upcoming fixtures scheduled for this competition.</p>
              </div>
            ) : (
              <div className="match-list-expanded">
                {compMatches.map(match => (
                  <Link to={`/matches/${match.id}`} key={match.id} className="match-card-expanded">
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
            {compResults.length === 0 ? (
              <div className="card-panel" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <p className="text-muted">No verified match results published yet for this competition.</p>
              </div>
            ) : (
              <div className="match-list-expanded">
                {compResults.map(match => (
                  <Link to={`/matches/${match.id}`} key={match.id} className="match-card-expanded">
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

        {activeTab === 'teams' && (
          <div className="teams-grid">
            {compTeams.length === 0 ? (
              <div className="card-panel" style={{ gridColumn: '1 / -1', padding: 'var(--space-6)', textAlign: 'center' }}>
                <p className="text-muted">No teams registered for this competition season yet.</p>
              </div>
            ) : (
              compTeams.map(team => (
                <Link to={`/teams/${team.id}`} key={team.id} className="team-card">
                  <span className="team-card-logo">{team.logo}</span>
                  <h3 className="team-card-name">{team.name}</h3>
                  <span className="view-profile-btn">Profile <ChevronRight size={16}/></span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
