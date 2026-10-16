import React from 'react';
import { 
  Trophy, 
  CalendarRange, 
  Radio, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';

interface AdminOperatingBarProps {
  selectedCompetitionId: string;
  selectedSeasonId: string;
  onSelectCompetition: (id: string) => void;
  onSelectSeason: (id: string) => void;
  onOpenQuickAction?: (action: string) => void;
}

export const AdminOperatingBar: React.FC<AdminOperatingBarProps> = ({
  selectedCompetitionId,
  selectedSeasonId,
  onSelectCompetition,
  onSelectSeason,
}) => {
  const competitions = adminStore.getCompetitions();
  const seasons = adminStore.getSeasons(selectedCompetitionId === 'all' ? undefined : selectedCompetitionId);
  const pulse = adminStore.getPlatformPulse();

  const currentComp = competitions.find(c => c.id === selectedCompetitionId);
  const currentSeason = seasons.find(s => s.id === selectedSeasonId);

  return (
    <div className="admin-operating-bar">
      <div className="admin-context-group">
        <div className="admin-context-pill">
          <span className="context-indicator-dot" />
          <span className="context-label">NSFC GOVERNANCE</span>
          <span className="context-separator">•</span>
          <span className="context-sublabel">Football Council Operations</span>
        </div>

        {/* Competition Operating Selector */}
        <div className="admin-selector-wrapper">
          <Trophy size={15} className="selector-icon" />
          <select
            className="admin-context-select"
            value={selectedCompetitionId}
            onChange={(e) => onSelectCompetition(e.target.value)}
            aria-label="Select Operating Competition"
          >
            <option value="all">All Competitions ({competitions.length})</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name} [{comp.shortName}]
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="selector-chevron" />
        </div>

        {/* Season Operating Selector */}
        <div className="admin-selector-wrapper">
          <CalendarRange size={15} className="selector-icon" />
          <select
            className="admin-context-select"
            value={selectedSeasonId}
            onChange={(e) => onSelectSeason(e.target.value)}
            aria-label="Select Operating Season"
          >
            <option value="all">All Seasons</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} ({season.status.replace('_', ' ')})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="selector-chevron" />
        </div>
      </div>

      <div className="admin-bar-right">
        {pulse.liveMatchesCount > 0 ? (
          <div className="admin-live-pulse-chip">
            <Radio size={14} className="pulse-live-icon" />
            <span>{pulse.liveMatchesCount} MATCH LIVE</span>
          </div>
        ) : pulse.pendingReviewCount > 0 ? (
          <div className="admin-pending-pulse-chip">
            <span className="pending-dot" />
            <span>{pulse.pendingReviewCount} AWAITING VERIFICATION</span>
          </div>
        ) : (
          <div className="admin-system-ready-chip">
            <Layers size={13} />
            <span>STANDINGS SYNCHRONIZED</span>
          </div>
        )}

        <div className="admin-current-scope-info" title={currentComp?.name || 'All Competitions'}>
          <span className="scope-name">
            {selectedCompetitionId === 'all' ? 'All Competitions' : currentComp?.shortName || currentComp?.name}
          </span>
          <span className="scope-season">
            {selectedSeasonId === 'all' ? 'All Editions' : currentSeason?.name || 'Active Season'}
          </span>
        </div>
      </div>
    </div>
  );
};
