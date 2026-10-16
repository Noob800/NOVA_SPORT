import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Phone, 
  Mail, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  Radio, 
  Search
} from 'lucide-react';
import { 
  adminStore, 
  type OfficialRecord 
} from '../../../services/adminStore';
import { matchStore } from '../../../services/matchStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface OfficialsDirectoryViewProps {
  onNavigate?: (section: string, subId?: string) => void;
}

export const OfficialsDirectoryView: React.FC<OfficialsDirectoryViewProps> = () => {
  const officials = adminStore.getOfficials();
  const allMatches = matchStore.getAllMatches();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [feedbackNotice, setFeedbackNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add / Edit Modal State
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<OfficialRecord | null>(null);
  const [officialForm, setOfficialForm] = useState({
    name: '',
    role: 'Center Referee' as OfficialRecord['role'],
    badge: 'NSFC Approved Referee',
    phone: '',
    email: '',
    status: 'AVAILABLE' as OfficialRecord['status']
  });

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackNotice({ message, type });
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingOfficial(null);
    setOfficialForm({
      name: '',
      role: 'Center Referee',
      badge: 'NSFC Approved Referee',
      phone: '+254 7',
      email: '',
      status: 'AVAILABLE'
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (off: OfficialRecord) => {
    setEditingOfficial(off);
    setOfficialForm({
      name: off.name,
      role: off.role,
      badge: off.badge,
      phone: off.phone,
      email: off.email,
      status: off.status
    });
    setShowAddEditModal(true);
  };

  const handleDeleteOfficial = (off: OfficialRecord) => {
    if (confirm(`Remove ${off.name} from NSFC officials directory?`)) {
      adminStore.deleteOfficial(off.id);
      showNotice(`Removed official ${off.name}.`);
    }
  };

  const handleToggleStatus = (off: OfficialRecord) => {
    const nextStatus = off.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    adminStore.updateOfficial(off.id, { status: nextStatus });
    showNotice(`Updated ${off.name} status to ${nextStatus}.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialForm.name.trim() || !officialForm.phone.trim()) return;

    if (editingOfficial) {
      adminStore.updateOfficial(editingOfficial.id, {
        name: officialForm.name.trim(),
        role: officialForm.role,
        badge: officialForm.badge,
        phone: officialForm.phone.trim(),
        email: officialForm.email.trim(),
        status: officialForm.status
      });
      showNotice(`Updated official record for ${officialForm.name}.`);
    } else {
      adminStore.addOfficial({
        name: officialForm.name.trim(),
        role: officialForm.role,
        badge: officialForm.badge,
        phone: officialForm.phone.trim(),
        email: officialForm.email.trim(),
        status: officialForm.status
      });
      showNotice(`Enrolled new NSFC official ${officialForm.name}.`);
    }

    setShowAddEditModal(false);
  };

  const filteredOfficials = officials.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.phone.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (roleFilter !== 'ALL' && o.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="admin-module-container">
      {/* Top Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <ShieldCheck size={14} className="eyebrow-icon" />
            <span>LOCAL LEAGUE MATCH OFFICIALS</span>
          </div>
          <h1 className="module-title">NSFC Officials Directory</h1>
          <p className="module-subtitle">
            Direct management of NSFC-approved referees, assistants, and match commissioners. No international federation paperwork required.
          </p>
        </div>

        <button className="admin-action-btn primary" onClick={handleOpenAddModal}>
          <Plus size={14} /> Add Official
        </button>
      </div>

      {feedbackNotice && (
        <div className={`admin-inline-alert ${feedbackNotice.type === 'error' ? 'error' : 'success'}`}>
          {feedbackNotice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{feedbackNotice.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px',
        marginBottom: '20px' 
      }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="admin-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search officials by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Role Filter:</span>
          <select 
            className="admin-select"
            style={{ width: 'auto', background: 'var(--pitch-black)' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles ({officials.length})</option>
            <option value="Center Referee">Center Referee</option>
            <option value="Assistant Referee 1">Assistant Referee 1</option>
            <option value="Assistant Referee 2">Assistant Referee 2</option>
            <option value="Match Commissioner">Match Commissioner</option>
          </select>
        </div>
      </div>

      {/* Officials Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {filteredOfficials.map((off) => {
          // Check upcoming assigned matches
          const assignedMatches = allMatches.filter(m => 
            m.officials.some(o => o.id === off.id || o.name === off.name) &&
            m.status !== 'VERIFIED_PUBLISHED'
          );

          return (
            <div 
              key={off.id}
              className="admin-card"
              style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  background: 'rgba(255, 106, 0, 0.12)', 
                  border: '1px solid rgba(255, 106, 0, 0.3)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  🏅
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{off.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--nova-orange)', fontWeight: 700 }}>
                    {off.role}
                  </span>
                </div>

                <AdminStatusBadge status={off.status} size="sm" />
              </div>

              {/* Credential Badge */}
              <div style={{ 
                background: 'var(--pitch-black)', 
                border: '1px solid var(--border-subtle)', 
                padding: '6px 10px', 
                borderRadius: '6px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Award size={14} color="var(--nova-orange)" />
                <span style={{ fontWeight: 600 }}>{off.badge}</span>
              </div>

              {/* Contact Info */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} /> <span>{off.phone}</span>
                </div>
                {off.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} /> <span>{off.email}</span>
                  </div>
                )}
                <div>
                  <strong>Matches Officiated:</strong> {off.matchesOfficiated}
                </div>
              </div>

              {/* Current Assignment status */}
              <div style={{ 
                borderTop: '1px solid var(--border-subtle)', 
                paddingTop: '8px', 
                fontSize: '0.76rem' 
              }}>
                {assignedMatches.length > 0 ? (
                  <div style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Radio size={12} className="pulse-live-icon" />
                    <span>Assigned to {assignedMatches.length} scheduled match(es)</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>No active match assignment</span>
                )}
              </div>

              {/* Card Footer Actions */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: 'auto', 
                borderTop: '1px solid var(--border-subtle)', 
                paddingTop: '10px' 
              }}>
                <button 
                  className="admin-action-btn secondary sm"
                  onClick={() => handleToggleStatus(off)}
                >
                  {off.status === 'AVAILABLE' ? 'Set Unavailable' : 'Set Available'}
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="admin-action-btn secondary sm"
                    onClick={() => handleOpenEditModal(off)}
                    title="Edit Official"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button 
                    className="admin-action-btn secondary sm"
                    style={{ color: '#ef4444' }}
                    onClick={() => handleDeleteOfficial(off)}
                    title="Delete Official"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Official Modal */}
      {showAddEditModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddEditModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>{editingOfficial ? 'Edit NSFC Official' : 'Enroll NSFC Match Official'}</h3>
                <span className="modal-subtitle">Local league referee & commissioner registration</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text"
                    className="admin-input"
                    placeholder="e.g. James Mwangi"
                    value={officialForm.name}
                    onChange={(e) => setOfficialForm({ ...officialForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Primary Role *</label>
                    <select 
                      className="admin-select"
                      value={officialForm.role}
                      onChange={(e) => setOfficialForm({ ...officialForm, role: e.target.value as any })}
                    >
                      <option value="Center Referee">Center Referee</option>
                      <option value="Assistant Referee 1">Assistant Referee 1</option>
                      <option value="Assistant Referee 2">Assistant Referee 2</option>
                      <option value="Fourth Official">Fourth Official</option>
                      <option value="Match Commissioner">Match Commissioner</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">NSFC Credential / Badge</label>
                    <select 
                      className="admin-select"
                      value={officialForm.badge}
                      onChange={(e) => setOfficialForm({ ...officialForm, badge: e.target.value })}
                    >
                      <option value="NSFC Approved Referee">NSFC Approved Referee</option>
                      <option value="NSFC Assistant Official">NSFC Assistant Official</option>
                      <option value="NSFC Match Commissioner">NSFC Match Commissioner</option>
                      <option value="NSFC Youth Official">NSFC Youth Official</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="text"
                      className="admin-input"
                      placeholder="+254 7..."
                      value={officialForm.phone}
                      onChange={(e) => setOfficialForm({ ...officialForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email"
                      className="admin-input"
                      placeholder="official@nsfc.co.ke"
                      value={officialForm.email}
                      onChange={(e) => setOfficialForm({ ...officialForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Availability Status</label>
                  <select 
                    className="admin-select"
                    value={officialForm.status}
                    onChange={(e) => setOfficialForm({ ...officialForm, status: e.target.value as any })}
                  >
                    <option value="AVAILABLE">AVAILABLE (Eligible for assignment)</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowAddEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  {editingOfficial ? 'Save Changes' : 'Enroll Official'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
