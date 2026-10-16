import { useState } from 'react';
import { 
  ShieldCheck, Clock, MapPin, 
  Search, Download, Users
} from 'lucide-react';
import { matchStore } from '../../../services/matchStore';

interface PastAppointmentsViewProps {
  officialId?: string;
  onNavigateToLive?: () => void;
}

export function PastAppointmentsView({ officialId = 'off-1', onNavigateToLive }: PastAppointmentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CENTER' | 'ASSISTANT_OR_FOURTH'>('ALL');

  // Fetch official's past matches & statistics
  const pastMatches = matchStore.getOfficialPastMatches(officialId);
  const careerStats = matchStore.getOfficialCareerStats(officialId);

  // Filter matches based on search & role
  const filteredMatches = pastMatches.filter(m => {
    const appointedRole = m.officials.find(o => o.id === officialId)?.role;
    
    // Role filter
    if (roleFilter === 'CENTER' && appointedRole !== 'Center Referee') return false;
    if (roleFilter === 'ASSISTANT_OR_FOURTH' && appointedRole === 'Center Referee') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVenue = m.venue.toLowerCase();
      const homeName = m.homeTeam.name.toLowerCase();
      const awayName = m.awayTeam.name.toLowerCase();
      const compName = m.competition.name.toLowerCase();
      return homeName.includes(q) || awayName.includes(q) || matchVenue.includes(q) || compName.includes(q);
    }

    return true;
  });

  const handleExportCsv = (match: any) => {
    const headers = ['Minute', 'Type', 'Team', 'Player', 'Status', 'Details', 'Official'];
    const rows = match.events.map((e: any) => [
      e.time,
      e.type,
      `"${e.teamName}"`,
      `"${e.playerName}"`,
      e.isVoided ? 'VOIDED' : 'VALID',
      `"${e.isVoided ? (e.voidReason || 'Rescinded') : (e.detail || '')}"`,
      `"${e.recordedByOfficialId}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Official_Match_Sheet_${match.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* ======================================================== */}
      {/* 1. OFFICIAL CAREER & ACCREDITATION DOSSIER HEADER        */}
      {/* ======================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 20, 15, 0.9) 100%)',
        border: '1px solid rgba(255, 94, 0, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--nova-orange) 0%, #d44d00 100%)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 900,
              boxShadow: '0 4px 16px rgba(255, 94, 0, 0.3)'
            }}>
              🏅
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--stadium-white)', fontWeight: 800 }}>
                  Referee James
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--nova-orange)',
                  background: 'rgba(255, 94, 0, 0.12)',
                  border: '1px solid rgba(255, 94, 0, 0.3)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  FKF Premier Panel #8821
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  FIFA / FKF Verified
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official appointment ledger & verified historical match archive for competition governance
              </p>
            </div>
          </div>

          {onNavigateToLive && (
            <button
              type="button"
              onClick={onNavigateToLive}
              className="login-button"
              style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700 }}
            >
              Go to Current Active Match
            </button>
          )}
        </div>

        {/* Career Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '14px'
        }}>
          <div style={{ background: 'var(--pitch-black)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Total Officiated</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--stadium-white)', marginTop: '2px' }}>
              {pastMatches.length} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>fixtures</span>
            </div>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Center Referee Duty</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--nova-orange)', marginTop: '2px' }}>
              {careerStats.centerRefereeCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>matches</span>
            </div>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>4th Official / Assistant</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38BDF8', marginTop: '2px' }}>
              {careerStats.assistantOrFourthCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>matches</span>
            </div>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Disciplinary Actions</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#EAB308', marginTop: '2px' }}>
              {careerStats.yellowCardsIssued} 🟨 • {careerStats.redCardsIssued} 🟥
            </div>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Verified Reports</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>
              {careerStats.reportsPublished} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>signed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEARCH & FILTER TOOLBAR                               */}
      {/* ======================================================== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1 1 240px',
          maxWidth: '420px'
        }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search opponent, venue, or competition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              background: 'var(--pitch-black)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--stadium-white)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Role Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'ALL', label: 'All Appointments' },
            { id: 'CENTER', label: 'Center Referee Only' },
            { id: 'ASSISTANT_OR_FOURTH', label: '4th Official / Assessor' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setRoleFilter(pill.id as any)}
              className={`ref-log-filter-btn ${roleFilter === pill.id ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PAST MATCH APPOINTMENTS LIST (ALL DETAILS ON CARD)    */}
      {/* ======================================================== */}
      {filteredMatches.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--stadium-white)', display: 'block' }}>
            No past match appointments found
          </strong>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem' }}>
            {searchQuery ? `No fixtures matching "${searchQuery}" with selected role filter.` : 'No past matches recorded under your official ID.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredMatches.map((m) => {
            const myOfficial = m.officials.find(o => o.id === officialId);
            const myRole = myOfficial?.role || 'Match Official';
            const isCenterRef = myRole === 'Center Referee';

            const goals = m.events.filter(e => !e.isVoided && e.type === 'goal');
            const yellowCards = m.events.filter(e => !e.isVoided && e.type === 'yellow_card');
            const redCards = m.events.filter(e => !e.isVoided && e.type === 'red_card');
            const voidedEvents = m.events.filter(e => e.isVoided);

            return (
              <div
                key={m.id}
                className="assigned-match-card"
                style={{
                  background: 'var(--pitch-black)',
                  border: isCenterRef ? '1px solid rgba(255, 94, 0, 0.35)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* Header: Appointed Role & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: isCenterRef ? 'var(--nova-orange)' : '#38BDF8',
                      background: isCenterRef ? 'rgba(255, 94, 0, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                      border: isCenterRef ? '1px solid rgba(255, 94, 0, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <ShieldCheck size={13} /> Appointed: {myRole}
                    </span>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {m.competition.name}
                    </span>
                  </div>

                  <span className={`ref-period-tag ${m.status === 'VERIFIED_PUBLISHED' ? 'ft' : 'live'}`} style={{ fontSize: '0.7rem' }}>
                    {m.status.replace(/_/g, ' ')} ({m.minute})
                  </span>
                </div>

                {/* Scoreboard Body */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {/* Home Team */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{ fontSize: '2.2rem' }}>{m.homeTeam.logo}</span>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--stadium-white)', display: 'block' }}>
                        {m.homeTeam.name}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Home Team</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'center', padding: '0 20px' }}>
                    <div style={{ fontSize: '2.3rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--stadium-white)' }}>
                      {m.homeScore} - {m.awayScore}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
                      Official Result Verified
                    </span>
                  </div>

                  {/* Away Team */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexDirection: 'row-reverse', textAlign: 'right' }}>
                    <span style={{ fontSize: '2.2rem' }}>{m.awayTeam.logo}</span>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--stadium-white)', display: 'block' }}>
                        {m.awayTeam.name}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Away Team</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Match Breakdown (All Details on Card) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px' }}>
                  {/* Goal Scorers line */}
                  {goals.length > 0 && (
                    <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>⚽ Goals:</span>
                      {goals.map((g, idx) => (
                        <span key={g.id || idx} style={{ color: 'var(--stadium-white)' }}>
                          {g.playerName} ({g.time}){idx < goals.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Disciplinary line */}
                  {(yellowCards.length > 0 || redCards.length > 0 || voidedEvents.length > 0) && (
                    <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Discipline:</span>
                      {yellowCards.map((c, idx) => (
                        <span key={c.id || idx} style={{ color: '#EAB308', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          🟨 {c.playerName} ({c.time})
                        </span>
                      ))}
                      {redCards.map((r, idx) => (
                        <span key={r.id || idx} style={{ color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                          🟥 {r.playerName} ({r.time})
                        </span>
                      ))}
                      {voidedEvents.map((v, idx) => (
                        <span key={v.id || idx} style={{ color: '#F87171', fontSize: '0.75rem', textDecoration: 'line-through' }}>
                          🛡️ Rescinded ({v.voidReason})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Officiating Crew panel */}
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '6px' }}>
                    <Users size={13} style={{ display: 'inline' }} />
                    <span style={{ fontWeight: 600 }}>Crew:</span>
                    {m.officials.map((o, idx) => (
                      <span key={o.id} style={{ color: o.id === officialId ? 'var(--nova-orange)' : 'var(--stadium-white)' }}>
                        {o.role.includes('Center') ? 'CR' : o.role.includes('1') ? 'AR1' : o.role.includes('2') ? 'AR2' : '4th'}: {o.name}
                        {idx < m.officials.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Referee notes / report quote if available */}
                  {m.report?.refereeNotes && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '6px' }}>
                      Report Notes: "{m.report.refereeNotes}"
                      {m.report.leadOfficialSignature && (
                        <span style={{ fontStyle: 'normal', color: 'var(--nova-orange)', marginLeft: '6px', fontWeight: 600 }}>
                          — Signed by {m.report.leadOfficialSignature}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Date, Venue, Fair Play, and Export */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} /> {m.date} • {m.time}</span>
                    <span><MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} /> {m.venue}</span>
                    {m.report && (
                      <span style={{ color: '#10B981', fontWeight: 600 }}>
                        Fair Play: {m.homeTeam.shortName} {'⭐'.repeat(m.report.fairPlayRatingHome || 5)} • {m.awayTeam.shortName} {'⭐'.repeat(m.report.fairPlayRatingAway || 5)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportCsv(m)}
                    className="quick-action-btn"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Export official CSV sheet"
                  >
                    <Download size={13} /> Export CSV Sheet
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
