import { useState } from 'react';
import { 
  X, Check, Save, Calendar, MapPin, Clock, 
  FileText, Send, Sparkles, Award, ShieldCheck
} from 'lucide-react';
import { teamDeskStore } from '../../../services/teamDeskStore';
import type { 
  TeamFixture, SquadPlayer, Formation, MatchPreparation, 
  TacticalDraftPreset 
} from '../../../services/teamDeskStore';
import { TacticalBoard } from './TacticalBoard';

interface MatchPrepDrawerProps {
  fixture: TeamFixture;
  squad: SquadPlayer[];
  onClose: () => void;
  onRequestReschedule: (fixture: TeamFixture) => void;
  onRequestVenueChange: (fixture: TeamFixture) => void;
}

export function MatchPrepDrawer({
  fixture,
  squad,
  onClose,
  onRequestReschedule,
  onRequestVenueChange
}: MatchPrepDrawerProps) {
  const [activeTab, setActiveTab] = useState<'lineup' | 'operations' | 'requests'>('lineup');

  // Presets available for this team
  const presets = teamDeskStore.getTacticalPresets(fixture.homeTeamId || 't2');

  // Lineup state initialized from existing prep or default
  const prep = fixture.preparation || {
    formation: '4-3-3' as Formation,
    startingEleven: squad.filter(p => p.availability === 'FIT').slice(0, 11).map(p => p.id),
    substitutes: squad.filter(p => p.availability === 'FIT').slice(11, 16).map(p => p.id),
    captainId: squad[0]?.id,
    tacticalNotes: '',
    setPieceTakers: {},
    submittedToLeague: false
  };

  const [formation, setFormation] = useState<Formation>(prep.formation || '4-3-3');
  const [starters, setStarters] = useState<string[]>(prep.startingEleven || []);
  const [subs, setSubs] = useState<string[]>(prep.substitutes || []);
  const [captainId, setCaptainId] = useState<string | undefined>(prep.captainId);
  const [tacticalNotes, setTacticalNotes] = useState(prep.tacticalNotes || '');
  const [setPieceTakers, setSetPieceTakers] = useState(prep.setPieceTakers || {});
  const [submittedToLeague, setSubmittedToLeague] = useState(prep.submittedToLeague || false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Filter linked requests for this fixture
  const linkedRequests = teamDeskStore.getRequests().filter(r => r.linkedEntity?.id === fixture.id);

  const handleLoadPreset = (preset: TacticalDraftPreset) => {
    setFormation(preset.formation);
    setStarters(preset.startingEleven);
    setSubs(preset.substitutes);
    setCaptainId(preset.captainId);
    setTacticalNotes(preset.tacticalNotes);
    setSetPieceTakers(preset.setPieceTakers);
    setSaveFeedback(`Loaded "${preset.name}" into matchday sheet!`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleSavePreparation = (submitOfficial: boolean = false) => {
    const updatedPrep: MatchPreparation = {
      formation,
      startingEleven: starters,
      substitutes: subs,
      captainId,
      tacticalNotes,
      setPieceTakers,
      submittedToLeague: submitOfficial ? true : submittedToLeague,
      submissionDate: submitOfficial ? new Date().toISOString() : prep.submissionDate
    };

    teamDeskStore.saveMatchPreparation(fixture.id, updatedPrep);
    if (submitOfficial) setSubmittedToLeague(true);
    setSaveFeedback(submitOfficial ? 'Official match sheet submitted to League Secretariat!' : 'Preparation saved successfully.');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-panel" 
        style={{ maxWidth: '780px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-sunken)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="fixture-badge-comp">{fixture.competitionName}</span>
              {submittedToLeague && (
                <span className="status-pill fit" style={{ fontSize: '0.7rem' }}>
                  ✓ Official Sheet Submitted
                </span>
              )}
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem' }}>
              {fixture.homeTeamName} vs {fixture.awayTeamName}
            </h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> {fixture.date}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> {fixture.time}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> {fixture.venue}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Sub-tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--pitch-black)' }}>
          <button
            onClick={() => setActiveTab('lineup')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'lineup' ? '2px solid var(--nova-orange)' : '2px solid transparent',
              color: activeTab === 'lineup' ? 'var(--nova-orange)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Matchday Lineup & Tactics
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'operations' ? '2px solid var(--nova-orange)' : '2px solid transparent',
              color: activeTab === 'operations' ? 'var(--nova-orange)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Official Match Status & Referee
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'requests' ? '2px solid var(--nova-orange)' : '2px solid transparent',
              color: activeTab === 'requests' ? 'var(--nova-orange)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Fixture Requests ({linkedRequests.length})
          </button>
        </div>

        <div className="modal-body">
          {saveFeedback && (
            <div style={{ 
              padding: '10px 14px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              border: '1px solid #10b981', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '14px', 
              fontSize: '0.85rem', 
              color: '#6ee7b7', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <Check size={16} /> {saveFeedback}
            </div>
          )}

          {/* TAB 1: LINEUP & TACTICS WITH SAVED PRESET LOADER */}
          {activeTab === 'lineup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Presaved Drafts Loader Banner */}
              <div style={{
                background: 'var(--pitch-black)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--nova-orange)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Apply Saved Squad Draft</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Quick 1-tap pre-fill from your team drafts
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {presets.map(pr => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => handleLoadPreset(pr)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--stadium-white)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div>
                        <strong>{pr.name}</strong>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{pr.formation} • Slot {pr.slotNumber}</div>
                      </div>
                      <span style={{ color: 'var(--nova-orange)', fontWeight: 700 }}>Load ↵</span>
                    </button>
                  ))}
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

          {/* TAB 2: OFFICIAL MATCH STATUS & REFEREE (COACH READ-ONLY) */}
          {activeTab === 'operations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Official Authority Notice */}
              <div style={{
                display: 'flex',
                gap: '10px',
                padding: '12px 14px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#93c5fd'
              }}>
                <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                  <strong>Official Match Record (Match Officials Delegated)</strong>
                  <p style={{ margin: '2px 0 0 0', color: '#bfdbfe', fontSize: '0.76rem' }}>
                    Match scores, timeline events, and disciplinary records are officially recorded and verified by appointed Match Officials & Referees. Coaches have verified read-only access.
                  </p>
                </div>
              </div>

              {/* Score & Status Hero Banner */}
              <div style={{
                background: 'var(--pitch-black)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 16px',
                textAlign: 'center'
              }}>
                <span className={`status-pill ${fixture.status === 'FT' ? 'fit' : fixture.status === 'LIVE' ? 'suspended' : 'doubtful'}`} style={{ display: 'inline-flex', marginBottom: '10px' }}>
                  {fixture.status === 'FT' ? 'Full Time (FT)' : fixture.status === 'LIVE' ? `LIVE • ${fixture.minute || '1H'}` : 'Scheduled Kick-Off'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '10px 0' }}>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem' }}>{fixture.homeTeamLogo}</div>
                    <strong style={{ fontSize: '1rem', display: 'block' }}>{fixture.homeTeamName}</strong>
                  </div>

                  <div style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontSize: '2.5rem', 
                    fontWeight: 900, 
                    color: fixture.status === 'UPCOMING' ? 'var(--text-muted)' : 'var(--nova-orange)',
                    letterSpacing: '4px'
                  }}>
                    {fixture.status === 'UPCOMING' ? 'vs' : `${fixture.homeScore ?? 0} - ${fixture.awayScore ?? 0}`}
                  </div>

                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '2rem' }}>{fixture.awayTeamLogo}</div>
                    <strong style={{ fontSize: '1rem', display: 'block' }}>{fixture.awayTeamName}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Venue: {fixture.venue} • Round 8
                </div>
              </div>

              {/* Appointed Match Officials */}
              <div className="card-panel" style={{ padding: '14px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="var(--nova-orange)" />
                  Appointed Match Officials
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  <div style={{ background: 'var(--pitch-black)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Center Referee</span>
                    <strong>James Mwangi</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--nova-orange)' }}>Grade 1 National Referee</div>
                  </div>
                  <div style={{ background: 'var(--pitch-black)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Assistant Referee 1</span>
                    <strong>Daniel Kariuki</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FIFA Certified</div>
                  </div>
                  <div style={{ background: 'var(--pitch-black)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Assistant Referee 2</span>
                    <strong>Peter Omondi</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Regional Referee</div>
                  </div>
                  <div style={{ background: 'var(--pitch-black)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Match Commissioner</span>
                    <strong>Sarah Muthoni</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>KeMU League Secretariat</div>
                  </div>
                </div>
              </div>

              {/* Official Match Timeline Events */}
              <div className="card-panel" style={{ padding: '14px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem' }}>Verified Timeline & Disciplinary Events</h4>
                {(!fixture.events || fixture.events.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)' }}>
                    No events logged yet for this match. Timeline updates automatically during match play.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {fixture.events.map(ev => (
                      <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--nova-orange)', width: '32px' }}>{ev.time}</span>
                        <span style={{ fontWeight: 600 }}>
                          {ev.type === 'goal' ? '⚽ Goal' : ev.type === 'yellow_card' ? '🟨 Yellow Card' : ev.type === 'red_card' ? '🟥 Red Card' : '🔄 Sub'}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                        <strong>{ev.player}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FIXTURE GOVERNANCE REQUESTS */}
          {activeTab === 'requests' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Fixture-Linked Governance Requests</h4>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestReschedule(fixture);
                    }}
                    style={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--stadium-white)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Reschedule Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestVenueChange(fixture);
                    }}
                    style={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--stadium-white)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Venue Change Request
                  </button>
                </div>
              </div>

              {linkedRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)' }}>
                  <FileText size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No pending requests linked to this fixture.</p>
                  <span style={{ fontSize: '0.75rem' }}>Submit kickoff or venue adjustment requests above.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {linkedRequests.map(req => (
                    <div key={req.id} style={{ background: 'var(--pitch-black)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{req.title}</strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ref: {req.id} • {req.category}</div>
                        </div>
                        <span className={`status-pill ${req.status === 'APPROVED' ? 'fit' : req.status === 'IN_REVIEW' ? 'doubtful' : 'suspended'}`}>
                          {req.status}
                        </span>
                      </div>
                      <p style={{ margin: '6px 0', fontSize: '0.8rem', color: 'var(--stadium-white)' }}>
                        {req.description}
                      </p>
                      {req.responseHistory.length > 0 && (
                        <div style={{ background: 'var(--surface-elevated)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', marginTop: '6px' }}>
                          <span style={{ color: 'var(--nova-orange)', fontWeight: 600 }}>Latest note: </span>
                          <span>{req.responseHistory[req.responseHistory.length - 1].message}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--surface-sunken)' }}>
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
            Close
          </button>
          {activeTab === 'lineup' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleSavePreparation(false)}
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--stadium-white)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <Save size={15} /> Save Matchday Draft
              </button>
              <button
                type="button"
                onClick={() => handleSavePreparation(true)}
                className="login-button"
                style={{ padding: '8px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Send size={15} /> Submit Official Sheet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
