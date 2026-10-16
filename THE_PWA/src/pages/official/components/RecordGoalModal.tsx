import { useState } from 'react';
import type { OfficialMatchData, TeamRosterPlayer } from '../../../services/matchStore';

interface RecordGoalModalProps {
  match: OfficialMatchData;
  currentMinute: string;
  homeRoster: TeamRosterPlayer[];
  awayRoster: TeamRosterPlayer[];
  onConfirm: (goalData: {
    teamId: string;
    teamName: string;
    teamShortName: string;
    teamLogo: string;
    playerId: string;
    playerName: string;
    playerNumber: number;
    time: string;
    detail: string;
  }) => void;
  onClose: () => void;
}

export function RecordGoalModal({
  match,
  currentMinute,
  homeRoster,
  awayRoster,
  onConfirm,
  onClose
}: RecordGoalModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(match.homeTeam.id);
  const [goalType, setGoalType] = useState<string>('Open Play');
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
      detail: goalType
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚽</span>
            <h3 style={{ margin: 0 }}>Record Official Goal</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Scoring Team Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Scoring Team</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleTeamChange(match.homeTeam.id)}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: isHome ? 'var(--nova-orange)' : 'var(--surface-elevated)',
                  color: isHome ? 'var(--pitch-black)' : 'var(--stadium-white)',
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
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: !isHome ? 'var(--nova-orange)' : 'var(--surface-elevated)',
                  color: !isHome ? 'var(--pitch-black)' : 'var(--stadium-white)',
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

          {/* Goal Scorer Selection */}
          <div className="form-group">
            <label className="form-label">Scoring Player ({currentTeam.shortName})</label>
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

          {/* Minute & Goal Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

            <div className="form-group">
              <label className="form-label">Goal Execution</label>
              <select
                value={goalType}
                onChange={e => setGoalType(e.target.value)}
                className="form-select"
              >
                <option value="Open Play">Open Play</option>
                <option value="Penalty Kick">Penalty Kick</option>
                <option value="Direct Free Kick">Direct Free Kick</option>
                <option value="Header">Header</option>
                <option value="Own Goal">Own Goal</option>
              </select>
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
              Confirm Goal (+1)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
