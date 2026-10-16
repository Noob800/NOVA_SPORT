import { useState } from 'react';
import { 
  X, Shield, ShieldCheck, Clock, MapPin, 
  FileText, Download, Users, History, AlertTriangle 
} from 'lucide-react';
import type { OfficialMatchData } from '../../../services/matchStore';

interface MatchDossierModalProps {
  match: OfficialMatchData;
  officialId?: string;
  onClose: () => void;
}

export function MatchDossierModal({ match, officialId = 'off-1', onClose }: MatchDossierModalProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'report' | 'crew' | 'audit'>('timeline');

  const appointedRole = match.officials.find(o => o.id === officialId)?.role || 'Match Official';

  const validGoals = match.events.filter(e => !e.isVoided && e.type === 'goal');
  const validYellows = match.events.filter(e => !e.isVoided && e.type === 'yellow_card');
  const validReds = match.events.filter(e => !e.isVoided && e.type === 'red_card');
  const voidedEvents = match.events.filter(e => e.isVoided);

  const handleExportCsv = () => {
    const headers = ['Minute', 'Type', 'Team', 'Player', 'Status', 'Details', 'Official'];
    const rows = match.events.map(e => [
      e.time,
      e.type,
      `"${e.teamName}"`,
      `"${e.playerName}"`,
      e.isVoided ? 'VOIDED' : 'VALID',
      `"${e.isVoided ? (e.voidReason || 'Rescinded') : (e.detail || '')}"`,
      `"${e.recordedByOfficialId}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Official_Match_Dossier_${match.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="ref-modal-backdrop" onClick={onClose}>
      <div 
        className="ref-modal-card dossier-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="ref-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(255, 94, 0, 0.15)',
              border: '1px solid rgba(255, 94, 0, 0.4)',
              borderRadius: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={18} color="var(--nova-orange)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--nova-orange)' }}>
                {appointedRole}
              </span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--stadium-white)' }}>
                Official Match Dossier & Archives
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Fixture #{match.id} • {match.competition.name}
              </span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="ref-modal-close-btn"
            title="Close dossier"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Match Summary HUD */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Home Team */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span style={{ fontSize: '2rem' }}>{match.homeTeam.logo}</span>
              <div>
                <strong style={{ fontSize: '1.05rem', display: 'block', color: 'var(--stadium-white)' }}>
                  {match.homeTeam.name}
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>HOME</span>
              </div>
            </div>

            {/* Score Center */}
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--stadium-white)' }}>
                {match.homeScore} - {match.awayScore}
              </div>
              <span className={`ref-period-tag ${match.status === 'VERIFIED_PUBLISHED' ? 'ft' : 'live'}`} style={{ fontSize: '0.68rem' }}>
                {match.status.replace(/_/g, ' ')} ({match.minute})
              </span>
            </div>

            {/* Away Team */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexDirection: 'row-reverse', textAlign: 'right' }}>
              <span style={{ fontSize: '2rem' }}>{match.awayTeam.logo}</span>
              <div>
                <strong style={{ fontSize: '1.05rem', display: 'block', color: 'var(--stadium-white)' }}>
                  {match.awayTeam.name}
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AWAY</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} /> {match.date} • {match.time}</span>
              <span><MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} /> {match.venue}</span>
            </div>

            {/* Quick stats chips */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                ⚽ {validGoals.length} Goals
              </span>
              <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#EAB308', padding: '2px 8px', borderRadius: '4px' }}>
                🟨 {validYellows.length}
              </span>
              <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', padding: '2px 8px', borderRadius: '4px' }}>
                🟥 {validReds.length}
              </span>
              {voidedEvents.length > 0 && (
                <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', padding: '2px 8px', borderRadius: '4px' }}>
                  🛡️ {voidedEvents.length} Rescinded
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--pitch-black)',
          padding: '0 16px'
        }}>
          {[
            { id: 'timeline', label: 'Match Timeline', icon: <History size={14} /> },
            { id: 'report', label: 'Official Report & Fair Play', icon: <FileText size={14} /> },
            { id: 'crew', label: 'Officiating Crew', icon: <Users size={14} /> },
            { id: 'audit', label: `Governance Audit (${match.auditLog?.length || 0})`, icon: <Shield size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--nova-orange)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--nova-orange)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div>
              {match.events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No match events recorded for this fixture.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {match.events.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--pitch-black)',
                        borderRadius: 'var(--radius-md)',
                        border: ev.isVoided ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                        opacity: ev.isVoided ? 0.65 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="ref-event-time-badge" style={{ fontSize: '0.75rem', minWidth: '34px' }}>
                          {ev.time}
                        </span>
                        <span style={{ fontSize: '1.25rem' }}>
                          {ev.type === 'goal' ? '⚽' : ev.type === 'yellow_card' ? '🟨' : ev.type === 'red_card' ? '🟥' : '🔄'}
                        </span>
                        <div>
                          <strong style={{ 
                            fontSize: '0.88rem',
                            color: 'var(--stadium-white)',
                            textDecoration: ev.isVoided ? 'line-through' : 'none' 
                          }}>
                            {ev.playerName} #{ev.playerNumber} ({ev.teamShortName})
                          </strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {ev.detail || ev.type} • Official ID: {ev.recordedByOfficialId}
                          </div>
                          {ev.isVoided && (
                            <span className="stadium-event-void-tag" style={{ marginTop: '2px' }}>
                              🚫 VOIDED: {ev.voidReason}
                            </span>
                          )}
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: ev.isVoided ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: ev.isVoided ? '#EF4444' : '#10B981'
                      }}>
                        {ev.isVoided ? 'Rescinded' : 'Valid'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REPORT */}
          {activeTab === 'report' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'var(--pitch-black)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--nova-orange)', textTransform: 'uppercase' }}>
                    Match Official Sign-off & Verification
                  </span>
                  <span className={`ref-period-tag ${match.report?.isPublished ? 'ft' : 'live'}`} style={{ fontSize: '0.7rem' }}>
                    {match.report?.isPublished ? 'VERIFIED & ARCHIVED' : 'PENDING'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lead Official Signature</span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--stadium-white)', marginTop: '2px' }}>
                      {match.report?.leadOfficialSignature || 'Pending Lead Sign-off'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Timestamp of Submission</span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--stadium-white)', marginTop: '2px' }}>
                      {match.report?.submittedAt ? new Date(match.report.submittedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confirmed Official Result</span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--nova-orange)', marginTop: '2px' }}>
                      {match.homeTeam.shortName} {match.homeScore} - {match.awayScore} {match.awayTeam.shortName}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '14px', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Referee Match Notes & Assessment:
                  </span>
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--stadium-white)' }}>
                    {match.report?.refereeNotes || 'Standard match report filed without supplemental disciplinary comments.'}
                  </p>
                </div>

                {match.report?.incidentReport && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <strong style={{ fontSize: '0.78rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} /> Disciplinary Committee Referral
                    </strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--stadium-white)' }}>
                      {match.report.incidentReport}
                    </p>
                  </div>
                )}
              </div>

              {/* Fair Play Assessment */}
              <div style={{
                background: 'var(--pitch-black)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--stadium-white)' }}>
                  Fair Play & Sporting Conduct Rating
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ background: 'var(--surface-color)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{match.homeTeam.name}</div>
                    <div style={{ marginTop: '4px' }}>
                      {'⭐'.repeat(match.report?.fairPlayRatingHome || 5)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        ({match.report?.fairPlayRatingHome || 5}/5)
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-color)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{match.awayTeam.name}</div>
                    <div style={{ marginTop: '4px' }}>
                      {'⭐'.repeat(match.report?.fairPlayRatingAway || 5)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        ({match.report?.fairPlayRatingAway || 5}/5)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CREW */}
          {activeTab === 'crew' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Accredited officiating panel appointed for this competition fixture:
              </div>
              {match.officials.map((off) => {
                const isCurrent = off.id === officialId;
                return (
                  <div
                    key={off.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: isCurrent ? 'rgba(255, 94, 0, 0.08)' : 'var(--pitch-black)',
                      border: isCurrent ? '1px solid rgba(255, 94, 0, 0.3)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isCurrent ? 'var(--nova-orange)' : 'var(--border-subtle)',
                        color: isCurrent ? '#000' : 'var(--stadium-white)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}>
                        {off.role.includes('Center') ? 'CR' : off.role.includes('1') ? 'AR1' : off.role.includes('2') ? 'AR2' : '4th'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--stadium-white)' }}>
                          {off.name} {isCurrent && <span style={{ color: 'var(--nova-orange)', fontSize: '0.75rem' }}>(You)</span>}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--nova-orange)', fontWeight: 600 }}>
                          {off.role}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--stadium-white)'
                    }}>
                      {off.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Immutable FIFA / FKF governance ledger recording all match timeline manipulations and report events:
              </div>
              {(!match.auditLog || match.auditLog.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No historical audit entries registered for this fixture.
                </div>
              ) : (
                match.auditLog.map((aud) => (
                  <div
                    key={aud.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '10px 14px',
                      background: 'var(--pitch-black)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: aud.action === 'EVENT_VOIDED' 
                        ? '3px solid #EF4444' 
                        : aud.action === 'REPORT_SUBMITTED' 
                        ? '3px solid #10B981' 
                        : '3px solid var(--nova-orange)',
                      borderTop: '1px solid var(--border-subtle)',
                      borderRight: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--stadium-white)'
                      }}>
                        {aud.action}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(aud.timestamp).toLocaleTimeString()} • {new Date(aud.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--stadium-white)' }}>
                      {aud.summary}
                    </div>

                    {aud.reason && (
                      <div style={{ fontSize: '0.76rem', color: '#EF4444' }}>
                        Reason: {aud.reason}
                      </div>
                    )}

                    {aud.details && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {aud.details}
                      </div>
                    )}

                    <div style={{ fontSize: '0.68rem', color: 'var(--nova-orange)', marginTop: '2px' }}>
                      Official: {aud.officialName} ({aud.officialId})
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Export & Close Actions */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--pitch-black)'
        }}>
          <button
            type="button"
            onClick={handleExportCsv}
            className="quick-action-btn"
            style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Export Match Sheet (CSV)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="login-button"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
