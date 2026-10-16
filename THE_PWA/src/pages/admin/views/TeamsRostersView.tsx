import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Check, 
  X, 
  ShieldCheck,
  UserPlus,
  MapPin, 
  Search, 
  Edit2, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Info
} from 'lucide-react';
import { 
  adminStore, 
  type AdminTeamRecord, 
  type AdminPlayerRecord 
} from '../../../services/adminStore';
import { matchStore } from '../../../services/matchStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface TeamsRostersViewProps {
  onNavigate?: (section: string, subId?: string) => void;
  onOpenRegisterTeamModal: () => void;
}

export const TeamsRostersView: React.FC<TeamsRostersViewProps> = ({
  onOpenRegisterTeamModal
}) => {
  const teams = adminStore.getTeams();
  const players = adminStore.getPlayers();
  const seasons = adminStore.getSeasons();
  const allMatches = matchStore.getAllMatches();

  const [activeTab, setActiveTab] = useState<'TEAMS' | 'PENDING_PLAYERS' | 'TEAM_APPROVALS' | 'ROSTER'>('TEAMS');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 't1');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Team Detail Modal state
  const [selectedTeamDetails, setSelectedTeamDetails] = useState<AdminTeamRecord | null>(null);
  const [teamDetailTab, setTeamDetailTab] = useState<'OVERVIEW' | 'ROSTER' | 'PENDING' | 'FIXTURES'>('OVERVIEW');
  const [selectedSeasonToEnroll, setSelectedSeasonToEnroll] = useState<string>('');

  // Edit Team Info Modal state
  const [editingTeamInfo, setEditingTeamInfo] = useState<AdminTeamRecord | null>(null);
  const [editTeamForm, setEditTeamForm] = useState({
    name: '',
    shortName: '',
    city: '',
    stadium: '',
    division: '',
    logo: ''
  });

  // Direct Coach Assignment State
  const [editingCoachTeam, setEditingCoachTeam] = useState<AdminTeamRecord | null>(null);
  const [coachForm, setCoachForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Quick player addition
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newPlayerForm, setNewPlayerForm] = useState({
    name: '',
    position: 'MF' as 'GK' | 'DF' | 'MF' | 'FW',
    number: 10,
    nationalId: '',
    studentId: '',
    age: 21
  });

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackNotice({ message, type });
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const teamSquad = players.filter(p => p.teamId === selectedTeamId);

  // Pending player approvals (invited by coaches)
  const pendingPlayers = players.filter(p => p.eligibility === 'PENDING_REGISTRATION');

  // Pending team registrations awaiting admin review
  const pendingTeams = teams.filter(t => t.status === 'PENDING_APPROVAL' || t.status === 'PENDING_DOCUMENTATION');

  // Handlers
  const handleApproveTeam = (teamId: string, teamName: string) => {
    adminStore.approveTeam(teamId);
    showNotice(`Approved '${teamName}'. Team is now active and can be enrolled in leagues.`);
  };

  const handleRejectTeam = (teamId: string, teamName: string) => {
    const reason = prompt(`Enter reason for rejecting '${teamName}':`, 'Incomplete registration requirements');
    if (reason !== null) {
      adminStore.rejectTeam(teamId, reason);
      showNotice(`Rejected registration for '${teamName}'.`, 'error');
    }
  };

  const handleApprovePlayer = (player: AdminPlayerRecord) => {
    adminStore.approvePlayer(player.id);
    showNotice(`Approved ${player.name} into ${teams.find(t => t.id === player.teamId)?.name} official roster.`);
  };

  const handleRejectPlayer = (player: AdminPlayerRecord) => {
    const reason = prompt(`Enter reason for rejecting ${player.name}:`, 'Player ineligible or missing student sports clearance');
    if (reason !== null) {
      adminStore.rejectPlayer(player.id, reason);
      showNotice(`Rejected invitation for ${player.name}.`, 'error');
    }
  };

  const handleSaveCoachAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoachTeam) return;

    adminStore.assignTeamCoach(editingCoachTeam.id, {
      name: coachForm.name.trim(),
      email: coachForm.email.trim(),
      phone: coachForm.phone.trim()
    });

    setEditingCoachTeam(null);
    showNotice(`Assigned ${coachForm.name} as Head Coach for ${editingCoachTeam.name}.`);
  };

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerForm.name.trim() || !selectedTeam) return;

    adminStore.registerPlayer({
      name: newPlayerForm.name.trim(),
      teamId: selectedTeam.id,
      position: newPlayerForm.position,
      number: Number(newPlayerForm.number),
      age: Number(newPlayerForm.age),
      nationalId: newPlayerForm.nationalId || `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
      studentId: newPlayerForm.studentId || `ST-KEMU-${Math.floor(100 + Math.random() * 900)}`,
      eligibility: 'ELIGIBLE',
      statusNotes: 'Directly registered and verified by League Administrator.',
      joinedDate: new Date().toISOString().split('T')[0]
    });

    setShowAddPlayerModal(false);
    setNewPlayerForm({
      name: '',
      position: 'MF',
      number: 10,
      nationalId: '',
      studentId: '',
      age: 21
    });
    showNotice(`Athlete added to ${selectedTeam.name} roster.`);
  };

  const handleOpenTeamDetails = (team: AdminTeamRecord) => {
    setSelectedTeamDetails(team);
    setTeamDetailTab('OVERVIEW');
    setSelectedSeasonToEnroll('');
  };

  const handleOpenEditTeam = (team: AdminTeamRecord) => {
    setEditingTeamInfo(team);
    setEditTeamForm({
      name: team.name,
      shortName: team.shortName,
      city: team.city,
      stadium: team.stadium,
      division: team.division,
      logo: team.logo
    });
  };

  const handleSaveEditTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamInfo) return;

    adminStore.updateTeamInfo(editingTeamInfo.id, {
      name: editTeamForm.name.trim(),
      shortName: editTeamForm.shortName.trim(),
      city: editTeamForm.city.trim(),
      stadium: editTeamForm.stadium.trim(),
      division: editTeamForm.division.trim(),
      logo: editTeamForm.logo.trim()
    });

    if (selectedTeamDetails && selectedTeamDetails.id === editingTeamInfo.id) {
      const updated = adminStore.getTeamById(editingTeamInfo.id);
      if (updated) setSelectedTeamDetails({ ...updated });
    }

    setEditingTeamInfo(null);
    showNotice(`Updated club information for '${editTeamForm.name}'.`);
  };

  const handleEnrollTeamInSeason = (teamId: string, seasonId: string) => {
    if (!seasonId) return;
    try {
      adminStore.addTeamToSeason(seasonId, teamId);
      const updated = adminStore.getTeamById(teamId);
      if (updated) setSelectedTeamDetails({ ...updated });
      showNotice('Club successfully enrolled in season.');
      setSelectedSeasonToEnroll('');
    } catch (err: any) {
      showNotice(err.message || 'Failed to enroll club in season.', 'error');
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-module-container">
      {/* Top Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <Users size={14} className="eyebrow-icon" />
            <span>CENTRAL TEAM & SQUAD MANAGEMENT</span>
          </div>
          <h1 className="module-title">Teams & Official Rosters</h1>
          <p className="module-subtitle">
            Reusable central club directory, coach appointments, and player invitation approvals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="admin-action-btn primary"
            onClick={onOpenRegisterTeamModal}
          >
            <Plus size={14} /> Register New Club
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className={`admin-inline-alert ${feedbackNotice.type === 'error' ? 'error' : 'success'}`}>
          {feedbackNotice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{feedbackNotice.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs-nav" style={{ marginBottom: '20px' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'TEAMS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TEAMS')}
        >
          <Users size={15} /> Central Team Registry ({teams.length})
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'PENDING_PLAYERS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING_PLAYERS')}
          style={{ position: 'relative' }}
        >
          <UserCheck size={15} /> Pending Player Approvals
          {pendingPlayers.length > 0 && (
            <span style={{ 
              background: 'var(--nova-orange)', 
              color: '#000', 
              padding: '1px 6px', 
              borderRadius: '10px', 
              fontSize: '0.7rem', 
              fontWeight: 800,
              marginLeft: '6px'
            }}>
              {pendingPlayers.length}
            </span>
          )}
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'TEAM_APPROVALS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TEAM_APPROVALS')}
        >
          <ShieldCheck size={15} /> Team Submissions
          {pendingTeams.length > 0 && (
            <span style={{ 
              background: '#f59e0b', 
              color: '#000', 
              padding: '1px 6px', 
              borderRadius: '10px', 
              fontSize: '0.7rem', 
              fontWeight: 800,
              marginLeft: '6px'
            }}>
              {pendingTeams.length}
            </span>
          )}
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'ROSTER' ? 'active' : ''}`}
          onClick={() => setActiveTab('ROSTER')}
        >
          <UserPlus size={15} /> Squad Rosters ({selectedTeam?.name})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CENTRAL TEAM REGISTRY
          ========================================================================= */}
      {activeTab === 'TEAMS' && (
        <div>
          {/* Search bar */}
          <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="admin-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search clubs by name, code, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {filteredTeams.map((team) => {
              const enrolledSeasons = seasons.filter(s => team.participatingSeasonIds?.includes(s.id));
              const teamPlayerCount = players.filter(p => p.teamId === team.id).length;

              return (
                <div 
                  key={team.id}
                  className="admin-card"
                  style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => handleOpenTeamDetails(team)}
                    title="Click to view full team profile and roster"
                  >
                    <span style={{ fontSize: '2rem' }}>{team.logo}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{team.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--nova-orange)', fontWeight: 700 }}>
                        [{team.shortName}] • {team.division}
                      </span>
                    </div>
                    <AdminStatusBadge status={team.status} size="sm" />
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <span>{team.stadium}, {team.city}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span><strong>Head Coach:</strong> {team.headCoachName}</span>
                      <button 
                        className="admin-action-btn secondary sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                        onClick={() => {
                          setEditingCoachTeam(team);
                          setCoachForm({
                            name: team.headCoachName || '',
                            email: team.headCoachEmail || '',
                            phone: team.headCoachPhone || ''
                          });
                        }}
                      >
                        <Edit2 size={11} /> Edit Coach
                      </button>
                    </div>
                    <span style={{ fontSize: '0.74rem' }}>{team.headCoachPhone} • {team.headCoachEmail}</span>
                  </div>

                  {/* Competitions participated in */}
                  <div style={{ 
                    borderTop: '1px solid var(--border-subtle)', 
                    paddingTop: '8px', 
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Active Tournaments ({enrolledSeasons.length}):</strong>
                    </div>
                    {enrolledSeasons.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {enrolledSeasons.map(s => (
                          <span 
                            key={s.id} 
                            style={{ 
                              background: 'var(--pitch-black)', 
                              border: '1px solid var(--border-subtle)', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.7rem' 
                            }}
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Not enrolled in any competition yet
                      </span>
                    )}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: 'auto', 
                    borderTop: '1px solid var(--border-subtle)', 
                    paddingTop: '10px' 
                  }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong>{teamPlayerCount}</strong> Athletes
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="admin-action-btn primary sm"
                        onClick={() => handleOpenTeamDetails(team)}
                      >
                        Team Details
                      </button>
                      <button 
                        className="admin-action-btn secondary sm"
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setActiveTab('ROSTER');
                        }}
                      >
                        Squad
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PENDING PLAYER APPROVALS (COACHES INVITE, ADMIN APPROVES)
          ========================================================================= */}
      {activeTab === 'PENDING_PLAYERS' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Coach Player Invitations • Clearance Queue
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Coaches invite prospective players to their squad. Administrators review eligibility before players enter the official matchday roster.
            </p>
          </div>

          {pendingPlayers.length === 0 ? (
            <div className="admin-empty-centre" style={{ minHeight: '260px' }}>
              <div className="empty-centre-card">
                <UserCheck size={36} className="empty-icon" />
                <h3>No Pending Player Invitations</h3>
                <p>All invited athletes have been processed and cleared for official competition.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingPlayers.map((player) => {
                const team = teams.find(t => t.id === player.teamId);

                return (
                  <div 
                    key={player.id}
                    className="admin-card"
                    style={{ 
                      padding: '16px 20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* Athlete Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        background: 'rgba(255, 106, 0, 0.12)', 
                        border: '1px solid rgba(255, 106, 0, 0.3)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--nova-orange)',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}>
                        {player.position}
                      </div>

                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                          {player.name}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Squad #{player.number} • Age {player.age} • {player.studentId || player.nationalId}
                        </span>
                      </div>
                    </div>

                    {/* Inviting Club & Coach notes */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        Club: <span style={{ color: 'var(--nova-orange)' }}>{team?.name || player.teamId}</span>
                      </div>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {player.statusNotes || 'Invited by head coach. Awaiting official league endorsement.'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <AdminStatusBadge status={player.eligibility} size="sm" />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="admin-action-btn primary sm"
                        onClick={() => handleApprovePlayer(player)}
                      >
                        <Check size={13} /> Approve to Roster
                      </button>
                      <button 
                        className="admin-action-btn secondary sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleRejectPlayer(player)}
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: TEAM REGISTRATION SUBMISSIONS
          ========================================================================= */}
      {activeTab === 'TEAM_APPROVALS' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Team Registration Submissions
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Local league registration submissions. Verify club identity, home ground, and head coach before approving.
            </p>
          </div>

          {pendingTeams.length === 0 ? (
            <div className="admin-empty-centre" style={{ minHeight: '260px' }}>
              <div className="empty-centre-card">
                <ShieldCheck size={36} className="empty-icon" />
                <h3>No Pending Club Applications</h3>
                <p>All registered clubs have been reviewed by the NSFC administration.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingTeams.map((team) => (
                <div 
                  key={team.id}
                  className="admin-card"
                  style={{ 
                    padding: '18px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
                    <span style={{ fontSize: '2rem' }}>{team.logo}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{team.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        [{team.shortName}] • {team.division} • {team.city}
                      </span>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: '200px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div><strong>Home Ground:</strong> {team.stadium}</div>
                    <div><strong>Appointed Coach:</strong> {team.headCoachName} ({team.headCoachPhone})</div>
                    <div><strong>Registered Date:</strong> {team.registeredDate}</div>
                  </div>

                  <div>
                    <AdminStatusBadge status={team.status} size="sm" />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="admin-action-btn primary sm"
                      onClick={() => handleApproveTeam(team.id, team.name)}
                    >
                      <Check size={13} /> Approve Club
                    </button>
                    <button 
                      className="admin-action-btn secondary sm"
                      style={{ color: '#ef4444' }}
                      onClick={() => handleRejectTeam(team.id, team.name)}
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: SQUAD ROSTER VIEWER
          ========================================================================= */}
      {activeTab === 'ROSTER' && (
        <div>
          {/* Club selector & quick add */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px',
            marginBottom: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select Club:</span>
              <select 
                className="admin-select"
                style={{ width: 'auto', background: 'var(--pitch-black)' }}
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name} [{t.shortName}]</option>
                ))}
              </select>
            </div>

            <button 
              className="admin-action-btn primary"
              onClick={() => setShowAddPlayerModal(true)}
            >
              <Plus size={14} /> Add Athlete to Roster
            </button>
          </div>

          {/* Player roster table */}
          <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px 14px' }}>NO</th>
                  <th style={{ padding: '12px 14px' }}>NAME</th>
                  <th style={{ padding: '12px 10px' }}>POS</th>
                  <th style={{ padding: '12px 10px' }}>AGE</th>
                  <th style={{ padding: '12px 14px' }}>STUDENT / NATIONAL ID</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>APP</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>GOALS</th>
                  <th style={{ padding: '12px 14px' }}>ELIGIBILITY</th>
                </tr>
              </thead>
              <tbody>
                {teamSquad.map((player) => (
                  <tr key={player.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--nova-orange)' }}>
                      #{player.number}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                      {player.name}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ 
                        background: 'var(--pitch-black)', 
                        border: '1px solid var(--border-subtle)', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {player.position}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{player.age}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {player.studentId || player.nationalId}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{player.appearances}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700 }}>{player.goals}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <AdminStatusBadge status={player.eligibility} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. Direct Coach Appointment Modal */}
      {editingCoachTeam && (
        <div className="admin-modal-overlay" onClick={() => setEditingCoachTeam(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Appoint Head Coach</h3>
                <span className="modal-subtitle">{editingCoachTeam.name}</span>
              </div>
            </div>

            <form onSubmit={handleSaveCoachAssignment}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Head Coach Full Name *</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={coachForm.name}
                    onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={coachForm.phone}
                      onChange={(e) => setCoachForm({ ...coachForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email"
                      className="admin-input"
                      value={coachForm.email}
                      onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setEditingCoachTeam(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save Coach Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Direct Athlete Add Modal */}
      {showAddPlayerModal && selectedTeam && (
        <div className="admin-modal-overlay" onClick={() => setShowAddPlayerModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Add Athlete to Official Roster</h3>
                <span className="modal-subtitle">{selectedTeam.name}</span>
              </div>
            </div>

            <form onSubmit={handleAddPlayerSubmit}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Player Name *</label>
                  <input 
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Samuel Karanja"
                    value={newPlayerForm.name}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Playing Position</label>
                    <select 
                      className="admin-select"
                      value={newPlayerForm.position}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, position: e.target.value as any })}
                    >
                      <option value="GK">Goalkeeper (GK)</option>
                      <option value="DF">Defender (DF)</option>
                      <option value="MF">Midfielder (MF)</option>
                      <option value="FW">Forward (FW)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jersey Number</label>
                    <input 
                      type="number"
                      className="admin-input"
                      min={1}
                      max={99}
                      value={newPlayerForm.number}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, number: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Student ID</label>
                    <input 
                      type="text"
                      className="admin-input"
                      placeholder="e.g. ST-KEMU-2024-001"
                      value={newPlayerForm.studentId}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, studentId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input 
                      type="number"
                      className="admin-input"
                      min={16}
                      max={45}
                      value={newPlayerForm.age}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, age: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowAddPlayerModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save Athlete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Team Details Modal */}
      {selectedTeamDetails && (
        <div className="admin-modal-overlay" onClick={() => setSelectedTeamDetails(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2.2rem' }}>{selectedTeamDetails.logo}</span>
                <div className="modal-title-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0 }}>{selectedTeamDetails.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--nova-orange)', fontWeight: 800 }}>[{selectedTeamDetails.shortName}]</span>
                    <AdminStatusBadge status={selectedTeamDetails.status} size="sm" />
                  </div>
                  <span className="modal-subtitle">
                    {selectedTeamDetails.city} • {selectedTeamDetails.division} • Home Pitch: {selectedTeamDetails.stadium}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="admin-action-btn secondary sm"
                  onClick={() => handleOpenEditTeam(selectedTeamDetails)}
                >
                  <Edit2 size={12} /> Edit Club Info
                </button>
                <button className="modal-close-btn" onClick={() => setSelectedTeamDetails(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Inner Sub-Tabs */}
            <div className="admin-tabs-nav" style={{ padding: '0 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <button 
                className={`admin-tab-btn ${teamDetailTab === 'OVERVIEW' ? 'active' : ''}`}
                onClick={() => setTeamDetailTab('OVERVIEW')}
              >
                <Info size={14} /> Club Overview
              </button>
              <button 
                className={`admin-tab-btn ${teamDetailTab === 'ROSTER' ? 'active' : ''}`}
                onClick={() => setTeamDetailTab('ROSTER')}
              >
                <Users size={14} /> Official Squad ({players.filter(p => p.teamId === selectedTeamDetails.id).length})
              </button>
              <button 
                className={`admin-tab-btn ${teamDetailTab === 'PENDING' ? 'active' : ''}`}
                onClick={() => setTeamDetailTab('PENDING')}
              >
                <UserCheck size={14} /> Pending Invitations ({players.filter(p => p.teamId === selectedTeamDetails.id && p.eligibility === 'PENDING_REGISTRATION').length})
              </button>
              <button 
                className={`admin-tab-btn ${teamDetailTab === 'FIXTURES' ? 'active' : ''}`}
                onClick={() => setTeamDetailTab('FIXTURES')}
              >
                <Calendar size={14} /> Fixtures & Results
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '16px 20px' }}>
              {/* SUBTAB 1: OVERVIEW */}
              {teamDetailTab === 'OVERVIEW' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Basic Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ padding: '12px', background: '#16191c', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--steel-grey)', fontWeight: 700 }}>HOME GROUND</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--stadium-white)', marginTop: '2px' }}>{selectedTeamDetails.stadium}</div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--steel-grey)' }}>{selectedTeamDetails.city}, Kenya</span>
                    </div>

                    <div style={{ padding: '12px', background: '#16191c', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--steel-grey)', fontWeight: 700 }}>AFFILIATION STATUS</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#22c55e', marginTop: '2px' }}>NSFC Approved Member</div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--steel-grey)' }}>Registered: {selectedTeamDetails.registeredDate}</span>
                    </div>

                    <div style={{ padding: '12px', background: '#16191c', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--steel-grey)', fontWeight: 700 }}>GOVERNING DIVISION</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--nova-orange)', marginTop: '2px' }}>{selectedTeamDetails.division}</div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--steel-grey)' }}>Permanent Identity Record</span>
                    </div>
                  </div>

                  {/* Assigned Coach Section */}
                  <div style={{ padding: '14px', background: '#181b1f', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--steel-grey)', letterSpacing: '0.5px' }}>
                        HEAD COACH & TECHNICAL BENCH
                      </span>
                      <button 
                        className="admin-action-btn secondary sm"
                        onClick={() => {
                          setEditingCoachTeam(selectedTeamDetails);
                          setCoachForm({
                            name: selectedTeamDetails.headCoachName || '',
                            email: selectedTeamDetails.headCoachEmail || '',
                            phone: selectedTeamDetails.headCoachPhone || ''
                          });
                        }}
                      >
                        <Edit2 size={11} /> Reassign / Replace Coach
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        background: 'rgba(255, 106, 0, 0.1)', 
                        border: '1px solid var(--nova-orange)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--nova-orange)',
                        fontWeight: 800
                      }}>
                        👔
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--stadium-white)' }}>
                          {selectedTeamDetails.headCoachName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--steel-grey)' }}>
                          {selectedTeamDetails.headCoachPhone} • {selectedTeamDetails.headCoachEmail}
                        </div>
                      </div>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--steel-grey)', marginTop: '8px' }}>
                      ℹ️ Coach identity is connected directly to NSFC Official Directory. Coaches can invite and nominate players.
                    </span>
                  </div>

                  {/* Season Participation Section */}
                  <div style={{ padding: '14px', background: '#181b1f', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--steel-grey)', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      SEASON PARTICIPATION (REUSABLE TEAM RECORD)
                    </span>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {seasons.filter(s => selectedTeamDetails.participatingSeasonIds?.includes(s.id)).map(s => (
                        <span key={s.id} style={{ padding: '4px 8px', background: '#131518', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--stadium-white)' }}>
                          🏆 {s.name} ({s.year})
                        </span>
                      ))}
                      {(!selectedTeamDetails.participatingSeasonIds || selectedTeamDetails.participatingSeasonIds.length === 0) && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--steel-grey)' }}>Not currently enrolled in any tournament.</span>
                      )}
                    </div>

                    {/* Enroll in another season selector */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select 
                        className="admin-select"
                        style={{ maxWidth: '280px', fontSize: '0.78rem' }}
                        value={selectedSeasonToEnroll}
                        onChange={(e) => setSelectedSeasonToEnroll(e.target.value)}
                      >
                        <option value="">-- Enroll in a Competition Season --</option>
                        {seasons
                          .filter(s => !selectedTeamDetails.participatingSeasonIds?.includes(s.id))
                          .map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
                          ))}
                      </select>
                      <button 
                        className="admin-action-btn primary sm"
                        disabled={!selectedSeasonToEnroll}
                        onClick={() => handleEnrollTeamInSeason(selectedTeamDetails.id, selectedSeasonToEnroll)}
                      >
                        Enroll Club
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: ROSTER */}
              {teamDetailTab === 'ROSTER' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--steel-grey)' }}>
                      Active approved athletes cleared for match selection.
                    </span>
                    <button 
                      className="admin-action-btn primary sm"
                      onClick={() => {
                        setSelectedTeamId(selectedTeamDetails.id);
                        setShowAddPlayerModal(true);
                      }}
                    >
                      <Plus size={13} /> Add Athlete
                    </button>
                  </div>

                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#16191c', borderBottom: '1px solid var(--border-subtle)', color: 'var(--steel-grey)', fontSize: '0.72rem' }}>
                          <th style={{ padding: '8px 10px' }}>NO</th>
                          <th style={{ padding: '8px 12px' }}>ATHLETE NAME</th>
                          <th style={{ padding: '8px 8px' }}>POS</th>
                          <th style={{ padding: '8px 8px' }}>AGE</th>
                          <th style={{ padding: '8px 12px' }}>ID</th>
                          <th style={{ padding: '8px 8px', textAlign: 'center' }}>APP</th>
                          <th style={{ padding: '8px 8px', textAlign: 'center' }}>GOALS</th>
                          <th style={{ padding: '8px 10px' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.filter(p => p.teamId === selectedTeamDetails.id).map(player => (
                          <tr key={player.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 800, color: 'var(--nova-orange)' }}>#{player.number}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--stadium-white)' }}>{player.name}</td>
                            <td style={{ padding: '8px 8px' }}>
                              <span style={{ padding: '2px 5px', background: '#111', border: '1px solid var(--border-subtle)', borderRadius: '3px', fontSize: '0.7rem' }}>
                                {player.position}
                              </span>
                            </td>
                            <td style={{ padding: '8px 8px', color: 'var(--steel-grey)' }}>{player.age}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--steel-grey)', fontSize: '0.75rem' }}>{player.studentId || player.nationalId}</td>
                            <td style={{ padding: '8px 8px', textAlign: 'center' }}>{player.appearances}</td>
                            <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 700 }}>{player.goals}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <AdminStatusBadge status={player.eligibility} size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: PENDING PLAYER INVITATIONS */}
              {teamDetailTab === 'PENDING' && (
                <div>
                  {players.filter(p => p.teamId === selectedTeamDetails.id && p.eligibility === 'PENDING_REGISTRATION').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--steel-grey)' }}>
                      <CheckCircle size={32} style={{ margin: '0 auto 8px', color: '#22c55e' }} />
                      <div style={{ color: 'var(--stadium-white)', fontWeight: 700 }}>No Pending Invitations</div>
                      <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>All coach-invited players for this team are cleared.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {players.filter(p => p.teamId === selectedTeamDetails.id && p.eligibility === 'PENDING_REGISTRATION').map(player => (
                        <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#181b1f', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--stadium-white)', fontSize: '0.92rem' }}>
                              #{player.number} {player.name} ({player.position})
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--steel-grey)', marginTop: '2px' }}>
                              {player.studentId || player.nationalId} • Age {player.age} • Notes: {player.statusNotes}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              className="admin-action-btn primary sm"
                              onClick={() => {
                                handleApprovePlayer(player);
                                const updated = adminStore.getTeamById(selectedTeamDetails.id);
                                if (updated) setSelectedTeamDetails({ ...updated });
                              }}
                            >
                              <Check size={12} /> Approve Roster
                            </button>
                            <button 
                              className="admin-action-btn secondary sm"
                              style={{ color: '#ef4444' }}
                              onClick={() => {
                                handleRejectPlayer(player);
                                const updated = adminStore.getTeamById(selectedTeamDetails.id);
                                if (updated) setSelectedTeamDetails({ ...updated });
                              }}
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 4: FIXTURES & RESULTS */}
              {teamDetailTab === 'FIXTURES' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allMatches
                      .filter(m => m.homeTeam.id === selectedTeamDetails.id || m.awayTeam.id === selectedTeamDetails.id)
                      .map(match => {
                        const isHome = match.homeTeam.id === selectedTeamDetails.id;
                        const opponent = isHome ? match.awayTeam : match.homeTeam;
                        return (
                          <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#16191c', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--stadium-white)' }}>
                                {isHome ? 'vs' : '@'} {opponent.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--steel-grey)', marginTop: '2px' }}>
                                {match.date} at {match.time} • {match.venue}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {['VERIFIED_PUBLISHED', 'FULL_TIME_PENDING_REVIEW'].includes(match.status) ? (
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--nova-orange)' }}>
                                  {match.homeScore} - {match.awayScore}
                                </span>
                              ) : null}
                              <AdminStatusBadge status={match.status} size="sm" />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="admin-action-btn secondary"
                onClick={() => setSelectedTeamDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Team Info Modal */}
      {editingTeamInfo && (
        <div className="admin-modal-overlay" onClick={() => setEditingTeamInfo(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Edit Team Information</h3>
                <span className="modal-subtitle">{editingTeamInfo.name}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingTeamInfo(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeam}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Team / Club Full Name *</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={editTeamForm.name}
                    onChange={(e) => setEditTeamForm({ ...editTeamForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Short Code / Acronym *</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={editTeamForm.shortName}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, shortName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Club Logo Emoji / Icon</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={editTeamForm.logo}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, logo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={editTeamForm.city}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Governing Division</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={editTeamForm.division}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, division: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Home Stadium / Pitch *</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={editTeamForm.stadium}
                    onChange={(e) => setEditTeamForm({ ...editTeamForm, stadium: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-action-btn secondary"
                  onClick={() => setEditingTeamInfo(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save Club Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
