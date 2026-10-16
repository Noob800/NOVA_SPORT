import React, { useState } from 'react';
import { 
  BarChart3, 
  FileCheck, 
  CheckCircle, 
  AlertTriangle, 
  Trophy, 
  Award, 
  Edit, 
  Sliders, 
  X
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';
import { matchStore, type OfficialMatchData } from '../../../services/matchStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface ResultsStatsViewProps {
  onNavigate?: (section: string, subId?: string) => void;
}

export const ResultsStatsView: React.FC<ResultsStatsViewProps> = () => {
  const matches = matchStore.getAllMatches();
  const teams = adminStore.getTeams();
  const selectedSeasonId = adminStore.getSelectedSeasonId();

  const [activeTab, setActiveTab] = useState<'CERTIFY' | 'CORRECTIONS' | 'STANDINGS' | 'STATS'>('CERTIFY');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Certification state
  const [selectedMatchForCertify, setSelectedMatchForCertify] = useState<OfficialMatchData | null>(null);
  const [adminNotes, setAdminNotes] = useState('Official match sheet and pitchside events verified by NSFC Administration.');

  // Audited score correction state
  const [selectedMatchForCorrection, setSelectedMatchForCorrection] = useState<OfficialMatchData | null>(null);
  const [corrHomeScore, setCorrHomeScore] = useState(0);
  const [corrAwayScore, setCorrAwayScore] = useState(0);
  const [corrAuditReason, setCorrAuditReason] = useState('');

  // Table points deduction state
  const [showPointDeductionModal, setShowPointDeductionModal] = useState(false);
  const [deductionTeamId, setDeductionTeamId] = useState(teams[0]?.id || 't1');
  const [deductionPoints, setDeductionPoints] = useState(3);
  const [deductionReason, setDeductionReason] = useState('Fielding ineligible student athlete under Article 7.2');

  const pendingReviews = matches.filter(m => m.status === 'FULL_TIME_PENDING_REVIEW');
  const verifiedResults = matches.filter(m => m.status === 'VERIFIED_PUBLISHED');

  const standings = adminStore.calculateStandings(selectedSeasonId);
  const topScorers = adminStore.getTopScorers();

  const handleConfirmCertify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForCertify) return;

    adminStore.certifyResult(selectedMatchForCertify.id, adminNotes);
    setSelectedMatchForCertify(null);
    setFeedbackNotice(`Match #${selectedMatchForCertify.id} certified and locked into official standings.`);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleOpenCorrection = (match: OfficialMatchData) => {
    setSelectedMatchForCorrection(match);
    setCorrHomeScore(match.homeScore);
    setCorrAwayScore(match.awayScore);
    setCorrAuditReason('');
  };

  const handleConfirmCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForCorrection || !corrAuditReason.trim()) return;

    adminStore.auditCorrectScore(
      selectedMatchForCorrection.id, 
      corrHomeScore, 
      corrAwayScore, 
      corrAuditReason.trim()
    );

    setSelectedMatchForCorrection(null);
    setFeedbackNotice(`Score for Match #${selectedMatchForCorrection.id} corrected with mandatory audit log.`);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleApplyPointDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    const team = teams.find(t => t.id === deductionTeamId);
    if (!team) return;

    adminStore.issueSanction({
      targetType: 'TEAM',
      targetId: deductionTeamId,
      targetName: team.name,
      teamId: deductionTeamId,
      teamName: team.name,
      violation: deductionReason,
      sanctionType: 'POINTS_DEDUCTION',
      pointsDeducted: deductionPoints,
      penalty: `-${deductionPoints} Points Deduction`,
      details: `Table point deduction imposed by NSFC Disciplinary Tribunal: ${deductionReason}.`
    });

    setShowPointDeductionModal(false);
    setFeedbackNotice(`Applied -${deductionPoints} points sanction to ${team.name} in standings.`);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  return (
    <div className="admin-module-container">
      {/* Top Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <BarChart3 size={14} className="eyebrow-icon" />
            <span>RESULT CERTIFICATION & INTEGRITY</span>
          </div>
          <h1 className="module-title">Results & Statistics Control</h1>
          <p className="module-subtitle">
            Match certification queue, audited score corrections, dynamic standings computation, and leaderboards.
          </p>
        </div>

        <button 
          className="admin-action-btn secondary"
          onClick={() => setShowPointDeductionModal(true)}
        >
          <Sliders size={14} /> Standings Points Adjustment
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
          className={`inspector-tab ${activeTab === 'CERTIFY' ? 'active' : ''}`}
          onClick={() => setActiveTab('CERTIFY')}
        >
          <FileCheck size={15} /> Certification Queue ({pendingReviews.length} Pending)
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'CORRECTIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('CORRECTIONS')}
        >
          <Edit size={15} /> Audited Corrections ({verifiedResults.length} Verified)
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'STANDINGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('STANDINGS')}
        >
          <Trophy size={15} /> Standings Calculation Engine
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'STATS' ? 'active' : ''}`}
          onClick={() => setActiveTab('STATS')}
        >
          <Award size={15} /> Statistical Integrity & Leaderboards
        </button>
      </div>

      {/* TAB 1: CERTIFICATION QUEUE */}
      {activeTab === 'CERTIFY' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Full Time Matches Awaiting Official Sign-Off</h3>
              <span className="content-sub">
                Pitchside match reports submitted by match officials. Verify and certify results to lock into standings.
              </span>
            </div>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="admin-clean-panel">
              <CheckCircle size={36} className="clean-icon" />
              <h4>Verification Queue Clear</h4>
              <p>All completed match sheets have been certified by NSFC administration.</p>
            </div>
          ) : (
            <div className="review-queue-list">
              {pendingReviews.map((m) => (
                <div key={m.id} className="review-card-panel">
                  <div className="review-header">
                    <div>
                      <span className="r-comp">{m.competition.name}</span>
                      <span className="r-round">{m.round} • {m.venue}</span>
                    </div>
                    <AdminStatusBadge status={m.status} size="sm" />
                  </div>

                  <div className="review-versus-display">
                    <div className="r-team home">
                      <span className="t-logo">{m.homeTeam.logo}</span>
                      <strong className="t-name">{m.homeTeam.name}</strong>
                    </div>

                    <div className="r-score-box">
                      <span className="score-digits">{m.homeScore} - {m.awayScore}</span>
                      <span className="score-state">Full Time (FT)</span>
                    </div>

                    <div className="r-team away">
                      <span className="t-logo">{m.awayTeam.logo}</span>
                      <strong className="t-name">{m.awayTeam.name}</strong>
                    </div>
                  </div>

                  {m.report && (
                    <div className="referee-report-preview">
                      <div className="report-row">
                        <span className="rep-label">Lead Referee Signature:</span>
                        <strong>{m.report.leadOfficialSignature}</strong>
                      </div>
                      <div className="report-row">
                        <span className="rep-label">Fair Play Ratings:</span>
                        <span>Home: {m.report.fairPlayRatingHome}/5 • Away: {m.report.fairPlayRatingAway}/5</span>
                      </div>
                      <div className="report-notes">
                        <em>"{m.report.refereeNotes}"</em>
                      </div>
                    </div>
                  )}

                  <div className="review-footer">
                    <span className="review-hint">
                      Certification will lock score, trigger standings recalculation, and release appointed referees.
                    </span>
                    <button 
                      className="admin-action-btn primary sm"
                      onClick={() => {
                        setSelectedMatchForCertify(m);
                        setAdminNotes('Official match sheet and pitchside events verified by NSFC Administration.');
                      }}
                    >
                      <FileCheck size={14} /> Review & Certify Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDITED CORRECTIONS */}
      {activeTab === 'CORRECTIONS' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Verified Match Results Archive</h3>
              <span className="content-sub">
                Officially certified records. Scores can only be adjusted through an immutable, auditable tribunal appeal.
              </span>
            </div>
          </div>

          <div className="verified-archive-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Match ID</th>
                  <th>Fixture</th>
                  <th>Certified Score</th>
                  <th>Date & Venue</th>
                  <th>Certification Status</th>
                  <th>Audit Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifiedResults.map((m) => (
                  <tr key={m.id}>
                    <td><code>{m.id}</code></td>
                    <td>
                      <strong>{m.homeTeam.name} vs {m.awayTeam.name}</strong>
                      <div className="sub-text">{m.competition.name}</div>
                    </td>
                    <td className="certified-score-cell">
                      <span className="score-pill">{m.homeScore} - {m.awayScore}</span>
                    </td>
                    <td>
                      <div>{m.date}</div>
                      <div className="sub-text">{m.venue}</div>
                    </td>
                    <td>
                      <AdminStatusBadge status={m.status} size="sm" />
                    </td>
                    <td>
                      <button 
                        className="admin-action-btn secondary xs"
                        onClick={() => handleOpenCorrection(m)}
                      >
                        <Edit size={12} /> Audited Correction
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STANDINGS CALCULATION ENGINE */}
      {activeTab === 'STANDINGS' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Dynamic Standings Computation Engine</h3>
              <span className="content-sub">
                Auto-calculated from all verified match results. Manual edits are replaced with transparent, auditable point deduction sanctions.
              </span>
            </div>
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
                          <span className="points-penalty-chip">
                            -{row.pointsDeduction} pts sanction
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

      {/* TAB 4: STATISTICAL INTEGRITY */}
      {activeTab === 'STATS' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Individual Performance Integrity & Golden Boot</h3>
              <span className="content-sub">Verified goalscoring and playmaker records.</span>
            </div>
          </div>

          <div className="stats-cards-grid">
            <div className="stats-box">
              <h4>Golden Boot (Top Scorers)</h4>
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
              <h4>Most Assists (Playmakers)</h4>
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

      {/* Certify Result Modal */}
      {selectedMatchForCertify && (
        <div className="admin-modal-overlay" onClick={() => setSelectedMatchForCertify(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Certify & Publish Result</h3>
                <span className="modal-subtitle">
                  #{selectedMatchForCertify.id}: {selectedMatchForCertify.homeTeam.name} vs {selectedMatchForCertify.awayTeam.name}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedMatchForCertify(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCertify}>
              <div className="modal-body form-body">
                <div className="certify-score-summary">
                  <div className="cs-team">{selectedMatchForCertify.homeTeam.name}</div>
                  <div className="cs-score">{selectedMatchForCertify.homeScore} - {selectedMatchForCertify.awayScore}</div>
                  <div className="cs-team">{selectedMatchForCertify.awayTeam.name}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Administrative Sign-Off Notes *</label>
                  <textarea 
                    className="admin-textarea"
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-inline-alert info">
                  <CheckCircle size={16} />
                  <span>
                    Certifying this result will permanently publish it to public standings and the fan portal.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-action-btn secondary"
                  onClick={() => setSelectedMatchForCertify(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Certify & Publish Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audited Score Correction Modal */}
      {selectedMatchForCorrection && (
        <div className="admin-modal-overlay" onClick={() => setSelectedMatchForCorrection(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Audited Score Correction</h3>
                <span className="modal-subtitle">
                  #{selectedMatchForCorrection.id}: {selectedMatchForCorrection.homeTeam.name} vs {selectedMatchForCorrection.awayTeam.name}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedMatchForCorrection(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCorrection}>
              <div className="modal-body form-body">
                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">{selectedMatchForCorrection.homeTeam.name} Score</label>
                    <input 
                      type="number"
                      className="admin-input font-bold"
                      min="0"
                      max="20"
                      value={corrHomeScore}
                      onChange={(e) => setCorrHomeScore(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{selectedMatchForCorrection.awayTeam.name} Score</label>
                    <input 
                      type="number"
                      className="admin-input font-bold"
                      min="0"
                      max="20"
                      value={corrAwayScore}
                      onChange={(e) => setCorrAwayScore(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mandatory Disciplinary / Appeal Audit Justification *</label>
                  <textarea 
                    className="admin-textarea"
                    rows={3}
                    placeholder="Provide official governing justification (e.g. Ineligible player forfeiture, technical tribunal ruling)..."
                    value={corrAuditReason}
                    onChange={(e) => setCorrAuditReason(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-inline-alert warning">
                  <AlertTriangle size={16} />
                  <span>
                    Warning: Score revisions trigger an immutable CRITICAL audit log entry and immediately recalculate league standings.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-action-btn secondary"
                  onClick={() => setSelectedMatchForCorrection(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn destructive">
                  Save Audited Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disciplinary Point Deduction Modal */}
      {showPointDeductionModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPointDeductionModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Standings Point Deduction Sanction</h3>
                <span className="modal-subtitle">NSFC Disciplinary Tribunal Table Penalty</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowPointDeductionModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyPointDeduction}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Target Club *</label>
                  <select 
                    className="admin-select"
                    value={deductionTeamId}
                    onChange={(e) => setDeductionTeamId(e.target.value)}
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.logo} {t.name} ({t.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Points to Deduct *</label>
                  <input 
                    type="number"
                    className="admin-input"
                    min="1"
                    max="15"
                    value={deductionPoints}
                    onChange={(e) => setDeductionPoints(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Violation Description *</label>
                  <textarea 
                    className="admin-textarea"
                    rows={3}
                    placeholder="Specify the regulatory article violated..."
                    value={deductionReason}
                    onChange={(e) => setDeductionReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-action-btn secondary"
                  onClick={() => setShowPointDeductionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn destructive">
                  Impose Points Sanction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
