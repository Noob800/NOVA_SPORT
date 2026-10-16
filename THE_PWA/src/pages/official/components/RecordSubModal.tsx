import { useState } from 'react';
import type { OfficialMatchData, TeamRosterPlayer } from '../../../services/matchStore';

interface RecordSubModalProps {
  match: OfficialMatchData;
  currentMinute: string;
  homeRoster: TeamRosterPlayer[];
  awayRoster: TeamRosterPlayer[];
  onConfirm: (subData: {
    teamId: string;
    teamName: string;
    teamShortName: string;
    teamLogo: string;
    playerId: string;
    playerName: string;
    playerNumber: number;
    subPlayerId: string;
    subPlayerName: string;
    subPlayerNumber: number;
    time: string;
  }) => void;
  onClose: () => void;
}

export function RecordSubModal({
  match,
  currentMinute,
  homeRoster,
  awayRoster,
  onConfirm,
  onClose
}: RecordSubModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(match.homeTeam.id);
  const [minute, setMinute] = useState<string>(currentMinute.replace("'", '') || '1');

  const isHome = selectedTeamId === match.homeTeam.id;
  const currentRoster = isHome ? homeRoster : awayRoster;
  const currentTeam = isHome ? match.homeTeam : match.awayTeam;

  const [outgoingPlayerId, setOutgoingPlayerId] = useState<string>(currentRoster[0]?.id || '');
  const [incomingPlayerId, setIncomingPlayerId] = useState<string>(currentRoster[1]?.id || currentRoster[0]?.id || '');

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    const roster = teamId === match.homeTeam.id ? homeRoster : awayRoster;
    if (roster.length >= 2) {
      setOutgoingPlayerId(roster[0].id);
      setIncomingPlayerId(roster[1].id);
    } else if (roster.length === 1) {
      setOutgoingPlayerId(roster[0].id);
      setIncomingPlayerId(roster[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const outPlayer = currentRoster.find(p => p.id === outgoingPlayerId) || currentRoster[0];
    const inPlayer = currentRoster.find(p => p.id === incomingPlayerId) || currentRoster[1] || currentRoster[0];
    if (!outPlayer || !inPlayer) return;

    onConfirm({
      teamId: currentTeam.id,
      teamName: currentTeam.name,
      teamShortName: currentTeam.shortName,
      teamLogo: currentTeam.logo,
      playerId: outPlayer.id,
      playerName: outPlayer.name,
      playerNumber: outPlayer.number,
      subPlayerId: inPlayer.id,
      subPlayerName: inPlayer.name,
      subPlayerNumber: inPlayer.number,
      time: `${minute}'`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔄</span>
            <h3 style={{ margin: 0 }}>Record Substitution</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Team Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Team Making Change</label>
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

          {/* Outgoing Player (OFF) */}
          <div className="form-group">
            <label className="form-label" style={{ color: '#FF4444' }}>🔴 Player Coming OFF</label>
            <select
              value={outgoingPlayerId}
              onChange={e => setOutgoingPlayerId(e.target.value)}
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

          {/* Incoming Player (ON) */}
          <div className="form-group">
            <label className="form-label" style={{ color: '#00E676' }}>🟢 Player Coming ON</label>
            <select
              value={incomingPlayerId}
              onChange={e => setIncomingPlayerId(e.target.value)}
              className="form-select"
              required
            >
              {currentRoster.filter(p => p.id !== outgoingPlayerId).map(p => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name} ({p.position})
                </option>
              ))}
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
              Confirm Substitution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
