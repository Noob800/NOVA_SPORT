import { useState } from 'react';
import { 
  Users, Dumbbell, ClipboardList, 
  Bell, FileText, Plus, Send, 
  MapPin, Clock, Calendar, UserCheck, MessageSquare, Download,
  ArrowLeft, ChevronRight
} from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';
import type { 
  TeamProfileDetails, TeamStaffMember, TrainingSession, 
  TeamRequest, TeamAnnouncement, SquadPlayer 
} from '../../../services/teamDeskStore';

interface SettingsSectionProps {
  profile: TeamProfileDetails;
  staff: TeamStaffMember[];
  trainingSessions: TrainingSession[];
  requests: TeamRequest[];
  announcements: TeamAnnouncement[];
  squad: SquadPlayer[];
  teamId: string;
  onOpenScheduleTraining: () => void;
  onOpenNewRequest: () => void;
  onOpenNotices: () => void;
}

export function SettingsSection({
  profile: _profile,
  staff,
  trainingSessions,
  requests,
  announcements,
  squad,
  teamId: _teamId,
  onOpenScheduleTraining,
  onOpenNewRequest,
  onOpenNotices
}: SettingsSectionProps) {
  const [activeGroup, setActiveGroup] = useState<
    'requests' | 'training' | 'hub' | 'staff' | 'reports' | 'notifications'
  >('requests');

  // Request tracker state & mobile responsive view
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(requests[0]?.id || null);
  const [reqCategoryFilter, setReqCategoryFilter] = useState<string>('ALL');
  const [reqStatusFilter, setReqStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'DECLINED'>('ALL');
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [reqReplyMessage, setReqReplyMessage] = useState('');

  // Staff management state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'Head Coach' | 'Assistant Coach' | 'Team Manager' | 'Physiotherapist' | 'Kit Manager'>('Assistant Coach');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');

  // Attendance modal state
  const [attendanceSessionId, setAttendanceSessionId] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE'>>({});

  // Counts for quick filter pills
  const pendingCount = requests.filter(r => ['SUBMITTED', 'IN_REVIEW', 'MORE_INFO_REQUIRED'].includes(r.status)).length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;

  const filteredRequests = requests.filter(r => {
    const matchesCat = reqCategoryFilter === 'ALL' || r.category === reqCategoryFilter;
    const matchesStatus = 
      reqStatusFilter === 'ALL' ? true :
      reqStatusFilter === 'PENDING' ? ['SUBMITTED', 'IN_REVIEW', 'MORE_INFO_REQUIRED'].includes(r.status) :
      r.status === reqStatusFilter;
    return matchesCat && matchesStatus;
  });

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !reqReplyMessage.trim()) return;

    teamDeskStore.addRequestMessage(selectedRequestId, reqReplyMessage.trim(), 'Coach Marcus', 'Head Coach');
    setReqReplyMessage('');
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    teamDeskStore.addStaff({
      name: staffName.trim(),
      role: staffRole,
      email: staffEmail.trim() || 'staff@novasport.org',
      phone: staffPhone.trim() || '+254 700 000 000',
      permissions: staffRole === 'Assistant Coach' ? ['SQUAD_MANAGEMENT', 'FIXTURES_MATCHDAY'] : ['SQUAD_MANAGEMENT']
    });

    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setShowAddStaff(false);
  };

  const openAttendanceModal = (session: TrainingSession) => {
    setAttendanceSessionId(session.id);
    const initial: Record<string, 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE'> = {};
    squad.forEach(p => {
      initial[p.id] = session.attendance[p.id] || (p.availability === 'INJURED' ? 'EXCUSED' : 'PRESENT');
    });
    setAttendanceMap(initial);
  };

  const saveAttendance = () => {
    if (attendanceSessionId) {
      teamDeskStore.updateTrainingAttendance(attendanceSessionId, attendanceMap);
      setAttendanceSessionId(null);
    }
  };

  return (
    <div className="settings-section-container">
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>
          Team Administration & Supporting Tools
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Governance requests, training scheduling, announcements, staff access and club settings
        </p>
      </div>

      {/* Group Navigation Tabs */}
      <div className="desk-subtabs" style={{ flexWrap: 'wrap' }}>
        <button
          className={`desk-subtab-btn ${activeGroup === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveGroup('requests')}
        >
          <ClipboardList size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Requests & Approvals ({requests.length})
        </button>
        <button
          className={`desk-subtab-btn ${activeGroup === 'training' ? 'active' : ''}`}
          onClick={() => setActiveGroup('training')}
        >
          <Dumbbell size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Training Management ({trainingSessions.length})
        </button>
        <button
          className={`desk-subtab-btn ${activeGroup === 'hub' ? 'active' : ''}`}
          onClick={() => setActiveGroup('hub')}
        >
          <Bell size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Team Hub & Bulletins ({announcements.length})
        </button>
        <button
          className={`desk-subtab-btn ${activeGroup === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveGroup('staff')}
        >
          <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Staff & Permissions ({staff.length})
        </button>
        <button
          className={`desk-subtab-btn ${activeGroup === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveGroup('reports')}
        >
          <FileText size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Reports & Exports
        </button>
      </div>

      {/* GROUP 1: REQUESTS & APPROVALS (REQUIREMENT 7 - REDESIGNED MOBILE WORKBENCH) */}
      {activeGroup === 'requests' && (
        <div className="requests-workbench-wrapper">
          {/* Top Quick Filter Bar */}
          <div className="requests-filter-bar">
            <div className="requests-status-pills">
              <button
                type="button"
                className={`req-filter-pill ${reqStatusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setReqStatusFilter('ALL')}
              >
                All ({requests.length})
              </button>
              <button
                type="button"
                className={`req-filter-pill ${reqStatusFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setReqStatusFilter('PENDING')}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                className={`req-filter-pill ${reqStatusFilter === 'APPROVED' ? 'active' : ''}`}
                onClick={() => setReqStatusFilter('APPROVED')}
              >
                Approved ({approvedCount})
              </button>
              <button
                type="button"
                className={`req-filter-pill ${reqStatusFilter === 'DECLINED' ? 'active' : ''}`}
                onClick={() => setReqStatusFilter('DECLINED')}
              >
                Declined ({requests.filter(r => r.status === 'DECLINED').length})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '380px' }}>
              <select
                value={reqCategoryFilter}
                onChange={e => setReqCategoryFilter(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '6px 10px', flex: 1 }}
              >
                <option value="ALL">All Categories</option>
                <option value="PLAYER_REGISTRATION">Player Registration</option>
                <option value="TRANSFER">Transfers</option>
                <option value="FIXTURE_RESCHEDULE">Fixture Reschedule</option>
                <option value="VENUE_CHANGE">Venue Change</option>
                <option value="RESULT_CORRECTION">Result Correction</option>
                <option value="DISCIPLINARY">Disciplinary</option>
                <option value="GENERAL">General Inquiries</option>
              </select>

              <button
                onClick={onOpenNewRequest}
                className="quick-action-btn primary"
                style={{ fontSize: '0.8rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                <Plus size={14} /> New Request
              </button>
            </div>
          </div>

          {/* Grid: 2 columns on desktop, toggled view on mobile */}
          <div className={`requests-workbench-grid ${mobileShowDetail ? 'mobile-showing-detail' : ''}`}>
            {/* Column 1: Requests List */}
            <div className="requests-list-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  INBOX ({filteredRequests.length} {filteredRequests.length === 1 ? 'REQUEST' : 'REQUESTS'})
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Tap to view thread
                </span>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="card-panel" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No requests match the selected filters.
                </div>
              ) : (
                filteredRequests.map(req => {
                  const isSelected = selectedRequestId === req.id;
                  const isPending = ['SUBMITTED', 'IN_REVIEW', 'MORE_INFO_REQUIRED'].includes(req.status);
                  const isApproved = req.status === 'APPROVED';

                  return (
                    <div
                      key={req.id}
                      onClick={() => {
                        setSelectedRequestId(req.id);
                        setMobileShowDetail(true);
                      }}
                      className={`request-card-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--nova-orange)' }}>{req.id}</span>
                          <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--pitch-black)', color: 'var(--text-muted)' }}>
                            {req.category.replace('_', ' ')}
                          </span>
                        </div>
                        <span className={`status-pill ${isApproved ? 'fit' : isPending ? 'doubtful' : 'suspended'}`} style={{ fontSize: '0.65rem' }}>
                          {req.status}
                        </span>
                      </div>

                      <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '6px', lineHeight: 1.3 }}>
                        {req.title}
                      </strong>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>
                          {new Date(req.submissionTimestamp).toLocaleDateString()} • {req.priority}
                        </span>
                        <ChevronRight size={14} style={{ opacity: 0.6 }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Column 2: Request Detail & Conversation Thread */}
            <div className="requests-detail-col">
              {selectedRequest ? (
                <div className="card-panel">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    className="requests-back-btn"
                    onClick={() => setMobileShowDetail(false)}
                  >
                    <ArrowLeft size={15} /> Back to Requests List
                  </button>

                  <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--nova-orange)', fontWeight: 700 }}>
                            {selectedRequest.id}
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--pitch-black)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                            {selectedRequest.category}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Priority: <strong>{selectedRequest.priority}</strong>
                          </span>
                        </div>
                        <h3 style={{ margin: '4px 0', fontSize: '1.25rem' }}>{selectedRequest.title}</h3>
                      </div>
                      <span className={`status-pill ${selectedRequest.status === 'APPROVED' ? 'fit' : ['SUBMITTED', 'IN_REVIEW', 'MORE_INFO_REQUIRED'].includes(selectedRequest.status) ? 'doubtful' : 'suspended'}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Assigned Reviewer: <strong>{selectedRequest.assignedReviewer}</strong> • Submitted: {new Date(selectedRequest.submissionTimestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Justification Text */}
                  <div style={{ padding: '12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Request Details & Justification:</div>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{selectedRequest.description}</p>
                  </div>

                  {/* Response History Thread */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageSquare size={16} color="var(--nova-orange)" />
                      Official Communication Thread ({selectedRequest.responseHistory.length})
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedRequest.responseHistory.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                          No messages yet. Waiting for review from {selectedRequest.assignedReviewer}.
                        </div>
                      ) : (
                        selectedRequest.responseHistory.map(resp => (
                          <div
                            key={resp.id}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-md)',
                              background: resp.role.includes('Coach') ? 'rgba(255, 94, 0, 0.08)' : 'var(--pitch-black)',
                              border: `1px solid ${resp.role.includes('Coach') ? 'rgba(255, 94, 0, 0.3)' : 'var(--border-subtle)'}`
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                              <strong>{resp.author} <span style={{ color: 'var(--nova-orange)', fontWeight: 500 }}>({resp.role})</span></strong>
                              <span style={{ color: 'var(--text-muted)' }}>{new Date(resp.timestamp).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.4 }}>
                              {resp.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} style={{ marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <textarea
                        rows={2}
                        className="form-textarea"
                        placeholder="Provide additional details or reply to the review committee..."
                        value={reqReplyMessage}
                        onChange={e => setReqReplyMessage(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="login-button"
                      style={{ padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={14} /> Send Reply to Reviewer
                    </button>
                  </form>

                  {/* Audit Trail */}
                  <div>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Governance Audit Trail
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedRequest.auditTrail.map((entry, idx) => (
                        <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <strong style={{ color: 'var(--stadium-white)' }}>{entry.action}</strong>
                          <span>by {entry.user}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-panel" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  Select a request from the list to view details and response history.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GROUP 2: TRAINING MANAGEMENT */}
      {activeGroup === 'training' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Training Sessions & Regimen</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Session schedules, tactical objectives and attendance records
              </p>
            </div>
            <button onClick={onOpenScheduleTraining} className="login-button" style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
              <Plus size={16} /> Schedule Session
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trainingSessions.map(sess => (
              <div
                key={sess.id}
                className="card-panel"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`status-pill ${sess.status === 'COMPLETED' ? 'fit' : 'doubtful'}`}>
                      {sess.status}
                    </span>
                    <strong style={{ fontSize: '1rem' }}>{sess.objective}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span><Calendar size={13} style={{ display: 'inline', marginRight: '3px' }} />{sess.date}</span>
                    <span><Clock size={13} style={{ display: 'inline', marginRight: '3px' }} />{sess.time} ({sess.durationMinutes} mins)</span>
                    <span><MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} />{sess.venue}</span>
                  </div>
                  {sess.planNotes && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--stadium-white)', marginTop: '4px' }}>
                      Plan: {sess.planNotes}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => openAttendanceModal(sess)}
                  style={{
                    background: 'var(--pitch-black)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--stadium-white)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UserCheck size={16} color="var(--nova-orange)" />
                  {Object.keys(sess.attendance).length > 0 ? 'Edit Attendance' : 'Mark Attendance'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GROUP 3: TEAM HUB & ANNOUNCEMENTS */}
      {activeGroup === 'hub' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Team Hub & Squad Notices</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Broadcast notices directly to players and staff
              </p>
            </div>
            <button onClick={onOpenNotices} className="login-button" style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
              <Plus size={16} /> Publish New Bulletin
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.map(ann => (
              <div key={ann.id} className="card-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '1rem' }}>{ann.title}</strong>
                  <span className="status-pill fit" style={{ fontSize: '0.65rem' }}>{ann.category}</span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--stadium-white)', lineHeight: 1.5 }}>
                  {ann.content}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Published: {ann.date} • Author: {ann.author} • Audience: {ann.audience}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* GROUP 5: STAFF & PERMISSIONS */}
      {activeGroup === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Team Technical Staff & Permissions</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Authorized team staff and workspace access assignments
              </p>
            </div>
            <button
              onClick={() => setShowAddStaff(true)}
              className="login-button"
              style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <Plus size={16} /> Add Staff Member
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {staff.map(member => (
              <div key={member.id} className="card-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', display: 'block' }}>{member.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--nova-orange)', fontWeight: 600 }}>{member.role}</span>
                  </div>
                  {member.isCurrentUser && (
                    <span className="status-pill fit" style={{ fontSize: '0.65rem' }}>Active User</span>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <div>{member.email}</div>
                  <div>{member.phone}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Permissions:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {member.permissions.map((perm, pIdx) => (
                      <span key={pIdx} style={{ background: 'var(--pitch-black)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                        {perm.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddStaff && (
            <div className="modal-overlay" onClick={() => setShowAddStaff(false)}>
              <div className="modal-content-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 style={{ margin: 0 }}>Add Staff Member</h3>
                  <button onClick={() => setShowAddStaff(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAddStaff}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={staffName}
                        onChange={e => setStaffName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={staffRole}
                        onChange={e => setStaffRole(e.target.value as any)}
                      >
                        <option value="Assistant Coach">Assistant Coach</option>
                        <option value="Physiotherapist">Physiotherapist</option>
                        <option value="Team Manager">Team Manager</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={staffEmail}
                        onChange={e => setStaffEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={staffPhone}
                        onChange={e => setStaffPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowAddStaff(false)}
                      style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--stadium-white)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="login-button" style={{ padding: '8px 20px', fontWeight: 600 }}>
                      Add Staff
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GROUP 6: REPORTS & EXPORTS */}
      {activeGroup === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="card-panel">
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>Squad Official Roster Sheet</h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Complete roster listing with shirt numbers, dates of birth, eligibility statuses and contact details.
            </p>
            <button
              onClick={() => {
                const headers = ['Number', 'Name', 'Position', 'Age', 'Status', 'Eligibility'];
                const rows = squad.map(p => [p.number, `"${p.name}"`, p.position, p.age, p.availability, p.eligibility]);
                const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                const link = document.createElement('a');
                link.setAttribute('href', encodeURI(csv));
                link.setAttribute('download', 'Squad_Roster.csv');
                link.click();
              }}
              className="quick-action-btn primary"
              style={{ padding: '8px 14px' }}
            >
              <Download size={16} /> Download Roster (CSV)
            </button>
          </div>

          <div className="card-panel">
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>Season Analytics Summary</h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Detailed player-by-player performance matrix including minutes, goals, assists and disciplinary history.
            </p>
            <button
              onClick={() => {
                const headers = ['Name', 'Position', 'Apps', 'Goals', 'Assists', 'YellowCards', 'RedCards', 'Attendance%'];
                const rows = squad.map(p => [`"${p.name}"`, p.position, p.appearances, p.goals, p.assists, p.yellowCards, p.redCards, p.trainingAttendance]);
                const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                const link = document.createElement('a');
                link.setAttribute('href', encodeURI(csv));
                link.setAttribute('download', 'Season_Analytics.csv');
                link.click();
              }}
              className="quick-action-btn primary"
              style={{ padding: '8px 14px' }}
            >
              <Download size={16} /> Download Analytics (CSV)
            </button>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceSessionId && (
        <div className="modal-overlay" onClick={() => setAttendanceSessionId(null)}>
          <div className="modal-content-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Mark Training Attendance</h3>
              <button onClick={() => setAttendanceSessionId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '450px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {squad.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--pitch-black)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <strong>#{p.number} {p.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{p.position}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAttendanceMap(prev => ({ ...prev, [p.id]: st }))}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: attendanceMap[p.id] === st ? 'var(--nova-orange)' : 'var(--surface-elevated)',
                            color: attendanceMap[p.id] === st ? 'var(--pitch-black)' : 'var(--stadium-white)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {st[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setAttendanceSessionId(null)}
                style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--stadium-white)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAttendance}
                className="login-button"
                style={{ padding: '8px 20px', fontWeight: 600 }}
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
