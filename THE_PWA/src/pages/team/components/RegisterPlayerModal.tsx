import React, { useState } from 'react';
import { X, Mail, AlertCircle, ShieldCheck, Copy, Check, Send } from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';

interface RegisterPlayerModalProps {
  teamId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegisterPlayerModal({ teamId, onClose, onSuccess }: RegisterPlayerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState<'GK' | 'DF' | 'MF' | 'FW'>('MF');
  const [number, setNumber] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>(21);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Success invitation state
  const [invitedResult, setInvitedResult] = useState<{
    inviteCode: string;
    playerEmail: string;
    playerName: string;
    playerNumber: number;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the full legal name of the player.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid player email address is required so the player can receive their login invitation.');
      return;
    }
    if (!number || number <= 0 || number > 99) {
      setError('Please specify a valid shirt number between 1 and 99.');
      return;
    }

    const res = teamDeskStore.invitePlayer({
      teamId,
      name: name.trim(),
      email: email.trim(),
      position,
      number: Number(number),
      age: Number(age) || 20,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined
    });

    if (!res.success) {
      setError(res.error || 'Failed to send player invitation.');
      return;
    }

    setInvitedResult({
      inviteCode: res.inviteCode || 'INV-NOV-1001',
      playerEmail: email.trim(),
      playerName: name.trim(),
      playerNumber: Number(number)
    });

    onSuccess();
  };

  const inviteUrl = invitedResult 
    ? `${window.location.origin}/mynova?invite=${invitedResult.inviteCode}`
    : '';

  const handleCopyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 94, 0, 0.15)', color: 'var(--nova-orange)', padding: '8px', borderRadius: 'var(--radius-full)' }}>
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Invite Player via Email</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Official Squad Invitation & Player Registration
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* If Invitation Sent Successfully, Show Confirmation Screen */}
        {invitedResult ? (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '24px 16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <Check size={28} />
            </div>

            <div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--stadium-white)' }}>
                Official Invitation Dispatched!
              </h4>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                An invitation email has been simulated and dispatched to <strong style={{ color: 'var(--nova-orange)' }}>{invitedResult.playerEmail}</strong>.
              </p>
            </div>

            {/* Reserved Roster Spot Badge */}
            <div style={{
              background: 'var(--pitch-black)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Reserved Roster Spot</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--stadium-white)' }}>
                  #{invitedResult.playerNumber} {invitedResult.playerName}
                </strong>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#38BDF8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Awaiting Player Login
              </span>
            </div>

            {/* Direct Activation Token Box */}
            <div style={{
              background: 'rgba(255, 94, 0, 0.08)',
              border: '1px solid rgba(255, 94, 0, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Direct Invitation Token</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--nova-orange)', fontFamily: 'monospace' }}>
                  {invitedResult.inviteCode}
                </strong>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  style={{
                    flex: 1,
                    background: 'var(--pitch-black)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="quick-action-btn"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copiedLink ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              When the player follows this link or registers with their email, their profile will be bound exclusively to your team.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="login-button"
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem', marginTop: '6px' }}
            >
              Done & Return to Squad
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', marginBottom: '14px', fontSize: '0.85rem', color: '#fca5a5', display: 'flex', gap: '8px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Roster Protection Protocol Note */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                padding: '12px', 
                background: 'var(--pitch-black)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px' 
              }}>
                <ShieldCheck size={20} color="var(--nova-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--stadium-white)', lineHeight: 1.4 }}>
                  <strong>Squad Integrity & Roster Protection</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Players cannot join or claim a team on their own. Entering their email below sends an official invitation and reserves their squad shirt number.
                  </p>
                </div>
              </div>

              {/* Player Legal Name */}
              <div className="form-group">
                <label className="form-label">Player Full Legal Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Victor Odhiambo"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Player Email Address (Mandatory for Login Invite) */}
              <div className="form-group">
                <label className="form-label">Player Email Address (for Login Invitation) *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. player@gmail.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  The player will use this email to create their profile with logins and claim this squad spot.
                </span>
              </div>

              {/* Position & Shirt Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Playing Position *</label>
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

                <div className="form-group">
                  <label className="form-label">Reserved Shirt # (1-99) *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="form-input"
                    placeholder="e.g. 17"
                    required
                    value={number}
                    onChange={e => setNumber(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              </div>

              {/* Age & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    min="15"
                    max="45"
                    className="form-input"
                    placeholder="e.g. 21"
                    value={age}
                    onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Player WhatsApp / Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +254 7..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div className="form-group">
                <label className="form-label">Invitation Notes (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pre-season assessment call-up"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--stadium-white)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="login-button"
                style={{ padding: '8px 20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={15} /> Send Invitation Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
