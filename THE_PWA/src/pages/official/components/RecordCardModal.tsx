import { useState } from 'react';
import type { OfficialMatchData, TeamRosterPlayer } from '../../../services/matchStore';

interface RecordCardModalProps {
  match: OfficialMatchData;
  currentMinute: string;
  homeRoster: TeamRosterPlayer[];
  awayRoster: TeamRosterPlayer[];
  onConfirm: (cardData: {
    teamId: string;
    teamName: string;
    teamShortName: string;
    teamLogo: string;
    playerId: string;
    playerName: string;
    playerNumber: number;
    time: string;
    type: 'yellow_card' | 'red_card';
    detail: string;
  }) => void;
  onClose: () => void;
}

export function RecordCardModal({
  match,
  currentMinute,
  homeRoster,
  awayRoster,
  onConfirm,
  onClose
}: RecordCardModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(match.homeTeam.id);
  const [cardType, setCardType] = useState<'yellow_card' | 'red_card'>('yellow_card');
  const [cardSeverity, setCardSeverity] = useState<string>('Yellow Card (Caution)');
  const [infractionReason, setInfractionReason] = useState<string>('Tactical Foul / Stopping Promising Attack');
  const [minute, setMinute] = useState<string>(currentMinute.replace("'", '') || '1');

  const isHome = selectedTeamId === match.homeTeam.id;
  const currentRoster = isHome ? homeRoster : awayRoster;
  const currentTeam = isHome ? match.homeTeam : match.awayTeam;

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(currentRoster[0]?.id || '');

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    const roster = teamId === match.homeTeam.id ? homeRoster : awayRoster;
    if (roster.length > 0) {
      setSelectedPlayerId(roster[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const player = currentRoster.find(p => p.id === selectedPlayerId) || currentRoster[0];
    if (!player) return;

    onConfirm({
      teamId: currentTeam.id,
      teamName: currentTeam.name,
      teamShortName: currentTeam.shortName,
      teamLogo: currentTeam.logo,
      playerId: player.id,
      playerName: player.name,
      playerNumber: player.number,
      time: `${minute}'`,
      type: cardType,
      detail: `${cardSeverity} - ${infractionReason}`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>{cardType === 'yellow_card' ? '🟨' : '🟥'}</span>
            <h3 style={{ margin: 0 }}>Record Misconduct / Card</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Card Severity Quick Buttons */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Card Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setCardType('yellow_card');
                  setCardSeverity('Yellow Card (Caution)');
                }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: cardType === 'yellow_card' ? 'rgba(255, 215, 0, 0.2)' : 'var(--surface-elevated)',
                  color: cardType === 'yellow_card' ? '#FFD700' : 'var(--stadium-white)',
                  border: `2px solid ${cardType === 'yellow_card' ? '#FFD700' : 'var(--border-subtle)'}`,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>🟨</span>
                <span>Yellow Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCardType('red_card');
                  setCardSeverity('Direct Red Card (Dismissal)');
                }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: cardType === 'red_card' ? 'rgba(255, 68, 68, 0.2)' : 'var(--surface-elevated)',
                  color: cardType === 'red_card' ? '#FF4444' : 'var(--stadium-white)',
                  border: `2px solid ${cardType === 'red_card' ? '#FF4444' : 'var(--border-subtle)'}`,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>🟥</span>
                <span>Red Card</span>
              </button>
            </div>
          </div>

          {/* Offending Team Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Offending Team</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleTeamChange(match.homeTeam.id)}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: isHome ? 'var(--pitch-black)' : 'var(--surface-elevated)',
                  color: isHome ? 'var(--nova-orange)' : 'var(--stadium-white)',
                  border: `1px solid ${isHome ? 'var(--nova-orange)' : 'var(--border-subtle)'}`,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <span>{match.homeTeam.logo}</span>
                <span>{match.homeTeam.shortName}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTeamChange(match.awayTeam.id)}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: !isHome ? 'var(--pitch-black)' : 'var(--surface-elevated)',
                  color: !isHome ? 'var(--nova-orange)' : 'var(--stadium-white)',
                  border: `1px solid ${!isHome ? 'var(--nova-orange)' : 'var(--border-subtle)'}`,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <span>{match.awayTeam.logo}</span>
                <span>{match.awayTeam.shortName}</span>
              </button>
            </div>
          </div>

          {/* Offending Player */}
          <div className="form-group">
            <label className="form-label">Offending Player ({currentTeam.shortName})</label>
            <select
              value={selectedPlayerId}
              onChange={e => setSelectedPlayerId(e.target.value)}
              className="form-select"
              required
            >
              {currentRoster.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name} ({p.position})
                </option>
              ))}
            </select>
          </div>

          {/* Infraction Reason */}
          <div className="form-group">
            <label className="form-label">Infraction Reason (Official Code)</label>
            <select
              value={infractionReason}
              onChange={e => setInfractionReason(e.target.value)}
              className="form-select"
            >
              <option value="Tactical Foul / Stopping Promising Attack">Tactical Foul / SPA</option>
              <option value="Reckless Challenge">Reckless Challenge</option>
              <option value="Dissent by Word or Action">Dissent by Word or Action</option>
              <option value="Delaying the Restart of Play">Delaying the Restart of Play</option>
              <option value="Serious Foul Play">Serious Foul Play</option>
              <option value="Violent Conduct">Violent Conduct</option>
              <option value="Denying an Obvious Goal-Scoring Opportunity (DOGSO)">DOGSO (Denying Goal Opportunity)</option>
              <option value="Offensive / Abusive Language or Gestures">Offensive / Abusive Language</option>
            </select>
          </div>

          {/* Minute */}
          <div className="form-group">
            <label className="form-label">Match Minute</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                min="1"
                max="120"
                className="form-input"
                value={minute}
                onChange={e => setMinute(e.target.value)}
                required
              />
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>'</span>
            </div>
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
              Confirm Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
