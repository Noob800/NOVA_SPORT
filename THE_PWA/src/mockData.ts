// NovaSport Authoritative Data Bridge
// Bridges live backend records from AdminStore & MatchStore into the public experience

import { adminStore } from './services/adminStore';
import { matchStore } from './services/matchStore';

export interface CompetitionItem {
  id: string;
  name: string;
  season: string;
  status: string;
  type: string;
}

export interface TeamItem {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: number;
  form: string[];
}

export interface PlayerItem {
  id: string;
  name: string;
  team: { id: string; name: string; logo: string; shortName: string };
  teamId: string;
  position: string;
  number: number;
  avatar: string;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface MatchItem {
  id: string;
  competition: { id: string; name: string; season?: string };
  homeTeam: { id: string; name: string; shortName: string; logo: string };
  awayTeam: { id: string; name: string; shortName: string; logo: string };
  homeScore?: number;
  awayScore?: number;
  time?: string;
  date?: string;
  minute?: string;
  status: string;
  venue?: string;
  events?: any[];
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image?: string;
}

// Initial exported arrays
export let mockCompetitions: CompetitionItem[] = [];
export let mockTeams: TeamItem[] = [];
export let mockPlayers: PlayerItem[] = [];
export let mockLiveMatches: MatchItem[] = [];
export let mockUpcomingMatches: MatchItem[] = [];
export let mockRecentResults: MatchItem[] = [];
export let mockNews: NewsItem[] = [];

export function syncMockData() {
  const comps = adminStore.getCompetitions();
  const activeSeason = adminStore.getActiveSeason();
  const standings = adminStore.calculateStandings(activeSeason?.id);
  const rawTeams = adminStore.getTeams();
  const rawPlayers = adminStore.getPlayers();
  const allMatches = matchStore.getAllMatches();
  const rawAnnouncements = adminStore.getAnnouncements();

  // 1. Competitions
  mockCompetitions = comps.map(c => {
    const season = adminStore.getActiveSeason(c.id) || adminStore.getSeasons(c.id)[0];
    return {
      id: c.id,
      name: c.name,
      season: season ? `${season.name} - ${season.year}` : '2026/27',
      status: c.status === 'ACTIVE' ? 'Ongoing' : 'Upcoming',
      type: c.type === 'LEAGUE' ? 'League' : 'Cup'
    };
  });

  // 2. Teams (computed from authoritative standings)
  mockTeams = rawTeams.map(t => {
    const standing = standings.find(s => s.teamId === t.id);
    return {
      id: t.id,
      name: t.name,
      shortName: t.shortName || t.name.substring(0, 3).toUpperCase(),
      logo: t.logo || '⚽',
      points: standing?.points || 0,
      played: standing?.played || 0,
      won: standing?.won || 0,
      drawn: standing?.drawn || 0,
      lost: standing?.lost || 0,
      gd: standing?.goalDifference || 0,
      form: standing?.form || ['W', 'D', 'W']
    };
  }).sort((a, b) => b.points - a.points || b.gd - a.gd);

  // 3. Players
  mockPlayers = rawPlayers.map(p => {
    const team = rawTeams.find(t => t.id === p.teamId);
    return {
      id: p.id,
      name: p.name,
      teamId: p.teamId,
      team: {
        id: p.teamId,
        name: team?.name || 'Club',
        logo: team?.logo || '⚽',
        shortName: team?.shortName || 'CLB'
      },
      position: p.position === 'GK' ? 'Goalkeeper' : p.position === 'DF' ? 'Defender' : p.position === 'MF' ? 'Midfielder' : 'Forward',
      number: p.number,
      avatar: p.position === 'GK' ? '🧤' : p.position === 'DF' ? '🛡️' : p.position === 'MF' ? '⚡' : '🎯',
      appearances: p.appearances || 0,
      goals: p.goals || 0,
      assists: p.assists || 0,
      yellowCards: p.yellowCards || 0,
      redCards: p.redCards || 0
    };
  });

  // 4. Matches
  mockLiveMatches = allMatches.filter(m => 
    ['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF', 'FULL_TIME_PENDING_REVIEW'].includes(m.status)
  ).map(m => ({
    id: m.id,
    competition: m.competition,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    minute: m.minute,
    status: 'LIVE',
    events: m.events
  }));

  mockUpcomingMatches = allMatches.filter(m => 
    ['SCHEDULED', 'READY'].includes(m.status)
  ).map(m => ({
    id: m.id,
    competition: m.competition,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    time: m.time,
    date: m.date,
    status: 'UPCOMING',
    venue: m.venue
  }));

  mockRecentResults = allMatches.filter(m => 
    m.status === 'VERIFIED_PUBLISHED'
  ).map(m => ({
    id: m.id,
    competition: m.competition,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: 'FT'
  }));

  // 5. News & Announcements
  mockNews = rawAnnouncements.map(a => ({
    id: a.id,
    title: a.title,
    category: a.category || 'General',
    date: a.publishedAt ? a.publishedAt.split('T')[0] : 'Today',
    image: 'https://images.unsplash.com/photo-1518605368461-1e1e11405122?auto=format&fit=crop&w=800&q=80'
  }));
}

// Initial hydration
syncMockData();

// Automatically update whenever adminStore or matchStore emits
adminStore.subscribe(() => syncMockData());
matchStore.subscribe(() => syncMockData());
