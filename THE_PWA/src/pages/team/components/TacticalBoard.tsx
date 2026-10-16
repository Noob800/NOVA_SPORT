import { useState } from 'react';
import { 
  ArrowLeftRight, Check, X, ChevronDown, ChevronUp, UserPlus
} from 'lucide-react';
import type { SquadPlayer, Formation } from '../../../services/teamDeskStore';

export interface TacticalBoardProps {
  formation: Formation;
  starters: string[]; // array of up to 11 player IDs
  subs: string[]; // array of up to 7 player IDs
  captainId?: string;
  tacticalNotes?: string;
  setPieceTakers?: {
    penalties?: string;
    freeKicks?: string;
    corners?: string;
  };
  squad: SquadPlayer[];
  onChangeFormation?: (formation: Formation) => void;
  onChangeStarters?: (starters: string[]) => void;
  onChangeSubs?: (subs: string[]) => void;
  onChangeCaptain?: (captainId?: string) => void;
  onChangeTacticalNotes?: (notes: string) => void;
  onChangeSetPieceTakers?: (takers: { penalties?: string; freeKicks?: string; corners?: string }) => void;
  readOnly?: boolean;
}

export function TacticalBoard({
  formation,
  starters,
  subs,
  captainId,
  tacticalNotes = '',
  setPieceTakers = {},
  squad,
  onChangeFormation = () => {},
  onChangeStarters = () => {},
  onChangeSubs = () => {},
  onChangeCaptain = () => {},
  onChangeTacticalNotes = () => {},
  onChangeSetPieceTakers = () => {},
  readOnly = false
}: TacticalBoardProps) {
  // Player selected for swap (can be a starter or a sub)
  const [selectedSwapId, setSelectedSwapId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showReserves, setShowReserves] = useState(false);

  const selectedSwapPlayer = squad.find(p => p.id === selectedSwapId);
  const isSelectedStarter = selectedSwapId ? starters.includes(selectedSwapId) : false;
  const isSelectedSub = selectedSwapId ? subs.includes(selectedSwapId) : false;

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Handle tapping a starter on the pitch or starter list
  const handleTapStarter = (playerId: string) => {
    if (readOnly) return;

    // 1. If no player is selected for swap, select this starter
    if (!selectedSwapId) {
      setSelectedSwapId(playerId);
      const p = squad.find(pl => pl.id === playerId);
      showToast(`Selected ${p?.name || 'starter'}. Tap another player to swap, or a sub to substitute.`);
      return;
    }

    // 2. If clicking the SAME player, deselect
    if (selectedSwapId === playerId) {
      setSelectedSwapId(null);
      return;
    }

    // 3. If another STARTER was selected, swap their starting pitch slots
    if (isSelectedStarter) {
      const idx1 = starters.indexOf(selectedSwapId);
      const idx2 = starters.indexOf(playerId);
      if (idx1 !== -1 && idx2 !== -1) {
        const nextStarters = [...starters];
        nextStarters[idx1] = playerId;
        nextStarters[idx2] = selectedSwapId;
        onChangeStarters(nextStarters);
        const p1 = squad.find(pl => pl.id === selectedSwapId);
        const p2 = squad.find(pl => pl.id === playerId);
        showToast(`Swapped positions: ${p1?.name} ⇄ ${p2?.name}`);
      }
      setSelectedSwapId(null);
      return;
    }

    // 4. If a SUB was selected, replace this starter with the sub
    if (isSelectedSub) {
      const starterIdx = starters.indexOf(playerId);
      const subIdx = subs.indexOf(selectedSwapId);
      if (starterIdx !== -1 && subIdx !== -1) {
        const nextStarters = [...starters];
        nextStarters[starterIdx] = selectedSwapId;
        const nextSubs = [...subs];
        nextSubs[subIdx] = playerId;
        onChangeStarters(nextStarters);
        onChangeSubs(nextSubs);
        const incoming = squad.find(pl => pl.id === selectedSwapId);
        const outgoing = squad.find(pl => pl.id === playerId);
        showToast(`Substitution: ${incoming?.name} IN ⇄ ${outgoing?.name} OUT`);
      }
      setSelectedSwapId(null);
    }
  };

  // Handle tapping a substitute on the bench
  const handleTapSub = (playerId: string) => {
    if (readOnly) return;

    // 1. If a STARTER was selected, swap starter with this sub
    if (selectedSwapId && isSelectedStarter) {
      const starterIdx = starters.indexOf(selectedSwapId);
      const subIdx = subs.indexOf(playerId);
      if (starterIdx !== -1 && subIdx !== -1) {
        const nextStarters = [...starters];
        nextStarters[starterIdx] = playerId;
        const nextSubs = [...subs];
        nextSubs[subIdx] = selectedSwapId;
        onChangeStarters(nextStarters);
        onChangeSubs(nextSubs);
        const incoming = squad.find(pl => pl.id === playerId);
        const outgoing = squad.find(pl => pl.id === selectedSwapId);
        showToast(`Substitution: ${incoming?.name} IN ⇄ ${outgoing?.name} OUT`);
      }
      setSelectedSwapId(null);
      return;
    }

    // 2. If clicking same sub, deselect
    if (selectedSwapId === playerId) {
      setSelectedSwapId(null);
      return;
    }

    // 3. Otherwise, select this sub for swap
    setSelectedSwapId(playerId);
    const p = squad.find(pl => pl.id === playerId);
    showToast(`Selected sub: ${p?.name}. Tap a starter on the pitch to substitute into starting XI.`);
  };

  // Remove player from starting XI or bench
  const handleRemoveFromLineup = (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;

    if (starters.includes(playerId)) {
      onChangeStarters(starters.filter(id => id !== playerId));
      if (captainId === playerId) onChangeCaptain(undefined);
    } else if (subs.includes(playerId)) {
      onChangeSubs(subs.filter(id => id !== playerId));
    }
    if (selectedSwapId === playerId) setSelectedSwapId(null);
  };

  // Add reserve player to lineup or bench
  const handleAddReserve = (playerId: string, target: 'starter' | 'sub') => {
    if (readOnly) return;

    if (target === 'starter') {
      if (starters.length >= 11) {
        showToast('Starting XI is full (11 players). Tap a starter to swap.');
        return;
      }
      onChangeStarters([...starters, playerId]);
      showToast('Added to Starting XI.');
    } else {
      if (subs.length >= 7) {
        showToast('Substitutes bench is full (max 7 players).');
        return;
      }
      onChangeSubs([...subs, playerId]);
      showToast('Added to Bench.');
    }
  };

  // Build formation rows
  const getFormationRows = () => {
    const formationMap: Record<Formation, number[]> = {
      '4-3-3': [3, 3, 4, 1], // FW, MF, DF, GK
      '4-4-2': [2, 4, 4, 1],
      '3-5-2': [2, 5, 3, 1],
      '4-2-3-1': [1, 3, 2, 4, 1],
      '5-3-2': [2, 3, 5, 1]
    };

    const rowCounts = formationMap[formation] || [3, 3, 4, 1];
    const rows: { role: string; playerIds: (string | null)[] }[] = [];

    let currentIdx = 0;
    // We render from Top (Attack) to Bottom (GK)
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

  // Reserves: squad players neither in starters nor in subs
  const reserves = squad.filter(p => !starters.includes(p.id) && !subs.includes(p.id));

  return (
    <div className="tactical-board-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Controls: Formation Selector & Lineup Counts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Formation:</label>
          {readOnly ? (
            <span style={{
              background: 'rgba(255, 94, 0, 0.15)',
              color: 'var(--nova-orange)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>
              {formation}
            </span>
          ) : (
            <select
              disabled={readOnly}
              value={formation}
              onChange={e => onChangeFormation(e.target.value as Formation)}
              className="form-select"
              style={{ width: 'auto', fontWeight: 700, padding: '6px 12px', borderColor: 'var(--nova-orange)' }}
            >
              <option value="4-3-3">4-3-3 Attacking</option>
              <option value="4-4-2">4-4-2 Classic Flat</option>
              <option value="3-5-2">3-5-2 Wing Play</option>
              <option value="4-2-3-1">4-2-3-1 Modern Pivot</option>
              <option value="5-3-2">5-3-2 Solid Defensive</option>
            </select>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem' }}>
          <span style={{ 
            background: starters.length === 11 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 94, 0, 0.15)', 
            color: starters.length === 11 ? '#10b981' : 'var(--nova-orange)',
            padding: '4px 10px', 
            borderRadius: 'var(--radius-full)', 
            fontWeight: 700 
          }}>
            Starting XI: {starters.length}/11
          </span>
          <span style={{ 
            background: 'var(--pitch-black)', 
            color: 'var(--text-muted)', 
            padding: '4px 10px', 
            borderRadius: 'var(--radius-full)', 
            fontWeight: 600 
          }}>
            Subs: {subs.length}/7
          </span>
        </div>
      </div>

      {/* Floating Swap Status Banner */}
      {selectedSwapId && selectedSwapPlayer && (
        <div style={{
          background: 'linear-gradient(90deg, #ff5e00, #ff8533)',
          color: '#000',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(255, 94, 0, 0.35)',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeftRight size={18} />
            <span>
              Exchanging <strong>#{selectedSwapPlayer.number} {selectedSwapPlayer.name}</strong> ({isSelectedStarter ? 'Starter' : 'Sub'}) — Tap another player to swap!
            </span>
          </div>
          <button
            onClick={() => setSelectedSwapId(null)}
            style={{
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '2px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Temporary Toast message */}
      {feedbackMsg && !selectedSwapId && (
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--nova-orange)',
          color: 'var(--nova-orange)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* TACTICAL PITCH */}
      <div 
        className="tactical-pitch"
        style={{
          background: 'radial-gradient(ellipse at center, #1b382b 0%, #0d1f17 100%)',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 12px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '440px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* Pitch Lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: '60px',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: 'none',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '20%',
          right: '20%',
          height: '60px',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(255,255,255,0.1)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none'
        }} />

        {/* Pitch Rows */}
        {getFormationRows().map((row, rIdx) => (
          <div 
            key={`row-${rIdx}`}
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '100%',
              zIndex: 2,
              margin: '6px 0'
            }}
          >
            {row.playerIds.map((pId, colIdx) => {
              const player = pId ? squad.find(p => p.id === pId) : null;
              const isSelected = pId && selectedSwapId === pId;
              const isCaptain = pId && captainId === pId;

              return (
                <div
                  key={`slot-${rIdx}-${colIdx}`}
                  onClick={() => pId && handleTapStarter(pId)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: readOnly ? 'default' : 'pointer',
                    userSelect: 'none',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                    position: 'relative'
                  }}
                >
                  {/* Player Badge / Jersey */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isSelected 
                        ? 'var(--nova-orange)' 
                        : player 
                        ? 'var(--surface-elevated)' 
                        : 'rgba(0,0,0,0.4)',
                      color: isSelected ? '#000' : 'var(--stadium-white)',
                      border: isSelected 
                        ? '3px solid #fff' 
                        : isCaptain 
                        ? '2px solid var(--nova-orange)' 
                        : player 
                        ? '2px solid rgba(255,255,255,0.3)' 
                        : '1px dashed rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      boxShadow: isSelected ? '0 0 16px var(--nova-orange)' : '0 2px 6px rgba(0,0,0,0.5)',
                      position: 'relative'
                    }}
                  >
                    {player ? player.number : '+'}
                    
                    {/* Captain Armband Indicator */}
                    {isCaptain && (
                      <span
                        title="Team Captain"
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          background: 'var(--nova-orange)',
                          color: '#000',
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #fff'
                        }}
                      >
                        C
                      </span>
                    )}

                    {/* Injury / Status Warning */}
                    {player && player.availability !== 'FIT' && (
                      <span
                        title={`Status: ${player.availability}`}
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '0.6rem',
                          borderRadius: '50%',
                          width: '14px',
                          height: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        !
                      </span>
                    )}
                  </div>

                  {/* Player Name Tag */}
                  <span
                    style={{
                      background: 'rgba(0, 0, 0, 0.75)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: isSelected ? 'var(--nova-orange)' : '#fff',
                      marginTop: '4px',
                      whiteSpace: 'nowrap',
                      maxWidth: '85px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center'
                    }}
                  >
                    {player ? player.name.split(' ').pop() : `Empty ${row.role}`}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-8px' }}>
          💡 <strong>Tap any player on the pitch</strong> to swap with another starter, or tap a sub below to substitute.
        </div>
      )}

      {/* SUBSTITUTES BENCH (UP TO 7 PLAYERS) */}
      <div className="card-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Matchday Substitutes Bench</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {readOnly ? 'Official matchday substitutes' : 'Tap a sub to swap with selected starter'}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: subs.length >= 7 ? 'var(--nova-orange)' : 'var(--text-muted)' }}>
            {readOnly ? `${subs.length} Substitutes` : `${subs.length}/7 Selected`}
          </span>
        </div>

        {subs.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', background: 'var(--pitch-black)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No substitutes on bench. Add players from the squad pool below.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
            {subs.map(subId => {
              const player = squad.find(p => p.id === subId);
              if (!player) return null;
              const isSelected = selectedSwapId === subId;

              return (
                <div
                  key={subId}
                  onClick={() => handleTapSub(subId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--pitch-black)' : 'var(--surface-elevated)',
                    border: `1px solid ${isSelected ? 'var(--nova-orange)' : 'var(--border-subtle)'}`,
                    cursor: readOnly ? 'default' : 'pointer',
                    boxShadow: isSelected ? '0 0 10px rgba(255, 94, 0, 0.4)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      color: 'var(--nova-orange)',
                      background: 'rgba(255, 94, 0, 0.1)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      #{player.number}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {player.name}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{player.position}</span>
                    </div>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={e => handleRemoveFromLineup(subId, e)}
                      title="Remove from bench"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SQUAD RESERVES POOL (Add unselected players to Starters or Subs) */}
      {!readOnly && (
        <div className="card-panel" style={{ padding: '14px' }}>
          <button
            type="button"
            onClick={() => setShowReserves(!showReserves)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              color: 'var(--stadium-white)',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={16} color="var(--nova-orange)" />
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Squad Reserves Pool ({reserves.length} Available)</h4>
            </div>
            {showReserves ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showReserves && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
              {reserves.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '12px' }}>
                  All squad players are currently in the starting XI or bench.
                </div>
              ) : (
                reserves.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--pitch-black)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--nova-orange)', width: '26px' }}>#{p.number}</span>
                      <strong>{p.name}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({p.position})</span>
                      {p.availability !== 'FIT' && (
                        <span className={`status-pill ${p.availability.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                          {p.availability}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        disabled={starters.length >= 11}
                        onClick={() => handleAddReserve(p.id, 'starter')}
                        style={{
                          background: 'var(--surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--stadium-white)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          cursor: starters.length >= 11 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        + Starter
                      </button>
                      <button
                        type="button"
                        disabled={subs.length >= 7}
                        onClick={() => handleAddReserve(p.id, 'sub')}
                        style={{
                          background: 'rgba(255, 94, 0, 0.1)',
                          border: '1px solid var(--nova-orange)',
                          color: 'var(--nova-orange)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          cursor: subs.length >= 7 ? 'not-allowed' : 'pointer',
                          fontWeight: 600
                        }}
                      >
                        + Bench
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ROLES: CAPTAIN & SET-PIECE TAKERS */}
      {(!readOnly || captainId || setPieceTakers?.penalties || setPieceTakers?.freeKicks || setPieceTakers?.corners) && (
        <div className="card-panel" style={{ padding: '14px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>Leadership & Set-Piece Specialists</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Team Captain (C)</label>
              {readOnly ? (
                <div style={{ fontSize: '0.82rem', padding: '6px 10px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-sm)', color: 'var(--stadium-white)', fontWeight: 600 }}>
                  {(() => {
                    const p = squad.find(pl => pl.id === captainId);
                    return p ? `#${p.number} ${p.name}` : 'Not designated';
                  })()}
                </div>
              ) : (
                <select
                  disabled={readOnly}
                  className="form-select"
                  value={captainId || ''}
                  onChange={e => onChangeCaptain(e.target.value || undefined)}
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                >
                  <option value="">Select Captain...</option>
                  {starters.map(sId => {
                    const p = squad.find(pl => pl.id === sId);
                    return p ? <option key={sId} value={sId}>#{p.number} {p.name} ({p.position})</option> : null;
                  })}
                </select>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Penalties</label>
              {readOnly ? (
                <div style={{ fontSize: '0.82rem', padding: '6px 10px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-sm)', color: 'var(--stadium-white)', fontWeight: 600 }}>
                  {(() => {
                    const p = squad.find(pl => pl.id === setPieceTakers?.penalties);
                    return p ? `#${p.number} ${p.name}` : 'Default taker';
                  })()}
                </div>
              ) : (
                <select
                  disabled={readOnly}
                  className="form-select"
                  value={setPieceTakers.penalties || ''}
                  onChange={e => onChangeSetPieceTakers({ ...setPieceTakers, penalties: e.target.value || undefined })}
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                >
                  <option value="">Default penalty taker...</option>
                  {starters.map(sId => {
                    const p = squad.find(pl => pl.id === sId);
                    return p ? <option key={sId} value={sId}>#{p.number} {p.name}</option> : null;
                  })}
                </select>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Free Kicks</label>
              {readOnly ? (
                <div style={{ fontSize: '0.82rem', padding: '6px 10px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-sm)', color: 'var(--stadium-white)', fontWeight: 600 }}>
                  {(() => {
                    const p = squad.find(pl => pl.id === setPieceTakers?.freeKicks);
                    return p ? `#${p.number} ${p.name}` : 'Default taker';
                  })()}
                </div>
              ) : (
                <select
                  disabled={readOnly}
                  className="form-select"
                  value={setPieceTakers.freeKicks || ''}
                  onChange={e => onChangeSetPieceTakers({ ...setPieceTakers, freeKicks: e.target.value || undefined })}
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                >
                  <option value="">Default free kick taker...</option>
                  {starters.map(sId => {
                    const p = squad.find(pl => pl.id === sId);
                    return p ? <option key={sId} value={sId}>#{p.number} {p.name}</option> : null;
                  })}
                </select>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Corner Kicks</label>
              {readOnly ? (
                <div style={{ fontSize: '0.82rem', padding: '6px 10px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-sm)', color: 'var(--stadium-white)', fontWeight: 600 }}>
                  {(() => {
                    const p = squad.find(pl => pl.id === setPieceTakers?.corners);
                    return p ? `#${p.number} ${p.name}` : 'Default taker';
                  })()}
                </div>
              ) : (
                <select
                  disabled={readOnly}
                  className="form-select"
                  value={setPieceTakers.corners || ''}
                  onChange={e => onChangeSetPieceTakers({ ...setPieceTakers, corners: e.target.value || undefined })}
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                >
                  <option value="">Default corner taker...</option>
                  {starters.map(sId => {
                    const p = squad.find(pl => pl.id === sId);
                    return p ? <option key={sId} value={sId}>#{p.number} {p.name}</option> : null;
                  })}
                </select>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TACTICAL NOTES */}
      {(!readOnly || tacticalNotes) && (
        <div className="card-panel" style={{ padding: '14px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Tactical Instructions & Match Gameplan</h4>
          {readOnly ? (
            <div style={{ fontSize: '0.82rem', padding: '8px 12px', background: 'var(--pitch-black)', borderRadius: 'var(--radius-sm)', color: 'var(--stadium-white)', fontStyle: 'italic', borderLeft: '3px solid var(--nova-orange)' }}>
              {tacticalNotes || 'No specific tactical notes published for this match fixture.'}
            </div>
          ) : (
            <textarea
              disabled={readOnly}
              rows={3}
              className="form-textarea"
              placeholder="e.g. High pressing line, aggressive counter-pressing when possession is lost, target striker on set pieces..."
              value={tacticalNotes}
              onChange={e => onChangeTacticalNotes(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          )}
        </div>
      )}
    </div>
  );
}
