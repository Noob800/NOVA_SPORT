import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar, 
  Plus, 
  Wand2, 
  Users, 
  BarChart3, 
  Archive, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Settings,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Check
} from 'lucide-react';
import { 
  adminStore, 
  type AdminTeamRecord
} from '../../../services/adminStore';
import { matchStore, type OfficialMatchData } from '../../../services/matchStore';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

interface LeaguesViewProps {
  onNavigate?: (section: string, subId?: string) => void;
  onOpenScheduleModal: () => void;
}

export const LeaguesView: React.FC<LeaguesViewProps> = ({
  onOpenScheduleModal
}) => {
  const competitions = adminStore.getCompetitions();
  const [selectedCompId, setSelectedCompId] = useState<string>(
    adminStore.getSelectedCompetitionId() || competitions[0]?.id || 'c1'
  );

  const selectedComp = competitions.find(c => c.id === selectedCompId) || competitions[0];
  const activeSeason = adminStore.getActiveSeason(selectedComp?.id);
  const pastSeasons = adminStore.getPastSeasons(selectedComp?.id);
  const allTeams = adminStore.getTeams();
  const approvedTeams = allTeams.filter(t => t.status === 'ACTIVE');
  const officials = adminStore.getOfficials();
  const allMatches = matchStore.getAllMatches();

  // Active view tab inside Leagues: FIXTURES, TEAMS, STANDINGS, PAST_SEASONS
  const [activeTab, setActiveTab] = useState<'FIXTURES' | 'TEAMS' | 'STANDINGS' | 'PAST_SEASONS'>('FIXTURES');
  const [selectedHistoricalSeasonId, setSelectedHistoricalSeasonId] = useState<string>(
    pastSeasons[0]?.id || ''
  );

  // Notifications
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3500);
  };

  // Modals inside Leagues
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
  const [autoGenStep, setAutoGenStep] = useState<1 | 2>(1);
  const [selectedTeamsForGen, setSelectedTeamsForGen] = useState<string[]>([]);
  const [previewSchedule, setPreviewSchedule] = useState<Array<{
    round: number;
    matchIndex: number;
    homeTeam: AdminTeamRecord;
    awayTeam: AdminTeamRecord;
    date: string;
    time: string;
    venue: string;
  }>>([]);
  const [validationReport, setValidationReport] = useState<{
    totalMatches: number;
    totalRounds: number;
    duplicatePairings: number;
    hasOddTeams: boolean;
    missingTeams: string[];
    conflicts: string[];
    isValid: boolean;
  }>({
    totalMatches: 0,
    totalRounds: 0,
    duplicatePairings: 0,
    hasOddTeams: false,
    missingTeams: [],
    conflicts: [],
    isValid: true
  });
  const [autoGenForm, setAutoGenForm] = useState({
    doubleRoundRobin: true,
    startDate: new Date().toISOString().split('T')[0],
    daysBetweenRounds: 7,
    matchTimes: ['13:00', '15:00', '16:30']
  });

  const [showEditLeagueModal, setShowEditLeagueModal] = useState(false);
  const [editLeagueForm, setEditLeagueForm] = useState({
    name: selectedComp?.name || '',
    shortName: selectedComp?.shortName || '',
    tier: selectedComp?.tier || '',
    format: selectedComp?.format || 'Double Round-Robin',
    description: selectedComp?.description || ''
  });

  const [showEditSeasonModal, setShowEditSeasonModal] = useState(false);
  const [editSeasonForm, setEditSeasonForm] = useState({
    name: activeSeason?.name || '',
    year: activeSeason?.year || '2026/27',
    startDate: activeSeason?.startDate || '',
    endDate: activeSeason?.endDate || '',
    rulesSummary: activeSeason?.rulesSummary || ''
  });

  const [showEnrollTeamModal, setShowEnrollTeamModal] = useState(false);
  const [selectedTeamToEnroll, setSelectedTeamToEnroll] = useState<string>('');

  const [editingFixture, setEditingFixture] = useState<OfficialMatchData | null>(null);
  const [editFixtureForm, setEditFixtureForm] = useState({
    date: '',
    time: '',
    venue: '',
    round: '',
    referee: '',
    status: 'SCHEDULED' as OfficialMatchData['status']
  });

  // Target season for current viewing
  const viewingSeason = activeTab === 'PAST_SEASONS'
    ? pastSeasons.find(s => s.id === selectedHistoricalSeasonId) || pastSeasons[0]
    : activeSeason;

  // Filter matches for viewing season
  const seasonMatches = allMatches.filter(m => {
    if (!viewingSeason) return false;
    return (m as any).seasonId === viewingSeason.id || 
           m.season === viewingSeason.name ||
           m.competition.season?.includes(viewingSeason.name);
  });

  // Teams in viewing season
  const enrolledTeamIds = viewingSeason?.participatingTeamIds || [];
  const enrolledTeams = enrolledTeamIds
    .map(id => allTeams.find(t => t.id === id))
    .filter((t): t is AdminTeamRecord => !!t);

  // Standings
  const seasonStandings = adminStore.calculateStandings(viewingSeason?.id);

  // Handlers
  const handleSelectCompetition = (compId: string) => {
    setSelectedCompId(compId);
    adminStore.setSelectedCompetitionId(compId);
    const newActive = adminStore.getActiveSeason(compId);
    if (newActive) {
      adminStore.setSelectedSeasonId(newActive.id);
    }
  };

  const handleOpenAutoGenerateModal = () => {
    setAutoGenStep(1);
    setSelectedTeamsForGen(enrolledTeamIds);
    setShowAutoGenerateModal(true);
  };

  const handleToggleTeamForGen = (teamId: string) => {
    setSelectedTeamsForGen(prev => 
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handlePreviewGeneration = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeamsForGen.length < 2) {
      showNotice('Select at least 2 teams to generate fixtures.', 'error');
      return;
    }

    const teamsToSchedule = selectedTeamsForGen
      .map(id => allTeams.find(t => t.id === id))
      .filter((t): t is AdminTeamRecord => !!t);

    const isOdd = teamsToSchedule.length % 2 !== 0;
    const workingTeams: (AdminTeamRecord | null)[] = [...teamsToSchedule];
    if (isOdd) {
      workingTeams.push(null); // Bye indicator
    }

    const n = workingTeams.length;
    const roundsInSingle = n - 1;
    const matchesPerRound = n / 2;

    const roundList: Array<{
      round: number;
      matchIndex: number;
      homeTeam: AdminTeamRecord;
      awayTeam: AdminTeamRecord;
      date: string;
      time: string;
      venue: string;
    }> = [];

    let currentList = [...workingTeams];
    const matchTimes = autoGenForm.matchTimes || ['13:00', '15:00', '16:30'];
    const startDate = new Date(autoGenForm.startDate);

    const generateRounds = (isSecondLeg: boolean, roundOffset: number) => {
      for (let r = 0; r < roundsInSingle; r++) {
        const roundNum = roundOffset + r + 1;
        const roundDate = new Date(startDate.getTime() + (roundNum - 1) * autoGenForm.daysBetweenRounds * 86400000);
        const dateStr = roundDate.toISOString().split('T')[0];

        let timeIdx = 0;
        for (let m = 0; m < matchesPerRound; m++) {
          const t1 = currentList[m];
          const t2 = currentList[n - 1 - m];

          if (t1 && t2) {
            const home = isSecondLeg ? t2 : (r % 2 === 0 ? t1 : t2);
            const away = isSecondLeg ? t1 : (r % 2 === 0 ? t2 : t1);
            roundList.push({
              round: roundNum,
              matchIndex: roundList.length + 1,
              homeTeam: home,
              awayTeam: away,
              date: dateStr,
              time: matchTimes[timeIdx % matchTimes.length],
              venue: home.stadium || 'Main Campus Stadium'
            });
            timeIdx++;
          }
        }

        // Berger rotation (keep element 0 fixed, rotate others)
        const fixed = currentList[0];
        const rest = currentList.slice(1);
        const last = rest.pop();
        if (last !== undefined) rest.unshift(last);
        currentList = [fixed, ...rest];
      }
    };

    generateRounds(false, 0);
    if (autoGenForm.doubleRoundRobin) {
      currentList = [...workingTeams];
      generateRounds(true, roundsInSingle);
    }

    // Constraint Validations
    const pairingKeys = new Set<string>();
    let duplicatePairs = 0;
    roundList.forEach(item => {
      const pairKey = `${item.round}-${item.homeTeam.id}-${item.awayTeam.id}`;
      if (pairingKeys.has(pairKey)) {
        duplicatePairs++;
      }
      pairingKeys.add(pairKey);
    });

    const missing = enrolledTeamIds.filter(id => !selectedTeamsForGen.includes(id))
      .map(id => allTeams.find(t => t.id === id)?.name || id);

    setPreviewSchedule(roundList);
    setValidationReport({
      totalMatches: roundList.length,
      totalRounds: autoGenForm.doubleRoundRobin ? roundsInSingle * 2 : roundsInSingle,
      duplicatePairings: duplicatePairs,
      hasOddTeams: isOdd,
      missingTeams: missing,
      conflicts: [],
      isValid: duplicatePairs === 0
    });

    setAutoGenStep(2);
  };

  const handleConfirmCommitSchedule = () => {
    if (!activeSeason) return;

    try {
      const generated = adminStore.generateSeasonFixtures(activeSeason.id, {
        doubleRoundRobin: autoGenForm.doubleRoundRobin,
        startDate: autoGenForm.startDate,
        daysBetweenRounds: autoGenForm.daysBetweenRounds,
        matchTimes: autoGenForm.matchTimes
      });
      setShowAutoGenerateModal(false);
      setAutoGenStep(1);
      showNotice(`Successfully committed ${generated.length} validated league fixtures for ${activeSeason.name}.`);
    } catch (err: any) {
      showNotice(err.message || 'Failed to auto-generate fixtures.', 'error');
    }
  };

  const handleEnrollTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason || !selectedTeamToEnroll) return;

    try {
      adminStore.addTeamToSeason(activeSeason.id, selectedTeamToEnroll);
      setShowEnrollTeamModal(false);
      setSelectedTeamToEnroll('');
      showNotice('Approved team enrolled into the active season.');
    } catch (err: any) {
      showNotice(err.message || 'Failed to enroll team.', 'error');
    }
  };

  const handleRemoveTeam = (teamId: string, teamName: string) => {
    if (!activeSeason) return;
    if (confirm(`Remove '${teamName}' from ${activeSeason.name}?`)) {
      adminStore.removeTeamFromSeason(activeSeason.id, teamId);
      showNotice(`Removed '${teamName}' from active season.`);
    }
  };

  const handleOpenEditFixture = (match: OfficialMatchData) => {
    setEditingFixture(match);
    const assignedRef = match.officials.find(o => o.role === 'Center Referee')?.name || '';
    setEditFixtureForm({
      date: match.date,
      time: match.time,
      venue: match.venue,
      round: match.round || '',
      referee: assignedRef,
      status: match.status
    });
  };

  const handleSaveFixtureEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture) return;

    adminStore.updateFixture(editingFixture.id, {
      date: editFixtureForm.date,
      time: editFixtureForm.time,
      venue: editFixtureForm.venue,
      round: editFixtureForm.round,
      referee: editFixtureForm.referee,
      status: editFixtureForm.status
    });

    setEditingFixture(null);
    showNotice(`Fixture #${editingFixture.id} updated.`);
  };

  const handleDeleteFixture = (matchId: string) => {
    if (confirm('Are you sure you want to delete this scheduled fixture?')) {
      adminStore.deleteFixture(matchId);
      showNotice('Fixture deleted.');
    }
  };

  const handleSwitchActiveSeason = (seasonId: string) => {
    if (!selectedComp) return;
    if (confirm('Switch this season to be the sole ACTIVE season for this league? Any other in-progress season will be concluded.')) {
      adminStore.setActiveSeason(selectedComp.id, seasonId);
      showNotice('Active season updated. Past season data is archived safely.');
      setActiveTab('FIXTURES');
    }
  };

  return (
    <div className="admin-module-container">
      {/* Top Header & League Switcher */}
      <div className="module-top-bar">
        <div>
          <div className="module-eyebrow">
            <Trophy size={14} className="eyebrow-icon" />
            <span>LEAGUE & SEASON MANAGEMENT</span>
          </div>
          <h1 className="module-title">{selectedComp?.name || 'KeMU Super League'}</h1>
          <p className="module-subtitle">
            Single active season control, fixture generator, club participation, and archived past seasons.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* League Picker if multiple exist */}
          {competitions.length > 1 && (
            <select 
              className="admin-select"
              style={{ width: 'auto', background: 'var(--pitch-black)' }}
              value={selectedCompId}
              onChange={(e) => handleSelectCompetition(e.target.value)}
            >
              {competitions.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          <button 
            className="admin-action-btn secondary"
            onClick={() => {
              setEditLeagueForm({
                name: selectedComp?.name || '',
                shortName: selectedComp?.shortName || '',
                tier: selectedComp?.tier || '',
                format: selectedComp?.format || '',
                description: selectedComp?.description || ''
              });
              setShowEditLeagueModal(true);
            }}
          >
            <Settings size={14} /> League Settings
          </button>
        </div>
      </div>

      {notice && (
        <div className={`admin-inline-alert ${notice.type === 'error' ? 'error' : 'success'}`}>
          {notice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Active Season Banner vs Historical Mode */}
      <div className="admin-card active-season-banner" style={{
        background: activeTab === 'PAST_SEASONS' ? '#14171d' : 'linear-gradient(135deg, #18191c 0%, #101113 100%)',
        border: activeTab === 'PAST_SEASONS' ? '1px dashed #3A3D45' : '1px solid rgba(255, 106, 0, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 22px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ 
                background: activeTab === 'PAST_SEASONS' ? '#4A4D55' : 'var(--nova-orange)', 
                color: activeTab === 'PAST_SEASONS' ? '#fff' : '#000', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '0.72rem', 
                fontWeight: 800,
                letterSpacing: '0.5px'
              }}>
                {activeTab === 'PAST_SEASONS' ? 'HISTORICAL ARCHIVE' : 'ACTIVE CURRENT SEASON'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Only one season can be active at a time
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0 6px 0', color: 'var(--stadium-white)' }}>
              {viewingSeason?.name || 'No Season Configured'}
            </h2>

            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span><strong>Year:</strong> {viewingSeason?.year || '2026/27'}</span>
              <span><strong>Enrolled Clubs:</strong> {enrolledTeams.length} Clubs</span>
              <span><strong>Rounds:</strong> {viewingSeason?.roundsCount || 14}</span>
              <span><strong>Calendar:</strong> {viewingSeason?.startDate} to {viewingSeason?.endDate}</span>
            </div>
          </div>

          {activeTab !== 'PAST_SEASONS' && activeSeason && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="admin-action-btn secondary sm"
                onClick={() => {
                  setEditSeasonForm({
                    name: activeSeason.name,
                    year: activeSeason.year,
                    startDate: activeSeason.startDate,
                    endDate: activeSeason.endDate,
                    rulesSummary: activeSeason.rulesSummary
                  });
                  setShowEditSeasonModal(true);
                }}
              >
                <Edit3 size={13} /> Edit Season
              </button>
            </div>
          )}

          {activeTab === 'PAST_SEASONS' && viewingSeason && (
            <button 
              className="admin-action-btn primary sm"
              onClick={() => handleSwitchActiveSeason(viewingSeason.id)}
            >
              Reactivate as Current Season
            </button>
          )}
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="admin-tabs-nav" style={{ marginBottom: '20px' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'FIXTURES' ? 'active' : ''}`}
          onClick={() => setActiveTab('FIXTURES')}
        >
          <Calendar size={15} /> Fixtures & Scheduling ({seasonMatches.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'TEAMS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TEAMS')}
        >
          <Users size={15} /> League Teams ({enrolledTeams.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'STANDINGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('STANDINGS')}
        >
          <BarChart3 size={15} /> Standings & Results
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'PAST_SEASONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PAST_SEASONS')}
        >
          <Archive size={15} /> Past Seasons Archive ({pastSeasons.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: FIXTURES & SCHEDULING
          ========================================================================= */}
      {activeTab === 'FIXTURES' && (
        <div>
          {/* Quick Action Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px',
            marginBottom: '16px' 
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                {activeSeason?.name} Fixture Schedule
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Auto-generate round-robin fixtures or create custom fixtures manually.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="admin-action-btn primary"
                onClick={handleOpenAutoGenerateModal}
              >
                <Wand2 size={14} /> Auto-Generate Fixtures
              </button>
              <button 
                className="admin-action-btn secondary"
                onClick={onOpenScheduleModal}
              >
                <Plus size={14} /> Manual Fixture
              </button>
            </div>
          </div>

          {/* Fixtures List */}
          {seasonMatches.length === 0 ? (
            <div className="admin-empty-centre" style={{ minHeight: '260px' }}>
              <div className="empty-centre-card">
                <Calendar size={36} className="empty-icon" />
                <h3>No Fixtures Scheduled Yet</h3>
                <p>Generate balanced round-robin fixtures for all enrolled clubs or schedule matches manually.</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                  <button className="admin-action-btn primary" onClick={handleOpenAutoGenerateModal}>
                    <Wand2 size={14} /> Auto-Generate Schedule
                  </button>
                  <button className="admin-action-btn secondary" onClick={onOpenScheduleModal}>
                    <Plus size={14} /> Add Single Fixture
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {seasonMatches.map((match) => {
                const assignedReferee = match.officials.find(o => o.role === 'Center Referee')?.name || 'Unassigned';

                return (
                  <div 
                    key={match.id}
                    className="admin-card"
                    style={{ 
                      padding: '14px 18px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      gap: '14px', 
                      flexWrap: 'wrap' 
                    }}
                  >
                    {/* Round & Date */}
                    <div style={{ minWidth: '130px' }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        color: 'var(--nova-orange)', 
                        textTransform: 'uppercase' 
                      }}>
                        {match.round}
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--stadium-white)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="var(--text-muted)" />
                        {match.date} • {match.time}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} /> {match.venue}
                      </div>
                    </div>

                    {/* Teams and Score */}
                    <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right', flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{match.homeTeam.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Home</span>
                      </div>

                      <div style={{ 
                        padding: '6px 12px', 
                        background: 'var(--pitch-black)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '1rem',
                        letterSpacing: '1px'
                      }}>
                        {match.status === 'VERIFIED_PUBLISHED' ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
                      </div>

                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{match.awayTeam.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Away</span>
                      </div>
                    </div>

                    {/* Official & Status */}
                    <div style={{ minWidth: '160px', textAlign: 'right' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <AdminStatusBadge status={match.status} size="sm" />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        Ref: <strong style={{ color: assignedReferee !== 'Unassigned' ? 'var(--stadium-white)' : '#f59e0b' }}>{assignedReferee}</strong>
                      </span>
                    </div>

                    {/* Quick Inline Actions */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="admin-action-btn secondary sm"
                        onClick={() => handleOpenEditFixture(match)}
                        title="Edit Fixture / Assign Official"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button 
                        className="admin-action-btn secondary sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleDeleteFixture(match.id)}
                        title="Delete Fixture"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: LEAGUE TEAMS
          ========================================================================= */}
      {activeTab === 'TEAMS' && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px',
            marginBottom: '16px' 
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Participating Clubs in {viewingSeason?.name}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Only teams that have been officially registered and approved can be enrolled. Central records are preserved across seasons.
              </p>
            </div>

            <button 
              className="admin-action-btn primary"
              onClick={() => setShowEnrollTeamModal(true)}
            >
              <Plus size={14} /> Enroll Approved Club
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '14px' 
          }}>
            {enrolledTeams.map((team) => (
              <div 
                key={team.id}
                className="admin-card"
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{team.logo}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{team.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--nova-orange)', fontWeight: 600 }}>
                      [{team.shortName}] • {team.city}
                    </span>
                  </div>
                  <AdminStatusBadge status={team.status} size="sm" />
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <div><strong>Home Stadium:</strong> {team.stadium}</div>
                  <div><strong>Head Coach:</strong> {team.headCoachName} ({team.headCoachPhone})</div>
                  <div><strong>Competitions:</strong> Participating in {team.participatingSeasonIds.length} tournament(s)</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '8px' }}>
                  <button 
                    className="admin-action-btn secondary sm"
                    style={{ color: '#ef4444' }}
                    onClick={() => handleRemoveTeam(team.id, team.name)}
                  >
                    Remove from Season
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STANDINGS & RESULTS
          ========================================================================= */}
      {activeTab === 'STANDINGS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 700 }}>
              Official League Standings • {viewingSeason?.name}
            </h3>

            <div className="admin-card" style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '12px 14px' }}>POS</th>
                    <th style={{ padding: '12px 14px' }}>CLUB</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>P</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>W</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>D</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>L</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>GF</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>GA</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>GD</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--nova-orange)' }}>PTS</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>FORM</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonStandings.map((row, idx) => (
                    <tr 
                      key={row.teamId}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        background: idx === 0 ? 'rgba(255, 106, 0, 0.04)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: idx === 0 ? 'var(--nova-orange)' : 'inherit' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{row.logo}</span>
                        <strong>{row.teamName}</strong>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.played}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.won}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.drawn}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.lost}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.goalsFor}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.goalsAgainst}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--nova-orange)' }}>
                        {row.points}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          {row.form.slice(0, 5).map((f, i) => (
                            <span 
                              key={i} 
                              style={{ 
                                width: '18px', 
                                height: '18px', 
                                borderRadius: '50%', 
                                fontSize: '0.65rem', 
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: f === 'W' ? '#22c55e' : f === 'D' ? '#eab308' : '#ef4444',
                                color: '#000'
                              }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PAST SEASONS ARCHIVE
          ========================================================================= */}
      {activeTab === 'PAST_SEASONS' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Historical Seasons Archive
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Completed and archived editions are maintained separately for historical integrity without confusing the active season.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {pastSeasons.map((ps) => {
              const isSelected = selectedHistoricalSeasonId === ps.id;
              return (
                <div 
                  key={ps.id}
                  className={`admin-card ${isSelected ? 'selected' : ''}`}
                  style={{ 
                    padding: '16px', 
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--nova-orange)' : undefined 
                  }}
                  onClick={() => setSelectedHistoricalSeasonId(ps.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--nova-orange)', fontWeight: 700 }}>
                      {ps.year}
                    </span>
                    <AdminStatusBadge status={ps.status} size="sm" />
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem' }}>{ps.name}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <div>Participating Clubs: {ps.participatingTeamIds.length}</div>
                    <div>Recorded Matches: {ps.matchCount}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {viewingSeason && (
            <div className="admin-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0 }}>Archived Data for {viewingSeason.name}</h4>
                <button 
                  className="admin-action-btn secondary sm"
                  onClick={() => handleSwitchActiveSeason(viewingSeason.id)}
                >
                  Reopen as Active Season
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="admin-action-btn secondary sm"
                  onClick={() => setActiveTab('STANDINGS')}
                >
                  View Final Standings
                </button>
                <button 
                  className="admin-action-btn secondary sm"
                  onClick={() => setActiveTab('FIXTURES')}
                >
                  View Historical Results
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. Auto-Generate Fixtures Modal (2-Step Preview & Constraint Validation) */}
      {showAutoGenerateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAutoGenerateModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: autoGenStep === 2 ? '780px' : '580px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>{autoGenStep === 1 ? 'Configure League Fixture Generation' : 'Schedule Preview & Constraints Validation'}</h3>
                <span className="modal-subtitle">
                  {autoGenStep === 1 
                    ? 'Step 1 of 2: Select clubs, format, and scheduling parameters' 
                    : 'Step 2 of 2: Inspect generated pairings, venue allocations, and calendar constraints before committing'}
                </span>
              </div>
            </div>

            {autoGenStep === 1 ? (
              <form onSubmit={handlePreviewGeneration}>
                <div className="modal-body form-body">
                  <div style={{ 
                    background: 'rgba(255, 106, 0, 0.08)', 
                    border: '1px solid rgba(255, 106, 0, 0.2)', 
                    padding: '10px 14px', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    color: 'var(--stadium-white)',
                    marginBottom: '14px'
                  }}>
                    Generating schedule for <strong>{activeSeason?.name}</strong>. Choose which enrolled approved clubs participate in this schedule generation.
                  </div>

                  {/* Participating Clubs Selector */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Participating Clubs ({selectedTeamsForGen.length}/{enrolledTeams.length} Selected) *</label>
                      <button 
                        type="button" 
                        className="admin-action-btn secondary sm"
                        style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                        onClick={() => {
                          if (selectedTeamsForGen.length === enrolledTeamIds.length) {
                            setSelectedTeamsForGen([]);
                          } else {
                            setSelectedTeamsForGen(enrolledTeamIds);
                          }
                        }}
                      >
                        {selectedTeamsForGen.length === enrolledTeamIds.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
                      gap: '8px',
                      maxHeight: '160px',
                      overflowY: 'auto',
                      padding: '8px',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {enrolledTeams.map(team => {
                        const isSelected = selectedTeamsForGen.includes(team.id);
                        return (
                          <label 
                            key={team.id}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              background: isSelected ? 'rgba(255, 106, 0, 0.1)' : 'transparent'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleToggleTeamForGen(team.id)}
                            />
                            <span>{team.logo} {team.shortName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Competition Match Format</label>
                    <select 
                      className="admin-select"
                      value={autoGenForm.doubleRoundRobin ? 'double' : 'single'}
                      onChange={(e) => setAutoGenForm({ ...autoGenForm, doubleRoundRobin: e.target.value === 'double' })}
                    >
                      <option value="double">Double Round-Robin (Home & Away)</option>
                      <option value="single">Single Round-Robin (Single Meeting)</option>
                    </select>
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label">First Matchday Date *</label>
                      <input 
                        type="date"
                        className="admin-input"
                        value={autoGenForm.startDate}
                        onChange={(e) => setAutoGenForm({ ...autoGenForm, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Days Between Rounds *</label>
                      <input 
                        type="number"
                        className="admin-input"
                        min={1}
                        max={30}
                        value={autoGenForm.daysBetweenRounds}
                        onChange={(e) => setAutoGenForm({ ...autoGenForm, daysBetweenRounds: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="admin-action-btn secondary" onClick={() => setShowAutoGenerateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-action-btn primary" disabled={selectedTeamsForGen.length < 2}>
                    Preview Proposed Schedule & Validate →
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="modal-body form-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {/* Validation Status Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ padding: '10px 14px', background: '#16191c', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--steel-grey)', textTransform: 'uppercase', fontWeight: 700 }}>TOTAL FIXTURES</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--stadium-white)' }}>{validationReport.totalMatches} Matches</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--nova-orange)' }}>Across {validationReport.totalRounds} Matchdays</span>
                    </div>

                    <div style={{ padding: '10px 14px', background: '#16191c', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--steel-grey)', textTransform: 'uppercase', fontWeight: 700 }}>PAIRING INTEGRITY</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: validationReport.duplicatePairings === 0 ? '#22c55e' : '#ef4444' }}>
                        {validationReport.duplicatePairings === 0 ? '✓ Zero Duplicates' : `⚠️ ${validationReport.duplicatePairings} Duplicates`}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--steel-grey)' }}>Berger round-robin balance verified</span>
                    </div>

                    <div style={{ padding: '10px 14px', background: '#16191c', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--steel-grey)', textTransform: 'uppercase', fontWeight: 700 }}>PARTICIPATION STATUS</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--stadium-white)' }}>{selectedTeamsForGen.length} Clubs</div>
                      <span style={{ fontSize: '0.72rem', color: validationReport.hasOddTeams ? 'var(--nova-orange)' : '#22c55e' }}>
                        {validationReport.hasOddTeams ? 'Odd club count (Byes applied)' : 'Even club balance (0 Byes)'}
                      </span>
                    </div>
                  </div>

                  {/* Constraint Notices */}
                  {validationReport.hasOddTeams && (
                    <div className="admin-inline-alert warning" style={{ marginBottom: '12px', padding: '8px 12px' }}>
                      <AlertTriangle size={15} />
                      <span style={{ fontSize: '0.78rem' }}>
                        Odd number of clubs ({selectedTeamsForGen.length}). Exactly one club will receive a rest bye in each round.
                      </span>
                    </div>
                  )}

                  {validationReport.missingTeams.length > 0 && (
                    <div className="admin-inline-alert info" style={{ marginBottom: '12px', padding: '8px 12px' }}>
                      <CheckCircle2 size={15} />
                      <span style={{ fontSize: '0.78rem' }}>
                        Excluded enrolled clubs: {validationReport.missingTeams.join(', ')}.
                      </span>
                    </div>
                  )}

                  {/* Proposed Schedule Preview Table */}
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: '#1a1d21', borderBottom: '1px solid var(--border-subtle)', color: 'var(--steel-grey)', fontSize: '0.72rem' }}>
                          <th style={{ padding: '8px 12px' }}>ROUND</th>
                          <th style={{ padding: '8px 12px' }}>DATE & TIME</th>
                          <th style={{ padding: '8px 12px' }}>MATCHUP (HOME vs AWAY)</th>
                          <th style={{ padding: '8px 12px' }}>VENUE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewSchedule.slice(0, 24).map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 800, color: 'var(--nova-orange)' }}>Round {p.round}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--stadium-white)' }}>{p.date} • {p.time}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--stadium-white)' }}>
                              {p.homeTeam.name} vs {p.awayTeam.name}
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--steel-grey)', fontSize: '0.75rem' }}>{p.venue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewSchedule.length > 24 && (
                      <div style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--steel-grey)', background: '#16191c' }}>
                        Showing first 24 of {previewSchedule.length} proposed fixtures. All {previewSchedule.length} fixtures will be created upon confirmation.
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" className="admin-action-btn secondary" onClick={() => setAutoGenStep(1)}>
                    <ArrowLeft size={14} /> Back to Parameters
                  </button>
                  <button type="button" className="admin-action-btn primary" onClick={handleConfirmCommitSchedule}>
                    <Check size={14} /> Confirm & Commit Schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Enroll Approved Club Modal */}
      {showEnrollTeamModal && (
        <div className="admin-modal-overlay" onClick={() => setShowEnrollTeamModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Enroll Club into Season</h3>
                <span className="modal-subtitle">Only approved teams from the central registry can join</span>
              </div>
            </div>

            <form onSubmit={handleEnrollTeam}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Select Registered Club *</label>
                  <select 
                    className="admin-select"
                    value={selectedTeamToEnroll}
                    onChange={(e) => setSelectedTeamToEnroll(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Approved Club --</option>
                    {approvedTeams
                      .filter(t => !activeSeason?.participatingTeamIds.includes(t.id))
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.shortName}) • Coach: {team.headCoachName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowEnrollTeamModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary" disabled={!selectedTeamToEnroll}>
                  Enroll Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Edit Fixture Modal (Fallback manual creator/editor) */}
      {editingFixture && (
        <div className="admin-modal-overlay" onClick={() => setEditingFixture(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Edit Fixture Details</h3>
                <span className="modal-subtitle">{editingFixture.homeTeam.name} vs {editingFixture.awayTeam.name}</span>
              </div>
            </div>

            <form onSubmit={handleSaveFixtureEdit}>
              <div className="modal-body form-body">
                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Match Date</label>
                    <input 
                      type="date"
                      className="admin-input"
                      value={editFixtureForm.date}
                      onChange={(e) => setEditFixtureForm({ ...editFixtureForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kickoff Time</label>
                    <input 
                      type="time"
                      className="admin-input"
                      value={editFixtureForm.time}
                      onChange={(e) => setEditFixtureForm({ ...editFixtureForm, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue / Stadium</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={editFixtureForm.venue}
                    onChange={(e) => setEditFixtureForm({ ...editFixtureForm, venue: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Round Label</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={editFixtureForm.round}
                      onChange={(e) => setEditFixtureForm({ ...editFixtureForm, round: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned NSFC Referee</label>
                    <select 
                      className="admin-select"
                      value={editFixtureForm.referee}
                      onChange={(e) => setEditFixtureForm({ ...editFixtureForm, referee: e.target.value })}
                    >
                      <option value="">-- No Referee Assigned --</option>
                      {officials.filter(o => o.role === 'Center Referee').map(o => (
                        <option key={o.id} value={o.name}>{o.name} ({o.badge})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Match Status</label>
                  <select 
                    className="admin-select"
                    value={editFixtureForm.status}
                    onChange={(e) => setEditFixtureForm({ ...editFixtureForm, status: e.target.value as any })}
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="READY">READY (Readiness Confirmed)</option>
                    <option value="POSTPONED">POSTPONED</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setEditingFixture(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit League Settings Modal */}
      {showEditLeagueModal && (
        <div className="admin-modal-overlay" onClick={() => setShowEditLeagueModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Edit League Settings</h3>
                <span className="modal-subtitle">Update championship details and rules</span>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedComp) {
                selectedComp.name = editLeagueForm.name;
                selectedComp.shortName = editLeagueForm.shortName;
                selectedComp.tier = editLeagueForm.tier;
                selectedComp.format = editLeagueForm.format;
                selectedComp.description = editLeagueForm.description;
                adminStore.seedDefaults; // trigger persistence
                setShowEditLeagueModal(false);
                showNotice('League settings updated.');
              }
            }}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">League Name *</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={editLeagueForm.name}
                    onChange={(e) => setEditLeagueForm({ ...editLeagueForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Short Acronym</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={editLeagueForm.shortName}
                      onChange={(e) => setEditLeagueForm({ ...editLeagueForm, shortName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tier</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={editLeagueForm.tier}
                      onChange={(e) => setEditLeagueForm({ ...editLeagueForm, tier: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="admin-textarea"
                    rows={2}
                    value={editLeagueForm.description}
                    onChange={(e) => setEditLeagueForm({ ...editLeagueForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowEditLeagueModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Season Modal */}
      {showEditSeasonModal && activeSeason && (
        <div className="admin-modal-overlay" onClick={() => setShowEditSeasonModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Edit Current Season</h3>
                <span className="modal-subtitle">Active edition rules and timeline</span>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              activeSeason.name = editSeasonForm.name;
              activeSeason.year = editSeasonForm.year;
              activeSeason.startDate = editSeasonForm.startDate;
              activeSeason.endDate = editSeasonForm.endDate;
              activeSeason.rulesSummary = editSeasonForm.rulesSummary;
              setShowEditSeasonModal(false);
              showNotice('Season information updated.');
            }}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label className="form-label">Season Name *</label>
                  <input 
                    type="text"
                    className="admin-input"
                    value={editSeasonForm.name}
                    onChange={(e) => setEditSeasonForm({ ...editSeasonForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label">Year Edition</label>
                    <input 
                      type="text"
                      className="admin-input"
                      value={editSeasonForm.year}
                      onChange={(e) => setEditSeasonForm({ ...editSeasonForm, year: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input 
                      type="date"
                      className="admin-input"
                      value={editSeasonForm.startDate}
                      onChange={(e) => setEditSeasonForm({ ...editSeasonForm, startDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Rules Summary</label>
                  <textarea 
                    className="admin-textarea"
                    rows={2}
                    value={editSeasonForm.rulesSummary}
                    onChange={(e) => setEditSeasonForm({ ...editSeasonForm, rulesSummary: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowEditSeasonModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  Save Season
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
