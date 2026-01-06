
import { Category } from './types';

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

export const CATEGORIES: Category[] = [
  {
    id: 'pic-drama',
    name: 'Best Motion Picture – Drama',
    basePoints: 50,
    powerPoints: 150,
    nominees: [
      { id: 'brutalist-pic', name: 'The Brutalist', work: 'A24', odds: '38%' },
      { id: 'complete-unknown-pic', name: 'A Complete Unknown', work: 'Searchlight Pictures', odds: '24%' },
      { id: 'conclave-pic', name: 'Conclave', work: 'Focus Features', odds: '18%' },
      { id: 'queer-pic', name: 'Queer', work: 'A24', odds: '10%' },
      { id: 'sing-sing-pic', name: 'Sing Sing', work: 'A24', odds: '6%' },
      { id: 'nickel-boys-pic', name: 'Nickel Boys', work: 'Amazon MGM Studios', odds: '4%' }
    ]
  },
  {
    id: 'pic-comedy',
    name: 'Best Motion Picture – Musical or Comedy',
    basePoints: 50,
    powerPoints: 150,
    nominees: [
      { id: 'anora-pic', name: 'Anora', work: 'Neon', odds: '45%' },
      { id: 'emilia-perez-pic', name: 'Emilia Pérez', work: 'Netflix', odds: '32%' },
      { id: 'wicked-pic', name: 'Wicked', work: 'Universal Pictures', odds: '12%' },
      { id: 'real-pain-pic', name: 'A Real Pain', work: 'Searchlight Pictures', odds: '7%' },
      { id: 'nightbitch-pic', name: 'Nightbitch', work: 'Searchlight Pictures', odds: '2%' },
      { id: 'last-showgirl-pic', name: 'The Last Showgirl', work: 'Roadside Attractions', odds: '2%' }
    ]
  },
  {
    id: 'actor-drama',
    name: 'Best Actor in a Motion Picture – Drama',
    basePoints: 50,
    powerPoints: 150,
    nominees: [
      { id: 'adrien-brody', name: 'Adrien Brody', work: 'The Brutalist', odds: '42%' },
      { id: 'ralph-fiennes', name: 'Ralph Fiennes', work: 'Conclave', odds: '25%' },
      { id: 'timothee-chalamet', name: 'Timothée Chalamet', work: 'A Complete Unknown', odds: '18%' },
      { id: 'colman-domingo', name: 'Colman Domingo', work: 'Sing Sing', odds: '8%' },
      { id: 'daniel-craig', name: 'Daniel Craig', work: 'Queer', odds: '4%' },
      { id: 'sebastian-stan', name: 'Sebastian Stan', work: 'The Apprentice', odds: '3%' }
    ]
  },
  {
    id: 'actress-drama',
    name: 'Best Actress in a Motion Picture – Drama',
    basePoints: 50,
    powerPoints: 150,
    nominees: [
      { id: 'angelina-jolie', name: 'Angelina Jolie', work: 'Maria', odds: '35%' },
      { id: 'nicole-kidman', name: 'Nicole Kidman', work: 'Babygirl', odds: '28%' },
      { id: 'tilda-swinton', name: 'Tilda Swinton', work: 'The Room Next Door', odds: '15%' },
      { id: 'marianne-jean-baptiste', name: 'Marianne Jean-Baptiste', work: 'Hard Truths', odds: '10%' },
      { id: 'fernanda-torres', name: 'Fernanda Torres', work: "I'm Still Here", odds: '8%' },
      { id: 'saoirse-ronan', name: 'Saoirse Ronan', work: 'The Outrun', odds: '4%' }
    ]
  },
  {
    id: 'director',
    name: 'Best Director – Motion Picture',
    basePoints: 50,
    powerPoints: 150,
    nominees: [
      { id: 'brady-corbet', name: 'Brady Corbet', work: 'The Brutalist', odds: '35%' },
      { id: 'sean-baker', name: 'Sean Baker', work: 'Anora', odds: '32%' },
      { id: 'jacques-audiard', name: 'Jacques Audiard', work: 'Emilia Pérez', odds: '18%' },
      { id: 'james-mangold', name: 'James Mangold', work: 'A Complete Unknown', odds: '7%' },
      { id: 'edward-berger', name: 'Edward Berger', work: 'Conclave', odds: '5%' },
      { id: 'pedro-almodovar', name: 'Pedro Almodóvar', work: 'The Room Next Door', odds: '3%' }
    ]
  }
];

export const MOCK_LEAGUE_MEMBERS = [
  { id: 'sarah-123', displayName: 'SarahScreens', avatar: '🎬', totalScore: 350 },
  { id: 'emily-456', displayName: 'EmilyOscar', avatar: '🎭', totalScore: 300 },
  { id: 'jake-789', displayName: 'JakeFromStateFarm', avatar: '🍿', totalScore: 200 }
];
