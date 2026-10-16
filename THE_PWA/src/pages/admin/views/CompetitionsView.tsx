import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  CalendarRange, 
  Settings, 
  ChevronRight, 
  CheckCircle, 
  Layers,
  Sliders
} from 'lucide-react';
import { adminStore, type AdminCompetition } from '../../../services/adminStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface CompetitionsViewProps {
  onNavigate: (section: string, subId?: string) => void;
  onOpenCreateModal: () => void;
}

export const CompetitionsView: React.FC<CompetitionsViewProps> = ({
  onNavigate,
  onOpenCreateModal
}) => {
  const competitions = adminStore.getCompetitions();
  const seasons = adminStore.getSeasons();
  const [selectedCompId, setSelectedCompId] = useState<string>(competitions[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'SEASONS' | 'RULES' | 'STRUCTURE' | 'SETTINGS'>('SEASONS');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const selectedComp = competitions.find(c => c.id === selectedCompId) || competitions[0];
  const compSeasons = seasons.filter(s => s.competitionId === selectedComp?.id);

  const handleStatusChange = (status: AdminCompetition['status']) => {
    if (!selectedComp) return;
    adminStore.updateCompetitionStatus(selectedComp.id, status);
    setFeedbackNotice(`Competition status updated to ${status}.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="admin-module-container">
      {/* Module Title Banner */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <Trophy size={14} className="eyebrow-icon" />
            <span>NSFC COMPETITION ADMINISTRATION</span>
          </div>
          <h1 className="module-title">Championships & Leagues</h1>
          <p className="module-subtitle">
            Configure NSFC football competitions, governing tournament structures, points rules, and season hierarchies.
          </p>
        </div>

        <button 
          className="admin-action-btn primary"
          onClick={onOpenCreateModal}
        >
          <Plus size={15} /> New Competition
        </button>
      </div>

      {feedbackNotice && (
        <div className="admin-inline-alert success">
          <CheckCircle size={16} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Competitions Grid */}
      <div className="competitions-card-grid">
        {competitions.map((comp) => {
          const isSelected = selectedCompId === comp.id;
          const sCount = seasons.filter(s => s.competitionId === comp.id).length;

          return (
            <div 
              key={comp.id}
              className={`competition-summary-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedCompId(comp.id)}
            >
              <div className="comp-card-top">
                <div className="comp-type-chip">{comp.type} • {comp.format}</div>
                <AdminStatusBadge status={comp.status} size="sm" />
              </div>

              <div className="comp-card-body">
                <div className="comp-icon-box">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="comp-card-name">{comp.name}</h3>
                  <span className="comp-card-code">[{comp.code}] • {comp.tier}</span>
                </div>
              </div>

              <p className="comp-card-desc">{comp.description}</p>

              <div className="comp-card-meta">
                <div className="meta-item">
                  <span className="meta-label">Seasons</span>
                  <span className="meta-val">{sCount} Editions</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Teams</span>
                  <span className="meta-val">{comp.teamCount} Clubs</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Rounds</span>
                  <span className="meta-val">{comp.roundsCount} Matchdays</span>
                </div>
              </div>

              <div className="comp-card-footer">
                <span className="select-hint">
                  {isSelected ? 'Active Selection' : 'Click to Manage'}
                </span>
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Competition Detail Inspector */}
      {selectedComp && (
        <div className="detail-inspector-panel">
          <div className="inspector-header">
            <div className="inspector-identity">
              <div className="inspector-badge">
                <Trophy size={28} />
              </div>
              <div>
                <div className="inspector-tags">
                  <span className="governing-tag">{selectedComp.governingBody}</span>
                  <span className="tier-tag">{selectedComp.tier}</span>
                </div>
                <h2 className="inspector-name">{selectedComp.name}</h2>
                <span className="inspector-meta">
                  Code: <code>{selectedComp.code}</code> • Type: <strong>{selectedComp.type}</strong> • Format: <strong>{selectedComp.format}</strong>
                </span>
              </div>
            </div>

            <div className="inspector-header-actions">
              <AdminStatusBadge status={selectedComp.status} size="md" />
              <button 
                className="admin-action-btn secondary sm"
                onClick={() => {
                  adminStore.setSelectedCompetitionId(selectedComp.id);
                  onNavigate('seasons');
                }}
              >
                <CalendarRange size={14} /> Open Seasons Hub
              </button>
            </div>
          </div>

          {/* Inspector Context Tabs */}
          <div className="inspector-nav-tabs">
            <button 
              className={`inspector-tab ${activeTab === 'SEASONS' ? 'active' : ''}`}
              onClick={() => setActiveTab('SEASONS')}
            >
              <CalendarRange size={15} /> Seasons & Editions ({compSeasons.length})
            </button>
            <button 
              className={`inspector-tab ${activeTab === 'RULES' ? 'active' : ''}`}
              onClick={() => setActiveTab('RULES')}
            >
              <Sliders size={15} /> Competition Rules & Points
            </button>
            <button 
              className={`inspector-tab ${activeTab === 'STRUCTURE' ? 'active' : ''}`}
              onClick={() => setActiveTab('STRUCTURE')}
            >
              <Layers size={15} /> League Format & Tiebreakers
            </button>
            <button 
              className={`inspector-tab ${activeTab === 'SETTINGS' ? 'active' : ''}`}
              onClick={() => setActiveTab('SETTINGS')}
            >
              <Settings size={15} /> Lifecycle & Settings
            </button>
          </div>

          {/* Tab 1: Seasons List */}
          {activeTab === 'SEASONS' && (
            <div className="inspector-tab-content">
              <div className="content-action-header">
                <div>
                  <h3 className="content-title">Seasons in this Championship</h3>
                  <span className="content-sub">Competitions contain seasons; seasons contain teams, registrations, and fixtures.</span>
                </div>
                <button 
                  className="admin-action-btn primary sm"
                  onClick={() => {
                    adminStore.setSelectedCompetitionId(selectedComp.id);
                    onNavigate('seasons');
                  }}
                >
                  <Plus size={14} /> Open New Season
                </button>
              </div>

              <div className="seasons-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Season Name</th>
                      <th>Calendar Window</th>
                      <th>Lifecycle State</th>
                      <th>Registered Teams</th>
                      <th>Rounds</th>
                      <th>Public Sync</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compSeasons.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.name}</strong>
                          <div className="sub-text">ID: {s.id}</div>
                        </td>
                        <td>
                          <span className="tabular-nums">{s.startDate}</span> to <span className="tabular-nums">{s.endDate}</span>
                        </td>
                        <td>
                          <AdminStatusBadge status={s.status} size="sm" />
                        </td>
                        <td>
                          <span className="count-bubble">{s.participatingTeamIds.length} Teams</span>
                        </td>
                        <td>
                          Round {s.currentRound} / {s.roundsCount}
                        </td>
                        <td>
                          {s.isPublished ? (
                            <span className="sync-chip verified">Published</span>
                          ) : (
                            <span className="sync-chip draft">Draft / Hidden</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="admin-action-btn secondary xs"
                            onClick={() => {
                              adminStore.setSelectedCompetitionId(selectedComp.id);
                              adminStore.setSelectedSeasonId(s.id);
                              onNavigate('seasons', s.id);
                            }}
                          >
                            Manage Season ➔
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Competition Rules */}
          {activeTab === 'RULES' && (
            <div className="inspector-tab-content">
              <div className="content-action-header">
                <div>
                  <h3 className="content-title">Governing Regulation Parameters</h3>
                  <span className="content-sub">Official NSFC match scoring, discipline thresholds, and squad constraints.</span>
                </div>
              </div>

              <div className="rules-display-grid">
                <div className="rule-box">
                  <span className="rule-label">Points for Win</span>
                  <span className="rule-value">{selectedComp.rules?.pointsForWin || 3} Pts</span>
                  <span className="rule-note">Standard FIFA match result calculation</span>
                </div>

                <div className="rule-box">
                  <span className="rule-label">Points for Draw</span>
                  <span className="rule-value">{selectedComp.rules?.pointsForDraw || 1} Pt</span>
                  <span className="rule-note">Awarded to both teams on equal score</span>
                </div>

                <div className="rule-box">
                  <span className="rule-label">Points for Loss</span>
                  <span className="rule-value">{selectedComp.rules?.pointsForLoss || 0} Pts</span>
                  <span className="rule-note">Defeat in regulation match</span>
                </div>

                <div className="rule-box">
                  <span className="rule-label">Max Squad Size</span>
                  <span className="rule-value">{selectedComp.rules?.maxSquadSize || 25} Athletes</span>
                  <span className="rule-note">Roster limit for team registration window</span>
                </div>

                <div className="rule-box">
                  <span className="rule-label">Yellow Card Suspension</span>
                  <span className="rule-value">{selectedComp.rules?.yellowCardSuspensionThreshold || 3} Cards</span>
                  <span className="rule-note">Automated 1-match suspension triggered</span>
                </div>

                <div className="rule-box">
                  <span className="rule-label">Match Duration</span>
                  <span className="rule-value">{selectedComp.rules?.matchDurationMinutes || 90} Mins</span>
                  <span className="rule-note">Two 45-minute halves + stoppage</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Structure & Tiebreaker Order */}
          {activeTab === 'STRUCTURE' && (
            <div className="inspector-tab-content">
              <div className="content-action-header">
                <div>
                  <h3 className="content-title">League Format & Official Tiebreakers</h3>
                  <span className="content-sub">Authoritative ranking methodology for table standings calculation.</span>
                </div>
              </div>

              <div className="tiebreaker-flow">
                <div className="tb-step">
                  <span className="tb-num">1</span>
                  <div className="tb-info">
                    <strong>Total Points Accumulated</strong>
                    <span>Primary ranking criteria across completed certified fixtures</span>
                  </div>
                </div>
                <div className="tb-step">
                  <span className="tb-num">2</span>
                  <div className="tb-info">
                    <strong>Goal Difference (GD)</strong>
                    <span>Total goals scored minus total goals conceded</span>
                  </div>
                </div>
                <div className="tb-step">
                  <span className="tb-num">3</span>
                  <div className="tb-info">
                    <strong>Goals For (GF)</strong>
                    <span>Highest total offensive goals recorded in season</span>
                  </div>
                </div>
                <div className="tb-step">
                  <span className="tb-num">4</span>
                  <div className="tb-info">
                    <strong>Head-to-Head Record</strong>
                    <span>Points earned in direct matches between tied clubs</span>
                  </div>
                </div>
                <div className="tb-step">
                  <span className="tb-num">5</span>
                  <div className="tb-info">
                    <strong>Fair Play Disciplinary Index</strong>
                    <span>Lowest cumulative disciplinary points (Yellow = 1, Red = 3)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Settings & Lifecycle */}
          {activeTab === 'SETTINGS' && (
            <div className="inspector-tab-content">
              <div className="content-action-header">
                <div>
                  <h3 className="content-title">Lifecycle State & Governance Control</h3>
                  <span className="content-sub">Update championship operational posture or archive historic records.</span>
                </div>
              </div>

              <div className="settings-action-cards">
                <div className="settings-card">
                  <h4>Competition Operational Posture</h4>
                  <p>Transitioning status dictates availability for match scheduling and fixture publishing.</p>
                  
                  <div className="status-button-row">
                    <button 
                      className={`status-select-btn ${selectedComp.status === 'ACTIVE' ? 'active' : ''}`}
                      onClick={() => handleStatusChange('ACTIVE')}
                    >
                      Active
                    </button>
                    <button 
                      className={`status-select-btn ${selectedComp.status === 'UPCOMING' ? 'active' : ''}`}
                      onClick={() => handleStatusChange('UPCOMING')}
                    >
                      Upcoming
                    </button>
                    <button 
                      className={`status-select-btn ${selectedComp.status === 'CONCLUDED' ? 'active' : ''}`}
                      onClick={() => handleStatusChange('CONCLUDED')}
                    >
                      Concluded
                    </button>
                    <button 
                      className={`status-select-btn ${selectedComp.status === 'ARCHIVED' ? 'active' : ''}`}
                      onClick={() => handleStatusChange('ARCHIVED')}
                    >
                      Archived
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
