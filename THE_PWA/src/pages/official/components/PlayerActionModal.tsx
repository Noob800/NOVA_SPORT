import { useState } from 'react';
import type { OfficialMatchData, TeamRosterPlayer } from '../../../services/matchStore';
import { matchStore } from '../../../services/matchStore';
import { X, ArrowRightLeft, ShieldAlert } from 'lucide-react';

interface PlayerActionModalProps {
  player: TeamRosterPlayer;
  isOnPitch: boolean;
  match: OfficialMatchData;
  currentMinute: string;
  onConfirmGoal: (goalData: {
    teamId: string;
    teamName: string;
    teamShortName: string;
    teamLogo: string;
    playerId: string;
    playerName: string;
    playerNumber: number;
    time: string;
    detail: string;
  }) => void;
  onConfirmCard: (cardData: {
    teamId: string;
    teamName: string;
    teamShortName: string;
    teamLogo: string;
    playerId: string;
    playerName: string;
    playerNumber: number;
    time: string;
    type: 'yellow_card' | 'red_card';
    detail: string;
  }) => void;
  onConfirmSub: (subData: {
    teamId: string;
    teamName: string;
    teamShortName: string;
    teamLogo: string;
    playerId: string;
    playerName: string;
    playerNumber: number;
    subPlayerId: string;
    subPlayerName: string;
    subPlayerNumber: number;
    time: string;
    detail?: string;
  }) => void;
  onClose: () => void;
}

export function PlayerActionModal({
  player,
  isOnPitch,
  match,
  currentMinute,
  onConfirmGoal,
  onConfirmCard,
  onConfirmSub,
  onClose
}: PlayerActionModalProps) {
  const isHome = player.teamId === match.homeTeam.id;
  const team = isHome ? match.homeTeam : match.awayTeam;
  const currentLineup = matchStore.getMatchLineup(match.id, player.teamId);
  const currentRoster = matchStore.getTeamRoster(player.teamId);
  const playerStats = matchStore.getPlayerMatchStats(match.id, player.id);

  // Active action mode inside drawer
  const [selectedAction, setSelectedAction] = useState<'GOAL' | 'YELLOW' | 'RED' | 'SUB'>('GOAL');
  const [minute, setMinute] = useState<string>(currentMinute.replace("'", '') || '1');

  // Goal options
  const [goalType, setGoalType] = useState<string>('Open Play');

  // Card options
  const [yellowReason, setYellowReason] = useState<string>('Tactical Foul / Stopping Attack');
  const [redReason, setRedReason] = useState<string>('Serious Foul Play / Reckless Challenge');

  // Sub options:
  // If player is on pitch, we choose an incoming sub from bench
  // If player is on bench, we choose an outgoing starter from pitch
  const benchPlayers = (currentLineup.subs || [])
    .map(id => currentRoster.find(p => p.id === id))
    .filter((p): p is TeamRosterPlayer => !!p);

  const pitchPlayers = (currentLineup.starters || [])
    .map(id => currentRoster.find(p => p.id === id))
    .filter((p): p is TeamRosterPlayer => !!p);

  const [selectedSubPartnerId, setSelectedSubPartnerId] = useState<string>(
    isOnPitch ? benchPlayers[0]?.id || '' : pitchPlayers[0]?.id || ''
  );

  const selectedPartner = currentRoster.find(p => p.id === selectedSubPartnerId);

  // Handlers
  const handleExecuteGoal = () => {
    onConfirmGoal({
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      teamLogo: team.logo,
      playerId: player.id,
      playerName: player.name,
      playerNumber: player.number,
      time: `${minute}'`,
      detail: goalType
    });
  };

  const handleExecuteYellow = () => {
    const isSecondYellow = playerStats.yellowCards >= 1;
    onConfirmCard({
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      teamLogo: team.logo,
      playerId: player.id,
      playerName: player.name,
      playerNumber: player.number,
      time: `${minute}'`,
      type: isSecondYellow ? 'red_card' : 'yellow_card',
      detail: isSecondYellow 
        ? `Second Caution (2nd Yellow) ➡️ Red Card: ${yellowReason}`
        : `Yellow Card: ${yellowReason}`
    });
  };

  const handleExecuteRed = () => {
    onConfirmCard({
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      teamLogo: team.logo,
      playerId: player.id,
      playerName: player.name,
      playerNumber: player.number,
      time: `${minute}'`,
      type: 'red_card',
      detail: `Direct Red Card: ${redReason}`
    });
  };

  const handleExecuteSub = () => {
    if (!selectedPartner) return;
    
    // Outgoing is starter, incoming is sub
    const outPlayer = isOnPitch ? player : selectedPartner;
    const inPlayer = isOnPitch ? selectedPartner : player;

    onConfirmSub({
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      teamLogo: team.logo,
      playerId: outPlayer.id,
      playerName: outPlayer.name,
      playerNumber: outPlayer.number,
      subPlayerId: inPlayer.id,
      subPlayerName: inPlayer.name,
      subPlayerNumber: inPlayer.number,
      time: `${minute}'`,
      detail: `OUT: #${outPlayer.number} ${outPlayer.name} ➡️ IN: #${inPlayer.number} ${inPlayer.name}`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-panel ref-action-drawer" 
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header: Player Card Profile */}
        <div className="ref-drawer-header">
          <div className="ref-drawer-player-profile">
            <div className="ref-drawer-jersey-avatar">
              <span>{player.number}</span>
              <span className="ref-drawer-team-badge">{team.logo}</span>
            </div>

            <div className="ref-drawer-player-meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong className="ref-drawer-player-name">{player.name}</strong>
                {currentLineup.captainId === player.id && (
                  <span className="ref-captain-tag">CAPTAIN</span>
                )}
              </div>
              <div className="ref-drawer-player-sub">
                <span>{team.name}</span>
                <span>•</span>
                <span>{player.position}</span>
                <span>•</span>
                <span className={isOnPitch ? 'status-pitch' : 'status-bench'}>
                  {isOnPitch ? 'Active on Pitch' : 'Substitutes Bench'}
                </span>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="ref-drawer-close-btn"
            title="Close action drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Player Current Match Track Record Badges */}
        <div className="ref-drawer-stats-strip">
          <div className="ref-stat-chip">
            <span style={{ fontSize: '1.1rem' }}>⚽</span>
            <span>{playerStats.goals} {playerStats.goals === 1 ? 'Goal' : 'Goals'}</span>
          </div>

          <div className={`ref-stat-chip ${playerStats.yellowCards > 0 ? 'active-yellow' : ''}`}>
            <span style={{ fontSize: '1.1rem' }}>🟨</span>
            <span>{playerStats.yellowCards} {playerStats.yellowCards === 1 ? 'Caution' : 'Cautions'}</span>
          </div>

          <div className={`ref-stat-chip ${playerStats.redCards > 0 ? 'active-red' : ''}`}>
            <span style={{ fontSize: '1.1rem' }}>🟥</span>
            <span>{playerStats.redCards > 0 ? 'Sent Off' : 'No Red'}</span>
          </div>

          <div className="ref-stat-chip minute-adjuster">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Min:</span>
            <input
              type="number"
              min="1"
              max="130"
              value={minute}
              onChange={e => setMinute(e.target.value)}
              className="ref-minute-input"
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--nova-orange)', fontWeight: 700 }}>'</span>
          </div>
        </div>

        {/* 4 Action Mode Pills */}
        <div className="ref-action-nav-tabs">
          <button
            type="button"
            onClick={() => setSelectedAction('GOAL')}
            className={`ref-action-nav-btn goal ${selectedAction === 'GOAL' ? 'active' : ''}`}
          >
            <span>⚽</span>
            <span>Goal</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('YELLOW')}
            className={`ref-action-nav-btn yellow ${selectedAction === 'YELLOW' ? 'active' : ''}`}
          >
            <span>🟨</span>
            <span>Caution</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('RED')}
            className={`ref-action-nav-btn red ${selectedAction === 'RED' ? 'active' : ''}`}
          >
            <span>🟥</span>
            <span>Dismissal</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('SUB')}
            className={`ref-action-nav-btn sub ${selectedAction === 'SUB' ? 'active' : ''}`}
          >
            <span>🔄</span>
            <span>Substitution</span>
          </button>
        </div>

        {/* ACTION BODY */}
        <div className="ref-action-body-panel">
          {/* TAB 1: GOAL */}
          {selectedAction === 'GOAL' && (
            <div className="ref-action-flow">
              <div className="ref-flow-heading">
                <span>⚽</span>
                <strong>Record Goal for #{player.number} {player.name}</strong>
              </div>

              <div>
                <label className="ref-flow-label">Goal Scenario</label>
                <div className="ref-chip-grid">
                  {['Open Play', 'Penalty Kick', 'Header', 'Direct Free Kick', 'Counter Attack', 'Own Goal'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoalType(g)}
                      className={`ref-option-chip ${goalType === g ? 'active' : ''}`}
                    >
                      {g === 'Penalty Kick' ? '🎯 ' : g === 'Own Goal' ? '⚠️ ' : ''}{g}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteGoal}
                className="ref-action-confirm-btn goal"
              >
                <span>⚽ Confirm Goal at {minute}'</span>
              </button>
            </div>
          )}

          {/* TAB 2: YELLOW CARD */}
          {selectedAction === 'YELLOW' && (
            <div className="ref-action-flow">
              <div className="ref-flow-heading">
                <span>🟨</span>
                <strong>Issue Caution / Yellow Card</strong>
              </div>

              {playerStats.yellowCards >= 1 && (
                <div className="ref-card-alert warning">
                  <ShieldAlert size={18} color="#FFD700" />
                  <div>
                    <strong>WARNING: Second Yellow Card!</strong>
                    <span>Player was cautioned earlier. Confirming this will result in an immediate RED CARD expulsion!</span>
                  </div>
                </div>
              )}

              <div>
                <label className="ref-flow-label">Disciplinary Infraction</label>
                <div className="ref-chip-grid">
                  {[
                    'Tactical Foul / Stopping Attack',
                    'Dissent by Word or Action',
                    'Reckless Challenge',
                    'Delaying the Restart of Play',
                    'Unsporting Conduct',
                    'Simulation / Diving'
                  ].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setYellowReason(r)}
                      className={`ref-option-chip ${yellowReason === r ? 'active' : ''}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteYellow}
                className={`ref-action-confirm-btn ${playerStats.yellowCards >= 1 ? 'red' : 'yellow'}`}
              >
                <span>
                  {playerStats.yellowCards >= 1 
                    ? `🟥 Issue 2nd Yellow & Send Off (${minute}')` 
                    : `🟨 Confirm Yellow Card (${minute}')`}
                </span>
              </button>
            </div>
          )}

          {/* TAB 3: DIRECT RED CARD */}
          {selectedAction === 'RED' && (
            <div className="ref-action-flow">
              <div className="ref-flow-heading">
                <span>🟥</span>
                <strong>Direct Red Card / Permanent Dismissal</strong>
              </div>

              <div className="ref-card-alert danger">
                <ShieldAlert size={18} color="#EF4444" />
                <div>
                  <strong>Mandatory Expulsion:</strong>
                  <span>Player must leave field of play. Recorded in official league disciplinary report.</span>
                </div>
              </div>

              <div>
                <label className="ref-flow-label">Serious Misconduct Infraction</label>
                <div className="ref-chip-grid">
                  {[
                    'Serious Foul Play / Excessive Force',
                    'Violent Conduct / Striking',
                    'Denying Obvious Goal Opportunity (DOGSO)',
                    'Offensive / Insulting / Abusive Language',
                    'Spitting or Biting an Opponent',
                    'Handball on Goal Line (DOGSO)'
                  ].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRedReason(r)}
                      className={`ref-option-chip ${redReason === r ? 'active' : ''}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteRed}
                className="ref-action-confirm-btn red"
              >
                <span>🟥 Send Off #{player.number} {player.name} ({minute}')</span>
              </button>
            </div>
          )}

          {/* TAB 4: SUBSTITUTION */}
          {selectedAction === 'SUB' && (
            <div className="ref-action-flow">
              <div className="ref-flow-heading">
                <span>🔄</span>
                <strong>Execute Matchday Substitution</strong>
              </div>

              {isOnPitch ? (
                <div>
                  <label className="ref-flow-label">
                    Select Incoming Substitute from {team.shortName} Bench:
                  </label>
                  {benchPlayers.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No available substitutes on bench.
                    </div>
                  ) : (
                    <div className="ref-sub-partner-list">
                      {benchPlayers.map(subP => (
                        <div
                          key={subP.id}
                          onClick={() => setSelectedSubPartnerId(subP.id)}
                          className={`ref-sub-partner-card ${selectedSubPartnerId === subP.id ? 'active' : ''}`}
                        >
                          <div className="ref-partner-num">{subP.number}</div>
                          <div className="ref-partner-meta">
                            <strong>{subP.name}</strong>
                            <span>{subP.position} • Bench Reserve</span>
                          </div>
                          {selectedSubPartnerId === subP.id && (
                            <span className="ref-partner-selected-tag">SELECTED IN</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="ref-flow-label">
                    Select Outgoing Starter on Pitch to be Replaced:
                  </label>
                  <div className="ref-sub-partner-list">
                    {pitchPlayers.map(pitchP => (
                      <div
                        key={pitchP.id}
                        onClick={() => setSelectedSubPartnerId(pitchP.id)}
                        className={`ref-sub-partner-card ${selectedSubPartnerId === pitchP.id ? 'active' : ''}`}
                      >
                        <div className="ref-partner-num">{pitchP.number}</div>
                        <div className="ref-partner-meta">
                          <strong>{pitchP.name}</strong>
                          <span>{pitchP.position} • Active Starter</span>
                        </div>
                        {selectedSubPartnerId === pitchP.id && (
                          <span className="ref-partner-selected-tag">SELECTED OUT</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Substitution Summary Banner */}
              {selectedPartner && (
                <div className="ref-sub-summary-banner">
                  <div className="ref-sub-direction">
                    <span className="tag-out">🔴 OUT: #{isOnPitch ? player.number : selectedPartner.number} {isOnPitch ? player.name : selectedPartner.name}</span>
                    <ArrowRightLeft size={16} />
                    <span className="tag-in">🟢 IN: #{isOnPitch ? selectedPartner.number : player.number} {isOnPitch ? selectedPartner.name : player.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Official Change at {minute}'
                  </span>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedPartner}
                onClick={handleExecuteSub}
                className="ref-action-confirm-btn sub"
              >
                <span>🔄 Confirm Substitution at {minute}'</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
