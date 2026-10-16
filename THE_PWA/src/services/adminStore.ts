import { matchStore, type OfficialMatchData } from './matchStore';
import { supabase } from './supabaseClient';

// ============================================================================
// NSFC & NovaSport Domain Information Architecture
// ============================================================================

export interface CompetitionRules {
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  maxForeignPlayers: number;
  maxSquadSize: number;
  minHomegrownPlayers: number;
  yellowCardSuspensionThreshold: number;
  matchDurationMinutes: number;
}

export interface AdminCompetition {
  id: string;
  name: string;
  shortName: string;
  code: string;
  governingBody: string; // e.g. "NSFC (NovaSport Football Council)"
  tier: string;          // e.g. "Tier 1 - Varsity Premier League"
  type: 'LEAGUE' | 'CUP' | 'TOURNAMENT';
  format: string;        // e.g. "Double Round-Robin", "Single Elimination"
  rules: CompetitionRules;
  activeSeasonId: string;
  status: 'ACTIVE' | 'UPCOMING' | 'CONCLUDED' | 'ARCHIVED';
  teamCount: number;
  roundsCount: number;
  currentRound: number;
  description: string;
  season?: string; // Legacy compatibility
}

export type SeasonLifecycleStatus = 'PLANNING' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'CONCLUDED' | 'ARCHIVED';

export interface AdminSeason {
  id: string;
  competitionId: string;
  name: string;        // e.g. "Season 8 (2026/27)"
  year: string;        // e.g. "2026/27"
  status: SeasonLifecycleStatus;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  participatingTeamIds: string[];
  roundsCount: number;
  currentRound: number;
  rulesSummary: string;
  isPublished: boolean;
  matchCount: number;
  standingsCalculatedAt?: string;
}

export interface AdminTeamRecord {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  logo: string;
  stadium: string;
  city: string;
  headCoachName: string;
  headCoachEmail: string;
  headCoachPhone: string;
  registeredDate: string;
  status: 'ACTIVE' | 'PENDING_DOCUMENTATION' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUSPENDED';
  division: string;
  contactPerson: string;
  participatingSeasonIds: string[];
  registrationStatusBySeason: Record<string, 'VERIFIED' | 'PENDING' | 'REJECTED'>;
}

export interface PlayerRosterMembership {
  id: string;
  playerId: string;
  teamId: string;
  teamName: string;
  seasonId: string;
  seasonName: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'INACTIVE';
  invitedByCoachName?: string;
  invitedDate: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export interface AdminPlayerRecord {
  id: string;
  name: string;
  teamId: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  number: number;
  age: number;
  nationalId: string;
  studentId?: string;
  eligibility: 'ELIGIBLE' | 'PENDING_REGISTRATION' | 'SUSPENDED' | 'INELIGIBLE';
  statusNotes?: string;
  joinedDate: string;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  memberships?: PlayerRosterMembership[];
}

export interface OfficialAssignmentRecord {
  id: string;
  date: string;
  type: 'MATCH_OFFICIAL' | 'COACH_APPOINTMENT';
  title: string;
  role: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  matchId?: string;
  teamId?: string;
}

export interface OfficialRecord {
  id: string;
  name: string;
  role: 'Center Referee' | 'Assistant Referee 1' | 'Assistant Referee 2' | 'Fourth Official' | 'Match Commissioner' | 'Head Coach' | 'Assistant Coach' | string;
  roles?: string[]; // Multiple roles supported! e.g. ['Head Coach', 'Center Referee']
  badge: 'NSFC Approved Referee' | 'NSFC Assistant Official' | 'NSFC Match Commissioner' | 'NSFC League Official' | 'NSFC Certified Coach' | string;
  email: string;
  phone: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'UNAVAILABLE' | 'SUSPENDED';
  currentMatchId?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  matchesOfficiated: number;
  rating: number; // 1-5
  accountId?: string;
  assignmentHistory?: OfficialAssignmentRecord[];
}

export interface DisciplinarySanction {
  id: string;
  targetType: 'PLAYER' | 'COACH' | 'TEAM' | 'OFFICIAL';
  targetId?: string;
  targetName: string;
  teamId?: string;
  teamName?: string;
  violation: string;
  sanctionType?: 'MATCH_BAN' | 'FINE' | 'WARNING' | 'POINTS_DEDUCTION';
  penalty?: string;
  details?: string;
  matchesCount?: number;
  fineAmountKes?: number;
  pointsDeducted?: number;
  issuedAt: string;
  issuedDate?: string;
  matchOrContext?: string;
  status: 'ACTIVE' | 'SERVED' | 'APPEALED' | 'REVOKED';
  hearingDate?: string;
}

export type AdminSanction = DisciplinarySanction;
export const AdminSanction = {};
export const DisciplinarySanction = {};
export const AdminAnnouncement = {};
export const AdminStoreState = {};
export const AdminCompetition = {};
export const AdminTeamRecord = {};
export const OfficialRecord = {};
export const PlatformAuditEntry = {};

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  category?: string;
  summary?: string;
  body?: string;
  authorName?: string;
  targetAudience?: 'ALL' | 'COACHES' | 'OFFICIALS' | 'PUBLIC';
  target?: 'ALL' | 'COACHES' | 'OFFICIALS' | 'TEAMS' | 'PUBLIC';
  priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  author: string;
  publishedAt: string;
  isPinned?: boolean;
  pinned?: boolean;
  relatedCompetitionId?: string;
  relatedSeasonId?: string;
}

export interface PlatformAuditEntry {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  category: 'TEAM' | 'FIXTURE' | 'OFFICIAL' | 'RESULT' | 'DISCIPLINE' | 'COMPETITION' | 'SEASON' | 'GOVERNANCE';
  details: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface MatchReadinessChecklist {
  venueConfirmed: boolean;
  officialsAppointed: boolean;
  homeLineupSubmitted: boolean;
  awayLineupSubmitted: boolean;
  medicalStaffOnSite: boolean;
  matchBallApproved: boolean;
}

export interface SeasonStandingRow {
  position: number;
  teamId: string;
  teamName: string;
  shortName: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  pointsDeduction: number;
  form: Array<'W' | 'D' | 'L'>;
}

export interface TopScorerRow {
  rank: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamLogo: string;
  goals: number;
  assists: number;
  appearances: number;
}

export interface AuthorizedAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'NSFC_DIRECTOR' | 'MATCH_COMMISSIONER' | 'DISCIPLINARY_SECRETARIAT' | 'SUPER_ADMIN';
  roleTitle: string;
  jurisdiction: string;
  avatar: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastActive: string;
  permissions: string[];
}

export interface AdminStoreState {
  competitions: AdminCompetition[];
  seasons: AdminSeason[];
  teams: AdminTeamRecord[];
  players: AdminPlayerRecord[];
  officials: OfficialRecord[];
  sanctions: DisciplinarySanction[];
  announcements: AdminAnnouncement[];
  auditLogs: PlatformAuditEntry[];
  authorizedUsers: AuthorizedAdminUser[];
  matchReadiness: Record<string, MatchReadinessChecklist>;
  selectedCompetitionId: string;
  selectedSeasonId: string;
}

const STORAGE_KEY = 'novasport_admin_store_v3';

class AdminStore {
  private competitions: AdminCompetition[] = [];
  private seasons: AdminSeason[] = [];
  private teams: AdminTeamRecord[] = [];
  private players: AdminPlayerRecord[] = [];
  private officials: OfficialRecord[] = [];
  private sanctions: DisciplinarySanction[] = [];
  private announcements: AdminAnnouncement[] = [];
  private auditLogs: PlatformAuditEntry[] = [];
  private authorizedUsers: AuthorizedAdminUser[] = [];
  private matchReadiness: Record<string, MatchReadinessChecklist> = {};
  
  // Operating Context Filter
  private selectedCompetitionId: string = 'c1';
  private selectedSeasonId: string = 'sea-ksl-s8';

  private listeners: (() => void)[] = [];

  public isConnectedToSupabase: boolean = false;
  public isSyncing: boolean = false;
  private realtimeChannel: any = null;

  constructor() {
    this.loadState();
    this.initSupabaseSync();
  }

  public async initSupabaseSync() {
    await this.fetchFromSupabase();
    this.setupRealtime();
  }

  public setupRealtime() {
    try {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
      }
      this.realtimeChannel = supabase
        .channel('novasport-admin-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seasons' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'season_teams' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'officials' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'roster_memberships' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'match_readiness' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'disciplinary_sanctions' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => this.fetchFromSupabase())
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  public async fetchFromSupabase(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;
    try {
      const [
        compsRes,
        seasonsRes,
        teamsRes,
        seasonTeamsRes,
        officialsRes,
        playersRes,
        rosterRes,
        readinessRes,
        sanctionsRes,
        announcementsRes,
        auditRes
      ] = await Promise.all([
        supabase.from('competitions').select('*').order('name'),
        supabase.from('seasons').select('*').order('year', { ascending: false }),
        supabase.from('teams').select('*').order('name'),
        supabase.from('season_teams').select('*'),
        supabase.from('officials').select('*').order('name'),
        supabase.from('players').select('*').order('name'),
        supabase.from('roster_memberships').select('*'),
        supabase.from('match_readiness').select('*'),
        supabase.from('disciplinary_sanctions').select('*').order('issued_at', { ascending: false }),
        supabase.from('announcements').select('*').order('published_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
      ]);

      if (compsRes.error || !compsRes.data || compsRes.data.length === 0) {
        this.isSyncing = false;
        return false;
      }

      const seasonTeams = seasonTeamsRes.data || [];
      const roster = rosterRes.data || [];

      // 1. Map Competitions
      this.competitions = compsRes.data.map(c => ({
        id: c.id,
        name: c.name,
        shortName: c.short_name || c.name.substring(0, 3).toUpperCase(),
        code: c.code,
        governingBody: c.governing_body || 'NSFC',
        tier: c.tier || 'Tier 1',
        type: c.type || 'LEAGUE',
        format: c.format || 'Double Round-Robin',
        rules: c.rules || {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0,
          maxForeignPlayers: 4,
          maxSquadSize: 25,
          minHomegrownPlayers: 8,
          yellowCardSuspensionThreshold: 3,
          matchDurationMinutes: 90
        },
        activeSeasonId: c.active_season_id || '',
        status: c.status || 'ACTIVE',
        teamCount: c.team_count || 0,
        roundsCount: c.rounds_count || 14,
        currentRound: c.current_round || 1,
        description: c.description || ''
      }));

      // 2. Map Seasons
      if (seasonsRes.data && seasonsRes.data.length > 0) {
        this.seasons = seasonsRes.data.map(s => {
          const participatingTeamIds = seasonTeams
            .filter(st => st.season_id === s.id)
            .map(st => st.team_id);

          return {
            id: s.id,
            competitionId: s.competition_id,
            name: s.name,
            year: s.year,
            status: s.status,
            startDate: s.start_date || '',
            endDate: s.end_date || '',
            registrationDeadline: s.registration_deadline || '',
            participatingTeamIds,
            roundsCount: s.rounds_count || 14,
            currentRound: s.current_round || 1,
            rulesSummary: s.rules_summary || '',
            isPublished: s.is_published ?? true,
            matchCount: s.match_count || 0
          };
        });
      }

      // 3. Map Teams
      if (teamsRes.data && teamsRes.data.length > 0) {
        this.teams = teamsRes.data.map(t => {
          const participatingSeasonIds = seasonTeams
            .filter(st => st.team_id === t.id)
            .map(st => st.season_id);

          const registrationStatusBySeason: Record<string, 'VERIFIED' | 'PENDING' | 'REJECTED'> = {};
          seasonTeams.filter(st => st.team_id === t.id).forEach(st => {
            registrationStatusBySeason[st.season_id] = (st.registration_status || 'VERIFIED') as any;
          });

          return {
            id: t.id,
            name: t.name,
            shortName: t.short_name || t.name.substring(0, 3).toUpperCase(),
            slug: t.slug,
            logo: t.logo || '⚽',
            stadium: t.stadium || 'Main Campus Stadium',
            city: t.city || 'Meru',
            headCoachName: t.head_coach_name || 'Unassigned Coach',
            headCoachEmail: t.head_coach_email || '',
            headCoachPhone: t.head_coach_phone || '',
            registeredDate: t.registered_date ? t.registered_date.split('T')[0] : '',
            status: t.status,
            division: t.division || 'Premier Division',
            contactPerson: t.contact_person || '',
            participatingSeasonIds,
            registrationStatusBySeason
          };
        });
      }

      // 4. Map Officials
      if (officialsRes.data && officialsRes.data.length > 0) {
        this.officials = officialsRes.data.map(o => ({
          id: o.id,
          name: o.name,
          role: o.role,
          roles: o.roles || [o.role],
          badge: o.badge || 'NSFC Approved Referee',
          email: o.email || '',
          phone: o.phone || '',
          status: o.status,
          currentMatchId: o.current_match_id,
          assignedTeamId: o.assigned_team_id,
          matchesOfficiated: o.matches_officiated || 0,
          rating: o.rating ? parseFloat(o.rating) : 4.8
        }));
      }

      // 5. Map Players & Memberships
      if (playersRes.data && playersRes.data.length > 0) {
        this.players = playersRes.data.map(p => {
          const memberships: PlayerRosterMembership[] = roster
            .filter(m => m.player_id === p.id)
            .map(m => {
              const team = this.teams.find(t => t.id === m.team_id);
              const season = this.seasons.find(s => s.id === m.season_id);
              return {
                id: m.id,
                playerId: m.player_id,
                teamId: m.team_id,
                teamName: team?.name || 'Club',
                seasonId: m.season_id,
                seasonName: season?.name || 'Season',
                number: m.jersey_number || p.number,
                position: (m.position || p.position) as any,
                status: m.status as any,
                invitedByCoachName: m.invited_by_coach_name,
                invitedDate: m.invited_date ? m.invited_date.split('T')[0] : '',
                approvedDate: m.approved_date ? m.approved_date.split('T')[0] : undefined,
                rejectionReason: m.rejection_reason
              };
            });

          return {
            id: p.id,
            name: p.name,
            teamId: p.team_id || '',
            position: p.position as any,
            number: p.number,
            age: p.age || 21,
            nationalId: p.national_id || '',
            studentId: p.student_id || '',
            eligibility: p.eligibility as any,
            statusNotes: p.status_notes || '',
            joinedDate: p.joined_date ? p.joined_date.split('T')[0] : '',
            appearances: p.appearances || 0,
            goals: p.goals || 0,
            assists: p.assists || 0,
            yellowCards: p.yellow_cards || 0,
            redCards: p.red_cards || 0,
            cleanSheets: p.clean_sheets || 0,
            memberships
          };
        });
      }

      // 6. Map Match Readiness
      if (readinessRes.data && readinessRes.data.length > 0) {
        const mrMap: Record<string, MatchReadinessChecklist> = {};
        readinessRes.data.forEach(mr => {
          mrMap[mr.fixture_id] = {
            venueConfirmed: !!mr.venue_confirmed,
            officialsAppointed: !!mr.officials_appointed,
            homeLineupSubmitted: !!mr.home_lineup_submitted,
            awayLineupSubmitted: !!mr.away_lineup_submitted,
            medicalStaffOnSite: !!mr.medical_staff_on_site,
            matchBallApproved: !!mr.match_ball_approved
          };
        });
        this.matchReadiness = mrMap;
      }

      // 7. Map Sanctions
      if (sanctionsRes.data && sanctionsRes.data.length > 0) {
        this.sanctions = sanctionsRes.data.map(s => ({
          id: s.id,
          targetType: s.target_type as any,
          targetId: s.target_id,
          targetName: s.target_name,
          teamId: s.team_id,
          violation: s.violation,
          sanctionType: s.sanction_type as any,
          penalty: s.penalty,
          details: s.details,
          matchesCount: s.matches_count,
          fineAmountKes: s.fine_amount_kes ? parseFloat(s.fine_amount_kes) : undefined,
          pointsDeducted: s.points_deducted,
          issuedAt: s.issued_at,
          status: s.status as any
        }));
      }

      // 8. Map Announcements
      if (announcementsRes.data && announcementsRes.data.length > 0) {
        this.announcements = announcementsRes.data.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          targetAudience: a.target_audience as any,
          priority: a.priority as any,
          author: a.author,
          publishedAt: a.published_at,
          isPinned: a.is_pinned,
          relatedCompetitionId: a.related_competition_id,
          relatedSeasonId: a.related_season_id
        }));
      }

      // 9. Map Audit Logs
      if (auditRes.data && auditRes.data.length > 0) {
        this.auditLogs = auditRes.data.map(l => ({
          id: l.id,
          timestamp: l.timestamp,
          adminName: l.admin_name,
          action: l.action,
          category: l.category as any,
          details: l.details,
          severity: l.severity as any
        }));
      }

      this.isConnectedToSupabase = true;
      this.saveState();
      this.notify();
      return true;
    } catch (err) {
      console.warn('Error fetching from Supabase, operating with cached state:', err);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.competitions = data.competitions || [];
        this.seasons = data.seasons || [];
        this.teams = data.teams || [];
        this.players = data.players || [];
        this.officials = data.officials || [];
        this.sanctions = data.sanctions || [];
        this.announcements = data.announcements || [];
        this.auditLogs = data.auditLogs || [];
        this.authorizedUsers = data.authorizedUsers || [];
        this.matchReadiness = data.matchReadiness || {};
        this.selectedCompetitionId = data.selectedCompetitionId || 'c1';
        this.selectedSeasonId = data.selectedSeasonId || 'sea-ksl-s8';
      } else {
        this.seedDefaults();
      }
    } catch {
      this.seedDefaults();
    }
  }

  public seedDefaults() {
    this.competitions = [
      {
        id: 'c1',
        name: 'KeMU Super League',
        shortName: 'KSL',
        code: 'KSL-PREMIER',
        governingBody: 'NSFC (NovaSport Football Council)',
        tier: 'Tier 1 - Varsity Premier League',
        type: 'LEAGUE',
        format: 'Double Round-Robin',
        activeSeasonId: 'sea-ksl-s8',
        season: 'Season 8 (2026/27)',
        status: 'ACTIVE',
        teamCount: 8,
        roundsCount: 14,
        currentRound: 6,
        description: 'Primary championship featuring elite university squads under official NSFC regulations and FIFA fair play mandates.',
        rules: {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0,
          maxForeignPlayers: 4,
          maxSquadSize: 25,
          minHomegrownPlayers: 8,
          yellowCardSuspensionThreshold: 3,
          matchDurationMinutes: 90
        }
      },
      {
        id: 'c2',
        name: 'KeMU Knockout Cup',
        shortName: 'KKC',
        code: 'KKC-CUP',
        governingBody: 'NSFC (NovaSport Football Council)',
        tier: 'Tier 2 - All-Campus Knockout',
        type: 'CUP',
        format: 'Single Elimination',
        activeSeasonId: 'sea-cup-2026',
        season: '2026/27 Edition',
        status: 'UPCOMING',
        teamCount: 16,
        roundsCount: 4,
        currentRound: 1,
        description: 'Annual single-elimination tournament featuring campus clubs and invited regional athletic departments.',
        rules: {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0,
          maxForeignPlayers: 5,
          maxSquadSize: 28,
          minHomegrownPlayers: 6,
          yellowCardSuspensionThreshold: 2,
          matchDurationMinutes: 90
        }
      },
      {
        id: 'c3',
        name: 'Varsity Trophy Invitational',
        shortName: 'VTI',
        code: 'VTI-INV',
        governingBody: 'NSFC (NovaSport Football Council)',
        tier: 'Tier 3 - Regional Invitational',
        type: 'TOURNAMENT',
        format: 'Group Stage + Knockout',
        activeSeasonId: 'sea-vti-2026',
        season: '2026 Invitational',
        status: 'ACTIVE',
        teamCount: 6,
        roundsCount: 5,
        currentRound: 2,
        description: 'Pre-season athletic invitational for regional collegiate development squads.',
        rules: {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0,
          maxForeignPlayers: 6,
          maxSquadSize: 30,
          minHomegrownPlayers: 5,
          yellowCardSuspensionThreshold: 3,
          matchDurationMinutes: 90
        }
      }
    ];

    this.seasons = [
      {
        id: 'sea-ksl-s8',
        competitionId: 'c1',
        name: 'Season 8 (2026/27)',
        year: '2026/27',
        status: 'IN_PROGRESS',
        startDate: '2026-08-15',
        endDate: '2027-04-30',
        registrationDeadline: '2026-08-01',
        participatingTeamIds: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'],
        roundsCount: 14,
        currentRound: 6,
        rulesSummary: 'Standard 3-pts win; 3 yellow cards = 1-match suspension; 25 squad max.',
        isPublished: true,
        matchCount: 56,
        standingsCalculatedAt: new Date().toISOString()
      },
      {
        id: 'sea-ksl-s9',
        competitionId: 'c1',
        name: 'Season 9 (2027/28)',
        year: '2027/28',
        status: 'PLANNING',
        startDate: '2027-08-15',
        endDate: '2028-05-01',
        registrationDeadline: '2027-08-01',
        participatingTeamIds: ['t1', 't2', 't3'],
        roundsCount: 14,
        currentRound: 0,
        rulesSummary: 'Upcoming season structure under review by NSFC Executive Committee.',
        isPublished: false,
        matchCount: 0
      },
      {
        id: 'sea-cup-2026',
        competitionId: 'c2',
        name: '2026/27 Knockout Edition',
        year: '2026/27',
        status: 'REGISTRATION_OPEN',
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        registrationDeadline: '2026-10-25',
        participatingTeamIds: ['t1', 't2', 't3', 't4', 't5'],
        roundsCount: 4,
        currentRound: 1,
        rulesSummary: 'Direct penalties on draw in full time. Squad registration open.',
        isPublished: true,
        matchCount: 15
      },
      {
        id: 'sea-vti-2026',
        competitionId: 'c3',
        name: '2026 Regional Invitational',
        year: '2026',
        status: 'IN_PROGRESS',
        startDate: '2026-09-01',
        endDate: '2026-11-15',
        registrationDeadline: '2026-08-20',
        participatingTeamIds: ['t2', 't3', 't5'],
        roundsCount: 5,
        currentRound: 2,
        rulesSummary: 'Group stages into semi-finals.',
        isPublished: true,
        matchCount: 10
      }
    ];

    this.teams = [
      {
        id: 't1',
        name: 'KeMU FC',
        shortName: 'KEM',
        slug: 'kemu-fc',
        logo: '🦁',
        stadium: 'Main Campus Stadium, Meru',
        city: 'Meru',
        headCoachName: 'Coach John Mwangi',
        headCoachEmail: 'jmwangi@kemu.ac.ke',
        headCoachPhone: '+254 712 345 678',
        registeredDate: '2026-08-10',
        status: 'ACTIVE',
        division: 'Premier Division',
        contactPerson: 'Dean of Athletics',
        participatingSeasonIds: ['sea-ksl-s8', 'sea-cup-2026'],
        registrationStatusBySeason: { 'sea-ksl-s8': 'VERIFIED', 'sea-cup-2026': 'VERIFIED' }
      },
      {
        id: 't2',
        name: 'Meru Warriors',
        shortName: 'WAR',
        slug: 'meru-warriors',
        logo: '🛡️',
        stadium: 'Kinoru Stadium, Meru',
        city: 'Meru',
        headCoachName: 'Coach Marcus',
        headCoachEmail: 'coach.marcus@meruwarriors.co.ke',
        headCoachPhone: '+254 722 987 654',
        registeredDate: '2026-08-12',
        status: 'ACTIVE',
        division: 'Premier Division',
        contactPerson: 'Marcus Vance',
        participatingSeasonIds: ['sea-ksl-s8', 'sea-cup-2026', 'sea-vti-2026'],
        registrationStatusBySeason: { 'sea-ksl-s8': 'VERIFIED', 'sea-cup-2026': 'VERIFIED' }
      },
      {
        id: 't3',
        name: 'Campus Stars FC',
        shortName: 'STA',
        slug: 'campus-stars',
        logo: '⭐',
        stadium: 'Campus Pitch B',
        city: 'Meru',
        headCoachName: 'Coach Patrick Otieno',
        headCoachEmail: 'otieno.pat@campusstars.ac.ke',
        headCoachPhone: '+254 733 456 789',
        registeredDate: '2026-08-14',
        status: 'ACTIVE',
        division: 'Premier Division',
        contactPerson: 'Student Sports Secretariat',
        participatingSeasonIds: ['sea-ksl-s8', 'sea-cup-2026'],
        registrationStatusBySeason: { 'sea-ksl-s8': 'VERIFIED' }
      },
      {
        id: 't4',
        name: 'Isiolo United',
        shortName: 'ISI',
        slug: 'isiolo-united',
        logo: '🦅',
        stadium: 'Isiolo Town Stadium',
        city: 'Isiolo',
        headCoachName: 'Coach Eric Mutua',
        headCoachEmail: 'mutua@isiolounited.ke',
        headCoachPhone: '+254 720 112 233',
        registeredDate: '2026-08-15',
        status: 'ACTIVE',
        division: 'Premier Division',
        contactPerson: 'Club Secretary',
        participatingSeasonIds: ['sea-ksl-s8', 'sea-cup-2026'],
        registrationStatusBySeason: { 'sea-ksl-s8': 'VERIFIED' }
      },
      {
        id: 't5',
        name: 'Embu Kings',
        shortName: 'KNG',
        slug: 'embu-kings',
        logo: '👑',
        stadium: 'Moi Stadium, Embu',
        city: 'Embu',
        headCoachName: 'Coach Benson Mwiti',
        headCoachEmail: 'mwiti@embukings.co.ke',
        headCoachPhone: '+254 721 445 566',
        registeredDate: '2026-08-15',
        status: 'ACTIVE',
        division: 'Premier Division',
        contactPerson: 'Team Coordinator',
        participatingSeasonIds: ['sea-ksl-s8', 'sea-cup-2026'],
        registrationStatusBySeason: { 'sea-ksl-s8': 'VERIFIED' }
      },
      {
        id: 't6',
        name: 'Thika United',
        shortName: 'THK',
        slug: 'thika-united',
        logo: '⚡',
        stadium: 'Thika Municipal Stadium',
        city: 'Thika',
        headCoachName: 'Coach James Karanja',
        headCoachEmail: 'karanja@thika.ke',
        headCoachPhone: '+254 723 889 900',
        registeredDate: '2026-08-16',
        status: 'ACTIVE',
        division: 'Premier Division',
        contactPerson: 'Karanja J.',
        participatingSeasonIds: ['sea-ksl-s8'],
        registrationStatusBySeason: { 'sea-ksl-s8': 'VERIFIED' }
      },
      {
        id: 't7',
        name: 'Nanyuki FC',
        shortName: 'NAN',
        slug: 'nanyuki-fc',
        logo: '🏔️',
        stadium: 'Nanyuki Stadium',
        city: 'Nanyuki',
        headCoachName: 'Coach Samson Kimathi',
        headCoachEmail: 'samson@nanyukifc.ke',
        headCoachPhone: '+254 725 334 455',
        registeredDate: '2026-08-16',
        status: 'ACTIVE',
        division: 'Premier Division',
        contactPerson: 'Samson K.',
        participatingSeasonIds: ['sea-ksl-s8'],
        registrationStatusBySeason: { 'sea-ksl-s8': 'VERIFIED' }
      },
      {
        id: 't8',
        name: 'City Stars FC',
        shortName: 'CSK',
        slug: 'city-stars',
        logo: '🌟',
        stadium: 'Hope Centre Grounds',
        city: 'Nairobi',
        headCoachName: 'Coach Kevin Omondi',
        headCoachEmail: 'kevin@citystars.ke',
        headCoachPhone: '+254 711 223 344',
        registeredDate: '2026-08-18',
        status: 'PENDING_DOCUMENTATION',
        division: 'Premier Division',
        contactPerson: 'Kevin O.',
        participatingSeasonIds: ['sea-ksl-s8'],
        registrationStatusBySeason: { 'sea-ksl-s8': 'PENDING' }
      },
      {
        id: 't9',
        name: 'Timau Stars FC',
        shortName: 'TIM',
        slug: 'timau-stars',
        logo: '🌠',
        stadium: 'Timau Municipal Grounds',
        city: 'Timau',
        headCoachName: 'Coach Daniel Gitonga',
        headCoachEmail: 'gitonga@timaustars.ke',
        headCoachPhone: '+254 722 556 778',
        registeredDate: '2026-10-10',
        status: 'PENDING_APPROVAL',
        division: 'Varsity Division',
        contactPerson: 'Daniel Gitonga',
        participatingSeasonIds: [],
        registrationStatusBySeason: {}
      }
    ];

    this.players = [
      {
        id: 'p1',
        name: 'Brian Otieno',
        teamId: 't2',
        position: 'FW',
        number: 10,
        age: 22,
        nationalId: 'ID-33928192',
        studentId: 'ST-KEMU-2023-882',
        eligibility: 'ELIGIBLE',
        statusNotes: 'Student athlete clearance verified; medical exam active.',
        joinedDate: '2025-09-01',
        appearances: 6,
        goals: 7,
        assists: 4,
        yellowCards: 1,
        redCards: 0,
        cleanSheets: 0
      },
      {
        id: 'p2',
        name: 'Samuel Mwangi',
        teamId: 't1',
        position: 'GK',
        number: 1,
        age: 23,
        nationalId: 'ID-31298411',
        studentId: 'ST-KEMU-2022-104',
        eligibility: 'ELIGIBLE',
        statusNotes: 'Verified starter; official clean sheets lead.',
        joinedDate: '2024-09-01',
        appearances: 6,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 4
      },
      {
        id: 'p3',
        name: 'Dennis Omondi',
        teamId: 't1',
        position: 'DF',
        number: 4,
        age: 24,
        nationalId: 'ID-29831920',
        studentId: 'ST-KEMU-2022-441',
        eligibility: 'SUSPENDED',
        statusNotes: 'Active 2-match disciplinary suspension (Article 9.4).',
        joinedDate: '2024-09-01',
        appearances: 5,
        goals: 1,
        assists: 0,
        yellowCards: 3,
        redCards: 1,
        cleanSheets: 3
      },
      {
        id: 'p4',
        name: 'Michael Olunga Jr.',
        teamId: 't6',
        position: 'FW',
        number: 9,
        age: 21,
        nationalId: 'ID-35591022',
        studentId: 'ST-THK-2024-019',
        eligibility: 'ELIGIBLE',
        statusNotes: 'Top scorer contender.',
        joinedDate: '2025-08-15',
        appearances: 6,
        goals: 5,
        assists: 2,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0
      },
      {
        id: 'p5',
        name: 'Alex Kamau',
        teamId: 't2',
        position: 'DF',
        number: 4,
        age: 22,
        nationalId: 'ID-32114092',
        studentId: 'ST-WAR-2023-311',
        eligibility: 'ELIGIBLE',
        statusNotes: 'Vice captain clearance confirmed.',
        joinedDate: '2025-09-10',
        appearances: 6,
        goals: 1,
        assists: 1,
        yellowCards: 2,
        redCards: 0,
        cleanSheets: 2
      },
      {
        id: 'p6',
        name: 'Elvis Rupia',
        teamId: 't5',
        position: 'FW',
        number: 9,
        age: 23,
        nationalId: 'ID-34091823',
        studentId: 'ST-KNG-2023-771',
        eligibility: 'PENDING_REGISTRATION',
        statusNotes: 'Awaiting university student sports registration endorsement.',
        joinedDate: '2026-08-20',
        appearances: 4,
        goals: 4,
        assists: 1,
        yellowCards: 1,
        redCards: 0,
        cleanSheets: 0
      },
      {
        id: 'p7',
        name: 'Kelvin Kiprop',
        teamId: 't2',
        position: 'MF',
        number: 14,
        age: 20,
        nationalId: 'ID-36109284',
        studentId: 'ST-WAR-2024-055',
        eligibility: 'PENDING_REGISTRATION',
        statusNotes: 'Invited by Coach Marcus. Midfield recruit awaiting clearance.',
        joinedDate: '2026-10-12',
        appearances: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0
      },
      {
        id: 'p8',
        name: 'David Kariuki',
        teamId: 't1',
        position: 'DF',
        number: 5,
        age: 22,
        nationalId: 'ID-32981044',
        studentId: 'ST-KEMU-2023-412',
        eligibility: 'PENDING_REGISTRATION',
        statusNotes: 'Invited by Coach John Mwangi. Transferred athlete awaiting roster approval.',
        joinedDate: '2026-10-14',
        appearances: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0
      }
    ];

    this.officials = [
      {
        id: 'off-1',
        name: 'James Mwangi',
        role: 'Center Referee',
        badge: 'NSFC Approved Referee',
        email: 'jmwangi.ref@nsfc.co.ke',
        phone: '+254 711 002 938',
        status: 'AVAILABLE',
        matchesOfficiated: 18,
        rating: 4.9
      },
      {
        id: 'off-2',
        name: 'Mary Mwangi',
        role: 'Assistant Referee 1',
        badge: 'NSFC Assistant Official',
        email: 'mary.ref@nsfc.co.ke',
        phone: '+254 722 334 455',
        status: 'AVAILABLE',
        matchesOfficiated: 14,
        rating: 4.8
      },
      {
        id: 'off-3',
        name: 'Charles Kiprono',
        role: 'Assistant Referee 2',
        badge: 'NSFC Assistant Official',
        email: 'kiprono@nsfc.co.ke',
        phone: '+254 733 112 233',
        status: 'AVAILABLE',
        matchesOfficiated: 12,
        rating: 4.6
      },
      {
        id: 'off-4',
        name: 'Peter Mutiso',
        role: 'Match Commissioner',
        badge: 'NSFC Match Commissioner',
        email: 'mutiso.comm@nsfc.co.ke',
        phone: '+254 720 998 877',
        status: 'AVAILABLE',
        matchesOfficiated: 24,
        rating: 5.0
      },
      {
        id: 'off-5',
        name: 'Eric Ndwiga',
        role: 'Center Referee',
        roles: ['Center Referee'],
        badge: 'NSFC Approved Referee',
        email: 'ndwiga.ref@nsfc.co.ke',
        phone: '+254 715 443 322',
        status: 'AVAILABLE',
        matchesOfficiated: 9,
        rating: 4.5
      },
      {
        id: 'off-6',
        name: 'Coach John Mwangi',
        role: 'Head Coach',
        roles: ['Head Coach'],
        badge: 'NSFC Certified Coach',
        email: 'jmwangi@kemu.ac.ke',
        phone: '+254 712 345 678',
        status: 'ASSIGNED',
        assignedTeamId: 't1',
        assignedTeamName: 'KeMU FC',
        matchesOfficiated: 0,
        rating: 4.9,
        assignmentHistory: [
          {
            id: 'asg-1',
            date: '2026-08-10',
            type: 'COACH_APPOINTMENT',
            title: 'KeMU FC Head Coach',
            role: 'Head Coach',
            status: 'ACTIVE',
            teamId: 't1'
          }
        ]
      },
      {
        id: 'off-7',
        name: 'Coach Marcus',
        role: 'Head Coach',
        roles: ['Head Coach', 'Center Referee'],
        badge: 'NSFC Certified Coach',
        email: 'coach.marcus@meruwarriors.co.ke',
        phone: '+254 722 987 654',
        status: 'ASSIGNED',
        assignedTeamId: 't2',
        assignedTeamName: 'Meru Warriors',
        matchesOfficiated: 5,
        rating: 4.8,
        assignmentHistory: [
          {
            id: 'asg-2',
            date: '2026-08-12',
            type: 'COACH_APPOINTMENT',
            title: 'Meru Warriors Head Coach',
            role: 'Head Coach',
            status: 'ACTIVE',
            teamId: 't2'
          }
        ]
      },
      {
        id: 'off-8',
        name: 'Coach Patrick Otieno',
        role: 'Head Coach',
        roles: ['Head Coach'],
        badge: 'NSFC Certified Coach',
        email: 'otieno.pat@campusstars.ac.ke',
        phone: '+254 733 456 789',
        status: 'ASSIGNED',
        assignedTeamId: 't3',
        assignedTeamName: 'Campus Stars FC',
        matchesOfficiated: 0,
        rating: 4.7
      },
      {
        id: 'off-9',
        name: 'Coach Benson Mwiti',
        role: 'Head Coach',
        roles: ['Head Coach', 'Match Commissioner'],
        badge: 'NSFC Certified Coach',
        email: 'mwiti@embukings.co.ke',
        phone: '+254 721 445 566',
        status: 'ASSIGNED',
        assignedTeamId: 't5',
        assignedTeamName: 'Embu Kings',
        matchesOfficiated: 8,
        rating: 4.9
      }
    ];

    this.sanctions = [
      {
        id: 'sanc-1',
        targetType: 'PLAYER',
        targetId: 'p3',
        targetName: 'Dennis Omondi',
        teamId: 't1',
        teamName: 'KeMU FC',
        violation: 'Violent conduct in technical area (Round 5)',
        sanctionType: 'MATCH_BAN',
        penalty: '2-Match Suspension',
        details: 'Disciplinary review upheld Center Referee red card submission with supplementary match commissioner report.',
        matchesCount: 2,
        issuedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        matchOrContext: 'Round 5 vs Meru Warriors',
        status: 'ACTIVE',
        hearingDate: '2026-10-10'
      },
      {
        id: 'sanc-2',
        targetType: 'TEAM',
        targetId: 't4',
        targetName: 'Isiolo United',
        teamId: 't4',
        teamName: 'Isiolo United',
        violation: 'Delayed kickoff and failure to provide regulation medical kit (Round 4)',
        sanctionType: 'FINE',
        penalty: 'KES 15,000 Fine',
        fineAmountKes: 15000,
        details: 'Payment mandated prior to Round 7 fixture.',
        issuedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        status: 'ACTIVE'
      }
    ];

    this.announcements = [
      {
        id: 'ann-1',
        title: 'NSFC Circular #14: Strict Pre-Match Technical Roster Submission',
        content: 'All coaches must submit signed starting eleven and bench lists on NovaSport Team Desk minimum 45 minutes prior to scheduled kickoff.',
        targetAudience: 'COACHES',
        priority: 'IMPORTANT',
        author: 'NSFC Secretariat',
        publishedAt: '2026-10-10T09:00:00Z',
        isPinned: true,
        relatedCompetitionId: 'c1'
      },
      {
        id: 'ann-2',
        title: 'Credibility Protocol: Strict Single-Match Official Assignment Exclusivity',
        content: 'Officials are appointed strictly to one fixture at a time. All pitch events must be verified pitchside within the 15-minute post-match window.',
        targetAudience: 'OFFICIALS',
        priority: 'URGENT',
        author: 'Referees Appointment Committee',
        publishedAt: '2026-10-11T08:30:00Z',
        isPinned: true,
        relatedCompetitionId: 'c1'
      },
      {
        id: 'ann-3',
        title: 'Player Registrations: Student Athlete Eligibility Verification Closes Friday',
        content: 'Mid-season registration and clearance window closes Friday 17:00 EAT. Use coach invite links for prospective player profile activations.',
        targetAudience: 'ALL',
        priority: 'NORMAL',
        author: 'League Commissioner',
        publishedAt: '2026-10-12T07:15:00Z',
        isPinned: false,
        relatedCompetitionId: 'c1'
      }
    ];

    this.authorizedUsers = [
      {
        id: 'usr-1',
        name: 'Dr. Geoffrey Mwangi',
        email: 'gmwangi@novasport.ke',
        role: 'NSFC_DIRECTOR',
        roleTitle: 'NSFC Competition Director',
        jurisdiction: 'All Competitions & Regulations',
        avatar: '👔',
        status: 'ACTIVE',
        lastActive: 'Just now',
        permissions: ['ALL_COMPETITIONS', 'CERTIFY_RESULTS', 'ISSUE_SANCTIONS', 'PUBLISH_BULLETINS']
      },
      {
        id: 'usr-2',
        name: 'Peter Mutiso',
        email: 'mutiso@novasport.ke',
        role: 'MATCH_COMMISSIONER',
        roleTitle: 'Chief Match Commissioner',
        jurisdiction: 'Match Operations & Officials',
        avatar: '📋',
        status: 'ACTIVE',
        lastActive: '12 mins ago',
        permissions: ['MATCH_OPERATIONS', 'APPOINT_OFFICIALS', 'REVIEW_REPORTS']
      },
      {
        id: 'usr-3',
        name: 'Sarah Kimani',
        email: 'kimani.law@novasport.ke',
        role: 'DISCIPLINARY_SECRETARIAT',
        roleTitle: 'Head of Disciplinary Committee',
        jurisdiction: 'Disciplinary Tribunal & Appeals',
        avatar: '⚖️',
        status: 'ACTIVE',
        lastActive: '2 hours ago',
        permissions: ['ISSUE_SANCTIONS', 'STANDINGS_ADJUSTMENT', 'PLAYER_ELIGIBILITY']
      },
      {
        id: 'usr-4',
        name: 'NovaSport HQ Systems',
        email: 'ops@novasport.ke',
        role: 'SUPER_ADMIN',
        roleTitle: 'Platform Super Administrator',
        jurisdiction: 'NovaSport Platform Architecture',
        avatar: '⚡',
        status: 'ACTIVE',
        lastActive: 'Active now',
        permissions: ['PLATFORM_CONFIG', 'USER_MANAGEMENT', 'AUDIT_TRAIL', 'SYSTEM_RESET']
      }
    ];

    this.auditLogs = [
      {
        id: 'aud-1',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        adminName: 'Chief Administrator',
        action: 'MATCH_OFFICIAL_APPOINTED',
        category: 'OFFICIAL',
        details: 'Appointed James Mwangi (Center Referee) for KeMU FC vs Meru Warriors. Single-match credibility rule validated.',
        severity: 'INFO'
      },
      {
        id: 'aud-2',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        adminName: 'NSFC Secretariat',
        action: 'SEASON_CONFIGURED',
        category: 'SEASON',
        details: 'Updated KeMU Super League Season 8 lifecycle to IN_PROGRESS. 8 participating teams validated.',
        severity: 'INFO'
      },
      {
        id: 'aud-3',
        timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
        adminName: 'Disciplinary Committee',
        action: 'SANCTION_ISSUED',
        category: 'DISCIPLINE',
        details: 'Issued 2-match ban for Dennis Omondi (KeMU FC) following referee incident review.',
        severity: 'WARNING'
      },
      {
        id: 'aud-4',
        timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
        adminName: 'League Administrator',
        action: 'RESULT_CERTIFIED',
        category: 'RESULT',
        details: 'Certified official score KeMU FC 2 - 1 Thika United. Updated league standings and top scorer records.',
        severity: 'INFO'
      }
    ];

    this.matchReadiness = {
      'm1': {
        venueConfirmed: true,
        officialsAppointed: true,
        homeLineupSubmitted: true,
        awayLineupSubmitted: true,
        medicalStaffOnSite: true,
        matchBallApproved: true
      },
      'm2': {
        venueConfirmed: true,
        officialsAppointed: true,
        homeLineupSubmitted: false,
        awayLineupSubmitted: false,
        medicalStaffOnSite: true,
        matchBallApproved: true
      }
    };

    this.saveState();
  }

  private saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          competitions: this.competitions,
          seasons: this.seasons,
          teams: this.teams,
          players: this.players,
          officials: this.officials,
          sanctions: this.sanctions,
          announcements: this.announcements,
          auditLogs: this.auditLogs,
          authorizedUsers: this.authorizedUsers,
          matchReadiness: this.matchReadiness,
          selectedCompetitionId: this.selectedCompetitionId,
          selectedSeasonId: this.selectedSeasonId
        })
      );
    } catch (e) {
      console.error('Failed to save adminStore state', e);
    }
    this.notify();
  }

  public getState(): AdminStoreState {
    return {
      competitions: [...this.competitions],
      seasons: [...this.seasons],
      teams: [...this.teams],
      players: [...this.players],
      officials: [...this.officials],
      sanctions: [...this.sanctions],
      announcements: [...this.announcements],
      auditLogs: [...this.auditLogs],
      authorizedUsers: [...this.authorizedUsers],
      matchReadiness: { ...this.matchReadiness },
      selectedCompetitionId: this.selectedCompetitionId,
      selectedSeasonId: this.selectedSeasonId
    };
  }

  public subscribe(listener: (state?: AdminStoreState) => void): () => void {
    this.listeners.push(listener as any);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const st = this.getState();
    this.listeners.forEach(fn => (fn as any)(st));
  }

  // --- Operating Context State ---
  public getSelectedCompetitionId(): string {
    return this.selectedCompetitionId;
  }

  public setSelectedCompetitionId(id: string) {
    this.selectedCompetitionId = id;
    const comp = this.competitions.find(c => c.id === id);
    if (comp?.activeSeasonId) {
      this.selectedSeasonId = comp.activeSeasonId;
    } else {
      const firstSeason = this.seasons.find(s => s.competitionId === id);
      if (firstSeason) this.selectedSeasonId = firstSeason.id;
    }
    this.saveState();
  }

  public getSelectedSeasonId(): string {
    return this.selectedSeasonId;
  }

  public setSelectedSeasonId(id: string) {
    this.selectedSeasonId = id;
    const season = this.seasons.find(s => s.id === id);
    if (season) {
      this.selectedCompetitionId = season.competitionId;
    }
    this.saveState();
  }

  // --- Audit Logger ---
  public logAudit(entry: Omit<PlatformAuditEntry, 'id' | 'timestamp'>) {
    const newEntry: PlatformAuditEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newEntry);
    this.saveState();

    // Persist to Supabase
    supabase.from('audit_logs').insert({
      id: newEntry.id,
      timestamp: newEntry.timestamp,
      admin_name: newEntry.adminName,
      action: newEntry.action,
      category: newEntry.category,
      details: newEntry.details,
      severity: newEntry.severity || 'INFO'
    }).then(undefined, (err: any) => console.warn('Supabase audit log error:', err));
  }

  // --- Competitions API ---
  public getCompetitions(): AdminCompetition[] {
    return [...this.competitions];
  }

  public getCompetitionById(id: string): AdminCompetition | undefined {
    return this.competitions.find(c => c.id === id);
  }

  public createCompetition(data: Partial<AdminCompetition> & { name: string }): AdminCompetition {
    const id = `c-${Date.now()}`;
    const newComp: AdminCompetition = {
      id,
      name: data.name,
      shortName: data.shortName || data.name.substring(0, 3).toUpperCase(),
      code: data.code || `${data.name.substring(0, 3).toUpperCase()}-LEAGUE`,
      governingBody: data.governingBody || 'NSFC (NovaSport Football Council)',
      tier: data.tier || 'Tier 1 - Premier',
      type: data.type || 'LEAGUE',
      format: data.format || 'Double Round-Robin',
      activeSeasonId: `sea-${id}-s1`,
      status: data.status || 'ACTIVE',
      teamCount: data.teamCount || 8,
      roundsCount: data.roundsCount || 14,
      currentRound: 1,
      description: data.description || 'Competition organized under NSFC governance.',
      rules: data.rules || {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        maxForeignPlayers: 4,
        maxSquadSize: 25,
        minHomegrownPlayers: 8,
        yellowCardSuspensionThreshold: 3,
        matchDurationMinutes: 90
      }
    };
    this.competitions.push(newComp);

    // Automatically create initial season
    const newSeason: AdminSeason = {
      id: `sea-${id}-s1`,
      competitionId: id,
      name: 'Inaugural Season (2026/27)',
      year: '2026/27',
      status: 'PLANNING',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 180).toISOString().split('T')[0],
      registrationDeadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      participatingTeamIds: [],
      roundsCount: newComp.roundsCount,
      currentRound: 0,
      rulesSummary: 'Default NSFC regulation parameters.',
      isPublished: false,
      matchCount: 0
    };
    this.seasons.push(newSeason);

    this.logAudit({
      adminName: 'Administrator',
      action: 'COMPETITION_CREATED',
      category: 'COMPETITION',
      details: `Created competition '${newComp.name}' (${newComp.governingBody}) and initial season.`
    });
    this.saveState();

    // Persist to Supabase
    supabase.from('competitions').insert({
      id: newComp.id,
      name: newComp.name,
      short_name: newComp.shortName,
      code: newComp.code,
      governing_body: newComp.governingBody,
      tier: newComp.tier,
      type: newComp.type,
      format: newComp.format,
      rules: newComp.rules,
      active_season_id: null,
      status: newComp.status,
      team_count: newComp.teamCount,
      rounds_count: newComp.roundsCount,
      current_round: 1,
      description: newComp.description
    }).then(() => {
      return supabase.from('seasons').insert({
        id: newSeason.id,
        competition_id: newComp.id,
        name: newSeason.name,
        year: newSeason.year,
        status: newSeason.status,
        start_date: newSeason.startDate,
        end_date: newSeason.endDate,
        registration_deadline: newSeason.registrationDeadline,
        rounds_count: newSeason.roundsCount,
        current_round: 0,
        rules_summary: newSeason.rulesSummary,
        is_published: newSeason.isPublished,
        match_count: 0
      });
    }).then(() => {
      return supabase.from('competitions').update({ active_season_id: newSeason.id }).eq('id', newComp.id);
    }).then(undefined, (err: any) => console.warn('Supabase createCompetition error:', err));

    return newComp;
  }

  public updateCompetitionStatus(id: string, status: AdminCompetition['status']) {
    const comp = this.competitions.find(c => c.id === id);
    if (comp) {
      comp.status = status;
      this.logAudit({
        adminName: 'Administrator',
        action: 'COMPETITION_STATUS_UPDATED',
        category: 'COMPETITION',
        details: `Updated ${comp.name} status to ${status}.`
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('competitions').update({ status }).eq('id', id).then(undefined, console.error);
    }
  }

  // --- Seasons API ---
  public getSeasons(competitionId?: string): AdminSeason[] {
    if (competitionId) {
      return this.seasons.filter(s => s.competitionId === competitionId);
    }
    return [...this.seasons];
  }

  public getSeasonById(id: string): AdminSeason | undefined {
    return this.seasons.find(s => s.id === id);
  }

  public createSeason(data: Omit<AdminSeason, 'id' | 'matchCount'>): AdminSeason {
    const newSeason: AdminSeason = {
      ...data,
      id: `sea-${Date.now()}`,
      matchCount: 0
    };
    this.seasons.push(newSeason);

    const comp = this.competitions.find(c => c.id === data.competitionId);
    if (comp) {
      comp.activeSeasonId = newSeason.id;
    }

    this.logAudit({
      adminName: 'Administrator',
      action: 'SEASON_INITIALIZED',
      category: 'SEASON',
      details: `Initialized new season '${newSeason.name}' for competition '${comp?.name || data.competitionId}'.`
    });
    this.saveState();

    // Persist to Supabase
    supabase.from('seasons').insert({
      id: newSeason.id,
      competition_id: newSeason.competitionId,
      name: newSeason.name,
      year: newSeason.year,
      status: newSeason.status,
      start_date: newSeason.startDate || null,
      end_date: newSeason.endDate || null,
      registration_deadline: newSeason.registrationDeadline || null,
      rounds_count: newSeason.roundsCount || 14,
      current_round: newSeason.currentRound || 1,
      rules_summary: newSeason.rulesSummary || null,
      is_published: newSeason.isPublished ?? true,
      match_count: 0
    }).then(() => {
      return supabase.from('competitions').update({ active_season_id: newSeason.id }).eq('id', newSeason.competitionId);
    }).then(undefined, console.error);

    return newSeason;
  }

  public updateSeasonStatus(seasonId: string, status: SeasonLifecycleStatus) {
    const season = this.seasons.find(s => s.id === seasonId);
    if (season) {
      season.status = status;
      this.logAudit({
        adminName: 'Administrator',
        action: 'SEASON_STATUS_TRANSITION',
        category: 'SEASON',
        details: `Updated season '${season.name}' lifecycle to ${status}.`
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('seasons').update({ status }).eq('id', seasonId).then(undefined, console.error);
    }
  }

  public toggleSeasonPublication(seasonId: string, isPublished: boolean) {
    const season = this.seasons.find(s => s.id === seasonId);
    if (season) {
      season.isPublished = isPublished;
      this.logAudit({
        adminName: 'Administrator',
        action: isPublished ? 'SEASON_PUBLISHED_TO_PUBLIC' : 'SEASON_UNPUBLISHED',
        category: 'SEASON',
        details: `${isPublished ? 'Published' : 'Hidden'} season '${season.name}' on public portal.`
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('seasons').update({ is_published: isPublished }).eq('id', seasonId).then(undefined, console.error);
    }
  }

  // --- Single Active Season Rule & Historical Archiving ---
  public setActiveSeason(competitionId: string, seasonId: string) {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) return;
    comp.activeSeasonId = seasonId;
    this.selectedSeasonId = seasonId;

    // Enforce rule: A league can only have one active season at a time
    this.seasons.forEach(s => {
      if (s.competitionId === competitionId) {
        if (s.id === seasonId) {
          s.status = 'IN_PROGRESS';
        } else if (s.status === 'IN_PROGRESS') {
          s.status = 'CONCLUDED';
        }
      }
    });

    this.logAudit({
      adminName: 'Administrator',
      action: 'ACTIVE_SEASON_SWITCHED',
      category: 'SEASON',
      details: `Designated season #${seasonId} as sole active season for '${comp.name}'. Previous seasons archived.`
    });
    this.saveState();

    // Persist to Supabase atomically
    supabase.from('competitions').update({ active_season_id: seasonId }).eq('id', competitionId)
      .then(() => supabase.from('seasons').update({ status: 'CONCLUDED' }).eq('competition_id', competitionId).neq('id', seasonId).eq('status', 'IN_PROGRESS'))
      .then(() => supabase.from('seasons').update({ status: 'IN_PROGRESS' }).eq('id', seasonId))
      .then(undefined, console.error);
  }

  public getActiveSeason(competitionId?: string): AdminSeason | undefined {
    const targetCompId = competitionId || this.selectedCompetitionId;
    const comp = this.competitions.find(c => c.id === targetCompId);
    if (!comp) return undefined;
    return this.seasons.find(s => s.id === comp.activeSeasonId) ||
           this.seasons.find(s => s.competitionId === targetCompId && s.status === 'IN_PROGRESS') ||
           this.seasons.find(s => s.competitionId === targetCompId);
  }

  public getPastSeasons(competitionId?: string): AdminSeason[] {
    const targetCompId = competitionId || this.selectedCompetitionId;
    const active = this.getActiveSeason(targetCompId);
    return this.seasons.filter(s => s.competitionId === targetCompId && s.id !== active?.id);
  }

  public addTeamToSeason(seasonId: string, teamId: string): boolean {
    const season = this.seasons.find(s => s.id === seasonId);
    const team = this.teams.find(t => t.id === teamId);
    if (!season || !team) return false;

    // Rule: Only allow teams that have already been registered and approved by admin
    if (team.status !== 'ACTIVE') {
      throw new Error(`Team '${team.name}' cannot participate because it is not approved by NSFC (status: ${team.status}).`);
    }

    if (!season.participatingTeamIds.includes(teamId)) {
      season.participatingTeamIds.push(teamId);
    }
    if (!team.participatingSeasonIds.includes(seasonId)) {
      team.participatingSeasonIds.push(seasonId);
    }
    if (!team.registrationStatusBySeason) team.registrationStatusBySeason = {};
    team.registrationStatusBySeason[seasonId] = 'VERIFIED';

    this.logAudit({
      adminName: 'Administrator',
      action: 'TEAM_ADDED_TO_SEASON',
      category: 'SEASON',
      details: `Enrolled approved club '${team.name}' into season '${season.name}'.`
    });
    this.saveState();

    // Persist to Supabase
    supabase.from('season_teams').insert({
      season_id: seasonId,
      team_id: teamId,
      registration_status: 'VERIFIED'
    }).then(undefined, console.error);

    return true;
  }

  public removeTeamFromSeason(seasonId: string, teamId: string): boolean {
    const season = this.seasons.find(s => s.id === seasonId);
    const team = this.teams.find(t => t.id === teamId);
    if (!season) return false;

    season.participatingTeamIds = season.participatingTeamIds.filter(id => id !== teamId);
    if (team) {
      team.participatingSeasonIds = team.participatingSeasonIds.filter(id => id !== seasonId);
      if (team.registrationStatusBySeason) {
        delete team.registrationStatusBySeason[seasonId];
      }
    }

    this.logAudit({
      adminName: 'Administrator',
      action: 'TEAM_REMOVED_FROM_SEASON',
      category: 'SEASON',
      details: `Removed club '${team?.name || teamId}' from season '${season.name}'.`
    });
    this.saveState();

    // Persist to Supabase
    supabase.from('season_teams').delete().eq('season_id', seasonId).eq('team_id', teamId).then(undefined, console.error);

    return true;
  }

  // --- Teams API ---
  public getTeams(seasonId?: string): AdminTeamRecord[] {
    if (seasonId) {
      return this.teams.filter(t => t.participatingSeasonIds?.includes(seasonId));
    }
    return [...this.teams];
  }

  public getTeamById(id: string): AdminTeamRecord | undefined {
    return this.teams.find(t => t.id === id);
  }

  public registerTeam(data: any): AdminTeamRecord {
    const shortName = data.shortName || data.shortCode || (data.name ? data.name.substring(0, 3).toUpperCase() : 'FC');
    const newTeam: AdminTeamRecord = {
      id: `t-${Date.now()}`,
      name: data.name,
      shortName,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      logo: data.logo || '⚽',
      stadium: data.stadium || data.city || 'Main Campus Stadium',
      city: data.city || 'Meru',
      headCoachName: data.headCoachName || data.coachName || 'Unassigned Coach',
      headCoachEmail: data.headCoachEmail || data.coachEmail || 'coach@novasport.ke',
      headCoachPhone: data.headCoachPhone || '+254 700 000 000',
      registeredDate: new Date().toISOString().split('T')[0],
      status: data.status || 'PENDING_APPROVAL',
      division: data.division || 'Premier Division',
      contactPerson: data.contactPerson || 'Club Secretariat',
      participatingSeasonIds: data.participatingSeasonIds || [this.selectedSeasonId],
      registrationStatusBySeason: { [this.selectedSeasonId]: 'VERIFIED' }
    };
    this.teams.push(newTeam);

    const currentSeason = this.seasons.find(s => s.id === this.selectedSeasonId);
    if (currentSeason && !currentSeason.participatingTeamIds.includes(newTeam.id)) {
      currentSeason.participatingTeamIds.push(newTeam.id);
    }

    this.logAudit({
      adminName: 'Administrator',
      action: 'TEAM_REGISTERED',
      category: 'TEAM',
      details: `Officially registered team '${newTeam.name}' (${newTeam.shortName}) with NSFC affiliation. Head Coach: ${newTeam.headCoachName}.`
    });
    this.saveState();

    // Persist to Supabase
    supabase.from('teams').insert({
      id: newTeam.id,
      name: newTeam.name,
      short_name: newTeam.shortName,
      slug: newTeam.slug,
      logo: newTeam.logo,
      stadium: newTeam.stadium,
      city: newTeam.city,
      division: newTeam.division,
      contact_person: newTeam.contactPerson,
      head_coach_name: newTeam.headCoachName,
      head_coach_email: newTeam.headCoachEmail,
      head_coach_phone: newTeam.headCoachPhone,
      status: newTeam.status
    }).then(() => {
      if (this.selectedSeasonId) {
        return supabase.from('season_teams').insert({
          season_id: this.selectedSeasonId,
          team_id: newTeam.id,
          registration_status: 'VERIFIED'
        });
      }
    }).then(undefined, console.error);

    return newTeam;
  }

  public updateTeamStatus(id: string, status: AdminTeamRecord['status'], reason?: string) {
    const team = this.teams.find(t => t.id === id);
    if (team) {
      team.status = status;
      this.logAudit({
        adminName: 'Administrator',
        action: 'TEAM_STATUS_CHANGED',
        category: 'TEAM',
        details: `Team ${team.name} status changed to ${status}. Reason: ${reason || 'Administrative governance decision'}.`,
        severity: status === 'SUSPENDED' ? 'CRITICAL' : 'INFO'
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('teams').update({ status }).eq('id', id).then(undefined, console.error);
    }
  }

  public updateTeamInfo(teamId: string, data: Partial<AdminTeamRecord>) {
    const team = this.teams.find(t => t.id === teamId);
    if (team) {
      if (data.name) team.name = data.name;
      if (data.shortName) team.shortName = data.shortName;
      if (data.city) team.city = data.city;
      if (data.stadium) team.stadium = data.stadium;
      if (data.division) team.division = data.division;
      if (data.logo) team.logo = data.logo;
      if (data.contactPerson) team.contactPerson = data.contactPerson;
      this.logAudit({
        adminName: 'Administrator',
        action: 'TEAM_UPDATED',
        category: 'TEAM',
        details: `Updated club profile information for '${team.name}'.`
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('teams').update({
        name: team.name,
        short_name: team.shortName,
        city: team.city,
        stadium: team.stadium,
        division: team.division,
        logo: team.logo,
        contact_person: team.contactPerson
      }).eq('id', teamId).then(undefined, console.error);
    }
  }

  public approveTeam(teamId: string) {
    const team = this.teams.find(t => t.id === teamId);
    if (team) {
      team.status = 'ACTIVE';
      this.logAudit({
        adminName: 'Administrator',
        action: 'TEAM_APPROVED',
        category: 'TEAM',
        details: `Approved team registration for '${team.name}'. Club is now officially recognized and eligible for league enrollment.`
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('teams').update({ status: 'ACTIVE' }).eq('id', teamId).then(undefined, console.error);
    }
  }

  public rejectTeam(teamId: string, reason?: string) {
    const team = this.teams.find(t => t.id === teamId);
    if (team) {
      team.status = 'REJECTED';
      this.logAudit({
        adminName: 'Administrator',
        action: 'TEAM_REJECTED',
        category: 'TEAM',
        details: `Rejected registration application for '${team.name}'. Reason: ${reason || 'Incomplete registration'}.`,
        severity: 'WARNING'
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('teams').update({ status: 'REJECTED' }).eq('id', teamId).then(undefined, console.error);
    }
  }

  public assignTeamCoach(teamId: string, coach: { name: string; email: string; phone: string; officialId?: string }) {
    const team = this.teams.find(t => t.id === teamId);
    if (team) {
      team.headCoachName = coach.name;
      team.headCoachEmail = coach.email;
      team.headCoachPhone = coach.phone;

      // Sync with Official Directory record
      let official = coach.officialId 
        ? this.officials.find(o => o.id === coach.officialId)
        : this.officials.find(o => o.name.toLowerCase() === coach.name.toLowerCase() || o.phone === coach.phone);

      const officialId = official?.id || `off-${Date.now()}`;

      if (official) {
        official.status = 'ASSIGNED';
        official.assignedTeamId = team.id;
        official.assignedTeamName = team.name;
        if (!official.roles) official.roles = [official.role];
        if (!official.roles.includes('Head Coach')) {
          official.roles.push('Head Coach');
        }
        if (!official.assignmentHistory) official.assignmentHistory = [];
        official.assignmentHistory.unshift({
          id: `asg-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'COACH_APPOINTMENT',
          title: `${team.name} Head Coach`,
          role: 'Head Coach',
          status: 'ACTIVE',
          teamId: team.id
        });
      } else {
        const newOff: OfficialRecord = {
          id: officialId,
          name: coach.name,
          role: 'Head Coach',
          roles: ['Head Coach'],
          badge: 'NSFC Certified Coach',
          email: coach.email || 'coach@nsfc.co.ke',
          phone: coach.phone,
          status: 'ASSIGNED',
          assignedTeamId: team.id,
          assignedTeamName: team.name,
          matchesOfficiated: 0,
          rating: 4.8,
          assignmentHistory: [
            {
              id: `asg-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'COACH_APPOINTMENT',
              title: `${team.name} Head Coach`,
              role: 'Head Coach',
              status: 'ACTIVE',
              teamId: team.id
            }
          ]
        };
        this.officials.push(newOff);
      }

      this.logAudit({
        adminName: 'Administrator',
        action: 'COACH_ASSIGNED',
        category: 'TEAM',
        details: `Directly appointed ${coach.name} as Head Coach for '${team.name}'. Synchronized with Official Directory.`
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('teams').update({
        head_coach_name: coach.name,
        head_coach_email: coach.email,
        head_coach_phone: coach.phone
      }).eq('id', teamId)
      .then(() => supabase.from('coaches').insert({
        name: coach.name,
        email: coach.email,
        phone: coach.phone,
        team_id: teamId,
        role: 'Head Coach',
        status: 'ACTIVE'
      }))
      .then(() => supabase.from('officials').upsert({
        id: officialId,
        name: coach.name,
        role: 'Head Coach',
        roles: ['Head Coach'],
        badge: 'NSFC Certified Coach',
        email: coach.email,
        phone: coach.phone,
        status: 'ASSIGNED',
        assigned_team_id: teamId
      }))
      .then(undefined, console.error);
    }
  }

  // --- Players API ---
  public getPlayers(teamId?: string): AdminPlayerRecord[] {
    if (teamId) {
      return this.players.filter(p => p.teamId === teamId);
    }
    return [...this.players];
  }

  public getPlayerById(id: string): AdminPlayerRecord | undefined {
    return this.players.find(p => p.id === id);
  }

  public registerPlayer(data: Omit<AdminPlayerRecord, 'id' | 'appearances' | 'goals' | 'assists' | 'yellowCards' | 'redCards' | 'cleanSheets'>): AdminPlayerRecord {
    const newPlayer: AdminPlayerRecord = {
      ...data,
      id: `p-${Date.now()}`,
      appearances: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      memberships: [
        {
          id: `mem-${Date.now()}`,
          playerId: `p-${Date.now()}`,
          teamId: data.teamId,
          teamName: this.teams.find(t => t.id === data.teamId)?.name || 'Club',
          seasonId: this.selectedSeasonId,
          seasonName: this.seasons.find(s => s.id === this.selectedSeasonId)?.name || 'Active Season',
          number: data.number,
          position: data.position,
          status: data.eligibility === 'ELIGIBLE' ? 'APPROVED' : 'PENDING',
          invitedDate: data.joinedDate || new Date().toISOString().split('T')[0]
        }
      ]
    };
    this.players.push(newPlayer);

    this.logAudit({
      adminName: 'Administrator',
      action: 'PLAYER_REGISTERED',
      category: 'TEAM',
      details: `Registered athlete '${newPlayer.name}' (#${newPlayer.number}, ${newPlayer.position}) for team ${newPlayer.teamId}. Eligibility: ${newPlayer.eligibility}.`
    });
    this.saveState();

    // Persist to Supabase
    supabase.from('players').insert({
      id: newPlayer.id,
      name: newPlayer.name,
      team_id: newPlayer.teamId || null,
      position: newPlayer.position,
      number: newPlayer.number,
      age: newPlayer.age,
      national_id: newPlayer.nationalId,
      student_id: newPlayer.studentId,
      eligibility: newPlayer.eligibility,
      status_notes: newPlayer.statusNotes,
      joined_date: newPlayer.joinedDate
    }).then(() => {
      if (newPlayer.teamId && this.selectedSeasonId) {
        return supabase.from('roster_memberships').insert({
          player_id: newPlayer.id,
          team_id: newPlayer.teamId,
          season_id: this.selectedSeasonId,
          jersey_number: newPlayer.number,
          position: newPlayer.position,
          status: newPlayer.eligibility === 'ELIGIBLE' ? 'APPROVED' : 'PENDING',
          invited_date: new Date().toISOString()
        });
      }
    }).then(undefined, console.error);

    return newPlayer;
  }

  public updatePlayerEligibility(playerId: string, eligibility: AdminPlayerRecord['eligibility'], notes?: string) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.eligibility = eligibility;
      if (notes) player.statusNotes = notes;
      this.logAudit({
        adminName: 'Administrator',
        action: 'PLAYER_ELIGIBILITY_UPDATED',
        category: 'TEAM',
        details: `Updated eligibility for ${player.name} to ${eligibility}. Notes: ${notes || 'Governance clearance'}.`,
        severity: eligibility === 'SUSPENDED' || eligibility === 'INELIGIBLE' ? 'WARNING' : 'INFO'
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('players').update({
        eligibility,
        status_notes: notes || null
      }).eq('id', playerId).then(undefined, console.error);
    }
  }

  public approvePlayer(playerId: string, teamId?: string, seasonId?: string) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.eligibility = 'ELIGIBLE';
      player.statusNotes = 'Approved by NSFC Administrator into official roster.';

      const targetTeamId = teamId || player.teamId;
      const targetTeam = this.teams.find(t => t.id === targetTeamId);
      const targetSeasonId = seasonId || this.selectedSeasonId;
      const targetSeason = this.seasons.find(s => s.id === targetSeasonId);

      if (!player.memberships) player.memberships = [];
      const existingMem = player.memberships.find(m => m.teamId === targetTeamId && m.seasonId === targetSeasonId);
      if (existingMem) {
        existingMem.status = 'APPROVED';
        existingMem.approvedDate = new Date().toISOString().split('T')[0];
      } else {
        player.memberships.push({
          id: `mem-${Date.now()}`,
          playerId: player.id,
          teamId: targetTeamId,
          teamName: targetTeam?.name || 'Club',
          seasonId: targetSeasonId,
          seasonName: targetSeason?.name || 'Active Season',
          number: player.number,
          position: player.position,
          status: 'APPROVED',
          invitedDate: player.joinedDate || new Date().toISOString().split('T')[0],
          approvedDate: new Date().toISOString().split('T')[0]
        });
      }

      this.logAudit({
        adminName: 'Administrator',
        action: 'PLAYER_APPROVED',
        category: 'TEAM',
        details: `Approved athlete '${player.name}' into official team roster for ${targetTeam?.name || 'Club'}.`
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('players').update({
        eligibility: 'ELIGIBLE',
        status_notes: 'Approved by NSFC Administrator into official roster.'
      }).eq('id', playerId)
      .then(() => {
        return supabase.from('roster_memberships').update({
          status: 'APPROVED',
          approved_date: new Date().toISOString()
        }).eq('player_id', playerId);
      }).then(undefined, console.error);
    }
  }

  public rejectPlayer(playerId: string, reason?: string) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.eligibility = 'INELIGIBLE';
      player.statusNotes = reason || 'Invitation rejected by League Administrator.';

      if (player.memberships) {
        player.memberships.forEach(m => {
          if (m.teamId === player.teamId) {
            m.status = 'REJECTED';
            m.rejectionReason = reason;
          }
        });
      }

      this.logAudit({
        adminName: 'Administrator',
        action: 'PLAYER_REJECTED',
        category: 'TEAM',
        details: `Rejected player invitation for '${player.name}'. Reason: ${reason || 'Ineligible'}.`,
        severity: 'WARNING'
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('players').update({
        eligibility: 'INELIGIBLE',
        status_notes: reason || 'Invitation rejected by League Administrator.'
      }).eq('id', playerId)
      .then(() => {
        return supabase.from('roster_memberships').update({
          status: 'REJECTED',
          rejection_reason: reason || 'Ineligible'
        }).eq('player_id', playerId);
      }).then(undefined, console.error);
    }
  }

  public getPendingPlayers(teamId?: string): AdminPlayerRecord[] {
    return this.players.filter(p => {
      const isPending = p.eligibility === 'PENDING_REGISTRATION';
      return teamId ? isPending && p.teamId === teamId : isPending;
    });
  }

  // --- Fixtures & Match Operations ---
  public getMatches(seasonId?: string): OfficialMatchData[] {
    const all = matchStore.getAllMatches();
    if (seasonId) {
      return all.filter(m => (m as any).seasonId === seasonId || m.competition?.season?.includes(seasonId));
    }
    return all;
  }

  public scheduleFixture(fixtureData: {
    competitionId?: string;
    seasonId?: string;
    homeTeamId?: string;
    awayTeamId?: string;
    homeTeam?: string;
    awayTeam?: string;
    date: string;
    time: string;
    venue: string;
    round?: string;
    referee?: string;
  }): OfficialMatchData {
    const homeTeamRec = this.teams.find(t => t.id === fixtureData.homeTeamId || t.name === fixtureData.homeTeam);
    const awayTeamRec = this.teams.find(t => t.id === fixtureData.awayTeamId || t.name === fixtureData.awayTeam);

    const matchId = `m-${Date.now()}`;
    const competitionId = fixtureData.competitionId || this.selectedCompetitionId || 'c1';
    const compName = this.competitions.find(c => c.id === competitionId)?.name || 'KeMU Super League';
    const seasonId = fixtureData.seasonId || this.selectedSeasonId || 'sea-ksl-s8';
    const seasonName = this.seasons.find(s => s.id === seasonId)?.name || 'Season 8';

    const newMatch: OfficialMatchData = {
      id: matchId,
      competition: {
        id: competitionId,
        name: compName,
        season: seasonName
      },
      round: fixtureData.round || 'Regular Fixture',
      season: seasonName,
      date: fixtureData.date,
      time: fixtureData.time,
      venue: fixtureData.venue,
      status: 'SCHEDULED',
      minute: 'Pre-Match',
      homeTeam: {
        id: homeTeamRec?.id || 't-home',
        name: homeTeamRec?.name || fixtureData.homeTeam || 'Home Team',
        shortName: homeTeamRec?.shortName || 'HOM',
        logo: homeTeamRec?.logo || '⚽',
        color: '#FF6A00'
      },
      awayTeam: {
        id: awayTeamRec?.id || 't-away',
        name: awayTeamRec?.name || fixtureData.awayTeam || 'Away Team',
        shortName: awayTeamRec?.shortName || 'AWY',
        logo: awayTeamRec?.logo || '🛡️',
        color: '#3B82F6'
      },
      homeScore: 0,
      awayScore: 0,
      preMatchReadinessConfirmed: false,
      homeTeamSheetApproved: false,
      awayTeamSheetApproved: false,
      events: [],
      officials: [],
      homeLineup: { formation: '4-3-3', starters: [], subs: [] },
      awayLineup: { formation: '4-3-3', starters: [], subs: [] },
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          action: 'MATCH_SCHEDULED',
          timestamp: new Date().toISOString(),
          officialId: 'admin-root',
          officialName: 'NSFC League Administrator',
          summary: `Scheduled fixture ${homeTeamRec?.name || fixtureData.homeTeam} vs ${awayTeamRec?.name || fixtureData.awayTeam} at ${fixtureData.venue}`
        }
      ]
    };

    if (fixtureData.referee) {
      const off = this.officials.find(o => o.name === fixtureData.referee || o.id === fixtureData.referee);
      if (off) {
        newMatch.officials.push({
          id: off.id,
          name: off.name,
          role: 'Center Referee',
          badge: off.badge
        });
        off.status = 'ASSIGNED';
        off.currentMatchId = matchId;
      }
    }

    this.matchReadiness[matchId] = {
      venueConfirmed: true,
      officialsAppointed: !!fixtureData.referee,
      homeLineupSubmitted: false,
      awayLineupSubmitted: false,
      medicalStaffOnSite: false,
      matchBallApproved: true
    };

    const existingMatches = matchStore.getAllMatches();
    existingMatches.push(newMatch);
    matchStore.saveMatches();

    this.logAudit({
      adminName: 'Administrator',
      action: 'FIXTURE_SCHEDULED',
      category: 'FIXTURE',
      details: `Scheduled match #${matchId}: ${newMatch.homeTeam.name} vs ${newMatch.awayTeam.name} on ${fixtureData.date} at ${fixtureData.time} (${fixtureData.venue}).`
    });

    this.saveState();

    // Persist to Supabase
    supabase.from('fixtures').insert({
      id: newMatch.id,
      competition_id: newMatch.competition.id,
      season_id: seasonId,
      round: newMatch.round || 'Regular Fixture',
      date: newMatch.date,
      time: newMatch.time,
      venue: newMatch.venue,
      home_team_id: newMatch.homeTeam.id,
      away_team_id: newMatch.awayTeam.id,
      status: 'SCHEDULED'
    }).then(() => {
      return supabase.from('match_readiness').insert({
        fixture_id: newMatch.id,
        venue_confirmed: true,
        officials_appointed: newMatch.officials.length > 0,
        match_ball_approved: true
      });
    }).then(() => {
      if (newMatch.officials.length > 0) {
        return supabase.from('fixture_officials').insert({
          fixture_id: newMatch.id,
          official_id: newMatch.officials[0].id,
          role: 'Center Referee'
        });
      }
    }).then(undefined, console.error);

    return newMatch;
  }

  public rescheduleFixture(matchId: string, newDate: string, newTime: string, newVenue: string, reason: string) {
    const match = matchStore.getMatchById(matchId);
    if (!match) return;

    const oldDetails = `${match.date} ${match.time} at ${match.venue}`;
    match.date = newDate;
    match.time = newTime;
    match.venue = newVenue;

    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push({
      id: `aud-${Date.now()}`,
      action: 'FIXTURE_RESCHEDULED',
      timestamp: new Date().toISOString(),
      officialId: 'admin-root',
      officialName: 'NSFC League Administrator',
      summary: `Rescheduled from [${oldDetails}] to [${newDate} ${newTime} at ${newVenue}]. Reason: ${reason}`
    });

    matchStore.saveMatches();

    this.logAudit({
      adminName: 'Administrator',
      action: 'FIXTURE_RESCHEDULED',
      category: 'FIXTURE',
      details: `Rescheduled match ${match.homeTeam.name} vs ${match.awayTeam.name} to ${newDate} ${newTime}. Reason: ${reason}.`,
      severity: 'WARNING'
    });

    this.saveState();

    // Persist to Supabase
    supabase.from('fixtures').update({
      date: newDate,
      time: newTime,
      venue: newVenue
    }).eq('id', matchId).then(undefined, console.error);
  }

  public updateMatchReadiness(matchId: string, checklist: Partial<MatchReadinessChecklist>) {
    const current = this.matchReadiness[matchId] || {
      venueConfirmed: false,
      officialsAppointed: false,
      homeLineupSubmitted: false,
      awayLineupSubmitted: false,
      medicalStaffOnSite: false,
      matchBallApproved: false
    };
    this.matchReadiness[matchId] = { ...current, ...checklist };

    const match = matchStore.getMatchById(matchId);
    if (match) {
      const isAllReady = Object.values(this.matchReadiness[matchId]).every(Boolean);
      match.preMatchReadinessConfirmed = isAllReady;
      if (isAllReady && match.status === 'SCHEDULED') {
        match.status = 'READY';
      }
      matchStore.saveMatches();
    }
    this.saveState();

    // Persist to Supabase
    supabase.from('match_readiness').upsert({
      fixture_id: matchId,
      venue_confirmed: this.matchReadiness[matchId].venueConfirmed,
      officials_appointed: this.matchReadiness[matchId].officialsAppointed,
      home_lineup_submitted: this.matchReadiness[matchId].homeLineupSubmitted,
      away_lineup_submitted: this.matchReadiness[matchId].awayLineupSubmitted,
      medical_staff_on_site: this.matchReadiness[matchId].medicalStaffOnSite,
      match_ball_approved: this.matchReadiness[matchId].matchBallApproved,
      updated_at: new Date().toISOString()
    }).then(undefined, console.error);
  }

  public getMatchReadiness(matchId: string): MatchReadinessChecklist {
    return this.matchReadiness[matchId] || {
      venueConfirmed: false,
      officialsAppointed: false,
      homeLineupSubmitted: false,
      awayLineupSubmitted: false,
      medicalStaffOnSite: false,
      matchBallApproved: false
    };
  }

  // --- Automatic & Manual Fixture Management ---
  public generateSeasonFixtures(seasonId: string, options?: {
    doubleRoundRobin?: boolean;
    startDate?: string;
    daysBetweenRounds?: number;
    matchTimes?: string[];
  }): OfficialMatchData[] {
    const season = this.seasons.find(s => s.id === seasonId);
    if (!season) throw new Error('Season not found');
    const comp = this.competitions.find(c => c.id === season.competitionId);
    const seasonTeamIds = season.participatingTeamIds || [];
    if (seasonTeamIds.length < 2) {
      throw new Error('At least 2 approved clubs must be enrolled in the season to generate fixtures.');
    }

    const seasonTeams = seasonTeamIds
      .map(id => this.teams.find(t => t.id === id))
      .filter((t): t is AdminTeamRecord => !!t);

    const isDouble = options?.doubleRoundRobin ?? true;
    const startDateStr = options?.startDate || season.startDate || new Date().toISOString().split('T')[0];
    const daysBetween = options?.daysBetweenRounds || 7;
    const matchTimes = options?.matchTimes || ['13:00', '15:00', '16:30'];

    // Standard Round-Robin Berger algorithm
    const teamList = [...seasonTeams];
    const isOdd = teamList.length % 2 !== 0;
    if (isOdd) {
      teamList.push({ id: '__BYE__', name: 'BYE' } as any);
    }

    const n = teamList.length;
    const totalRoundsSingle = n - 1;
    const matchesPerRound = n / 2;
    const rounds: Array<Array<{ home: AdminTeamRecord; away: AdminTeamRecord }>> = [];

    for (let r = 0; r < totalRoundsSingle; r++) {
      const roundMatches: Array<{ home: AdminTeamRecord; away: AdminTeamRecord }> = [];
      for (let m = 0; m < matchesPerRound; m++) {
        const homeIdx = (r + m) % (n - 1);
        let awayIdx = (n - 1 - m + r) % (n - 1);
        if (m === 0) {
          awayIdx = n - 1;
        }

        const home = r % 2 === 0 ? teamList[homeIdx] : teamList[awayIdx];
        const away = r % 2 === 0 ? teamList[awayIdx] : teamList[homeIdx];

        if (home.id !== '__BYE__' && away.id !== '__BYE__') {
          roundMatches.push({ home, away });
        }
      }
      rounds.push(roundMatches);
    }

    if (isDouble) {
      for (let r = 0; r < totalRoundsSingle; r++) {
        const returnRoundMatches = rounds[r].map(m => ({
          home: m.away,
          away: m.home
        }));
        rounds.push(returnRoundMatches);
      }
    }

    const baseDate = new Date(startDateStr);
    const generatedMatches: OfficialMatchData[] = [];
    const existingMatches = matchStore.getAllMatches();
    const availableRefs = this.officials.filter(o => o.role === 'Center Referee' && o.status === 'AVAILABLE');

    let globalMatchIndex = 0;
    rounds.forEach((roundMatches, roundIdx) => {
      const roundNumber = roundIdx + 1;
      const roundDate = new Date(baseDate.getTime() + roundIdx * daysBetween * 86400000);
      const dateStr = roundDate.toISOString().split('T')[0];

      roundMatches.forEach((pair, matchInRoundIdx) => {
        globalMatchIndex++;
        const matchId = `gen-${season.id}-r${roundNumber}-${globalMatchIndex}`;
        const time = matchTimes[matchInRoundIdx % matchTimes.length];
        const venue = pair.home.stadium || 'Main Campus Stadium, Meru';
        const assignedRef = availableRefs.length > 0 ? availableRefs[matchInRoundIdx % availableRefs.length] : undefined;

        const newMatch: OfficialMatchData = {
          id: matchId,
          competition: {
            id: comp?.id || season.competitionId,
            name: comp?.name || 'KeMU Super League',
            season: season.name
          },
          round: `Round ${roundNumber}`,
          season: season.name,
          date: dateStr,
          time: time,
          venue: venue,
          status: 'SCHEDULED',
          minute: 'Pre-Match',
          homeTeam: {
            id: pair.home.id,
            name: pair.home.name,
            shortName: pair.home.shortName,
            logo: pair.home.logo,
            color: '#FF6A00'
          },
          awayTeam: {
            id: pair.away.id,
            name: pair.away.name,
            shortName: pair.away.shortName,
            logo: pair.away.logo,
            color: '#3B82F6'
          },
          homeScore: 0,
          awayScore: 0,
          preMatchReadinessConfirmed: false,
          homeTeamSheetApproved: false,
          awayTeamSheetApproved: false,
          events: [],
          officials: assignedRef ? [
            {
              id: assignedRef.id,
              name: assignedRef.name,
              role: 'Center Referee',
              badge: assignedRef.badge
            }
          ] : [],
          homeLineup: { formation: '4-3-3', starters: [], subs: [] },
          awayLineup: { formation: '4-3-3', starters: [], subs: [] },
          auditLog: [
            {
              id: `aud-${Date.now()}-${globalMatchIndex}`,
              action: 'MATCH_AUTO_GENERATED',
              timestamp: new Date().toISOString(),
              officialId: 'admin-root',
              officialName: 'NSFC Fixture Engine',
              summary: `Auto-generated ${isDouble ? 'Double' : 'Single'} Round-Robin fixture: ${pair.home.name} vs ${pair.away.name} (Round ${roundNumber}).`
            }
          ]
        };

        this.matchReadiness[matchId] = {
          venueConfirmed: true,
          officialsAppointed: !!assignedRef,
          homeLineupSubmitted: false,
          awayLineupSubmitted: false,
          medicalStaffOnSite: false,
          matchBallApproved: true
        };

        existingMatches.push(newMatch);
        generatedMatches.push(newMatch);
      });
    });

    season.roundsCount = rounds.length;
    season.matchCount = (season.matchCount || 0) + generatedMatches.length;

    matchStore.saveMatches();

    this.logAudit({
      adminName: 'Administrator',
      action: 'FIXTURES_AUTO_GENERATED',
      category: 'FIXTURE',
      details: `Generated ${generatedMatches.length} fixtures across ${rounds.length} rounds for season '${season.name}'. Algorithm: Round-Robin (${isDouble ? 'Double' : 'Single'}).`
    });

    this.saveState();

    // Persist to Supabase atomically
    const payload = generatedMatches.map(m => ({
      id: m.id,
      competition_id: m.competition.id,
      season_id: season.id,
      round: m.round,
      date: m.date,
      time: m.time,
      venue: m.venue,
      home_team_id: m.homeTeam.id,
      away_team_id: m.awayTeam.id,
      status: 'SCHEDULED'
    }));
    supabase.rpc('commit_generated_fixtures', {
      p_season_id: season.id,
      p_competition_id: comp?.id || season.competitionId,
      p_fixtures: payload
    }).then(undefined, (err: any) => console.warn('Supabase commit_generated_fixtures error:', err));

    return generatedMatches;
  }

  public deleteFixture(matchId: string) {
    const all = matchStore.getAllMatches();
    const idx = all.findIndex(m => m.id === matchId);
    if (idx !== -1) {
      const removed = all.splice(idx, 1)[0];
      delete this.matchReadiness[matchId];
      matchStore.saveMatches();
      this.logAudit({
        adminName: 'Administrator',
        action: 'FIXTURE_DELETED',
        category: 'FIXTURE',
        details: `Deleted fixture #${matchId} (${removed.homeTeam.name} vs ${removed.awayTeam.name}).`,
        severity: 'WARNING'
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('fixtures').delete().eq('id', matchId).then(undefined, console.error);
    }
  }

  public updateFixture(matchId: string, data: {
    date?: string;
    time?: string;
    venue?: string;
    round?: string;
    referee?: string;
    status?: OfficialMatchData['status'];
    homeScore?: number;
    awayScore?: number;
  }) {
    const match = matchStore.getMatchById(matchId);
    if (!match) return;

    if (data.date) match.date = data.date;
    if (data.time) match.time = data.time;
    if (data.venue) match.venue = data.venue;
    if (data.round) match.round = data.round;
    if (data.status) match.status = data.status;
    if (data.homeScore !== undefined) match.homeScore = data.homeScore;
    if (data.awayScore !== undefined) match.awayScore = data.awayScore;

    if (data.referee !== undefined) {
      if (data.referee) {
        const off = this.officials.find(o => o.name === data.referee || o.id === data.referee);
        match.officials = [
          {
            id: off?.id || `off-${Date.now()}`,
            name: off?.name || data.referee,
            role: 'Center Referee',
            badge: off?.badge || 'NSFC Approved Referee'
          }
        ];
        if (this.matchReadiness[matchId]) {
          this.matchReadiness[matchId].officialsAppointed = true;
        }
      } else {
        match.officials = [];
        if (this.matchReadiness[matchId]) {
          this.matchReadiness[matchId].officialsAppointed = false;
        }
      }
    }

    matchStore.saveMatches();
    this.logAudit({
      adminName: 'Administrator',
      action: 'FIXTURE_UPDATED',
      category: 'FIXTURE',
      details: `Updated fixture #${matchId}: ${match.homeTeam.name} vs ${match.awayTeam.name}. Date: ${match.date} ${match.time}, Venue: ${match.venue}.`
    });
    this.saveState();

    // Persist to Supabase
    const updates: any = {};
    if (data.date) updates.date = data.date;
    if (data.time) updates.time = data.time;
    if (data.venue) updates.venue = data.venue;
    if (data.round) updates.round = data.round;
    if (data.status) updates.status = data.status;
    if (data.homeScore !== undefined) updates.home_score = data.homeScore;
    if (data.awayScore !== undefined) updates.away_score = data.awayScore;
    supabase.from('fixtures').update(updates).eq('id', matchId).then(undefined, console.error);
  }

  // --- Match Officials Credibility & Conflict Engine ---
  public getOfficials(): OfficialRecord[] {
    return [...this.officials];
  }

  public checkOfficialConflict(officialIdOrName: string, matchDateOrTargetMatchId?: string, matchTime?: string): {
    hasConflict: boolean;
    conflictReason?: string;
    reason?: string;
    conflictingMatch?: OfficialMatchData;
  } {
    const official = this.officials.find(o => o.id === officialIdOrName || o.name === officialIdOrName);
    const actualOfficialId = official?.id || officialIdOrName;
    const allMatches = matchStore.getAllMatches();

    const liveMatches = allMatches.filter(m =>
      ['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF', 'READY'].includes(m.status) &&
      m.officials.some(o => o.id === actualOfficialId || o.name === official?.name)
    );

    const activeLive = liveMatches.find(m => m.id !== matchDateOrTargetMatchId);
    if (activeLive) {
      const reasonMsg = `Official is currently active pitchside on Live Match #${activeLive.id} (${activeLive.homeTeam.shortName} vs ${activeLive.awayTeam.shortName}). Strict single-match rule prohibits simultaneous assignment.`;
      return {
        hasConflict: true,
        conflictReason: reasonMsg,
        reason: reasonMsg,
        conflictingMatch: activeLive
      };
    }

    if (matchTime && matchDateOrTargetMatchId) {
      const timeConflict = allMatches.find(m =>
        m.date === matchDateOrTargetMatchId &&
        m.time === matchTime &&
        m.officials.some(o => o.id === actualOfficialId || o.name === official?.name)
      );
      if (timeConflict) {
        const reasonMsg = `Official is already scheduled for Match #${timeConflict.id} (${timeConflict.homeTeam.shortName} vs ${timeConflict.awayTeam.shortName}) at the exact same time (${matchDateOrTargetMatchId} ${matchTime}).`;
        return {
          hasConflict: true,
          conflictReason: reasonMsg,
          reason: reasonMsg,
          conflictingMatch: timeConflict
        };
      }
    } else if (matchDateOrTargetMatchId) {
      const target = matchStore.getMatchById(matchDateOrTargetMatchId);
      if (target) {
        const timeConflict = allMatches.find(m =>
          m.id !== matchDateOrTargetMatchId &&
          m.date === target.date &&
          m.time === target.time &&
          m.officials.some(o => o.id === actualOfficialId || o.name === official?.name)
        );
        if (timeConflict) {
          const reasonMsg = `Official is already scheduled for Match #${timeConflict.id} (${timeConflict.homeTeam.shortName} vs ${timeConflict.awayTeam.shortName}) at the exact same time (${target.date} ${target.time}).`;
          return {
            hasConflict: true,
            conflictReason: reasonMsg,
            reason: reasonMsg,
            conflictingMatch: timeConflict
          };
        }
      }
    }

    return { hasConflict: false };
  }

  public appointOfficial(matchId: string, officialId: string, role: OfficialRecord['role']) {
    const conflict = this.checkOfficialConflict(officialId, matchId);
    if (conflict.hasConflict) {
      throw new Error(conflict.conflictReason);
    }

    const official = this.officials.find(o => o.id === officialId);
    const match = matchStore.getMatchById(matchId);
    if (!official || !match) throw new Error('Official or match not found');

    match.officials = match.officials.filter(o => o.role !== role && o.id !== officialId);
    match.officials.push({
      id: official.id,
      name: official.name,
      role: role,
      badge: official.badge
    });

    official.status = 'ASSIGNED';
    official.currentMatchId = matchId;

    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push({
      id: `aud-${Date.now()}`,
      action: 'OFFICIAL_APPOINTED',
      timestamp: new Date().toISOString(),
      officialId: 'admin-root',
      officialName: 'NSFC League Administrator',
      summary: `Appointed ${official.name} as ${role} for Match #${match.id}`
    });

    matchStore.saveMatches();

    this.logAudit({
      adminName: 'Administrator',
      action: 'OFFICIAL_APPOINTED',
      category: 'OFFICIAL',
      details: `Appointed ${official.name} (${official.badge}) as ${role} for ${match.homeTeam.name} vs ${match.awayTeam.name}. Single-match credibility rule validated.`
    });

    this.saveState();

    // Persist to Supabase
    supabase.from('fixture_officials').insert({
      fixture_id: matchId,
      official_id: officialId,
      role: role
    }).then(() => {
      return supabase.from('officials').update({
        status: 'ASSIGNED',
        current_match_id: matchId
      }).eq('id', officialId);
    }).then(() => {
      return supabase.from('match_readiness').upsert({
        fixture_id: matchId,
        officials_appointed: true
      });
    }).then(undefined, console.error);
  }

  public removeOfficialAppointment(matchId: string, officialId: string) {
    const match = matchStore.getMatchById(matchId);
    const official = this.officials.find(o => o.id === officialId);
    if (!match || !official) return;

    match.officials = match.officials.filter(o => o.id !== officialId);
    official.status = 'AVAILABLE';
    official.currentMatchId = undefined;

    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push({
      id: `aud-${Date.now()}`,
      action: 'OFFICIAL_REMOVED',
      timestamp: new Date().toISOString(),
      officialId: 'admin-root',
      officialName: 'NSFC League Administrator',
      summary: `Removed ${official.name} from match officiating roster`
    });

    matchStore.saveMatches();

    this.logAudit({
      adminName: 'Administrator',
      action: 'OFFICIAL_REMOVED',
      category: 'OFFICIAL',
      details: `Revoked appointment of ${official.name} from match #${match.id}.`
    });

    this.saveState();

    // Persist to Supabase
    supabase.from('fixture_officials').delete().eq('fixture_id', matchId).eq('official_id', officialId)
    .then(() => {
      return supabase.from('officials').update({
        status: 'AVAILABLE',
        current_match_id: null
      }).eq('id', officialId);
    }).then(undefined, console.error);
  }

  // --- NSFC Officials Directory Management ---
  public addOfficial(data: {
    name: string;
    role: OfficialRecord['role'];
    badge: string;
    email: string;
    phone: string;
    status?: OfficialRecord['status'];
  }): OfficialRecord {
    const newOfficial: OfficialRecord = {
      id: `off-${Date.now()}`,
      name: data.name,
      role: data.role,
      badge: data.badge || 'NSFC Approved Referee',
      email: data.email,
      phone: data.phone,
      status: data.status || 'AVAILABLE',
      matchesOfficiated: 0,
      rating: 5.0
    };
    this.officials.push(newOfficial);
    this.logAudit({
      adminName: 'Administrator',
      action: 'OFFICIAL_ADDED',
      category: 'OFFICIAL',
      details: `Registered NSFC official ${newOfficial.name} (${newOfficial.role}, ${newOfficial.badge}).`
    });
    this.saveState();

    // Persist to Supabase
    supabase.from('officials').insert({
      id: newOfficial.id,
      name: newOfficial.name,
      role: newOfficial.role,
      roles: [newOfficial.role],
      badge: newOfficial.badge,
      email: newOfficial.email,
      phone: newOfficial.phone,
      status: newOfficial.status,
      matches_officiated: 0,
      rating: 5.0
    }).then(undefined, console.error);

    return newOfficial;
  }

  public updateOfficial(id: string, data: Partial<OfficialRecord>) {
    const off = this.officials.find(o => o.id === id);
    if (off) {
      Object.assign(off, data);
      this.logAudit({
        adminName: 'Administrator',
        action: 'OFFICIAL_UPDATED',
        category: 'OFFICIAL',
        details: `Updated NSFC credentials/details for official ${off.name}.`
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('officials').update({
        name: off.name,
        role: off.role,
        badge: off.badge,
        email: off.email,
        phone: off.phone,
        status: off.status
      }).eq('id', id).then(undefined, console.error);
    }
  }

  public deleteOfficial(id: string) {
    const idx = this.officials.findIndex(o => o.id === id);
    if (idx !== -1) {
      const removed = this.officials.splice(idx, 1)[0];
      this.logAudit({
        adminName: 'Administrator',
        action: 'OFFICIAL_REMOVED',
        category: 'OFFICIAL',
        details: `Removed official ${removed.name} from NSFC directory.`,
        severity: 'WARNING'
      });
      this.saveState();

      // Persist to Supabase
      supabase.from('officials').delete().eq('id', id).then(undefined, console.error);
    }
  }

  // --- Match Result Review, Certification & Audited Corrections ---
  public certifyResult(matchId: string, adminNotes: string) {
    const match = matchStore.getMatchById(matchId);
    if (!match) return;

    match.status = 'VERIFIED_PUBLISHED';
    match.minute = 'FT';

    if (match.report) {
      match.report.isPublished = true;
    }

    match.officials.forEach(o => {
      const rec = this.officials.find(off => off.id === o.id);
      if (rec) {
        rec.status = 'AVAILABLE';
        rec.currentMatchId = undefined;
        rec.matchesOfficiated++;
      }
    });

    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push({
      id: `aud-${Date.now()}`,
      action: 'RESULT_CERTIFIED_BY_ADMIN',
      timestamp: new Date().toISOString(),
      officialId: 'admin-root',
      officialName: 'NSFC League Administrator',
      summary: `Official result certified and published: ${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name}. Admin note: ${adminNotes}`
    });

    matchStore.saveMatches();

    this.logAudit({
      adminName: 'Administrator',
      action: 'RESULT_CERTIFIED',
      category: 'RESULT',
      details: `Officially certified and closed Match #${matchId}: ${match.homeTeam.name} (${match.homeScore}) vs ${match.awayTeam.name} (${match.awayScore}). Standings locked.`
    });

    this.saveState();

    // Persist to Supabase
    supabase.from('fixtures').update({
      status: 'VERIFIED_PUBLISHED',
      minute: 'FT'
    }).eq('id', matchId)
    .then(() => {
      return supabase.from('match_reports').upsert({
        fixture_id: matchId,
        confirmed_home_score: match.homeScore,
        confirmed_away_score: match.awayScore,
        is_published: true,
        referee_notes: adminNotes || 'Result verified and published by NSFC Administrator.'
      });
    }).then(undefined, console.error);
  }

  public auditCorrectScore(matchId: string, homeScore: number, awayScore: number, auditReason: string) {
    const match = matchStore.getMatchById(matchId);
    if (!match) return;

    const previousScore = `${match.homeScore} - ${match.awayScore}`;
    match.homeScore = homeScore;
    match.awayScore = awayScore;

    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push({
      id: `aud-${Date.now()}`,
      action: 'SCORE_CORRECTED_BY_ADMIN',
      timestamp: new Date().toISOString(),
      officialId: 'admin-root',
      officialName: 'NSFC League Administrator',
      summary: `Score adjusted from [${previousScore}] to [${homeScore} - ${awayScore}]. Mandatory Audit Reason: ${auditReason}`
    });

    matchStore.saveMatches();

    this.logAudit({
      adminName: 'Administrator',
      action: 'SCORE_CORRECTED_AUDIT',
      category: 'RESULT',
      details: `Audited score correction for Match #${matchId} from ${previousScore} to ${homeScore}-${awayScore}. Reason: ${auditReason}.`,
      severity: 'CRITICAL'
    });

    this.saveState();

    // Persist to Supabase
    supabase.from('fixtures').update({
      home_score: homeScore,
      away_score: awayScore
    }).eq('id', matchId).then(undefined, console.error);
  }

  // --- Dynamic Standings & Statistical Integrity Engine ---
  public calculateStandings(seasonId?: string): SeasonStandingRow[] {
    const targetSeasonId = seasonId || this.selectedSeasonId;
    const seasonTeams = this.getTeams(targetSeasonId);
    const verifiedMatches = matchStore.getAllMatches().filter(m => 
      m.status === 'VERIFIED_PUBLISHED' &&
      ((m as any).seasonId === targetSeasonId || m.competition?.season?.includes('Season 8') || !seasonId)
    );

    const pointDeductionMap: Record<string, number> = {};
    this.sanctions.filter(s => s.status === 'ACTIVE' && s.sanctionType === 'POINTS_DEDUCTION').forEach(s => {
      if (s.teamId && s.pointsDeducted) {
        pointDeductionMap[s.teamId] = (pointDeductionMap[s.teamId] || 0) + s.pointsDeducted;
      }
    });

    const rows: Record<string, SeasonStandingRow> = {};

    seasonTeams.forEach(t => {
      rows[t.id] = {
        position: 0,
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        logo: t.logo,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: -(pointDeductionMap[t.id] || 0),
        pointsDeduction: pointDeductionMap[t.id] || 0,
        form: []
      };
    });

    verifiedMatches.forEach(m => {
      const home = rows[m.homeTeam.id];
      const away = rows[m.awayTeam.id];

      if (home && away) {
        home.played++;
        away.played++;
        home.goalsFor += m.homeScore;
        home.goalsAgainst += m.awayScore;
        away.goalsFor += m.awayScore;
        away.goalsAgainst += m.homeScore;

        if (m.homeScore > m.awayScore) {
          home.won++;
          home.points += 3;
          home.form.unshift('W');
          away.lost++;
          away.form.unshift('L');
        } else if (m.homeScore < m.awayScore) {
          away.won++;
          away.points += 3;
          away.form.unshift('W');
          home.lost++;
          home.form.unshift('L');
        } else {
          home.drawn++;
          home.points += 1;
          home.form.unshift('D');
          away.drawn++;
          away.points += 1;
          away.form.unshift('D');
        }
      }
    });

    const sorted = Object.values(rows)
      .map(r => ({
        ...r,
        goalDifference: r.goalsFor - r.goalsAgainst,
        form: r.form.slice(0, 5)
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    sorted.forEach((r, idx) => {
      r.position = idx + 1;
    });

    return sorted;
  }

  public getTopScorers(): TopScorerRow[] {
    const list: TopScorerRow[] = [
      { rank: 1, playerId: 'p1', playerName: 'Brian Otieno', teamId: 't2', teamName: 'Meru Warriors', teamLogo: '🛡️', goals: 7, assists: 4, appearances: 6 },
      { rank: 2, playerId: 'p4', playerName: 'Michael Olunga Jr.', teamId: 't6', teamName: 'Thika United', teamLogo: '⚡', goals: 5, assists: 2, appearances: 6 },
      { rank: 3, playerId: 'p6', playerName: 'Elvis Rupia', teamId: 't5', teamName: 'Embu Kings', teamLogo: '👑', goals: 4, assists: 1, appearances: 4 },
      { rank: 4, playerId: 'p107', playerName: 'Eric Kiprop', teamId: 't1', teamName: 'KeMU FC', teamLogo: '🦁', goals: 3, assists: 2, appearances: 5 },
      { rank: 5, playerId: 'p204', playerName: 'David Mwangi', teamId: 't7', teamName: 'Nanyuki FC', teamLogo: '🏔️', goals: 3, assists: 0, appearances: 5 }
    ];
    return list;
  }

  // --- Disciplinary Sanctions Board ---
  public getSanctions(): DisciplinarySanction[] {
    return [...this.sanctions];
  }

  public issueSanction(data: Omit<DisciplinarySanction, 'id' | 'issuedAt' | 'status'>): DisciplinarySanction {
    const newSanction: DisciplinarySanction = {
      ...data,
      id: `sanc-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    this.sanctions.unshift(newSanction);

    if (newSanction.sanctionType === 'POINTS_DEDUCTION') {
      this.logAudit({
        adminName: 'Administrator',
        action: 'STANDINGS_POINT_ADJUSTMENT',
        category: 'COMPETITION',
        details: `Applied ${newSanction.pointsDeducted} point deduction to ${newSanction.targetName}. Reason: ${newSanction.violation}`,
        severity: 'WARNING'
      });
    } else {
      this.logAudit({
        adminName: 'Administrator',
        action: 'SANCTION_ISSUED',
        category: 'DISCIPLINE',
        details: `Issued ${newSanction.sanctionType} against ${newSanction.targetType} '${newSanction.targetName}' (${newSanction.teamName || 'Affiliated'}). Violation: ${newSanction.violation}.`,
        severity: 'WARNING'
      });
    }

    this.saveState();
    return newSanction;
  }

  public updateSanctionStatus(sanctionId: string, status: DisciplinarySanction['status'], notes?: string) {
    const sanc = this.sanctions.find(s => s.id === sanctionId);
    if (sanc) {
      sanc.status = status;
      this.logAudit({
        adminName: 'Administrator',
        action: 'SANCTION_STATUS_CHANGED',
        category: 'DISCIPLINE',
        details: `Sanction #${sanctionId} (${sanc.targetName}) updated to ${status}. Notes: ${notes || 'Updated by disciplinary committee'}.`
      });
      this.saveState();
    }
  }

  // --- Announcements & Publishing API ---
  public getAnnouncements(): AdminAnnouncement[] {
    return [...this.announcements];
  }

  public publishAnnouncement(data: Omit<AdminAnnouncement, 'id' | 'publishedAt'>): AdminAnnouncement {
    const newAnn: AdminAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      publishedAt: new Date().toISOString()
    };
    this.announcements.unshift(newAnn);

    this.logAudit({
      adminName: 'Administrator',
      action: 'ANNOUNCEMENT_PUBLISHED',
      category: 'COMPETITION',
      details: `Official bulletin published: '${newAnn.title}' [Audience: ${newAnn.targetAudience}, Priority: ${newAnn.priority}].`
    });

    this.saveState();
    return newAnn;
  }

  public toggleAnnouncementPin(id: string, isPinned: boolean) {
    const ann = this.announcements.find(a => a.id === id);
    if (ann) {
      ann.isPinned = isPinned;
      ann.pinned = isPinned;
      this.saveState();
    }
  }

  public deleteAnnouncement(id: string) {
    this.announcements = this.announcements.filter(a => a.id !== id);
    this.logAudit({
      adminName: 'Administrator',
      action: 'ANNOUNCEMENT_WITHDRAWN',
      category: 'COMPETITION',
      details: `Withdrew broadcast bulletin #${id}.`
    });
    this.saveState();
  }

  // --- Governance & Authorized Users API ---
  public getAuthorizedUsers(): AuthorizedAdminUser[] {
    return [...this.authorizedUsers];
  }

  public updateAuthorizedUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const u = this.authorizedUsers.find(user => user.id === userId);
    if (u) {
      u.status = status;
      this.logAudit({
        adminName: 'Super Administrator',
        action: 'USER_ACCESS_MODIFIED',
        category: 'GOVERNANCE',
        details: `Updated administrative access for ${u.name} (${u.roleTitle}) to ${status}.`,
        severity: 'WARNING'
      });
      this.saveState();
    }
  }

  // --- Platform Operational Metrics & Pulse ---
  public getPlatformPulse() {
    const matches = matchStore.getAllMatches();
    const liveMatches = matches.filter(m => ['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF'].includes(m.status));
    const pendingReview = matches.filter(m => m.status === 'FULL_TIME_PENDING_REVIEW');
    const scheduled = matches.filter(m => ['SCHEDULED', 'READY'].includes(m.status));
    const completed = matches.filter(m => m.status === 'VERIFIED_PUBLISHED');

    const totalGoals = matches.reduce((acc, m) => acc + m.homeScore + m.awayScore, 0);

    const activeSanctions = this.sanctions.filter(s => s.status === 'ACTIVE').length;
    const availableOfficials = this.officials.filter(o => o.status === 'AVAILABLE').length;

    const pendingApprovalsCount = this.players.filter(p => p.eligibility === 'PENDING_REGISTRATION').length +
      this.teams.filter(t => t.status === 'PENDING_DOCUMENTATION').length;

    const unassignedUpcomingMatches = scheduled.filter(m => m.officials.length === 0).length;

    return {
      activeCompetitionsCount: this.competitions.filter(c => c.status === 'ACTIVE').length,
      totalSeasonsCount: this.seasons.length,
      activeSeasonsCount: this.seasons.filter(s => s.status === 'IN_PROGRESS').length,
      totalTeamsCount: this.teams.length,
      activeTeamsCount: this.teams.filter(t => t.status === 'ACTIVE').length,
      totalPlayersCount: this.players.length,
      eligiblePlayersCount: this.players.filter(p => p.eligibility === 'ELIGIBLE').length,
      totalOfficialsCount: this.officials.length,
      availableOfficialsCount: availableOfficials,
      liveMatchesCount: liveMatches.length,
      pendingReviewCount: pendingReview.length,
      scheduledMatchesCount: scheduled.length,
      completedMatchesCount: completed.length,
      totalGoalsScored: totalGoals,
      activeSanctionsCount: activeSanctions,
      pendingApprovalsCount,
      unassignedUpcomingMatches,
      auditLogsCount: this.auditLogs.length
    };
  }

  public getAuditLogs(): PlatformAuditEntry[] {
    return [...this.auditLogs];
  }
}

export const adminStore = new AdminStore();
