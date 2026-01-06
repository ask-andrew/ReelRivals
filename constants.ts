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
      { id: 'frankenstein', name: 'Frankenstein' },
      { id: 'hamnet', name: 'Hamnet' },
      { id: 'accident', name: 'It Was Just an Accident' },
      { id: 'secret-agent', name: 'The Secret Agent' },
      { id: 'sentimental-value', name: 'Sentimental Value' },
      { id: 'sinners', name: 'Sinners' }
    ]
  },
  {
    id: 'pic-comedy',
    name: 'Best Motion Picture – Musical or Comedy',
    basePoints: 50,
    nominees: [
      { id: 'blue-moon', name: 'Blue Moon' },
      { id: 'bugonia', name: 'Bugonia' },
      { id: 'marty-supreme', name: 'Marty Supreme' },
      { id: 'no-other-choice', name: 'No Other Choice' },
      { id: 'nouvelle-vague', name: 'Nouvelle Vague' },
      { id: 'one-battle', name: 'One Battle After Another' }
    ]
  },
  {
    id: 'director',
    name: 'Best Director – Motion Picture',
    basePoints: 50,
    nominees: [
      { id: 'pta', name: 'Paul Thomas Anderson' },
      { id: 'ryan-coogler', name: 'Ryan Coogler' },
      { id: 'gdt', name: 'Guillermo del Toro' },
      { id: 'jafar-panahi', name: 'Jafar Panahi' },
      { id: 'joachim-trier', name: 'Joachim Trier' },
      { id: 'chloe-zhao', name: 'Chloé Zhao' }
    ]
  },
  {
    id: 'actress-drama',
    name: 'Best Performance by a Female Actor – Drama',
    basePoints: 50,
    nominees: [
      { id: 'jessie-buckley', name: 'Jessie Buckley' },
      { id: 'jennifer-lawrence', name: 'Jennifer Lawrence' },
      { id: 'renate-reinsve', name: 'Renate Reinsve' },
      { id: 'julia-roberts', name: 'Julia Roberts' },
      { id: 'tessa-thompson', name: 'Tessa Thompson' },
      { id: 'eva-victor', name: 'Eva Victor' }
    ]
  },
  {
    id: 'actor-drama',
    name: 'Best Performance by a Male Actor – Drama',
    basePoints: 50,
    nominees: [
      { id: 'joel-edgerton', name: 'Joel Edgerton' },
      { id: 'oscar-isaac', name: 'Oscar Isaac' },
      { id: 'dwayne-johnson', name: 'Dwayne Johnson' },
      { id: 'michael-b-jordan', name: 'Michael B. Jordan' },
      { id: 'wagner-moura', name: 'Wagner Moura' },
      { id: 'jeremy-allen-white', name: 'Jeremy Allen White' }
    ]
  },
  {
    id: 'actress-comedy',
    name: 'Best Performance by a Female Actor – Musical or Comedy',
    basePoints: 50,
    nominees: [
      { id: 'rose-byrne', name: 'Rose Byrne' },
      { id: 'cynthia-erivo', name: 'Cynthia Erivo' },
      { id: 'kate-hudson', name: 'Kate Hudson' },
      { id: 'chase-infiniti', name: 'Chase Infiniti' },
      { id: 'amanda-seyfried', name: 'Amanda Seyfried' },
      { id: 'emma-stone', name: 'Emma Stone' }
    ]
  },
  {
    id: 'actor-comedy',
    name: 'Best Performance by a Male Actor – Musical or Comedy',
    basePoints: 50,
    nominees: [
      { id: 'timothee-chalamet', name: 'Timothée Chalamet' },
      { id: 'george-clooney', name: 'George Clooney' },
      { id: 'leonardo-dicaprio', name: 'Leonardo DiCaprio' },
      { id: 'ethan-hawke', name: 'Ethan Hawke' },
      { id: 'lee-byung-hun', name: 'Lee Byung-hun' },
      { id: 'jesse-plemons', name: 'Jesse Plemons' }
    ]
  },
  {
    id: 'tv-drama',
    name: 'Best Television Series – Drama',
    basePoints: 50,
    nominees: [
      { id: 'diplomat', name: 'The Diplomat' },
      { id: 'pitt', name: 'The Pitt' },
      { id: 'pluribus', name: 'Pluribus' },
      { id: 'severance', name: 'Severance' },
      { id: 'slow-horses', name: 'Slow Horses' },
      { id: 'white-lotus', name: 'The White Lotus' }
    ]
  },
  {
    id: 'tv-comedy',
    name: 'Best Television Series – Musical/Comedy',
    basePoints: 50,
    nominees: [
      { id: 'abbott', name: 'Abbott Elementary' },
      { id: 'bear', name: 'The Bear' },
      { id: 'hacks', name: 'Hacks' },
      { id: 'nobody-wants', name: 'Nobody Wants This' },
      { id: 'only-murders', name: 'Only Murders in the Building' },
      { id: 'studio', name: 'The Studio' }
    ]
  },
  {
    id: 'tv-limited',
    name: 'Best Limited Series/Anthology/Movie',
    basePoints: 50,
    nominees: [
      { id: 'adolescence', name: 'Adolescence' },
      { id: 'all-her-fault', name: 'All Her Fault' },
      { id: 'beast-in-me', name: 'The Beast in Me' },
      { id: 'black-mirror', name: 'Black Mirror' },
      { id: 'dying-for-sex', name: 'Dying for Sex' },
      { id: 'girlfriend', name: 'The Girlfriend' }
    ]
  }
];

export const MOCK_LEAGUE_MEMBERS = [
  { id: 'sarah-123', displayName: 'SarahScreens', avatar: '🎬', totalScore: 350 },
  { id: 'emily-456', displayName: 'EmilyOscar', avatar: '🎭', totalScore: 300 },
  { id: 'jake-789', displayName: 'JakeFromStateFarm', avatar: '🍿', totalScore: 200 }
];