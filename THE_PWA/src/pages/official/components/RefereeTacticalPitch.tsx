import { useState, useEffect } from 'react';
import type { OfficialMatchData, TeamRosterPlayer, Formation } from '../../../services/matchStore';
import { matchStore } from '../../../services/matchStore';
import { ArrowLeftRight, ChevronRight } from 'lucide-react';

interface RefereeTacticalPitchProps {
  match: OfficialMatchData;
  activeTeamId: string;
  onSelectTeam?: (teamId: string) => void;
  onSelectPlayer?: (player: TeamRosterPlayer, isOnPitch: boolean) => void;
  hideBench?: boolean;
  readOnly?: boolean;
}

export function RefereeTacticalPitch({
  match,
  activeTeamId,
  onSelectTeam,
  onSelectPlayer,
  hideBench = false,
  readOnly = false
}: RefereeTacticalPitchProps) {
  const isHome = activeTeamId === match.homeTeam.id;
  const currentTeam = isHome ? match.homeTeam : match.awayTeam;
  const otherTeam = isHome ? match.awayTeam : match.homeTeam;
  const currentRoster = matchStore.getTeamRoster(activeTeamId);
  const currentLineup = matchStore.getMatchLineup(match.id, activeTeamId);

  const [formation, setFormation] = useState<Formation>(currentLineup.formation || '4-3-3');

  useEffect(() => {
    setFormation(currentLineup.formation || '4-3-3');
  }, [activeTeamId, currentLineup.formation]);

  const starters = currentLineup.starters || [];
  const captainId = currentLineup.captainId;

  // Build rows from top (Attacking FW) to bottom (Goalkeeper GK)
  const getFormationRows = () => {
    const formationMap: Record<Formation, number[]> = {
      '4-3-3': [3, 3, 4, 1], // FW, MF, DF, GK
      '4-4-2': [2, 4, 4, 1],
      '3-5-2': [2, 5, 3, 1],
      '4-2-3-1': [1, 3, 2, 4, 1],
      '5-3-2': [2, 3, 5, 1]
    };

    const rowCounts = formationMap[formation] || [3, 3, 4, 1];
    const rows: { role: 'FW' | 'MF' | 'DF' | 'GK'; playerIds: (string | null)[] }[] = [];

    let currentIdx = 0;
    rowCounts.forEach((count, rIdx) => {
      const isGkRow = rIdx === rowCounts.length - 1;
      const roleName = isGkRow ? 'GK' : rIdx === 0 ? 'FW' : rIdx === 1 ? 'MF' : 'DF';
      const slotIds: (string | null)[] = [];

      for (let c = 0; c < count; c++) {
        if (currentIdx < starters.length) {
          slotIds.push(starters[currentIdx]);
        } else {
          slotIds.push(null);
        }
        currentIdx++;
      }
      rows.push({ role: roleName, playerIds: slotIds });
    });

    return rows;
  };

  const handleFormationChange = (newFormation: Formation) => {
    setFormation(newFormation);
    matchStore.updateMatchFormation(match.id, activeTeamId, newFormation);
  };

  return (
    <div className="referee-pitch-wrapper">
      {/* Streamlined Pitch Top Bar */}
      <div className="ref-pitch-controls-bar">
        <div className="ref-pitch-title-box">
          <span className="ref-squad-source-pill">
            ⚽ {currentTeam.shortName} Lineup ({starters.length} on Pitch)
          </span>
          {onSelectTeam && (
            <button
              type="button"
              onClick={() => onSelectTeam(otherTeam.id)}
              className="ref-switch-team-quick-btn"
              title={`Switch pitch view to ${otherTeam.name}`}
            >
              <ArrowLeftRight size={13} />
              <span>View {otherTeam.shortName}</span>
            </button>
          )}
        </div>

        {readOnly ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', background: 'rgba(255, 255, 255, 0.08)', padding: '3px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--stadium-white)', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-muted)' }}>Formation:</span>
            <span style={{ color: 'var(--nova-orange)' }}>{formation}</span>
          </div>
        ) : (
          <div className="ref-formation-switch">
            <label htmlFor="ref-formation-select">Formation:</label>
            <select
              id="ref-formation-select"
              value={formation}
              onChange={e => handleFormationChange(e.target.value as Formation)}
              className="ref-formation-select"
            >
              <option value="4-3-3">4-3-3</option>
              <option value="4-4-2">4-4-2</option>
              <option value="3-5-2">3-5-2</option>
              <option value="4-2-3-1">4-2-3-1</option>
              <option value="5-3-2">5-3-2</option>
            </select>
          </div>
        )}
      </div>

      {/* INTERACTIVE FULL-VIEW FOOTBALL PITCH */}
      <div className="ref-tactical-pitch-field">
        {/* Pitch Turf Markings */}
        <div className="pitch-marking-box-top" />
        <div className="pitch-marking-box-bottom" />
        <div className="pitch-marking-center-line" />
        <div className="pitch-marking-center-circle" />
        <div className="pitch-marking-center-spot" />

        {/* Formation Rows (Forwards down to Goalkeeper) */}
        <div className="pitch-players-layer">
          {getFormationRows().map((row, rIdx) => (
            <div key={`row-${rIdx}`} className="pitch-tactical-row">
              {row.playerIds.map((pId, colIdx) => {
                const player = pId ? currentRoster.find(p => p.id === pId) : null;
                if (!player) {
                  return (
                    <div key={`slot-empty-${rIdx}-${colIdx}`} className="ref-player-slot empty">
                      <div className="ref-jersey-circle empty">-</div>
                      <span className="ref-player-name">Empty</span>
                    </div>
                  );
                }

                const stats = matchStore.getPlayerMatchStats(match.id, player.id);
                const isCaptain = captainId === player.id;
                const isSentOff = stats.redCards > 0;

                return (
                  <div
                    key={`slot-${player.id}`}
                    onClick={() => onSelectPlayer && onSelectPlayer(player, true)}
                    className={`ref-player-slot ${isSentOff ? 'sent-off' : ''}`}
                    title={readOnly ? `#${player.number} ${player.name} (${player.position})` : `Tap to log action for #${player.number} ${player.name}`}
                    style={{ cursor: onSelectPlayer ? 'pointer' : 'default' }}
                  >
                    {/* Jersey Circle Avatar with Event Badges */}
                    <div className="ref-jersey-circle">
                      <span className="ref-jersey-num">{player.number}</span>

                      {/* Captain Badge */}
                      {isCaptain && (
                        <span className="ref-armband-badge" title="Team Captain">C</span>
                      )}

                      {/* Goal Badge */}
                      {stats.goals > 0 && (
                        <span className="ref-event-badge goal" title={`${stats.goals} Goal(s) Scored`}>
                          ⚽{stats.goals > 1 ? stats.goals : ''}
                        </span>
                      )}

                      {/* Yellow Card Badge */}
                      {stats.yellowCards > 0 && stats.redCards === 0 && (
                        <span className="ref-event-badge yellow" title="Cautioned">
                          🟨{stats.yellowCards > 1 ? stats.yellowCards : ''}
                        </span>
                      )}

                      {/* Red Card / Dismissal Badge */}
                      {stats.redCards > 0 && (
                        <span className="ref-event-badge red" title="Sent Off">
                          🟥
                        </span>
                      )}

                      {/* Subbed In Indicator */}
                      {stats.isSubbedIn && (
                        <span className="ref-event-badge sub-in" title="Substituted On">
                          🟢
                        </span>
                      )}
                    </div>

                    {/* Player Surname & Role */}
                    <div className="ref-player-tag">
                      <span className="ref-player-surname">
                        {player.name.split(' ').pop()}
                      </span>
                      <span className="ref-player-pos-chip">{row.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Render Bench if not rendered in sidebar */}
      {!hideBench && (
        <RefereeBench
          match={match}
          activeTeamId={activeTeamId}
          onSelectPlayer={onSelectPlayer}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

// Compact, Reusable Bench Component for Side Panel or Standalone Use
export function RefereeBench({
  match,
  activeTeamId,
  onSelectPlayer,
  readOnly = false
}: {
  match: OfficialMatchData;
  activeTeamId: string;
  onSelectPlayer?: (player: TeamRosterPlayer, isOnPitch: boolean) => void;
  readOnly?: boolean;
}) {
  const isHome = activeTeamId === match.homeTeam.id;
  const currentTeam = isHome ? match.homeTeam : match.awayTeam;
  const currentRoster = matchStore.getTeamRoster(activeTeamId);
  const currentLineup = matchStore.getMatchLineup(match.id, activeTeamId);
  const subs = currentLineup.subs || [];

  return (
    <div className="ref-bench-card">
      <div className="ref-bench-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>🪑</span>
          <div>
            <strong style={{ fontSize: '0.9rem', color: 'var(--stadium-white)', display: 'block' }}>
              {currentTeam.shortName} Bench ({subs.length})
            </strong>
          </div>
        </div>
        <span className="ref-bench-count">
          {readOnly ? `${subs.length} Available` : 'Tap to Sub In'}
        </span>
      </div>

      {subs.length === 0 ? (
        <div className="ref-bench-empty">
          No bench substitutes registered.
        </div>
      ) : (
        <div className="ref-bench-grid">
          {subs.map(subId => {
            const player = currentRoster.find(p => p.id === subId);
            if (!player) return null;
            const stats = matchStore.getPlayerMatchStats(match.id, player.id);

            return (
              <div
                key={subId}
                onClick={() => onSelectPlayer && onSelectPlayer(player, false)}
                className={`ref-bench-player-pill ${stats.isSubbedOut ? 'used' : ''}`}
                title={readOnly ? `#${player.number} ${player.name} (${player.position})` : `Tap to substitute #${player.number} ${player.name}`}
                style={{ cursor: onSelectPlayer ? 'pointer' : 'default' }}
              >
                <div className="ref-bench-avatar">
                  <span className="ref-bench-num">{player.number}</span>
                  {stats.yellowCards > 0 && <span className="ref-mini-card">🟨</span>}
                  {stats.redCards > 0 && <span className="ref-mini-card">🟥</span>}
                </div>

                <div className="ref-bench-info">
                  <span className="ref-bench-name">{player.name}</span>
                  <span className="ref-bench-pos">
                    {player.position} {stats.isSubbedOut ? '• Subbed Out' : ''}
                  </span>
                </div>

                {readOnly ? (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {player.position}
                  </span>
                ) : (
                  <ChevronRight size={14} color="var(--text-muted)" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
