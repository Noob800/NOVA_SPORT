import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Star, UserX } from 'lucide-react';
import { adminStore } from '../../services/adminStore';
import { matchStore } from '../../services/matchStore';
import './PlayerProfile.css';

export function PlayerProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'matches'>('overview');
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubAdmin = adminStore.subscribe(() => setTick(t => t + 1));
    const unsubMatch = matchStore.subscribe(() => setTick(t => t + 1));
    return () => {
      unsubAdmin();
      unsubMatch();
    };
  }, []);

  const player = adminStore.getPlayerById(id || '') || adminStore.getPlayers()[0];
  const team = player ? adminStore.getTeamById(player.teamId) : undefined;
  const playerMatches = matchStore.getAllMatches().filter(m => 
    team && (m.homeTeam.id === team.id || m.awayTeam.id === team.id) &&
    m.events.some(e => e.playerId === player?.id && !e.isVoided)
  );

  if (!player) {
    return (
      <div className="player-profile-container" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <UserX size={48} className="icon-orange" style={{ margin: '0 auto var(--space-4)' }} />
        <h2>Player Not Found</h2>
        <p className="text-muted">The requested player record was not found in the official registry.</p>
        <button onClick={() => window.history.back()} className="view-all-btn" style={{ marginTop: 'var(--space-4)' }}>
          Go Back
        </button>
      </div>
    );
  }

  const avatarEmoji = player.position === 'GK' ? '🧤' : player.position === 'DF' ? '🛡️' : player.position === 'MF' ? '⚡' : '⚽';

  return (
    <div className="player-profile-container">
      <div className="tp-header-nav">
        <button onClick={() => window.history.back()} className="icon-button"><ChevronLeft size={20} /></button>
        <button className="follow-btn"><Star size={16} /> Follow Player</button>
      </div>

      <header className="pp-header">
        <div className="pp-avatar-container">
          <div className="pp-avatar">{avatarEmoji}</div>
        </div>
        <div className="pp-title">
          <h1>{player.name}</h1>
          <p className="pp-team">#{player.number} • {player.position} • {team?.name || 'Club'}</p>
        </div>
      </header>

      <div className="comp-nav">
        <button className={`comp-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`comp-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
        <button className={`comp-tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>Matches</button>
      </div>

      <div className="tp-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <section className="card-panel">
              <div className="panel-header">
                <h3>Season Stats</h3>
                <span className="text-muted text-sm">{team?.division || 'KeMU Super League 2026/27'}</span>
              </div>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Appearances</span>
                  <span className="stat-value tabular-nums">{player.appearances || 0}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Goals</span>
                  <span className="stat-value tabular-nums">{player.goals || 0}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Assists</span>
                  <span className="stat-value tabular-nums">{player.assists || 0}</span>
                </div>
              </div>
            </section>

            <section className="card-panel">
              <div className="panel-header">
                <h3>Discipline & Eligibility</h3>
              </div>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-box">
                  <div className="card-icon yellow"></div>
                  <span className="stat-label">Yellow Cards</span>
                  <span className="stat-value tabular-nums">{player.yellowCards || 0}</span>
                </div>
                <div className="stat-box">
                  <div className="card-icon red"></div>
                  <span className="stat-label">Red Cards</span>
                  <span className="stat-value tabular-nums">{player.redCards || 0}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Status</span>
                  <span className="stat-value" style={{ fontSize: '1rem', color: player.eligibility === 'ELIGIBLE' ? '#10b981' : '#f59e0b' }}>
                    {player.eligibility === 'ELIGIBLE' ? 'Approved' : player.eligibility}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="overview-grid">
            <section className="card-panel">
              <div className="panel-header">
                <h3>Detailed Statistics</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', padding: 'var(--space-2) 0' }}>
                <div className="stat-box">
                  <span className="stat-label">Clean Sheets</span>
                  <span className="stat-value tabular-nums">{player.cleanSheets || 0}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Age</span>
                  <span className="stat-value tabular-nums">{player.age || 20}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="overview-grid">
            <section className="card-panel">
              <div className="panel-header">
                <h3>Match Involvements</h3>
              </div>
              {playerMatches.length === 0 ? (
                <p className="text-muted text-sm" style={{ padding: 'var(--space-3) 0' }}>
                  No match timeline events logged for this player yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {playerMatches.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span>{m.homeTeam.shortName} {m.homeScore} - {m.awayScore} {m.awayTeam.shortName}</span>
                      <span className="text-orange text-sm">{m.events.filter(e => e.playerId === player.id).map(e => e.detail || e.type).join(', ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
