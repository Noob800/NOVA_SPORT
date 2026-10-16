import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Users, AlertCircle, Plus, Send, 
  Dumbbell, Bell, ChevronRight, Trophy, Flame,
  MapPin, ShieldAlert, Award, ExternalLink
} from 'lucide-react';
import type { TeamProfileDetails, SquadPlayer, TeamFixture, TeamRequest, TeamAnnouncement } from '../../../services/teamDeskStore';

export interface CompetitionPerformance {
  id: string;
  name: string;
  season: string;
  type: 'CURRENT_LEAGUE' | 'TOURNAMENT' | 'PAST_LEAGUE';
  badgeLabel: string;
  stageOrRank: string;
  statusNote: string;
  points: number | string;
  played: number;
  record: string;
  goalDifference: string;
  form: ('W' | 'D' | 'L')[];
  cleanSheets: number;
  topScorerName: string;
  topScorerGoals: number;
  awardOrNote: string;
  linkHref?: string;
}

interface OverviewSectionProps {
  profile: TeamProfileDetails;
  squad: SquadPlayer[];
  nextFixture?: TeamFixture;
  recentResults: TeamFixture[];
  requests: TeamRequest[];
  announcements: TeamAnnouncement[];
  managedTeams?: string[];
  currentTeamId: string;
  onSwitchTeam: (teamId: string) => void;
  onOpenAddPlayer: () => void;
  onOpenMatchPrep: (fixture: TeamFixture) => void;
  onOpenScheduleTraining: () => void;
  onOpenNewRequest: () => void;
  onOpenNotices: () => void;
}

export function OverviewSection({
  profile,
  squad,
  nextFixture,
  recentResults,
  requests,
  announcements,
  managedTeams,
  currentTeamId,
  onSwitchTeam,
  onOpenAddPlayer,
  onOpenMatchPrep,
  onOpenScheduleTraining,
  onOpenNewRequest,
  onOpenNotices
}: OverviewSectionProps) {
  // Find top scorer
  const topScorer = [...squad].sort((a, b) => b.goals - a.goals)[0];

  // Competitions & Tournaments Performance List
  const competitionsList: CompetitionPerformance[] = [
    {
      id: 'kemu-s8',
      name: 'KeMU Super League',
      season: 'Season 8 (2026/27)',
      type: 'CURRENT_LEAGUE',
      badgeLabel: 'Active League',
      stageOrRank: currentTeamId === 't1' ? '1st' : '2nd',
      statusNote: currentTeamId === 't1' ? 'League Leaders • Promotion Zone' : 'Title Contenders • Promotion Zone',
      points: currentTeamId === 't1' ? 42 : 39,
      played: 18,
      record: currentTeamId === 't1' ? '13W • 3D • 2L' : '12W • 3D • 3L',
      goalDifference: currentTeamId === 't1' ? '+24 (40 GF / 16 GA)' : '+18 (34 GF / 16 GA)',
      form: currentTeamId === 't1' ? ['W', 'D', 'W', 'L', 'W'] : ['W', 'W', 'D', 'W', 'L'],
      cleanSheets: currentTeamId === 't1' ? 10 : 8,
      topScorerName: topScorer ? topScorer.name : 'David Kiptoo',
      topScorerGoals: topScorer ? topScorer.goals : 12,
      awardOrNote: currentTeamId === 't1' ? 'Currently leading the table by 3 points.' : 'Automatic Promotion Zone • 3 Pts behind League Leaders'
    },
    {
      id: 'meru-county-cup-2026',
      name: 'Meru County Knockout Cup',
      season: '2026 Mid-Season',
      type: 'TOURNAMENT',
      badgeLabel: 'Active Tournament',
      stageOrRank: 'Semi-Finals',
      statusNote: 'Knockout Stage • Final Four',
      points: '9 Pts (Cup)',
      played: 3,
      record: '3W • 0D • 0L (Undefeated)',
      goalDifference: '+7 (9 GF / 2 GA)',
      form: ['W', 'W', 'W'],
      cleanSheets: 2,
      topScorerName: 'Brian Otieno',
      topScorerGoals: 3,
      awardOrNote: 'Upcoming: Semi-Final clash vs Mt. Kenya All-Stars (Nov 1)'
    },
    {
      id: 'varsity-champions-2026',
      name: 'Varsity Champions Trophy',
      season: '2026 Regional',
      type: 'TOURNAMENT',
      badgeLabel: 'Tournament Group Stage',
      stageOrRank: '1st in Group B',
      statusNote: 'Qualified for Quarter-Finals',
      points: 7,
      played: 3,
      record: '2W • 1D • 0L',
      goalDifference: '+4 (6 GF / 2 GA)',
      form: ['W', 'W', 'D'],
      cleanSheets: 1,
      topScorerName: topScorer ? topScorer.name : 'David Kiptoo',
      topScorerGoals: 4,
      awardOrNote: 'Seeded in Top Pot for Championship Knockout Rounds'
    },
    {
      id: 'kemu-s7',
      name: 'KeMU Super League',
      season: 'Season 7 (2024/25)',
      type: 'PAST_LEAGUE',
      badgeLabel: 'Past League Archive',
      stageOrRank: '1st 🏆',
      statusNote: 'League Champions • Gold Medals',
      points: 54,
      played: 22,
      record: '17W • 3D • 2L',
      goalDifference: '+32 (48 GF / 16 GA)',
      form: ['W', 'W', 'W', 'W', 'D'],
      cleanSheets: 11,
      topScorerName: 'David Kiptoo',
      topScorerGoals: 19,
      awardOrNote: '🏆 Champions Trophy Winners • Manager of the Year Honoree'
    },
    {
      id: 'kemu-s6',
      name: 'KeMU Super League',
      season: 'Season 6 (2023/24)',
      type: 'PAST_LEAGUE',
      badgeLabel: 'Past League Archive',
      stageOrRank: '3rd 🥉',
      statusNote: 'Podium Finish • Bronze Medals',
      points: 46,
      played: 22,
      record: '14W • 4D • 4L',
      goalDifference: '+21 (41 GF / 20 GA)',
      form: ['W', 'D', 'W', 'L', 'W'],
      cleanSheets: 9,
      topScorerName: 'Samuel Mwaura',
      topScorerGoals: 14,
      awardOrNote: 'Qualified for Inter-County Super Cup'
    }
  ];

  const [selectedCompId, setSelectedCompId] = useState<string>('kemu-s8');
  const activeComp = competitionsList.find(c => c.id === selectedCompId) || competitionsList[0];

  // Calculate squad availability numbers
  const fitCount = squad.filter(p => p.availability === 'FIT').length;
  const injuredCount = squad.filter(p => p.availability === 'INJURED').length;
  const doubtfulCount = squad.filter(p => p.availability === 'DOUBTFUL').length;
  const suspendedCount = squad.filter(p => p.availability === 'SUSPENDED').length;
  const avgAttendance = squad.length > 0 
    ? Math.round(squad.reduce((acc, p) => acc + p.trainingAttendance, 0) / squad.length)
    : 100;

  // Active / pending requests
  const activeRequests = requests.filter(r => r.status === 'IN_REVIEW' || r.status === 'SUBMITTED');

  return (
    <div className="overview-container">
      {/* MERGED TEAM IDENTITY & TEAM PERFORMANCE HUB */}
      <div className="team-desk-header-merged">
        {/* Top Identity Row: Crest, Name, Motto, Switcher */}
        <div className="team-desk-header-top">
          <div className="team-identity-group">
            <div className="team-crest-badge">{profile.logo}</div>
            <div className="team-meta-info">
              <h1>
                {profile.name}
                <span className="team-badge-pill">Verified Coach</span>
              </h1>
              <div className="team-meta-sub">
                <span>{profile.season}</span>
                <span>•</span>
                <span>{profile.motto}</span>
                <span>•</span>
                <span>Home: {profile.homeVenue}</span>
              </div>
            </div>
          </div>

          {/* Team Switcher if multiple teams managed */}
          {managedTeams && managedTeams.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Team:</span>
              <select
                value={currentTeamId}
                onChange={e => onSwitchTeam(e.target.value)}
                className="team-switcher-select"
              >
                <option value="t2">Nova City FC (NC)</option>
                <option value="t1">KeMU FC (KEM)</option>
              </select>
            </div>
          )}
        </div>

        {/* Competition & Tournament Selector Tabs */}
        <div className="comp-perf-selector-bar">
          <div className="comp-perf-tabs-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--nova-orange)' }}>
              <Flame size={16} /> TEAM PERFORMANCE BY TOURNAMENT & LEAGUE:
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Toggle active leagues, tournament runs, or past league records
            </span>
          </div>

          <div className="comp-perf-tabs">
            {competitionsList.map(comp => {
              const isSelected = selectedCompId === comp.id;
              const isCup = comp.type === 'TOURNAMENT';
              const isPast = comp.type === 'PAST_LEAGUE';

              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`comp-perf-tab-btn ${isSelected ? 'active' : ''}`}
                >
                  <span className="comp-tab-icon">
                    {isCup ? '🥊' : isPast ? '📜' : '🏆'}
                  </span>
                  <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <div className="comp-tab-title">{comp.name}</div>
                    <div className="comp-tab-subtitle">
                      {comp.season} • <strong style={{ color: isSelected ? 'var(--nova-orange)' : 'var(--stadium-white)' }}>{comp.stageOrRank}</strong>
                    </div>
                  </div>
                  {isSelected && <span className="comp-tab-active-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Competition Performance Metrics Card */}
        <div className="comp-perf-metrics-card">
          <div className="comp-perf-header-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--stadium-white)' }}>
                  {activeComp.name} — {activeComp.season}
                </span>
                <span className={`status-pill ${activeComp.type === 'CURRENT_LEAGUE' ? 'fit' : activeComp.type === 'TOURNAMENT' ? 'doubtful' : 'suspended'}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                  {activeComp.badgeLabel}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {activeComp.statusNote}
              </div>
            </div>

            <Link
              to="/competitions/c1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                color: 'var(--nova-orange)',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Standings & Bracket <ExternalLink size={13} />
            </Link>
          </div>

          {/* 4 Stat Boxes Grid */}
          <div className="comp-perf-grid">
            <div className="comp-perf-stat-box">
              <div className="comp-perf-stat-label">
                {activeComp.type === 'CURRENT_LEAGUE' ? 'LEAGUE STANDING' : activeComp.type === 'TOURNAMENT' ? 'TOURNAMENT STAGE' : 'FINAL POSITION'}
              </div>
              <div className="comp-perf-stat-value" style={{ color: 'var(--nova-orange)' }}>
                {activeComp.stageOrRank}
              </div>
              <div className="comp-perf-stat-sub">
                {activeComp.statusNote}
              </div>
            </div>

            <div className="comp-perf-stat-box">
              <div className="comp-perf-stat-label">RECORD & POINTS</div>
              <div className="comp-perf-stat-value">
                {activeComp.points}
              </div>
              <div className="comp-perf-stat-sub">
                {activeComp.record} ({activeComp.played} MP)
              </div>
            </div>

            <div className="comp-perf-stat-box">
              <div className="comp-perf-stat-label">FORM & GOAL DIFF</div>
              <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', margin: '4px 0' }}>
                {activeComp.form.map((f, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: f === 'W' ? 'rgba(46, 204, 113, 0.2)' : f === 'D' ? 'var(--surface-elevated)' : 'rgba(255, 68, 68, 0.2)',
                      color: f === 'W' ? 'var(--success)' : f === 'D' ? 'var(--text-muted)' : 'var(--error)',
                      border: f === 'W' ? '1px solid rgba(46, 204, 113, 0.4)' : f === 'D' ? '1px solid var(--border-subtle)' : '1px solid rgba(255, 68, 68, 0.4)'
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div className="comp-perf-stat-sub">
                GD: {activeComp.goalDifference}
              </div>
            </div>

            <div className="comp-perf-stat-box">
              <div className="comp-perf-stat-label">TOP SCORER & DEFENSE</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--stadium-white)', marginTop: '4px' }}>
                {activeComp.topScorerName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--nova-orange)', fontWeight: 600 }}>
                {activeComp.topScorerGoals} Goals in Competition
              </div>
              <div className="comp-perf-stat-sub">
                {activeComp.cleanSheets} Clean Sheets Recorded
              </div>
            </div>
          </div>

          {/* Achievement / Highlight Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 94, 0, 0.08)', border: '1px solid rgba(255, 94, 0, 0.2)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--stadium-white)' }}>
            <Award size={15} color="var(--nova-orange)" style={{ flexShrink: 0 }} />
            <span><strong>Tournament Highlight:</strong> {activeComp.awardOrNote}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="quick-actions-bar">
        <button onClick={onOpenAddPlayer} className="quick-action-btn primary">
          <Plus size={16} /> Invite Player
        </button>
        {nextFixture && (
          <button onClick={() => onOpenMatchPrep(nextFixture)} className="quick-action-btn">
            <Calendar size={16} /> Prepare Match
          </button>
        )}
        <button onClick={onOpenScheduleTraining} className="quick-action-btn">
          <Dumbbell size={16} /> Schedule Training
        </button>
        <button onClick={onOpenNewRequest} className="quick-action-btn">
          <Send size={16} /> Submit Request
        </button>
        <button onClick={onOpenNotices} className="quick-action-btn">
          <Bell size={16} /> Publish Notice
        </button>
      </div>

      {/* Urgent Pending Action Banner */}
      {nextFixture && !nextFixture.preparation?.submittedToLeague && (
        <div className="urgent-banner warning">
          <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--stadium-white)' }}>
              Matchday Lineup Required for Upcoming Fixture
            </div>
            <p style={{ margin: '2px 0 8px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Official matchday squad submission against {nextFixture.homeTeamId === currentTeamId ? nextFixture.awayTeamName : nextFixture.homeTeamName} is due before kickoff.
            </p>
            <button
              onClick={() => onOpenMatchPrep(nextFixture)}
              className="login-button"
              style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Confirm Matchday XI
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="overview-grid-layout">
        {/* Left Column: Fixtures, Squad Readiness, Recent Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Next Fixture Hero Card */}
          <section className="card-panel">
            <div className="panel-header" style={{ marginBottom: 'var(--space-3)' }}>
              <h3><Calendar size={18} /> Next Fixture</h3>
              {nextFixture && (
                <span style={{ fontSize: '0.75rem', color: 'var(--nova-orange)', fontWeight: 600 }}>
                  Match Preparation
                </span>
              )}
            </div>

            {nextFixture ? (
              <div>
                <div className="match-card-expanded" style={{ cursor: 'pointer' }} onClick={() => onOpenMatchPrep(nextFixture)}>
                  <div className="expanded-header">
                    <span className="match-status tabular-nums">{nextFixture.date} • {nextFixture.time}</span>
                    <span className="status-pill fit">{nextFixture.competitionName}</span>
                  </div>
                  <div className="match-scoreboard">
                    <div className="team">
                      <span className="team-logo-prominent">{nextFixture.homeTeamLogo}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', marginTop: '4px' }}>
                        {nextFixture.homeTeamName}
                      </span>
                    </div>
                    <div className="score-wrapper">
                      <span className="score-divider">VS</span>
                    </div>
                    <div className="team">
                      <span className="team-logo-prominent">{nextFixture.awayTeamLogo}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', marginTop: '4px' }}>
                        {nextFixture.awayTeamName}
                      </span>
                    </div>
                  </div>
                  <div className="expanded-footer">
                    <span><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />{nextFixture.venue}</span>
                    <span style={{ color: 'var(--nova-orange)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Prepare Lineup <ChevronRight size={14} />
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => onOpenMatchPrep(nextFixture)}
                    className="login-button"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}
                  >
                    Open Match Preparation
                  </button>
                  <Link
                    to="/workspace/team/fixtures"
                    style={{
                      padding: '8px 14px',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--stadium-white)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    View All Fixtures
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No upcoming fixtures scheduled.
              </div>
            )}
          </section>

          {/* Squad Availability Summary */}
          <section className="card-panel">
            <div className="panel-header" style={{ marginBottom: 'var(--space-3)' }}>
              <h3><Users size={18} /> Squad Availability & Readiness</h3>
              <Link to="/workspace/team/squad" style={{ fontSize: '0.78rem', color: 'var(--nova-orange)', textDecoration: 'none', fontWeight: 600 }}>
                Manage Squad →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px', textAlign: 'center' }}>
              <div style={{ background: 'var(--pitch-black)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span className="status-pill fit" style={{ marginBottom: '4px' }}>Fit</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>{fitCount}</div>
              </div>
              <div style={{ background: 'var(--pitch-black)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span className="status-pill injured" style={{ marginBottom: '4px' }}>Injured</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{injuredCount}</div>
              </div>
              <div style={{ background: 'var(--pitch-black)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span className="status-pill doubtful" style={{ marginBottom: '4px' }}>Doubt</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{doubtfulCount}</div>
              </div>
              <div style={{ background: 'var(--pitch-black)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span className="status-pill suspended" style={{ marginBottom: '4px' }}>Susp</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>{suspendedCount}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--pitch-black)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <span>Squad Training Attendance Rate:</span>
              <strong style={{ color: '#10b981', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                {avgAttendance}%
              </strong>
            </div>
          </section>

          {/* Recent Results */}
          <section className="card-panel">
            <div className="panel-header" style={{ marginBottom: 'var(--space-3)' }}>
              <h3><Trophy size={18} /> Recent Results & Verified Scores</h3>
              <Link to="/workspace/team/stats" style={{ fontSize: '0.78rem', color: 'var(--nova-orange)', textDecoration: 'none', fontWeight: 600 }}>
                Full Analytics →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentResults.slice(0, 3).map(res => (
                <div
                  key={res.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--pitch-black)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{res.homeTeamLogo}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{res.homeTeamName}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--nova-orange)', fontSize: '1.1rem' }}>
                      {res.homeScore} - {res.awayScore}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{res.awayTeamName}</span>
                    <span style={{ fontSize: '1.2rem' }}>{res.awayTeamLogo}</span>
                  </div>
                  <span className="status-pill fit" style={{ fontSize: '0.65rem' }}>
                    FT
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Governance Requests, Team Bulletins, Disciplinary Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Disciplinary & Fair Play Snapshot */}
          <section className="card-panel">
            <div className="panel-header" style={{ marginBottom: 'var(--space-3)' }}>
              <h3><ShieldAlert size={18} /> Squad Discipline & Fair Play</h3>
              <Link to="/workspace/team/stats" style={{ fontSize: '0.78rem', color: 'var(--nova-orange)', textDecoration: 'none', fontWeight: 600 }}>
                Details →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ background: 'var(--pitch-black)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>YELLOWS</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>12</div>
              </div>
              <div style={{ background: 'var(--pitch-black)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>REDS</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>0</div>
              </div>
              <div style={{ background: 'var(--pitch-black)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FAIR PLAY</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>9.4/10</div>
              </div>
            </div>
          </section>

          {/* Outstanding Governance Requests */}
          <section className="card-panel">
            <div className="panel-header" style={{ marginBottom: 'var(--space-3)' }}>
              <h3><ShieldAlert size={18} /> Outstanding Requests ({activeRequests.length})</h3>
              <button
                onClick={onOpenNewRequest}
                style={{ background: 'transparent', border: 'none', color: 'var(--nova-orange)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
              >
                + New
              </button>
            </div>

            {requests.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                No active requests.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requests.slice(0, 3).map(req => (
                  <div
                    key={req.id}
                    style={{
                      background: 'var(--pitch-black)',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '0.82rem' }}>{req.title}</strong>
                      <span className={`status-pill ${req.status === 'APPROVED' ? 'fit' : req.status === 'IN_REVIEW' ? 'doubtful' : 'suspended'}`} style={{ fontSize: '0.65rem' }}>
                        {req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Ref: {req.id} • Reviewer: {req.assignedReviewer}
                    </div>
                  </div>
                ))}
                <Link
                  to="/workspace/team/settings"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--nova-orange)',
                    textDecoration: 'none',
                    marginTop: '4px'
                  }}
                >
                  View All in Requests Inbox →
                </Link>
              </div>
            )}
          </section>

          {/* Important Announcements Feed */}
          <section className="card-panel">
            <div className="panel-header" style={{ marginBottom: 'var(--space-3)' }}>
              <h3><Bell size={18} /> Team Bulletins & Notices</h3>
              <button
                onClick={onOpenNotices}
                style={{ background: 'transparent', border: 'none', color: 'var(--nova-orange)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
              >
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {announcements.slice(0, 2).map(ann => (
                <div
                  key={ann.id}
                  style={{
                    background: 'var(--pitch-black)',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--stadium-white)' }}>
                    {ann.title}
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ann.content}
                  </p>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {ann.date} • {ann.category}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
