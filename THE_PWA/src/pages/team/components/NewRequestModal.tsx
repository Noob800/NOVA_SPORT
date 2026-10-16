import { useState } from 'react';
import { X, Send, ShieldAlert, FileText } from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';
import type { RequestCategory } from '../../../services/teamDeskStore';

interface NewRequestModalProps {
  teamId: string;
  initialCategory?: RequestCategory;
  linkedEntity?: { type: 'player' | 'fixture' | 'competition'; id: string; name: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function NewRequestModal({
  teamId,
  initialCategory = 'GENERAL',
  linkedEntity,
  onClose,
  onSuccess
}: NewRequestModalProps) {
  const [category, setCategory] = useState<RequestCategory>(initialCategory);
  const [title, setTitle] = useState(
    linkedEntity
      ? `${initialCategory === 'FIXTURE_RESCHEDULE' ? 'Reschedule Request' : initialCategory === 'VENUE_CHANGE' ? 'Venue Change Request' : 'Correction Request'}: ${linkedEntity.name}`
      : ''
  );
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the request.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide the details and justification for this request.');
      return;
    }

    teamDeskStore.submitRequest({
      teamId,
      category,
      title: title.trim(),
      description: description.trim(),
      linkedEntity,
      priority
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 94, 0, 0.15)', color: 'var(--nova-orange)', padding: '8px', borderRadius: 'var(--radius-full)' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Submit Official Request</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>NSFC League Secretariat & Governance</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', marginBottom: '14px', fontSize: '0.85rem', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            {linkedEntity && (
              <div style={{ padding: '8px 12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', marginBottom: '14px', fontSize: '0.8rem', borderLeft: '3px solid var(--nova-orange)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Linked to {linkedEntity.type}: </span>
                <strong>{linkedEntity.name}</strong>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value as RequestCategory)}
                >
                  <option value="FIXTURE_RESCHEDULE">Fixture Reschedule / Postponement</option>
                  <option value="VENUE_CHANGE">Venue Change Request</option>
                  <option value="PLAYER_REGISTRATION">Player Registration & Clearance</option>
                  <option value="TRANSFER">Player Transfer Clearance</option>
                  <option value="RESULT_CORRECTION">Match Result / Scorer Correction</option>
                  <option value="DISCIPLINARY">Disciplinary Query / Appeal</option>
                  <option value="GENERAL">General League Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Within 48h)</option>
                  <option value="URGENT">Urgent (Matchday Critical)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Request Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Request to reschedule Matchday 20 vs Rangers FC"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Justification & Regulatory Notes *</label>
              <textarea
                rows={4}
                className="form-textarea"
                placeholder="Provide detailed reasons, timestamps, mutual club agreements, or regulatory articles referenced..."
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <ShieldAlert size={16} color="var(--nova-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Submissions are logged into the permanent NSFC audit trail. Submitting does not automatically alter official tables or fixtures until formally approved.
              </div>
            </div>
          </div>

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
              style={{ padding: '8px 20px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={16} /> Submit to League
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
