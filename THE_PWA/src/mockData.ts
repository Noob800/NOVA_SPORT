export const mockTeams = [
  { id: 't1', name: 'Warriors FC', shortName: 'WAR', logo: '🛡️', points: 42, played: 18, won: 13, drawn: 3, lost: 2, gd: 24 },
  { id: 't2', name: 'Titans', shortName: 'TIT', logo: '⚡', points: 39, played: 18, won: 12, drawn: 3, lost: 3, gd: 18 },
  { id: 't3', name: 'Spartans', shortName: 'SPA', logo: '⚔️', points: 35, played: 18, won: 10, drawn: 5, lost: 3, gd: 15 },
  { id: 't4', name: 'Phoenix', shortName: 'PHO', logo: '🔥', points: 30, played: 18, won: 9, drawn: 3, lost: 6, gd: 5 },
  { id: 't5', name: 'Dragons', shortName: 'DRA', logo: '🐉', points: 28, played: 18, won: 8, drawn: 4, lost: 6, gd: 8 },
  { id: 't6', name: 'Wolves', shortName: 'WOL', logo: '🐺', points: 25, played: 18, won: 7, drawn: 4, lost: 7, gd: 0 },
  { id: 't7', name: 'Eagles', shortName: 'EAG', logo: '🦅', points: 18, played: 18, won: 5, drawn: 3, lost: 10, gd: -12 },
  { id: 't8', name: 'Panthers', shortName: 'PAN', logo: '🐆', points: 12, played: 18, won: 3, drawn: 3, lost: 12, gd: -20 },
];

export const mockLiveMatches = [
  {
    id: 'm1',
    homeTeam: mockTeams[0],
    awayTeam: mockTeams[1],
    homeScore: 2,
    awayScore: 1,
    minute: "67'",
    status: 'LIVE'
  }
];

export const mockUpcomingMatches = [
  {
    id: 'm2',
    homeTeam: mockTeams[2],
    awayTeam: mockTeams[3],
    time: '14:00',
    date: 'Today',
    status: 'UPCOMING'
  },
  {
    id: 'm3',
    homeTeam: mockTeams[4],
    awayTeam: mockTeams[5],
    time: '16:30',
    date: 'Today',
    status: 'UPCOMING'
  }
];

export const mockRecentResults = [
  {
    id: 'm4',
    homeTeam: mockTeams[6],
    awayTeam: mockTeams[7],
    homeScore: 3,
    awayScore: 0,
    status: 'FT'
  }
];

export const mockNews = [
  {
    id: 'n1',
    title: 'KeMU Super League Season 8 Kicks Off with a Bang',
    category: 'Official',
    date: 'Oct 8, 2026',
    image: 'https://images.unsplash.com/photo-1518605368461-1e1e11405122?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'n2',
    title: 'Warriors FC secure crucial victory against Titans in mid-season clash',
    category: 'Match Report',
    date: 'Oct 7, 2026',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6fc1ac5e17?auto=format&fit=crop&w=800&q=80'
  }
];
