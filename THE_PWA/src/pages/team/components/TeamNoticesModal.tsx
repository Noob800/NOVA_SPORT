import { useState } from 'react';
import { X, Bell, Pin, Plus, Check } from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';
import type { TeamAnnouncement } from '../../../services/teamDeskStore';

interface TeamNoticesModalProps {
  teamId: string;
  onClose: () => void;
}

export function TeamNoticesModal({ teamId, onClose }: TeamNoticesModalProps) {
  const [announcements, setAnnouncements] = useState<TeamAnnouncement[]>(teamDeskStore.getAnnouncements(teamId));
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'MATCHDAY' | 'TRAINING' | 'ADMIN' | 'MEDICAL'>('MATCHDAY');
  const [audience, setAudience] = useState<'SQUAD_ONLY' | 'STAFF' | 'ALL'>('SQUAD_ONLY');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    teamDeskStore.publishAnnouncement({
      teamId,
      title: title.trim(),
      category,
      audience,
      author: 'Coach Marcus',
      date: new Date().toISOString().split('T')[0],
      content: content.trim(),
      pinned
    });

    setAnnouncements(teamDeskStore.getAnnouncements(teamId));
    setIsCreating(false);
    setTitle('');
    setContent('');
  };

  const markRead = (id: string) => {
    teamDeskStore.markAnnouncementRead(id);
    setAnnouncements(teamDeskStore.getAnnouncements(teamId));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 94, 0, 0.15)', color: 'var(--nova-orange)', padding: '8px', borderRadius: 'var(--radius-full)' }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Team Notices & Bulletins</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Official Communications & Advisories</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!isCreating && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {announcements.length} bulletins on file
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="quick-action-btn primary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                <Plus size={14} /> New Announcement
              </button>
            </div>
          )}

          {isCreating ? (
            <form onSubmit={handleCreate} style={{ background: 'var(--pitch-black)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>Publish New Team Notice</h4>

              <div className="form-group">
                <label className="form-label">Notice Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Matchday 20 Logistics & Kit Requirements"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                  >
                    <option value="MATCHDAY">Matchday</option>
                    <option value="TRAINING">Training</option>
                    <option value="ADMIN">Administrative</option>
                    <option value="MEDICAL">Medical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Audience</label>
                  <select
                    className="form-select"
                    value={audience}
                    onChange={e => setAudience(e.target.value as any)}
                  >
                    <option value="SQUAD_ONLY">Squad Players Only</option>
                    <option value="STAFF">Technical Staff Only</option>
                    <option value="ALL">Everyone (Squad & Staff)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Content *</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  required
                  placeholder="Type bulletin text..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={pinned}
                  onChange={e => setPinned(e.target.checked)}
                />
                <label htmlFor="pinNotice" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Pin to top of squad feed
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--stadium-white)', padding: '6px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="login-button" style={{ padding: '6px 16px', fontWeight: 600 }}>
                  Publish Notice
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {announcements.map(ann => (
                <div
                  key={ann.id}
                  style={{
                    background: 'var(--pitch-black)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {ann.pinned && <Pin size={14} color="var(--nova-orange)" />}
                      <strong style={{ fontSize: '0.9rem' }}>{ann.title}</strong>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                  </div>

                  <p style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: 'var(--stadium-white)', lineHeight: 1.4 }}>
                    {ann.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>By: {ann.author} • {ann.category}</span>
                    {!ann.read && (
                      <button
                        onClick={() => markRead(ann.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--nova-orange)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '0.72rem'
                        }}
                      >
                        <Check size={12} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="login-button"
            style={{ padding: '8px 20px', fontWeight: 600 }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
