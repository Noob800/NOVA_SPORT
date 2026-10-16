import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, CheckCircle2, 
  Clock, MapPin, 
  Shield, 
  Maximize2, Minimize2,
  Lock, ShieldCheck, History, ShieldAlert
} from 'lucide-react';
import { 
  matchStore, 
  type OfficialMatchData, 
  type TeamRosterPlayer,
  type MatchEventItem,
  isEventWithinCorrectionWindow,
  getCorrectionWindowRemainingSeconds
} from '../../services/matchStore';
import { RefereeTacticalPitch, RefereeBench } from './components/RefereeTacticalPitch';
import { PlayerActionModal } from './components/PlayerActionModal';
import { SignReportModal } from './components/SignReportModal';
import { VoidEventModal } from './components/VoidEventModal';
import { PastAppointmentsView } from './components/PastAppointmentsView';
import { OfficialProfileView } from './components/OfficialProfileView';
import './MatchdayDesk.css';

export function MatchdayDesk() {
  const { section = 'matches' } = useParams<{ section: string }>();
  const navigate = useNavigate();

  // Load matches & reactive subscription
  const [matches, setMatches] = useState<OfficialMatchData[]>(() => matchStore.getAllMatches());
  
  // Enforce Credibility Rule: Exactly 1 appointed match assignment at a time
  const assignedMatches = matchStore.getAssignedMatches('off-1');
  const activeMatch = assignedMatches[0] || matches[0];

  // Sub-tab in section === 'matches': 'active' | 'history'
  const [matchesSubTab, setMatchesSubTab] = useState<'active' | 'history'>('active');

  // Active team on tactical pitch (defaults to home team)
  const [activeTeamId, setActiveTeamId] = useState<string>(activeMatch?.homeTeam.id || 't1');

  // Fullscreen / Stadium Mode
  const [isStadiumFullscreen, setIsStadiumFullscreen] = useState(false);

  // Mobile console view tab: 'pitch' | 'bench' | 'events'
  const [mobileConsoleTab, setMobileConsoleTab] = useState<'pitch' | 'bench' | 'events'>('pitch');

  // Events panel tab in side panel: 'log' | 'audit'
  const [eventsPanelTab, setEventsPanelTab] = useState<'log' | 'audit'>('log');

  // Selected player for action drawer
  const [selectedPlayerTarget, setSelectedPlayerTarget] = useState<{
    player: TeamRosterPlayer;
    isOnPitch: boolean;
  } | null>(null);

  // Audited Invalidation Modal state
  const [targetVoidEvent, setTargetVoidEvent] = useState<MatchEventItem | null>(null);

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Events log filter
  const [eventFilter, setEventFilter] = useState<'ALL' | 'GOALS' | 'CARDS' | 'SUBS'>('ALL');

  // Timer tick for 1-second interval countdown updates
  const [, setNowTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = matchStore.subscribe(() => {
      setMatches(matchStore.getAllMatches());
    });
    return unsubscribe;
  }, []);

  // Sync activeTeamId when activeMatch changes
  useEffect(() => {
    if (activeMatch) {
      setActiveTeamId(activeMatch.homeTeam.id);
    }
  }, [activeMatch?.id]);

  // Fullscreen event listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsStadiumFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleStadiumFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsStadiumFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsStadiumFullscreen(false);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Whistle Action Dispatcher ---
  const handleWhistleAction = () => {
    if (!activeMatch) return;

    if (activeMatch.status === 'SCHEDULED') {
      matchStore.confirmPreMatchReadiness(activeMatch.id, true);
      showToast('Pre-Match readiness & team sheets verified! Match is READY.');
    } else if (activeMatch.status === 'READY') {
      matchStore.updateMatchPeriod(activeMatch.id, 'FIRST_HALF', "1'");
      showToast('Whistle blown: 1st Half Kicked Off! Live score active.');
    } else if (activeMatch.status === 'FIRST_HALF') {
      matchStore.updateMatchPeriod(activeMatch.id, 'HALF_TIME', 'HT');
      showToast('Whistle blown: Half-Time! Period paused.');
    } else if (activeMatch.status === 'HALF_TIME') {
      matchStore.updateMatchPeriod(activeMatch.id, 'SECOND_HALF', "46'");
      showToast('Whistle blown: 2nd Half Kicked Off!');
    } else if (activeMatch.status === 'SECOND_HALF') {
      matchStore.updateMatchPeriod(activeMatch.id, 'FULL_TIME_PENDING_REVIEW', 'FT');
      showToast('Whistle blown: Full-Time! Awaiting Official Match Report.');
    } else if (activeMatch.status === 'FULL_TIME_PENDING_REVIEW') {
      setShowReportModal(true);
    }
  };

  const handleAdjustMinute = (delta: number) => {
    if (!activeMatch) return;
    const currentNum = parseInt(activeMatch.minute.replace("'", '')) || 1;
    const newNum = Math.max(1, currentNum + delta);
    matchStore.setMatchMinute(activeMatch.id, `${newNum}'`);
    showToast(`Clock adjusted to ${newNum}'`);
  };

  // --- Handlers for Player Action Modal ---
  const handleConfirmGoal = (goalData: any) => {
    if (!activeMatch) return;
    matchStore.recordEvent(activeMatch.id, {
      type: 'goal',
      ...goalData,
      recordedByOfficialId: 'off-1',
      minuteNumber: parseInt(goalData.time.replace("'", '')) || 1
    });
    setSelectedPlayerTarget(null);
    showToast(`⚽ GOAL LOGGED: ${goalData.playerName} (${goalData.time}) [5-min grace window active]`);
  };

  const handleConfirmCard = (cardData: any) => {
    if (!activeMatch) return;
    matchStore.recordEvent(activeMatch.id, {
      ...cardData,
      recordedByOfficialId: 'off-1',
      minuteNumber: parseInt(cardData.time.replace("'", '')) || 1
    });
    setSelectedPlayerTarget(null);
    showToast(`${cardData.type === 'yellow_card' ? '🟨 Caution' : '🟥 Dismissal'} logged: ${cardData.playerName}`);
  };

  const handleConfirmSub = (subData: any) => {
    if (!activeMatch) return;
    matchStore.recordSubstitution(activeMatch.id, subData);
    setSelectedPlayerTarget(null);
    showToast(`🔄 SUB: ${subData.teamShortName} (Out: #${subData.playerNumber} ➡️ In: #${subData.subPlayerNumber})`);
  };

  // Audited Invalidation Handler
  const handleConfirmVoid = (eventId: string, reason: string, notes?: string) => {
    if (!activeMatch) return;
    const result = matchStore.voidEvent(activeMatch.id, eventId, reason, notes, 'off-1');
    setTargetVoidEvent(null);
    if (result.success) {
      showToast(`🛡️ Audited Change: Event marked as VOIDED (${reason})`);
    } else {
      showToast(`❌ ${result.message}`);
    }
  };

  const handleConfirmReport = (reportData: any) => {
    if (!activeMatch) return;
    matchStore.submitOfficialReport(activeMatch.id, reportData);
    setShowReportModal(false);
    showToast(reportData.publishOfficialResult ? 'Match Officially Verified & Published!' : 'Match report draft saved.');
  };

  const activeTeam = activeMatch
    ? (activeTeamId === activeMatch.homeTeam.id ? activeMatch.homeTeam : activeMatch.awayTeam)
    : null;

  return (
    <div className={`official-desk-container ${section === 'operations' ? 'operations-console' : ''} ${isStadiumFullscreen ? 'stadium-fullscreen-active' : ''}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ref-floating-toast">
          <CheckCircle2 size={18} color="var(--nova-orange)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: ASSIGNED APPOINTMENT (STRICTLY 1 AT A TIME)   */}
      {/* ======================================================== */}
      {section === 'matches' && (
        <div className="desk-matches-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Sub-tab toggler: Active Duty Assignment vs Past Appointments */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setMatchesSubTab('active')}
                className={`ref-log-filter-btn ${matchesSubTab === 'active' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldCheck size={16} /> Active Duty Assignment (1)
              </button>
              <button
                type="button"
                onClick={() => setMatchesSubTab('history')}
                className={`ref-log-filter-btn ${matchesSubTab === 'history' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <History size={16} /> Past Appointments ({matchStore.getOfficialPastMatches('off-1').length})
              </button>
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Official Duty Status: <strong style={{ color: '#10B981' }}>Active on Duty</strong>
            </span>
          </div>

          {matchesSubTab === 'active' ? (
            <>
              {/* Official Credibility Banner */}
              <div style={{
                background: 'rgba(255, 94, 0, 0.08)',
                border: '1px solid rgba(255, 94, 0, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={22} color="var(--nova-orange)" />
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--stadium-white)', display: 'block' }}>
                      FIFA / FKF Match Official Integrity Standard
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      A match official is appointed to <strong>strictly one match at a time</strong>. Simultaneous facilitation is prohibited.
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--nova-orange)',
                  background: 'var(--pitch-black)',
                  border: '1px solid var(--border-subtle)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  Lead Center Referee: James (off-1)
                </span>
              </div>

              {/* Active Highlight Card - Single Appointed Fixture */}
              {activeMatch ? (
                <div className="assigned-match-card active-match">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="official-badge-pill">Exclusive Official Appointment</span>
                    <span className={`ref-period-tag ${activeMatch.status.includes('HALF') ? 'live' : activeMatch.status === 'READY' ? 'ready' : 'ft'}`}>
                      {activeMatch.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '2.2rem' }}>{activeMatch.homeTeam.logo}</span>
                      <div>
                        <strong style={{ fontSize: '1.15rem' }}>{activeMatch.homeTeam.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Home Team</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--stadium-white)', fontFamily: 'var(--font-display)' }}>
                        {activeMatch.homeScore} - {activeMatch.awayScore}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--nova-orange)', fontWeight: 700 }}>
                        {activeMatch.minute}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: 'row-reverse' }}>
                      <span style={{ fontSize: '2.2rem' }}>{activeMatch.awayTeam.logo}</span>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '1.15rem' }}>{activeMatch.awayTeam.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Away Team</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span><Clock size={15} style={{ display: 'inline', marginRight: '4px' }} /> {activeMatch.date} • {activeMatch.time}</span>
                      <span><MapPin size={15} style={{ display: 'inline', marginRight: '4px' }} /> {activeMatch.venue}</span>
                      <span><Shield size={15} style={{ display: 'inline', marginRight: '4px' }} /> {activeMatch.competition.name}</span>
                    </div>

                    <button
                      onClick={() => navigate('/workspace/official/operations')}
                      className="login-button"
                      style={{ padding: '9px 24px', fontSize: '0.9rem', fontWeight: 800 }}
                    >
                      <Play size={16} /> Enter Match Operations
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No official match assignment found for your official credentials.
                </div>
              )}
            </>
          ) : (
            <PastAppointmentsView officialId="off-1" onNavigateToLive={() => setMatchesSubTab('active')} />
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: MATCH OPERATIONS (ZERO-SCROLL STADIUM CONSOLE) */}
      {/* ======================================================== */}
      {section === 'operations' && activeMatch && (
        <div className="stadium-operations-wrapper">
          {/* HIGH-DENSITY STADIUM COMMAND HUD */}
          <header className="ref-stadium-hud">
            {/* Home Team Button (Clickable to switch pitch to Home) */}
            <button
              type="button"
              onClick={() => setActiveTeamId(activeMatch.homeTeam.id)}
              className={`hud-team-chip home ${activeTeamId === activeMatch.homeTeam.id ? 'active' : ''}`}
              title="Click to view Home team on pitch"
            >
              <span className="hud-team-logo">{activeMatch.homeTeam.logo}</span>
              <div className="hud-team-meta">
                <span className="hud-team-name">{activeMatch.homeTeam.shortName}</span>
                <span className="hud-team-role">HOME</span>
              </div>
              <span className="hud-team-score">{activeMatch.homeScore}</span>
            </button>

            {/* Scoreboard Center & Clock Fine Tuning */}
            <div className="hud-score-center">
              <div className="hud-score-row">
                <span className="hud-score-digit">{activeMatch.homeScore}</span>
                <span className="hud-score-divider">-</span>
                <span className="hud-score-digit">{activeMatch.awayScore}</span>
              </div>

              <div className="hud-status-row">
                <span className="hud-minute-pill">
                  <Clock size={12} />
                  <span>{activeMatch.minute}</span>
                </span>
                <span className={`ref-period-tag ${activeMatch.status.includes('HALF') ? 'live' : activeMatch.status === 'READY' ? 'ready' : 'ft'}`}>
                  {activeMatch.status.replace(/_/g, ' ')}
                </span>
                <div className="hud-clock-quick-btns">
                  <button type="button" onClick={() => handleAdjustMinute(-1)} title="Minus 1 min">-1'</button>
                  <button type="button" onClick={() => handleAdjustMinute(1)} title="Plus 1 min">+1'</button>
                  <button type="button" onClick={() => handleAdjustMinute(3)} className="stoppage" title="Plus 3 min stoppage">+3'</button>
                </div>
              </div>
            </div>

            {/* Away Team Button (Clickable to switch pitch to Away) */}
            <button
              type="button"
              onClick={() => setActiveTeamId(activeMatch.awayTeam.id)}
              className={`hud-team-chip away ${activeTeamId === activeMatch.awayTeam.id ? 'active' : ''}`}
              title="Click to view Away team on pitch"
            >
              <span className="hud-team-score">{activeMatch.awayScore}</span>
              <div className="hud-team-meta text-right">
                <span className="hud-team-name">{activeMatch.awayTeam.shortName}</span>
                <span className="hud-team-role">AWAY</span>
              </div>
              <span className="hud-team-logo">{activeMatch.awayTeam.logo}</span>
            </button>

            {/* Primary Whistle Action & Console Controls */}
            <div className="hud-actions-group">
              <button
                type="button"
                onClick={handleWhistleAction}
                className="hud-whistle-btn"
                title="Execute official whistle action"
              >
                {activeMatch.status === 'SCHEDULED' && '📋 Verify Readiness'}
                {activeMatch.status === 'READY' && '▶️ Kickoff 1st Half'}
                {activeMatch.status === 'FIRST_HALF' && '⏸️ Half-Time'}
                {activeMatch.status === 'HALF_TIME' && '▶️ Kickoff 2nd Half'}
                {activeMatch.status === 'SECOND_HALF' && '⏹️ Full-Time (End)'}
                {activeMatch.status === 'FULL_TIME_PENDING_REVIEW' && '📝 Sign & Publish'}
                {activeMatch.status === 'VERIFIED_PUBLISHED' && '✅ Report Published'}
              </button>

              {/* Fullscreen Stadium View Toggle */}
              <button
                type="button"
                onClick={toggleStadiumFullscreen}
                className={`hud-fullscreen-btn ${isStadiumFullscreen ? 'active' : ''}`}
                title={isStadiumFullscreen ? 'Exit Stadium Fullscreen Mode' : 'Enter Stadium Fullscreen Mode'}
              >
                {isStadiumFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                <span className="hud-fullscreen-label">{isStadiumFullscreen ? 'Exit Full' : 'Full Screen'}</span>
              </button>
            </div>
          </header>

          {/* MOBILE SEGMENTED TABS SWITCHER (< 900px screens) */}
          <div className="stadium-mobile-tabs">
            <button
              type="button"
              onClick={() => setMobileConsoleTab('pitch')}
              className={`stadium-tab-btn ${mobileConsoleTab === 'pitch' ? 'active' : ''}`}
            >
              ⚽ Pitch ({activeTeam?.shortName})
            </button>
            <button
              type="button"
              onClick={() => setMobileConsoleTab('bench')}
              className={`stadium-tab-btn ${mobileConsoleTab === 'bench' ? 'active' : ''}`}
            >
              🪑 Bench Substitutes
            </button>
            <button
              type="button"
              onClick={() => setMobileConsoleTab('events')}
              className={`stadium-tab-btn ${mobileConsoleTab === 'events' ? 'active' : ''}`}
            >
              📋 Live Log ({activeMatch.events.length})
            </button>
          </div>

          {/* UNIFIED ZERO-SCROLL STADIUM CONSOLE GRID */}
          <div className="stadium-console-grid">
            {/* COLUMN 1: INTERACTIVE TACTICAL PITCH (Always shown on desktop, tabbed on mobile) */}
            <div className={`stadium-pitch-panel ${mobileConsoleTab !== 'pitch' ? 'hide-on-mobile' : ''}`}>
              <RefereeTacticalPitch
                match={activeMatch}
                activeTeamId={activeTeamId}
                onSelectTeam={setActiveTeamId}
                onSelectPlayer={(player, isOnPitch) => setSelectedPlayerTarget({ player, isOnPitch })}
                hideBench={true}
              />
            </div>

            {/* COLUMN 2: SIDE PANEL (BENCH & AUDITABLE LIVE EVENTS SIDE-BY-SIDE) */}
            <div className={`stadium-side-panel ${mobileConsoleTab === 'pitch' ? 'hide-on-mobile' : ''}`}>
              {/* BENCH SUBSTITUTES SECTION */}
              <div className={`stadium-bench-section ${mobileConsoleTab === 'events' ? 'hide-on-mobile' : ''}`}>
                <RefereeBench
                  match={activeMatch}
                  activeTeamId={activeTeamId}
                  onSelectPlayer={(player, isOnPitch) => setSelectedPlayerTarget({ player, isOnPitch })}
                />
              </div>

              {/* LIVE EVENTS LOG & AUDIT TRAIL */}
              <div className={`stadium-events-section ${mobileConsoleTab === 'bench' ? 'hide-on-mobile' : ''}`}>
                <div className="stadium-events-header">
                  {/* Log vs Audit Trail Tabs */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setEventsPanelTab('log')}
                      className={`stadium-tab-btn ${eventsPanelTab === 'log' ? 'active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      📋 Live Log ({activeMatch.events.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventsPanelTab('audit')}
                      className={`stadium-tab-btn ${eventsPanelTab === 'audit' ? 'active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="View immutable governance audit trail"
                    >
                      <History size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      Audit Trail ({(activeMatch.auditLog || []).length})
                    </button>
                  </div>

                  {/* Filter chips (only active on log view) */}
                  {eventsPanelTab === 'log' && (
                    <div className="stadium-events-filter-strip">
                      {(['ALL', 'GOALS', 'CARDS', 'SUBS'] as const).map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setEventFilter(f)}
                          className={`stadium-filter-chip ${eventFilter === f ? 'active' : ''}`}
                        >
                          {f === 'GOALS' ? '⚽' : f === 'CARDS' ? '🟨' : f === 'SUBS' ? '🔄' : f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* VIEW A: AUDITABLE LIVE LOG */}
                {eventsPanelTab === 'log' && (
                  <div className="stadium-events-scroll-list">
                    {activeMatch.events.length === 0 ? (
                      <div className="stadium-events-empty">
                        <span>No events logged yet.</span>
                        <small>Tap any player on the pitch or bench to record an event.</small>
                      </div>
                    ) : (
                      activeMatch.events
                        .filter(ev => {
                          if (eventFilter === 'GOALS') return ev.type === 'goal';
                          if (eventFilter === 'CARDS') return ev.type.includes('card');
                          if (eventFilter === 'SUBS') return ev.type === 'substitution';
                          return true;
                        })
                        .slice()
                        .reverse()
                        .map(ev => {
                          const isWithinWindow = isEventWithinCorrectionWindow(ev.timestamp);
                          const remainingSecs = getCorrectionWindowRemainingSeconds(ev.timestamp);
                          const remMin = Math.floor(remainingSecs / 60);
                          const remSec = remainingSecs % 60;

                          return (
                            <div key={ev.id} className={`stadium-event-row ${ev.isVoided ? 'voided' : ''}`}>
                              <div className="stadium-event-info">
                                <span className="stadium-event-time">{ev.time}</span>
                                <span className="stadium-event-icon">
                                  {ev.type === 'goal' ? '⚽' : ev.type === 'yellow_card' ? '🟨' : ev.type === 'red_card' ? '🟥' : '🔄'}
                                </span>
                                <div className="stadium-event-text">
                                  <span className="stadium-event-actor">
                                    #{ev.playerNumber} {ev.playerName} ({ev.teamShortName})
                                  </span>
                                  <span className="stadium-event-detail">
                                    {ev.detail || ev.type}
                                  </span>
                                  {ev.isVoided && (
                                    <span className="stadium-event-void-tag">
                                      🚫 VOIDED: {ev.voidReason}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Legitimate Time-Window Aware Governance Action */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                {ev.isVoided ? (
                                  <span className="stadium-event-void-badge">
                                    Rescinded
                                  </span>
                                ) : isWithinWindow ? (
                                  <button
                                    type="button"
                                    onClick={() => setTargetVoidEvent(ev)}
                                    className="stadium-event-invalidate-btn"
                                    title={`Invalidate within grace window (${remMin}:${remSec.toString().padStart(2, '0')} remaining)`}
                                  >
                                    <ShieldAlert size={12} />
                                    <span>Void ({remMin}:{remSec.toString().padStart(2, '0')})</span>
                                  </button>
                                ) : (
                                  <span className="stadium-event-lock-tag" title="5-minute grace period expired. Event is permanently locked in governance records.">
                                    <Lock size={11} />
                                    <span>Locked</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                )}

                {/* VIEW B: IMMUTABLE AUDIT TRAIL LOG */}
                {eventsPanelTab === 'audit' && (
                  <div className="audit-trail-scroll-list">
                    {(activeMatch.auditLog || []).length === 0 ? (
                      <div className="stadium-events-empty">
                        <span>No audit entries logged yet.</span>
                      </div>
                    ) : (
                      (activeMatch.auditLog || [])
                        .slice()
                        .reverse()
                        .map(aud => (
                          <div key={aud.id} className="audit-trail-item">
                            <div className="audit-trail-item-top">
                              <span className={`audit-action-chip ${aud.action}`}>
                                {aud.action.replace(/_/g, ' ')}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                {new Date(aud.timestamp).toLocaleTimeString()}
                              </span>
                            </div>

                            <strong style={{ fontSize: '0.8rem', color: 'var(--stadium-white)', marginTop: '2px' }}>
                              {aud.summary}
                            </strong>

                            {aud.reason && (
                              <div style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: '1px' }}>
                                Reason: <strong>{aud.reason}</strong>
                              </div>
                            )}

                            {aud.details && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {aud.details}
                              </div>
                            )}

                            <span style={{ fontSize: '0.65rem', color: 'var(--nova-orange)', marginTop: '2px' }}>
                              By: {aud.officialName} ({aud.officialId})
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: EVENT LOG (STANDALONE FULL VIEW)               */}
      {/* ======================================================== */}
      {section === 'events' && activeMatch && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Official Event Log & Disciplinary Ledger</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Audited chronological record for {activeMatch.homeTeam.shortName} vs {activeMatch.awayTeam.shortName}
              </p>
            </div>

            {/* Event Filter Pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['ALL', 'GOALS', 'CARDS', 'SUBS'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setEventFilter(f)}
                  className={`ref-log-filter-btn ${eventFilter === f ? 'active' : ''}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="card-panel">
            {activeMatch.events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No events recorded yet for this fixture.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeMatch.events
                  .filter(ev => {
                    if (eventFilter === 'GOALS') return ev.type === 'goal';
                    if (eventFilter === 'CARDS') return ev.type.includes('card');
                    if (eventFilter === 'SUBS') return ev.type === 'substitution';
                    return true;
                  })
                  .map((ev, idx) => {
                    const isWithinWindow = isEventWithinCorrectionWindow(ev.timestamp);
                    const remainingSecs = getCorrectionWindowRemainingSeconds(ev.timestamp);

                    return (
                      <div
                        key={ev.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          background: 'var(--pitch-black)',
                          borderRadius: 'var(--radius-md)',
                          border: ev.isVoided ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                          opacity: ev.isVoided ? 0.65 : 1
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{idx + 1}</span>
                          <span className="ref-event-time-badge">
                            {ev.time}
                          </span>
                          <span style={{ fontSize: '1.4rem' }}>
                            {ev.type === 'goal' ? '⚽' : ev.type === 'yellow_card' ? '🟨' : ev.type === 'red_card' ? '🟥' : '🔄'}
                          </span>
                          <div>
                            <strong style={{ textDecoration: ev.isVoided ? 'line-through' : 'none' }}>
                              {ev.playerName} #{ev.playerNumber} ({ev.teamShortName})
                            </strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {ev.detail || ev.type} • Logged at {new Date(ev.timestamp).toLocaleTimeString()}
                            </div>
                            {ev.isVoided && (
                              <span className="stadium-event-void-tag" style={{ marginTop: '3px' }}>
                                🚫 VOIDED: {ev.voidReason}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          {ev.isVoided ? (
                            <span className="stadium-event-void-badge">Rescinded</span>
                          ) : isWithinWindow ? (
                            <button
                              type="button"
                              onClick={() => setTargetVoidEvent(ev)}
                              className="stadium-event-invalidate-btn"
                            >
                              <ShieldAlert size={13} /> Invalidate / Void ({Math.floor(remainingSecs / 60)}m left)
                            </button>
                          ) : (
                            <span className="stadium-event-lock-tag">
                              <Lock size={12} /> Locked (&gt; 5m)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: OFFICIAL PROFILE & REPORTS DOSSIER            */}
      {/* ======================================================== */}
      {(section === 'profile' || section === 'reports') && (
        <OfficialProfileView 
          officialId="off-1"
          activeMatch={activeMatch}
          onOpenReportModal={() => setShowReportModal(true)}
          onNavigateToLive={() => navigate('/workspace/official/operations')}
        />
      )}

      {/* ======================================================== */}
      {/* SECTION 5: PAST APPOINTMENTS                             */}
      {/* ======================================================== */}
      {section === 'history' && (
        <PastAppointmentsView 
          officialId="off-1" 
          onNavigateToLive={() => navigate('/workspace/official/operations')} 
        />
      )}

      {/* FAST 1-2 TAP PLAYER ACTION DRAWER / MODAL */}
      {selectedPlayerTarget && activeMatch && (
        <PlayerActionModal
          player={selectedPlayerTarget.player}
          isOnPitch={selectedPlayerTarget.isOnPitch}
          match={activeMatch}
          currentMinute={activeMatch.minute}
          onConfirmGoal={handleConfirmGoal}
          onConfirmCard={handleConfirmCard}
          onConfirmSub={handleConfirmSub}
          onClose={() => setSelectedPlayerTarget(null)}
        />
      )}

      {/* AUDITED INVALIDATION MODAL */}
      {targetVoidEvent && activeMatch && (
        <VoidEventModal
          event={targetVoidEvent}
          match={activeMatch}
          onConfirmVoid={handleConfirmVoid}
          onClose={() => setTargetVoidEvent(null)}
        />
      )}

      {/* OFFICIAL MATCH SIGN-OFF MODAL */}
      {showReportModal && activeMatch && (
        <SignReportModal
          match={activeMatch}
          onConfirm={handleConfirmReport}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
