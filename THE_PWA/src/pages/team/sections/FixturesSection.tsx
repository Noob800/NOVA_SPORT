import { useState } from 'react';
import { 
  Calendar, MapPin, Plus, CheckCircle2, 
  AlertCircle, ChevronRight
} from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';
import type { TeamFixture, SquadPlayer } from '../../../services/teamDeskStore';

interface FixturesSectionProps {
  fixtures: TeamFixture[];
  squad: SquadPlayer[];
  teamId: string;
  onOpenMatchPrep: (fixture: TeamFixture) => void;
  onRequestReschedule: (fixture: TeamFixture) => void;
  onRequestVenueChange: (fixture: TeamFixture) => void;
}

export function FixturesSection({
  fixtures,
  squad: _squad,
  teamId,
  onOpenMatchPrep,
  onRequestReschedule: _onRequestReschedule,
  onRequestVenueChange: _onRequestVenueChange
}: FixturesSectionProps) {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'FT' | 'POSTPONED'>('ALL');
  const [showProposeModal, setShowProposeModal] = useState(false);

  // Proposal modal state
  const [proposeOpponent, setProposeOpponent] = useState('Panthers FC');
  const [proposeDate, setProposeDate] = useState('2026-10-25');
  const [proposeTime, setProposeTime] = useState('15:00');
  const [proposeVenue, setProposeVenue] = useState('Nova City Stadium');
  const [proposeType, setProposeType] = useState('Friendly / Preparation Match');
  const [proposeSuccess, setProposeSuccess] = useState(false);

  const filteredFixtures = fixtures.filter(f => {
    if (filterStatus === 'ALL') return true;
    return f.status === filterStatus;
  });

  const handleProposeFixture = (e: React.FormEvent) => {
    e.preventDefault();
    teamDeskStore.submitRequest({
      teamId,
      category: 'GENERAL',
      title: `Fixture Proposal: vs ${proposeOpponent} (${proposeDate})`,
      description: `Proposed ${proposeType} at ${proposeVenue}, kickoff ${proposeTime}. Awaiting opposition agreement & league sanction.`,
      priority: 'MEDIUM'
    });
    setProposeSuccess(true);
    setTimeout(() => {
      setProposeSuccess(false);
      setShowProposeModal(false);
    }, 1200);
  };

  return (
    <div className="fixtures-section-container">
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>
            Match Schedule & Matchday Operations
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Official league fixtures, starting lineups, tactical notes and match reports
          </p>
        </div>

        <button
          onClick={() => setShowProposeModal(true)}
          className="quick-action-btn primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> Propose / Schedule Match
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="desk-subtabs">
        <button
          className={`desk-subtab-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterStatus('ALL')}
        >
          All Matches ({fixtures.length})
        </button>
        <button
          className={`desk-subtab-btn ${filterStatus === 'UPCOMING' ? 'active' : ''}`}
          onClick={() => setFilterStatus('UPCOMING')}
        >
          Upcoming ({fixtures.filter(f => f.status === 'UPCOMING').length})
        </button>
        <button
          className={`desk-subtab-btn ${filterStatus === 'FT' ? 'active' : ''}`}
          onClick={() => setFilterStatus('FT')}
        >
          Completed Results ({fixtures.filter(f => f.status === 'FT').length})
        </button>
      </div>

      {/* Fixtures List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filteredFixtures.map(fixture => {
          const hasPrep = fixture.preparation?.startingEleven && fixture.preparation.startingEleven.length === 11;
          const isSubmitted = fixture.preparation?.submittedToLeague;

          return (
            <div
              key={fixture.id}
              className="card-panel"
              style={{
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                border: '1px solid var(--border-subtle)'
              }}
              onClick={() => onOpenMatchPrep(fixture)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>{fixture.date} • {fixture.time}</span>
                  <span>•</span>
                  <span><MapPin size={14} style={{ display: 'inline', marginRight: '3px' }} />{fixture.venue}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="status-pill fit" style={{ fontSize: '0.7rem' }}>
                    {fixture.competitionName}
                  </span>
                  <span className={`status-pill ${fixture.status === 'FT' ? 'fit' : fixture.status === 'LIVE' ? 'injured' : 'doubtful'}`}>
                    {fixture.status}
                  </span>
                </div>
              </div>

              {/* Match Scoreboard */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                {/* Home Team */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span className="team-logo-medium">{fixture.homeTeamLogo}</span>
                  <div>
                    <strong style={{ fontSize: '1rem', color: fixture.homeTeamId === teamId ? 'var(--nova-orange)' : 'var(--stadium-white)' }}>
                      {fixture.homeTeamName}
                    </strong>
                    {fixture.homeTeamId === teamId && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Your Team (Home)</span>
                    )}
                  </div>
                </div>

                {/* Score / VS Center */}
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  {fixture.status === 'FT' ? (
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--stadium-white)' }}>
                      {fixture.homeScore} - {fixture.awayScore}
                    </div>
                  ) : fixture.status === 'LIVE' ? (
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--nova-orange)' }}>
                        {fixture.homeScore} - {fixture.awayScore}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>LIVE {fixture.minute}</span>
                    </div>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      VS
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end', textAlign: 'right' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: fixture.awayTeamId === teamId ? 'var(--nova-orange)' : 'var(--stadium-white)' }}>
                      {fixture.awayTeamName}
                    </strong>
                    {fixture.awayTeamId === teamId && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Your Team (Away)</span>
                    )}
                  </div>
                  <span className="team-logo-medium">{fixture.awayTeamLogo}</span>
                </div>
              </div>

              {/* Status and Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '10px', fontSize: '0.8rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isSubmitted ? (
                    <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                      <CheckCircle2 size={14} /> Official Sheet Submitted
                    </span>
                  ) : hasPrep ? (
                    <span style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                      <AlertCircle size={14} /> Lineup Saved (Draft)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Lineup Not Started
                    </span>
                  )}

                  {fixture.matchReportSubmitted && (
                    <span style={{ color: 'var(--nova-orange)', fontSize: '0.78rem' }}>
                      • Post-match report submitted
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--nova-orange)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Match Desk <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Propose / Schedule Fixture Modal */}
      {showProposeModal && (
        <div className="modal-overlay" onClick={() => setShowProposeModal(false)}>
          <div className="modal-content-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Propose Match / Fixture Reschedule</h3>
              <button onClick={() => setShowProposeModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {proposeSuccess ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#10b981' }}>
                <CheckCircle2 size={48} style={{ marginBottom: '12px' }} />
                <h3>Proposal Submitted to NSFC</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Your fixture proposal has been logged in the governance inbox for committee and opponent confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleProposeFixture}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Match Type</label>
                    <select
                      className="form-select"
                      value={proposeType}
                      onChange={e => setProposeType(e.target.value)}
                    >
                      <option value="Friendly / Preparation Match">Friendly / Preparation Match</option>
                      <option value="League Matchday Reschedule Proposal">League Matchday Reschedule Proposal</option>
                      <option value="Invitational Cup Match">Invitational Cup Match</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Opponent Team</label>
                    <select
                      className="form-select"
                      value={proposeOpponent}
                      onChange={e => setProposeOpponent(e.target.value)}
                    >
                      <option value="KeMU FC">KeMU FC</option>
                      <option value="United Campus">United Campus</option>
                      <option value="Rangers FC">Rangers FC</option>
                      <option value="Panthers FC">Panthers FC</option>
                      <option value="City FC">City FC</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Proposed Date</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={proposeDate}
                        onChange={e => setProposeDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Proposed Kickoff Time</label>
                      <input
                        type="time"
                        className="form-input"
                        required
                        value={proposeTime}
                        onChange={e => setProposeTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={proposeVenue}
                      onChange={e => setProposeVenue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowProposeModal(false)}
                    style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--stadium-white)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="login-button" style={{ padding: '8px 20px', fontWeight: 600 }}>
                    Submit Proposal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
