import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Award, 
  X
} from 'lucide-react';
import { adminStore, type OfficialRecord } from '../../../services/adminStore';
import { matchStore, type OfficialMatchData } from '../../../services/matchStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface MatchOperationsViewProps {
  initialMatchId?: string;
  onNavigate: (section: string, subId?: string) => void;
  onOpenScheduleModal: () => void;
}

export const MatchOperationsView: React.FC<MatchOperationsViewProps> = ({
  initialMatchId,
  onNavigate,
  onOpenScheduleModal
}) => {
  const matches = matchStore.getAllMatches();
  const officials = adminStore.getOfficials();

  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'READINESS' | 'OFFICIALS'>('SCHEDULE');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'READY' | 'LIVE' | 'REVIEW' | 'VERIFIED' | 'POSTPONED'>('ALL');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialMatchId) {
      const match = matches.find(m => m.id === initialMatchId);
      if (match) {
        setActiveTab('READINESS');
      }
    }
  }, [initialMatchId, matches]);

  // Reschedule fixture state
  const [selectedMatchForReschedule, setSelectedMatchForReschedule] = useState<OfficialMatchData | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Official appointment state
  const [selectedMatchForOfficial, setSelectedMatchForOfficial] = useState<OfficialMatchData | null>(null);
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>(officials[0]?.id || '');
  const [selectedOfficialRole, setSelectedOfficialRole] = useState<OfficialRecord['role']>('Center Referee');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const filteredMatches = matches.filter(m => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'SCHEDULED') return m.status === 'SCHEDULED';
    if (statusFilter === 'READY') return m.status === 'READY';
    if (statusFilter === 'LIVE') return ['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF'].includes(m.status);
    if (statusFilter === 'REVIEW') return m.status === 'FULL_TIME_PENDING_REVIEW';
    if (statusFilter === 'VERIFIED') return m.status === 'VERIFIED_PUBLISHED';
    if (statusFilter === 'POSTPONED') return m.status === 'POSTPONED' || m.status === 'ABANDONED';
    return true;
  });

  const handleOpenAppointModal = (match: OfficialMatchData) => {
    setSelectedMatchForOfficial(match);
    setSelectedOfficialId(officials[0]?.id || '');
    setSelectedOfficialRole('Center Referee');
    const conflict = adminStore.checkOfficialConflict(officials[0]?.id || '', match.id);
    setConflictWarning(conflict.hasConflict ? conflict.conflictReason || 'Conflict detected' : null);
  };

  const handleOfficialChange = (officialId: string) => {
    setSelectedOfficialId(officialId);
    if (selectedMatchForOfficial) {
      const conflict = adminStore.checkOfficialConflict(officialId, selectedMatchForOfficial.id);
      setConflictWarning(conflict.hasConflict ? conflict.conflictReason || 'Conflict detected' : null);
    }
  };

  const handleConfirmAppoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForOfficial) return;

    try {
      adminStore.appointOfficial(selectedMatchForOfficial.id, selectedOfficialId, selectedOfficialRole);
      // Also update readiness checklist
      adminStore.updateMatchReadiness(selectedMatchForOfficial.id, { officialsAppointed: true });
      setSelectedMatchForOfficial(null);
      setFeedbackNotice('Match official appointed under NSFC credibility validation.');
      setTimeout(() => setFeedbackNotice(null), 3000);
    } catch (err: any) {
      setConflictWarning(err.message || 'Failed to appoint official due to scheduling conflict.');
    }
  };

  const handleOpenRescheduleModal = (match: OfficialMatchData) => {
    setSelectedMatchForReschedule(match);
    setNewDate(match.date);
    setNewTime(match.time);
    setNewVenue(match.venue);
    setRescheduleReason('');
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForReschedule || !rescheduleReason.trim()) return;

    adminStore.rescheduleFixture(
      selectedMatchForReschedule.id, 
      newDate, 
      newTime, 
      newVenue, 
      rescheduleReason.trim()
    );

    setSelectedMatchForReschedule(null);
    setFeedbackNotice(`Fixture #${selectedMatchForReschedule.id} rescheduled with audit justification.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="admin-module-container">
      {/* Top Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <CalendarDays size={14} className="eyebrow-icon" />
            <span>PITCHSIDE & CALENDAR GOVERNANCE</span>
          </div>
          <h1 className="module-title">Match Operations Control</h1>
          <p className="module-subtitle">
            Fixture scheduling, venue validation, matchday readiness checklists, and official credibility engine.
          </p>
        </div>

        <button 
          className="admin-action-btn primary"
          onClick={onOpenScheduleModal}
        >
          <Plus size={14} /> Schedule Fixture
        </button>
      </div>

      {feedbackNotice && (
        <div className="admin-inline-alert success">
          <CheckCircle size={16} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="inspector-nav-tabs">
        <button 
          className={`inspector-tab ${activeTab === 'SCHEDULE' ? 'active' : ''}`}
          onClick={() => setActiveTab('SCHEDULE')}
        >
          <CalendarDays size={15} /> Fixture Schedule ({matches.length})
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'READINESS' ? 'active' : ''}`}
          onClick={() => setActiveTab('READINESS')}
        >
          <CheckCircle size={15} /> Matchday Readiness Checklists
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'OFFICIALS' ? 'active' : ''}`}
          onClick={() => setActiveTab('OFFICIALS')}
        >
          <Award size={15} /> Officials Credibility Engine ({officials.length})
        </button>
      </div>

      {/* TAB 1: FIXTURE SCHEDULE */}
      {activeTab === 'SCHEDULE' && (
        <div className="tab-pane-content">
          {/* Status Filter Chips */}
          <div className="filter-chips-row">
            <button 
              className={`filter-chip ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Fixtures ({matches.length})
            </button>
            <button 
              className={`filter-chip ${statusFilter === 'SCHEDULED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('SCHEDULED')}
            >
              Scheduled ({matches.filter(m => m.status === 'SCHEDULED').length})
            </button>
            <button 
              className={`filter-chip ${statusFilter === 'READY' ? 'active' : ''}`}
              onClick={() => setStatusFilter('READY')}
            >
              Ready for Kickoff ({matches.filter(m => m.status === 'READY').length})
            </button>
            <button 
              className={`filter-chip ${statusFilter === 'LIVE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('LIVE')}
            >
              Live In Progress ({matches.filter(m => ['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF'].includes(m.status)).length})
            </button>
            <button 
              className={`filter-chip ${statusFilter === 'REVIEW' ? 'active' : ''}`}
              onClick={() => setStatusFilter('REVIEW')}
            >
              FT Review ({matches.filter(m => m.status === 'FULL_TIME_PENDING_REVIEW').length})
            </button>
            <button 
              className={`filter-chip ${statusFilter === 'VERIFIED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('VERIFIED')}
            >
              Verified & Published ({matches.filter(m => m.status === 'VERIFIED_PUBLISHED').length})
            </button>
            <button 
              className={`filter-chip ${statusFilter === 'POSTPONED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('POSTPONED')}
            >
              Postponed ({matches.filter(m => m.status === 'POSTPONED' || m.status === 'ABANDONED').length})
            </button>
          </div>

          <div className="match-operations-grid">
            {filteredMatches.map((m) => {
              const readiness = adminStore.getMatchReadiness(m.id);
              const centerRef = m.officials.find(o => o.role === 'Center Referee');

              return (
                <div key={m.id} className="match-op-card">
                  <div className="op-card-top">
                    <div>
                      <span className="op-comp-tag">{m.competition.name}</span>
                      <span className="op-round-tag">{m.round}</span>
                    </div>
                    <AdminStatusBadge status={m.status} size="sm" />
                  </div>

                  <div className="op-match-versus">
                    <div className="team-cell-op">
                      <span className="op-logo">{m.homeTeam.logo}</span>
                      <strong className="op-team-name">{m.homeTeam.name}</strong>
                    </div>

                    <div className="op-score-box">
                      {['VERIFIED_PUBLISHED', 'FULL_TIME_PENDING_REVIEW', 'FIRST_HALF', 'HALF_TIME', 'SECOND_HALF'].includes(m.status) ? (
                        <span className="op-score-num">{m.homeScore} - {m.awayScore}</span>
                      ) : (
                        <span className="op-vs">VS</span>
                      )}
                      <span className="op-minute">{m.minute}</span>
                    </div>

                    <div className="team-cell-op">
                      <span className="op-logo">{m.awayTeam.logo}</span>
                      <strong className="op-team-name">{m.awayTeam.name}</strong>
                    </div>
                  </div>

                  <div className="op-meta-info">
                    <div className="meta-line">
                      <Clock size={13} />
                      <span>{m.date} at {m.time}</span>
                    </div>
                    <div className="meta-line">
                      <MapPin size={13} />
                      <span>{m.venue}</span>
                    </div>
                    <div className="meta-line">
                      <Award size={13} />
                      <span>
                        Center Ref: <strong>{centerRef?.name || 'Unassigned'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Readiness mini indicators */}
                  <div className="readiness-mini-dots">
                    <span className={`r-dot ${readiness.venueConfirmed ? 'ready' : ''}`} title="Venue Confirmed" />
                    <span className={`r-dot ${readiness.officialsAppointed ? 'ready' : ''}`} title="Officials Appointed" />
                    <span className={`r-dot ${readiness.homeLineupSubmitted ? 'ready' : ''}`} title="Home Lineup" />
                    <span className={`r-dot ${readiness.awayLineupSubmitted ? 'ready' : ''}`} title="Away Lineup" />
                    <span className={`r-dot ${readiness.medicalStaffOnSite ? 'ready' : ''}`} title="Medical Staff" />
                  </div>

                  <div className="op-card-actions">
                    <button 
                      className="admin-action-btn secondary xs"
                      onClick={() => handleOpenAppointModal(m)}
                    >
                      Appoint Referees
                    </button>

                    <button 
                      className="admin-action-btn secondary xs"
                      onClick={() => handleOpenRescheduleModal(m)}
                    >
                      Reschedule
                    </button>

                    {m.status === 'FULL_TIME_PENDING_REVIEW' && (
                      <button 
                        className="admin-action-btn primary xs"
                        onClick={() => onNavigate('results-stats')}
                      >
                        Certify ➔
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MATCHDAY READINESS CENTER */}
      {activeTab === 'READINESS' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Matchday Readiness Matrix</h3>
              <span className="content-sub">Verify facility safety, team rosters, and referee appointments prior to kickoff.</span>
            </div>
          </div>

          <div className="readiness-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fixture</th>
                  <th>Kickoff & Venue</th>
                  <th>Venue Checked</th>
                  <th>Officials Assigned</th>
                  <th>Home Lineup</th>
                  <th>Away Lineup</th>
                  <th>Medical Responder</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 8).map((m) => {
                  const r = adminStore.getMatchReadiness(m.id);
                  return (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.homeTeam.shortName} vs {m.awayTeam.shortName}</strong>
                        <div className="sub-text">{m.round}</div>
                      </td>
                      <td>
                        <div>{m.date} {m.time}</div>
                        <div className="sub-text">{m.venue}</div>
                      </td>
                      <td>
                        <button 
                          className={`readiness-pill-btn ${r.venueConfirmed ? 'checked' : 'pending'}`}
                          onClick={() => adminStore.updateMatchReadiness(m.id, { venueConfirmed: !r.venueConfirmed })}
                        >
                          {r.venueConfirmed ? '✓ Confirmed' : 'Pending'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className={`readiness-pill-btn ${r.officialsAppointed ? 'checked' : 'pending'}`}
                          onClick={() => handleOpenAppointModal(m)}
                        >
                          {r.officialsAppointed ? '✓ Assigned' : 'Unassigned'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className={`readiness-pill-btn ${r.homeLineupSubmitted ? 'checked' : 'pending'}`}
                          onClick={() => adminStore.updateMatchReadiness(m.id, { homeLineupSubmitted: !r.homeLineupSubmitted })}
                        >
                          {r.homeLineupSubmitted ? '✓ Received' : 'Pending'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className={`readiness-pill-btn ${r.awayLineupSubmitted ? 'checked' : 'pending'}`}
                          onClick={() => adminStore.updateMatchReadiness(m.id, { awayLineupSubmitted: !r.awayLineupSubmitted })}
                        >
                          {r.awayLineupSubmitted ? '✓ Received' : 'Pending'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className={`readiness-pill-btn ${r.medicalStaffOnSite ? 'checked' : 'pending'}`}
                          onClick={() => adminStore.updateMatchReadiness(m.id, { medicalStaffOnSite: !r.medicalStaffOnSite })}
                        >
                          {r.medicalStaffOnSite ? '✓ On Site' : 'Pending'}
                        </button>
                      </td>
                      <td>
                        <AdminStatusBadge status={m.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIALS CREDIBILITY ENGINE */}
      {activeTab === 'OFFICIALS' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Match Officials & Exclusivity Credibility Engine</h3>
              <span className="content-sub">
                FIFA / FKF accredited referees. Enforces strict single-match exclusivity to prevent double booking.
              </span>
            </div>
          </div>

          <div className="officials-grid-cards">
            {officials.map((o) => {
              const conflict = adminStore.checkOfficialConflict(o.id);
              return (
                <div key={o.id} className="official-card-panel">
                  <div className="official-top">
                    <span className="badge-chip">{o.badge}</span>
                    <AdminStatusBadge status={o.status} size="sm" />
                  </div>

                  <div className="official-body">
                    <div className="official-avatar">🏅</div>
                    <div>
                      <h4 className="official-name">{o.name}</h4>
                      <span className="official-role">{o.role}</span>
                    </div>
                  </div>

                  <div className="official-contact">
                    <div>{o.email}</div>
                    <div className="sub-text">{o.phone}</div>
                  </div>

                  <div className="official-stats-row">
                    <div className="o-stat">
                      <span className="s-lbl">Officiated</span>
                      <span className="s-val">{o.matchesOfficiated} Matches</span>
                    </div>
                    <div className="o-stat">
                      <span className="s-lbl">Performance</span>
                      <span className="s-val">⭐ {o.rating} / 5</span>
                    </div>
                  </div>

                  {conflict.hasConflict ? (
                    <div className="credibility-alert-box conflict">
                      <AlertTriangle size={14} />
                      <span>{conflict.conflictReason}</span>
                    </div>
                  ) : (
                    <div className="credibility-alert-box clear">
                      <CheckCircle size={14} />
                      <span>Credibility verified: 0 overlapping match conflicts.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appoint Official Modal */}
      {selectedMatchForOfficial && (
        <div className="admin-modal-overlay" onClick={() => setSelectedMatchForOfficial(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Appoint Match Official</h3>
                <span className="modal-subtitle">
                  {selectedMatchForOfficial.homeTeam.name} vs {selectedMatchForOfficial.awayTeam.name} ({selectedMatchForOfficial.date})
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedMatchForOfficial(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAppoint}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Officiating Role *</label>
                  <select 
                    className="admin-select"
                    value={selectedOfficialRole}
                    onChange={(e) => setSelectedOfficialRole(e.target.value as any)}
                  >
                    <option value="Center Referee">Center Referee (Lead)</option>
                    <option value="Assistant Referee 1">Assistant Referee 1 (Touchline A)</option>
                    <option value="Assistant Referee 2">Assistant Referee 2 (Touchline B)</option>
                    <option value="Fourth Official">Fourth Official (Technical Area)</option>
                    <option value="Match Commissioner">Match Commissioner (NSFC Delegate)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Accredited Official *</label>
                  <select 
                    className="admin-select"
                    value={selectedOfficialId}
                    onChange={(e) => handleOfficialChange(e.target.value)}
                  >
                    {officials.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.badge}) - Status: {o.status}
                      </option>
                    ))}
                  </select>
                </div>

                {conflictWarning ? (
                  <div className="admin-inline-alert warning">
                    <AlertTriangle size={16} />
                    <span>{conflictWarning}</span>
                  </div>
                ) : (
                  <div className="admin-inline-alert success">
                    <CheckCircle size={16} />
                    <span>Exclusivity satisfied: No scheduling conflict detected.</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-action-btn secondary"
                  onClick={() => setSelectedMatchForOfficial(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-action-btn primary"
                  disabled={!!conflictWarning}
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Fixture Modal */}
      {selectedMatchForReschedule && (
        <div className="admin-modal-overlay" onClick={() => setSelectedMatchForReschedule(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Reschedule Fixture</h3>
                <span className="modal-subtitle">
                  #{selectedMatchForReschedule.id}: {selectedMatchForReschedule.homeTeam.name} vs {selectedMatchForReschedule.awayTeam.name}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedMatchForReschedule(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule}>
              <div className="modal-body form-body">
                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">New Date *</label>
                    <input 
                      type="date"
                      className="admin-input"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Time *</label>
                    <input 
                      type="time"
                      className="admin-input"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Stadium / Pitch Venue *</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mandatory Audit Justification *</label>
                  <textarea 
                    className="admin-textarea"
                    rows={3}
                    placeholder="Provide official governing justification (e.g. Inclement weather, university facility maintenance)..."
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-action-btn secondary"
                  onClick={() => setSelectedMatchForReschedule(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save Rescheduled Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
