export interface AwardEvent {
  id: string;
  name: string;
  date: string;
  status: 'open' | 'locked' | 'upcoming' | 'completed';
  icon: string;
}

export const SEASON_CIRCUIT: AwardEvent[] = [
  { id: 'golden-globes-2026', name: 'Golden Globes', date: 'Jan 11, 2026', status: 'open', icon: '🏆' },
  { id: 'baftas-2026', name: 'BAFTA Awards', date: 'Feb 15, 2026', status: 'upcoming', icon: '🎭' },
  { id: 'sag-2026', name: 'SAG Awards', date: 'Feb 22, 2026', status: 'upcoming', icon: '👥' },
  { id: 'oscars-2026', name: 'The Oscars', date: 'Mar 2, 2026', status: 'upcoming', icon: '✨' }
];

export const CATEGORIES = [
  {
    id: 'pic-drama',
    name: 'Best Motion Picture – Drama',
    basePoints: 50,
    nominees: [
      { id: 'brutalist-pic', name: 'The Brutalist', odds: '38%' },
      { id: 'complete-unknown-pic', name: 'A Complete Unknown', odds: '24%' },
      { id: 'conclave-pic', name: 'Conclave', odds: '18%' },
      { id: 'queer-pic', name: 'Queer', odds: '10%' },
      { id: 'sing-sing-pic', name: 'Sing Sing', odds: '6%' },
      { id: 'nickel-boys-pic', name: 'Nickel Boys', odds: '4%' }
    ]
  },
  {
    id: 'pic-comedy',
    name: 'Best Motion Picture – Musical or Comedy',
    basePoints: 50,
    nominees: [
      { id: 'anora-pic', name: 'Anora', odds: '45%' },
      { id: 'emilia-perez-pic', name: 'Emilia Pérez', odds: '32%' },
      { id: 'wicked-pic', name: 'Wicked', odds: '12%' },
      { id: 'real-pain-pic', name: 'A Real Pain', odds: '7%' },
      { id: 'nightbitch-pic', name: 'Nightbitch', odds: '2%' },
      { id: 'last-showgirl-pic', name: 'The Last Showgirl', odds: '2%' }
    ]
  },
  {
    id: 'actor-drama',
    name: 'Best Actor in a Motion Picture – Drama',
    basePoints: 50,
    nominees: [
      { id: 'adrien-brody', name: 'Adrien Brody', odds: '42%' },
      { id: 'ralph-fiennes', name: 'Ralph Fiennes', odds: '25%' },
      { id: 'timothee-chalamet', name: 'Timothée Chalamet', odds: '18%' },
      { id: 'colman-domingo', name: 'Colman Domingo', odds: '8%' },
      { id: 'daniel-craig', name: 'Daniel Craig', odds: '4%' },
      { id: 'sebastian-stan', name: 'Sebastian Stan', odds: '3%' }
    ]
  },
  {
    id: 'actress-drama',
    name: 'Best Actress in a Motion Picture – Drama',
    basePoints: 50,
    nominees: [
      { id: 'angelina-jolie', name: 'Angelina Jolie', odds: '35%' },
      { id: 'nicole-kidman', name: 'Nicole Kidman', odds: '28%' },
      { id: 'tilda-swinton', name: 'Tilda Swinton', odds: '15%' },
      { id: 'marianne-jean-baptiste', name: 'Marianne Jean-Baptiste', odds: '10%' },
      { id: 'fernanda-torres', name: 'Fernanda Torres', odds: '8%' },
      { id: 'saoirse-ronan', name: 'Saoirse Ronan', odds: '4%' }
    ]
  },
  {
    id: 'director',
    name: 'Best Director – Motion Picture',
    basePoints: 50,
    nominees: [
      { id: 'brady-corbet', name: 'Brady Corbet', odds: '35%' },
      { id: 'sean-baker', name: 'Sean Baker', odds: '32%' },
      { id: 'jacques-audiard', name: 'Jacques Audiard', odds: '18%' },
      { id: 'james-mangold', name: 'James Mangold', odds: '7%' },
      { id: 'edward-berger', name: 'Edward Berger', odds: '5%' },
      { id: 'pedro-almodovar', name: 'Pedro Almodóvar', odds: '3%' }
    ]
  }
];

export const MOCK_LEAGUE_MEMBERS = [
  { id: 'sarah-123', displayName: 'SarahScreens', avatar: '🎬', totalScore: 350 },
  { id: 'emily-456', displayName: 'EmilyOscar', avatar: '🎭', totalScore: 300 },
  { id: 'jake-789', displayName: 'JakeFromStateFarm', avatar: '🍿', totalScore: 200 }
];