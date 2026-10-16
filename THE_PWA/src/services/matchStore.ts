// NovaSport Authoritative Match & Live Matchday Store
// Powers real-time match operations, live score broadcasting, timeline events and official reports
// Strictly enforces FIFA / FKF credibility: 1 match per official at a time, auditable voiding within a time window

import { supabase } from './supabaseClient';

export type MatchPeriodStatus = 
  | 'SCHEDULED' 
  | 'READY' 
  | 'FIRST_HALF' 
  | 'HALF_TIME' 
  | 'SECOND_HALF' 
  | 'FULL_TIME_PENDING_REVIEW' 
  | 'VERIFIED_PUBLISHED' 
  | 'POSTPONED' 
  | 'ABANDONED';

export type Formation = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '5-3-2';

// 5-Minute Governance Correction Grace Window (300,000 ms)
export const EVENT_CORRECTION_WINDOW_MS = 5 * 60 * 1000;

export function isEventWithinCorrectionWindow(eventTimestamp: string): boolean {
  const eventTime = new Date(eventTimestamp).getTime();
  const now = Date.now();
  return now - eventTime <= EVENT_CORRECTION_WINDOW_MS;
}

export function getCorrectionWindowRemainingSeconds(eventTimestamp: string): number {
  const eventTime = new Date(eventTimestamp).getTime();
  const now = Date.now();
  const remainingMs = EVENT_CORRECTION_WINDOW_MS - (now - eventTime);
  return Math.max(0, Math.floor(remainingMs / 1000));
}

export interface TeamMatchLineup {
  formation: Formation;
  starters: string[]; // exactly 11 player IDs on pitch
  subs: string[];     // bench player IDs
  captainId?: string;
}

export interface MatchOfficial {
  id: string;
  name: string;
  role: 'Center Referee' | 'Assistant Referee 1' | 'Assistant Referee 2' | '4th Official / Commissioner' | 'Fourth Official' | 'Match Commissioner' | string;
  badge?: string;
}

export interface MatchAuditEntry {
  id: string;
  action: 'EVENT_RECORDED' | 'EVENT_VOIDED' | 'PERIOD_TRANSITION' | 'MINUTE_ADJUSTED' | 'REPORT_SUBMITTED' | 'MATCH_SCHEDULED' | 'FIXTURE_RESCHEDULED' | 'OFFICIAL_APPOINTED' | 'OFFICIAL_REMOVED' | 'RESULT_CERTIFIED_BY_ADMIN' | 'SCORE_CORRECTED_BY_ADMIN' | string;
  timestamp: string;
  officialId: string;
  officialName: string;
  summary: string;
  reason?: string;
  details?: string;
}

export interface MatchEventItem {
  id: string;
  time: string; // e.g. "23'", "45+2'"
  minuteNumber: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty_miss';
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamLogo: string;
  playerId: string;
  playerName: string;
  playerNumber: number;
  subPlayerId?: string;
  subPlayerName?: string;
  subPlayerNumber?: number;
  detail?: string; // e.g. "Penalty Kick", "Own Goal", "Tactical Foul", "Dissent"
  recordedByOfficialId: string;
  timestamp: string;
  
  // Audited Invalidation & Immutability properties
  isVoided?: boolean;
  voidedAt?: string;
  voidReason?: string;
  voidNotes?: string;
  voidedByOfficialId?: string;
}

export interface MatchReport {
  matchId: string;
  submittedAt: string;
  refereeNotes: string;
  incidentReport?: string;
  fairPlayRatingHome: number; // 1-5
  fairPlayRatingAway: number; // 1-5
  confirmedScore: { home: number; away: number };
  leadOfficialSignature: string;
  isPublished: boolean;
}

export interface OfficialMatchData {
  id: string;
  competition: { id: string; name: string; season?: string };
  round?: string;
  season?: string;
  homeTeam: { id: string; name: string; shortName: string; logo: string; color?: string };
  awayTeam: { id: string; name: string; shortName: string; logo: string; color?: string };
  homeScore: number;
  awayScore: number;
  status: MatchPeriodStatus;
  minute: string; // e.g. "67'", "HT", "FT", "14:00"
  date: string;
  time: string;
  venue: string;
  officials: MatchOfficial[];
  events: MatchEventItem[];
  preMatchReadinessConfirmed: boolean;
  homeTeamSheetApproved: boolean;
  awayTeamSheetApproved: boolean;
  report?: MatchReport;
  homeLineup?: TeamMatchLineup;
  awayLineup?: TeamMatchLineup;
  auditLog?: MatchAuditEntry[];
}

export interface TeamRosterPlayer {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW' | string;
  teamId: string;
  avatar?: string;
}

// Default team rosters for league matches
const DEFAULT_ROSTERS: Record<string, TeamRosterPlayer[]> = {
  t1: [
    { id: 'p101', name: 'Samuel Mwangi', number: 1, position: 'GK', teamId: 't1', avatar: '🧤' },
    { id: 'p102', name: 'Joseph Kariuki', number: 2, position: 'DF', teamId: 't1', avatar: '🛡️' },
    { id: 'p111', name: 'Hillary Echesa', number: 3, position: 'DF', teamId: 't1', avatar: '🛡️' },
    { id: 'p5', name: 'Alex Kamau', number: 4, position: 'DF', teamId: 't1', avatar: '🛡️' },
    { id: 'p103', name: 'Patrick Njeru', number: 5, position: 'DF', teamId: 't1', avatar: '🛡️' },
    { id: 'p104', name: 'Francis Kimanzi', number: 6, position: 'MF', teamId: 't1', avatar: '⚡' },
    { id: 'p105', name: 'Kelvin Mutua', number: 8, position: 'MF', teamId: 't1', avatar: '⚡' },
    { id: 'p108', name: 'Victor Wanyama', number: 11, position: 'MF', teamId: 't1', avatar: '⚡' },
    { id: 'p106', name: 'Dennis Ochieng', number: 7, position: 'FW', teamId: 't1', avatar: '🎯' },
    { id: 'p107', name: 'Eric Kiprop', number: 9, position: 'FW', teamId: 't1', avatar: '🎯' },
    { id: 'p1', name: 'Brian Otieno', number: 10, position: 'FW', teamId: 't1', avatar: '⚽' },
    // Bench Substitutes
    { id: 'p109', name: 'George Odhiambo', number: 14, position: 'FW', teamId: 't1', avatar: '🎯' },
    { id: 'p110', name: 'Ali Hassan', number: 17, position: 'MF', teamId: 't1', avatar: '⚡' },
    { id: 'p112', name: 'Collins Omondi', number: 12, position: 'DF', teamId: 't1', avatar: '🛡️' },
    { id: 'p113', name: 'Fredrick Onyango', number: 16, position: 'GK', teamId: 't1', avatar: '🧤' },
    { id: 'p114', name: 'Kevin Oliech', number: 20, position: 'FW', teamId: 't1', avatar: '🎯' },
  ],
  t2: [
    { id: 'p201', name: 'Moses Kibet', number: 1, position: 'GK', teamId: 't2', avatar: '🧤' },
    { id: 'p202', name: 'Collins Koech', number: 3, position: 'DF', teamId: 't2', avatar: '🛡️' },
    { id: 'p203', name: 'Boniface Muchiri', number: 4, position: 'DF', teamId: 't2', avatar: '🛡️' },
    { id: 'p208', name: 'Rodgers Aloro', number: 14, position: 'DF', teamId: 't2', avatar: '🛡️' },
    { id: 'p212', name: 'Patrick Omondi', number: 5, position: 'DF', teamId: 't2', avatar: '🛡️' },
    { id: 'p205', name: 'Lawrence Juma', number: 8, position: 'MF', teamId: 't2', avatar: '⚡' },
    { id: 'p206', name: 'Kenneth Muguna', number: 6, position: 'MF', teamId: 't2', avatar: '⚡' },
    { id: 'p209', name: 'Clifton Miheso', number: 11, position: 'MF', teamId: 't2', avatar: '⚡' },
    { id: 'p204', name: 'Titus Kapchanga', number: 7, position: 'FW', teamId: 't2', avatar: '🎯' },
    { id: 'p2', name: 'David Mwangi', number: 9, position: 'FW', teamId: 't2', avatar: '⚽' },
    { id: 'p207', name: 'Erick Kapaito', number: 10, position: 'FW', teamId: 't2', avatar: '🎯' },
    // Bench Substitutes
    { id: 'p210', name: 'Enock Agwanda', number: 15, position: 'FW', teamId: 't2', avatar: '🎯' },
    { id: 'p211', name: 'Duncan Otieno', number: 18, position: 'MF', teamId: 't2', avatar: '⚡' },
    { id: 'p213', name: 'Timothy Odhiambo', number: 16, position: 'GK', teamId: 't2', avatar: '🧤' },
    { id: 'p214', name: 'Geoffrey Ochieng', number: 21, position: 'DF', teamId: 't2', avatar: '🛡️' },
  ],
  t3: [
    { id: 'p301', name: 'Peter Odhiambo', number: 1, position: 'GK', teamId: 't3', avatar: '🧤' },
    { id: 'p302', name: 'Wellington Ochieng', number: 2, position: 'DF', teamId: 't3', avatar: '🛡️' },
    { id: 'p303', name: 'Joash Onyango', number: 5, position: 'DF', teamId: 't3', avatar: '🛡️' },
    { id: 'p307', name: 'Haron Shakava', number: 4, position: 'DF', teamId: 't3', avatar: '🛡️' },
    { id: 'p309', name: 'Shafik Batambuze', number: 3, position: 'DF', teamId: 't3', avatar: '🛡️' },
    { id: 'p304', name: 'Ernest Wendo', number: 6, position: 'MF', teamId: 't3', avatar: '⚡' },
    { id: 'p4', name: 'Kevin Simiyu', number: 8, position: 'MF', teamId: 't3', avatar: '⚡' },
    { id: 'p308', name: 'Philemon Otieno', number: 11, position: 'MF', teamId: 't3', avatar: '⚡' },
    { id: 'p305', name: 'Nicholas Kipkirui', number: 7, position: 'FW', teamId: 't3', avatar: '🎯' },
    { id: 'p3', name: 'Samuel Ndung\'u', number: 10, position: 'FW', teamId: 't3', avatar: '⚽' },
    { id: 'p306', name: 'Francis Mustafa', number: 9, position: 'FW', teamId: 't3', avatar: '🎯' },
    // Bench Substitutes
    { id: 'p310', name: 'Boniface Oluoch', number: 16, position: 'GK', teamId: 't3', avatar: '🧤' },
    { id: 'p311', name: 'Hashim Ssempala', number: 14, position: 'MF', teamId: 't3', avatar: '⚡' },
    { id: 'p312', name: 'Bernard Ondiek', number: 17, position: 'MF', teamId: 't3', avatar: '⚡' },
    { id: 'p313', name: 'Dennis Oalo', number: 19, position: 'FW', teamId: 't3', avatar: '🎯' },
  ],
  t4: [
    { id: 'p401', name: 'Kevin Omondi', number: 1, position: 'GK', teamId: 't4', avatar: '🧤' },
    { id: 'p402', name: 'Baraka Badi', number: 2, position: 'DF', teamId: 't4', avatar: '🛡️' },
    { id: 'p410', name: 'Eugene Asike', number: 4, position: 'DF', teamId: 't4', avatar: '🛡️' },
    { id: 'p411', name: 'Sven Yidah', number: 5, position: 'DF', teamId: 't4', avatar: '🛡️' },
    { id: 'p406', name: 'David Ambulu', number: 3, position: 'DF', teamId: 't4', avatar: '🛡️' },
    { id: 'p403', name: 'Musa Masika', number: 7, position: 'MF', teamId: 't4', avatar: '⚡' },
    { id: 'p405', name: 'Teddy Osok', number: 6, position: 'MF', teamId: 't4', avatar: '⚡' },
    { id: 'p407', name: 'Whyvonne Isuza', number: 8, position: 'MF', teamId: 't4', avatar: '⚡' },
    { id: 'p408', name: 'James Mazembe', number: 11, position: 'MF', teamId: 't4', avatar: '⚡' },
    { id: 'p404', name: 'Benson Omala', number: 9, position: 'FW', teamId: 't4', avatar: '🎯' },
    { id: 'p409', name: 'Ovella Ochieng', number: 10, position: 'FW', teamId: 't4', avatar: '⚽' },
    // Bench Substitutes
    { id: 'p412', name: 'Job Ochieng', number: 16, position: 'GK', teamId: 't4', avatar: '🧤' },
    { id: 'p413', name: 'Tevin Omutanyi', number: 15, position: 'MF', teamId: 't4', avatar: '⚡' },
    { id: 'p414', name: 'Brian Musa', number: 14, position: 'DF', teamId: 't4', avatar: '🛡️' },
    { id: 'p415', name: 'Sydney Lokale', number: 19, position: 'FW', teamId: 't4', avatar: '🎯' },
    { id: 'p416', name: 'Ronald Sichenje', number: 20, position: 'MF', teamId: 't4', avatar: '⚡' },
  ],
  t5: [
    { id: 'p501', name: 'Farouk Shikhalo', number: 1, position: 'GK', teamId: 't5', avatar: '🧤' },
    { id: 'p502', name: 'Yusuf Mainge', number: 2, position: 'DF', teamId: 't5', avatar: '🛡️' },
    { id: 'p503', name: 'Robinson Kamura', number: 4, position: 'DF', teamId: 't5', avatar: '🛡️' },
    { id: 'p504', name: 'Collins Shivachi', number: 5, position: 'DF', teamId: 't5', avatar: '🛡️' },
    { id: 'p505', name: 'Isaac Kipyegon', number: 3, position: 'DF', teamId: 't5', avatar: '🛡️' },
    { id: 'p506', name: 'Tirus Omondi', number: 6, position: 'MF', teamId: 't5', avatar: '⚡' },
    { id: 'p507', name: 'Austin Odhiambo', number: 10, position: 'MF', teamId: 't5', avatar: '⚡' },
    { id: 'p508', name: 'Marvin Nabwire', number: 8, position: 'MF', teamId: 't5', avatar: '⚡' },
    { id: 'p509', name: 'Peter Thiong\'o', number: 11, position: 'FW', teamId: 't5', avatar: '🎯' },
    { id: 'p510', name: 'Elvis Rupia', number: 9, position: 'FW', teamId: 't5', avatar: '🎯' },
    { id: 'p511', name: 'Hansel Ochieng', number: 7, position: 'FW', teamId: 't5', avatar: '🎯' },
    { id: 'p512', name: 'Ezekiel Owade', number: 16, position: 'GK', teamId: 't5', avatar: '🧤' },
  ],
  t6: [
    { id: 'p601', name: 'Patrick Matasi', number: 1, position: 'GK', teamId: 't6', avatar: '🧤' },
    { id: 'p602', name: 'Daniel Sakari', number: 2, position: 'DF', teamId: 't6', avatar: '🛡️' },
    { id: 'p603', name: 'Brian Mandela', number: 5, position: 'DF', teamId: 't6', avatar: '🛡️' },
    { id: 'p604', name: 'Joseph Okumu', number: 4, position: 'DF', teamId: 't6', avatar: '🛡️' },
    { id: 'p605', name: 'Abud Omar', number: 3, position: 'DF', teamId: 't6', avatar: '🛡️' },
    { id: 'p606', name: 'Teddy Akumu', number: 6, position: 'MF', teamId: 't6', avatar: '⚡' },
    { id: 'p607', name: 'Richard Odada', number: 8, position: 'MF', teamId: 't6', avatar: '⚡' },
    { id: 'p608', name: 'Kenneth Muguna', number: 10, position: 'MF', teamId: 't6', avatar: '⚡' },
    { id: 'p609', name: 'Ayub Timbe', number: 7, position: 'FW', teamId: 't6', avatar: '🎯' },
    { id: 'p610', name: 'Michael Olunga', number: 9, position: 'FW', teamId: 't6', avatar: '🎯' },
    { id: 'p611', name: 'Eric Johanna', number: 11, position: 'FW', teamId: 't6', avatar: '🎯' },
    { id: 'p612', name: 'Ian Otieno', number: 16, position: 'GK', teamId: 't6', avatar: '🧤' },
  ],
  t7: [
    { id: 'p701', name: 'Gabriel Andika', number: 1, position: 'GK', teamId: 't7', avatar: '🧤' },
    { id: 'p702', name: 'David Ochieng', number: 4, position: 'DF', teamId: 't7', avatar: '🛡️' },
    { id: 'p703', name: 'Humphrey Mieno', number: 8, position: 'MF', teamId: 't7', avatar: '⚡' },
    { id: 'p704', name: 'Derrick Nsibambi', number: 9, position: 'FW', teamId: 't7', avatar: '🎯' },
    { id: 'p705', name: 'Kelvin Etemesi', number: 7, position: 'FW', teamId: 't7', avatar: '🎯' },
    { id: 'p706', name: 'Baron Oketch', number: 11, position: 'FW', teamId: 't7', avatar: '🎯' },
    { id: 'p707', name: 'Fidel Origa', number: 6, position: 'MF', teamId: 't7', avatar: '⚡' },
    { id: 'p708', name: 'Maurice Ojwang', number: 5, position: 'DF', teamId: 't7', avatar: '🛡️' },
    { id: 'p709', name: 'Baraka Badi', number: 2, position: 'DF', teamId: 't7', avatar: '🛡️' },
    { id: 'p710', name: 'Michael Kibwage', number: 3, position: 'DF', teamId: 't7', avatar: '🛡️' },
    { id: 'p711', name: 'Mathias Kigonya', number: 16, position: 'GK', teamId: 't7', avatar: '🧤' },
    { id: 'p712', name: 'Francis Kahata', number: 10, position: 'MF', teamId: 't7', avatar: '⚡' },
  ]
};

// Initial matches seeded for the league
// Notice: Referee James (off-1) is appointed EXCLUSIVELY to m1 (1 match per official rule)
const INITIAL_MATCHES: OfficialMatchData[] = [
  {
    id: 'm1',
    competition: { id: 'c1', name: 'KeMU Super League' },
    homeTeam: { id: 't1', name: 'Meru Warriors FC', shortName: 'Warriors', logo: '🛡️' },
    awayTeam: { id: 't4', name: 'Isiolo United', shortName: 'Isiolo', logo: '🦅' },
    homeScore: 1,
    awayScore: 1,
    status: 'FIRST_HALF',
    minute: "28'",
    date: 'Today',
    time: '14:00',
    venue: 'Campus Stadium • Pitch A',
    officials: [
      { id: 'off-1', name: 'Referee James', role: 'Center Referee', badge: 'FKF / Premier' },
      { id: 'off-2', name: 'Mary Mwangi', role: 'Assistant Referee 1', badge: 'FIFA Assistant' },
      { id: 'off-3', name: 'Charles Kiprono', role: 'Assistant Referee 2', badge: 'FKF Regional' },
      { id: 'off-4', name: 'Peter Mutiso', role: '4th Official / Commissioner', badge: 'Senior Commissioner' }
    ],
    events: [
      {
        id: 'e1',
        time: "12'",
        minuteNumber: 12,
        type: 'goal',
        teamId: 't1',
        teamName: 'Meru Warriors FC',
        teamShortName: 'Warriors',
        teamLogo: '🛡️',
        playerId: 'p1',
        playerName: 'Brian Otieno',
        playerNumber: 10,
        detail: 'Open Play (Low Drive)',
        recordedByOfficialId: 'off-1',
        timestamp: new Date(Date.now() - 16 * 60000).toISOString() // > 5m ago (Locked)
      },
      {
        id: 'e2',
        time: "24'",
        minuteNumber: 24,
        type: 'goal',
        teamId: 't4',
        teamName: 'Isiolo United',
        teamShortName: 'Isiolo',
        teamLogo: '🦅',
        playerId: 'p404',
        playerName: 'Benson Omala',
        playerNumber: 9,
        detail: 'Penalty Kick',
        recordedByOfficialId: 'off-1',
        timestamp: new Date(Date.now() - 3 * 60000).toISOString() // 3m ago (Within Grace Window)
      }
    ],
    preMatchReadinessConfirmed: true,
    homeTeamSheetApproved: true,
    awayTeamSheetApproved: true,
    homeLineup: {
      formation: '4-3-3',
      starters: ['p106', 'p107', 'p1', 'p104', 'p105', 'p108', 'p102', 'p5', 'p103', 'p111', 'p101'],
      subs: ['p109', 'p110', 'p112', 'p113', 'p114'],
      captainId: 'p1'
    },
    awayLineup: {
      formation: '4-3-3',
      starters: ['p408', 'p404', 'p409', 'p405', 'p407', 'p403', 'p406', 'p410', 'p402', 'p411', 'p401'],
      subs: ['p412', 'p413', 'p414', 'p415', 'p416'],
      captainId: 'p404'
    },
    auditLog: [
      {
        id: 'aud-01',
        action: 'PERIOD_TRANSITION',
        timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
        officialId: 'off-1',
        officialName: 'Referee James',
        summary: 'Whistle blown: 1st Half Kicked Off'
      },
      {
        id: 'aud-02',
        action: 'EVENT_RECORDED',
        timestamp: new Date(Date.now() - 16 * 60000).toISOString(),
        officialId: 'off-1',
        officialName: 'Referee James',
        summary: 'Goal logged: #10 Brian Otieno (12\')',
        details: 'Open Play (Low Drive)'
      },
      {
        id: 'aud-03',
        action: 'EVENT_RECORDED',
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
        officialId: 'off-1',
        officialName: 'Referee James',
        summary: 'Goal logged: #9 Benson Omala (24\')',
        details: 'Penalty Kick'
      }
    ]
  },
  {
    id: 'm2',
    competition: { id: 'c1', name: 'KeMU Super League' },
    homeTeam: { id: 't2', name: 'Nanyuki FC', shortName: 'Nanyuki', logo: '🏔️' },
    awayTeam: { id: 't3', name: 'Campus Stars', shortName: 'Stars', logo: '⭐' },
    homeScore: 0,
    awayScore: 0,
    status: 'READY',
    minute: '16:00',
    date: 'Today',
    time: '16:00',
    venue: 'Campus Stadium • Main Arena',
    officials: [
      { id: 'off-5', name: 'Referee Eric Ndwiga', role: 'Center Referee', badge: 'FKF Premier' },
      { id: 'off-6', name: 'Alice Korir', role: 'Assistant Referee 1', badge: 'FKF Regional' },
      { id: 'off-7', name: 'Jackson Njue', role: 'Assistant Referee 2', badge: 'FKF Regional' },
      { id: 'off-8', name: 'Grace Mumbua', role: '4th Official / Commissioner', badge: 'Match Assessor' }
    ],
    events: [],
    preMatchReadinessConfirmed: true,
    homeTeamSheetApproved: true,
    awayTeamSheetApproved: true,
    homeLineup: {
      formation: '4-3-3',
      starters: ['p204', 'p2', 'p207', 'p205', 'p206', 'p209', 'p202', 'p203', 'p208', 'p212', 'p201'],
      subs: ['p210', 'p211', 'p213', 'p214'],
      captainId: 'p2'
    },
    awayLineup: {
      formation: '4-3-3',
      starters: ['p305', 'p306', 'p3', 'p304', 'p4', 'p308', 'p302', 'p303', 'p307', 'p309', 'p301'],
      subs: ['p310', 'p311', 'p312', 'p313'],
      captainId: 'p3'
    }
  },
  {
    id: 'm3',
    competition: { id: 'c1', name: 'KeMU Super League' },
    homeTeam: { id: 't5', name: 'Embu Kings', shortName: 'Kings', logo: '👑' },
    awayTeam: { id: 't6', name: 'Thika United', shortName: 'Thika', logo: '⚡' },
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED',
    minute: '18:30',
    date: 'Tomorrow',
    time: '18:30',
    venue: 'City Ground',
    officials: [
      { id: 'off-9', name: 'Referee David Otieno', role: 'Center Referee', badge: 'FKF Regional' },
      { id: 'off-10', name: 'Mary Mwangi', role: 'Assistant Referee 1', badge: 'FIFA Assistant' },
      { id: 'off-11', name: 'Charles Kiprono', role: 'Assistant Referee 2', badge: 'FKF Regional' },
      { id: 'off-12', name: 'Peter Mutiso', role: '4th Official / Commissioner', badge: 'Senior Commissioner' }
    ],
    events: [],
    preMatchReadinessConfirmed: false,
    homeTeamSheetApproved: false,
    awayTeamSheetApproved: false
  },
  {
    id: 'm4',
    competition: { id: 'c1', name: 'KeMU Super League' },
    homeTeam: { id: 't2', name: 'Nanyuki FC', shortName: 'Nanyuki', logo: '🏔️' },
    awayTeam: { id: 't7', name: 'Chuka Shooters', shortName: 'Shooters', logo: '🎯' },
    homeScore: 3,
    awayScore: 0,
    status: 'VERIFIED_PUBLISHED',
    minute: 'FT',
    date: '04 Oct 2026',
    time: '15:00',
    venue: 'Nanyuki Stadium',
    officials: [
      { id: 'off-13', name: 'Referee Alice Korir', role: 'Center Referee', badge: 'FIFA International' }
    ],
    events: [
      {
        id: 'e401',
        time: "18'",
        minuteNumber: 18,
        type: 'goal',
        teamId: 't2',
        teamName: 'Nanyuki FC',
        teamShortName: 'Nanyuki',
        teamLogo: '🏔️',
        playerId: 'p2',
        playerName: 'David Mwangi',
        playerNumber: 9,
        detail: 'Open Play',
        recordedByOfficialId: 'off-13',
        timestamp: '2026-10-04T12:18:00Z'
      }
    ],
    preMatchReadinessConfirmed: true,
    homeTeamSheetApproved: true,
    awayTeamSheetApproved: true,
    report: {
      matchId: 'm4',
      submittedAt: '2026-10-04T14:10:00Z',
      refereeNotes: 'Fair, disciplined game with no contentious incidents.',
      fairPlayRatingHome: 5,
      fairPlayRatingAway: 5,
      confirmedScore: { home: 3, away: 0 },
      leadOfficialSignature: 'Referee Alice Korir #FIFA-2024',
      isPublished: true
    }
  },
  {
    id: 'm_hist_1',
    competition: { id: 'c1', name: 'KeMU Super League' },
    homeTeam: { id: 't1', name: 'Meru Warriors FC', shortName: 'Warriors', logo: '🛡️' },
    awayTeam: { id: 't6', name: 'Thika United', shortName: 'Thika', logo: '⚡' },
    homeScore: 2,
    awayScore: 1,
    status: 'VERIFIED_PUBLISHED',
    minute: 'FT',
    date: '27 Sep 2026',
    time: '15:00',
    venue: 'Campus Stadium • Pitch A',
    officials: [
      { id: 'off-1', name: 'Referee James', role: 'Center Referee', badge: 'FKF Premier' },
      { id: 'off-2', name: 'Mary Mwangi', role: 'Assistant Referee 1', badge: 'FIFA Assistant' },
      { id: 'off-3', name: 'Charles Kiprono', role: 'Assistant Referee 2', badge: 'FKF Regional' },
      { id: 'off-4', name: 'Peter Mutiso', role: '4th Official / Commissioner', badge: 'Senior Commissioner' }
    ],
    events: [
      {
        id: 'eh1_1',
        time: "14'",
        minuteNumber: 14,
        type: 'goal',
        teamId: 't1',
        teamName: 'Meru Warriors FC',
        teamShortName: 'Warriors',
        teamLogo: '🛡️',
        playerId: 'p1',
        playerName: 'Brian Otieno',
        playerNumber: 10,
        detail: 'Open Play (Low Drive)',
        recordedByOfficialId: 'off-1',
        timestamp: '2026-09-27T12:14:00Z'
      },
      {
        id: 'eh1_2',
        time: "32'",
        minuteNumber: 32,
        type: 'yellow_card',
        teamId: 't6',
        teamName: 'Thika United',
        teamShortName: 'Thika',
        teamLogo: '⚡',
        playerId: 'p606',
        playerName: 'Teddy Akumu',
        playerNumber: 6,
        detail: 'Tactical Foul',
        recordedByOfficialId: 'off-1',
        timestamp: '2026-09-27T12:32:00Z'
      },
      {
        id: 'eh1_3',
        time: "56'",
        minuteNumber: 56,
        type: 'goal',
        teamId: 't6',
        teamName: 'Thika United',
        teamShortName: 'Thika',
        teamLogo: '⚡',
        playerId: 'p610',
        playerName: 'Michael Olunga',
        playerNumber: 9,
        detail: 'Header (Corner Kick)',
        recordedByOfficialId: 'off-1',
        timestamp: '2026-09-27T13:11:00Z'
      },
      {
        id: 'eh1_4',
        time: "83'",
        minuteNumber: 83,
        type: 'goal',
        teamId: 't1',
        teamName: 'Meru Warriors FC',
        teamShortName: 'Warriors',
        teamLogo: '🛡️',
        playerId: 'p107',
        playerName: 'Eric Kiprop',
        playerNumber: 9,
        detail: 'Open Play (Volley)',
        recordedByOfficialId: 'off-1',
        timestamp: '2026-09-27T13:38:00Z'
      },
      {
        id: 'eh1_5',
        time: "88'",
        minuteNumber: 88,
        type: 'yellow_card',
        teamId: 't1',
        teamName: 'Meru Warriors FC',
        teamShortName: 'Warriors',
        teamLogo: '🛡️',
        playerId: 'p5',
        playerName: 'Alex Kamau',
        playerNumber: 4,
        detail: 'Dissent towards Referee',
        recordedByOfficialId: 'off-1',
        timestamp: '2026-09-27T13:43:00Z'
      }
    ],
    preMatchReadinessConfirmed: true,
    homeTeamSheetApproved: true,
    awayTeamSheetApproved: true,
    report: {
      matchId: 'm_hist_1',
      submittedAt: '2026-09-27T15:15:00Z',
      refereeNotes: 'High-tempo league match managed firmly. Both teams maintained technical discipline.',
      fairPlayRatingHome: 4,
      fairPlayRatingAway: 4,
      confirmedScore: { home: 2, away: 1 },
      leadOfficialSignature: 'Referee James #FKF-8821',
      isPublished: true
    },
    auditLog: [
      {
        id: 'aud-h1-1',
        action: 'PERIOD_TRANSITION',
        timestamp: '2026-09-27T12:00:00Z',
        officialId: 'off-1',
        officialName: 'Referee James',
        summary: 'Kickoff 1st Half blown'
      },
      {
        id: 'aud-h1-2',
        action: 'REPORT_SUBMITTED',
        timestamp: '2026-09-27T15:15:00Z',
        officialId: 'off-1',
        officialName: 'Referee James',
        summary: 'Official Match Report Verified & Published',
        details: 'Score confirmed 2 - 1'
      }
    ]
  },
  {
    id: 'm_hist_2',
    competition: { id: 'c1', name: 'KeMU Super League' },
    homeTeam: { id: 't4', name: 'Isiolo United', shortName: 'Isiolo', logo: '🦅' },
    awayTeam: { id: 't3', name: 'Campus Stars', shortName: 'Stars', logo: '⭐' },
    homeScore: 0,
    awayScore: 0,
    status: 'VERIFIED_PUBLISHED',
    minute: 'FT',
    date: '20 Sep 2026',
    time: '16:00',
    venue: 'City Ground',
    officials: [
      { id: 'off-1', name: 'Referee James', role: 'Center Referee', badge: 'FKF Premier' },
      { id: 'off-6', name: 'Alice Korir', role: 'Assistant Referee 1', badge: 'FKF Regional' },
      { id: 'off-7', name: 'Jackson Njue', role: 'Assistant Referee 2', badge: 'FKF Regional' },
      { id: 'off-8', name: 'Grace Mumbua', role: '4th Official / Commissioner', badge: 'Match Assessor' }
    ],
    events: [
      {
        id: 'eh2_1',
        time: "21'",
        minuteNumber: 21,
        type: 'yellow_card',
        teamId: 't3',
        teamName: 'Campus Stars',
        teamShortName: 'Stars',
        teamLogo: '⭐',
        playerId: 'p302',
        playerName: 'Brian Mandela',
        playerNumber: 5,
        detail: 'Persistent Infringement',
        recordedByOfficialId: 'off-1',
        timestamp: '2026-09-20T13:21:00Z'
      },
      {
        id: 'eh2_2',
        time: "44'",
        minuteNumber: 44,
        type: 'yellow_card',
        teamId: 't4',
        teamName: 'Isiolo United',
        teamShortName: 'Isiolo',
        teamLogo: '🦅',
        playerId: 'p407',
        playerName: 'Austin Odhiambo',
        playerNumber: 10,
        detail: 'Reckless Tackle',
        recordedByOfficialId: 'off-1',
        timestamp: '2026-09-20T13:44:00Z'
      },
      {
        id: 'eh2_3',
        time: "74'",
        minuteNumber: 74,
        type: 'red_card',
        teamId: 't4',
        teamName: 'Isiolo United',
        teamShortName: 'Isiolo',
        teamLogo: '🦅',
        playerId: 'p410',
        playerName: 'Elvis Rupia',
        playerNumber: 9,
        detail: 'Violent Conduct (Studs Up Challenge)',
        recordedByOfficialId: 'off-1',
        timestamp: '2026-09-20T14:29:00Z'
      }
    ],
    preMatchReadinessConfirmed: true,
    homeTeamSheetApproved: true,
    awayTeamSheetApproved: true,
    report: {
      matchId: 'm_hist_2',
      submittedAt: '2026-09-20T16:10:00Z',
      refereeNotes: 'Tense tactical derby. Straight red card issued at 74th minute for dangerous contact endangering opponent safety. Misconduct report filed.',
      incidentReport: 'Dismissal: #9 Elvis Rupia for serious foul play under Law 12. Hearing scheduled with disciplinary board.',
      fairPlayRatingHome: 3,
      fairPlayRatingAway: 4,
      confirmedScore: { home: 0, away: 0 },
      leadOfficialSignature: 'Referee James #FKF-8821',
      isPublished: true
    },
    auditLog: [
      {
        id: 'aud-h2-1',
        action: 'PERIOD_TRANSITION',
        timestamp: '2026-09-20T13:00:00Z',
        officialId: 'off-1',
        officialName: 'Referee James',
        summary: 'Match officially kicked off'
      },
      {
        id: 'aud-h2-2',
        action: 'EVENT_RECORDED',
        timestamp: '2026-09-20T14:29:00Z',
        officialId: 'off-1',
        officialName: 'Referee James',
        summary: 'Dismissal (Red Card) logged: #9 Elvis Rupia'
      },
      {
        id: 'aud-h2-3',
        action: 'REPORT_SUBMITTED',
        timestamp: '2026-09-20T16:10:00Z',
        officialId: 'off-1',
        officialName: 'Referee James',
        summary: 'Official Match Report Verified & Published'
      }
    ]
  },
  {
    id: 'm_hist_3',
    competition: { id: 'c1', name: 'KeMU Super League' },
    homeTeam: { id: 't2', name: 'Nanyuki FC', shortName: 'Nanyuki', logo: '🏔️' },
    awayTeam: { id: 't5', name: 'Embu Kings', shortName: 'Kings', logo: '👑' },
    homeScore: 1,
    awayScore: 2,
    status: 'VERIFIED_PUBLISHED',
    minute: 'FT',
    date: '13 Sep 2026',
    time: '14:30',
    venue: 'Nanyuki Stadium',
    officials: [
      { id: 'off-5', name: 'Referee Eric Ndwiga', role: 'Center Referee', badge: 'FKF Premier' },
      { id: 'off-1', name: 'Referee James', role: '4th Official / Commissioner', badge: 'FKF Premier' },
      { id: 'off-2', name: 'Mary Mwangi', role: 'Assistant Referee 1', badge: 'FIFA Assistant' },
      { id: 'off-3', name: 'Charles Kiprono', role: 'Assistant Referee 2', badge: 'FKF Regional' }
    ],
    events: [
      {
        id: 'eh3_1',
        time: "11'",
        minuteNumber: 11,
        type: 'goal',
        teamId: 't2',
        teamName: 'Nanyuki FC',
        teamShortName: 'Nanyuki',
        teamLogo: '🏔️',
        playerId: 'p204',
        playerName: 'David Mwangi',
        playerNumber: 9,
        detail: 'Open Play',
        recordedByOfficialId: 'off-5',
        timestamp: '2026-09-13T11:41:00Z'
      },
      {
        id: 'eh3_2',
        time: "39'",
        minuteNumber: 39,
        type: 'goal',
        teamId: 't5',
        teamName: 'Embu Kings',
        teamShortName: 'Kings',
        teamLogo: '👑',
        playerId: 'p509',
        playerName: 'Peter Thiong\'o',
        playerNumber: 11,
        detail: 'Free Kick',
        recordedByOfficialId: 'off-5',
        timestamp: '2026-09-13T12:09:00Z'
      },
      {
        id: 'eh3_3',
        time: "88'",
        minuteNumber: 88,
        type: 'goal',
        teamId: 't5',
        teamName: 'Embu Kings',
        teamShortName: 'Kings',
        teamLogo: '👑',
        playerId: 'p510',
        playerName: 'Elvis Rupia',
        playerNumber: 9,
        detail: 'Header (Late Winner)',
        recordedByOfficialId: 'off-5',
        timestamp: '2026-09-13T12:58:00Z'
      }
    ],
    preMatchReadinessConfirmed: true,
    homeTeamSheetApproved: true,
    awayTeamSheetApproved: true,
    report: {
      matchId: 'm_hist_3',
      submittedAt: '2026-09-13T15:00:00Z',
      refereeNotes: 'Assigned as 4th Official / Commissioner. Seamless bench management and timely substitution checks.',
      fairPlayRatingHome: 5,
      fairPlayRatingAway: 5,
      confirmedScore: { home: 1, away: 2 },
      leadOfficialSignature: 'Referee Eric Ndwiga #FKF-4902',
      isPublished: true
    },
    auditLog: [
      {
        id: 'aud-h3-1',
        action: 'PERIOD_TRANSITION',
        timestamp: '2026-09-13T11:30:00Z',
        officialId: 'off-5',
        officialName: 'Referee Eric Ndwiga',
        summary: 'Kickoff 1st Half blown'
      },
      {
        id: 'aud-h3-2',
        action: 'REPORT_SUBMITTED',
        timestamp: '2026-09-13T15:00:00Z',
        officialId: 'off-5',
        officialName: 'Referee Eric Ndwiga',
        summary: 'Report Verified & Published'
      }
    ]
  }
];

class MatchStore {
  private matches: OfficialMatchData[];
  private listeners: Array<() => void> = [];
  private storageKey = 'novasport_official_matches_v4';
  private realtimeChannel: any = null;
  private isSyncing = false;
  private dynamicRosters: Record<string, TeamRosterPlayer[]> = {};

  constructor() {
    this.matches = this.loadMatches();
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
        .channel('novasport-match-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'fixtures' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'match_events' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'match_reports' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'fixture_officials' }, () => this.fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'match_readiness' }, () => this.fetchFromSupabase())
        .subscribe();
    } catch (e) {
      console.warn('[MatchStore] Realtime subscription error:', e);
    }
  }

  public async fetchFromSupabase(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;
    try {
      const [
        fixturesRes,
        officialsRes,
        fixtureOfficialsRes,
        eventsRes,
        readinessRes,
        reportsRes,
        teamsRes,
        playersRes,
        compsRes,
        seasonsRes
      ] = await Promise.all([
        supabase.from('fixtures').select('*').order('created_at'),
        supabase.from('officials').select('*'),
        supabase.from('fixture_officials').select('*'),
        supabase.from('match_events').select('*').order('timestamp'),
        supabase.from('match_readiness').select('*'),
        supabase.from('match_reports').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('players').select('*'),
        supabase.from('competitions').select('*'),
        supabase.from('seasons').select('*')
      ]);

      if (fixturesRes.error || !fixturesRes.data || fixturesRes.data.length === 0) {
        this.isSyncing = false;
        return false;
      }

      const fixtures = fixturesRes.data;
      const officials = officialsRes.data || [];
      const fixtureOfficials = fixtureOfficialsRes.data || [];
      const events = eventsRes.data || [];
      const readinessList = readinessRes.data || [];
      const reports = reportsRes.data || [];
      const teams = teamsRes.data || [];
      const players = playersRes.data || [];
      const comps = compsRes.data || [];
      const seasons = seasonsRes.data || [];

      // Build dynamic rosters map
      const rosterMap: Record<string, TeamRosterPlayer[]> = {};
      players.forEach(p => {
        if (!rosterMap[p.team_id]) {
          rosterMap[p.team_id] = [];
        }
        rosterMap[p.team_id].push({
          id: p.id,
          name: p.name,
          number: p.number,
          position: p.position as any,
          teamId: p.team_id,
          avatar: p.position === 'GK' ? '🧤' : p.position === 'DF' ? '🛡️' : p.position === 'MF' ? '⚡' : '⚽'
        });
      });
      this.dynamicRosters = rosterMap;

      // Map fixtures to OfficialMatchData
      const mapped: OfficialMatchData[] = fixtures.map(f => {
        const homeTeam = teams.find(t => t.id === f.home_team_id);
        const awayTeam = teams.find(t => t.id === f.away_team_id);
        const comp = comps.find(c => c.id === f.competition_id);
        const season = seasons.find(s => s.id === f.season_id);

        const matchOfficials: MatchOfficial[] = fixtureOfficials
          .filter(fo => fo.fixture_id === f.id)
          .map(fo => {
            const off = officials.find(o => o.id === fo.official_id);
            return {
              id: fo.official_id,
              name: off?.name || 'Official',
              role: fo.role || off?.role || 'Match Official',
              badge: off?.badge || 'NSFC Approved'
            };
          });

        const matchEvents: MatchEventItem[] = events
          .filter(e => e.fixture_id === f.id)
          .map(e => {
            const team = teams.find(t => t.id === e.team_id);
            const player = players.find(p => p.id === e.player_id);
            const subPlayer = e.sub_player_id ? players.find(p => p.id === e.sub_player_id) : undefined;
            return {
              id: e.id,
              time: e.time,
              minuteNumber: e.minute_number || 0,
              type: e.type,
              teamId: e.team_id,
              teamName: team?.name || 'Team',
              teamShortName: team?.short_name || team?.name?.substring(0, 3)?.toUpperCase() || 'TEM',
              teamLogo: team?.logo || '⚽',
              playerId: e.player_id,
              playerName: player?.name || 'Player',
              playerNumber: player?.number || 0,
              subPlayerId: e.sub_player_id || undefined,
              subPlayerName: subPlayer?.name,
              subPlayerNumber: subPlayer?.number,
              detail: e.detail || undefined,
              recordedByOfficialId: e.recorded_by_official_id || 'off-1',
              timestamp: e.timestamp,
              isVoided: e.is_voided ?? false,
              voidedAt: e.voided_at || undefined,
              voidReason: e.void_reason || undefined,
              voidNotes: e.void_notes || undefined
            };
          });

        const readiness = readinessList.find(r => r.fixture_id === f.id);
        const report = reports.find(r => r.fixture_id === f.id);

        // Find existing match to preserve lineups or local overrides
        const existing = this.matches.find(m => m.id === f.id);

        return {
          id: f.id,
          competition: {
            id: f.competition_id || comp?.id || 'c1',
            name: comp?.name || 'KeMU Super League',
            season: season?.name || 'Season 8'
          },
          round: f.round || 'Regular Fixture',
          season: season?.name || 'Season 8',
          homeTeam: {
            id: homeTeam?.id || f.home_team_id,
            name: homeTeam?.name || 'Home Team',
            shortName: homeTeam?.short_name || 'HOM',
            logo: homeTeam?.logo || '⚽',
            color: homeTeam?.primary_color || '#FF6A00'
          },
          awayTeam: {
            id: awayTeam?.id || f.away_team_id,
            name: awayTeam?.name || 'Away Team',
            shortName: awayTeam?.short_name || 'AWY',
            logo: awayTeam?.logo || '🦅',
            color: awayTeam?.primary_color || '#3B82F6'
          },
          homeScore: f.home_score ?? 0,
          awayScore: f.away_score ?? 0,
          status: f.status as MatchPeriodStatus,
          minute: f.minute || (f.status === 'VERIFIED_PUBLISHED' ? 'FT' : '15:00'),
          date: f.date || 'Today',
          time: f.time || '15:00',
          venue: f.venue || 'Campus Stadium',
          officials: matchOfficials.length > 0 ? matchOfficials : (existing?.officials || []),
          events: matchEvents,
          preMatchReadinessConfirmed: readiness ? (readiness.venue_confirmed && readiness.officials_appointed) : (existing?.preMatchReadinessConfirmed ?? false),
          homeTeamSheetApproved: readiness ? readiness.home_lineup_submitted : (existing?.homeTeamSheetApproved ?? false),
          awayTeamSheetApproved: readiness ? readiness.away_lineup_submitted : (existing?.awayTeamSheetApproved ?? false),
          report: report ? {
            matchId: f.id,
            submittedAt: report.submitted_at,
            refereeNotes: report.referee_notes || '',
            incidentReport: report.incident_report || '',
            fairPlayRatingHome: report.fair_play_rating_home || 5,
            fairPlayRatingAway: report.fair_play_rating_away || 5,
            confirmedScore: { home: report.confirmed_home_score ?? f.home_score ?? 0, away: report.confirmed_away_score ?? f.away_score ?? 0 },
            leadOfficialSignature: report.lead_official_signature || 'Referee',
            isPublished: report.is_published ?? true
          } : existing?.report,
          homeLineup: existing?.homeLineup,
          awayLineup: existing?.awayLineup,
          auditLog: existing?.auditLog || []
        };
      });

      this.matches = mapped;
      this.saveMatches();
      this.isSyncing = false;
      return true;
    } catch (err) {
      console.warn('[MatchStore] Supabase hydration failed, retaining local matches:', err);
      this.isSyncing = false;
      return false;
    }
  }

  private loadMatches(): OfficialMatchData[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed: OfficialMatchData[] = JSON.parse(stored);
        INITIAL_MATCHES.forEach(im => {
          if (!parsed.some(p => p.id === im.id)) {
            parsed.push(im);
          }
        });
        return parsed.map((m: OfficialMatchData) => {
          const initMatch = INITIAL_MATCHES.find(im => im.id === m.id);
          if (!m.homeLineup && initMatch?.homeLineup) {
            m.homeLineup = initMatch.homeLineup;
          }
          if (!m.awayLineup && initMatch?.awayLineup) {
            m.awayLineup = initMatch.awayLineup;
          }
          if (!m.auditLog && initMatch?.auditLog) {
            m.auditLog = initMatch.auditLog;
          } else if (!m.auditLog) {
            m.auditLog = [];
          }
          return m;
        });
      }
    } catch (e) {
      console.warn('Failed to parse match storage, using defaults', e);
    }
    return INITIAL_MATCHES;
  }

  public saveMatches() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.matches));
    } catch (e) {
      console.error('Failed to save matches to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: (matches?: OfficialMatchData[]) => void): () => void {
    this.listeners.push(listener as any);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const all = this.getAllMatches();
    this.listeners.forEach(fn => (fn as any)(all));
  }

  // --- Match Queries ---
  public getMatches(): OfficialMatchData[] {
    return [...this.matches];
  }

  public getAllMatches(): OfficialMatchData[] {
    return [...this.matches];
  }

  public getMatchById(id: string): OfficialMatchData | undefined {
    return this.matches.find(m => m.id === id);
  }

  public getLiveMatches(): OfficialMatchData[] {
    return this.matches.filter(m => 
      ['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF', 'FULL_TIME_PENDING_REVIEW'].includes(m.status)
    );
  }

  public getUpcomingMatches(): OfficialMatchData[] {
    return this.matches.filter(m => 
      ['SCHEDULED', 'READY'].includes(m.status)
    );
  }

  public getRecentResults(): OfficialMatchData[] {
    return this.matches.filter(m => 
      m.status === 'VERIFIED_PUBLISHED'
    );
  }

  // Enforces Match Credibility Rule:
  // A match official can ONLY be appointed to exactly 1 active match at a time.
  public getAssignedMatches(officialId: string = 'off-1'): OfficialMatchData[] {
    const assigned = this.matches.filter(m => 
      m.officials.some(o => o.id === officialId)
    );

    // Prioritize active match in progress, strictly returning 1 assignment
    const active = assigned.find(m => 
      ['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF', 'READY'].includes(m.status)
    );
    return active ? [active] : assigned.slice(0, 1);
  }

  // Query past concluded / verified matches that this official was appointed to
  public getOfficialPastMatches(officialId: string = 'off-1'): OfficialMatchData[] {
    return this.matches
      .filter(m => 
        m.officials.some(o => o.id === officialId) && 
        (m.status === 'VERIFIED_PUBLISHED' || m.status === 'FULL_TIME_PENDING_REVIEW')
      );
  }

  // Query career officiating statistics for official accreditation & auditing
  public getOfficialCareerStats(officialId: string = 'off-1'): {
    totalAppointments: number;
    centerRefereeCount: number;
    assistantOrFourthCount: number;
    completedMatches: number;
    yellowCardsIssued: number;
    redCardsIssued: number;
    reportsPublished: number;
  } {
    const appointedMatches = this.matches.filter(m => m.officials.some(o => o.id === officialId));
    const completed = appointedMatches.filter(m => m.status === 'VERIFIED_PUBLISHED');
    
    let centerCount = 0;
    let otherRoleCount = 0;
    let yellowCount = 0;
    let redCount = 0;
    let reportsCount = 0;

    appointedMatches.forEach(m => {
      const off = m.officials.find(o => o.id === officialId);
      if (off?.role === 'Center Referee') centerCount++;
      else otherRoleCount++;

      if (m.report?.isPublished) reportsCount++;

      m.events.filter(e => !e.isVoided).forEach(e => {
        if (e.recordedByOfficialId === officialId || off?.role === 'Center Referee') {
          if (e.type === 'yellow_card') yellowCount++;
          if (e.type === 'red_card') redCount++;
        }
      });
    });

    return {
      totalAppointments: appointedMatches.length,
      centerRefereeCount: centerCount,
      assistantOrFourthCount: otherRoleCount,
      completedMatches: completed.length,
      yellowCardsIssued: yellowCount,
      redCardsIssued: redCount,
      reportsPublished: reportsCount
    };
  }

  public getTeamRoster(teamId: string): TeamRosterPlayer[] {
    if (this.dynamicRosters[teamId] && this.dynamicRosters[teamId].length > 0) {
      return this.dynamicRosters[teamId];
    }
    return DEFAULT_ROSTERS[teamId] || [];
  }

  // --- Lineup and Squad Queries ---
  public getMatchLineup(matchId: string, teamId: string): TeamMatchLineup {
    const match = this.getMatchById(matchId);
    if (!match) {
      return { formation: '4-3-3', starters: [], subs: [] };
    }

    const isHome = match.homeTeam.id === teamId;
    const existing = isHome ? match.homeLineup : match.awayLineup;

    if (existing && existing.starters && existing.starters.length > 0) {
      return existing;
    }

    const roster = this.getTeamRoster(teamId);
    const gks = roster.filter(p => p.position === 'GK');
    const dfs = roster.filter(p => p.position === 'DF');
    const mfs = roster.filter(p => p.position === 'MF');
    const fws = roster.filter(p => p.position === 'FW');

    const startingGk = gks.slice(0, 1).map(p => p.id);
    const startingDf = dfs.slice(0, 4).map(p => p.id);
    const startingMf = mfs.slice(0, 3).map(p => p.id);
    const startingFw = fws.slice(0, 3).map(p => p.id);

    const starters = [...startingFw, ...startingMf, ...startingDf, ...startingGk];
    const subs = roster.filter(p => !starters.includes(p.id)).map(p => p.id);

    const lineup: TeamMatchLineup = {
      formation: '4-3-3',
      starters,
      subs,
      captainId: starters[2] || starters[0]
    };

    if (isHome) {
      match.homeLineup = lineup;
    } else {
      match.awayLineup = lineup;
    }

    this.saveMatches();
    return lineup;
  }

  public updateMatchFormation(matchId: string, teamId: string, formation: Formation) {
    const match = this.getMatchById(matchId);
    if (!match) return;

    const isHome = match.homeTeam.id === teamId;
    const lineup = isHome ? match.homeLineup : match.awayLineup;
    if (lineup) {
      lineup.formation = formation;
      this.saveMatches();
    }
  }

  public getPlayerMatchStats(matchId: string, playerId: string): {
    goals: number;
    yellowCards: number;
    redCards: number;
    isSubbedIn: boolean;
    isSubbedOut: boolean;
  } {
    const match = this.getMatchById(matchId);
    if (!match) {
      return { goals: 0, yellowCards: 0, redCards: 0, isSubbedIn: false, isSubbedOut: false };
    }

    let goals = 0;
    let yellowCards = 0;
    let redCards = 0;
    let isSubbedIn = false;
    let isSubbedOut = false;

    match.events.forEach(e => {
      // Voided events do NOT contribute to player match stats
      if (e.isVoided) return;

      if (e.playerId === playerId) {
        if (e.type === 'goal') goals++;
        if (e.type === 'yellow_card') yellowCards++;
        if (e.type === 'red_card') redCards++;
        if (e.type === 'substitution') isSubbedOut = true;
      }
      if (e.type === 'substitution' && e.subPlayerId === playerId) {
        isSubbedIn = true;
      }
    });

    return { goals, yellowCards, redCards, isSubbedIn, isSubbedOut };
  }

  // --- Official Operations & State Transitions ---

  public confirmPreMatchReadiness(matchId: string, confirmed: boolean = true) {
    const match = this.getMatchById(matchId);
    if (!match) return;

    match.preMatchReadinessConfirmed = confirmed;
    match.homeTeamSheetApproved = confirmed;
    match.awayTeamSheetApproved = confirmed;
    if (confirmed && match.status === 'SCHEDULED') {
      match.status = 'READY';
    }
    this.saveMatches();

    // Persist readiness & status to Supabase
    supabase.from('match_readiness').upsert({
      fixture_id: matchId,
      venue_confirmed: confirmed,
      officials_appointed: confirmed,
      home_lineup_submitted: confirmed,
      away_lineup_submitted: confirmed,
      medical_staff_on_site: confirmed,
      match_ball_approved: confirmed,
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('[MatchStore] Supabase readiness sync warning:', error);
    });

    if (confirmed && match.status === 'READY') {
      supabase.from('fixtures').update({
        status: 'READY',
        updated_at: new Date().toISOString()
      }).eq('id', matchId).then();
    }
  }

  public updateMatchPeriod(matchId: string, status: MatchPeriodStatus, currentMinute?: string) {
    const match = this.getMatchById(matchId);
    if (!match) return;

    match.status = status;
    if (currentMinute) {
      match.minute = currentMinute;
    } else {
      if (status === 'FIRST_HALF' && (!match.minute || match.minute.includes(':'))) {
        match.minute = "1'";
      } else if (status === 'HALF_TIME') {
        match.minute = 'HT';
      } else if (status === 'SECOND_HALF') {
        match.minute = "46'";
      } else if (status === 'FULL_TIME_PENDING_REVIEW' || status === 'VERIFIED_PUBLISHED') {
        match.minute = 'FT';
      }
    }

    // Append to audit trail
    const auditEntry: MatchAuditEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'PERIOD_TRANSITION',
      timestamp: new Date().toISOString(),
      officialId: 'off-1',
      officialName: 'Referee James',
      summary: `Period transition: ${status.replace(/_/g, ' ')} (Clock: ${match.minute})`
    };
    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push(auditEntry);

    this.saveMatches();

    // Persist period & clock to Supabase
    supabase.from('fixtures').update({
      status,
      minute: match.minute,
      updated_at: new Date().toISOString()
    }).eq('id', matchId).then(({ error }) => {
      if (error) console.warn('[MatchStore] Supabase period update warning:', error);
    });

    supabase.from('audit_logs').insert({
      id: auditEntry.id,
      timestamp: auditEntry.timestamp,
      admin_name: auditEntry.officialName,
      action: auditEntry.action,
      category: 'MATCH_OPERATIONS',
      details: auditEntry.summary,
      severity: 'INFO'
    }).then();
  }

  public setMatchMinute(matchId: string, minute: string) {
    const match = this.getMatchById(matchId);
    if (!match) return;
    match.minute = minute;
    this.saveMatches();

    supabase.from('fixtures').update({
      minute,
      updated_at: new Date().toISOString()
    }).eq('id', matchId).then();
  }

  // Helper to recalculate match score from active non-voided goals
  private recalculateScore(match: OfficialMatchData) {
    let homeGoals = 0;
    let awayGoals = 0;
    match.events.forEach(ev => {
      if (ev.isVoided) return; // Voided events do not count!
      if (ev.type === 'goal') {
        if (ev.detail === 'Own Goal') {
          if (ev.teamId === match.homeTeam.id) awayGoals++;
          else homeGoals++;
        } else {
          if (ev.teamId === match.homeTeam.id) homeGoals++;
          else if (ev.teamId === match.awayTeam.id) awayGoals++;
        }
      }
    });

    match.homeScore = homeGoals;
    match.awayScore = awayGoals;
  }

  // --- Live Event Logging ---

  public recordEvent(matchId: string, event: Omit<MatchEventItem, 'id' | 'timestamp'>) {
    const match = this.getMatchById(matchId);
    if (!match) return;

    const newEvent: MatchEventItem = {
      ...event,
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };

    match.events.push(newEvent);

    // Record immutable audit entry
    const auditEntry: MatchAuditEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'EVENT_RECORDED',
      timestamp: newEvent.timestamp,
      officialId: event.recordedByOfficialId || 'off-1',
      officialName: 'Referee James',
      summary: `${event.type === 'goal' ? 'Goal' : event.type.includes('card') ? 'Card' : 'Substitution'} logged: #${event.playerNumber} ${event.playerName} (${event.time})`,
      details: event.detail
    };

    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push(auditEntry);

    this.recalculateScore(match);
    this.saveMatches();

    // Persist event and updated score to Supabase
    supabase.from('match_events').insert({
      id: newEvent.id,
      fixture_id: matchId,
      time: newEvent.time,
      minute_number: newEvent.minuteNumber,
      type: newEvent.type,
      team_id: newEvent.teamId,
      player_id: newEvent.playerId,
      sub_player_id: newEvent.subPlayerId || null,
      detail: newEvent.detail || null,
      recorded_by_official_id: newEvent.recordedByOfficialId || 'off-1',
      timestamp: newEvent.timestamp,
      is_voided: false
    }).then(({ error }) => {
      if (error) console.warn('[MatchStore] Supabase event insert error:', error);
    });

    supabase.from('fixtures').update({
      home_score: match.homeScore,
      away_score: match.awayScore,
      updated_at: new Date().toISOString()
    }).eq('id', matchId).then(({ error }) => {
      if (error) console.warn('[MatchStore] Supabase score update error:', error);
    });

    supabase.from('audit_logs').insert({
      id: auditEntry.id,
      timestamp: auditEntry.timestamp,
      admin_name: auditEntry.officialName,
      action: auditEntry.action,
      category: 'MATCH_OPERATIONS',
      details: auditEntry.summary,
      severity: 'INFO'
    }).then();

    return newEvent;
  }

  public recordSubstitution(
    matchId: string,
    subData: {
      teamId: string;
      teamName: string;
      teamShortName: string;
      teamLogo: string;
      playerId: string;
      playerName: string;
      playerNumber: number;
      subPlayerId: string;
      subPlayerName: string;
      subPlayerNumber: number;
      time: string;
      detail?: string;
    }
  ) {
    const match = this.getMatchById(matchId);
    if (!match) return;

    const isHome = match.homeTeam.id === subData.teamId;
    const currentLineup = isHome ? match.homeLineup : match.awayLineup;

    if (currentLineup) {
      const starterIdx = currentLineup.starters.indexOf(subData.playerId);
      const subIdx = currentLineup.subs.indexOf(subData.subPlayerId);

      if (starterIdx !== -1) {
        currentLineup.starters[starterIdx] = subData.subPlayerId;
      }
      if (subIdx !== -1) {
        currentLineup.subs[subIdx] = subData.playerId;
      }
    }

    const recordedEvent = this.recordEvent(matchId, {
      type: 'substitution',
      teamId: subData.teamId,
      teamName: subData.teamName,
      teamShortName: subData.teamShortName,
      teamLogo: subData.teamLogo,
      playerId: subData.playerId,
      playerName: subData.playerName,
      playerNumber: subData.playerNumber,
      subPlayerId: subData.subPlayerId,
      subPlayerName: subData.subPlayerName,
      subPlayerNumber: subData.subPlayerNumber,
      time: subData.time,
      detail: subData.detail || `OUT: #${subData.playerNumber} ${subData.playerName} ➡️ IN: #${subData.subPlayerNumber} ${subData.subPlayerName}`,
      recordedByOfficialId: 'off-1',
      minuteNumber: parseInt(subData.time.replace("'", '')) || 1
    });

    this.saveMatches();
    return recordedEvent;
  }

  // --- Audited Invalidation Protocol (Replacing Arbitrary Deletion) ---
  public voidEvent(
    matchId: string, 
    eventId: string, 
    reason: string, 
    officialNotes?: string,
    officialId: string = 'off-1'
  ): { success: boolean; message: string } {
    const match = this.getMatchById(matchId);
    if (!match) return { success: false, message: 'Match not found.' };

    const event = match.events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found.' };

    if (event.isVoided) {
      return { success: false, message: 'Event has already been voided.' };
    }

    // Time Window Validation (5 minutes grace period)
    const eventTime = new Date(event.timestamp).getTime();
    const now = Date.now();
    if (now - eventTime > EVENT_CORRECTION_WINDOW_MS) {
      return { 
        success: false, 
        message: 'Correction grace window has expired (> 5 minutes). This event is permanently locked in official league governance records.' 
      };
    }

    // Mark event as VOIDED (Never permanently deleted to maintain full audit credibility)
    event.isVoided = true;
    event.voidedAt = new Date().toISOString();
    event.voidReason = reason;
    event.voidedByOfficialId = officialId;
    if (officialNotes) {
      event.voidNotes = officialNotes;
    }

    // If voiding a substitution, roll back lineup
    if (event.type === 'substitution' && event.subPlayerId) {
      const isHome = match.homeTeam.id === event.teamId;
      const currentLineup = isHome ? match.homeLineup : match.awayLineup;
      if (currentLineup) {
        const subStarterIdx = currentLineup.starters.indexOf(event.subPlayerId);
        const origSubIdx = currentLineup.subs.indexOf(event.playerId);
        if (subStarterIdx !== -1 && origSubIdx !== -1) {
          currentLineup.starters[subStarterIdx] = event.playerId;
          currentLineup.subs[origSubIdx] = event.subPlayerId;
        }
      }
    }

    // Recalculate score without voided goals
    this.recalculateScore(match);

    // Record immutable audit entry
    const auditEntry: MatchAuditEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'EVENT_VOIDED',
      timestamp: new Date().toISOString(),
      officialId,
      officialName: 'Referee James',
      summary: `Audited Invalidation: ${event.type.replace(/_/g, ' ')} #${event.playerNumber} ${event.playerName} (${event.time}) marked as VOIDED`,
      reason,
      details: officialNotes
    };

    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push(auditEntry);

    this.saveMatches();

    // Persist void state to Supabase
    supabase.from('match_events').update({
      is_voided: true,
      voided_at: event.voidedAt,
      void_reason: event.voidReason,
      void_notes: event.voidNotes || null
    }).eq('id', eventId).then(({ error }) => {
      if (error) console.warn('[MatchStore] Supabase event void error:', error);
    });

    supabase.from('fixtures').update({
      home_score: match.homeScore,
      away_score: match.awayScore,
      updated_at: new Date().toISOString()
    }).eq('id', matchId).then();

    supabase.from('audit_logs').insert({
      id: auditEntry.id,
      timestamp: auditEntry.timestamp,
      admin_name: auditEntry.officialName,
      action: auditEntry.action,
      category: 'MATCH_OPERATIONS',
      details: auditEntry.summary,
      severity: 'WARNING'
    }).then();

    return { success: true, message: `Event legitimately voided: ${reason}` };
  }

  // Deprecated fallback for deleteEvent that legitimately voids with a default reason
  public deleteEvent(matchId: string, eventId: string) {
    return this.voidEvent(matchId, eventId, 'Clerical Correction / Input Error');
  }

  // --- Official Post-Match Report Submission & Publication ---

  public submitOfficialReport(
    matchId: string,
    reportData: {
      refereeNotes: string;
      incidentReport?: string;
      fairPlayRatingHome: number;
      fairPlayRatingAway: number;
      leadOfficialSignature: string;
      publishOfficialResult: boolean;
    }
  ) {
    const match = this.getMatchById(matchId);
    if (!match) return;

    const report: MatchReport = {
      matchId,
      submittedAt: new Date().toISOString(),
      refereeNotes: reportData.refereeNotes,
      incidentReport: reportData.incidentReport,
      fairPlayRatingHome: reportData.fairPlayRatingHome,
      fairPlayRatingAway: reportData.fairPlayRatingAway,
      confirmedScore: { home: match.homeScore, away: match.awayScore },
      leadOfficialSignature: reportData.leadOfficialSignature,
      isPublished: reportData.publishOfficialResult
    };

    match.report = report;

    if (reportData.publishOfficialResult) {
      match.status = 'VERIFIED_PUBLISHED';
      match.minute = 'FT';
    } else {
      match.status = 'FULL_TIME_PENDING_REVIEW';
    }

    const auditEntry: MatchAuditEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'REPORT_SUBMITTED',
      timestamp: new Date().toISOString(),
      officialId: 'off-1',
      officialName: 'Referee James',
      summary: `Official Match Report ${reportData.publishOfficialResult ? 'Signed & Verified' : 'Draft Saved'} with signature: ${reportData.leadOfficialSignature}`
    };
    if (!match.auditLog) match.auditLog = [];
    match.auditLog.push(auditEntry);

    this.saveMatches();

    // Persist report and final verification to Supabase
    supabase.from('match_reports').upsert({
      fixture_id: matchId,
      submitted_at: report.submittedAt,
      referee_notes: report.refereeNotes,
      incident_report: report.incidentReport || null,
      fair_play_rating_home: report.fairPlayRatingHome,
      fair_play_rating_away: report.fairPlayRatingAway,
      confirmed_home_score: report.confirmedScore.home,
      confirmed_away_score: report.confirmedScore.away,
      lead_official_signature: report.leadOfficialSignature,
      is_published: report.isPublished
    }).then(({ error }) => {
      if (error) console.warn('[MatchStore] Supabase report upsert error:', error);
    });

    supabase.from('fixtures').update({
      status: match.status,
      minute: match.minute,
      home_score: match.homeScore,
      away_score: match.awayScore,
      updated_at: new Date().toISOString()
    }).eq('id', matchId).then(({ error }) => {
      if (error) console.warn('[MatchStore] Supabase fixture status update error:', error);
    });

    supabase.from('audit_logs').insert({
      id: auditEntry.id,
      timestamp: auditEntry.timestamp,
      admin_name: auditEntry.officialName,
      action: auditEntry.action,
      category: 'MATCH_OPERATIONS',
      details: auditEntry.summary,
      severity: 'INFO'
    }).then();
  }

  public resetToDefault() {
    this.matches = JSON.parse(JSON.stringify(INITIAL_MATCHES));
    this.saveMatches();
  }
}

export const matchStore = new MatchStore();
