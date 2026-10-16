import React, { useState } from 'react';
import { 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  RefreshCw,
  Search,
  CheckCircle
} from 'lucide-react';
import { adminStore, type OfficialRecord } from '../../../services/adminStore';
import { matchStore, type OfficialMatchData } from '../../../services/matchStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface MatchOfficialViewProps {
  onNavigate: (section: string, subId?: string) => void;
}

export const MatchOfficialView: React.FC<MatchOfficialViewProps> = ({ onNavigate }) => {
  const matches = matchStore.getAllMatches();
  const allOfficials = adminStore.getOfficials();
  
  // Referees and Match Commissioners from central directory
  const eligibleMatchOfficials = allOfficials.filter(o => 
    o.role !== 'Head Coach' || (o.roles && o.roles.some(r => r !== 'Head Coach'))
  );

  const [filterMode, setFilterMode] = useState<'ALL' | 'UNASSIGNED' | 'APPOINTED' | 'READY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'FIXTURES' | 'READINESS'>('FIXTURES');
  const [notice, setNotice] = useState<string | null>(null);

  // Appoint modal state
  const [targetMatch, setTargetMatch] = useState<OfficialMatchData | null>(null);
  const [selectedRole, setSelectedRole] = useState<OfficialRecord['role']>('Center Referee');
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>(eligibleMatchOfficials[0]?.id || '');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Removal Confirmation modal state
  const [removalTarget, setRemovalTarget] = useState<{
    matchId: string;
    officialId: string;
    officialName: string;
    role: string;
    matchTitle: string;
  } | null>(null);

  // Filtered fixtures
  const filteredMatches = matches.filter(m => {
    const isUnassigned = !m.officials || m.officials.length === 0 || !m.officials.some(o => o.role === 'Center Referee');
    const isAppointed = m.officials && m.officials.length > 0;
    const isReady = m.status === 'READY' || (m.officials && m.officials.length >= 2);

    if (filterMode === 'UNASSIGNED' && !isUnassigned) return false;
    if (filterMode === 'APPOINTED' && !isAppointed) return false;
    if (filterMode === 'READY' && !isReady) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.homeTeam.name} ${m.awayTeam.name} ${m.venue} ${m.round} ${m.officials?.map(o => o.name).join(' ') || ''}`.toLowerCase();
      return matchText.includes(q);
    }
    return true;
  });

  // KPI counts
  const totalUpcoming = matches.filter(m => ['SCHEDULED', 'READY'].includes(m.status)).length;
  const unassignedCount = matches.filter(m => !m.officials || m.officials.length === 0 || !m.officials.some(o => o.role === 'Center Referee')).length;
  const fullyAppointedCount = matches.filter(m => m.officials && m.officials.length >= 2).length;

  // Open Appoint Modal
  const handleOpenAppoint = (match: OfficialMatchData, defaultRole: OfficialRecord['role'] = 'Center Referee') => {
    setTargetMatch(match);
    setSelectedRole(defaultRole);
    const initialOfficialId = eligibleMatchOfficials[0]?.id || '';
    setSelectedOfficialId(initialOfficialId);

    if (initialOfficialId) {
      const conflict = adminStore.checkOfficialConflict(initialOfficialId, match.id);
      setConflictWarning(conflict.hasConflict ? conflict.conflictReason || 'Conflict detected' : null);
    } else {
      setConflictWarning(null);
    }
  };

  // Change official in modal
  const handleOfficialChange = (officialId: string) => {
    setSelectedOfficialId(officialId);
    if (targetMatch) {
      const conflict = adminStore.checkOfficialConflict(officialId, targetMatch.id);
      setConflictWarning(conflict.hasConflict ? conflict.conflictReason || 'Conflict detected' : null);
    }
  };

  // Confirm appointment
  const handleConfirmAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMatch || !selectedOfficialId) return;

    try {
      adminStore.appointOfficial(targetMatch.id, selectedOfficialId, selectedRole);
      // Auto update readiness checklist
      adminStore.updateMatchReadiness(targetMatch.id, { officialsAppointed: true });
      setNotice(`Official appointed as ${selectedRole} for ${targetMatch.homeTeam.shortName} vs ${targetMatch.awayTeam.shortName}.`);
      setTargetMatch(null);
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setConflictWarning(err.message || 'Scheduling conflict detected.');
    }
  };

  // Open remove confirmation
  const handlePromptRemoval = (match: OfficialMatchData, official: { id: string; name: string; role: string }) => {
    setRemovalTarget({
      matchId: match.id,
      officialId: official.id,
      officialName: official.name,
      role: official.role,
      matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`
    });
  };

  // Execute removal
  const handleExecuteRemoval = () => {
    if (!removalTarget) return;
    adminStore.removeOfficialAppointment(removalTarget.matchId, removalTarget.officialId);
    
    // Check if match still has center referee
    const updatedMatch = matchStore.getMatchById(removalTarget.matchId);
    const hasRemainingRef = updatedMatch?.officials && updatedMatch.officials.length > 0;
    adminStore.updateMatchReadiness(removalTarget.matchId, { officialsAppointed: hasRemainingRef });

    setNotice(`Revoked appointment of ${removalTarget.officialName}. Fixture requires reassignment.`);
    setRemovalTarget(null);
    setTimeout(() => setNotice(null), 4000);
  };

  // Toggle readiness item
  const handleToggleReadiness = (matchId: string, key: string, currentValue: boolean) => {
    adminStore.updateMatchReadiness(matchId, { [key]: !currentValue });
  };

  return (
    <div className="admin-module-container">
      {/* Top Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <Award size={14} className="eyebrow-icon" />
            <span>PITCHSIDE CREDIBILITY & MATCHDAY APPOINTMENTS</span>
          </div>
          <h1 className="module-title">Match Official</h1>
          <p className="module-subtitle">
            Assign NSFC-certified match officials, inspect pitchside readiness, and prevent fixture scheduling conflicts.
          </p>
        </div>

        <div className="module-actions-cluster">
          <button 
            className="admin-action-btn secondary"
            onClick={() => onNavigate('officials')}
            title="Manage person directory and contact profiles"
          >
            <UserCheck size={14} /> Official Directory
          </button>
        </div>
      </div>

      {notice && (
        <div className="admin-inline-alert success">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="admin-grid-four">
        <div className="admin-kpi-card">
          <div className="kpi-icon-cell cyan">
            <Calendar size={18} />
          </div>
          <div className="kpi-data-cell">
            <span className="kpi-label">UPCOMING FIXTURES</span>
            <strong className="kpi-value">{totalUpcoming}</strong>
            <span className="kpi-sub">On current league calendar</span>
          </div>
        </div>

        <div className={`admin-kpi-card ${unassignedCount > 0 ? 'highlight-warning' : ''}`}>
          <div className="kpi-icon-cell orange">
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-data-cell">
            <span className="kpi-label">NEEDS OFFICIAL</span>
            <strong className="kpi-value">{unassignedCount}</strong>
            <span className="kpi-sub" style={{ color: unassignedCount > 0 ? 'var(--nova-orange)' : 'var(--steel-grey)' }}>
              {unassignedCount > 0 ? 'Urgent appointments required' : 'All fixtures assigned'}
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-cell green">
            <ShieldCheck size={18} />
          </div>
          <div className="kpi-data-cell">
            <span className="kpi-label">FULLY APPOINTED</span>
            <strong className="kpi-value">{fullyAppointedCount}</strong>
            <span className="kpi-sub">Referees + assistants assigned</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-cell purple">
            <Award size={18} />
          </div>
          <div className="kpi-data-cell">
            <span className="kpi-label">DIRECTORY POOL</span>
            <strong className="kpi-value">{eligibleMatchOfficials.length}</strong>
            <span className="kpi-sub">Accredited NSFC officials</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="admin-tabs-nav" style={{ marginTop: '18px' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'FIXTURES' ? 'active' : ''}`}
          onClick={() => setActiveTab('FIXTURES')}
        >
          <Award size={15} /> Match Appointments ({matches.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'READINESS' ? 'active' : ''}`}
          onClick={() => setActiveTab('READINESS')}
        >
          <CheckCircle size={15} /> Matchday Readiness Checklists
        </button>
      </div>

      {/* VIEW 1: MATCH APPOINTMENTS */}
      {activeTab === 'FIXTURES' && (
        <div className="tab-pane-content" style={{ marginTop: '16px' }}>
          {/* Filters Bar */}
          <div className="table-controls-bar">
            <div className="search-input-wrap">
              <Search size={14} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by team, venue, referee, or round..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-input-search"
              />
            </div>

            <div className="filter-chips-row">
              <button 
                className={`filter-chip ${filterMode === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterMode('ALL')}
              >
                All ({matches.length})
              </button>
              <button 
                className={`filter-chip ${filterMode === 'UNASSIGNED' ? 'active' : ''}`}
                onClick={() => setFilterMode('UNASSIGNED')}
                style={{ borderColor: unassignedCount > 0 ? 'var(--nova-orange)' : undefined }}
              >
                ⚠️ Needs Officials ({unassignedCount})
              </button>
              <button 
                className={`filter-chip ${filterMode === 'APPOINTED' ? 'active' : ''}`}
                onClick={() => setFilterMode('APPOINTED')}
              >
                Assigned ({matches.length - unassignedCount})
              </button>
              <button 
                className={`filter-chip ${filterMode === 'READY' ? 'active' : ''}`}
                onClick={() => setFilterMode('READY')}
              >
                Ready for Kickoff ({matches.filter(m => m.status === 'READY').length})
              </button>
            </div>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="admin-empty-state-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Award size={36} style={{ color: 'var(--steel-grey)', margin: '0 auto 12px' }} />
              <h3 style={{ color: 'var(--stadium-white)', marginBottom: '6px' }}>No Fixtures Matching Filter</h3>
              <p style={{ color: 'var(--steel-grey)', fontSize: '0.85rem' }}>
                Try adjusting your search query or reset filter to 'All'.
              </p>
            </div>
          ) : (
            <div className="fixtures-appointments-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredMatches.map(match => {
                const centerRef = match.officials?.find(o => o.role === 'Center Referee');
                const asstRef1 = match.officials?.find(o => o.role === 'Assistant Referee 1');
                const asstRef2 = match.officials?.find(o => o.role === 'Assistant Referee 2');
                const commissioner = match.officials?.find(o => o.role === 'Match Commissioner');
                const isMissingCenterRef = !centerRef;

                return (
                  <div 
                    key={match.id} 
                    className="admin-card"
                    style={{ 
                      padding: '16px 20px', 
                      borderLeft: isMissingCenterRef ? '3px solid var(--nova-orange)' : '3px solid #22c55e',
                      backgroundColor: '#141619'
                    }}
                  >
                    {/* Fixture Metadata Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--nova-orange)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {match.competition?.name || 'League Match'}
                        </span>
                        <span style={{ color: 'var(--steel-grey)', fontSize: '0.75rem' }}>•</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--steel-grey)' }}>{match.round}</span>
                        <span style={{ color: 'var(--steel-grey)', fontSize: '0.75rem' }}>•</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--steel-grey)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {match.date} at {match.time}
                        </span>
                        <span style={{ color: 'var(--steel-grey)', fontSize: '0.75rem' }}>•</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--steel-grey)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {match.venue}
                        </span>
                      </div>
                      <AdminStatusBadge status={match.status} size="sm" />
                    </div>

                    {/* Match Teams Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#1a1d21', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{match.homeTeam.logo || '⚽'}</span>
                        <strong style={{ color: 'var(--stadium-white)', fontSize: '1rem' }}>{match.homeTeam.name}</strong>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--steel-grey)' }}>VS</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: 'var(--stadium-white)', fontSize: '1rem' }}>{match.awayTeam.name}</strong>
                        <span style={{ fontSize: '1.4rem' }}>{match.awayTeam.logo || '⚽'}</span>
                      </div>
                    </div>

                    {/* Official Appointments Roster */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--steel-grey)' }}>
                          OFFICIAL APPOINTMENTS
                        </span>
                        {isMissingCenterRef && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--nova-orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> Center Referee Required
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                        {/* Center Referee */}
                        <div style={{ padding: '10px', backgroundColor: '#181b1f', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--steel-grey)', fontWeight: 700 }}>CENTER REFEREE (LEAD)</span>
                            {centerRef ? (
                              <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 800 }}>APPOINTED</span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'var(--nova-orange)', fontWeight: 800 }}>UNASSIGNED</span>
                            )}
                          </div>
                          {centerRef ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--stadium-white)' }}>{centerRef.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--steel-grey)' }}>{centerRef.badge || 'NSFC Referee'}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  className="admin-action-btn secondary sm"
                                  onClick={() => handleOpenAppoint(match, 'Center Referee')}
                                  title="Change Official"
                                >
                                  <RefreshCw size={11} />
                                </button>
                                <button 
                                  className="admin-action-btn sm"
                                  style={{ color: '#ef4444', backgroundColor: 'transparent' }}
                                  onClick={() => handlePromptRemoval(match, centerRef)}
                                  title="Revoke Appointment"
                                >
                                  <UserX size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="admin-action-btn primary sm"
                              style={{ width: '100%', marginTop: '4px' }}
                              onClick={() => handleOpenAppoint(match, 'Center Referee')}
                            >
                              + Appoint Center Ref
                            </button>
                          )}
                        </div>

                        {/* Assistant Referee 1 */}
                        <div style={{ padding: '10px', backgroundColor: '#181b1f', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--steel-grey)', fontWeight: 700 }}>ASSISTANT REFEREE 1</span>
                            {asstRef1 ? (
                              <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 800 }}>APPOINTED</span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'var(--steel-grey)' }}>OPTIONAL</span>
                            )}
                          </div>
                          {asstRef1 ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--stadium-white)' }}>{asstRef1.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--steel-grey)' }}>{asstRef1.badge}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  className="admin-action-btn secondary sm"
                                  onClick={() => handleOpenAppoint(match, 'Assistant Referee 1')}
                                  title="Change Official"
                                >
                                  <RefreshCw size={11} />
                                </button>
                                <button 
                                  className="admin-action-btn sm"
                                  style={{ color: '#ef4444', backgroundColor: 'transparent' }}
                                  onClick={() => handlePromptRemoval(match, asstRef1)}
                                  title="Revoke Appointment"
                                >
                                  <UserX size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="admin-action-btn secondary sm"
                              style={{ width: '100%', marginTop: '4px' }}
                              onClick={() => handleOpenAppoint(match, 'Assistant Referee 1')}
                            >
                              + Appoint Asst Ref 1
                            </button>
                          )}
                        </div>

                        {/* Assistant Referee 2 */}
                        <div style={{ padding: '10px', backgroundColor: '#181b1f', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--steel-grey)', fontWeight: 700 }}>ASSISTANT REFEREE 2</span>
                            {asstRef2 ? (
                              <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 800 }}>APPOINTED</span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'var(--steel-grey)' }}>OPTIONAL</span>
                            )}
                          </div>
                          {asstRef2 ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--stadium-white)' }}>{asstRef2.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--steel-grey)' }}>{asstRef2.badge}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  className="admin-action-btn secondary sm"
                                  onClick={() => handleOpenAppoint(match, 'Assistant Referee 2')}
                                  title="Change Official"
                                >
                                  <RefreshCw size={11} />
                                </button>
                                <button 
                                  className="admin-action-btn sm"
                                  style={{ color: '#ef4444', backgroundColor: 'transparent' }}
                                  onClick={() => handlePromptRemoval(match, asstRef2)}
                                  title="Revoke Appointment"
                                >
                                  <UserX size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="admin-action-btn secondary sm"
                              style={{ width: '100%', marginTop: '4px' }}
                              onClick={() => handleOpenAppoint(match, 'Assistant Referee 2')}
                            >
                              + Appoint Asst Ref 2
                            </button>
                          )}
                        </div>

                        {/* Match Commissioner */}
                        <div style={{ padding: '10px', backgroundColor: '#181b1f', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--steel-grey)', fontWeight: 700 }}>MATCH COMMISSIONER</span>
                            {commissioner ? (
                              <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 800 }}>APPOINTED</span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'var(--steel-grey)' }}>OPTIONAL</span>
                            )}
                          </div>
                          {commissioner ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--stadium-white)' }}>{commissioner.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--steel-grey)' }}>{commissioner.badge}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  className="admin-action-btn secondary sm"
                                  onClick={() => handleOpenAppoint(match, 'Match Commissioner')}
                                  title="Change Official"
                                >
                                  <RefreshCw size={11} />
                                </button>
                                <button 
                                  className="admin-action-btn sm"
                                  style={{ color: '#ef4444', backgroundColor: 'transparent' }}
                                  onClick={() => handlePromptRemoval(match, commissioner)}
                                  title="Revoke Appointment"
                                >
                                  <UserX size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="admin-action-btn secondary sm"
                              style={{ width: '100%', marginTop: '4px' }}
                              onClick={() => handleOpenAppoint(match, 'Match Commissioner')}
                            >
                              + Appoint Commissioner
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MATCHDAY READINESS CHECKLISTS */}
      {activeTab === 'READINESS' && (
        <div className="tab-pane-content" style={{ marginTop: '16px' }}>
          <div className="admin-inline-alert info" style={{ marginBottom: '16px' }}>
            <ShieldCheck size={16} />
            <span>
              Real-time pre-match protocol checklist. Matches become marked as <strong>READY FOR KICKOFF</strong> once key parameters (Venue, Officials, Rosters, Medical, Balls) are verified.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {matches.map(match => {
              const readiness = adminStore.getMatchReadiness(match.id);
              const itemsCount = Object.values(readiness).filter(Boolean).length;
              const totalItems = Object.keys(readiness).length;

              return (
                <div key={match.id} className="admin-card" style={{ padding: '16px 20px', backgroundColor: '#141619' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ color: 'var(--stadium-white)', fontSize: '0.95rem' }}>
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--steel-grey)', marginTop: '2px' }}>
                        {match.round} • {match.date} {match.time} • {match.venue}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: itemsCount === totalItems ? '#22c55e' : 'var(--nova-orange)' 
                      }}>
                        {itemsCount}/{totalItems} Protocols Verified
                      </span>
                      <AdminStatusBadge status={match.status} size="sm" />
                    </div>
                  </div>

                  {/* Checklist grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      backgroundColor: '#181b1f', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={readiness.venueConfirmed}
                        onChange={() => handleToggleReadiness(match.id, 'venueConfirmed', readiness.venueConfirmed)}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--stadium-white)' }}>Pitch & Venue Confirmed</span>
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      backgroundColor: '#181b1f', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={readiness.officialsAppointed}
                        onChange={() => handleToggleReadiness(match.id, 'officialsAppointed', readiness.officialsAppointed)}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--stadium-white)' }}>Officials Appointed</span>
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      backgroundColor: '#181b1f', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={readiness.homeLineupSubmitted}
                        onChange={() => handleToggleReadiness(match.id, 'homeLineupSubmitted', readiness.homeLineupSubmitted)}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--stadium-white)' }}>Home Team Sheet</span>
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      backgroundColor: '#181b1f', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={readiness.awayLineupSubmitted}
                        onChange={() => handleToggleReadiness(match.id, 'awayLineupSubmitted', readiness.awayLineupSubmitted)}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--stadium-white)' }}>Away Team Sheet</span>
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      backgroundColor: '#181b1f', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={readiness.medicalStaffOnSite}
                        onChange={() => handleToggleReadiness(match.id, 'medicalStaffOnSite', readiness.medicalStaffOnSite)}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--stadium-white)' }}>First Aid / Medical</span>
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      backgroundColor: '#181b1f', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={readiness.matchBallApproved}
                        onChange={() => handleToggleReadiness(match.id, 'matchBallApproved', readiness.matchBallApproved)}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--stadium-white)' }}>Certified Match Ball</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPOINT OFFICIAL MODAL */}
      {targetMatch && (
        <div className="admin-modal-overlay" onClick={() => setTargetMatch(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Appoint Match Official</h3>
                <span className="modal-subtitle">
                  {targetMatch.homeTeam.name} vs {targetMatch.awayTeam.name} ({targetMatch.date} • {targetMatch.time})
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setTargetMatch(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAppointment}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Officiating Role *</label>
                  <select 
                    className="admin-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                  >
                    <option value="Center Referee">Center Referee (Lead)</option>
                    <option value="Assistant Referee 1">Assistant Referee 1 (Touchline A)</option>
                    <option value="Assistant Referee 2">Assistant Referee 2 (Touchline B)</option>
                    <option value="Fourth Official">Fourth Official (Technical Area)</option>
                    <option value="Match Commissioner">Match Commissioner (NSFC Delegate)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Accredited Official *</label>
                  <select 
                    className="admin-select"
                    value={selectedOfficialId}
                    onChange={(e) => handleOfficialChange(e.target.value)}
                    required
                  >
                    {eligibleMatchOfficials.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.badge || o.role}) - Status: {o.status}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.72rem', color: 'var(--steel-grey)', marginTop: '4px', display: 'block' }}>
                    Reuses existing approved person records from the Official Directory.
                  </span>
                </div>

                {/* Scheduling Conflict Analysis */}
                <div style={{ marginTop: '12px' }}>
                  {conflictWarning ? (
                    <div className="admin-inline-alert warning" style={{ padding: '10px 12px' }}>
                      <AlertTriangle size={16} />
                      <div>
                        <strong>Scheduling Conflict Detected:</strong>
                        <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>{conflictWarning}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-inline-alert success" style={{ padding: '10px 12px' }}>
                      <CheckCircle2 size={16} />
                      <div>
                        <strong>Availability Verified:</strong>
                        <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                          No fixture overlaps found on {targetMatch.date} at {targetMatch.time}.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--steel-grey)', marginTop: '8px', lineHeight: 1.4 }}>
                  ℹ️ Note: NovaSport verifies conflicts against confirmed fixture dates and times. Please confirm with the official before appointing.
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-action-btn secondary"
                  onClick={() => setTargetMatch(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-action-btn primary"
                  disabled={!!conflictWarning}
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOKE / REMOVAL CONFIRMATION MODAL */}
      {removalTarget && (
        <div className="admin-modal-overlay" onClick={() => setRemovalTarget(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Revoke Match Appointment</h3>
                <span className="modal-subtitle">Confirmation required for consequential change</span>
              </div>
              <button className="modal-close-btn" onClick={() => setRemovalTarget(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--stadium-white)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to remove <strong>{removalTarget.officialName}</strong> as <strong>{removalTarget.role}</strong> for:
              </p>
              <div style={{ 
                margin: '12px 0', 
                padding: '10px 14px', 
                backgroundColor: '#1a1d21', 
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid #ef4444' 
              }}>
                <strong style={{ color: 'var(--stadium-white)', fontSize: '0.9rem' }}>{removalTarget.matchTitle}</strong>
              </div>
              <p style={{ color: 'var(--steel-grey)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                This action will mark the fixture as unassigned for this role, downgrade matchday readiness, and log this change in the official audit record.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="admin-action-btn secondary"
                onClick={() => setRemovalTarget(null)}
              >
                Keep Appointment
              </button>
              <button 
                type="button" 
                className="admin-action-btn"
                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none' }}
                onClick={handleExecuteRemoval}
              >
                Yes, Revoke Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
