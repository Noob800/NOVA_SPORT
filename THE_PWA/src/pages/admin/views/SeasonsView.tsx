import React, { useState } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Users, 
  Trophy, 
  Sliders, 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Layers,
  Check
} from 'lucide-react';
import { adminStore, type SeasonLifecycleStatus } from '../../../services/adminStore';
import { matchStore } from '../../../services/matchStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface SeasonsViewProps {
  initialSeasonId?: string;
  onNavigate: (section: string, subId?: string) => void;
  onOpenCreateSeasonModal: () => void;
  onOpenScheduleModal: () => void;
}

export const SeasonsView: React.FC<SeasonsViewProps> = ({
  initialSeasonId,
  onNavigate,
  onOpenCreateSeasonModal,
  onOpenScheduleModal
}) => {
  const competitions = adminStore.getCompetitions();
  const seasons = adminStore.getSeasons();
  const teams = adminStore.getTeams();
  const allMatches = matchStore.getAllMatches();

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    initialSeasonId || adminStore.getSelectedSeasonId() || seasons[0]?.id || ''
  );

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TEAMS' | 'FIXTURES' | 'STANDINGS' | 'STATS' | 'CONFIG'>('OVERVIEW');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const selectedSeason = seasons.find(s => s.id === selectedSeasonId) || seasons[0];
  const parentComp = competitions.find(c => c.id === selectedSeason?.competitionId);

  // Teams participating in this specific season
  const seasonTeams = teams.filter(t => selectedSeason?.participatingTeamIds.includes(t.id));

  // Matches in this season
  const seasonMatches = allMatches.filter(m => 
    (m as any).seasonId === selectedSeason?.id || 
    m.competition.name.includes(parentComp?.name || '') ||
    m.competition.season?.includes(selectedSeason?.name || '')
  );

  // Dynamically calculated standings
  const standings = adminStore.calculateStandings(selectedSeason?.id);
  const topScorers = adminStore.getTopScorers();

  const handleStatusTransition = (nextStatus: SeasonLifecycleStatus) => {
    if (!selectedSeason) return;
    adminStore.updateSeasonStatus(selectedSeason.id, nextStatus);
    setFeedbackNotice(`Season lifecycle progressed to ${nextStatus.replace('_', ' ')}.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleTogglePublication = () => {
    if (!selectedSeason) return;
    const nextState = !selectedSeason.isPublished;
    adminStore.toggleSeasonPublication(selectedSeason.id, nextState);
    setFeedbackNotice(`Season ${nextState ? 'published to' : 'withdrawn from'} public fan portal.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  if (!selectedSeason) {
    return (
      <div className="admin-empty-centre">
        <div className="empty-centre-card">
          <CalendarRange size={40} className="empty-icon" />
          <h2>No Seasons Found</h2>
          <p>Initialize a new season to manage championship schedules, participating clubs, and standings.</p>
          <button className="admin-action-btn primary" onClick={onOpenCreateSeasonModal}>
            <Plus size={14} /> Initialize New Season
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-module-container">
      {/* Top Banner with Season Selector */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <CalendarRange size={14} className="eyebrow-icon" />
            <span>SEASON LIFECYCLE MANAGEMENT</span>
          </div>
          <h1 className="module-title">{selectedSeason.name}</h1>
          <p className="module-subtitle">
            Part of <strong>{parentComp?.name}</strong> • Comprehensive operational tabs for participating teams, schedule, table, and publication.
          </p>
        </div>

        <div className="top-bar-actions">
          {/* Quick Season Switcher */}
          <div className="season-switcher-box">
            <label className="switcher-label">Switch Edition:</label>
            <select 
              className="admin-select-sm"
              value={selectedSeasonId}
              onChange={(e) => {
                setSelectedSeasonId(e.target.value);
                adminStore.setSelectedSeasonId(e.target.value);
              }}
            >
              {seasons.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <button 
            className="admin-action-btn primary"
            onClick={onOpenCreateSeasonModal}
          >
            <Plus size={15} /> New Season
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="admin-inline-alert success">
          <CheckCircle size={16} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Season Overview Inspector Card */}
      <div className="season-inspector-card">
        <div className="inspector-top-row">
          <div className="season-meta-left">
            <div className="season-badge-icon">
              <Trophy size={26} />
            </div>
            <div>
              <div className="season-chips">
                <span className="comp-tag">{parentComp?.name}</span>
                <span className="year-tag">{selectedSeason.year}</span>
                <AdminStatusBadge status={selectedSeason.status} size="sm" />
              </div>
              <h2 className="season-display-title">{selectedSeason.name}</h2>
              <span className="season-dates-meta">
                Window: <strong>{selectedSeason.startDate}</strong> to <strong>{selectedSeason.endDate}</strong> • Registration Cutoff: <strong>{selectedSeason.registrationDeadline}</strong>
              </span>
            </div>
          </div>

          <div className="season-actions-right">
            <button 
              className={`pub-toggle-btn ${selectedSeason.isPublished ? 'published' : 'draft'}`}
              onClick={handleTogglePublication}
              title={selectedSeason.isPublished ? 'Click to hide from public app' : 'Click to publish to public app'}
            >
              {selectedSeason.isPublished ? (
                <>
                  <Eye size={14} />
                  <span>Public Portal Active</span>
                </>
              ) : (
                <>
                  <EyeOff size={14} />
                  <span>Draft (Hidden)</span>
                </>
              )}
            </button>

            {/* Lifecycle Progression Control */}
            {selectedSeason.status === 'PLANNING' && (
              <button 
                className="admin-action-btn primary sm"
                onClick={() => handleStatusTransition('REGISTRATION_OPEN')}
              >
                Open Registrations ➔
              </button>
            )}
            {selectedSeason.status === 'REGISTRATION_OPEN' && (
              <button 
                className="admin-action-btn primary sm"
                onClick={() => handleStatusTransition('IN_PROGRESS')}
              >
                Start Season ➔
              </button>
            )}
            {selectedSeason.status === 'IN_PROGRESS' && (
              <button 
                className="admin-action-btn secondary sm"
                onClick={() => handleStatusTransition('CONCLUDED')}
              >
                Conclude Season ➔
              </button>
            )}
          </div>
        </div>

        {/* 7 Contextual Tabs for Season Workflows */}
        <div className="inspector-nav-tabs">
          <button 
            className={`inspector-tab ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            <Layers size={15} /> Overview & Milestones
          </button>
          <button 
            className={`inspector-tab ${activeTab === 'TEAMS' ? 'active' : ''}`}
            onClick={() => setActiveTab('TEAMS')}
          >
            <Users size={15} /> Participating Teams ({seasonTeams.length})
          </button>
          <button 
            className={`inspector-tab ${activeTab === 'FIXTURES' ? 'active' : ''}`}
            onClick={() => setActiveTab('FIXTURES')}
          >
            <Calendar size={15} /> Fixtures & Schedule ({seasonMatches.length})
          </button>
          <button 
            className={`inspector-tab ${activeTab === 'STANDINGS' ? 'active' : ''}`}
            onClick={() => setActiveTab('STANDINGS')}
          >
            <Trophy size={15} /> Standings & Table
          </button>
          <button 
            className={`inspector-tab ${activeTab === 'STATS' ? 'active' : ''}`}
            onClick={() => setActiveTab('STATS')}
          >
            <BarChart3 size={15} /> Statistics & Integrity
          </button>
          <button 
            className={`inspector-tab ${activeTab === 'CONFIG' ? 'active' : ''}`}
            onClick={() => setActiveTab('CONFIG')}
          >
            <Sliders size={15} /> Season Rules & Configuration
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="inspector-tab-content">
            <div className="season-kpi-row">
              <div className="kpi-mini-card">
                <span className="mini-label">Participating Clubs</span>
                <span className="mini-val">{seasonTeams.length}</span>
                <span className="mini-sub">Approved by NSFC</span>
              </div>
              <div className="kpi-mini-card">
                <span className="mini-label">Total Matchdays</span>
                <span className="mini-val">{selectedSeason.roundsCount}</span>
                <span className="mini-sub">Current: Round {selectedSeason.currentRound}</span>
              </div>
              <div className="kpi-mini-card">
                <span className="mini-label">Fixtures Logged</span>
                <span className="mini-val">{seasonMatches.length}</span>
                <span className="mini-sub">{seasonMatches.filter(m => m.status === 'VERIFIED_PUBLISHED').length} Verified</span>
              </div>
              <div className="kpi-mini-card">
                <span className="mini-label">Standings Status</span>
                <span className="mini-val highlight">Live Auto-Sync</span>
                <span className="mini-sub">Official Tiebreakers Enforced</span>
              </div>
            </div>

            <div className="setup-dependencies-panel">
              <h4 className="dep-title">Season Readiness & Dependency Checklist</h4>
              <p className="dep-desc">
                NSFC operational criteria required before matchday fixtures can be published:
              </p>

              <div className="dep-checklist">
                <div className="dep-item complete">
                  <div className="dep-check"><Check size={14} /></div>
                  <div className="dep-text">
                    <strong>Championship Parent League Configured</strong>
                    <span>Linked to {parentComp?.name} ({parentComp?.tier})</span>
                  </div>
                </div>

                <div className={`dep-item ${seasonTeams.length >= 4 ? 'complete' : 'pending'}`}>
                  <div className="dep-check">{seasonTeams.length >= 4 ? <Check size={14} /> : <AlertTriangle size={14} />}</div>
                  <div className="dep-text">
                    <strong>Minimum Participating Teams Onboarded ({seasonTeams.length} / 4 minimum)</strong>
                    <span>{seasonTeams.length >= 4 ? 'Minimum threshold satisfied' : 'Onboard additional teams prior to schedule generation'}</span>
                  </div>
                  <button className="dep-btn" onClick={() => setActiveTab('TEAMS')}>Manage Teams</button>
                </div>

                <div className={`dep-item ${seasonMatches.length > 0 ? 'complete' : 'pending'}`}>
                  <div className="dep-check">{seasonMatches.length > 0 ? <Check size={14} /> : <AlertTriangle size={14} />}</div>
                  <div className="dep-text">
                    <strong>Schedule & Fixture Generation</strong>
                    <span>{seasonMatches.length > 0 ? `${seasonMatches.length} fixtures scheduled across matchdays` : 'No fixtures generated for this season yet'}</span>
                  </div>
                  <button className="dep-btn" onClick={onOpenScheduleModal}>Create Fixture</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PARTICIPATING TEAMS */}
        {activeTab === 'TEAMS' && (
          <div className="inspector-tab-content">
            <div className="content-action-header">
              <div>
                <h3 className="content-title">Clubs Registered in {selectedSeason.name}</h3>
                <span className="content-sub">Teams verified for championship participation and match roster eligibility.</span>
              </div>
              <button 
                className="admin-action-btn primary sm"
                onClick={() => onNavigate('teams-players')}
              >
                <Plus size={14} /> Register Club
              </button>
            </div>

            <div className="teams-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Home Stadium</th>
                    <th>Head Coach</th>
                    <th>Affiliation Status</th>
                    <th>Season Registration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonTeams.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="team-cell-display">
                          <span className="team-logo-small">{t.logo}</span>
                          <div>
                            <strong>{t.name}</strong>
                            <span className="team-code">[{t.shortName}]</span>
                          </div>
                        </div>
                      </td>
                      <td>{t.stadium}</td>
                      <td>
                        <div>{t.headCoachName}</div>
                        <div className="sub-text">{t.headCoachEmail}</div>
                      </td>
                      <td>
                        <AdminStatusBadge status={t.status} size="sm" />
                      </td>
                      <td>
                        <span className="sync-chip verified">Verified</span>
                      </td>
                      <td>
                        <button 
                          className="admin-action-btn secondary xs"
                          onClick={() => onNavigate('teams-players', t.id)}
                        >
                          View Squad ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FIXTURES & SCHEDULE */}
        {activeTab === 'FIXTURES' && (
          <div className="inspector-tab-content">
            <div className="content-action-header">
              <div>
                <h3 className="content-title">Fixture Schedule ({seasonMatches.length} Matches)</h3>
                <span className="content-sub">Match operations, pitchside tracking, and result verification queue.</span>
              </div>
              <button 
                className="admin-action-btn primary sm"
                onClick={onOpenScheduleModal}
              >
                <Plus size={14} /> Schedule Fixture
              </button>
            </div>

            <div className="fixtures-list-compact">
              {seasonMatches.map((m) => (
                <div key={m.id} className="fixture-item-row">
                  <div className="f-datetime-col">
                    <strong>{m.date}</strong>
                    <span>{m.time}</span>
                  </div>

                  <div className="f-teams-col">
                    <span className="f-team home">
                      <span>{m.homeTeam.name}</span>
                      <span className="team-badge-icon">{m.homeTeam.logo}</span>
                    </span>

                    <div className="f-score-col">
                      {['VERIFIED_PUBLISHED', 'FULL_TIME_PENDING_REVIEW', 'FIRST_HALF', 'HALF_TIME', 'SECOND_HALF'].includes(m.status) ? (
                        <span className="score-num">
                          {m.homeScore} - {m.awayScore}
                        </span>
                      ) : (
                        <span className="score-vs">VS</span>
                      )}
                    </div>

                    <span className="f-team away">
                      <span className="team-badge-icon">{m.awayTeam.logo}</span>
                      <span>{m.awayTeam.name}</span>
                    </span>
                  </div>

                  <div className="f-venue-col">
                    <span className="v-name">{m.venue}</span>
                    <span className="v-round">{m.round}</span>
                  </div>

                  <div className="f-status-col">
                    <AdminStatusBadge status={m.status} size="sm" />
                  </div>

                  <div className="f-actions-col">
                    <button 
                      className="admin-action-btn secondary xs"
                      onClick={() => onNavigate('match-operations', m.id)}
                    >
                      Operations ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STANDINGS & POINTS TABLE */}
        {activeTab === 'STANDINGS' && (
          <div className="inspector-tab-content">
            <div className="content-action-header">
              <div>
                <h3 className="content-title">Official Season Standings</h3>
                <span className="content-sub">
                  Calculated automatically from verified match results under NSFC tiebreaker rules.
                </span>
              </div>
              <button 
                className="admin-action-btn secondary sm"
                onClick={() => onNavigate('results-stats')}
              >
                Manage Standings & Penalties ➔
              </button>
            </div>

            <div className="standings-table-wrapper">
              <table className="admin-table standings-table">
                <thead>
                  <tr>
                    <th className="pos-col">Pos</th>
                    <th>Club</th>
                    <th className="num-col">P</th>
                    <th className="num-col">W</th>
                    <th className="num-col">D</th>
                    <th className="num-col">L</th>
                    <th className="num-col">GF</th>
                    <th className="num-col">GA</th>
                    <th className="num-col">GD</th>
                    <th className="num-col pts-header">PTS</th>
                    <th>Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={row.teamId} className={row.position <= 2 ? 'top-tier' : ''}>
                      <td className="pos-cell">
                        <span className={`pos-number pos-${row.position}`}>{row.position}</span>
                      </td>
                      <td>
                        <div className="team-cell-display">
                          <span className="team-logo-small">{row.logo}</span>
                          <strong>{row.teamName}</strong>
                          {row.pointsDeduction > 0 && (
                            <span className="points-penalty-chip" title="Points deducted due to disciplinary sanction">
                              -{row.pointsDeduction}pts sanction
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="num-col tabular-nums">{row.played}</td>
                      <td className="num-col tabular-nums">{row.won}</td>
                      <td className="num-col tabular-nums">{row.drawn}</td>
                      <td className="num-col tabular-nums">{row.lost}</td>
                      <td className="num-col tabular-nums">{row.goalsFor}</td>
                      <td className="num-col tabular-nums">{row.goalsAgainst}</td>
                      <td className="num-col tabular-nums font-bold">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td className="num-col pts-cell tabular-nums font-bold">
                        {row.points}
                      </td>
                      <td>
                        <div className="form-pills-row">
                          {row.form.map((f, i) => (
                            <span key={i} className={`form-pill form-${f.toLowerCase()}`}>{f}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: STATISTICS */}
        {activeTab === 'STATS' && (
          <div className="inspector-tab-content">
            <div className="content-action-header">
              <div>
                <h3 className="content-title">Statistical Integrity & Golden Boot</h3>
                <span className="content-sub">Official individual player performance and disciplinary records.</span>
              </div>
            </div>

            <div className="stats-cards-grid">
              <div className="stats-box">
                <h4>Top Goal Scorers</h4>
                <div className="stats-leader-list">
                  {topScorers.map((s) => (
                    <div key={s.playerId} className="leader-item">
                      <span className="leader-rank">#{s.rank}</span>
                      <div className="leader-info">
                        <strong>{s.playerName}</strong>
                        <span>{s.teamLogo} {s.teamName}</span>
                      </div>
                      <span className="leader-score">{s.goals} Goals</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stats-box">
                <h4>Playmakers (Assists)</h4>
                <div className="stats-leader-list">
                  {topScorers.slice(0, 3).map((s) => (
                    <div key={s.playerId} className="leader-item">
                      <span className="leader-rank">#{s.rank}</span>
                      <div className="leader-info">
                        <strong>{s.playerName}</strong>
                        <span>{s.teamLogo} {s.teamName}</span>
                      </div>
                      <span className="leader-score">{s.assists} Assists</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CONFIG */}
        {activeTab === 'CONFIG' && (
          <div className="inspector-tab-content">
            <div className="content-action-header">
              <div>
                <h3 className="content-title">Season Regulations & Match Constraints</h3>
                <span className="content-sub">Governing parameters configured for this season edition.</span>
              </div>
            </div>

            <div className="config-grid">
              <div className="config-card">
                <span className="config-label">Season Name</span>
                <strong>{selectedSeason.name}</strong>
              </div>
              <div className="config-card">
                <span className="config-label">Academic Year</span>
                <strong>{selectedSeason.year}</strong>
              </div>
              <div className="config-card">
                <span className="config-label">Rules Summary</span>
                <span>{selectedSeason.rulesSummary}</span>
              </div>
              <div className="config-card">
                <span className="config-label">Parent Championship</span>
                <strong>{parentComp?.name} ({parentComp?.tier})</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
