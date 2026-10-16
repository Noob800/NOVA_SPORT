import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockPlayers, mockTeams, mockUpcomingMatches } from '../../mockData';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Calendar, Trophy, Users, AlertCircle, ChevronRight,
  CheckCircle2, ShieldCheck, Key, AlertTriangle, ArrowRight, Shield
} from 'lucide-react';
import { teamDeskStore } from '../../services/teamDeskStore';

export function PlayerView() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlInvite = searchParams.get('invite') || '';

  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'matches' | 'team' | 'career'>('overview');

  // Invitation code state
  const [inviteCodeInput, setInviteCodeInput] = useState(urlInvite);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [invitationSuccess, setInvitationSuccess] = useState<string | null>(null);
  const [claimedSpot, setClaimedSpot] = useState<{
    teamName: string;
    number: number;
    position: string;
  } | null>(null);

  // Auto-detect invitation if present in URL
  const pendingInviteDetails = inviteCodeInput.trim()
    ? teamDeskStore.getInvitationDetails(inviteCodeInput.trim())
    : null;

  useEffect(() => {
    if (urlInvite) {
      setInviteCodeInput(urlInvite);
    }
  }, [urlInvite]);

  const handleClaimInvitation = (codeToClaim: string) => {
    setInvitationError(null);
    setInvitationSuccess(null);

    if (!codeToClaim.trim()) {
      setInvitationError('Please enter a valid invitation code.');
      return;
    }

    const res = teamDeskStore.acceptPlayerInvitation(codeToClaim, {
      name: user?.name,
      email: user?.email,
      userId: user?.id
    });

    if (!res.success || !res.player) {
      setInvitationError(res.error || 'Invalid or expired invitation code.');
      return;
    }

    const teamProfile = teamDeskStore.getProfile(res.player.teamId);
    setClaimedSpot({
      teamName: teamProfile.name,
      number: res.player.number,
      position: res.player.position
    });

    setInvitationSuccess(`Successfully claimed roster spot for ${teamProfile.name} (#${res.player.number} ${res.player.position})!`);
  };

  // Resolve active player record
  const player = mockPlayers.find(p => p.id === user?.linkedPlayerId) || mockPlayers[0];
  const team = mockTeams.find(t => t.id === player.teamId);
  const nextMatch = mockUpcomingMatches.find(m => m.homeTeam.id === team?.id || m.awayTeam.id === team?.id);

  return (
    <div className="player-view">
      {/* Sub Navigation */}
      <div className="comp-nav" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
        <button className={`comp-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`comp-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>My Stats</button>
        <button className={`comp-tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>My Matches</button>
        <button className={`comp-tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>My Team</button>
        <button className={`comp-tab ${activeTab === 'career' ? 'active' : ''}`} onClick={() => setActiveTab('career')}>Career</button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="overview-grid">
          
          {/* Active Club Affiliation Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="team-logo-medium">{team?.logo || <Users size={24} />}</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                  {claimedSpot ? claimedSpot.teamName : (team?.name || 'Unattached Player')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} /> Official Verified Squad Roster
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
                  <span style={{ color: 'var(--nova-orange)', fontWeight: 700, fontSize: '0.82rem' }}>
                    #{claimedSpot ? claimedSpot.number : player.number} ({claimedSpot ? claimedSpot.position : player.position})
                  </span>
                </div>
              </div>
            </div>
            <Link to={`/players/${player.id}`} className="view-all" style={{ padding: '6px 14px', border: '1px solid var(--nova-orange)', borderRadius: '20px', color: 'var(--nova-orange)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
              Public Profile ➜
            </Link>
          </div>

          {/* SQUAD INVITATION CLAIM & REGISTRATION CARD */}
          <section className="card-panel" style={{ border: '1px solid rgba(56, 189, 248, 0.4)', background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.06) 0%, rgba(10, 10, 10, 0.6) 100%)' }}>
            <div className="panel-header" style={{ marginBottom: '10px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                <Key size={18} /> Official Team Invitation & Roster Activation
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--stadium-white)', margin: '0 0 14px', lineHeight: 1.5 }}>
              Teams in NovaSport are authoritative club organizations managed directly by League Admins and Club Coaches. Players cannot self-assign or join teams arbitrarily. To join a roster, you must receive an email invitation code from your club coach.
            </p>

            {/* Error Message */}
            {invitationError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} />
                <span>{invitationError}</span>
              </div>
            )}

            {/* Success Message */}
            {invitationSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} />
                <span>{invitationSuccess}</span>
              </div>
            )}

            {/* Active Code Preview if found in store */}
            {pendingInviteDetails && !invitationSuccess && (
              <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid #38bdf8', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      INVITATION CONFIRMED
                    </span>
                    <h4 style={{ margin: '4px 0 2px', fontSize: '1.1rem' }}>
                      {pendingInviteDetails.team.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Invited as #{pendingInviteDetails.player.number} ({pendingInviteDetails.player.position}) • Reserved Email: {pendingInviteDetails.player.email}
                    </p>
                  </div>

                  <button
                    onClick={() => handleClaimInvitation(pendingInviteDetails.player.inviteCode || inviteCodeInput)}
                    className="login-button"
                    style={{ background: '#38bdf8', color: '#000', fontWeight: 800, padding: '8px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Confirm & Claim Spot <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Manual Code Input */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem', textTransform: 'uppercase' }}
                  placeholder="Enter Invitation Code (e.g. INV-WARRIORS-1024)"
                  value={inviteCodeInput}
                  onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                />
              </div>

              <button
                type="button"
                onClick={() => handleClaimInvitation(inviteCodeInput)}
                className="login-button"
                style={{ padding: '10px 18px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                Verify & Activate
              </button>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={13} color="var(--nova-orange)" />
              <span>Squad Protection Policy: Players cannot jump between or claim arbitrary teams. Invitations require club coach dispatch.</span>
            </div>
          </section>

          {/* VERIFIED PLAYER STATISTICS */}
          <section className="card-panel">
            <div className="panel-header">
              <h3><Trophy size={18} /> Authoritative Competition Statistics</h3>
            </div>
            {player.appearances !== undefined && player.appearances > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-2)', textAlign: 'center' }}>
                <div style={{ background: 'var(--pitch-black)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--stadium-white)' }}>{player.appearances}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MATCHES</div>
                </div>
                <div style={{ background: 'var(--pitch-black)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--nova-orange)' }}>{player.goals}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GOALS</div>
                </div>
                <div style={{ background: 'var(--pitch-black)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--stadium-white)' }}>{player.assists}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ASSISTS</div>
                </div>
                <div style={{ background: 'var(--pitch-black)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f59e0b' }}>{player.yellowCards}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YELLOWS</div>
                </div>
                <div style={{ background: 'var(--pitch-black)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#10b981' }}>96%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TRAIN ATT.</div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', padding: 'var(--space-4) 0', textAlign: 'center' }}>
                No verified statistics recorded for the current season.
              </div>
            )}
          </section>

          {/* NEXT FIXTURE */}
          {nextMatch && (
            <section className="card-panel">
              <div className="panel-header">
                <h3><Calendar size={18} /> Upcoming Scheduled Fixture</h3>
              </div>
              <Link to={`/matches/${nextMatch.id}`} className="match-card-expanded" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="expanded-header">
                  <span className="match-status tabular-nums">{nextMatch.date} • {nextMatch.time}</span>
                </div>
                <div className="match-scoreboard">
                  <div className="team">
                    <span className="team-logo-medium">{nextMatch.homeTeam.logo}</span>
                    <span style={{ fontWeight: 600, textAlign: 'center' }}>{nextMatch.homeTeam.shortName}</span>
                  </div>
                  <div className="score-wrapper">
                    <span className="score-divider">vs</span>
                  </div>
                  <div className="team">
                    <span className="team-logo-medium">{nextMatch.awayTeam.logo}</span>
                    <span style={{ fontWeight: 600, textAlign: 'center' }}>{nextMatch.awayTeam.shortName}</span>
                  </div>
                </div>
                <div className="expanded-footer">
                  <span className="competition-name">{nextMatch.venue || 'TBA'}</span>
                  <ChevronRight size={16} className="chevron" />
                </div>
              </Link>
            </section>
          )}

          {/* TEAM NOTICES */}
          <section className="card-panel">
            <div className="panel-header">
              <h3><AlertCircle size={18} /> Official Team Bulletin</h3>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'rgba(255, 94, 0, 0.08)', border: '1px solid rgba(255, 94, 0, 0.25)', borderRadius: 'var(--radius-md)', color: 'var(--stadium-white)' }}>
              <strong>Matchday Protocol:</strong> All squad members must arrive 90 minutes prior to kickoff at {nextMatch ? nextMatch.venue : 'the stadium'}. Kit assignments and tactical sheets will be reviewed in the dressing room.
            </div>
          </section>
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="overview-grid">
          <div className="card-panel">
            <div className="panel-header">
              <h3>Season Performance Analysis</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--pitch-black)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starts / Subs</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--stadium-white)', marginTop: '4px' }}>18 Starts • 0 Subs</div>
              </div>
              <div style={{ background: 'var(--pitch-black)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minutes Played</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--stadium-white)', marginTop: '4px' }}>1,580 mins</div>
              </div>
              <div style={{ background: 'var(--pitch-black)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Goal Involvement</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--nova-orange)', marginTop: '4px' }}>16 (12G, 4A)</div>
              </div>
              <div style={{ background: 'var(--pitch-black)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disciplinary Record</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>1 Yellow • 0 Reds</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MATCHES TAB */}
      {activeTab === 'matches' && (
        <div className="overview-grid">
          <div className="card-panel">
            <div className="panel-header">
              <h3>Match Roster Participation</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Showing matches certified by accredited league match officials.
            </p>
            {nextMatch && (
              <div style={{ background: 'var(--surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{nextMatch.homeTeam.name} vs {nextMatch.awayTeam.name}</strong>
                  <span style={{ color: 'var(--nova-orange)', fontSize: '0.8rem', fontWeight: 700 }}>Upcoming</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {nextMatch.date} • {nextMatch.time} • {nextMatch.venue}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {activeTab === 'team' && (
        <div className="overview-grid">
          <div className="card-panel">
            <div className="panel-header">
              <h3>Club Registration & Roster Status</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
              You are currently registered with <strong>{claimedSpot ? claimedSpot.teamName : (team?.name || 'Meru Warriors')}</strong> in the KeMU Super League.
            </p>
            <div style={{ background: 'var(--pitch-black)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                <ShieldCheck size={18} /> Verified Player Contract on File
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Transfers or squad modifications require mutual release by the Club Head Coach and League Administrator approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CAREER TAB */}
      {activeTab === 'career' && (
        <div className="overview-grid">
          <div className="card-panel">
            <div className="panel-header">
              <h3>Verified Player Career History</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--nova-orange)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>2025/2026 Season • {claimedSpot ? claimedSpot.teamName : (team?.name || 'Meru Warriors')}</strong>
                  <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>ACTIVE</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  KeMU Super League • 18 Apps, 12 Goals • Jersey #{claimedSpot ? claimedSpot.number : player.number}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
