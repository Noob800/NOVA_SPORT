import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Activity, Users, FileText, BarChart2, Award } from 'lucide-react';
import { matchStore, type OfficialMatchData } from '../../services/matchStore';
import { teamDeskStore, type SquadPlayer, type Formation } from '../../services/teamDeskStore';
import { TacticalBoard } from '../team/components/TacticalBoard';
import '../team/TeamDesk.css';
import './MatchCenter.css';

export function MatchCenter() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'timeline' | 'lineups' | 'stats' | 'report'>('timeline');
  const [, setTick] = useState(0);

  useEffect(() => {
    return matchStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const match: OfficialMatchData = matchStore.getMatchById(id || '') || matchStore.getAllMatches()[0];
  const [activeLineupTeamId, setActiveLineupTeamId] = useState<string>(match?.homeTeam?.id || '');

  useEffect(() => {
    if (match?.homeTeam?.id && (!activeLineupTeamId || (activeLineupTeamId !== match.homeTeam.id && activeLineupTeamId !== match.awayTeam.id))) {
      setActiveLineupTeamId(match.homeTeam.id);
    }
  }, [match?.homeTeam?.id, match?.awayTeam?.id]);

  const isLive = ['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF', 'FULL_TIME_PENDING_REVIEW'].includes(match.status);

  return (
    <div className="match-center-container">
      <div className="mc-header">
        <button onClick={() => window.history.back()} className="icon-button"><ChevronLeft size={20} /></button>
        <Link to={`/competitions/${match.competition?.id}`} className="competition-tag" style={{ textDecoration: 'none', color: 'inherit' }}>
          {match.competition?.name || 'KeMU Super League'}
        </Link>
        <button className="icon-button"><Info size={20} /></button>
      </div>

      <div className="mc-scoreboard card-panel">
        <div className="mc-status">
          <span className={`status-badge ${isLive ? 'live-badge' : ''}`}>
            {isLive ? 'LIVE' : match.status.replace(/_/g, ' ')}
          </span>
          <span className="mc-time tabular-nums">{match.minute || match.date} {match.time && `• ${match.time}`}</span>
        </div>
        <div className="mc-teams">
          <Link to={`/teams/${match.homeTeam.id}`} className="mc-team" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="team-logo-large">{match.homeTeam.logo}</div>
            <h2>{match.homeTeam.name}</h2>
          </Link>
          <div className="mc-score-display">
            {match.status === 'SCHEDULED' || match.status === 'READY' ? (
              <span className="score-divider">vs</span>
            ) : (
              <>
                <span className="tabular-nums">{match.homeScore}</span>
                <span className="score-divider">-</span>
                <span className="tabular-nums">{match.awayScore}</span>
              </>
            )}
          </div>
          <Link to={`/teams/${match.awayTeam.id}`} className="mc-team" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="team-logo-large">{match.awayTeam.logo}</div>
            <h2>{match.awayTeam.name}</h2>
          </Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {match.venue}
        </div>
      </div>

      <div className="matches-tabs" style={{ marginTop: 'var(--space-6)' }}>
        <button className={`tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}><Activity size={16} style={{ display: 'inline', marginRight: '8px' }}/> Timeline ({match.events.length})</button>
        <button className={`tab ${activeTab === 'lineups' ? 'active' : ''}`} onClick={() => setActiveTab('lineups')}><Users size={16} style={{ display: 'inline', marginRight: '8px' }}/> Lineups</button>
        <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><BarChart2 size={16} style={{ display: 'inline', marginRight: '8px' }}/> Stats</button>
        <button className={`tab ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}><FileText size={16} style={{ display: 'inline', marginRight: '8px' }}/> Official Report</button>
      </div>

      <div className="mc-content">
        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="timeline">
            {match.events.length === 0 ? (
              <div className="empty-state">
                <p className="text-muted">No timeline events recorded yet. Match officials will stream events pitchside in real time.</p>
              </div>
            ) : (
              match.events.slice().reverse().map(event => (
                <div key={event.id} className="timeline-event">
                  <div className="event-time tabular-nums">{event.time}</div>
                  <div className={`event-icon ${event.type === 'goal' ? 'bg-green' : event.type.includes('card') ? 'bg-yellow' : ''}`}>
                    {event.type === 'goal' ? '⚽' : event.type === 'yellow_card' ? '🟨' : event.type === 'red_card' ? '🟥' : '🔄'}
                  </div>
                  <div className="event-detail">
                    <strong>
                      {event.type === 'goal' ? 'Goal' : event.type === 'yellow_card' ? 'Yellow Card' : event.type === 'red_card' ? 'Red Card' : 'Substitution'}:{' '}
                    </strong>
                    <Link to={`/players/${event.playerId}`} style={{ textDecoration: 'none', color: 'var(--nova-orange)', fontWeight: 600 }}>
                      {event.playerName} #{event.playerNumber}
                    </Link>{' '}
                    ({event.teamShortName})
                    {event.detail && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                        {event.detail}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* LINEUPS TAB: COACH TACTICAL BOARD & OFFICIAL ROSTER */}
        {activeTab === 'lineups' && (() => {
          const currentLineup = matchStore.getMatchLineup(match.id, activeLineupTeamId);
          const activeTeamRoster = matchStore.getTeamRoster(activeLineupTeamId);
          const activeTeamDeskSquad = teamDeskStore.getPlayers(activeLineupTeamId);

          const squadForBoard: SquadPlayer[] = activeTeamDeskSquad && activeTeamDeskSquad.length > 0
            ? activeTeamDeskSquad
            : activeTeamRoster.map(r => ({
                id: r.id,
                name: r.name,
                number: r.number,
                position: (['GK', 'DF', 'MF', 'FW'].includes(r.position) ? r.position : 'MF') as 'GK' | 'DF' | 'MF' | 'FW',
                teamId: r.teamId,
                avatar: r.avatar || '⚽',
                age: 22,
                joinedDate: '2024-01-01',
                availability: 'FIT',
                eligibility: 'ELIGIBLE',
                trainingAttendance: 95,
                appearances: 10,
                starts: 8,
                minutes: 720,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0
              } as SquadPlayer));

          const lineupStarters = (currentLineup.starters && currentLineup.starters.length > 0)
            ? currentLineup.starters
            : squadForBoard.slice(0, 11).map(p => p.id);

          const lineupSubs = (currentLineup.subs && currentLineup.subs.length > 0)
            ? currentLineup.subs
            : squadForBoard.slice(11, 18).map(p => p.id);

          const lineupFormation = (currentLineup.formation as Formation) || '4-3-3';

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Team Toggle Bar */}
              <div className="mc-lineup-team-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveLineupTeamId(match.homeTeam.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: activeLineupTeamId === match.homeTeam.id ? 'var(--pitch-black)' : 'var(--surface-elevated)',
                    border: `2px solid ${activeLineupTeamId === match.homeTeam.id ? 'var(--nova-orange)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--stadium-white)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{match.homeTeam.logo}</span>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ fontSize: '0.92rem', display: 'block' }}>{match.homeTeam.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: activeLineupTeamId === match.homeTeam.id ? 'var(--nova-orange)' : 'var(--text-muted)', fontWeight: 600 }}>
                      Home • {matchStore.getMatchLineup(match.id, match.homeTeam.id).formation || '4-3-3'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLineupTeamId(match.awayTeam.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: activeLineupTeamId === match.awayTeam.id ? 'var(--pitch-black)' : 'var(--surface-elevated)',
                    border: `2px solid ${activeLineupTeamId === match.awayTeam.id ? 'var(--nova-orange)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--stadium-white)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{match.awayTeam.logo}</span>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ fontSize: '0.92rem', display: 'block' }}>{match.awayTeam.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: activeLineupTeamId === match.awayTeam.id ? 'var(--nova-orange)' : 'var(--text-muted)', fontWeight: 600 }}>
                      Away • {matchStore.getMatchLineup(match.id, match.awayTeam.id).formation || '4-3-3'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Exact Field View Component Used In Coach (TacticalBoard) */}
              <div className="card-panel" style={{ padding: '16px' }}>
                <TacticalBoard
                  formation={lineupFormation}
                  starters={lineupStarters}
                  subs={lineupSubs}
                  captainId={currentLineup.captainId}
                  squad={squadForBoard}
                  readOnly={true}
                />
              </div>

              {/* Official Squad Roster List for Active Team */}
              <div className="card-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{activeLineupTeamId === match.homeTeam.id ? match.homeTeam.logo : match.awayTeam.logo}</span>
                    <span>{activeLineupTeamId === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name} Official Roster</span>
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {squadForBoard.length} Registered Players
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
                  {squadForBoard.map(p => {
                    const isStarter = lineupStarters.includes(p.id);
                    const isSub = lineupSubs.includes(p.id);
                    const isCaptain = currentLineup.captainId === p.id;
                    const stats = matchStore.getPlayerMatchStats(match.id, p.id);

                    return (
                      <Link
                        key={p.id}
                        to={`/players/${p.id}`}
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'var(--pitch-black)',
                          borderRadius: 'var(--radius-sm)',
                          border: isStarter ? '1px solid rgba(255, 94, 0, 0.3)' : '1px solid var(--border-subtle)',
                          color: 'var(--stadium-white)',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            color: isStarter ? 'var(--nova-orange)' : 'var(--text-muted)',
                            width: '24px'
                          }}>
                            #{p.number}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {p.name}
                              {isCaptain && <span style={{ background: 'var(--nova-orange)', color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '0 4px', borderRadius: '2px' }}>C</span>}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.position}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {stats.goals > 0 && <span title={`${stats.goals} Goal(s)`}>⚽{stats.goals > 1 ? stats.goals : ''}</span>}
                          {stats.yellowCards > 0 && stats.redCards === 0 && <span title="Yellow card">🟨</span>}
                          {stats.redCards > 0 && <span title="Red card">🟥</span>}
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)',
                            background: isStarter ? 'rgba(16, 185, 129, 0.15)' : isSub ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: isStarter ? '#10b981' : isSub ? '#3b82f6' : 'var(--text-muted)'
                          }}>
                            {isStarter ? 'Starter' : isSub ? 'Sub' : 'Reserve'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="card-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h4 style={{ margin: '0 0 16px 0', textAlign: 'center' }}>Match Comparison</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <strong>{match.events.filter(e => e.type === 'goal' && e.teamId === match.homeTeam.id).length}</strong>
                <span style={{ color: 'var(--text-muted)' }}>Goals</span>
                <strong>{match.events.filter(e => e.type === 'goal' && e.teamId === match.awayTeam.id).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <strong>{match.events.filter(e => e.type === 'yellow_card' && e.teamId === match.homeTeam.id).length}</strong>
                <span style={{ color: 'var(--text-muted)' }}>Yellow Cards</span>
                <strong>{match.events.filter(e => e.type === 'yellow_card' && e.teamId === match.awayTeam.id).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <strong>{match.events.filter(e => e.type === 'red_card' && e.teamId === match.homeTeam.id).length}</strong>
                <span style={{ color: 'var(--text-muted)' }}>Red Cards</span>
                <strong>{match.events.filter(e => e.type === 'red_card' && e.teamId === match.awayTeam.id).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <strong>{match.events.filter(e => e.type === 'substitution' && e.teamId === match.homeTeam.id).length}</strong>
                <span style={{ color: 'var(--text-muted)' }}>Substitutions</span>
                <strong>{match.events.filter(e => e.type === 'substitution' && e.teamId === match.awayTeam.id).length}</strong>
              </div>
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card-panel" style={{ borderLeft: `4px solid ${match.report?.isPublished ? '#10B981' : 'var(--nova-orange)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="status-badge" style={{ background: match.report?.isPublished ? '#10B981' : 'var(--nova-orange)', color: '#000', fontWeight: 800 }}>
                    {match.report?.isPublished ? 'OFFICIALLY VERIFIED & PUBLISHED' : 'PRELIMINARY MATCH RECORD'}
                  </span>
                  <h3 style={{ margin: '8px 0 4px 0' }}>
                    Official Matchday Record • {match.homeScore} - {match.awayScore}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Referee Appointed: {match.officials[0]?.name || 'James Mwita'} • {match.venue}
                  </div>
                </div>

                {match.report?.leadOfficialSignature && (
                  <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Signed by:</div>
                    <strong style={{ color: 'var(--nova-orange)' }}>{match.report.leadOfficialSignature}</strong>
                  </div>
                )}
              </div>

              {match.report?.refereeNotes && (
                <div style={{ marginTop: '14px', padding: '10px 12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Referee Match Remarks:</div>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>{match.report.refereeNotes}</p>
                </div>
              )}
            </div>

            {/* Appointed Officials Roll */}
            <div className="card-panel">
              <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="var(--nova-orange)" /> Appointed Match Officials
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {match.officials.map(off => (
                  <div key={off.id} style={{ padding: '8px 12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
                    <strong>{off.name}</strong>
                    <div style={{ color: 'var(--nova-orange)', fontSize: '0.72rem' }}>{off.role}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{off.badge}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
