export interface AwardEvent {
  id: string;
  name: string;
  date: string;
  status: 'open' | 'locked' | 'upcoming' | 'completed';
  icon: string;
}

export const SEASON_CIRCUIT: AwardEvent[] = [
  { id: 'golden-globes-2026', name: 'Golden Globes', date: 'Jan 11, 2026', status: 'completed', icon: '🏆' },
  { id: 'baftas-2026', name: 'BAFTA Awards', date: 'Feb 22, 2026', status: 'open', icon: '🎭' },
  { id: 'sag-2026', name: 'SAG Awards', date: 'Mar 1, 2026', status: 'open', icon: '👥' },
  { id: 'oscars-2026', name: 'The Oscars', date: 'Mar 15, 2026', status: 'open', icon: '✨' }
];

export const GOLDEN_GLOBES_2026_DEADLINE = new Date('2026-01-11T14:59:00-08:00'); // Jan 11, 2026 2:59 PM PT
export const BAFTAS_2026_DEADLINE = new Date('2026-02-22T17:00:00-00:00'); // Feb 22, 2026 5:00 PM GMT (BAFTAs are in London)
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

export const BAFTA_CATEGORIES_2026 = [
  {
    id: 'best-film',
    name: 'Best Film',
    basePoints: 50,
    nominees: [
      { id: 'hamnet', name: 'Hamnet' },
      { id: 'marty-supreme', name: 'Marty Supreme' },
      { id: 'one-battle', name: 'One Battle After Another' },
      { id: 'sentimental-value', name: 'Sentimental Value' },
      { id: 'sinners', name: 'Sinners' }
    ]
  },
  {
    id: 'outstanding-british-film',
    name: 'Outstanding British Film',
    basePoints: 40,
    nominees: [
      { id: '28-years-later', name: '28 Years Later' },
      { id: 'ballad-of-wallis-island', name: 'The Ballad of Wallis Island' },
      { id: 'bridget-jones', name: 'Bridget Jones: Mad about the Boy' },
      { id: 'die-my-love', name: 'Die My Love' },
      { id: 'h-is-for-hawk', name: 'H Is For Hawk' },
      { id: 'hamnet-british', name: 'Hamnet' },
      { id: 'i-swear', name: 'I Swear' },
      { id: 'mr-burton', name: 'Mr Burton' },
      { id: 'pillion', name: 'Pillion' },
      { id: 'steve', name: 'Steve' }
    ]
  },
  {
    id: 'leading-actress',
    name: 'Leading Actress',
    basePoints: 40,
    nominees: [
      { id: 'jessie-buckley-bafta', name: 'Jessie Buckley - Hamnet' },
      { id: 'rose-byrne-bafta', name: 'Rose Byrne - If I Had Legs I\'d Kick You' },
      { id: 'kate-hudson-bafta', name: 'Kate Hudson - Song Sung Blue' },
      { id: 'chase-infiniti-bafta', name: 'Chase Infiniti - One Battle After Another' },
      { id: 'renate-reinsve-bafta', name: 'Renate Reinsve - Sentimental Value' },
      { id: 'emma-stone-bafta', name: 'Emma Stone - Bugonia' }
    ]
  },
  {
    id: 'leading-actor',
    name: 'Leading Actor',
    basePoints: 40,
    nominees: [
      { id: 'robert-aramayo', name: 'Robert Aramayo - I Swear' },
      { id: 'timothee-chalamet-bafta', name: 'Timothée Chalamet - Marty Supreme' },
      { id: 'leonardo-dicaprio-bafta', name: 'Leonardo DiCaprio - One Battle After Another' },
      { id: 'ethan-hawke-bafta', name: 'Ethan Hawke - Blue Moon' },
      { id: 'michael-b-jordan-bafta', name: 'Michael B Jordan - Sinners' },
      { id: 'jesse-plemons-bafta', name: 'Jesse Plemons - Bugonia' }
    ]
  },
  {
    id: 'supporting-actress',
    name: 'Supporting Actress',
    basePoints: 30,
    nominees: [
      { id: 'odessa-azion', name: 'Odessa A\'zion - Marty Supreme' },
      { id: 'inga-ibsdotter-lilleaas-bafta', name: 'Inga Ibsdotter Lilleaas - Sentimental Value' },
      { id: 'wunmi-mosaku-bafta', name: 'Wunmi Mosaku - Sinners' },
      { id: 'carey-mulligan', name: 'Carey Mulligan - The Ballad of Wallis Island' },
      { id: 'teyana-taylor-bafta', name: 'Teyana Taylor - One Battle After Another' },
      { id: 'emily-watson', name: 'Emily Watson - Hamnet' }
    ]
  },
  {
    id: 'supporting-actor',
    name: 'Supporting Actor',
    basePoints: 30,
    nominees: [
      { id: 'benicio-del-toro-bafta', name: 'Benicio del Toro - One Battle After Another' },
      { id: 'jacob-elordi-bafta', name: 'Jacob Elordi - Frankenstein' },
      { id: 'paul-mescal', name: 'Paul Mescal - Hamnet' },
      { id: 'peter-mullan', name: 'Peter Mullan - I Swear' },
      { id: 'sean-penn-bafta', name: 'Sean Penn - One Battle After Another' },
      { id: 'stellan-skarsgard-bafta', name: 'Stellan Skarsgård - Sentimental Value' }
    ]
  },
  {
    id: 'director-bafta',
    name: 'Director',
    basePoints: 40,
    nominees: [
      { id: 'yorgos-lanthimos', name: 'Bugonia - Yorgos Lanthimos' },
      { id: 'chloe-zhao-bafta', name: 'Hamnet - Chloé Zhao' },
      { id: 'josh-safdie-bafta', name: 'Marty Supreme - Josh Safdie' },
      { id: 'paul-thomas-anderson-bafta', name: 'One Battle After Another - Paul Thomas Anderson' },
      { id: 'joachim-trier-bafta', name: 'Sentimental Value - Joachim Trier' },
      { id: 'ryan-coogler-bafta', name: 'Sinners - Ryan Coogler' }
    ]
  },
  {
    id: 'outstanding-debut',
    name: 'Outstanding Debut by a British Writer, Director or Producer',
    basePoints: 20,
    nominees: [
      { id: 'ceremony', name: 'The Ceremony' },
      { id: 'my-fathers-shadow', name: 'My Father\'s Shadow' },
      { id: 'pillion-debut', name: 'Pillion' },
      { id: 'a-want-in-her', name: 'A Want In Her' },
      { id: 'wasteman', name: 'Wasteman' }
    ]
  },
  {
    id: 'film-not-english',
    name: 'Film Not in the English Language',
    basePoints: 20,
    nominees: [
      { id: 'it-was-just-an-accident-bafta', name: 'It Was Just An Accident' },
      { id: 'the-secret-agent-bafta', name: 'The Secret Agent' },
      { id: 'sentimental-value-bafta', name: 'Sentimental Value' },
      { id: 'sirat', name: 'Sirât' },
      { id: 'the-voice-of-hind-rajab', name: 'The Voice of Hind Rajab' }
    ]
  },
  {
    id: 'documentary-bafta',
    name: 'Documentary',
    basePoints: 20,
    nominees: [
      { id: '2000-meters-to-andriivka', name: '2000 Meters to Andriivka' },
      { id: 'apocalypse-in-the-tropics', name: 'Apocalypse in the Tropics' },
      { id: 'cover-up', name: 'Cover-Up' },
      { id: 'mr-nobody-against-putin', name: 'Mr Nobody Against Putin' },
      { id: 'the-perfect-neighbor-bafta', name: 'The Perfect Neighbor' }
    ]
  },
  {
    id: 'animated-film',
    name: 'Animated Film',
    basePoints: 20,
    nominees: [
      { id: 'elio-bafta', name: 'Elio' },
      { id: 'little-amelie-bafta', name: 'Little Amélie' },
      { id: 'zootropolis-2', name: 'Zootropolis 2' }
    ]
  },
  {
    id: 'childrens-family-film',
    name: 'Children\'s & Family Film',
    basePoints: 15,
    nominees: [
      { id: 'arco-bafta', name: 'Arco' },
      { id: 'boong', name: 'Boong' },
      { id: 'lilo-stitch', name: 'Lilo & Stitch' },
      { id: 'zootropolis-2-family', name: 'Zootropolis 2' }
    ]
  },
  {
    id: 'original-screenplay-bafta',
    name: 'Original Screenplay',
    basePoints: 30,
    nominees: [
      { id: 'i-swear-screenplay', name: 'I Swear' },
      { id: 'marty-supreme-screenplay', name: 'Marty Supreme' },
      { id: 'the-secret-agent-screenplay', name: 'The Secret Agent' },
      { id: 'sentimental-value-screenplay', name: 'Sentimental Value' },
      { id: 'sinners-screenplay', name: 'Sinners' }
    ]
  },
  {
    id: 'adapted-screenplay-bafta',
    name: 'Adapted Screenplay',
    basePoints: 30,
    nominees: [
      { id: 'ballad-of-wallis-island-screenplay', name: 'The Ballad of Wallis Island' },
      { id: 'bugonia-screenplay', name: 'Bugonia' },
      { id: 'hamnet-screenplay', name: 'Hamnet' },
      { id: 'one-battle-screenplay', name: 'One Battle After Another' },
      { id: 'pillion-screenplay', name: 'Pillion' }
    ]
  },
  {
    id: 'ee-rising-star',
    name: 'EE BAFTA Rising Star Award (Voted for by the Public)',
    basePoints: 15,
    nominees: [
      { id: 'robert-aramayo-star', name: 'Robert Aramayo' },
      { id: 'miles-caton', name: 'Miles Caton' },
      { id: 'chase-infiniti-star', name: 'Chase Infiniti' },
      { id: 'archie-madekwe', name: 'Archie Madekwe' },
      { id: 'posy-sterling', name: 'Posy Sterling' }
    ]
  },
  {
    id: 'original-score-bafta',
    name: 'Original Score',
    basePoints: 20,
    nominees: [
      { id: 'bugonia-score', name: 'Bugonia - Jerskin Fendrix' },
      { id: 'frankenstein-score', name: 'Frankenstein - Alexandre Desplat' },
      { id: 'hamnet-score', name: 'Hamnet - Max Richter' },
      { id: 'one-battle-score', name: 'One Battle After Another - Jonny Greenwood' },
      { id: 'sinners-score', name: 'Sinners - Ludwig Göransson' }
    ]
  },
  {
    id: 'casting-bafta',
    name: 'Casting',
    basePoints: 15,
    nominees: [
      { id: 'i-swear-casting', name: 'I Swear' },
      { id: 'marty-supreme-casting', name: 'Marty Supreme' },
      { id: 'one-battle-casting', name: 'One Battle After Another' },
      { id: 'sentimental-value-casting', name: 'Sentimental Value' },
      { id: 'sinners-casting', name: 'Sinners' }
    ]
  },
  {
    id: 'cinematography-bafta',
    name: 'Cinematography',
    basePoints: 25,
    nominees: [
      { id: 'frankenstein-cinematography', name: 'Frankenstein' },
      { id: 'marty-supreme-cinematography', name: 'Marty Supreme' },
      { id: 'one-battle-cinematography', name: 'One Battle After Another' },
      { id: 'sinners-cinematography', name: 'Sinners' },
      { id: 'train-dreams-cinematography', name: 'Train Dreams' }
    ]
  },
  {
    id: 'costume-design-bafta',
    name: 'Costume Design',
    basePoints: 20,
    nominees: [
      { id: 'frankenstein-costume', name: 'Frankenstein' },
      { id: 'hamnet-costume', name: 'Hamnet' },
      { id: 'marty-supreme-costume', name: 'Marty Supreme' },
      { id: 'sinners-costume', name: 'Sinners' },
      { id: 'wicked-costume', name: 'Wicked: For Good' }
    ]
  },
  {
    id: 'editing-bafta',
    name: 'Editing',
    basePoints: 25,
    nominees: [
      { id: 'f1-editing', name: 'F1' },
      { id: 'house-of-dynamite', name: 'A House of Dynamite' },
      { id: 'marty-supreme-editing', name: 'Marty Supreme' },
      { id: 'one-battle-editing', name: 'One Battle After Another' },
      { id: 'sinners-editing', name: 'Sinners' }
    ]
  },
  {
    id: 'production-design-bafta',
    name: 'Production Design',
    basePoints: 20,
    nominees: [
      { id: 'frankenstein-production', name: 'Frankenstein' },
      { id: 'hamnet-production', name: 'Hamnet' },
      { id: 'marty-supreme-production', name: 'Marty Supreme' },
      { id: 'one-battle-production', name: 'One Battle After Another' },
      { id: 'sinners-production', name: 'Sinners' }
    ]
  },
  {
    id: 'makeup-hair-bafta',
    name: 'Make Up & Hair',
    basePoints: 15,
    nominees: [
      { id: 'frankenstein-makeup', name: 'Frankenstein' },
      { id: 'hamnet-makeup', name: 'Hamnet' },
      { id: 'marty-supreme-makeup', name: 'Marty Supreme' },
      { id: 'sinners-makeup', name: 'Sinners' },
      { id: 'wicked-makeup', name: 'Wicked: For Good' }
    ]
  },
  {
    id: 'sound-bafta',
    name: 'Sound',
    basePoints: 20,
    nominees: [
      { id: 'f1-sound', name: 'F1' },
      { id: 'frankenstein-sound', name: 'Frankenstein' },
      { id: 'one-battle-sound', name: 'One Battle After Another' },
      { id: 'sinners-sound', name: 'Sinners' },
      { id: 'warfare', name: 'Warfare' }
    ]
  },
  {
    id: 'special-visual-effects-bafta',
    name: 'Special Visual Effects',
    basePoints: 25,
    nominees: [
      { id: 'avatar-fire-ash-bafta', name: 'Avatar: Fire and Ash' },
      { id: 'f1-effects', name: 'F1' },
      { id: 'frankenstein-effects', name: 'Frankenstein' },
      { id: 'how-to-train-dragon', name: 'How to Train Your Dragon' },
      { id: 'lost-bus', name: 'The Lost Bus' }
    ]
  },
  {
    id: 'british-short-film',
    name: 'British Short Film',
    basePoints: 10,
    nominees: [
      { id: 'magid-zafar', name: 'Magid / Zafar' },
      { id: 'nostalgie', name: 'Nostalgie' },
      { id: 'terence', name: 'Terence' },
      { id: 'this-is-endometriosis', name: 'This Is Endometriosis' },
      { id: 'welcome-home-freckles', name: 'Welcome Home Freckles' }
    ]
  },
  {
    id: 'british-short-animation',
    name: 'British Short Animation',
    basePoints: 10,
    nominees: [
      { id: 'cardboard', name: 'Cardboard' },
      { id: 'solstice', name: 'Solstice' },
      { id: 'two-black-boys', name: 'Two Black Boys in Paradise' }
    ]
  }
];

export const SAG_CATEGORIES_2026 = [
  {
    id: 'lead-actor-film',
    name: 'Outstanding Performance by a Male Actor in a Leading Role',
    basePoints: 40,
    nominees: [
      { id: 'adrien-brody-brutalist', name: 'Adrien Brody — The Brutalist' },
      { id: 'timothee-chalamet-complete-unknown', name: 'Timothée Chalamet — A Complete Unknown' },
      { id: 'daniel-craig-queer', name: 'Daniel Craig — Queer' },
      { id: 'colman-domingo-sing-sing', name: 'Colman Domingo — Sing Sing' },
      { id: 'ralph-fiennes-conclave', name: 'Ralph Fiennes — Conclave' }
    ]
  },
  {
    id: 'lead-actress-film',
    name: 'Outstanding Performance by a Female Actor in a Leading Role',
    basePoints: 40,
    nominees: [
      { id: 'pamela-anderson-last-showgirl', name: 'Pamela Anderson — The Last Showgirl' },
      { id: 'cynthia-erivo-wicked', name: 'Cynthia Erivo — Wicked' },
      { id: 'karla-sofia-gascon-emilia-perez', name: 'Karla Sofía Gascón — Emilia Pérez' },
      { id: 'mikey-madison-anora', name: 'Mikey Madison — Anora' },
      { id: 'demi-moore-substance', name: 'Demi Moore — The Substance' }
    ]
  },
  {
    id: 'supporting-actor-film',
    name: 'Outstanding Performance by a Male Actor in a Supporting Role',
    basePoints: 30,
    nominees: [
      { id: 'jonathan-bailey-wicked', name: 'Jonathan Bailey — Wicked' },
      { id: 'yura-borisov-anora', name: 'Yura Borisov — Anora' },
      { id: 'kieran-culkin-a-real-pain', name: 'Kieran Culkin — A Real Pain' },
      { id: 'edward-norton-complete-unknown', name: 'Edward Norton — A Complete Unknown' },
      { id: 'jeremy-strong-apprentice', name: 'Jeremy Strong — The Apprentice' }
    ]
  },
  {
    id: 'supporting-actress-film',
    name: 'Outstanding Performance by a Female Actor in a Supporting Role',
    basePoints: 30,
    nominees: [
      { id: 'monica-barbaro-complete-unknown', name: 'Monica Barbaro — A Complete Unknown' },
      { id: 'jamie-lee-curtis-last-showgirl', name: 'Jamie Lee Curtis — The Last Showgirl' },
      { id: 'danielle-deadwyler-piano-lesson', name: 'Danielle Deadwyler — The Piano Lesson' },
      { id: 'ariana-grande-wicked', name: 'Ariana Grande — Wicked' },
      { id: 'zoe-saldana-emilia-perez', name: 'Zoe Saldaña — Emilia Pérez' }
    ]
  },
  {
    id: 'cast-film',
    name: 'Outstanding Performance by a Cast in a Motion Picture',
    basePoints: 50,
    nominees: [
      { id: 'a-complete-unknown-cast', name: 'A Complete Unknown' },
      { id: 'anora-cast', name: 'Anora' },
      { id: 'conclave-cast', name: 'Conclave' },
      { id: 'emilia-perez-cast', name: 'Emilia Pérez' },
      { id: 'wicked-cast', name: 'Wicked' }
    ]
  },
  {
    id: 'male-actor-drama-series',
    name: 'Outstanding Performance by a Male Actor in a Drama Series',
    basePoints: 30,
    nominees: [
      { id: 'tadanobu-asano-shogun', name: 'Tadanobu Asano — Shōgun' },
      { id: 'jeff-bridges-the-old-man', name: 'Jeff Bridges — The Old Man' },
      { id: 'gary-oldman-slow-horses', name: 'Gary Oldman — Slow Horses' },
      { id: 'eddie-redmayne-day-of-jackal', name: 'Eddie Redmayne — The Day of the Jackal' },
      { id: 'hiroyuki-sanada-shogun', name: 'Hiroyuki Sanada — Shōgun' }
    ]
  },
  {
    id: 'female-actor-drama-series',
    name: 'Outstanding Performance by a Female Actor in a Drama Series',
    basePoints: 30,
    nominees: [
      { id: 'kathy-bates-matlock', name: 'Kathy Bates — Matlock' },
      { id: 'nicola-coughlan-bridgerton', name: 'Nicola Coughlan — Bridgerton' },
      { id: 'allison-janney-diplomat', name: 'Allison Janney — The Diplomat' },
      { id: 'keri-russell-diplomat', name: 'Keri Russell — The Diplomat' },
      { id: 'anna-sawai-shogun', name: 'Anna Sawai — Shōgun' }
    ]
  },
  {
    id: 'male-actor-comedy-series',
    name: 'Outstanding Performance by a Male Actor in a Comedy Series',
    basePoints: 30,
    nominees: [
      { id: 'adam-brody-nobody-wants', name: 'Adam Brody — Nobody Wants This' },
      { id: 'ted-danson-man-on-inside', name: 'Ted Danson — A Man on the Inside' },
      { id: 'harrison-ford-shrinking', name: 'Harrison Ford — Shrinking' },
      { id: 'martin-short-only-murders', name: 'Martin Short — Only Murders in the Building' },
      { id: 'jeremy-allen-white-bear', name: 'Jeremy Allen White — The Bear' }
    ]
  },
  {
    id: 'female-actor-comedy-series',
    name: 'Outstanding Performance by a Female Actor in a Comedy Series',
    basePoints: 30,
    nominees: [
      { id: 'kristen-bell-nobody-wants', name: 'Kristen Bell — Nobody Wants This' },
      { id: 'quinta-brunson-abbott', name: 'Quinta Brunson — Abbott Elementary' },
      { id: 'liza-colon-zayas-bear', name: 'Liza Colón-Zayas — The Bear' },
      { id: 'ayo-edebiri-bear', name: 'Ayo Edebiri — The Bear' },
      { id: 'jean-smart-hacks', name: 'Jean Smart — Hacks' }
    ]
  },
  {
    id: 'ensemble-drama-series',
    name: 'Outstanding Performance by an Ensemble in a Drama Series',
    basePoints: 40,
    nominees: [
      { id: 'bridgerton-ensemble', name: 'Bridgerton' },
      { id: 'day-of-jackal-ensemble', name: 'The Day of the Jackal' },
      { id: 'diplomat-ensemble', name: 'The Diplomat' },
      { id: 'shogun-ensemble', name: 'Shōgun' },
      { id: 'slow-horses-ensemble', name: 'Slow Horses' }
    ]
  }
];

// Map award show IDs to their categories
export const AWARD_SHOW_CATEGORIES: Record<string, any[]> = {
  'golden-globes-2026': CATEGORIES,
  'oscars-2026': OSCAR_CATEGORIES_2026,
  'baftas-2026': BAFTA_CATEGORIES_2026,
  'sag-2026': SAG_CATEGORIES_2026
};

export const MOCK_LEAGUE_MEMBERS = [
  { id: 'sarah-123', displayName: 'SarahScreens', avatar: '🎬', totalScore: 350 },
  { id: 'emily-456', displayName: 'EmilyOscar', avatar: '🎭', totalScore: 300 },
  { id: 'jake-789', displayName: 'JakeFromStateFarm', avatar: '🍿', totalScore: 200 }
];
