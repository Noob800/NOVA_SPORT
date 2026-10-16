import { useState } from 'react';
import type { OfficialMatchData } from '../../../services/matchStore';

interface SignReportModalProps {
  match: OfficialMatchData;
  onConfirm: (reportData: {
    refereeNotes: string;
    incidentReport?: string;
    fairPlayRatingHome: number;
    fairPlayRatingAway: number;
    leadOfficialSignature: string;
    publishOfficialResult: boolean;
  }) => void;
  onClose: () => void;
}

export function SignReportModal({
  match,
  onConfirm,
  onClose
}: SignReportModalProps) {
  const [refereeNotes, setRefereeNotes] = useState(
    match.report?.refereeNotes || 'Match completed within regular duration. Respect maintained by both coaching benches and captains.'
  );
  const [incidentReport, setIncidentReport] = useState(match.report?.incidentReport || '');
  const [fairPlayRatingHome, setFairPlayRatingHome] = useState<number>(match.report?.fairPlayRatingHome || 5);
  const [fairPlayRatingAway, setFairPlayRatingAway] = useState<number>(match.report?.fairPlayRatingAway || 5);
  const [leadOfficialSignature, setLeadOfficialSignature] = useState(
    match.report?.leadOfficialSignature || 'Referee James Mwita (FKF Ref #0841)'
  );
  const [publishImmediately, setPublishImmediately] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      refereeNotes,
      incidentReport: incidentReport.trim() || undefined,
      fairPlayRatingHome,
      fairPlayRatingAway,
      leadOfficialSignature,
      publishOfficialResult: publishImmediately
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Official Match Report & Publication</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ref: {match.id} • {match.competition.name}
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Confirmed Score Display */}
          <div style={{
            background: 'var(--pitch-black)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CONFIRMED FINAL SCORE</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', fontSize: '1.5rem', fontWeight: 800 }}>
              <span>{match.homeTeam.logo} {match.homeTeam.shortName}</span>
              <span style={{ color: 'var(--nova-orange)', background: 'rgba(255,94,0,0.1)', padding: '4px 12px', borderRadius: 'var(--radius-sm)' }}>
                {match.homeScore} - {match.awayScore}
              </span>
              <span>{match.awayTeam.logo} {match.awayTeam.shortName}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Recorded Events: {match.events.length} ({match.events.filter(e => e.type === 'goal').length} goals, {match.events.filter(e => e.type.includes('card')).length} cards)
            </div>
          </div>

          {/* Fair Play Ratings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">{match.homeTeam.shortName} Fair Play (1-5)</label>
              <select
                value={fairPlayRatingHome}
                onChange={e => setFairPlayRatingHome(Number(e.target.value))}
                className="form-select"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Exemplary)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Acceptable)</option>
                <option value={2}>⭐⭐ (2 - Problematic)</option>
                <option value={1}>⭐ (1 - Unacceptable)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{match.awayTeam.shortName} Fair Play (1-5)</label>
              <select
                value={fairPlayRatingAway}
                onChange={e => setFairPlayRatingAway(Number(e.target.value))}
                className="form-select"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Exemplary)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Acceptable)</option>
                <option value={2}>⭐⭐ (2 - Problematic)</option>
                <option value={1}>⭐ (1 - Unacceptable)</option>
              </select>
            </div>
          </div>

          {/* Referee General Notes */}
          <div className="form-group">
            <label className="form-label">Referee General Remarks & Match Conditions</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={refereeNotes}
              onChange={e => setRefereeNotes(e.target.value)}
              required
            />
          </div>

          {/* Incident Notes (Optional) */}
          <div className="form-group">
            <label className="form-label">Special Incident / Disciplinary Report (Optional)</label>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Record any pitch invasion, severe injuries, or referee abuse..."
              value={incidentReport}
              onChange={e => setIncidentReport(e.target.value)}
            />
          </div>

          {/* Official Digital Signature */}
          <div className="form-group">
            <label className="form-label">Center Referee Digital Sign-Off</label>
            <input
              type="text"
              className="form-input"
              value={leadOfficialSignature}
              onChange={e => setLeadOfficialSignature(e.target.value)}
              required
            />
          </div>

          {/* Immediate Publication Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '10px 12px',
            background: 'rgba(255, 94, 0, 0.08)',
            border: '1px solid rgba(255, 94, 0, 0.3)',
            borderRadius: 'var(--radius-md)'
          }}>
            <input
              type="checkbox"
              id="publishToggle"
              checked={publishImmediately}
              onChange={e => setPublishImmediately(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="publishToggle" style={{ fontSize: '0.8rem', cursor: 'pointer', lineHeight: 1.4 }}>
              <strong>Publish Official Result to League Standings Immediately</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                Makes the score and verified match report public and permanent across NovaSport.
              </div>
            </label>
          </div>

          <div className="modal-footer" style={{ marginTop: '8px', padding: '12px 0 0 0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--stadium-white)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="login-button"
              style={{ padding: '10px 20px', fontWeight: 700 }}
            >
              {publishImmediately ? 'Sign & Publish Official Result' : 'Save Pending Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
