import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ShieldCheck, 
  UserCheck, 
  Mail, 
  MapPin, 
  CheckCircle, 
  Gavel, 
  Search, 
  X
} from 'lucide-react';
import { 
  adminStore, 
  type AdminTeamRecord, 
  type AdminPlayerRecord 
} from '../../../services/adminStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface TeamsPlayersViewProps {
  initialTeamId?: string;
  onNavigate?: (section: string, subId?: string) => void;
  onOpenRegisterTeamModal: () => void;
  onOpenIssueSanctionModal: () => void;
}

export const TeamsPlayersView: React.FC<TeamsPlayersViewProps> = ({
  initialTeamId,
  onOpenRegisterTeamModal,
  onOpenIssueSanctionModal
}) => {
  const teams = adminStore.getTeams();
  const players = adminStore.getPlayers();
  const sanctions = adminStore.getSanctions();

  const [activeTab, setActiveTab] = useState<'CLUBS' | 'SQUADS' | 'ELIGIBILITY' | 'DISCIPLINE'>('CLUBS');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId || teams[0]?.id || 't1');
  const [selectedPlayer, setSelectedPlayer] = useState<AdminPlayerRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState<'ALL' | 'ELIGIBLE' | 'PENDING' | 'SUSPENDED'>('ALL');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Quick player addition state
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState(17);
  const [newPlayerPos, setNewPlayerPos] = useState<'GK' | 'DF' | 'MF' | 'FW'>('MF');
  const [newPlayerNatId, setNewPlayerNatId] = useState('');
  const [newPlayerStudentId, setNewPlayerStudentId] = useState('');

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const teamSquad = players.filter(p => p.teamId === selectedTeamId);

  const handleToggleTeamStatus = (team: AdminTeamRecord) => {
    const nextStatus = team.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    adminStore.updateTeamStatus(team.id, nextStatus, 'NSFC administrative status adjustment');
    setFeedbackNotice(`Updated ${team.name} status to ${nextStatus}.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleUpdatePlayerEligibility = (playerId: string, eligibility: AdminPlayerRecord['eligibility'], notes: string) => {
    adminStore.updatePlayerEligibility(playerId, eligibility, notes);
    setFeedbackNotice(`Player eligibility updated to ${eligibility}.`);
    if (selectedPlayer?.id === playerId) {
      setSelectedPlayer(prev => prev ? { ...prev, eligibility, statusNotes: notes } : null);
    }
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    adminStore.registerPlayer({
      name: newPlayerName.trim(),
      teamId: selectedTeamId,
      position: newPlayerPos,
      number: newPlayerNumber,
      age: 21,
      nationalId: newPlayerNatId || `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
      studentId: newPlayerStudentId || `ST-KEMU-${Math.floor(100 + Math.random() * 900)}`,
      eligibility: 'ELIGIBLE',
      statusNotes: 'Registered and cleared by League Administrator.',
      joinedDate: new Date().toISOString().split('T')[0]
    });

    setShowAddPlayerModal(false);
    setNewPlayerName('');
    setNewPlayerNatId('');
    setNewPlayerStudentId('');
    setFeedbackNotice(`Athlete successfully added to ${selectedTeam.name} roster.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.nationalId.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (eligibilityFilter === 'ALL') return true;
    if (eligibilityFilter === 'ELIGIBLE') return p.eligibility === 'ELIGIBLE';
    if (eligibilityFilter === 'PENDING') return p.eligibility === 'PENDING_REGISTRATION';
    if (eligibilityFilter === 'SUSPENDED') return p.eligibility === 'SUSPENDED' || p.eligibility === 'INELIGIBLE';
    return true;
  });

  return (
    <div className="admin-module-container">
      {/* Top Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <Users size={14} className="eyebrow-icon" />
            <span>PARTICIPATION & ROSTER ADMINISTRATION</span>
          </div>
          <h1 className="module-title">Teams & Players Registry</h1>
          <p className="module-subtitle">
            NSFC club affiliations, squad depth, student athlete eligibility clearance, and disciplinary board oversight.
          </p>
        </div>

        <div className="top-bar-actions">
          <button 
            className="admin-action-btn secondary"
            onClick={onOpenIssueSanctionModal}
          >
            <Gavel size={14} /> Issue Sanction
          </button>
          <button 
            className="admin-action-btn primary"
            onClick={onOpenRegisterTeamModal}
          >
            <Plus size={14} /> Register Club
          </button>
        </div>
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
          className={`inspector-tab ${activeTab === 'CLUBS' ? 'active' : ''}`}
          onClick={() => setActiveTab('CLUBS')}
        >
          <ShieldCheck size={15} /> Participating Clubs ({teams.length})
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'SQUADS' ? 'active' : ''}`}
          onClick={() => setActiveTab('SQUADS')}
        >
          <Users size={15} /> Squad Administration
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'ELIGIBILITY' ? 'active' : ''}`}
          onClick={() => setActiveTab('ELIGIBILITY')}
        >
          <UserCheck size={15} /> Player Eligibility Registry ({players.length})
        </button>
        <button 
          className={`inspector-tab ${activeTab === 'DISCIPLINE' ? 'active' : ''}`}
          onClick={() => setActiveTab('DISCIPLINE')}
        >
          <Gavel size={15} /> Disciplinary Tribunal ({sanctions.filter(s => s.status === 'ACTIVE').length} Active)
        </button>
      </div>

      {/* TAB 1: CLUBS DIRECTORY */}
      {activeTab === 'CLUBS' && (
        <div className="tab-pane-content">
          <div className="clubs-grid-cards">
            {teams.map((t) => (
              <div key={t.id} className="club-card-panel">
                <div className="club-card-header">
                  <div className="club-logo-box">
                    <span className="logo-emoji">{t.logo}</span>
                  </div>
                  <div className="club-title-box">
                    <h3 className="club-name">{t.name}</h3>
                    <span className="club-code">[{t.shortName}] • {t.division}</span>
                  </div>
                  <AdminStatusBadge status={t.status} size="sm" />
                </div>

                <div className="club-card-details">
                  <div className="detail-row">
                    <MapPin size={13} className="detail-icon" />
                    <span>{t.stadium}</span>
                  </div>
                  <div className="detail-row">
                    <Mail size={13} className="detail-icon" />
                    <span>{t.headCoachName} ({t.headCoachEmail})</span>
                  </div>
                </div>

                <div className="club-card-meta">
                  <div className="meta-box">
                    <span className="meta-label">Squad Roster</span>
                    <span className="meta-val">{players.filter(p => p.teamId === t.id).length} Athletes</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">Affiliated Date</span>
                    <span className="meta-val">{t.registeredDate}</span>
                  </div>
                </div>

                <div className="club-card-footer">
                  <button 
                    className="admin-action-btn secondary sm"
                    onClick={() => {
                      setSelectedTeamId(t.id);
                      setActiveTab('SQUADS');
                    }}
                  >
                    Manage Squad ➔
                  </button>
                  <button 
                    className={`admin-action-btn ${t.status === 'ACTIVE' ? 'destructive' : 'secondary'} sm`}
                    onClick={() => handleToggleTeamStatus(t)}
                  >
                    {t.status === 'ACTIVE' ? 'Suspend Club' : 'Restore Club'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SQUAD ADMINISTRATION */}
      {activeTab === 'SQUADS' && (
        <div className="tab-pane-content">
          {/* Team Filter Row */}
          <div className="squad-filter-row">
            <div className="squad-select-group">
              <label className="filter-label">Select Club:</label>
              <select 
                className="admin-select"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.logo} {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div className="squad-action-buttons">
              <button 
                className="admin-action-btn primary sm"
                onClick={() => setShowAddPlayerModal(true)}
              >
                <Plus size={14} /> Add Athlete to Squad
              </button>
            </div>
          </div>

          {/* Squad Roster Table */}
          <div className="squad-table-wrapper">
            <div className="squad-table-header">
              <div className="team-banner">
                <span className="t-logo-large">{selectedTeam.logo}</span>
                <div>
                  <h3 className="t-name-large">{selectedTeam.name} Roster</h3>
                  <span className="t-sub">{teamSquad.length} Registered Players • Home: {selectedTeam.stadium}</span>
                </div>
              </div>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Athlete Name</th>
                  <th>Pos</th>
                  <th>Age</th>
                  <th>National ID</th>
                  <th>Student ID</th>
                  <th>Eligibility</th>
                  <th>Appearances</th>
                  <th>Goals</th>
                  <th>Discipline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {teamSquad.map((p) => (
                  <tr key={p.id}>
                    <td className="jersey-num-cell">#{p.number}</td>
                    <td>
                      <strong>{p.name}</strong>
                      <div className="sub-text">Joined: {p.joinedDate}</div>
                    </td>
                    <td>
                      <span className={`pos-tag pos-${p.position.toLowerCase()}`}>{p.position}</span>
                    </td>
                    <td className="tabular-nums">{p.age}</td>
                    <td><code>{p.nationalId}</code></td>
                    <td><code>{p.studentId || 'N/A'}</code></td>
                    <td>
                      <AdminStatusBadge status={p.eligibility} size="sm" />
                    </td>
                    <td className="tabular-nums">{p.appearances}</td>
                    <td className="tabular-nums font-bold">{p.goals}</td>
                    <td>
                      <span className="cards-display">
                        🟨 {p.yellowCards} 🟥 {p.redCards}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="admin-action-btn secondary xs"
                        onClick={() => setSelectedPlayer(p)}
                      >
                        Inspect Dossier ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLAYER ELIGIBILITY REGISTRY */}
      {activeTab === 'ELIGIBILITY' && (
        <div className="tab-pane-content">
          <div className="eligibility-filter-bar">
            <div className="search-input-box">
              <Search size={15} className="search-icon" />
              <input 
                type="text"
                placeholder="Search athlete by name or National ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-field"
              />
            </div>

            <div className="filter-chips-row">
              <button 
                className={`filter-chip ${eligibilityFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setEligibilityFilter('ALL')}
              >
                All Athletes ({players.length})
              </button>
              <button 
                className={`filter-chip ${eligibilityFilter === 'ELIGIBLE' ? 'active' : ''}`}
                onClick={() => setEligibilityFilter('ELIGIBLE')}
              >
                Eligible ({players.filter(p => p.eligibility === 'ELIGIBLE').length})
              </button>
              <button 
                className={`filter-chip ${eligibilityFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setEligibilityFilter('PENDING')}
              >
                Pending Verification ({players.filter(p => p.eligibility === 'PENDING_REGISTRATION').length})
              </button>
              <button 
                className={`filter-chip ${eligibilityFilter === 'SUSPENDED' ? 'active' : ''}`}
                onClick={() => setEligibilityFilter('SUSPENDED')}
              >
                Suspended / Ineligible ({players.filter(p => p.eligibility === 'SUSPENDED' || p.eligibility === 'INELIGIBLE').length})
              </button>
            </div>
          </div>

          <div className="eligibility-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Club</th>
                  <th>National & Student ID</th>
                  <th>Eligibility State</th>
                  <th>Clearance Notes</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p) => {
                  const playerTeam = teams.find(t => t.id === p.teamId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <div className="sub-text">#{p.number} • {p.position}</div>
                      </td>
                      <td>
                        <span>{playerTeam?.logo} {playerTeam?.name}</span>
                      </td>
                      <td>
                        <div>Nat: <code>{p.nationalId}</code></div>
                        <div className="sub-text">Stu: <code>{p.studentId || 'None'}</code></div>
                      </td>
                      <td>
                        <AdminStatusBadge status={p.eligibility} size="sm" />
                      </td>
                      <td className="notes-cell">
                        {p.statusNotes || 'Standard clearance on file.'}
                      </td>
                      <td>
                        <div className="action-button-pair">
                          {p.eligibility !== 'ELIGIBLE' ? (
                            <button 
                              className="admin-action-btn primary xs"
                              onClick={() => handleUpdatePlayerEligibility(p.id, 'ELIGIBLE', 'Cleared by NSFC secretariat.')}
                            >
                              Approve
                            </button>
                          ) : (
                            <button 
                              className="admin-action-btn destructive xs"
                              onClick={() => handleUpdatePlayerEligibility(p.id, 'SUSPENDED', 'Suspended pending investigation.')}
                            >
                              Suspend
                            </button>
                          )}
                          <button 
                            className="admin-action-btn secondary xs"
                            onClick={() => setSelectedPlayer(p)}
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DISCIPLINARY TRIBUNAL */}
      {activeTab === 'DISCIPLINE' && (
        <div className="tab-pane-content">
          <div className="content-action-header">
            <div>
              <h3 className="content-title">Disciplinary Sanctions & Sanctions Register</h3>
              <span className="content-sub">Official NSFC rulings, player bans, club fines, and standings point deductions.</span>
            </div>
            <button 
              className="admin-action-btn primary sm"
              onClick={onOpenIssueSanctionModal}
            >
              <Gavel size={14} /> Issue Sanction
            </button>
          </div>

          <div className="sanctions-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sanction ID</th>
                  <th>Target & Type</th>
                  <th>Violation</th>
                  <th>Penalty Imposed</th>
                  <th>Context / Match</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sanctions.map((s) => (
                  <tr key={s.id}>
                    <td><code>{s.id}</code></td>
                    <td>
                      <strong>{s.targetName}</strong>
                      <div className="sub-text">{s.targetType} • {s.teamName || 'Affiliated'}</div>
                    </td>
                    <td className="violation-cell">{s.violation}</td>
                    <td>
                      <span className="penalty-chip">{s.penalty || s.sanctionType}</span>
                    </td>
                    <td>{s.matchOrContext || 'Season Regulation'}</td>
                    <td>
                      <AdminStatusBadge status={s.status} size="sm" />
                    </td>
                    <td>
                      {s.status === 'ACTIVE' && (
                        <button 
                          className="admin-action-btn secondary xs"
                          onClick={() => {
                            adminStore.updateSanctionStatus(s.id, 'SERVED', 'Sanction term completed.');
                            setFeedbackNotice(`Sanction #${s.id} marked as SERVED.`);
                            setTimeout(() => setFeedbackNotice(null), 3000);
                          }}
                        >
                          Mark Served
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Player Inspector Modal Drawer */}
      {selectedPlayer && (
        <div className="admin-modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Athlete Dossier: {selectedPlayer.name}</h3>
                <span className="modal-subtitle">NSFC National Identification & Performance Record</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedPlayer(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="dossier-hero">
                <div className="dossier-avatar">
                  {selectedPlayer.position} #{selectedPlayer.number}
                </div>
                <div>
                  <h2 className="dossier-name">{selectedPlayer.name}</h2>
                  <div className="dossier-meta">
                    <span>Position: <strong>{selectedPlayer.position}</strong></span> • 
                    <span>Age: <strong>{selectedPlayer.age}</strong></span> • 
                    <span>Joined: <strong>{selectedPlayer.joinedDate}</strong></span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <AdminStatusBadge status={selectedPlayer.eligibility} size="md" />
                  </div>
                </div>
              </div>

              <div className="dossier-grid">
                <div className="dossier-box">
                  <span className="dossier-label">National Identity</span>
                  <code>{selectedPlayer.nationalId}</code>
                </div>
                <div className="dossier-box">
                  <span className="dossier-label">Student ID</span>
                  <code>{selectedPlayer.studentId || 'N/A'}</code>
                </div>
                <div className="dossier-box">
                  <span className="dossier-label">Appearances</span>
                  <strong>{selectedPlayer.appearances} Matches</strong>
                </div>
                <div className="dossier-box">
                  <span className="dossier-label">Goals Scored</span>
                  <strong>{selectedPlayer.goals} Goals</strong>
                </div>
                <div className="dossier-box">
                  <span className="dossier-label">Assists</span>
                  <strong>{selectedPlayer.assists} Assists</strong>
                </div>
                <div className="dossier-box">
                  <span className="dossier-label">Disciplinary Cards</span>
                  <strong>🟨 {selectedPlayer.yellowCards} 🟥 {selectedPlayer.redCards}</strong>
                </div>
              </div>

              <div className="dossier-clearance-box">
                <h4>Eligibility Clearance Status:</h4>
                <p>{selectedPlayer.statusNotes || 'Clearance active under official student athlete regulations.'}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="admin-action-btn secondary"
                onClick={() => setSelectedPlayer(null)}
              >
                Close
              </button>
              {selectedPlayer.eligibility === 'ELIGIBLE' ? (
                <button 
                  className="admin-action-btn destructive"
                  onClick={() => {
                    handleUpdatePlayerEligibility(selectedPlayer.id, 'SUSPENDED', 'Suspended by Administrator.');
                  }}
                >
                  Suspend Athlete
                </button>
              ) : (
                <button 
                  className="admin-action-btn primary"
                  onClick={() => {
                    handleUpdatePlayerEligibility(selectedPlayer.id, 'ELIGIBLE', 'Cleared by Administrator.');
                  }}
                >
                  Approve Eligibility
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Athlete Modal */}
      {showAddPlayerModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddPlayerModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Add Athlete to {selectedTeam.name}</h3>
                <span className="modal-subtitle">Official NSFC Student Athlete Registration</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddPlayerModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPlayerSubmit}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Full Legal Name *</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    placeholder="e.g. Dennis Kipchoge"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Jersey Number *</label>
                    <input 
                      type="number" 
                      className="admin-input" 
                      min="1" 
                      max="99"
                      value={newPlayerNumber}
                      onChange={(e) => setNewPlayerNumber(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Position *</label>
                    <select 
                      className="admin-select"
                      value={newPlayerPos}
                      onChange={(e) => setNewPlayerPos(e.target.value as any)}
                    >
                      <option value="GK">Goalkeeper (GK)</option>
                      <option value="DF">Defender (DF)</option>
                      <option value="MF">Midfielder (MF)</option>
                      <option value="FW">Forward (FW)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">National ID Number *</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="ID-33928192"
                      value={newPlayerNatId}
                      onChange={(e) => setNewPlayerNatId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">University Student ID</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="ST-KEMU-2024-912"
                      value={newPlayerStudentId}
                      onChange={(e) => setNewPlayerStudentId(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="admin-action-btn secondary"
                  onClick={() => setShowAddPlayerModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save & Register Athlete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
