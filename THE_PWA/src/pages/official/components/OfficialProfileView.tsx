import { useState } from 'react';
import { 
  Shield, ShieldCheck, Award, FileText, 
  Download, MapPin, 
  Mail, Phone, Calendar
} from 'lucide-react';
import { matchStore, type OfficialMatchData } from '../../../services/matchStore';

interface OfficialProfileViewProps {
  officialId?: string;
  activeMatch?: OfficialMatchData;
  onOpenReportModal?: () => void;
  onNavigateToLive?: () => void;
}

export function OfficialProfileView({
  officialId = 'off-1',
  activeMatch,
  onOpenReportModal,
  onNavigateToLive
}: OfficialProfileViewProps) {
  const [profileTab, setProfileTab] = useState<'overview' | 'reports' | 'credentials'>('overview');

  const pastMatches = matchStore.getOfficialPastMatches(officialId);
  const careerStats = matchStore.getOfficialCareerStats(officialId);

  // Compute fair play average from published reports
  const publishedReports = pastMatches
    .filter(m => m.report && m.report.isPublished)
    .map(m => ({ match: m, report: m.report! }));

  const totalFairPlayStars = publishedReports.reduce((acc, curr) => {
    return acc + (curr.report.fairPlayRatingHome + curr.report.fairPlayRatingAway) / 2;
  }, 0);
  const avgFairPlay = publishedReports.length > 0 
    ? (totalFairPlayStars / publishedReports.length).toFixed(1) 
    : '4.8';

  const handleExportAllReportsCsv = () => {
    const headers = ['Fixture', 'Date', 'Venue', 'Final Score', 'Role', 'Lead Signature', 'Submitted At', 'Referee Notes'];
    const rows = publishedReports.map(({ match, report }) => [
      `"${match.homeTeam.name} vs ${match.awayTeam.name}"`,
      match.date,
      `"${match.venue}"`,
      `"${report.confirmedScore.home} - ${report.confirmedScore.away}"`,
      `"${match.officials.find(o => o.id === officialId)?.role || 'Official'}"`,
      `"${report.leadOfficialSignature}"`,
      `"${report.submittedAt}"`,
      `"${report.refereeNotes}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Official_Reports_Ledger_${officialId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSingleReport = (match: OfficialMatchData) => {
    if (!match.report) return;
    const headers = ['Minute', 'Type', 'Team', 'Player', 'Status', 'Details', 'Official'];
    const rows = match.events.map(e => [
      e.time,
      e.type,
      `"${e.teamName}"`,
      `"${e.playerName}"`,
      e.isVoided ? 'VOIDED' : 'VALID',
      `"${e.isVoided ? e.voidReason : e.detail || ''}"`,
      `"${e.recordedByOfficialId}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Verified_Report_${match.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* ======================================================== */}
      {/* 1. IDENTITY & WHO THEY ARE (HERO PROFILE CARD)           */}
      {/* ======================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(25, 20, 18, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%)',
        border: '1px solid rgba(255, 94, 0, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          {/* Avatar & Core Bio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--nova-orange) 0%, #b83d00 100%)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                fontWeight: 900,
                boxShadow: '0 6px 20px rgba(255, 94, 0, 0.35)',
                border: '3px solid #000'
              }}>
                🏅
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#10B981',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '2px solid #000'
              }} title="Active Duty in Good Standing" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--stadium-white)', fontWeight: 800 }}>
                  Referee James
                </h2>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--nova-orange)',
                  background: 'rgba(255, 94, 0, 0.12)',
                  border: '1px solid rgba(255, 94, 0, 0.35)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  Badge #FKF-8821
                </span>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  Accredited Match Official
                </span>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--stadium-white)', fontWeight: 600, marginTop: '4px' }}>
                Senior Center Referee • FKF Premier League Panel
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Football Kenya Federation (FKF) • Upper Eastern Branch • KeMU Super League Lead Official
              </div>
            </div>
          </div>

          {/* Quick Contact & Live Match Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            {onNavigateToLive && (
              <button
                type="button"
                onClick={onNavigateToLive}
                className="login-button"
                style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 800 }}
              >
                Go to Match Operations
              </button>
            )}

            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              License Expiry: <strong>31 Dec 2027 (Compliant)</strong>
            </span>
          </div>
        </div>

        {/* Contact & Association Details Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          background: 'var(--pitch-black)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Mail size={15} color="var(--nova-orange)" />
            <span>referee.james@novasport.ke</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Phone size={15} color="var(--nova-orange)" />
            <span>+254 712 345 678</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <MapPin size={15} color="var(--nova-orange)" />
            <span>Meru & Upper Eastern Branch</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Calendar size={15} color="var(--nova-orange)" />
            <span>7 Seasons Officiating</span>
          </div>
        </div>

        {/* Career Numbers & Aggregated Report Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px'
        }}>
          <div style={{ background: 'var(--pitch-black)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Career Fixtures</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--stadium-white)', marginTop: '2px' }}>
              {pastMatches.length + 1}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#10B981' }}>1 Live • {pastMatches.length} Past</span>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Center Referee</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--nova-orange)', marginTop: '2px' }}>
              {careerStats.centerRefereeCount + 1}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Lead Duty</span>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>4th / Assistant</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#38BDF8', marginTop: '2px' }}>
              {careerStats.assistantOrFourthCount}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Support Duty</span>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Cards Issued</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#EAB308', marginTop: '2px' }}>
              {careerStats.yellowCardsIssued} 🟨 / {careerStats.redCardsIssued} 🟥
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Disciplinary Tally</span>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Reports Filed</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>
              {careerStats.reportsPublished}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#10B981' }}>100% Verified</span>
          </div>

          <div style={{ background: 'var(--pitch-black)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Fair Play Index</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--nova-orange)', marginTop: '2px' }}>
              ⭐ {avgFairPlay}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Out of 5.0</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUB-SECTION TABS: REPORTS DOSSIER vs ACCREDITATION    */}
      {/* ======================================================== */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '10px'
      }}>
        <button
          type="button"
          onClick={() => setProfileTab('overview')}
          className={`ref-log-filter-btn ${profileTab === 'overview' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileText size={15} /> Match Reports & Disciplinary Ledger ({publishedReports.length})
        </button>

        <button
          type="button"
          onClick={() => setProfileTab('credentials')}
          className={`ref-log-filter-btn ${profileTab === 'credentials' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Award size={15} /> Official Accreditations & Integrity Standard
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. MATCH REPORTS DOSSIER (REPLACES STANDALONE REPORTS)   */}
      {/* ======================================================== */}
      {profileTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Active Match Report Banner if Pending Sign-off */}
          {activeMatch && (
            <div className="card-panel" style={{
              background: activeMatch.report?.isPublished ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 94, 0, 0.08)',
              borderLeft: `4px solid ${activeMatch.report?.isPublished ? '#10B981' : 'var(--nova-orange)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className={`ref-period-tag ${activeMatch.report?.isPublished ? 'ft' : 'live'}`} style={{ fontSize: '0.68rem' }}>
                    {activeMatch.report?.isPublished ? 'OFFICIALLY VERIFIED & SIGNED' : 'CURRENT ACTIVE MATCH REPORT'}
                  </span>
                  <h4 style={{ margin: '6px 0 2px 0', fontSize: '1.1rem' }}>
                    {activeMatch.homeTeam.name} {activeMatch.homeScore} - {activeMatch.awayScore} {activeMatch.awayTeam.name}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Current Minute: {activeMatch.minute} • Status: {activeMatch.status.replace(/_/g, ' ')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {onOpenReportModal && (
                    <button
                      type="button"
                      onClick={onOpenReportModal}
                      className="login-button"
                      style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      <FileText size={14} /> {activeMatch.report ? 'Edit Official Report' : 'Sign & Complete Report'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Bar for All Reports */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--stadium-white)' }}>
                Official Match Reports Archive
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Certified match returns submitted to the KeMU Super League Disciplinary Committee
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportAllReportsCsv}
              className="quick-action-btn"
              style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} /> Export All Reports (CSV)
            </button>
          </div>

          {/* Published Reports List */}
          {publishedReports.length === 0 ? (
            <div className="card-panel" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              No submitted match reports on file yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {publishedReports.map(({ match, report }) => (
                <div
                  key={match.id}
                  style={{
                    background: 'var(--pitch-black)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Report Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        ✅ Officially Verified
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--stadium-white)' }}>
                        {match.homeTeam.name} {report.confirmedScore.home} - {report.confirmedScore.away} {match.awayTeam.name}
                      </strong>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Report Content Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '10px',
                    fontSize: '0.82rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '10px 14px',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Lead Official Signature</span>
                      <strong style={{ color: 'var(--nova-orange)' }}>{report.leadOfficialSignature}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Venue & Kickoff</span>
                      <span>{match.venue} • {match.date}</span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Fair Play Assessment</span>
                      <span>
                        {match.homeTeam.shortName} {'⭐'.repeat(report.fairPlayRatingHome || 5)} • {match.awayTeam.shortName} {'⭐'.repeat(report.fairPlayRatingAway || 5)}
                      </span>
                    </div>
                  </div>

                  {/* Referee remarks */}
                  <div style={{ fontSize: '0.82rem', color: 'var(--stadium-white)', lineHeight: 1.45 }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Referee Remarks:</span>
                    "{report.refereeNotes}"
                  </div>

                  {/* Incident note if present */}
                  {report.incidentReport && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      color: '#EF4444'
                    }}>
                      <strong>⚠️ Disciplinary Incident Filed:</strong> {report.incidentReport}
                    </div>
                  )}

                  {/* Card footer action */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleExportSingleReport(match)}
                      className="quick-action-btn"
                      style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Download size={13} /> Export Report Sheet (CSV)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. OFFICIAL CREDENTIALS & INTEGRITY STANDARDS            */}
      {/* ======================================================== */}
      {profileTab === 'credentials' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          <div className="card-panel">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="var(--nova-orange)" /> Accredited Qualifications
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span>FIFA Laws of the Game (2026/27)</span>
                <strong style={{ color: '#10B981' }}>Certified Pass</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span>FKF Physical Fitness Test</span>
                <strong style={{ color: '#10B981' }}>Level 1 National</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span>VAR & Video Assistant Review</span>
                <strong style={{ color: '#10B981' }}>Operational</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span>Safe Sport & Anti-Match Fixing</span>
                <strong style={{ color: '#10B981' }}>Signed & Bound</strong>
              </div>
            </div>
          </div>

          <div className="card-panel">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={18} color="var(--nova-orange)" /> Match Official Integrity Standard
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: 'var(--stadium-white)', display: 'block' }}>1. Single-Match Duty Exclusivity</strong>
                Referees can only be appointed to one active match at a time. Multi-match facilitation is strictly prohibited by FKF regulations.
              </div>
              <div style={{ marginTop: '4px' }}>
                <strong style={{ color: 'var(--stadium-white)', display: 'block' }}>2. 5-Minute Invalidation Grace Window</strong>
                Event corrections require mandatory justification and must occur within 5 minutes. No silent event deletion is permitted.
              </div>
              <div style={{ marginTop: '4px' }}>
                <strong style={{ color: 'var(--stadium-white)', display: 'block' }}>3. Immutable Governance Audit Trail</strong>
                Every action, period transition, goal record, and report submission writes a tamper-evident audit entry.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
