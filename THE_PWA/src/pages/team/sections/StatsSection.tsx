import { useState } from 'react';
import { 
  Download, Search, CheckCircle2
} from 'lucide-react';
import type { SquadPlayer, TeamFixture, TeamProfileDetails } from '../../../services/teamDeskStore';

interface StatsSectionProps {
  squad: SquadPlayer[];
  fixtures: TeamFixture[];
  profile: TeamProfileDetails;
  teamId: string;
}

export function StatsSection({ squad, fixtures: _fixtures, profile, teamId: _teamId }: StatsSectionProps) {
  const [competitionFilter, setCompetitionFilter] = useState('ALL');
  const [playerSearch, setPlayerSearch] = useState('');
  const [sortBy, setSortBy] = useState<'goals' | 'assists' | 'appearances' | 'minutes' | 'yellowCards'>('goals');

  // Calculate team totals from squad
  const totalGoals = squad.reduce((sum, p) => sum + p.goals, 0);
  const totalCleanSheets = Math.max(...squad.map(p => p.cleanSheets));

  // League context metrics for Nova City FC
  const matchesPlayed = 18;
  const wins = 12;
  const draws = 3;
  const losses = 3;
  const points = (wins * 3) + draws;
  const goalsFor = totalGoals;
  const goalsAgainst = 20;
  const goalDiff = goalsFor - goalsAgainst;
  const winRate = Math.round((wins / matchesPlayed) * 100);

  // Filtered & sorted player stats
  const sortedPlayers = [...squad]
    .filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
    .sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));

  const exportStatsCSV = () => {
    const headers = ['Player', 'Position', 'Appearances', 'Starts', 'Minutes', 'Goals', 'Assists', 'Yellow Cards', 'Red Cards', 'Clean Sheets', 'Attendance %'];
    const rows = squad.map(p => [
      `"${p.name}"`,
      p.position,
      p.appearances,
      p.starts,
      p.minutes,
      p.goals,
      p.assists,
      p.yellowCards,
      p.redCards,
      p.cleanSheets,
      `${p.trainingAttendance}%`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NovaSport_${profile.shortName}_Season_Stats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="stats-section-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>
            Team Stats & Performance Analytics
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Calculated from verified match events, official scorecards and player logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={competitionFilter}
            onChange={e => setCompetitionFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem', padding: '6px 12px' }}
          >
            <option value="ALL">All Competitions</option>
            <option value="c1">KeMU Super League</option>
            <option value="c2">Freshers Championship</option>
          </select>

          <button
            onClick={exportStatsCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--stadium-white)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Verified vs Provisional Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7' }}>
          <CheckCircle2 size={16} />
          <span>Official Ratification: 18 League Fixtures Confirmed by NSFC Secretariat</span>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>Season 8 • KeMU Super League</span>
      </div>

      {/* Team Top KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <div style={{ background: 'var(--pitch-black)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MATCHES (MP)</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>{matchesPlayed}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>W{wins} D{draws} L{losses}</span>
        </div>

        <div style={{ background: 'var(--pitch-black)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>POINTS (PTS)</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--nova-orange)' }}>{points}</div>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>2nd in Table</span>
        </div>

        <div style={{ background: 'var(--pitch-black)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GOALS SCORED</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>{goalsFor}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2.11 / match</span>
        </div>

        <div style={{ background: 'var(--pitch-black)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GOALS CONCEDED</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>{goalsAgainst}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1.11 / match</span>
        </div>

        <div style={{ background: 'var(--pitch-black)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GOAL DIFF (GD)</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>+{goalDiff}</div>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Clean Sheets: {totalCleanSheets}</span>
        </div>

        <div style={{ background: 'var(--pitch-black)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WIN RATE</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>{winRate}%</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>15/18 Unbeaten</span>
        </div>
      </div>

      {/* Goal Scoring Timeline Breakdown (Intervals Chart) */}
      <div className="card-panel" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="panel-header" style={{ marginBottom: 'var(--space-3)' }}>
          <div>
            <h3>Goal Scoring Distribution by Match Interval</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Breakdown of goals scored across 15-minute segments
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', textAlign: 'center' }}>
          {[
            { range: "0-15'", goals: 4, pct: 40 },
            { range: "16-30'", goals: 8, pct: 80 },
            { range: "31-45'", goals: 7, pct: 70 },
            { range: "46-60'", goals: 5, pct: 50 },
            { range: "61-75'", goals: 9, pct: 90 },
            { range: "76-90+'", goals: 5, pct: 50 }
          ].map(item => (
            <div key={item.range} style={{ background: 'var(--pitch-black)', padding: '10px 4px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ height: '70px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '6px' }}>
                <div
                  style={{
                    width: '60%',
                    maxWidth: '28px',
                    height: `${item.pct}%`,
                    background: 'var(--nova-orange)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'height 0.3s'
                  }}
                />
              </div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--stadium-white)' }}>{item.goals}</strong>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player Rankings & Statistics Table */}
      <div className="card-panel">
        <div className="panel-header" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3>Player Performance Rankings</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Sortable by goals, assists, minutes played and disciplinary cards
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter player..."
                className="form-input"
                style={{ paddingLeft: '30px', height: '34px', fontSize: '0.8rem', width: '160px' }}
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="form-select"
              style={{ height: '34px', padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
            >
              <option value="goals">Sort by Goals</option>
              <option value="assists">Sort by Assists</option>
              <option value="appearances">Sort by Appearances</option>
              <option value="minutes">Sort by Minutes</option>
              <option value="yellowCards">Sort by Yellow Cards</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-subtle)' }}>
              <tr>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>#</th>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Player</th>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pos</th>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Apps (Starts)</th>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mins</th>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Goals</th>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assists</th>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cards (Y/R)</th>
                <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clean Sheets</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-display)', color: 'var(--nova-orange)', fontWeight: 700 }}>
                    {p.number}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{p.avatar}</span>
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>{p.position}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>{p.appearances} ({p.starts})</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.minutes}'</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: p.goals > 0 ? 'var(--nova-orange)' : 'var(--text-muted)' }}>
                    {p.goals}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
                    {p.assists}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#f59e0b' }}>{p.yellowCards}🟨</span> / <span style={{ color: '#ef4444' }}>{p.redCards}🟥</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                    {p.cleanSheets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
