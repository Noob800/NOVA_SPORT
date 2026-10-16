import { supabase } from './supabaseClient';
import { adminStore } from './adminStore';

export type AvailabilityStatus = 'FIT' | 'INJURED' | 'DOUBTFUL' | 'SUSPENDED' | 'UNAVAILABLE';
export type EligibilityStatus = 'ELIGIBLE' | 'PENDING_REGISTRATION' | 'SUSPENDED' | 'INELIGIBLE';
export type InvitationStatus = 'ACTIVE' | 'INVITATION_SENT' | 'PENDING_REGISTRATION';

export interface SquadPlayer {
  id: string;
  name: string;
  teamId: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  number: number;
  avatar: string;
  age: number;
  joinedDate: string;
  nationalId?: string;
  phone?: string;
  email?: string;
  invitationStatus?: InvitationStatus;
  inviteCode?: string;
  invitedAt?: string;
  availability: AvailabilityStatus;
  eligibility: EligibilityStatus;
  statusNotes?: string;
  expectedReturn?: string;
  trainingAttendance: number; // percentage
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  linkedUserId?: string;
}

export type Formation = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '5-3-2';

export interface MatchPreparation {
  formation: Formation;
  startingEleven: string[]; // player IDs
  substitutes: string[]; // player IDs
  captainId?: string;
  tacticalNotes: string;
  setPieceTakers: {
    penalties?: string;
    freeKicks?: string;
    corners?: string;
  };
  submittedToLeague: boolean;
  submissionDate?: string;
}

export interface TacticalDraftPreset {
  id: string; // 'preset-1', 'preset-2', 'preset-3'
  teamId: string;
  slotNumber: 1 | 2 | 3;
  name: string;
  formation: Formation;
  startingEleven: string[]; // exactly 11 player IDs
  substitutes: string[]; // substitute player IDs
  captainId?: string;
  tacticalNotes: string;
  setPieceTakers: {
    penalties?: string;
    freeKicks?: string;
    corners?: string;
  };
  lastUpdated: string;
}

export interface TeamFixture {
  id: string;
  competitionId: string;
  competitionName: string;
  season: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo: string;
  date: string;
  time: string;
  venue: string;
  status: 'UPCOMING' | 'LIVE' | 'FT' | 'POSTPONED' | 'CANCELLED';
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  matchReportSubmitted?: boolean;
  matchReportNotes?: string;
  provisionalResult?: {
    homeScore: number;
    awayScore: number;
    submittedAt: string;
    status: 'PENDING_VERIFICATION' | 'CONFIRMED';
  };
  preparation?: MatchPreparation;
  events?: Array<{
    id: string;
    time: string;
    type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
    player: string;
    teamId: string;
  }>;
}

export type TrainingObjective = 
  | 'Tactical Shape & Pressing'
  | 'Conditioning & High Intensity'
  | 'Set Pieces & Penalty Drills'
  | 'Finishing & Phase of Play'
  | 'Recovery & Light Session';

export interface TrainingSession {
  id: string;
  teamId: string;
  date: string;
  time: string;
  durationMinutes: number;
  venue: string;
  objective: TrainingObjective;
  planNotes: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  attendance: Record<string, 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE'>; // playerId -> status
}

export type RequestCategory = 
  | 'PLAYER_REGISTRATION' 
  | 'TRANSFER' 
  | 'FIXTURE_RESCHEDULE' 
  | 'VENUE_CHANGE' 
  | 'RESULT_CORRECTION' 
  | 'DISCIPLINARY' 
  | 'GENERAL';

export type RequestStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'IN_REVIEW' 
  | 'MORE_INFO_REQUIRED' 
  | 'APPROVED' 
  | 'DECLINED' 
  | 'RESOLVED';

export interface TeamRequest {
  id: string; // e.g. REQ-2026-081
  teamId: string;
  category: RequestCategory;
  title: string;
  description: string;
  linkedEntity?: {
    type: 'player' | 'fixture' | 'competition';
    id: string;
    name: string;
  };
  status: RequestStatus;
  submissionTimestamp: string;
  assignedReviewer: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  responseHistory: Array<{
    id: string;
    author: string;
    role: string;
    timestamp: string;
    message: string;
  }>;
  auditTrail: Array<{
    timestamp: string;
    action: string;
    user: string;
  }>;
}

export interface TeamAnnouncement {
  id: string;
  teamId: string;
  title: string;
  category: 'MATCHDAY' | 'TRAINING' | 'ADMIN' | 'MEDICAL';
  audience: 'SQUAD_ONLY' | 'STAFF' | 'ALL';
  author: string;
  date: string;
  content: string;
  pinned: boolean;
  read: boolean;
}

export interface TeamStaffMember {
  id: string;
  name: string;
  role: 'Head Coach' | 'Assistant Coach' | 'Team Manager' | 'Physiotherapist' | 'Kit Manager';
  email: string;
  phone: string;
  license?: string;
  permissions: ('SQUAD_MANAGEMENT' | 'FIXTURES_MATCHDAY' | 'SUBMIT_REQUESTS' | 'ANNOUNCEMENTS')[];
  isCurrentUser?: boolean;
}

export interface TeamProfileDetails {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  foundedYear: number;
  homeVenue: string;
  primaryColor: string;
  secondaryColor: string;
  motto: string;
  competitionId: string;
  season: string;
}

// Initial seed players for Nova City FC (t2)
const INITIAL_NOVA_CITY_SQUAD: SquadPlayer[] = [
  {
    id: 'p2',
    name: 'David Kiptoo',
    teamId: 't2',
    position: 'FW',
    number: 9,
    avatar: '👤',
    age: 22,
    joinedDate: 'Aug 2024',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Top condition. Hat-trick in last match.',
    trainingAttendance: 96,
    appearances: 18,
    starts: 18,
    minutes: 1580,
    goals: 12,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 0,
    linkedUserId: 'u-kiptoo'
  },
  {
    id: 'p201',
    name: 'Samuel Mwaura',
    teamId: 't2',
    position: 'GK',
    number: 1,
    avatar: '🧤',
    age: 24,
    joinedDate: 'Jan 2024',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Starting goalkeeper.',
    trainingAttendance: 100,
    appearances: 18,
    starts: 18,
    minutes: 1620,
    goals: 0,
    assists: 1,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 8,
    linkedUserId: 'u-mwaura'
  },
  {
    id: 'p202',
    name: 'Collins Kipkorir',
    teamId: 't2',
    position: 'DF',
    number: 3,
    avatar: '🛡️',
    age: 23,
    joinedDate: 'Aug 2024',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Team vice-captain. Strong in aerial duels.',
    trainingAttendance: 94,
    appearances: 17,
    starts: 17,
    minutes: 1510,
    goals: 2,
    assists: 3,
    yellowCards: 3,
    redCards: 0,
    cleanSheets: 7
  },
  {
    id: 'p203',
    name: 'Victor Ombasa',
    teamId: 't2',
    position: 'DF',
    number: 4,
    avatar: '🛡️',
    age: 25,
    joinedDate: 'Aug 2023',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Central defender, commanding presence.',
    trainingAttendance: 92,
    appearances: 16,
    starts: 16,
    minutes: 1440,
    goals: 1,
    assists: 0,
    yellowCards: 2,
    redCards: 0,
    cleanSheets: 6
  },
  {
    id: 'p204',
    name: 'Hassan Aden',
    teamId: 't2',
    position: 'DF',
    number: 5,
    avatar: '🛡️',
    age: 21,
    joinedDate: 'Sep 2025',
    availability: 'INJURED',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Hamstring strain grade 1. Light running only.',
    expectedReturn: 'Oct 20, 2026',
    trainingAttendance: 80,
    appearances: 11,
    starts: 10,
    minutes: 890,
    goals: 0,
    assists: 1,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 4
  },
  {
    id: 'p205',
    name: 'Dennis Oduor',
    teamId: 't2',
    position: 'DF',
    number: 2,
    avatar: '🛡️',
    age: 22,
    joinedDate: 'Aug 2024',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Right back, excellent overlapping runs.',
    trainingAttendance: 95,
    appearances: 15,
    starts: 14,
    minutes: 1250,
    goals: 1,
    assists: 5,
    yellowCards: 2,
    redCards: 0,
    cleanSheets: 5
  },
  {
    id: 'p206',
    name: 'Emmanuel Juma',
    teamId: 't2',
    position: 'MF',
    number: 6,
    avatar: '⚡',
    age: 23,
    joinedDate: 'Jan 2025',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Defensive midfielder / pivot.',
    trainingAttendance: 98,
    appearances: 18,
    starts: 18,
    minutes: 1590,
    goals: 3,
    assists: 2,
    yellowCards: 4,
    redCards: 0,
    cleanSheets: 8
  },
  {
    id: 'p207',
    name: 'Kevin Mutua',
    teamId: 't2',
    position: 'MF',
    number: 8,
    avatar: '⚡',
    age: 22,
    joinedDate: 'Aug 2024',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Box-to-box engine. High work rate.',
    trainingAttendance: 95,
    appearances: 17,
    starts: 16,
    minutes: 1420,
    goals: 5,
    assists: 6,
    yellowCards: 2,
    redCards: 0,
    cleanSheets: 7
  },
  {
    id: 'p208',
    name: 'Brian Cheruiyot',
    teamId: 't2',
    position: 'MF',
    number: 10,
    avatar: '⚡',
    age: 21,
    joinedDate: 'Aug 2024',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Playmaker, primary free-kick taker.',
    trainingAttendance: 91,
    appearances: 18,
    starts: 17,
    minutes: 1490,
    goals: 6,
    assists: 9,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 8
  },
  {
    id: 'p209',
    name: 'Patrick Mwangi',
    teamId: 't2',
    position: 'FW',
    number: 11,
    avatar: '🎯',
    age: 20,
    joinedDate: 'Sep 2025',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Left winger, pace and crossing.',
    trainingAttendance: 96,
    appearances: 16,
    starts: 15,
    minutes: 1280,
    goals: 7,
    assists: 5,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 0
  },
  {
    id: 'p210',
    name: 'Joseph Kariuki',
    teamId: 't2',
    position: 'FW',
    number: 7,
    avatar: '🎯',
    age: 22,
    joinedDate: 'Aug 2024',
    availability: 'DOUBTFUL',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Ankle knock from training. Late fitness test.',
    trainingAttendance: 88,
    appearances: 14,
    starts: 12,
    minutes: 1040,
    goals: 4,
    assists: 3,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0
  },
  {
    id: 'p211',
    name: 'Moses Barasa',
    teamId: 't2',
    position: 'GK',
    number: 18,
    avatar: '🧤',
    age: 20,
    joinedDate: 'Jan 2025',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Backup goalkeeper.',
    trainingAttendance: 92,
    appearances: 2,
    starts: 0,
    minutes: 90,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 1
  },
  {
    id: 'p212',
    name: 'Francis Wekesa',
    teamId: 't2',
    position: 'DF',
    number: 14,
    avatar: '🛡️',
    age: 21,
    joinedDate: 'Sep 2025',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Cover for fullback and centre back.',
    trainingAttendance: 94,
    appearances: 8,
    starts: 4,
    minutes: 420,
    goals: 0,
    assists: 1,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 2
  },
  {
    id: 'p213',
    name: 'George Otieno',
    teamId: 't2',
    position: 'MF',
    number: 16,
    avatar: '⚡',
    age: 19,
    joinedDate: 'Jan 2026',
    availability: 'FIT',
    eligibility: 'ELIGIBLE',
    statusNotes: 'Promoted youth academy talent.',
    trainingAttendance: 98,
    appearances: 6,
    starts: 2,
    minutes: 270,
    goals: 1,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 1
  },
  {
    id: 'p214',
    name: 'Titus Ngugi',
    teamId: 't2',
    position: 'FW',
    number: 19,
    avatar: '🎯',
    age: 21,
    joinedDate: 'Aug 2025',
    availability: 'SUSPENDED',
    eligibility: 'SUSPENDED',
    statusNotes: 'Serving 1-match ban (accumulation of yellows).',
    trainingAttendance: 92,
    appearances: 12,
    starts: 6,
    minutes: 580,
    goals: 3,
    assists: 1,
    yellowCards: 5,
    redCards: 0,
    cleanSheets: 0
  },
  {
    id: 'p215',
    name: 'Caleb Wafula',
    teamId: 't2',
    position: 'MF',
    number: 21,
    avatar: '⚡',
    age: 20,
    joinedDate: 'Sep 2025',
    availability: 'FIT',
    eligibility: 'PENDING_REGISTRATION',
    statusNotes: 'Registration documents submitted to NSFC.',
    trainingAttendance: 90,
    appearances: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0
  }
];

const INITIAL_FIXTURES: TeamFixture[] = [
  {
    id: 'm-t2-next',
    competitionId: 'c1',
    competitionName: 'KeMU Super League',
    season: 'Season 8 - 2026/27',
    homeTeamId: 't3',
    homeTeamName: 'United Campus',
    homeTeamLogo: 'UC',
    awayTeamId: 't2',
    awayTeamName: 'Nova City FC',
    awayTeamLogo: 'NC',
    date: 'Wednesday, Oct 14',
    time: '15:30',
    venue: 'Campus Main Arena',
    status: 'UPCOMING',
    preparation: {
      formation: '4-3-3',
      startingEleven: ['p201', 'p205', 'p202', 'p203', 'p212', 'p206', 'p207', 'p208', 'p209', 'p2', 'p210'],
      substitutes: ['p211', 'p213', 'p214'],
      captainId: 'p202',
      tacticalNotes: 'High pressing against United Campus central midfield. Exploit width via Dennis and Patrick.',
      setPieceTakers: {
        penalties: 'p2',
        freeKicks: 'p208',
        corners: 'p208'
      },
      submittedToLeague: true,
      submissionDate: '2026-10-12T09:00:00Z'
    }
  },
  {
    id: 'm-t2-up2',
    competitionId: 'c1',
    competitionName: 'KeMU Super League',
    season: 'Season 8 - 2026/27',
    homeTeamId: 't2',
    homeTeamName: 'Nova City FC',
    homeTeamLogo: 'NC',
    awayTeamId: 't4',
    awayTeamName: 'Rangers FC',
    awayTeamLogo: '🦅',
    date: 'Sunday, Oct 18',
    time: '16:00',
    venue: 'Nova City Stadium',
    status: 'UPCOMING',
    preparation: {
      formation: '4-3-3',
      startingEleven: ['p201', 'p205', 'p202', 'p203', 'p212', 'p206', 'p207', 'p208', 'p209', 'p2', 'p210'],
      substitutes: ['p211', 'p213'],
      captainId: 'p202',
      tacticalNotes: 'Compact defensive block. Beware of long balls to wings.',
      setPieceTakers: {
        penalties: 'p2',
        freeKicks: 'p208',
        corners: 'p209'
      },
      submittedToLeague: false
    }
  },
  {
    id: 'm-t2-prev1',
    competitionId: 'c1',
    competitionName: 'KeMU Super League',
    season: 'Season 8 - 2026/27',
    homeTeamId: 't2',
    homeTeamName: 'Nova City FC',
    homeTeamLogo: 'NC',
    awayTeamId: 't6',
    awayTeamName: 'City FC',
    awayTeamLogo: '🏙️',
    date: 'Saturday, Oct 10',
    time: '16:00',
    venue: 'Nova City Stadium',
    status: 'FT',
    homeScore: 3,
    awayScore: 0,
    matchReportSubmitted: true,
    matchReportNotes: 'Outstanding team performance. Clean sheet preserved.',
    provisionalResult: {
      homeScore: 3,
      awayScore: 0,
      submittedAt: '2026-10-10T18:15:00Z',
      status: 'CONFIRMED'
    },
    events: [
      { id: 'ev1', time: "18'", type: 'goal', player: 'David Kiptoo', teamId: 't2' },
      { id: 'ev2', time: "54'", type: 'goal', player: 'Patrick Mwangi', teamId: 't2' },
      { id: 'ev3', time: "81'", type: 'goal', player: 'David Kiptoo', teamId: 't2' }
    ]
  },
  {
    id: 'm-t2-prev2',
    competitionId: 'c1',
    competitionName: 'KeMU Super League',
    season: 'Season 8 - 2026/27',
    homeTeamId: 't5',
    homeTeamName: 'Panthers FC',
    homeTeamLogo: '🐆',
    awayTeamId: 't2',
    awayTeamName: 'Nova City FC',
    awayTeamLogo: 'NC',
    date: 'Wednesday, Oct 7',
    time: '14:00',
    venue: 'Valley Park Ground',
    status: 'FT',
    homeScore: 1,
    awayScore: 2,
    matchReportSubmitted: true,
    provisionalResult: {
      homeScore: 1,
      awayScore: 2,
      submittedAt: '2026-10-07T16:10:00Z',
      status: 'CONFIRMED'
    }
  },
  {
    id: 'm-t2-prev3',
    competitionId: 'c1',
    competitionName: 'KeMU Super League',
    season: 'Season 8 - 2026/27',
    homeTeamId: 't2',
    homeTeamName: 'Nova City FC',
    homeTeamLogo: 'NC',
    awayTeamId: 't1',
    awayTeamName: 'KeMU FC',
    awayTeamLogo: '🦁',
    date: 'Saturday, Oct 3',
    time: '15:30',
    venue: 'Nova City Stadium',
    status: 'FT',
    homeScore: 1,
    awayScore: 2,
    matchReportSubmitted: true,
    provisionalResult: {
      homeScore: 1,
      awayScore: 2,
      submittedAt: '2026-10-03T17:40:00Z',
      status: 'CONFIRMED'
    }
  }
];

const INITIAL_TRAINING: TrainingSession[] = [
  {
    id: 'tr-01',
    teamId: 't2',
    date: '2026-10-12',
    time: '07:30',
    durationMinutes: 90,
    venue: 'Campus Complex Pitch B',
    objective: 'Tactical Shape & Pressing',
    planNotes: 'Focus on 4-3-3 mid-block transition and corner defense.',
    status: 'COMPLETED',
    attendance: {
      'p2': 'PRESENT',
      'p201': 'PRESENT',
      'p202': 'PRESENT',
      'p203': 'PRESENT',
      'p204': 'EXCUSED', // injured
      'p205': 'PRESENT',
      'p206': 'PRESENT',
      'p207': 'PRESENT',
      'p208': 'PRESENT',
      'p209': 'PRESENT',
      'p210': 'LATE',
      'p211': 'PRESENT',
      'p212': 'PRESENT',
      'p213': 'PRESENT',
      'p214': 'PRESENT',
      'p215': 'PRESENT'
    }
  },
  {
    id: 'tr-02',
    teamId: 't2',
    date: '2026-10-13',
    time: '16:00',
    durationMinutes: 75,
    venue: 'Campus Main Arena',
    objective: 'Set Pieces & Penalty Drills',
    planNotes: 'Pre-match walk-through against United Campus.',
    status: 'SCHEDULED',
    attendance: {}
  },
  {
    id: 'tr-03',
    teamId: 't2',
    date: '2026-10-16',
    time: '08:00',
    durationMinutes: 90,
    venue: 'Nova City Training Grounds',
    objective: 'Conditioning & High Intensity',
    planNotes: 'Sprint endurance & positional recovery tests.',
    status: 'SCHEDULED',
    attendance: {}
  }
];

const INITIAL_REQUESTS: TeamRequest[] = [
  {
    id: 'REQ-2026-081',
    teamId: 't2',
    category: 'PLAYER_REGISTRATION',
    title: 'Registration of Caleb Wafula (#21 Midfielder)',
    description: 'Submitted student clearance and medical certificate for mid-season inclusion.',
    linkedEntity: {
      type: 'player',
      id: 'p215',
      name: 'Caleb Wafula'
    },
    status: 'IN_REVIEW',
    submissionTimestamp: '2026-10-09T14:32:00Z',
    assignedReviewer: 'NSFC League Committee - J. Mwangi',
    priority: 'HIGH',
    responseHistory: [
      {
        id: 'resp-1',
        author: 'Coach Marcus',
        role: 'Head Coach',
        timestamp: '2026-10-09T14:32:00Z',
        message: 'All documents attached as requested by round 19 regulations.'
      },
      {
        id: 'resp-2',
        author: 'J. Mwangi',
        role: 'League Administrator',
        timestamp: '2026-10-10T11:15:00Z',
        message: 'Medical clearance verified. Awaiting student union sports department signoff. Expected turnaround: 24h.'
      }
    ],
    auditTrail: [
      { timestamp: '2026-10-09T14:32:00Z', action: 'Request Submitted', user: 'Coach Marcus' },
      { timestamp: '2026-10-10T11:15:00Z', action: 'Status changed to In Review', user: 'J. Mwangi' }
    ]
  },
  {
    id: 'REQ-2026-074',
    teamId: 't2',
    category: 'FIXTURE_RESCHEDULE',
    title: 'Matchday 21 vs Rangers FC - Kickoff Time Adjustment',
    description: 'Requesting 30-minute delay from 15:30 to 16:00 to accommodate campus examination schedules.',
    linkedEntity: {
      type: 'fixture',
      id: 'm-t2-up2',
      name: 'Nova City FC vs Rangers FC'
    },
    status: 'APPROVED',
    submissionTimestamp: '2026-10-05T10:15:00Z',
    assignedReviewer: 'NSFC Operations - K. Ochieng',
    priority: 'MEDIUM',
    responseHistory: [
      {
        id: 'resp-3',
        author: 'Coach Marcus',
        role: 'Head Coach',
        timestamp: '2026-10-05T10:15:00Z',
        message: 'Opponent manager has agreed informally via email.'
      },
      {
        id: 'resp-4',
        author: 'K. Ochieng',
        role: 'Fixture Secretary',
        timestamp: '2026-10-06T15:00:00Z',
        message: 'Approved. Official match sheet updated to 16:00 kickoff.'
      }
    ],
    auditTrail: [
      { timestamp: '2026-10-05T10:15:00Z', action: 'Request Submitted', user: 'Coach Marcus' },
      { timestamp: '2026-10-06T15:00:00Z', action: 'Approved by NSFC Operations', user: 'K. Ochieng' }
    ]
  }
];

const INITIAL_ANNOUNCEMENTS: TeamAnnouncement[] = [
  {
    id: 'ann-1',
    teamId: 't2',
    title: 'Matchday 20 Squad Travel & Kit Schedule',
    category: 'MATCHDAY',
    audience: 'SQUAD_ONLY',
    author: 'Coach Marcus',
    date: '2026-10-11',
    content: 'All selected players must assemble at Nova Sports Complex by 13:45 sharp. White away kit with orange socks. Hydration protocol starts today.',
    pinned: true,
    read: false
  },
  {
    id: 'ann-2',
    teamId: 't2',
    title: 'League Advisory: Yellow Card Accumulation Rule Update',
    category: 'ADMIN',
    audience: 'ALL',
    author: 'NSFC Disciplinary Board',
    date: '2026-10-08',
    content: 'Notice to all coaches: Players accumulating 5 yellow cards will serve an immediate 1-match suspension. Current suspended player: Titus Ngugi (#19).',
    pinned: false,
    read: true
  },
  {
    id: 'ann-3',
    teamId: 't2',
    title: 'Medical Recovery Sessions Every Thursday Morning',
    category: 'MEDICAL',
    audience: 'STAFF',
    author: 'Dr. Jane Kinyua (Physio)',
    date: '2026-10-04',
    content: 'All players with minor knocks must report for ultrasound and cryotherapy between 08:00 and 10:30.',
    pinned: false,
    read: true
  }
];

const INITIAL_STAFF: TeamStaffMember[] = [
  {
    id: 'st-1',
    name: 'Marcus Odhiambo',
    role: 'Head Coach',
    email: 'marcus.coach@novasport.org',
    phone: '+254 712 345 678',
    license: 'CAF "A" / UEFA Equivalent',
    permissions: ['SQUAD_MANAGEMENT', 'FIXTURES_MATCHDAY', 'SUBMIT_REQUESTS', 'ANNOUNCEMENTS'],
    isCurrentUser: true
  },
  {
    id: 'st-2',
    name: 'Stephen Mwita',
    role: 'Assistant Coach',
    email: 's.mwita@novasport.org',
    phone: '+254 722 987 654',
    license: 'CAF "B"',
    permissions: ['SQUAD_MANAGEMENT', 'FIXTURES_MATCHDAY']
  },
  {
    id: 'st-3',
    name: 'Dr. Jane Kinyua',
    role: 'Physiotherapist',
    email: 'j.kinyua@novasport.org',
    phone: '+254 733 456 789',
    permissions: ['SQUAD_MANAGEMENT']
  },
  {
    id: 'st-4',
    name: 'Robert Githinji',
    role: 'Team Manager',
    email: 'robert.tm@novasport.org',
    phone: '+254 711 223 344',
    permissions: ['SUBMIT_REQUESTS', 'ANNOUNCEMENTS', 'FIXTURES_MATCHDAY']
  }
];

const INITIAL_PROFILE: TeamProfileDetails = {
  id: 't2',
  name: 'Nova City FC',
  shortName: 'NC',
  logo: 'NC',
  foundedYear: 2018,
  homeVenue: 'Nova City Stadium',
  primaryColor: '#ff5e00',
  secondaryColor: '#101113',
  motto: 'Precision, Power, Glory',
  competitionId: 'c1',
  season: 'Season 8 - 2026/27'
};

const INITIAL_PRESETS: TacticalDraftPreset[] = [
  {
    id: 'preset-1',
    teamId: 't2',
    slotNumber: 1,
    name: 'Draft 1: Primary (4-3-3)',
    formation: '4-3-3',
    startingEleven: ['p201', 'p202', 'p203', 'p204', 'p205', 'p206', 'p207', 'p208', 'p2', 'p209', 'p210'],
    substitutes: ['p211', 'p212', 'p213', 'p214'],
    captainId: 'p206',
    tacticalNotes: 'High offensive press, fluid movement in attack, overlapping fullbacks.',
    setPieceTakers: {
      penalties: 'p2',
      freeKicks: 'p208',
      corners: 'p207'
    },
    lastUpdated: '2026-10-10'
  },
  {
    id: 'preset-2',
    teamId: 't2',
    slotNumber: 2,
    name: 'Draft 2: Balanced (4-4-2)',
    formation: '4-4-2',
    startingEleven: ['p201', 'p202', 'p203', 'p204', 'p205', 'p206', 'p207', 'p208', 'p211', 'p2', 'p209'],
    substitutes: ['p210', 'p212', 'p213', 'p214'],
    captainId: 'p206',
    tacticalNotes: 'Disciplined compact midfield lines, quick diagonal breaks to wide midfielders.',
    setPieceTakers: {
      penalties: 'p2',
      freeKicks: 'p208',
      corners: 'p206'
    },
    lastUpdated: '2026-10-08'
  },
  {
    id: 'preset-3',
    teamId: 't2',
    slotNumber: 3,
    name: 'Draft 3: Attacking (3-5-2)',
    formation: '3-5-2',
    startingEleven: ['p201', 'p203', 'p204', 'p205', 'p202', 'p206', 'p207', 'p208', 'p212', 'p2', 'p210'],
    substitutes: ['p209', 'p211', 'p213', 'p214'],
    captainId: 'p206',
    tacticalNotes: 'Dominating midfield possession, wing-backs providing crosses for twin strikers.',
    setPieceTakers: {
      penalties: 'p2',
      freeKicks: 'p208',
      corners: 'p207'
    },
    lastUpdated: '2026-10-05'
  }
];

const STORAGE_KEY = 'novasport_team_desk_store_v1';

class TeamDeskStore {
  private players: SquadPlayer[] = [];
  private fixtures: TeamFixture[] = [];
  private training: TrainingSession[] = [];
  private requests: TeamRequest[] = [];
  private announcements: TeamAnnouncement[] = [];
  private staff: TeamStaffMember[] = [];
  private presets: TacticalDraftPreset[] = [];
  private profile: TeamProfileDetails = INITIAL_PROFILE;
  private listeners: (() => void)[] = [];

  constructor() {
    this.load();
    this.fetchFromSupabase();
  }

  public async fetchFromSupabase() {
    try {
      const { data, error } = await supabase.from('players').select('*');
      if (!error && data && data.length > 0) {
        data.forEach(dbPlayer => {
          const idx = this.players.findIndex(p => p.id === dbPlayer.id);
          const mapped: SquadPlayer = {
            id: dbPlayer.id,
            name: dbPlayer.name,
            teamId: dbPlayer.team_id,
            position: dbPlayer.position as any,
            number: dbPlayer.number,
            avatar: dbPlayer.position === 'GK' ? '🧤' : dbPlayer.position === 'DF' ? '🛡️' : dbPlayer.position === 'MF' ? '⚡' : '⚽',
            age: dbPlayer.age || 20,
            joinedDate: dbPlayer.joined_date ? dbPlayer.joined_date.split('T')[0] : 'Oct 2026',
            nationalId: dbPlayer.national_id || undefined,
            availability: 'FIT',
            eligibility: dbPlayer.eligibility as any,
            statusNotes: dbPlayer.status_notes || undefined,
            appearances: dbPlayer.appearances || 0,
            starts: 0,
            minutes: 0,
            goals: dbPlayer.goals || 0,
            assists: dbPlayer.assists || 0,
            yellowCards: dbPlayer.yellow_cards || 0,
            redCards: dbPlayer.red_cards || 0,
            cleanSheets: dbPlayer.clean_sheets || 0,
            trainingAttendance: 100
          };
          if (idx !== -1) {
            this.players[idx] = { ...this.players[idx], ...mapped };
          } else {
            this.players.push(mapped);
          }
        });
        this.save();
      }
    } catch (err) {
      console.warn('[TeamDeskStore] Supabase fetch error:', err);
    }
  }

  private load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.players = parsed.players || INITIAL_NOVA_CITY_SQUAD;
        this.fixtures = parsed.fixtures || INITIAL_FIXTURES;
        this.training = parsed.training || INITIAL_TRAINING;
        this.requests = parsed.requests || INITIAL_REQUESTS;
        this.announcements = parsed.announcements || INITIAL_ANNOUNCEMENTS;
        this.staff = parsed.staff || INITIAL_STAFF;
        this.presets = parsed.presets || INITIAL_PRESETS;
        this.profile = parsed.profile || INITIAL_PROFILE;
        return;
      }
    } catch (e) {
      console.warn('Failed to load team desk from storage, fallback to defaults', e);
    }
    this.players = INITIAL_NOVA_CITY_SQUAD;
    this.fixtures = INITIAL_FIXTURES;
    this.training = INITIAL_TRAINING;
    this.requests = INITIAL_REQUESTS;
    this.announcements = INITIAL_ANNOUNCEMENTS;
    this.staff = INITIAL_STAFF;
    this.presets = INITIAL_PRESETS;
    this.profile = INITIAL_PROFILE;
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        players: this.players,
        fixtures: this.fixtures,
        training: this.training,
        requests: this.requests,
        announcements: this.announcements,
        staff: this.staff,
        presets: this.presets,
        profile: this.profile
      }));
    } catch (e) {
      console.error('Error saving team desk state', e);
    }
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // --- Getters ---
  getProfile(teamId: string = 't2'): TeamProfileDetails {
    if (teamId === 't1') {
      return {
        id: 't1',
        name: 'KeMU FC',
        shortName: 'KEM',
        logo: '🦁',
        foundedYear: 2014,
        homeVenue: 'KeMU Sports Ground',
        primaryColor: '#10b981',
        secondaryColor: '#101113',
        motto: 'Leadership through Sports',
        competitionId: 'c1',
        season: 'Season 8 - 2026/27'
      };
    }
    return this.profile;
  }

  getPlayers(teamId: string = 't2'): SquadPlayer[] {
    return this.players.filter(p => p.teamId === teamId);
  }

  getPlayer(playerId: string): SquadPlayer | undefined {
    return this.players.find(p => p.id === playerId);
  }

  getFixtures(teamId: string = 't2'): TeamFixture[] {
    return this.fixtures.filter(f => f.homeTeamId === teamId || f.awayTeamId === teamId);
  }

  getNextFixture(teamId: string = 't2'): TeamFixture | undefined {
    return this.fixtures.find(f => (f.homeTeamId === teamId || f.awayTeamId === teamId) && f.status === 'UPCOMING');
  }

  getRecentResults(teamId: string = 't2'): TeamFixture[] {
    return this.fixtures.filter(f => (f.homeTeamId === teamId || f.awayTeamId === teamId) && f.status === 'FT');
  }

  getTrainingSessions(teamId: string = 't2'): TrainingSession[] {
    return this.training.filter(t => t.teamId === teamId);
  }

  getRequests(teamId: string = 't2'): TeamRequest[] {
    return this.requests.filter(r => r.teamId === teamId);
  }

  getAnnouncements(teamId: string = 't2'): TeamAnnouncement[] {
    return this.announcements.filter(a => a.teamId === teamId);
  }

  getStaff(_teamId: string = 't2'): TeamStaffMember[] {
    return this.staff;
  }

  getTacticalPresets(teamId: string = 't2'): TacticalDraftPreset[] {
    const list = this.presets.filter(p => p.teamId === teamId);
    if (list.length === 0) {
      return INITIAL_PRESETS;
    }
    return list;
  }

  getTacticalPreset(presetId: string): TacticalDraftPreset | undefined {
    return this.presets.find(p => p.id === presetId);
  }

  saveTacticalPreset(updatedPreset: TacticalDraftPreset) {
    const idx = this.presets.findIndex(p => p.id === updatedPreset.id);
    if (idx !== -1) {
      this.presets[idx] = { ...updatedPreset, lastUpdated: new Date().toISOString() };
    } else {
      this.presets.push({ ...updatedPreset, lastUpdated: new Date().toISOString() });
    }
    this.save();
  }

  verifyPlayer(playerId: string) {
    const pIdx = this.players.findIndex(p => p.id === playerId);
    if (pIdx !== -1) {
      this.players[pIdx].eligibility = 'ELIGIBLE';
      // Find linked request and mark as approved
      const req = this.requests.find(r => r.linkedEntity?.id === playerId);
      if (req) {
        req.status = 'APPROVED';
        req.responseHistory.push({
          id: `resp-${Date.now()}`,
          author: 'League Management',
          role: 'Admin / Competition Manager',
          timestamp: new Date().toISOString(),
          message: 'Player eligibility verified and approved for official matches.'
        });
        req.auditTrail.push({
          timestamp: new Date().toISOString(),
          action: 'Player Registration Approved',
          user: 'League Secretariat'
        });
      }
      this.save();
    }
  }

  // --- Mutations ---
  addPlayer(player: Omit<SquadPlayer, 'id' | 'appearances' | 'starts' | 'minutes' | 'goals' | 'assists' | 'yellowCards' | 'redCards' | 'cleanSheets' | 'trainingAttendance'>): { success: boolean; error?: string; player?: SquadPlayer } {
    // Check duplicate number
    const existingNum = this.players.find(p => p.teamId === player.teamId && p.number === player.number);
    if (existingNum) {
      return { success: false, error: `Shirt number #${player.number} is already assigned to ${existingNum.name}.` };
    }

    const newPlayer: SquadPlayer = {
      ...player,
      id: `p-${Date.now()}`,
      availability: player.availability || 'FIT',
      eligibility: 'PENDING_REGISTRATION', // Starter league: all new registrations are reviewed & verified by management
      appearances: 0,
      starts: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      trainingAttendance: 100
    };

    this.players.unshift(newPlayer);

    // Auto-create a linked governance request so League Admin / Management can verify
    this.submitRequest({
      teamId: player.teamId,
      category: 'PLAYER_REGISTRATION',
      title: `Player Registration: ${newPlayer.name} (#${newPlayer.number})`,
      description: `New squad roster enrollment submitted for League Management verification. Position: ${newPlayer.position}.`,
      linkedEntity: {
        type: 'player',
        id: newPlayer.id,
        name: newPlayer.name
      },
      priority: 'MEDIUM'
    });

    this.save();

    // Persist to Supabase players & roster_memberships for authoritative admin approval workflow
    supabase.from('players').insert({
      id: newPlayer.id,
      name: newPlayer.name,
      team_id: newPlayer.teamId,
      position: newPlayer.position,
      number: newPlayer.number,
      age: newPlayer.age || 20,
      national_id: newPlayer.nationalId || null,
      eligibility: 'PENDING_REGISTRATION',
      status_notes: 'Coach submitted registration pending admin approval',
      appearances: 0,
      goals: 0,
      assists: 0,
      yellow_cards: 0,
      red_cards: 0,
      clean_sheets: 0
    }).then(({ error }) => {
      if (error) console.warn('[TeamDeskStore] Supabase player insert warning:', error);
      else adminStore.fetchFromSupabase();
    });

    supabase.from('roster_memberships').insert({
      id: `rm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      player_id: newPlayer.id,
      team_id: newPlayer.teamId,
      season_id: 'sea-ksl-s8',
      jersey_number: newPlayer.number,
      position: newPlayer.position,
      status: 'PENDING',
      invited_by_coach_name: 'Coach Marcus',
      invited_date: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('[TeamDeskStore] Supabase roster insert warning:', error);
      else adminStore.fetchFromSupabase();
    });

    return { success: true, player: newPlayer };
  }

  // Coach invites a player via email with shirt number and position
  // The player receives an official invitation to create their profile with logins.
  // Players cannot independently claim or jump into a team.
  invitePlayer(details: {
    teamId: string;
    name: string;
    email: string;
    number: number;
    position: 'GK' | 'DF' | 'MF' | 'FW';
    age?: number;
    phone?: string;
    notes?: string;
  }): { success: boolean; error?: string; player?: SquadPlayer; inviteCode?: string } {
    const existingNum = this.players.find(p => p.teamId === details.teamId && p.number === details.number);
    if (existingNum) {
      return { success: false, error: `Shirt number #${details.number} is already assigned to ${existingNum.name}.` };
    }

    const teamProfile = this.getProfile(details.teamId);
    const prefix = teamProfile.shortName || 'NOV';
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const inviteCode = `INV-${prefix}-${randomHex}`;

    const newPlayer: SquadPlayer = {
      id: `p-${Date.now()}`,
      teamId: details.teamId,
      name: details.name.trim(),
      email: details.email.trim().toLowerCase(),
      position: details.position,
      number: details.number,
      avatar: details.position === 'GK' ? '🧤' : details.position === 'DF' ? '🛡️' : details.position === 'MF' ? '⚡' : '🎯',
      age: details.age || 20,
      phone: details.phone,
      joinedDate: 'Oct 2026',
      availability: 'FIT',
      eligibility: 'PENDING_REGISTRATION',
      invitationStatus: 'INVITATION_SENT',
      inviteCode,
      invitedAt: new Date().toISOString(),
      statusNotes: details.notes || `Invited via email (${details.email}). Awaiting player login & profile creation.`,
      appearances: 0,
      starts: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      trainingAttendance: 100
    };

    this.players.unshift(newPlayer);

    // Auto-create linked governance request for League Management
    this.submitRequest({
      teamId: details.teamId,
      category: 'PLAYER_REGISTRATION',
      title: `Player Invitation: ${newPlayer.name} (#${newPlayer.number})`,
      description: `Official invitation sent to ${newPlayer.email}. Reserved shirt #${newPlayer.number} (${newPlayer.position}). Invite Code: ${inviteCode}.`,
      linkedEntity: {
        type: 'player',
        id: newPlayer.id,
        name: newPlayer.name
      },
      priority: 'MEDIUM'
    });

    this.save();

    // Persist invitation to Supabase players & roster_memberships
    supabase.from('players').insert({
      id: newPlayer.id,
      name: newPlayer.name,
      team_id: newPlayer.teamId,
      position: newPlayer.position,
      number: newPlayer.number,
      age: newPlayer.age || 20,
      eligibility: 'PENDING_REGISTRATION',
      status_notes: newPlayer.statusNotes || `Invited by Coach. Code: ${inviteCode}`,
      appearances: 0,
      goals: 0,
      assists: 0,
      yellow_cards: 0,
      red_cards: 0,
      clean_sheets: 0
    }).then(({ error }) => {
      if (error) console.warn('[TeamDeskStore] Supabase invite player insert warning:', error);
      else adminStore.fetchFromSupabase();
    });

    supabase.from('roster_memberships').insert({
      id: `rm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      player_id: newPlayer.id,
      team_id: newPlayer.teamId,
      season_id: 'sea-ksl-s8',
      jersey_number: newPlayer.number,
      position: newPlayer.position,
      status: 'PENDING',
      invited_by_coach_name: 'Coach Marcus',
      invited_date: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('[TeamDeskStore] Supabase invite roster insert warning:', error);
      else adminStore.fetchFromSupabase();
    });

    return { success: true, player: newPlayer, inviteCode };
  }

  // Verify and accept an invitation code when a player creates their profile/login
  acceptPlayerInvitation(inviteCode: string, userDetails: { name?: string; email?: string; userId?: string }): { success: boolean; error?: string; player?: SquadPlayer } {
    const cleanCode = inviteCode.trim().toUpperCase();
    const pIdx = this.players.findIndex(p => 
      p.inviteCode?.toUpperCase() === cleanCode || 
      (p.email && userDetails.email && p.email.toLowerCase() === userDetails.email.toLowerCase() && p.invitationStatus === 'INVITATION_SENT')
    );

    if (pIdx === -1) {
      return { success: false, error: 'Invalid or expired team invitation code. Players must be officially invited by a team coach or league administrator.' };
    }

    this.players[pIdx].invitationStatus = 'ACTIVE';
    this.players[pIdx].eligibility = 'ELIGIBLE';
    this.players[pIdx].statusNotes = 'Profile created & roster spot claimed via verified invitation.';
    if (userDetails.userId) {
      this.players[pIdx].linkedUserId = userDetails.userId;
    }
    this.save();
    return { success: true, player: this.players[pIdx] };
  }

  getInvitationDetails(inviteCode: string): { player: SquadPlayer; team: TeamProfileDetails } | null {
    const cleanCode = inviteCode.trim().toUpperCase();
    const player = this.players.find(p => p.inviteCode?.toUpperCase() === cleanCode);
    if (!player) return null;
    const team = this.getProfile(player.teamId);
    return { player, team };
  }

  updatePlayer(playerId: string, updates: Partial<SquadPlayer>): { success: boolean; error?: string } {
    const idx = this.players.findIndex(p => p.id === playerId);
    if (idx === -1) return { success: false, error: 'Player not found' };

    // Check shirt number conflict if changing
    if (updates.number && updates.number !== this.players[idx].number) {
      const conflict = this.players.find(p => p.teamId === this.players[idx].teamId && p.number === updates.number && p.id !== playerId);
      if (conflict) {
        return { success: false, error: `Shirt number #${updates.number} is already worn by ${conflict.name}.` };
      }
    }

    this.players[idx] = { ...this.players[idx], ...updates };
    this.save();
    return { success: true };
  }

  updatePlayerAvailability(playerId: string, availability: AvailabilityStatus, notes?: string, expectedReturn?: string) {
    const idx = this.players.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      this.players[idx].availability = availability;
      if (notes !== undefined) this.players[idx].statusNotes = notes;
      if (expectedReturn !== undefined) this.players[idx].expectedReturn = expectedReturn;
      this.save();
    }
  }

  saveMatchPreparation(fixtureId: string, prep: MatchPreparation) {
    const idx = this.fixtures.findIndex(f => f.id === fixtureId);
    if (idx !== -1) {
      this.fixtures[idx].preparation = prep;
      this.save();
    }
  }

  submitMatchReport(fixtureId: string, notes: string, homeScore: number, awayScore: number) {
    const idx = this.fixtures.findIndex(f => f.id === fixtureId);
    if (idx !== -1) {
      this.fixtures[idx].matchReportSubmitted = true;
      this.fixtures[idx].matchReportNotes = notes;
      this.fixtures[idx].provisionalResult = {
        homeScore,
        awayScore,
        submittedAt: new Date().toISOString(),
        status: 'PENDING_VERIFICATION'
      };
      
      // Also log request
      this.submitRequest({
        teamId: this.fixtures[idx].homeTeamId,
        category: 'RESULT_CORRECTION',
        title: `Match Report Submission: ${this.fixtures[idx].homeTeamName} vs ${this.fixtures[idx].awayTeamName}`,
        description: `Score reported: ${homeScore} - ${awayScore}. Notes: ${notes}. Awaiting match official ratification.`,
        linkedEntity: {
          type: 'fixture',
          id: fixtureId,
          name: `${this.fixtures[idx].homeTeamName} vs ${this.fixtures[idx].awayTeamName}`
        },
        priority: 'MEDIUM'
      });

      this.save();
    }
  }

  scheduleTraining(session: Omit<TrainingSession, 'id' | 'attendance'>) {
    const newSession: TrainingSession = {
      ...session,
      id: `tr-${Date.now()}`,
      attendance: {}
    };
    this.training.unshift(newSession);
    this.save();
  }

  updateTrainingAttendance(sessionId: string, attendanceMap: Record<string, 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE'>) {
    const idx = this.training.findIndex(t => t.id === sessionId);
    if (idx !== -1) {
      this.training[idx].attendance = { ...this.training[idx].attendance, ...attendanceMap };
      this.training[idx].status = 'COMPLETED';

      // Recalculate attendance rates for players
      Object.keys(attendanceMap).forEach(pId => {
        const playerSessions = this.training.filter(t => t.attendance[pId]);
        if (playerSessions.length > 0) {
          const attended = playerSessions.filter(t => t.attendance[pId] === 'PRESENT' || t.attendance[pId] === 'LATE').length;
          const rate = Math.round((attended / playerSessions.length) * 100);
          const pIdx = this.players.findIndex(p => p.id === pId);
          if (pIdx !== -1) this.players[pIdx].trainingAttendance = rate;
        }
      });

      this.save();
    }
  }

  submitRequest(data: {
    teamId: string;
    category: RequestCategory;
    title: string;
    description: string;
    linkedEntity?: { type: 'player' | 'fixture' | 'competition'; id: string; name: string };
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }): TeamRequest {
    const newReq: TeamRequest = {
      id: `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      teamId: data.teamId,
      category: data.category,
      title: data.title,
      description: data.description,
      linkedEntity: data.linkedEntity,
      status: 'SUBMITTED',
      submissionTimestamp: new Date().toISOString(),
      assignedReviewer: 'NSFC League Committee',
      priority: data.priority || 'MEDIUM',
      responseHistory: [
        {
          id: `resp-${Date.now()}`,
          author: 'Coach Marcus',
          role: 'Head Coach',
          timestamp: new Date().toISOString(),
          message: data.description
        }
      ],
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'Request Submitted to League Secretariat',
          user: 'Coach Marcus'
        }
      ]
    };

    this.requests.unshift(newReq);
    this.save();
    return newReq;
  }

  addRequestMessage(requestId: string, message: string, author: string = 'Coach Marcus', role: string = 'Head Coach') {
    const req = this.requests.find(r => r.id === requestId);
    if (req) {
      req.responseHistory.push({
        id: `resp-${Date.now()}`,
        author,
        role,
        timestamp: new Date().toISOString(),
        message
      });
      req.auditTrail.push({
        timestamp: new Date().toISOString(),
        action: `Comment added by ${author}`,
        user: author
      });
      this.save();
    }
  }

  publishAnnouncement(data: Omit<TeamAnnouncement, 'id' | 'read'>) {
    const newAnn: TeamAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      read: true
    };
    this.announcements.unshift(newAnn);
    this.save();
  }

  markAnnouncementRead(id: string) {
    const ann = this.announcements.find(a => a.id === id);
    if (ann) {
      ann.read = true;
      this.save();
    }
  }

  updateProfile(updates: Partial<TeamProfileDetails>) {
    this.profile = { ...this.profile, ...updates };
    this.save();
  }

  addStaff(staffMember: Omit<TeamStaffMember, 'id'>) {
    const newStaff: TeamStaffMember = {
      ...staffMember,
      id: `st-${Date.now()}`
    };
    this.staff.push(newStaff);
    this.save();
  }

  updateStaff(id: string, updates: Partial<TeamStaffMember>) {
    const idx = this.staff.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.staff[idx] = { ...this.staff[idx], ...updates };
      this.save();
    }
  }
}

export const teamDeskStore = new TeamDeskStore();
