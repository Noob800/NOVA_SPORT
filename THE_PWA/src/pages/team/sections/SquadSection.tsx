import { useState } from 'react';
import { 
  Search, LayoutGrid, List, Edit2, Download,
  Save, CheckCircle2, Sliders, Mail, Copy, Check
} from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';
import type { SquadPlayer, AvailabilityStatus, Formation, TacticalDraftPreset } from '../../../services/teamDeskStore';
import { TacticalBoard } from '../components/TacticalBoard';

interface SquadSectionProps {
  squad: SquadPlayer[];
  teamId: string;
  onOpenAddPlayer: () => void;
  onOpenPlayerDetail: (player: SquadPlayer) => void;
  onRequestCorrection: (player: SquadPlayer) => void;
}

export function SquadSection({
  squad,
  teamId,
  onOpenAddPlayer,
  onOpenPlayerDetail,
  onRequestCorrection: _onRequestCorrection
}: SquadSectionProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'tactics' | 'availability' | 'attendance'>('roster');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState<'ALL' | 'GK' | 'DF' | 'MF' | 'FW'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AvailabilityStatus>('ALL');
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // Tactical Presets (3 Presets)
  const [presets, setPresets] = useState<TacticalDraftPreset[]>(() => teamDeskStore.getTacticalPresets(teamId));
  const [activePresetSlot, setActivePresetSlot] = useState<1 | 2 | 3>(1);
  const currentPreset = presets.find(p => p.slotNumber === activePresetSlot) || presets[0];

  const [formation, setFormation] = useState<Formation>(currentPreset.formation);
  const [starters, setStarters] = useState<string[]>(currentPreset.startingEleven);
  const [subs, setSubs] = useState<string[]>(currentPreset.substitutes);
  const [captainId, setCaptainId] = useState<string | undefined>(currentPreset.captainId);
  const [tacticalNotes, setTacticalNotes] = useState<string>(currentPreset.tacticalNotes);
  const [setPieceTakers, setSetPieceTakers] = useState(currentPreset.setPieceTakers);
  const [presetName, setPresetName] = useState(currentPreset.name);
  const [presetSavedNotice, setPresetSavedNotice] = useState(false);

  const switchPresetSlot = (slot: 1 | 2 | 3) => {
    setActivePresetSlot(slot);
    const target = presets.find(p => p.slotNumber === slot) || presets[slot - 1] || presets[0];
    if (target) {
      setFormation(target.formation);
      setStarters(target.startingEleven);
      setSubs(target.substitutes);
      setCaptainId(target.captainId);
      setTacticalNotes(target.tacticalNotes);
      setSetPieceTakers(target.setPieceTakers);
      setPresetName(target.name);
    }
  };

  const handleSavePreset = () => {
    const updated: TacticalDraftPreset = {
      ...currentPreset,
      name: presetName.trim() || `Draft ${activePresetSlot}`,
      formation,
      startingEleven: starters,
      substitutes: subs,
      captainId,
      tacticalNotes,
      setPieceTakers,
      lastUpdated: new Date().toISOString()
    };
    teamDeskStore.saveTacticalPreset(updated);
    setPresets(teamDeskStore.getTacticalPresets(teamId));
    setPresetSavedNotice(true);
    setTimeout(() => setPresetSavedNotice(false), 3000);
  };

  // Filter players
  const filteredSquad = squad.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.number.toString().includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPos = posFilter === 'ALL' || p.position === posFilter;
    const matchesStatus = statusFilter === 'ALL' || p.availability === statusFilter;

    return matchesSearch && matchesPos && matchesStatus;
  });

  const exportRosterCSV = () => {
    const headers = ['Number', 'Name', 'Position', 'Age', 'Availability', 'Eligibility', 'Appearances', 'Goals', 'Assists', 'Training Attendance %'];
    const rows = squad.map(p => [
      p.number,
      `"${p.name}"`,
      p.position,
      p.age,
      p.availability,
      p.eligibility,
      p.appearances,
      p.goals,
      p.assists,
      `${p.trainingAttendance}%`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NovaSport_Squad_Roster_${teamId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="squad-section-container">
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>
            Squad & Roster Management
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {squad.length} registered players • KeMU Super League Roster
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={exportRosterCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--stadium-white)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Download size={15} /> Export Roster
          </button>
          <button
            onClick={onOpenAddPlayer}
            className="login-button"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <Mail size={16} /> Invite Player (Email)
          </button>
        </div>
      </div>

      {/* Sub-tabs: Roster vs Tactics vs Availability vs Attendance */}
      <div className="desk-subtabs" style={{ flexWrap: 'wrap' }}>
        <button
          className={`desk-subtab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Roster Directory ({squad.length})
        </button>
        <button
          className={`desk-subtab-btn ${activeTab === 'tactics' ? 'active' : ''}`}
          onClick={() => setActiveTab('tactics')}
        >
          <Sliders size={15} style={{ display: 'inline', marginRight: '5px' }} />
          Tactics & Lineups (3 Saved Drafts)
        </button>
        <button
          className={`desk-subtab-btn ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          Availability & Status
        </button>
        <button
          className={`desk-subtab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Training Compliance
        </button>
      </div>

      {/* TAB: TACTICS & LINEUPS (3 SAVED DRAFTS) */}
      {activeTab === 'tactics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Preset Selector Banner */}
          <div className="card-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Default Team Tactics & Lineup Presets</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Manage up to 3 presaved squad drafts for quick 1-tap deployment in match fixtures.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {presetSavedNotice && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> Saved!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSavePreset}
                  className="login-button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Save size={16} /> Save Changes to Draft {activePresetSlot}
                </button>
              </div>
            </div>

            {/* 3 Preset Slot Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {([1, 2, 3] as (1 | 2 | 3)[]).map(slot => {
                const p = presets.find(pr => pr.slotNumber === slot) || presets[slot - 1];
                const isActive = activePresetSlot === slot;
                return (
                  <div
                    key={slot}
                    onClick={() => switchPresetSlot(slot)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--pitch-black)' : 'var(--surface-elevated)',
                      border: `2px solid ${isActive ? 'var(--nova-orange)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isActive ? 'var(--nova-orange)' : 'var(--text-muted)' }}>
                        SLOT {slot}
                      </span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255, 94, 0, 0.1)', color: 'var(--nova-orange)', padding: '1px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                        {p ? p.formation : '4-3-3'}
                      </span>
                    </div>
                    <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--stadium-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p ? p.name : `Draft ${slot}`}
                    </strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {p?.startingEleven.length || 11} Starters • {p?.substitutes.length || 0} Subs
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Editable Name for Active Preset */}
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Draft Name:</label>
              <input
                type="text"
                className="form-input"
                style={{ maxWidth: '320px', padding: '6px 12px', fontSize: '0.85rem' }}
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                placeholder={`Draft ${activePresetSlot} Name`}
              />
            </div>
          </div>

          {/* Interactive Tactical Board with Tap-to-Swap */}
          <TacticalBoard
            formation={formation}
            starters={starters}
            subs={subs}
            captainId={captainId}
            tacticalNotes={tacticalNotes}
            setPieceTakers={setPieceTakers}
            squad={squad}
            onChangeFormation={setFormation}
            onChangeStarters={setStarters}
            onChangeSubs={setSubs}
            onChangeCaptain={setCaptainId}
            onChangeTacticalNotes={setTacticalNotes}
            onChangeSetPieceTakers={setSetPieceTakers}
          />
        </div>
      )}

      {/* TAB 1: ROSTER DIRECTORY */}
      {activeTab === 'roster' && (
        <div>
          {/* Filters & Search Toolbar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by player name or #number..."
                className="form-input"
                style={{ paddingLeft: '36px', height: '40px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <select
                value={posFilter}
                onChange={e => setPosFilter(e.target.value as any)}
                className="form-select"
                style={{ height: '40px', padding: '6px 12px', width: 'auto', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DF">Defenders</option>
                <option value="MF">Midfielders</option>
                <option value="FW">Forwards</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="form-select"
                style={{ height: '40px', padding: '6px 12px', width: 'auto', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="FIT">Fit Only</option>
                <option value="INJURED">Injured</option>
                <option value="DOUBTFUL">Doubtful</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <div style={{ display: 'flex', background: 'var(--surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 12px',
                    background: viewMode === 'grid' ? 'rgba(255, 94, 0, 0.2)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--nova-orange)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Grid Cards View"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '8px 12px',
                    background: viewMode === 'table' ? 'rgba(255, 94, 0, 0.2)' : 'transparent',
                    color: viewMode === 'table' ? 'var(--nova-orange)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Compact Table View"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'grid' && (
            <div className="squad-roster-grid">
              {filteredSquad.map(player => (
                <div
                  key={player.id}
                  className="player-desk-card"
                  onClick={() => onOpenPlayerDetail(player)}
                >
                  <div className="player-card-header">
                    <span className={`status-pill ${player.availability.toLowerCase()}`}>
                      {player.availability}
                    </span>
                    {player.invitationStatus === 'INVITATION_SENT' ? (
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                        ✉️ Invite Pending
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: player.eligibility === 'ELIGIBLE' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        {player.eligibility === 'ELIGIBLE' ? '✓ Registered' : '⏳ In Review'}
                      </span>
                    )}
                  </div>

                  <div className="player-card-main">
                    <div className="player-card-num">#{player.number}</div>
                    <div className="player-card-avatar">{player.avatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="player-card-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {player.name}
                      </div>
                      <div className="player-card-pos">
                        {player.position} • {player.age} yrs • ID: {player.id.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {player.invitationStatus === 'INVITATION_SENT' && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (player.inviteCode) {
                          const url = `${window.location.origin}/mynova?invite=${player.inviteCode}`;
                          navigator.clipboard.writeText(url);
                          setCopiedInviteId(player.id);
                          setTimeout(() => setCopiedInviteId(null), 3000);
                        }
                      }}
                      style={{
                        fontSize: '0.72rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px dashed rgba(56, 189, 248, 0.5)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      title="Click to copy invitation link"
                    >
                      <div style={{ color: '#38bdf8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Code: <strong>{player.inviteCode || 'N/A'}</strong>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: copiedInviteId === player.id ? '#10b981' : 'var(--stadium-white)', fontWeight: 700, fontSize: '0.7rem' }}>
                        {copiedInviteId === player.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Link</>}
                      </span>
                    </div>
                  )}

                  {player.statusNotes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--pitch-black)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {player.statusNotes}
                    </div>
                  )}

                  <div className="player-card-stats">
                    <div className="player-stat-col">
                      <span className="label">Apps</span>
                      <span className="val">{player.appearances}</span>
                    </div>
                    <div className="player-stat-col">
                      <span className="label">Goals</span>
                      <span className="val" style={{ color: 'var(--nova-orange)' }}>{player.goals}</span>
                    </div>
                    <div className="player-stat-col">
                      <span className="label">Assists</span>
                      <span className="val">{player.assists}</span>
                    </div>
                    <div className="player-stat-col">
                      <span className="label">Train</span>
                      <span className="val" style={{ color: '#10b981' }}>{player.trainingAttendance}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--nova-orange)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      Edit / Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compact Table View */}
          {viewMode === 'table' && (
            <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
                  <thead style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <tr>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>#</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Player</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pos</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Age</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Availability</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Apps</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Goals</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Train %</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSquad.map(player => (
                      <tr key={player.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--nova-orange)', fontWeight: 700 }}>
                          {player.number}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>{player.avatar}</span>
                            <div>
                              <strong style={{ fontSize: '0.9rem' }}>{player.name}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {player.invitationStatus === 'INVITATION_SENT' ? (
                                  <span style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    ✉️ Invited ({player.inviteCode || 'N/A'})
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (player.inviteCode) {
                                          const url = `${window.location.origin}/mynova?invite=${player.inviteCode}`;
                                          navigator.clipboard.writeText(url);
                                          setCopiedInviteId(player.id);
                                          setTimeout(() => setCopiedInviteId(null), 3000);
                                        }
                                      }}
                                      style={{ background: 'transparent', border: 'none', color: copiedInviteId === player.id ? '#10b981' : '#38bdf8', cursor: 'pointer', padding: '0 2px' }}
                                      title="Copy invitation link"
                                    >
                                      {copiedInviteId === player.id ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </span>
                                ) : (
                                  `ID: ${player.id.toUpperCase()}`
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem' }}>{player.position}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{player.age}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`status-pill ${player.availability.toLowerCase()}`}>
                            {player.availability}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{player.appearances}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--nova-orange)', fontWeight: 700 }}>{player.goals}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>{player.trainingAttendance}%</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => onOpenPlayerDetail(player)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--stadium-white)',
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem'
                            }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AVAILABILITY & MEDICAL STATUS */}
      {activeTab === 'availability' && (
        <div className="card-panel">
          <div className="panel-header" style={{ marginBottom: 'var(--space-4)' }}>
            <div>
              <h3>Medical & Matchday Selection Availability</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Keep tactical readiness and medical statuses synchronized before each matchday.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {squad.map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--pitch-black)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--nova-orange)', fontWeight: 800 }}>
                    #{p.number}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.position} • {p.statusNotes || 'Cleared for matchday duty'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['FIT', 'INJURED', 'DOUBTFUL', 'SUSPENDED'] as AvailabilityStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => teamDeskStore.updatePlayerAvailability(p.id, st)}
                      className={`status-pill ${st.toLowerCase()}`}
                      style={{
                        cursor: 'pointer',
                        opacity: p.availability === st ? 1 : 0.35,
                        border: p.availability === st ? '2px solid currentColor' : '1px solid transparent',
                        padding: '4px 8px'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRAINING ATTENDANCE TRACKER */}
      {activeTab === 'attendance' && (
        <div className="card-panel">
          <div className="panel-header" style={{ marginBottom: 'var(--space-4)' }}>
            <div>
              <h3>Squad Training Attendance Matrix</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Cumulative session compliance calculated across verified sessions.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-subtle)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Player</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pos</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attendance Rate</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visual Compliance</th>
                </tr>
              </thead>
              <tbody>
                {squad.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <strong>#{p.number} {p.name}</strong>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>{p.position}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: p.trainingAttendance >= 90 ? '#10b981' : p.trainingAttendance >= 75 ? '#f59e0b' : '#ef4444' }}>
                      {p.trainingAttendance}%
                    </td>
                    <td style={{ padding: '10px 14px', width: '40%' }}>
                      <div className="stat-bar-container">
                        <div
                          className="stat-bar-fill"
                          style={{
                            width: `${p.trainingAttendance}%`,
                            background: p.trainingAttendance >= 90 ? '#10b981' : p.trainingAttendance >= 75 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
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
}
