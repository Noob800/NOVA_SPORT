import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trophy, Users, User, ChevronRight } from 'lucide-react';
import { adminStore } from '../../services/adminStore';
import './Explore.css';

export function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    return adminStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const allComps = adminStore.getCompetitions();
  const allTeams = adminStore.getTeams();
  const allPlayers = adminStore.getPlayers();
  const standings = adminStore.calculateStandings();

  const term = searchTerm.trim().toLowerCase();

  const filteredComps = term
    ? allComps.filter(c => c.name.toLowerCase().includes(term) || c.code?.toLowerCase().includes(term))
    : allComps.slice(0, 4);

  const filteredTeams = term
    ? allTeams.filter(t => t.name.toLowerCase().includes(term) || t.shortName?.toLowerCase().includes(term) || t.city?.toLowerCase().includes(term))
    : allTeams.slice(0, 6);

  const filteredPlayers = term
    ? allPlayers.filter(p => p.name.toLowerCase().includes(term) || p.position.toLowerCase().includes(term))
    : allPlayers.slice(0, 5);

  return (
    <div className="explore-container">
      <div className="search-header">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search competitions, teams, players..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="explore-sections">
        <section className="explore-section">
          <h2><Trophy size={20} className="icon-orange" /> {searchTerm ? 'Matching Competitions' : 'Official Competitions'}</h2>
          {filteredComps.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-2) 0' }}>No competitions match "{searchTerm}".</p>
          ) : (
            <div className="explore-grid">
              {filteredComps.map(comp => (
                <Link to={`/competitions/${comp.id}`} key={comp.id} className="explore-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card-image bg-orange">{comp.name.substring(0, 2).toUpperCase()}</div>
                  <div className="card-info">
                    <h3>{comp.name}</h3>
                    <p>{comp.type} • {comp.status === 'ACTIVE' ? 'Ongoing' : comp.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="explore-section">
          <h2><Users size={20} className="icon-orange" /> {searchTerm ? 'Matching Teams' : 'Approved Clubs'}</h2>
          {filteredTeams.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-2) 0' }}>No clubs match "{searchTerm}".</p>
          ) : (
            <div className="explore-grid">
              {filteredTeams.map(team => {
                const standing = standings.find(s => s.teamId === team.id);
                return (
                  <Link to={`/teams/${team.id}`} key={team.id} className="explore-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card-image team-logo-placeholder">{team.logo}</div>
                    <div className="card-info">
                      <h3>{team.name}</h3>
                      <p>{standing ? `${standing.points} Pts • ${standing.won}W-${standing.drawn}D-${standing.lost}L` : `${team.division || 'Premier'}`}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="explore-section">
          <h2><User size={20} className="icon-orange" /> {searchTerm ? 'Matching Players' : 'Registered Players'}</h2>
          {filteredPlayers.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-2) 0' }}>No players match "{searchTerm}".</p>
          ) : (
            <div className="explore-list">
              {filteredPlayers.map(player => {
                const team = allTeams.find(t => t.id === player.teamId);
                const avatarEmoji = player.position === 'GK' ? '🧤' : player.position === 'DF' ? '🛡️' : player.position === 'MF' ? '⚡' : '⚽';
                return (
                  <Link to={`/players/${player.id}`} key={player.id} className="list-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="list-avatar" style={{ fontSize: '1.25rem' }}>{avatarEmoji}</div>
                    <div className="list-info" style={{ flex: 1 }}>
                      <h4>{player.name}</h4>
                      <p>{team?.name || 'Club'} • #{player.number} • {player.goals || 0} Goals</p>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
