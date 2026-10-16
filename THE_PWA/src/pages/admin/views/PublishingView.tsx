import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Pin, 
  Trash2, 
  CheckCircle, 
  FileText, 
  Globe
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';

interface PublishingViewProps {
  onNavigate?: (section: string, subId?: string) => void;
  onOpenNewAnnouncementModal: () => void;
}

export const PublishingView: React.FC<PublishingViewProps> = ({
  onOpenNewAnnouncementModal
}) => {
  const announcements = adminStore.getAnnouncements();

  const [activeTab, setActiveTab] = useState<'BULLETINS' | 'REGULATIONS' | 'SYNC'>('BULLETINS');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const handleTogglePin = (id: string, currentPin?: boolean) => {
    adminStore.toggleAnnouncementPin(id, !currentPin);
    setFeedbackNotice(`Bulletin ${!currentPin ? 'pinned' : 'unpinned'}.`);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Are you sure you want to withdraw this official bulletin?')) {
      adminStore.deleteAnnouncement(id);
      setFeedbackNotice('Official bulletin withdrawn.');
      setTimeout(() => setFeedbackNotice(null), 2500);
    }
  };

  return (
    <div className="admin-module-container">
      {/* Top Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <Megaphone size={14} className="eyebrow-icon" />
            <span>DISSEMINATION & PUBLIC BROADCAST</span>
          </div>
          <h1 className="module-title">Content & Publishing Hub</h1>
          <p className="module-subtitle">
            NSFC official bulletins, technical circulars, tournament regulations, and public portal sync oversight.
          </p>
        </div>

        <button 
          className="admin-action-btn primary"
          onClick={onOpenNewAnnouncementModal}
        >
          <Plus size={14} /> New Official Bulletin
        </button>
      </div>

      {feedbackNotice && (
        <div className="admin-inline-alert success">
          <CheckCircle size={16} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="inspector-nav-tabs">
        <button 
          className={`inspector-tab ${activeTab === 'BULLETINS' ? 'active' : ''}`}
          onClick={() => setActiveTab('BULLETINS')}
        >
          <Megaphone size={15} /> Official Bulletins ({announcements.length})
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'REGULATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('REGULATIONS')}
        >
          <FileText size={15} /> Competition Rulebooks & Regulations
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'SYNC' ? 'active' : ''}`}
          onClick={() => setActiveTab('SYNC')}
        >
          <Globe size={15} /> Public Portal Synchronization
        </button>
      </div>

      {/* TAB 1: BULLETINS */}
      {activeTab === 'BULLETINS' && (
        <div className="tab-pane-content">
          <div className="bulletins-grid-cards">
            {announcements.map((ann) => (
              <div key={ann.id} className={`bulletin-card ${ann.isPinned || ann.pinned ? 'pinned' : ''}`}>
                <div className="bulletin-card-header">
                  <div className="priority-audience-row">
                    <span className={`priority-tag p-${(ann.priority || 'NORMAL').toLowerCase()}`}>
                      {ann.priority || 'NORMAL'}
                    </span>
                    <span className="audience-tag">
                      Audience: <strong>{ann.targetAudience || ann.target || 'ALL'}</strong>
                    </span>
                  </div>

                  <div className="pin-action-group">
                    <button 
                      className={`pin-btn ${ann.isPinned || ann.pinned ? 'pinned' : ''}`}
                      onClick={() => handleTogglePin(ann.id, ann.isPinned || ann.pinned)}
                      title={ann.isPinned ? 'Unpin bulletin' : 'Pin bulletin'}
                    >
                      <Pin size={14} />
                    </button>
                    <button 
                      className="trash-btn"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      title="Withdraw bulletin"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="bulletin-card-title">{ann.title}</h3>
                <p className="bulletin-card-content">{ann.content}</p>

                <div className="bulletin-card-footer">
                  <span className="author-line">
                    By <strong>{ann.author}</strong>
                  </span>
                  <span className="date-line">
                    {new Date(ann.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REGULATIONS REPOSITORY */}
      {activeTab === 'REGULATIONS' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Official Governing Rulebooks</h3>
              <span className="content-sub">Codified tournament regulations and matchday protocol documents.</span>
            </div>
          </div>

          <div className="regulations-list">
            <div className="regulation-card">
              <div className="reg-icon-box">
                <FileText size={22} />
              </div>
              <div className="reg-info">
                <h4>NSFC Official Competition Regulations (2026/27 Edition)</h4>
                <p>Governing charter covering player registration, points structure, matchday readiness, and tiebreakers.</p>
                <div className="reg-meta">Version 2.4 • Approved by NSFC Executive Council</div>
              </div>
              <div className="reg-actions">
                <span className="sync-chip verified">Published Active</span>
              </div>
            </div>

            <div className="regulation-card">
              <div className="reg-icon-box">
                <FileText size={22} />
              </div>
              <div className="reg-info">
                <h4>Match Officials Integrity & Credibility Protocol</h4>
                <p>Mandates 1-match exclusivity, pitchside incident logging, and post-match verification window.</p>
                <div className="reg-meta">Referees Committee Directives • FIFA/FKF Aligned</div>
              </div>
              <div className="reg-actions">
                <span className="sync-chip verified">Published Active</span>
              </div>
            </div>

            <div className="regulation-card">
              <div className="reg-icon-box">
                <FileText size={22} />
              </div>
              <div className="reg-info">
                <h4>Student Athlete Eligibility & Academic Verification Policy</h4>
                <p>Registration standards, National ID requirements, and disciplinary ban appeals procedure.</p>
                <div className="reg-meta">Secretariat Regulation • Article 7.2</div>
              </div>
              <div className="reg-actions">
                <span className="sync-chip verified">Published Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLIC SYNC */}
      {activeTab === 'SYNC' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Public Fan Portal Visibility & Broadcast Feeds</h3>
              <span className="content-sub">Real-time status of data published from the NSFC operational control centre.</span>
            </div>
          </div>

          <div className="sync-status-grid">
            <div className="sync-card">
              <div className="sync-card-top">
                <h4>League Standings Table</h4>
                <span className="sync-chip verified">Live Synchronized</span>
              </div>
              <p>Certified scores automatically update table positions, goal differences, and form indicators.</p>
              <div className="sync-target">Destination: Public Competition Hub & Fan Dashboard</div>
            </div>

            <div className="sync-card">
              <div className="sync-card-top">
                <h4>Live Matchday Operations</h4>
                <span className="sync-chip verified">Active Broadcast</span>
              </div>
              <p>Timeline pitchside events recorded by referees broadcast immediately to public match centers.</p>
              <div className="sync-target">Destination: NovaSport Public Match Center</div>
            </div>

            <div className="sync-card">
              <div className="sync-card-top">
                <h4>Official Bulletins Feed</h4>
                <span className="sync-chip verified">Synchronized</span>
              </div>
              <p>Circulars targeted to ALL or PUBLIC appear immediately on the Team Desk and fan notices board.</p>
              <div className="sync-target">Destination: NovaSport Public News & Notices</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
