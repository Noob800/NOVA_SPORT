import { useState } from 'react';
import { X, Check, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';
import type { SquadPlayer, AvailabilityStatus } from '../../../services/teamDeskStore';
import { Link } from 'react-router-dom';

interface PlayerDetailModalProps {
  player: SquadPlayer;
  onClose: () => void;
  onRequestCorrection: (player: SquadPlayer) => void;
}

export function PlayerDetailModal({ player, onClose, onRequestCorrection }: PlayerDetailModalProps) {
  const [number, setNumber] = useState(player.number);
  const [position, setPosition] = useState(player.position);
  const [availability, setAvailability] = useState<AvailabilityStatus>(player.availability);
  const [statusNotes, setStatusNotes] = useState(player.statusNotes || '');
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setError(null);
    const res = teamDeskStore.updatePlayer(player.id, {
      number: Number(number),
      position
    });

    if (!res.success) {
      setError(res.error || 'Failed to update player');
      return;
    }

    teamDeskStore.updatePlayerAvailability(
      player.id, 
      availability, 
      statusNotes
    );

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{player.avatar}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{player.name}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {player.id.toUpperCase()}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', marginBottom: '12px', fontSize: '0.85rem', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          {savedSuccess && (
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', marginBottom: '12px', fontSize: '0.85rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> Player details updated successfully.
            </div>
          )}

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px', background: 'var(--pitch-black)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>APPS</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>{player.appearances}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GOALS</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--nova-orange)' }}>{player.goals}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ASSISTS</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>{player.assists}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TRAINING</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>{player.trainingAttendance}%</div>
            </div>
          </div>

          {/* Eligibility Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>League Eligibility</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KeMU Super League Verified</div>
              </div>
            </div>
            <span className={`status-pill ${player.eligibility === 'ELIGIBLE' ? 'fit' : 'doubtful'}`}>
              {player.eligibility}
            </span>
          </div>

          {/* Availability Status */}
          <div className="form-group">
            <label className="form-label">Squad Availability Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {(['FIT', 'INJURED', 'DOUBTFUL', 'SUSPENDED'] as AvailabilityStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAvailability(st)}
                  className={`status-pill ${st.toLowerCase()}`}
                  style={{
                    padding: '8px 4px',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: availability === st ? 1 : 0.45,
                    border: availability === st ? '2px solid currentColor' : '1px solid transparent'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Coach Notes */}
          <div className="form-group">
            <label className="form-label">Coach Tactical & Selection Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cleared for starting XI, vice-captain candidate..."
              value={statusNotes}
              onChange={e => setStatusNotes(e.target.value)}
            />
          </div>

          {/* Direct Coach Permitted Edits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Shirt Number</label>
              <input
                type="number"
                min="1"
                max="99"
                className="form-input"
                value={number}
                onChange={e => setNumber(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Registered Position</label>
              <select
                className="form-select"
                value={position}
                onChange={e => setPosition(e.target.value as any)}
              >
                <option value="GK">Goalkeeper (GK)</option>
                <option value="DF">Defender (DF)</option>
                <option value="MF">Midfielder (MF)</option>
                <option value="FW">Forward (FW)</option>
              </select>
            </div>
          </div>

          {/* Legal Identity & Request link */}
          <div style={{ padding: '12px', background: 'rgba(255, 94, 0, 0.08)', border: '1px solid rgba(255, 94, 0, 0.25)', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} color="var(--nova-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Official Name & Identity Records</div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Player legal names, National/Student ID and birthdates are locked by competition authorities. Submit an official request to update legal records.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestCorrection(player);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--nova-orange)',
                    color: 'var(--nova-orange)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Submit Identity Correction Request
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Link
            to={`/players/${player.id}`}
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              marginRight: 'auto'
            }}
          >
            Public Profile <ExternalLink size={14} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--stadium-white)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="login-button"
            style={{
              padding: '8px 20px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            Save Player Info
          </button>
        </div>
      </div>
    </div>
  );
}
