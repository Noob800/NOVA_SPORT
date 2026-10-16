import React from 'react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  Plus, 
  Wand2, 
  UserCheck
} from 'lucide-react';
import { adminStore, type AdminPlayerRecord } from '../../../services/adminStore';
import { matchStore } from '../../../services/matchStore';

interface CommandCentreViewProps {
  onNavigate: (section: string, subId?: string) => void;
  onOpenScheduleModal: () => void;
  onOpenTeamModal: () => void;
  onOpenCompetitionModal: () => void;
}

export const CommandCentreView: React.FC<CommandCentreViewProps> = ({
  onNavigate,
  onOpenScheduleModal,
  onOpenTeamModal
}) => {
  const selectedCompId = adminStore.getSelectedCompetitionId();
  const competitions = adminStore.getCompetitions();
  const currentComp = competitions.find(c => c.id === selectedCompId) || competitions[0];
  const activeSeason = adminStore.getActiveSeason(currentComp?.id);

  const allTeams = adminStore.getTeams();
  const allMatches = matchStore.getAllMatches();
  const allPlayers = adminStore.getPlayers();

  // Season scoped matches
  const seasonMatches = allMatches.filter(m => {
    if (!activeSeason) return false;
    return (m as any).seasonId === activeSeason.id || 
           m.season === activeSeason.name ||
           m.competition.season?.includes(activeSeason.name);
  });

  const enrolledTeams = (activeSeason?.participatingTeamIds || [])
    .map(id => allTeams.find(t => t.id === id))
    .filter(Boolean);

  const playedMatches = seasonMatches.filter(m => m.status === 'VERIFIED_PUBLISHED');
  const upcomingMatches = seasonMatches.filter(m => ['SCHEDULED', 'READY'].includes(m.status)).slice(0, 4);
  const recentResults = seasonMatches.filter(m => m.status === 'VERIFIED_PUBLISHED').slice(0, 3);
  const pendingPlayers = allPlayers.filter(p => p.eligibility === 'PENDING_REGISTRATION');

  const totalMatches = seasonMatches.length;
  const progressPercent = totalMatches > 0 ? Math.round((playedMatches.length / totalMatches) * 100) : 0;

  const handleQuickApprovePlayer = (player: AdminPlayerRecord) => {
    adminStore.approvePlayer(player.id);
  };

  return (
    <div className="admin-module-container">
      {/* Top Header */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <Trophy size={14} className="eyebrow-icon" />
            <span>OPERATIONAL COMPETITION OVERVIEW</span>
          </div>
          <h1 className="module-title">{currentComp?.name || 'KeMU Super League'}</h1>
          <p className="module-subtitle">
            Compact operational dashboard tracking active season progress, upcoming fixtures, and roster clearances.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="admin-action-btn primary"
            onClick={onOpenScheduleModal}
          >
            <Plus size={14} /> Schedule Match
          </button>
          <button 
            className="admin-action-btn secondary"
            onClick={() => onNavigate('leagues')}
          >
            <Wand2 size={14} /> Auto-Generate
          </button>
          <button 
            className="admin-action-btn secondary"
            onClick={onOpenTeamModal}
          >
            <Users size={14} /> Register Club
          </button>
        </div>
      </div>

      {/* Compact Competition Tracking Metrics Bar */}
      <div className="admin-card" style={{
        background: 'linear-gradient(135deg, #18191c 0%, #101113 100%)',
        border: '1px solid rgba(255, 106, 0, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Active Season */}
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--nova-orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Season
            </span>
            <h3 style={{ margin: '3px 0 2px 0', fontSize: '1.25rem', fontWeight: 800 }}>
              {activeSeason?.name || 'No Active Season'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Edition {activeSeason?.year || '2026/27'} • Single Active Season
            </span>
          </div>

          {/* Participating Clubs */}
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Enrolled Clubs
            </span>
            <h3 style={{ margin: '3px 0 2px 0', fontSize: '1.25rem', fontWeight: 800 }}>
              {enrolledTeams.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Clubs</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              All verified in central registry
            </span>
          </div>

          {/* Fixture Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Fixture Progress
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--nova-orange)', fontWeight: 800 }}>
                {progressPercent}%
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '7px', 
              background: '#23252b', 
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '4px'
            }}>
              <div style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: 'var(--nova-orange)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {playedMatches.length} of {totalMatches} fixtures concluded
            </span>
          </div>

          {/* Pending Player Clearance Alert */}
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Pending Approvals
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '3px 0 2px 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: pendingPlayers.length > 0 ? '#f59e0b' : 'var(--stadium-white)' }}>
                {pendingPlayers.length}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Player Invitations</span>
            </div>
            <span 
              style={{ fontSize: '0.76rem', color: 'var(--nova-orange)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => onNavigate('teams')}
            >
              Review queue &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Upcoming Matches */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="var(--nova-orange)" />
              Upcoming Matches
            </h3>
            <button 
              className="admin-action-btn secondary sm"
              onClick={() => onNavigate('leagues')}
            >
              All Fixtures &rarr;
            </button>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="admin-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No upcoming scheduled matches in this season.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingMatches.map((match) => {
                const assignedRef = match.officials.find(o => o.role === 'Center Referee')?.name || 'Unassigned';

                return (
                  <div 
                    key={match.id}
                    className="admin-card"
                    style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                  >
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--nova-orange)', fontWeight: 700, marginBottom: '2px' }}>
                        {match.round} • {match.date} {match.time}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--stadium-white)' }}>
                        {match.homeTeam.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs</span> {match.awayTeam.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} /> {match.venue}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '0.74rem', 
                        display: 'block', 
                        color: assignedRef !== 'Unassigned' ? 'var(--stadium-white)' : '#f59e0b',
                        fontWeight: 600,
                        marginBottom: '4px'
                      }}>
                        Ref: {assignedRef}
                      </span>
                      <button 
                        className="admin-action-btn secondary sm"
                        onClick={() => onNavigate('matches')}
                      >
                        Match Desk
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Pending Player Approvals + Recent Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Pending Player Approvals Review Card */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} color="var(--nova-orange)" />
                Pending Player Approvals ({pendingPlayers.length})
              </h3>
              <button 
                className="admin-action-btn secondary sm"
                onClick={() => onNavigate('teams')}
              >
                Manage Queue &rarr;
              </button>
            </div>

            {pendingPlayers.length === 0 ? (
              <div className="admin-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                All invited players have been reviewed and approved.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pendingPlayers.slice(0, 3).map((player) => {
                  const team = allTeams.find(t => t.id === player.teamId);

                  return (
                    <div 
                      key={player.id}
                      className="admin-card"
                      style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{player.name}</div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {player.position} • {team?.name || 'Club'} • {player.studentId || player.nationalId}
                        </span>
                      </div>

                      <button 
                        className="admin-action-btn primary sm"
                        onClick={() => handleQuickApprovePlayer(player)}
                      >
                        Approve
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Verified Results */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={16} color="var(--nova-orange)" />
                Recent Verified Results
              </h3>
              <button 
                className="admin-action-btn secondary sm"
                onClick={() => onNavigate('leagues')}
              >
                Table & Standings &rarr;
              </button>
            </div>

            {recentResults.length === 0 ? (
              <div className="admin-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No verified match results recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentResults.map((match) => (
                  <div 
                    key={match.id}
                    className="admin-card"
                    style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--nova-orange)', fontWeight: 700 }}>
                        {match.round} • Full Time
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                      </div>
                    </div>

                    <div style={{ 
                      padding: '4px 10px', 
                      background: 'var(--pitch-black)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      letterSpacing: '1px'
                    }}>
                      {match.homeScore} - {match.awayScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
