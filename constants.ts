export interface AwardEvent {
  id: string;
  name: string;
  date: string;
  status: 'open' | 'locked' | 'upcoming' | 'completed';
  icon: string;
}

export const SEASON_CIRCUIT: AwardEvent[] = [
  { id: 'golden-globes-2026', name: 'Golden Globes', date: 'Jan 11, 2026', status: 'completed', icon: '🏆' },
  { id: 'baftas-2026', name: 'BAFTA Awards', date: 'Feb 15, 2026', status: 'upcoming', icon: '🎭' },
  { id: 'sag-2026', name: 'SAG Awards', date: 'Feb 22, 2026', status: 'upcoming', icon: '👥' },
  { id: 'oscars-2026', name: 'The Oscars', date: 'Mar 15, 2026', status: 'open', icon: '✨' }
];

export const GOLDEN_GLOBES_2026_DEADLINE = new Date('2026-01-11T14:59:00-08:00'); // Jan 11, 2026 2:59 PM PT
export const OSCARS_2026_DEADLINE = new Date('2026-03-15T17:00:00-08:00'); // Mar 15, 2026 5:00 PM PT

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

export const OSCAR_CATEGORIES_2026 = [
  {
    id: 'best-picture',
    name: 'Best Picture',
    basePoints: 50,
    nominees: [
      { id: 'bugonia', name: 'Bugonia' },
      { id: 'f1', name: 'F1' },
      { id: 'frankenstein', name: 'Frankenstein' },
      { id: 'hamnet', name: 'Hamnet' },
      { id: 'marty-supreme', name: 'Marty Supreme' },
      { id: 'one-battle', name: 'One Battle After Another' },
      { id: 'secret-agent', name: 'The Secret Agent' },
      { id: 'sentimental-value', name: 'Sentimental Value' },
      { id: 'sinners', name: 'Sinners' },
      { id: 'train-dreams', name: 'Train Dreams' }
    ]
  },
  {
    id: 'actress-leading',
    name: 'Actress In A Leading Role',
    basePoints: 40,
    nominees: [
      { id: 'jessie-buckley', name: 'Jessie Buckley' },
      { id: 'rose-byrne', name: 'Rose Byrne' },
      { id: 'kate-hudson', name: 'Kate Hudson' },
      { id: 'renate-reinsve', name: 'Renate Reinsve' },
      { id: 'emma-stone', name: 'Emma Stone' }
    ]
  },
  {
    id: 'actor-leading',
    name: 'Actor In A Leading Role',
    basePoints: 40,
    nominees: [
      { id: 'timothee-chalamet', name: 'Timothée Chalamet' },
      { id: 'leonardo-dicaprio', name: 'Leonardo DiCaprio' },
      { id: 'ethan-hawke', name: 'Ethan Hawke' },
      { id: 'michael-b-jordan', name: 'Michael B. Jordan' },
      { id: 'wagner-moura', name: 'Wagner Moura' }
    ]
  },
  {
    id: 'actress-supporting',
    name: 'Actress In A Supporting Role',
    basePoints: 30,
    nominees: [
      { id: 'elle-fanning', name: 'Elle Fanning' },
      { id: 'inga-ibsdotter-lilleaas', name: 'Inga Ibsdotter Lilleaas' },
      { id: 'amy-madigan', name: 'Amy Madigan' },
      { id: 'wunmi-mosaku', name: 'Wunmi Mosaku' },
      { id: 'teyana-taylor', name: 'Teyana Taylor' }
    ]
  },
  {
    id: 'actor-supporting',
    name: 'Actor In A Supporting Role',
    basePoints: 30,
    nominees: [
      { id: 'benicio-del-toro', name: 'Benicio Del Toro' },
      { id: 'jacob-elordi', name: 'Jacob Elordi' },
      { id: 'delroy-lindo', name: 'Delroy Lindo' },
      { id: 'sean-penn', name: 'Sean Penn' },
      { id: 'stellan-skarsgard', name: 'Stellan Skarsgård' }
    ]
  },
  {
    id: 'directing',
    name: 'Directing',
    basePoints: 40,
    nominees: [
      { id: 'chloe-zhao', name: 'Chloé Zhao' },
      { id: 'josh-safdie', name: 'Josh Safdie' },
      { id: 'paul-thomas-anderson', name: 'Paul Thomas Anderson' },
      { id: 'joachim-trier', name: 'Joachim Trier' },
      { id: 'ryan-coogler', name: 'Ryan Coogler' }
    ]
  },
  {
    id: 'original-screenplay',
    name: 'Writing (Original Screenplay)',
    basePoints: 30,
    nominees: [
      { id: 'robert-kaplow', name: 'Robert Kaplow' },
      { id: 'jafar-panahi', name: 'Jafar Panahi' },
      { id: 'ronald-bronstein-josh-safdie', name: 'Ronald Bronstein & Josh Safdie' },
      { id: 'eskil-vogt-joachim-trier', name: 'Eskil Vogt, Joachim Trier' },
      { id: 'ryan-coogler', name: 'Ryan Coogler' }
    ]
  },
  {
    id: 'adapted-screenplay',
    name: 'Writing (Adapted Screenplay)',
    basePoints: 30,
    nominees: [
      { id: 'will-tracy', name: 'Will Tracy' },
      { id: 'guillermo-del-toro', name: 'Guillermo del Toro' },
      { id: 'chloe-zhao-maggie-ofarrell', name: 'Chloé Zhao & Maggie O\'Farrell' },
      { id: 'paul-thomas-anderson', name: 'Paul Thomas Anderson' },
      { id: 'clint-bentley-greg-kwedar', name: 'Clint Bentley & Greg Kwedar' }
    ]
  },
  {
    id: 'international-feature',
    name: 'International Feature Film',
    basePoints: 20,
    nominees: [
      { id: 'secret-agent-intl', name: 'The Secret Agent (Brazil)' },
      { id: 'accident-intl', name: 'It Was Just an Accident (France)' },
      { id: 'sentimental-value-intl', name: 'Sentimental Value (Norway)' },
      { id: 'sirat-intl', name: 'Sirāt (Spain)' },
      { id: 'voice-hind-rajab', name: 'The Voice of Hind Rajab (Tunisia)' }
    ]
  },
  {
    id: 'animated-feature',
    name: 'Animated Feature Film',
    basePoints: 20,
    nominees: [
      { id: 'arco', name: 'Arco' },
      { id: 'elio', name: 'Elio' },
      { id: 'kpop-demon-hunters', name: 'KPop Demon Hunters' },
      { id: 'little-amelie', name: 'Little Amélie or the Character of Rain' },
      { id: 'zootopia-2', name: 'Zootopia 2' }
    ]
  },
  {
    id: 'documentary-feature',
    name: 'Documentary Feature Film',
    basePoints: 20,
    nominees: [
      { id: 'alabama-solution', name: 'The Alabama Solution' },
      { id: 'come-see-me', name: 'Come See Me in the Good Light' },
      { id: 'cutting-through-rocks', name: 'Cutting Through Rocks' },
      { id: 'mr-nobody-putin', name: 'Mr. Nobody against Putin' },
      { id: 'perfect-neighbor', name: 'The Perfect Neighbor' }
    ]
  },
  {
    id: 'original-score',
    name: 'Music (Original Score)',
    basePoints: 20,
    nominees: [
      { id: 'jerskin-fendrix', name: 'Jerskin Fendrix (Bugonia)' },
      { id: 'alexandre-desplat', name: 'Alexandre Desplat (Frankenstein)' },
      { id: 'max-richter', name: 'Max Richter (Hamnet)' },
      { id: 'jonny-greenwood', name: 'Jonny Greenwood (One Battle After Another)' },
      { id: 'ludwig-goransson', name: 'Ludwig Göransson (Sinners)' }
    ]
  },
  {
    id: 'original-song',
    name: 'Music (Original Song)',
    basePoints: 20,
    nominees: [
      { id: 'dear-me', name: '"Dear Me" from Diane Warren: Relentless' },
      { id: 'golden', name: '"Golden" from KPop Demon Hunters' },
      { id: 'lied-to-you', name: '"I Lied To You" from Sinners' },
      { id: 'sweet-dreams', name: '"Sweet Dreams Of Joy" from Viva Verdi!' },
      { id: 'train-dreams-song', name: '"Train Dreams" from Train Dreams' }
    ]
  },
  {
    id: 'casting',
    name: 'Casting',
    basePoints: 15,
    nominees: [
      { id: 'nina-gold', name: 'Nina Gold (Hamnet)' },
      { id: 'jennifer-venditti', name: 'Jennifer Venditti (Marty Supreme)' },
      { id: 'cassandra-kulukundis', name: 'Cassandra Kulukundis (One Battle After Another)' },
      { id: 'gabriel-domingues', name: 'Gabriel Domingues (The Secret Agent)' },
      { id: 'francine-maisler', name: 'Francine Maisler (Sinners)' }
    ]
  },
  {
    id: 'cinematography',
    name: 'Cinematography',
    basePoints: 25,
    nominees: [
      { id: 'dan-laustsen', name: 'Dan Laustsen (Frankenstein)' },
      { id: 'darius-khondji', name: 'Darius Khondji (Marty Supreme)' },
      { id: 'michael-bauman', name: 'Michael Bauman (One Battle After Another)' },
      { id: 'autumn-durald', name: 'Autumn Durald Arkapaw (Sinners)' },
      { id: 'adolpho-veloso', name: 'Adolpho Veloso (Train Dreams)' }
    ]
  },
  {
    id: 'film-editing',
    name: 'Film Editing',
    basePoints: 25,
    nominees: [
      { id: 'stephen-mirrione', name: 'Stephen Mirrione (F1)' },
      { id: 'ronald-bronstein-josh-safdie-edit', name: 'Ronald Bronstein and Josh Safdie (Marty Supreme)' },
      { id: 'andy-jurgensen', name: 'Andy Jurgensen (One Battle After Another)' },
      { id: 'olivier-bugge', name: 'Olivier Bugge Coutté (Sentimental Value)' },
      { id: 'michael-shawver', name: 'Michael P. Shawver (Sinners)' }
    ]
  },
  {
    id: 'costume-design',
    name: 'Costume Design',
    basePoints: 20,
    nominees: [
      { id: 'deborah-scott', name: 'Deborah L. Scott (Avatar: Fire and Ash)' },
      { id: 'kate-hawley', name: 'Kate Hawley (Frankenstein)' },
      { id: 'malgosia-turzanska', name: 'Malgosia Turzanska (Hamnet)' },
      { id: 'miyako-bellizzi', name: 'Miyako Bellizzi (Marty Supreme)' },
      { id: 'ruth-carter', name: 'Ruth E. Carter (Sinners)' }
    ]
  },
  {
    id: 'production-design',
    name: 'Production Design',
    basePoints: 20,
    nominees: [
      { id: 'adam-somner', name: 'Adam Somner (One Battle After Another)' },
      { id: 'chris-welcker', name: 'Chris Welcker (Sinners)' },
      { id: 'amanda-villavieja', name: 'Amanda Villavieja (Sirāt)' }
    ]
  },
  {
    id: 'makeup-hairstyling',
    name: 'Makeup And Hairstyling',
    basePoints: 15,
    nominees: [
      { id: 'oscar-nominees-makeup', name: 'Oscar Nominees (TBA)' }
    ]
  },
  {
    id: 'sound',
    name: 'Sound',
    basePoints: 20,
    nominees: [
      { id: 'jose-antonio-garcia', name: 'José Antonio García, Christopher Scarabosio and Tony Villaflor (One Battle After Another)' },
      { id: 'sinners-sound', name: 'Chris Welcker, Benjamin A. Burtt, Felipe Pacheco, Brandon Proctor and Steve Boeddeker (Sinners)' },
      { id: 'sirat-sound', name: 'Amanda Villavieja, Laia Casanovas and Yasmina Praderas (Sirāt)' }
    ]
  },
  {
    id: 'visual-effects',
    name: 'Visual Effects',
    basePoints: 25,
    nominees: [
      { id: 'avatar-fire-ash', name: 'Joe Letteri, Richard Baneham, Eric Saindon and Daniel Barrett (Avatar: Fire and Ash)' },
      { id: 'f1-vfx', name: 'Ryan Tudhope, Nicolas Chevallier, Robert Harrington and Keith Dawson (F1)' },
      { id: 'jurassic-world-rebirth', name: 'David Vickery, Stephen Aplin, Charmaine Chan and Neil Corbould (Jurassic World Rebirth)' },
      { id: 'lost-bus', name: 'Charlie Noble, David Zaretti, Russell Bowen and Brandon K. McLaughlin (The Lost Bus)' },
      { id: 'sinners-vfx', name: 'Michael Ralla, Espen Nordahl, Guido Wolter and Donnie Dean (Sinners)' }
    ]
  },
  {
    id: 'live-action-short',
    name: 'Live Action Short Film',
    basePoints: 10,
    nominees: [
      { id: 'butchers-stain', name: 'Butcher\'s Stain' },
      { id: 'friend-dorothy', name: 'A Friend of Dorothy' },
      { id: 'jane-austen', name: 'Jane Austen\'s Period Drama' },
      { id: 'singers', name: 'The Singers' },
      { id: 'two-people', name: 'Two People Exchanging Saliva' }
    ]
  },
  {
    id: 'documentary-short',
    name: 'Documentary Short Film',
    basePoints: 10,
    nominees: [
      { id: 'empty-rooms', name: '"All the Empty Rooms"' },
      { id: 'armed-camera', name: 'Armed Only with a Camera: The Life and Death of Brent Renaud' },
      { id: 'children-no-more', name: '"Children No More: Were and Are Gone"' },
      { id: 'devil-busy', name: '"The Devil Is Busy"' },
      { id: 'perfectly-strangeness', name: 'Perfectly a Strangeness' }
    ]
  },
  {
    id: 'animated-short',
    name: 'Animated Short Film',
    basePoints: 10,
    nominees: [
      { id: 'butterfly', name: 'Butterfly' },
      { id: 'forevergreen', name: 'Forevergreen' },
      { id: 'girl-cried-pearls', name: 'The Girl Who Cried Pearls' },
      { id: 'retirement-plan', name: 'Retirement Plan' },
      { id: 'three-sisters', name: 'The Three Sisters' }
    ]
  }
];

// Map award show IDs to their categories
export const AWARD_SHOW_CATEGORIES: Record<string, any[]> = {
  'golden-globes-2026': CATEGORIES,
  'oscars-2026': OSCAR_CATEGORIES_2026,
  'baftas-2026': [], // To be added when nominations are announced
  'sag-2026': [] // To be added when nominations are announced
};

export const MOCK_LEAGUE_MEMBERS = [
  { id: 'sarah-123', displayName: 'SarahScreens', avatar: '🎬', totalScore: 350 },
  { id: 'emily-456', displayName: 'EmilyOscar', avatar: '🎭', totalScore: 300 },
  { id: 'jake-789', displayName: 'JakeFromStateFarm', avatar: '🍿', totalScore: 200 }
];