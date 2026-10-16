import { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, ShieldAlert, Clock
} from 'lucide-react';
import type { MatchEventItem, OfficialMatchData } from '../../../services/matchStore';
import { getCorrectionWindowRemainingSeconds } from '../../../services/matchStore';

interface VoidEventModalProps {
  event: MatchEventItem;
  match: OfficialMatchData;
  onConfirmVoid: (eventId: string, reason: string, notes?: string) => void;
  onClose: () => void;
}

const VOID_REASONS = [
  'VAR / Assistant: Offside in Build-up',
  'VAR / Assistant: Foul / Infraction Disallowed',
  'Mistaken Identity / Wrong Jersey Number',
  'Ball Did Not Cross Goal Line',
  'Whistle Blown Prior to Action',
  'Clerical Entry Error / Accidental Tap'
];

export function VoidEventModal({
  event,
  match,
  onConfirmVoid,
  onClose
}: VoidEventModalProps) {
  const [remainingSecs, setRemainingSecs] = useState(() => 
    getCorrectionWindowRemainingSeconds(event.timestamp)
  );
  const [selectedReason, setSelectedReason] = useState<string>(VOID_REASONS[0]);
  const [officialNotes, setOfficialNotes] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getCorrectionWindowRemainingSeconds(event.timestamp);
      setRemainingSecs(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [event.timestamp]);

  const isExpired = remainingSecs <= 0;
  const minutes = Math.floor(remainingSecs / 60);
  const seconds = remainingSecs % 60;

  const handleConfirm = () => {
    if (isExpired) return;
    onConfirmVoid(event.id, selectedReason, officialNotes.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-panel ref-action-drawer void-modal" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Modal Header */}
        <div className="ref-drawer-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #EF4444'
            }}>
              <ShieldAlert size={20} color="#EF4444" />
            </div>
            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--stadium-white)', display: 'block' }}>
                Official Event Invalidation & Audit
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {match.competition.name} Governance Protocol
              </span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="ref-drawer-close-btn"
            title="Cancel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Correction Window Countdown Alert */}
        <div style={{
          padding: '12px 18px',
          background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 145, 0, 0.08)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color={isExpired ? '#EF4444' : 'var(--nova-orange)'} />
            <span style={{ fontSize: '0.78rem', color: 'var(--stadium-white)', fontWeight: 600 }}>
              {isExpired ? 'Correction Grace Window Expired' : 'Active Correction Grace Window'}
            </span>
          </div>

          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: isExpired ? '#EF4444' : 'var(--nova-orange)',
            background: 'var(--pitch-black)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${isExpired ? '#EF4444' : 'var(--nova-orange)'}`,
            fontFamily: 'var(--font-mono)'
          }}>
            {isExpired ? '00:00 (LOCKED)' : `${minutes}:${seconds.toString().padStart(2, '0')} remaining`}
          </span>
        </div>

        {/* Target Event Details Preview Card */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{
            background: 'var(--pitch-black)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="ref-event-time-badge">{event.time}</span>
              <span style={{ fontSize: '1.4rem' }}>
                {event.type === 'goal' ? '⚽' : event.type === 'yellow_card' ? '🟨' : event.type === 'red_card' ? '🟥' : '🔄'}
              </span>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--stadium-white)' }}>
                  #{event.playerNumber} {event.playerName} ({event.teamShortName})
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                  {event.detail || event.type} • Logged {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '0.7rem',
              color: '#EF4444',
              fontWeight: 800,
              background: 'rgba(239, 68, 68, 0.12)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              TO BE VOIDED
            </span>
          </div>
        </div>

        {/* Mandatory Reason Selection */}
        <div style={{ padding: '14px 18px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Mandatory Governance Invalidation Reason
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {VOID_REASONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedReason(r)}
                className={`ref-option-chip ${selectedReason === r ? 'active' : ''}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '8px 10px',
                  borderColor: selectedReason === r ? '#EF4444' : undefined,
                  background: selectedReason === r ? 'rgba(239, 68, 68, 0.15)' : undefined,
                  color: selectedReason === r ? '#EF4444' : undefined
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Official Explanation Note */}
          <div style={{ marginTop: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '4px',
              fontWeight: 700
            }}>
              Official Report Notes & Incident Reference (Optional):
            </label>
            <textarea
              value={officialNotes}
              onChange={e => setOfficialNotes(e.target.value)}
              placeholder="e.g. Assistant flagged offside after delayed flag; goal disallowed after consultation."
              rows={2}
              style={{
                width: '100%',
                background: 'var(--pitch-black)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--stadium-white)',
                padding: '8px 10px',
                fontSize: '0.8rem',
                boxSizing: 'border-box',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Governance Notice */}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <AlertTriangle size={14} color="var(--nova-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Audit Trail Notice:</strong> In compliance with match credibility standards, this event will not be erased. It will remain in the public timeline marked as <em>VOIDED</em>, with this justification permanently logged.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              className="quick-action-btn"
              style={{ flex: 1, padding: '10px' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isExpired}
              className="ref-action-confirm-btn red"
              style={{
                flex: 2,
                padding: '10px',
                fontSize: '0.88rem',
                opacity: isExpired ? 0.5 : 1,
                cursor: isExpired ? 'not-allowed' : 'pointer'
              }}
            >
              {isExpired ? '🔒 Window Expired (Locked)' : 'Confirm Audited Invalidation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
