import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Sliders, 
  FileText, 
  Search, 
  CheckCircle, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { adminStore, type AuthorizedAdminUser } from '../../../services/adminStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface GovernanceViewProps {
  onNavigate?: (section: string, subId?: string) => void;
}

export const GovernanceView: React.FC<GovernanceViewProps> = () => {
  const users = adminStore.getAuthorizedUsers();
  const auditLogs = adminStore.getAuditLogs();

  const [activeTab, setActiveTab] = useState<'USERS' | 'PERMISSIONS' | 'POLICIES' | 'AUDIT'>('USERS');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('ALL');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const handleToggleUserStatus = (u: AuthorizedAdminUser) => {
    const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    adminStore.updateAuthorizedUserStatus(u.id, nextStatus);
    setFeedbackNotice(`Updated access status for ${u.name} to ${nextStatus}.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleResetDemoData = () => {
    if (confirm('Reset demonstration data to official NSFC default suite? All changes will be reseeded.')) {
      adminStore.seedDefaults();
      setFeedbackNotice('Demonstration suite reset to default KeMU Super League records.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (auditCategoryFilter !== 'ALL' && log.category !== auditCategoryFilter) return false;
    if (auditSeverityFilter !== 'ALL' && (log.severity || 'INFO') !== auditSeverityFilter) return false;
    if (auditSearchQuery) {
      const q = auditSearchQuery.toLowerCase();
      return log.details.toLowerCase().includes(q) || 
             log.action.toLowerCase().includes(q) || 
             log.adminName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="admin-module-container">
      {/* Top Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <ShieldCheck size={14} className="eyebrow-icon" />
            <span>PLATFORM SECURITY & RBAC CONTROL</span>
          </div>
          <h1 className="module-title">Governance & Platform Settings</h1>
          <p className="module-subtitle">
            Authorized administrator delegations, role permission boundaries, operational policies, and platform audit history.
          </p>
        </div>

        <button 
          className="admin-action-btn secondary"
          onClick={handleResetDemoData}
        >
          <RotateCcw size={14} /> Reseed Demonstration Suite
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
          className={`inspector-tab ${activeTab === 'USERS' ? 'active' : ''}`}
          onClick={() => setActiveTab('USERS')}
        >
          <Users size={15} /> Authorized Administrators ({users.length})
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'PERMISSIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PERMISSIONS')}
        >
          <Key size={15} /> RBAC Capabilities Matrix
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'POLICIES' ? 'active' : ''}`}
          onClick={() => setActiveTab('POLICIES')}
        >
          <Sliders size={15} /> Platform Operational Policies
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'AUDIT' ? 'active' : ''}`}
          onClick={() => setActiveTab('AUDIT')}
        >
          <FileText size={15} /> Comprehensive Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: AUTHORIZED USERS */}
      {activeTab === 'USERS' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Authorized Governing Accounts</h3>
              <span className="content-sub">Delegated administrative roles with scoped operational capabilities.</span>
            </div>
          </div>

          <div className="users-grid-cards">
            {users.map((u) => (
              <div key={u.id} className="user-card-panel">
                <div className="user-card-top">
                  <div className="user-avatar-box">{u.avatar}</div>
                  <div className="user-info-box">
                    <h4 className="user-name">{u.name}</h4>
                    <span className="user-role-title">{u.roleTitle}</span>
                    <span className="user-email">{u.email}</span>
                  </div>
                  <AdminStatusBadge status={u.status} size="sm" />
                </div>

                <div className="user-jurisdiction">
                  <span className="j-label">Jurisdiction Scope:</span>
                  <strong className="j-val">{u.jurisdiction}</strong>
                </div>

                <div className="user-permissions-chips">
                  {u.permissions.map((p, idx) => (
                    <span key={idx} className="perm-chip">
                      {p.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                <div className="user-card-footer">
                  <span className="last-active">Active: {u.lastActive}</span>
                  <button 
                    className={`admin-action-btn ${u.status === 'ACTIVE' ? 'destructive' : 'secondary'} xs`}
                    onClick={() => handleToggleUserStatus(u)}
                  >
                    {u.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Access'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RBAC PERMISSIONS MATRIX */}
      {activeTab === 'PERMISSIONS' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Operational Responsibility Boundaries</h3>
              <span className="content-sub">
                Visual matrix separating platform-level governance from competition operations and pitchside roles.
              </span>
            </div>
          </div>

          <div className="matrix-table-wrapper">
            <table className="admin-table matrix-table">
              <thead>
                <tr>
                  <th>Capability / Workflow Scope</th>
                  <th>Super Admin</th>
                  <th>NSFC Director</th>
                  <th>Match Commissioner</th>
                  <th>Disciplinary Secretariat</th>
                  <th>Verified Coach</th>
                  <th>Match Referee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Create & Configure Competitions</td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                </tr>
                <tr>
                  <td>Open Seasons & Set Rulesets</td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                </tr>
                <tr>
                  <td>Schedule Fixtures & Venues</td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                </tr>
                <tr>
                  <td>Appoint Accredited Match Officials</td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                </tr>
                <tr>
                  <td>Submit Team Starting Lineup</td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                </tr>
                <tr>
                  <td>Log Pitchside Match Events & Report</td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                </tr>
                <tr>
                  <td>Certify Match Result into Standings</td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                </tr>
                <tr>
                  <td>Impose Table Point Deductions & Bans</td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-check"><Check size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                  <td className="mat-cross"><X size={16} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL POLICIES */}
      {activeTab === 'POLICIES' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">System-Wide Operational Parameters</h3>
              <span className="content-sub">Governing tolerances, correction grace windows, and automated triggers.</span>
            </div>
          </div>

          <div className="policies-grid">
            <div className="policy-card">
              <h4>Post-Match Correction Grace Window</h4>
              <p>Duration within which match officials can void pitchside logged events without tribunal escalation.</p>
              <div className="policy-val-box">5 Minutes (300,000 ms)</div>
              <span className="policy-status">Active & Enforced</span>
            </div>

            <div className="policy-card">
              <h4>Referee Exclusivity Credibility Rule</h4>
              <p>Strictly prohibits single officials from simultaneous appointment to overlapping match schedules.</p>
              <div className="policy-val-box">Strict 1-Match Exclusivity</div>
              <span className="policy-status">Active & Enforced</span>
            </div>

            <div className="policy-card">
              <h4>Yellow Card Suspension Threshold</h4>
              <p>Number of cumulative regular season yellow cards that automatically trigger a 1-match suspension.</p>
              <div className="policy-val-box">3 Yellow Cards</div>
              <span className="policy-status">Active & Enforced</span>
            </div>

            <div className="policy-card">
              <h4>Result Standings Feed Policy</h4>
              <p>Only verified match sheets signed by NSFC Administration feed into published league standings.</p>
              <div className="policy-val-box">Certification Mandated</div>
              <span className="policy-status">Active & Enforced</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPREHENSIVE AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="tab-pane-content">
          <div className="audit-controls-bar">
            <div className="search-input-box">
              <Search size={15} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search audit trail by operator, action, or details..."
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                className="admin-search-field"
              />
            </div>

            <div className="filter-select-group">
              <select 
                className="admin-select-sm"
                value={auditCategoryFilter}
                onChange={(e) => setAuditCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="COMPETITION">Competitions</option>
                <option value="SEASON">Seasons</option>
                <option value="TEAM">Teams & Players</option>
                <option value="FIXTURE">Fixtures</option>
                <option value="OFFICIAL">Officials</option>
                <option value="RESULT">Results</option>
                <option value="DISCIPLINE">Discipline</option>
                <option value="GOVERNANCE">Governance</option>
              </select>

              <select 
                className="admin-select-sm"
                value={auditSeverityFilter}
                onChange={(e) => setAuditSeverityFilter(e.target.value)}
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="audit-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>Category</th>
                  <th>Action Code</th>
                  <th>Details & Context</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="timestamp-cell">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="operator-cell">
                      <strong>{log.adminName}</strong>
                    </td>
                    <td>
                      <span className={`category-tag cat-${log.category.toLowerCase()}`}>
                        {log.category}
                      </span>
                    </td>
                    <td>
                      <code>{log.action}</code>
                    </td>
                    <td className="details-cell">{log.details}</td>
                    <td>
                      <span className={`severity-chip sev-${(log.severity || 'INFO').toLowerCase()}`}>
                        {log.severity || 'INFO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
