import React, { useState } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { mockTeams } from '../mockData';
import './CompetitionHub.css';

export function CompetitionHub() {
  const [activeTab, setActiveTab] = useState('standings');

  return (
    <div className="comp-hub-container">
      {/* Competition Header */}
      <header className="comp-header">
        <div className="comp-brand">
          <Trophy size={48} className="comp-icon" />
          <div className="comp-title-group">
            <h1>KeMU Super League</h1>
            <span className="comp-season">Season 8 (2026/27)</span>
          </div>
        </div>
        
        <div className="comp-nav">
          <button 
            className={`comp-tab ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            Standings
          </button>
          <button 
            className={`comp-tab ${activeTab === 'fixtures' ? 'active' : ''}`}
            onClick={() => setActiveTab('fixtures')}
          >
            Fixtures
          </button>
          <button 
            className={`comp-tab ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="comp-content">
        {activeTab === 'standings' && (
          <div className="standings-panel">
            <div className="table-responsive">
              <table className="standings-table">
                <thead>
                  <tr>
                    <th className="col-pos">#</th>
                    <th className="col-team">Club</th>
                    <th className="col-num" title="Played">MP</th>
                    <th className="col-num hide-mobile" title="Won">W</th>
                    <th className="col-num hide-mobile" title="Drawn">D</th>
                    <th className="col-num hide-mobile" title="Lost">L</th>
                    <th className="col-num" title="Goal Difference">GD</th>
                    <th className="col-num col-pts" title="Points">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTeams.map((team, index) => (
                    <tr key={team.id} className={index < 3 ? 'promo-zone' : (index > 5 ? 'relegation-zone' : '')}>
                      <td className="col-pos tabular-nums">{index + 1}</td>
                      <td className="col-team">
                        <div className="team-cell">
                          <span className="team-logo">{team.logo}</span>
                          <span className="team-name">{team.name}</span>
                          <span className="team-short hide-desktop">{team.shortName}</span>
                        </div>
                      </td>
                      <td className="col-num tabular-nums">{team.played}</td>
                      <td className="col-num hide-mobile tabular-nums">{team.won}</td>
                      <td className="col-num hide-mobile tabular-nums">{team.drawn}</td>
                      <td className="col-num hide-mobile tabular-nums">{team.lost}</td>
                      <td className="col-num tabular-nums">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                      <td className="col-num col-pts tabular-nums">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="placeholder-panel">
            <p>Fixtures grid will be displayed here.</p>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="teams-grid">
            {mockTeams.map(team => (
              <div key={team.id} className="team-card">
                <span className="team-card-logo">{team.logo}</span>
                <h3 className="team-card-name">{team.name}</h3>
                <button className="view-profile-btn">Profile <ChevronRight size={16}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
