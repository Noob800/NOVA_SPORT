import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  adminStore, 
  type AdminStoreState 
} from '../../services/adminStore';
import { matchStore } from '../../services/matchStore';

// Components
import { AdminOperatingBar } from './components/AdminOperatingBar';
import { AdminBreadcrumbs, type BreadcrumbItem } from './components/AdminBreadcrumbs';

// Consolidated Lean Views
import { CommandCentreView } from './views/CommandCentreView';
import { LeaguesView } from './views/LeaguesView';
import { TeamsRostersView } from './views/TeamsRostersView';
import { OfficialsDirectoryView } from './views/OfficialsDirectoryView';
import { MatchOfficialView } from './views/MatchOfficialView';
import { ResultsStatsView } from './views/ResultsStatsView';
import { PublishingView } from './views/PublishingView';
import { GovernanceView } from './views/GovernanceView';

import { X } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { section = 'command-centre', subId } = useParams<{ section?: string; subId?: string }>();
  const navigate = useNavigate();

  // Store subscription
  const [storeState, setStoreState] = useState<AdminStoreState>(adminStore.getState());

  useEffect(() => {
    const unsubAdmin = adminStore.subscribe((state) => {
      if (state) {
        setStoreState(state);
      } else {
        setStoreState(adminStore.getState());
      }
    });
    const unsubMatches = matchStore.subscribe(() => {
      // Trigger update when matches mutate
      setStoreState(adminStore.getState());
    });
    return () => {
      unsubAdmin();
      unsubMatches();
    };
  }, []);

  // Global Dialog Modals
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showFixtureModal, setShowFixtureModal] = useState(false);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Form States for Modals
  const [competitionForm, setCompetitionForm] = useState({
    name: '',
    shortName: '',
    tier: 'Tier 1 - Varsity Premier League',
    type: 'LEAGUE' as 'LEAGUE' | 'CUP' | 'TOURNAMENT',
    format: 'Double Round-Robin',
    teamCount: 8,
    roundsCount: 14,
    description: ''
  });

  const [seasonForm, setSeasonForm] = useState({
    competitionId: storeState.selectedCompetitionId || 'c1',
    name: '',
    year: '2026/27',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 180).toISOString().split('T')[0],
    registrationDeadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    roundsCount: 14,
    rulesSummary: 'Standard NSFC 3-pts win; 3 yellow cards = 1 match suspension.'
  });

  const [teamForm, setTeamForm] = useState({
    name: '',
    shortCode: '',
    city: 'Meru',
    stadium: '',
    coachName: '',
    coachEmail: '',
    coachPhone: '+254 700 000 000',
    division: 'Premier Division'
  });

  const [fixtureForm, setFixtureForm] = useState({
    homeTeamId: 't1',
    awayTeamId: 't2',
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    venue: 'Main Campus Stadium, Meru',
    round: 'Regular Fixture',
    referee: 'James Mwangi'
  });

  const [sanctionForm, setSanctionForm] = useState({
    targetType: 'PLAYER' as 'PLAYER' | 'COACH' | 'TEAM' | 'OFFICIAL',
    targetName: '',
    teamName: '',
    violation: '',
    sanctionType: 'MATCH_BAN' as 'MATCH_BAN' | 'FINE' | 'WARNING' | 'POINTS_DEDUCTION',
    penalty: '1-Match Suspension',
    pointsDeducted: 3,
    fineAmountKes: 10000,
    matchOrContext: ''
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    targetAudience: 'ALL' as 'ALL' | 'COACHES' | 'OFFICIALS' | 'PUBLIC',
    priority: 'IMPORTANT' as 'NORMAL' | 'IMPORTANT' | 'URGENT',
    author: 'NSFC Secretariat',
    isPinned: false
  });

  // Navigate helper
  const handleNavigate = (targetSection: string, targetSubId?: string) => {
    if (targetSubId) {
      navigate(`/workspace/admin/${targetSection}/${targetSubId}`);
    } else {
      navigate(`/workspace/admin/${targetSection}`);
    }
  };

  // Form Submissions
  const handleCreateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionForm.name.trim()) return;

    const newComp = adminStore.createCompetition({
      name: competitionForm.name.trim(),
      shortName: competitionForm.shortName.trim() || competitionForm.name.substring(0, 3).toUpperCase(),
      code: `${competitionForm.name.substring(0, 3).toUpperCase()}-LEAGUE`,
      governingBody: 'NSFC (NovaSport Football Council)',
      tier: competitionForm.tier,
      type: competitionForm.type,
      format: competitionForm.format,
      teamCount: competitionForm.teamCount,
      roundsCount: competitionForm.roundsCount,
      currentRound: 1,
      description: competitionForm.description.trim() || 'Competition governed by NSFC.'
    });

    setShowCompetitionModal(false);
    setCompetitionForm({
      name: '',
      shortName: '',
      tier: 'Tier 1 - Varsity Premier League',
      type: 'LEAGUE',
      format: 'Double Round-Robin',
      teamCount: 8,
      roundsCount: 14,
      description: ''
    });

    adminStore.setSelectedCompetitionId(newComp.id);
    navigate('/workspace/admin/competitions');
  };

  const handleCreateSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonForm.name.trim()) return;

    const newSeason = adminStore.createSeason({
      competitionId: seasonForm.competitionId,
      name: seasonForm.name.trim(),
      year: seasonForm.year,
      status: 'PLANNING',
      startDate: seasonForm.startDate,
      endDate: seasonForm.endDate,
      registrationDeadline: seasonForm.registrationDeadline,
      participatingTeamIds: ['t1', 't2', 't3', 't4'],
      roundsCount: seasonForm.roundsCount,
      currentRound: 0,
      rulesSummary: seasonForm.rulesSummary,
      isPublished: false
    });

    setShowSeasonModal(false);
    adminStore.setSelectedSeasonId(newSeason.id);
    navigate('/workspace/admin/seasons');
  };

  const handleRegisterTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return;

    adminStore.registerTeam({
      name: teamForm.name.trim(),
      shortCode: teamForm.shortCode.trim() || teamForm.name.substring(0, 3).toUpperCase(),
      stadium: teamForm.stadium.trim() || 'Main Stadium Grounds',
      city: teamForm.city,
      headCoachName: teamForm.coachName || 'Appointed Head Coach',
      headCoachEmail: teamForm.coachEmail || 'coach@novasport.ke',
      headCoachPhone: teamForm.coachPhone,
      division: teamForm.division
    });

    setShowTeamModal(false);
    setTeamForm({
      name: '',
      shortCode: '',
      city: 'Meru',
      stadium: '',
      coachName: '',
      coachEmail: '',
      coachPhone: '+254 700 000 000',
      division: 'Premier Division'
    });
    navigate('/workspace/admin/teams-players');
  };

  const handleScheduleFixture = (e: React.FormEvent) => {
    e.preventDefault();
    const homeTeam = storeState.teams.find(t => t.id === fixtureForm.homeTeamId);
    const awayTeam = storeState.teams.find(t => t.id === fixtureForm.awayTeamId);

    if (fixtureForm.homeTeamId === fixtureForm.awayTeamId) {
      alert('A club cannot play against itself. Please choose distinct home and away teams.');
      return;
    }

    adminStore.scheduleFixture({
      competitionId: storeState.selectedCompetitionId,
      seasonId: storeState.selectedSeasonId,
      homeTeamId: fixtureForm.homeTeamId,
      awayTeamId: fixtureForm.awayTeamId,
      homeTeam: homeTeam?.name || 'Home Club',
      awayTeam: awayTeam?.name || 'Away Club',
      date: fixtureForm.date,
      time: fixtureForm.time,
      venue: fixtureForm.venue,
      round: fixtureForm.round,
      referee: fixtureForm.referee
    });

    setShowFixtureModal(false);
    navigate('/workspace/admin/match-operations');
  };

  const handleIssueSanction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanctionForm.targetName.trim() || !sanctionForm.violation.trim()) return;

    adminStore.issueSanction({
      targetType: sanctionForm.targetType,
      targetName: sanctionForm.targetName.trim(),
      teamName: sanctionForm.teamName.trim() || 'Affiliated Club',
      violation: sanctionForm.violation.trim(),
      sanctionType: sanctionForm.sanctionType,
      penalty: sanctionForm.penalty,
      pointsDeducted: sanctionForm.sanctionType === 'POINTS_DEDUCTION' ? sanctionForm.pointsDeducted : undefined,
      fineAmountKes: sanctionForm.sanctionType === 'FINE' ? sanctionForm.fineAmountKes : undefined,
      matchOrContext: sanctionForm.matchOrContext.trim() || 'League Regulation Violation'
    });

    setShowSanctionModal(false);
    navigate('/workspace/admin/teams-players');
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;

    adminStore.publishAnnouncement({
      title: announcementForm.title.trim(),
      content: announcementForm.content.trim(),
      targetAudience: announcementForm.targetAudience,
      priority: announcementForm.priority,
      author: announcementForm.author || 'NSFC Secretariat',
      isPinned: announcementForm.isPinned,
      relatedCompetitionId: storeState.selectedCompetitionId,
      relatedSeasonId: storeState.selectedSeasonId
    });

    setShowAnnouncementModal(false);
    navigate('/workspace/admin/publishing');
  };

  // Generate Breadcrumbs
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    switch (section) {
      case 'overview':
      case 'command-centre':
        items.push({ label: 'Overview', active: true });
        break;
      case 'leagues':
      case 'competitions':
      case 'seasons':
        items.push({ label: 'Leagues & Seasons', path: '/workspace/admin/leagues' });
        if (subId) items.push({ label: `Season: ${subId}`, active: true });
        break;
      case 'teams':
      case 'teams-players':
      case 'rosters':
        items.push({ label: 'Teams & Rosters', path: '/workspace/admin/teams' });
        if (subId) items.push({ label: `Club: ${subId}`, active: true });
        break;
      case 'officials':
      case 'official-directory':
        items.push({ label: 'Official Directory', path: '/workspace/admin/officials', active: true });
        break;
      case 'match-official':
      case 'matches':
      case 'match-operations':
      case 'fixtures':
        items.push({ label: 'Match Official', path: '/workspace/admin/match-official' });
        if (subId) items.push({ label: `Fixture #${subId}`, active: true });
        break;
      case 'results-stats':
      case 'results':
        items.push({ label: 'Results & Statistics', active: true });
        break;
      case 'publishing':
      case 'announcements':
        items.push({ label: 'Content & Publishing', active: true });
        break;
      case 'governance':
      case 'discipline':
        items.push({ label: 'Governance & Settings', active: true });
        break;
      default:
        items.push({ label: 'Overview', active: true });
    }

    return items;
  };

  // Render Section
  const renderCurrentSection = () => {
    switch (section) {
      case 'overview':
      case 'command-centre':
        return (
          <CommandCentreView 
            onNavigate={handleNavigate}
            onOpenScheduleModal={() => setShowFixtureModal(true)}
            onOpenTeamModal={() => setShowTeamModal(true)}
            onOpenCompetitionModal={() => setShowCompetitionModal(true)}
          />
        );

      case 'leagues':
      case 'competitions':
      case 'seasons':
        return (
          <LeaguesView 
            onNavigate={handleNavigate}
            onOpenScheduleModal={() => setShowFixtureModal(true)}
          />
        );

      case 'teams':
      case 'teams-players':
      case 'rosters':
        return (
          <TeamsRostersView 
            onNavigate={handleNavigate}
            onOpenRegisterTeamModal={() => setShowTeamModal(true)}
          />
        );

      case 'officials':
      case 'official-directory':
        return (
          <OfficialsDirectoryView 
            onNavigate={handleNavigate}
          />
        );

      case 'match-official':
      case 'matches':
      case 'match-operations':
      case 'fixtures':
        return (
          <MatchOfficialView 
            onNavigate={handleNavigate}
          />
        );

      case 'results-stats':
      case 'results':
        return (
          <ResultsStatsView 
            onNavigate={handleNavigate}
          />
        );

      case 'publishing':
      case 'announcements':
        return (
          <PublishingView 
            onNavigate={handleNavigate}
            onOpenNewAnnouncementModal={() => setShowAnnouncementModal(true)}
          />
        );

      case 'governance':
      case 'discipline':
        return (
          <GovernanceView 
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <CommandCentreView 
            onNavigate={handleNavigate}
            onOpenScheduleModal={() => setShowFixtureModal(true)}
            onOpenTeamModal={() => setShowTeamModal(true)}
            onOpenCompetitionModal={() => setShowCompetitionModal(true)}
          />
        );
    }
  };

  return (
    <div className="admin-root-container">
      {/* Operating Context Bar with Competition & Season Filter */}
      <AdminOperatingBar 
        selectedCompetitionId={storeState.selectedCompetitionId}
        selectedSeasonId={storeState.selectedSeasonId}
        onSelectCompetition={(id) => adminStore.setSelectedCompetitionId(id)}
        onSelectSeason={(id) => adminStore.setSelectedSeasonId(id)}
      />

      {/* Breadcrumb Context Path */}
      <div className="admin-subnav-bar">
        <AdminBreadcrumbs items={getBreadcrumbs()} />
      </div>

      {/* Main View Area */}
      <div className="admin-view-viewport">
        {renderCurrentSection()}
      </div>

      {/* =========================================================================
          GLOBAL ADMINISTRATIVE DIALOG MODALS
          ========================================================================= */}

      {/* 1. Create Competition Modal */}
      {showCompetitionModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCompetitionModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Create NSFC Competition</h3>
                <span className="modal-subtitle">Establish Championship Identity, Tier, and Rules</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowCompetitionModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCompetition}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Competition Name *</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    placeholder="e.g. Kenya Varsity Premier League"
                    value={competitionForm.name}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Short Acronym Code</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="e.g. KVL"
                      value={competitionForm.shortName}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, shortName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tournament Type *</label>
                    <select 
                      className="admin-select"
                      value={competitionForm.type}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, type: e.target.value as any })}
                    >
                      <option value="LEAGUE">League (Points Table)</option>
                      <option value="CUP">Cup (Single Elimination)</option>
                      <option value="TOURNAMENT">Tournament (Group + Knockout)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Tier Designation</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={competitionForm.tier}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, tier: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Format</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={competitionForm.format}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, format: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Governing Scope</label>
                  <textarea 
                    className="admin-textarea"
                    rows={2}
                    placeholder="Provide overview of championship jurisdiction..."
                    value={competitionForm.description}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowCompetitionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save & Initialize Competition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Initialize Season Modal */}
      {showSeasonModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSeasonModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Open New Season Edition</h3>
                <span className="modal-subtitle">Set Calendar, Rounds, and Registration Deadline</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSeasonModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSeason}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Parent Championship *</label>
                  <select 
                    className="admin-select"
                    value={seasonForm.competitionId}
                    onChange={(e) => setSeasonForm({ ...seasonForm, competitionId: e.target.value })}
                  >
                    {storeState.competitions.map(c => (
                      <option key={c.id} value={c.id}>{c.name} [{c.shortName}]</option>
                    ))}
                  </select>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Season Edition Name *</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="e.g. Season 9 (2027/28)"
                      value={seasonForm.name}
                      onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="2027/28"
                      value={seasonForm.year}
                      onChange={(e) => setSeasonForm({ ...seasonForm, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Kickoff Start Date *</label>
                    <input 
                      type="date" 
                      className="admin-input" 
                      value={seasonForm.startDate}
                      onChange={(e) => setSeasonForm({ ...seasonForm, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Season End Date *</label>
                    <input 
                      type="date" 
                      className="admin-input" 
                      value={seasonForm.endDate}
                      onChange={(e) => setSeasonForm({ ...seasonForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Roster Registration Deadline</label>
                  <input 
                    type="date" 
                    className="admin-input" 
                    value={seasonForm.registrationDeadline}
                    onChange={(e) => setSeasonForm({ ...seasonForm, registrationDeadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowSeasonModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Initialize Season Edition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Register Club Modal */}
      {showTeamModal && (
        <div className="admin-modal-overlay" onClick={() => setShowTeamModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Register Participating Club</h3>
                <span className="modal-subtitle">NSFC Official Team Affiliation</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowTeamModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterTeam}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Club Full Name *</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    placeholder="e.g. Meru Technical Stars FC"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">3-Letter Code</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="MTS"
                      value={teamForm.shortCode}
                      onChange={(e) => setTeamForm({ ...teamForm, shortCode: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Home Ground / Stadium *</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="e.g. Kinoru Stadium"
                      value={teamForm.stadium}
                      onChange={(e) => setTeamForm({ ...teamForm, stadium: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Head Coach Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="e.g. Coach Dennis Munene"
                      value={teamForm.coachName}
                      onChange={(e) => setTeamForm({ ...teamForm, coachName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Coach Email Address</label>
                    <input 
                      type="email" 
                      className="admin-input" 
                      placeholder="coach@merutech.ke"
                      value={teamForm.coachEmail}
                      onChange={(e) => setTeamForm({ ...teamForm, coachEmail: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowTeamModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Affiliate Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Schedule Fixture Modal */}
      {showFixtureModal && (
        <div className="admin-modal-overlay" onClick={() => setShowFixtureModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Schedule New Fixture</h3>
                <span className="modal-subtitle">Match Operations Calendar</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowFixtureModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleFixture}>
              <div className="modal-body form-body">
                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Home Club *</label>
                    <select 
                      className="admin-select"
                      value={fixtureForm.homeTeamId}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, homeTeamId: e.target.value })}
                    >
                      {storeState.teams.map(t => (
                        <option key={t.id} value={t.id}>{t.logo} {t.name} ({t.shortName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Away Club *</label>
                    <select 
                      className="admin-select"
                      value={fixtureForm.awayTeamId}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, awayTeamId: e.target.value })}
                    >
                      {storeState.teams.map(t => (
                        <option key={t.id} value={t.id}>{t.logo} {t.name} ({t.shortName})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Kickoff Date *</label>
                    <input 
                      type="date" 
                      className="admin-input" 
                      value={fixtureForm.date}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kickoff Time *</label>
                    <input 
                      type="time" 
                      className="admin-input" 
                      value={fixtureForm.time}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Stadium / Pitch Venue *</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    value={fixtureForm.venue}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, venue: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Matchday Round</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="e.g. Round 7"
                      value={fixtureForm.round}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, round: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Appoint Center Referee</label>
                    <select 
                      className="admin-select"
                      value={fixtureForm.referee}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, referee: e.target.value })}
                    >
                      {storeState.officials.map(o => (
                        <option key={o.id} value={o.name}>{o.name} ({o.badge})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowFixtureModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Schedule Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Issue Disciplinary Sanction Modal */}
      {showSanctionModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSanctionModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Issue Disciplinary Sanction</h3>
                <span className="modal-subtitle">NSFC Disciplinary Tribunal Tribunal Order</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSanctionModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueSanction}>
              <div className="modal-body form-body">
                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Target Entity *</label>
                    <select 
                      className="admin-select"
                      value={sanctionForm.targetType}
                      onChange={(e) => setSanctionForm({ ...sanctionForm, targetType: e.target.value as any })}
                    >
                      <option value="PLAYER">Player</option>
                      <option value="COACH">Coach / Team Official</option>
                      <option value="TEAM">Club / Team</option>
                      <option value="OFFICIAL">Match Official</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Name *</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="e.g. Dennis Omondi"
                      value={sanctionForm.targetName}
                      onChange={(e) => setSanctionForm({ ...sanctionForm, targetName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Sanction Type *</label>
                    <select 
                      className="admin-select"
                      value={sanctionForm.sanctionType}
                      onChange={(e) => setSanctionForm({ ...sanctionForm, sanctionType: e.target.value as any })}
                    >
                      <option value="MATCH_BAN">Match Ban (Suspension)</option>
                      <option value="FINE">Financial Penalty (Fine)</option>
                      <option value="POINTS_DEDUCTION">Table Points Deduction</option>
                      <option value="WARNING">Official Warning</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Penalty Description</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      placeholder="e.g. 2-Match Suspension"
                      value={sanctionForm.penalty}
                      onChange={(e) => setSanctionForm({ ...sanctionForm, penalty: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Regulatory Violation Details *</label>
                  <textarea 
                    className="admin-textarea"
                    rows={3}
                    placeholder="Describe specific incident, referee report references, and violated regulation articles..."
                    value={sanctionForm.violation}
                    onChange={(e) => setSanctionForm({ ...sanctionForm, violation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowSanctionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn destructive">
                  Issue Disciplinary Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Publish Announcement Modal */}
      {showAnnouncementModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Publish Official Bulletin</h3>
                <span className="modal-subtitle">NSFC Broadcast to Coaches, Referees, and Public</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAnnouncementModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Bulletin Title *</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    placeholder="e.g. Circular #15: Matchday 8 Technical Guidelines"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Target Audience *</label>
                    <select 
                      className="admin-select"
                      value={announcementForm.targetAudience}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value as any })}
                    >
                      <option value="ALL">All Participants (Coaches, Referees, Public)</option>
                      <option value="COACHES">Coaches & Team Staff Only</option>
                      <option value="OFFICIALS">Match Officials Only</option>
                      <option value="PUBLIC">Public & Fans</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority Level *</label>
                    <select 
                      className="admin-select"
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
                    >
                      <option value="NORMAL">Standard Information</option>
                      <option value="IMPORTANT">Important Directive</option>
                      <option value="URGENT">Urgent Regulatory Notice</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bulletin Text Content *</label>
                  <textarea 
                    className="admin-textarea"
                    rows={4}
                    placeholder="Enter directive body..."
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowAnnouncementModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Broadcast Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
