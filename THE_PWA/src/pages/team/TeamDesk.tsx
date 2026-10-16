import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teamDeskStore } from '../../services/teamDeskStore';
import type { SquadPlayer, TeamFixture, RequestCategory } from '../../services/teamDeskStore';

import { OverviewSection } from './sections/OverviewSection';
import { SquadSection } from './sections/SquadSection';
import { FixturesSection } from './sections/FixturesSection';
import { StatsSection } from './sections/StatsSection';
import { SettingsSection } from './sections/SettingsSection';

import { PlayerDetailModal } from './components/PlayerDetailModal';
import { RegisterPlayerModal } from './components/RegisterPlayerModal';
import { MatchPrepDrawer } from './components/MatchPrepDrawer';
import { NewRequestModal } from './components/NewRequestModal';
import { ScheduleTrainingModal } from './components/ScheduleTrainingModal';
import { TeamNoticesModal } from './components/TeamNoticesModal';

import './TeamDesk.css';

export function TeamDesk() {
  const { section } = useParams<{ section: string }>();
  const { user, switchAssignedTeam } = useAuth();

  // Force re-render on store update
  const [, setTick] = useState(0);
  useEffect(() => {
    return teamDeskStore.subscribe(() => setTick(t => t + 1));
  }, []);

  // Determine active team
  const currentTeamId = user?.assignedTeamId || 't2';
  const profile = teamDeskStore.getProfile(currentTeamId);
  const squad = teamDeskStore.getPlayers(currentTeamId);
  const fixtures = teamDeskStore.getFixtures(currentTeamId);
  const nextFixture = teamDeskStore.getNextFixture(currentTeamId);
  const recentResults = teamDeskStore.getRecentResults(currentTeamId);
  const trainingSessions = teamDeskStore.getTrainingSessions(currentTeamId);
  const requests = teamDeskStore.getRequests(currentTeamId);
  const announcements = teamDeskStore.getAnnouncements(currentTeamId);
  const staff = teamDeskStore.getStaff(currentTeamId);

  // Modals state
  const [selectedPlayer, setSelectedPlayer] = useState<SquadPlayer | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedFixtureForPrep, setSelectedFixtureForPrep] = useState<TeamFixture | null>(null);
  const [showScheduleTraining, setShowScheduleTraining] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [requestModalConfig, setRequestModalConfig] = useState<{
    category: RequestCategory;
    linkedEntity?: { type: 'player' | 'fixture' | 'competition'; id: string; name: string };
  } | null>(null);
  const [showNotices, setShowNotices] = useState(false);

  const handleSwitchTeam = (newTeamId: string) => {
    if (switchAssignedTeam) {
      switchAssignedTeam(newTeamId);
    }
  };

  const handleOpenCorrectionRequest = (player: SquadPlayer) => {
    setRequestModalConfig({
      category: 'PLAYER_REGISTRATION',
      linkedEntity: {
        type: 'player',
        id: player.id,
        name: player.name
      }
    });
    setShowNewRequest(true);
  };

  const handleOpenRescheduleRequest = (fixture: TeamFixture) => {
    setRequestModalConfig({
      category: 'FIXTURE_RESCHEDULE',
      linkedEntity: {
        type: 'fixture',
        id: fixture.id,
        name: `${fixture.homeTeamName} vs ${fixture.awayTeamName}`
      }
    });
    setShowNewRequest(true);
  };

  const handleOpenVenueChangeRequest = (fixture: TeamFixture) => {
    setRequestModalConfig({
      category: 'VENUE_CHANGE',
      linkedEntity: {
        type: 'fixture',
        id: fixture.id,
        name: `${fixture.homeTeamName} vs ${fixture.awayTeamName}`
      }
    });
    setShowNewRequest(true);
  };

  // Render appropriate section
  const renderCurrentSection = () => {
    switch (section) {
      case 'overview':
        return (
          <OverviewSection
            profile={profile}
            squad={squad}
            nextFixture={nextFixture}
            recentResults={recentResults}
            requests={requests}
            announcements={announcements}
            managedTeams={user?.managedTeamIds || ['t2', 't1']}
            currentTeamId={currentTeamId}
            onSwitchTeam={handleSwitchTeam}
            onOpenAddPlayer={() => setShowAddPlayer(true)}
            onOpenMatchPrep={f => setSelectedFixtureForPrep(f)}
            onOpenScheduleTraining={() => setShowScheduleTraining(true)}
            onOpenNewRequest={() => {
              setRequestModalConfig(null);
              setShowNewRequest(true);
            }}
            onOpenNotices={() => setShowNotices(true)}
          />
        );

      case 'squad':
        return (
          <SquadSection
            squad={squad}
            teamId={currentTeamId}
            onOpenAddPlayer={() => setShowAddPlayer(true)}
            onOpenPlayerDetail={p => setSelectedPlayer(p)}
            onRequestCorrection={handleOpenCorrectionRequest}
          />
        );

      case 'fixtures':
        return (
          <FixturesSection
            fixtures={fixtures}
            squad={squad}
            teamId={currentTeamId}
            onOpenMatchPrep={f => setSelectedFixtureForPrep(f)}
            onRequestReschedule={handleOpenRescheduleRequest}
            onRequestVenueChange={handleOpenVenueChangeRequest}
          />
        );

      case 'stats':
        return (
          <StatsSection
            squad={squad}
            fixtures={fixtures}
            profile={profile}
            teamId={currentTeamId}
          />
        );

      case 'settings':
        return (
          <SettingsSection
            profile={profile}
            staff={staff}
            trainingSessions={trainingSessions}
            requests={requests}
            announcements={announcements}
            squad={squad}
            teamId={currentTeamId}
            onOpenScheduleTraining={() => setShowScheduleTraining(true)}
            onOpenNewRequest={() => {
              setRequestModalConfig(null);
              setShowNewRequest(true);
            }}
            onOpenNotices={() => setShowNotices(true)}
          />
        );

      default:
        return (
          <OverviewSection
            profile={profile}
            squad={squad}
            nextFixture={nextFixture}
            recentResults={recentResults}
            requests={requests}
            announcements={announcements}
            managedTeams={user?.managedTeamIds || ['t2', 't1']}
            currentTeamId={currentTeamId}
            onSwitchTeam={handleSwitchTeam}
            onOpenAddPlayer={() => setShowAddPlayer(true)}
            onOpenMatchPrep={f => setSelectedFixtureForPrep(f)}
            onOpenScheduleTraining={() => setShowScheduleTraining(true)}
            onOpenNewRequest={() => {
              setRequestModalConfig(null);
              setShowNewRequest(true);
            }}
            onOpenNotices={() => setShowNotices(true)}
          />
        );
    }
  };

  return (
    <div className="team-desk-container">
      {renderCurrentSection()}

      {/* Modals & Slide-overs */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onRequestCorrection={handleOpenCorrectionRequest}
        />
      )}

      {showAddPlayer && (
        <RegisterPlayerModal
          teamId={currentTeamId}
          onClose={() => setShowAddPlayer(false)}
          onSuccess={() => {}}
        />
      )}

      {selectedFixtureForPrep && (
        <MatchPrepDrawer
          fixture={selectedFixtureForPrep}
          squad={squad}
          onClose={() => setSelectedFixtureForPrep(null)}
          onRequestReschedule={handleOpenRescheduleRequest}
          onRequestVenueChange={handleOpenVenueChangeRequest}
        />
      )}

      {showScheduleTraining && (
        <ScheduleTrainingModal
          teamId={currentTeamId}
          onClose={() => setShowScheduleTraining(false)}
          onSuccess={() => {}}
        />
      )}

      {showNewRequest && (
        <NewRequestModal
          teamId={currentTeamId}
          initialCategory={requestModalConfig?.category || 'GENERAL'}
          linkedEntity={requestModalConfig?.linkedEntity}
          onClose={() => setShowNewRequest(false)}
          onSuccess={() => {}}
        />
      )}

      {showNotices && (
        <TeamNoticesModal
          teamId={currentTeamId}
          onClose={() => setShowNotices(false)}
        />
      )}
    </div>
  );
}
