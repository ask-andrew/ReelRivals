// Main award categories - streamlined to 10 key categories
export const MAIN_OSCAR_CATEGORIES = [
  {
    id: 'best-picture',
    name: 'Best Picture',
    basePoints: 50,
    emoji: '🏆',
    nominees: [
      { id: 'bugonia', name: 'Bugonia', tmdb_id: "" },
      { id: 'f1', name: 'F1', tmdb_id: "" },
      { id: 'frankenstein', name: 'Frankenstein', tmdb_id: "" },
      { id: 'hamnet', name: 'Hamnet', tmdb_id: "" },
      { id: 'marty-supreme', name: 'Marty Supreme', tmdb_id: "" },
      { id: 'one-battle-after-another', name: 'One Battle After Another', tmdb_id: "" },
      { id: 'the-secret-agent', name: 'The Secret Agent', tmdb_id: "" },
      { id: 'sentimental-value', name: 'Sentimental Value', tmdb_id: "" },
      { id: 'sinners', name: 'Sinners', tmdb_id: "" },
      { id: 'train-dreams', name: 'Train Dreams', tmdb_id: "" }
    ]
  },
  {
    id: 'best-director',
    name: 'Directing',
    basePoints: 40,
    emoji: '🎬',
    nominees: [
      { id: 'chloe-zhao-hamnet', name: 'Chloé Zhao — Hamnet', tmdb_id: "" },
      { id: 'josh-safdie-marty-supreme', name: 'Josh Safdie — Marty Supreme', tmdb_id: "" },
      { id: 'pta-one-battle-after-another', name: 'Paul Thomas Anderson — One Battle After Another', tmdb_id: "" },
      { id: 'joachim-trier-sentimental-value', name: 'Joachim Trier — Sentimental Value', tmdb_id: "" },
      { id: 'ryan-coogler-sinners', name: 'Ryan Coogler — Sinners', tmdb_id: "" }
    ]
  },
  {
    id: 'best-actor',
    name: 'Actor In A Leading Role',
    basePoints: 30,
    emoji: '👨',
    nominees: [
      { id: 'timothee-chalamet-marty-supreme', name: 'Timothée Chalamet — Marty Supreme', tmdb_id: "" },
      { id: 'leonardo-dicaprio-one-battle-after-another', name: 'Leonardo DiCaprio — One Battle After Another', tmdb_id: "" },
      { id: 'ethan-hawke-blue-moon', name: 'Ethan Hawke — Blue Moon', tmdb_id: "" },
      { id: 'michael-b-jordan-sinners', name: 'Michael B. Jordan — Sinners', tmdb_id: "" },
      { id: 'wagner-moura-secret-agent', name: 'Wagner Moura — The Secret Agent', tmdb_id: "" }
    ]
  },
  {
    id: 'best-actress',
    name: 'Actress In A Leading Role',
    basePoints: 30,
    emoji: '👩',
    nominees: [
      { id: 'jessie-buckley-hamnet', name: 'Jessie Buckley — Hamnet', tmdb_id: "" },
      { id: 'rose-byrne-legs-kick-you', name: 'Rose Byrne — If I Had Legs I\'d Kick You', tmdb_id: "" },
      { id: 'kate-hudson-song-sung-blue', name: 'Kate Hudson — Song Sung Blue', tmdb_id: "" },
      { id: 'renate-reinsve-sentimental-value', name: 'Renate Reinsve — Sentimental Value', tmdb_id: "" },
      { id: 'emma-stone-bugonia', name: 'Emma Stone — Bugonia', tmdb_id: "" }
    ]
  },
  {
    id: 'best-supporting-actor',
    name: 'Actor In A Supporting Role',
    basePoints: 20,
    emoji: '👨‍🎭',
    nominees: [
      { id: 'benicio-del-toro-one-battle-after-another', name: 'Benicio Del Toro — One Battle After Another', tmdb_id: "" },
      { id: 'jacob-elordi-frankenstein', name: 'Jacob Elordi — Frankenstein', tmdb_id: "" },
      { id: 'delroy-lindo-sinners', name: 'Delroy Lindo — Sinners', tmdb_id: "" },
      { id: 'sean-penn-one-battle-after-another', name: 'Sean Penn — One Battle After Another', tmdb_id: "" },
      { id: 'stellan-skarsgard-sentimental-value', name: 'Stellan Skarsgård — Sentimental Value', tmdb_id: "" }
    ]
  },
  {
    id: 'best-supporting-actress',
    name: 'Actress In A Supporting Role',
    basePoints: 20,
    emoji: '👩‍🎭',
    nominees: [
      { id: 'elle-fanning-sentimental-value', name: 'Elle Fanning — Sentimental Value', tmdb_id: "" },
      { id: 'inga-lilleaas-sentimental-value', name: 'Inga Ibsdotter Lilleaas — Sentimental Value', tmdb_id: "" },
      { id: 'amy-madigan-weapons', name: 'Amy Madigan — Weapons', tmdb_id: "" },
      { id: 'wunmi-mosaku-sinners', name: 'Wunmi Mosaku — Sinners', tmdb_id: "" },
      { id: 'teyana-taylor-one-battle-after-another', name: 'Teyana Taylor — One Battle After Another', tmdb_id: "" }
    ]
  },
  {
    id: 'best-original-screenplay',
    name: 'Writing (Original Screenplay)',
    basePoints: 25,
    emoji: '✍️',
    nominees: [
      { id: 'blue-moon-screenplay', name: 'Blue Moon — Robert Kaplow', tmdb_id: "" },
      { id: 'it-was-just-an-accident-screenplay', name: 'It Was Just an Accident — Jafar Panahi', tmdb_id: "" },
      { id: 'marty-supreme-screenplay', name: 'Marty Supreme — Ronald Bronstein & Josh Safdie', tmdb_id: "" },
      { id: 'sentimental-value-screenplay', name: 'Sentimental Value — Eskil Vogt, Joachim Trier', tmdb_id: "" },
      { id: 'sinners-screenplay', name: 'Sinners — Ryan Coogler', tmdb_id: "" }
    ]
  },
  {
    id: 'best-adapted-screenplay',
    name: 'Writing (Adapted Screenplay)',
    basePoints: 25,
    emoji: '📝',
    nominees: [
      { id: 'bugonia-screenplay', name: 'Bugonia — Will Tracy', tmdb_id: "" },
      { id: 'frankenstein-screenplay', name: 'Frankenstein — Guillermo del Toro', tmdb_id: "" },
      { id: 'hamnet-screenplay', name: 'Hamnet — Chloé Zhao & Maggie O\'Farrell', tmdb_id: "" },
      { id: 'one-battle-after-another-screenplay', name: 'One Battle After Another — Paul Thomas Anderson', tmdb_id: "" },
      { id: 'train-dreams-screenplay', name: 'Train Dreams — Clint Bentley & Greg Kwedar', tmdb_id: "" }
    ]
  },
  {
    id: 'best-international-feature',
    name: 'International Feature Film',
    basePoints: 20,
    emoji: '🌍',
    nominees: [
      { id: 'secret-agent-brazil', name: 'The Secret Agent (Brazil)', tmdb_id: "" },
      { id: 'it-was-just-an-accident-france', name: 'It Was Just an Accident (France)', tmdb_id: "" },
      { id: 'sentimental-value-norway', name: 'Sentimental Value (Norway)', tmdb_id: "" },
      { id: 'sirat-spain', name: 'Sirāt (Spain)', tmdb_id: "" },
      { id: 'voice-of-hind-rajab-tunisia', name: 'The Voice of Hind Rajab (Tunisia)', tmdb_id: "" }
    ]
  },
  {
    id: 'best-animated-feature',
    name: 'Animated Feature Film',
    basePoints: 15,
    emoji: '🎨',
    nominees: [
      { id: 'arco-animated', name: 'Arco', tmdb_id: "" },
      { id: 'elio-animated', name: 'Elio', tmdb_id: "" },
      { id: 'kpop-demon-hunters', name: 'KPop Demon Hunters', tmdb_id: "" },
      { id: 'little-amelie', name: 'Little Amélie or the Character of Rain', tmdb_id: "" },
      { id: 'zootopia-2', name: 'Zootopia 2', tmdb_id: "" }
    ]
  }
];

export const MAIN_BAFTA_CATEGORIES = [
  {
    id: 'best-film',
    name: 'Best Film',
    basePoints: 50,
    emoji: '🏆',
    nominees: [
      { id: 'hamnet', name: 'Hamnet', tmdb_id: "" },
      { id: 'marty-supreme', name: 'Marty Supreme', tmdb_id: "" },
      { id: 'one-battle-after-another', name: 'One Battle After Another', tmdb_id: "" },
      { id: 'sentimental-value', name: 'Sentimental Value', tmdb_id: "" },
      { id: 'sinners', name: 'Sinners', tmdb_id: "" }
    ]
  },
  {
    id: 'best-director',
    name: 'Directing',
    basePoints: 40,
    emoji: '🎬',
    nominees: [
      { id: 'ryan-coogler-sinners', name: 'Ryan Coogler — Sinners', tmdb_id: "" },
      { id: 'yorgos-lanthimos-bugonia', name: 'Yorgos Lanthimos — Bugonia', tmdb_id: "" },
      { id: 'josh-safdie-marty-supreme', name: 'Josh Safdie — Marty Supreme', tmdb_id: "" },
      { id: 'pta-one-battle-after-another', name: 'Paul Thomas Anderson — One Battle After Another', tmdb_id: "" },
      { id: 'joachim-trier-sentimental-value', name: 'Joachim Trier — Sentimental Value', tmdb_id: "" },
      { id: 'chloe-zhao-hamnet', name: 'Chloé Zhao — Hamnet', tmdb_id: "" }
    ]
  },
  {
    id: 'best-actor',
    name: 'Leading Actor',
    basePoints: 30,
    emoji: '👨',
    nominees: [
      { id: 'robert-aramayo-i-swear', name: 'Robert Aramayo — I Swear', tmdb_id: "" },
      { id: 'timothee-chalamet-marty-supreme', name: 'Timothée Chalamet — Marty Supreme', tmdb_id: "" },
      { id: 'leonardo-dicaprio-one-battle-after-another', name: 'Leonardo DiCaprio — One Battle After Another', tmdb_id: "" },
      { id: 'ethan-hawke-blue-moon', name: 'Ethan Hawke — Blue Moon', tmdb_id: "" },
      { id: 'michael-b-jordan-sinners', name: 'Michael B. Jordan — Sinners', tmdb_id: "" },
      { id: 'jesse-plemons-bugonia', name: 'Jesse Plemons — Bugonia', tmdb_id: "" }
    ]
  },
  {
    id: 'best-actress',
    name: 'Leading Actress',
    basePoints: 30,
    emoji: '👩',
    nominees: [
      { id: 'jessie-buckley-hamnet', name: 'Jessie Buckley — Hamnet', tmdb_id: "" },
      { id: 'rose-byrne-legs-kick-you', name: 'Rose Byrne — If I Had Legs I\'d Kick You', tmdb_id: "" },
      { id: 'kate-hudson-song-sung-blue', name: 'Kate Hudson — Song Sung Blue', tmdb_id: "" },
      { id: 'chase-infiniti-one-battle-after-another', name: 'Chase Infiniti — One Battle After Another', tmdb_id: "" },
      { id: 'renate-reinsve-sentimental-value', name: 'Renate Reinsve — Sentimental Value', tmdb_id: "" },
      { id: 'emma-stone-bugonia', name: 'Emma Stone — Bugonia', tmdb_id: "" }
    ]
  },
  {
    id: 'best-supporting-actor',
    name: 'Supporting Actor',
    basePoints: 20,
    emoji: '👨‍🎭',
    nominees: [
      { id: 'benicio-del-toro-one-battle-after-another', name: 'Benicio Del Toro — One Battle After Another', tmdb_id: "" },
      { id: 'jacob-elordi-frankenstein', name: 'Jacob Elordi — Frankenstein', tmdb_id: "" },
      { id: 'paul-mescal-hamnet', name: 'Paul Mescal — Hamnet', tmdb_id: "" },
      { id: 'peter-mullan-i-swear', name: 'Peter Mullan — I Swear', tmdb_id: "" },
      { id: 'sean-penn-one-battle-after-another', name: 'Sean Penn — One Battle After Another', tmdb_id: "" },
      { id: 'stellan-skarsgard-sentimental-value', name: 'Stellan Skarsgård — Sentimental Value', tmdb_id: "" }
    ]
  },
  {
    id: 'best-supporting-actress',
    name: 'Supporting Actress',
    basePoints: 20,
    emoji: '👩‍🎭',
    nominees: [
      { id: 'odessa-azion-marty-supreme', name: 'Odessa A’zion — Marty Supreme', tmdb_id: "" },
      { id: 'inga-lilleaas-sentimental-value', name: 'Inga Ibsdotter Lilleaas — Sentimental Value', tmdb_id: "" },
      { id: 'wunmi-mosaku-sinners', name: 'Wunmi Mosaku — Sinners', tmdb_id: "" },
      { id: 'carey-mulligan-wallis-island', name: 'Carey Mulligan — The Ballad of Wallis Island', tmdb_id: "" },
      { id: 'teyana-taylor-one-battle-after-another', name: 'Teyana Taylor — One Battle After Another', tmdb_id: "" },
      { id: 'emily-watson-hamnet', name: 'Emily Watson — Hamnet', tmdb_id: "" }
    ]
  },
  {
    id: 'best-original-screenplay',
    name: 'Original Screenplay',
    basePoints: 25,
    emoji: '✍️',
    nominees: [
      { id: 'i-swear-screenplay', name: 'I Swear — Daniel Ferguson, Tracey Tynan', tmdb_id: "" },
      { id: 'marty-supreme-screenplay', name: 'Marty Supreme — Josh Safdie, Ronald Bronstein', tmdb_id: "" },
      { id: 'secret-agent-screenplay', name: 'The Secret Agent — Kleber Mendonça Filho', tmdb_id: "" },
      { id: 'sentimental-value-screenplay', name: 'Sentimental Value — Joachim Trier, Eskil Vogt', tmdb_id: "" },
      { id: 'sinners-screenplay', name: 'Sinners — Ryan Coogler', tmdb_id: "" }
    ]
  },
  {
    id: 'best-adapted-screenplay',
    name: 'Adapted Screenplay',
    basePoints: 25,
    emoji: '📝',
    nominees: [
      { id: 'ballad-wallis-island-screenplay', name: 'The Ballad of Wallis Island — Tom Basden, Tim Key', tmdb_id: "" },
      { id: 'bugonia-screenplay', name: 'Bugonia — Will Tracy', tmdb_id: "" },
      { id: 'hamnet-screenplay', name: 'Hamnet — Chloé Zhao, Maggie O\'Farrell', tmdb_id: "" },
      { id: 'one-battle-after-another-screenplay', name: 'One Battle After Another — Paul Thomas Anderson', tmdb_id: "" },
      { id: 'pillion-screenplay', name: 'Pillion — Harry Lighton, Adam Mars-Jones', tmdb_id: "" }
    ]
  },
  {
    id: 'best-english-film',
    name: 'Outstanding British Film',
    basePoints: 20,
    emoji: '🇬🇧',
    nominees: [
      { id: '28-years-later', name: '28 Years Later', tmdb_id: "" },
      { id: 'ballad-wallis-island', name: 'The Ballad of Wallis Island', tmdb_id: "" },
      { id: 'bridget-jones-mad-about-the-boy', name: 'Bridget Jones: Mad About the Boy', tmdb_id: "" },
      { id: 'die-my-love', name: 'Die My Love', tmdb_id: "" },
      { id: 'h-is-for-hawk', name: 'H is for Hawk', tmdb_id: "" },
      { id: 'hamnet-british', name: 'Hamnet', tmdb_id: "" },
      { id: 'i-swear-british', name: 'I Swear', tmdb_id: "" },
      { id: 'mr-burton', name: 'Mr. Burton', tmdb_id: "" },
      { id: 'pillion-british', name: 'Pillion', tmdb_id: "" },
      { id: 'steve', name: 'Steve', tmdb_id: "" }
    ]
  },
  {
    id: 'best-animated-film',
    name: 'Best Animated Film',
    basePoints: 15,
    emoji: '🎨',
    nominees: [
      { id: 'elio-animated', name: 'Elio', tmdb_id: "" },
      { id: 'little-amelie', name: 'Little Amélie', tmdb_id: "" },
      { id: 'zootropolis-2', name: 'Zootropolis 2', tmdb_id: "" }
    ]
  }
];

export const MAIN_SAG_CATEGORIES = [
  {
    id: 'lead-actor-film',
    name: 'Outstanding Performance by a Male Actor in a Leading Role',
    basePoints: 40,
    emoji: '🎭',
    nominees: [
      { id: 'timothee-chalamet-marty-supreme', name: 'Timothée Chalamet — Marty Supreme', tmdb_id: "" },
      { id: 'leonardo-dicaprio-one-battle-after-another', name: 'Leonardo DiCaprio — One Battle After Another', tmdb_id: "" },
      { id: 'ethan-hawke-blue-moon', name: 'Ethan Hawke — Blue Moon', tmdb_id: "" },
      { id: 'michael-b-jordan-sinners', name: 'Michael B. Jordan — Sinners', tmdb_id: "" },
      { id: 'jesse-plemons-bugonia', name: 'Jesse Plemons — Bugonia', tmdb_id: "" }
    ]
  },
  {
    id: 'lead-actress-film',
    name: 'Outstanding Performance by a Female Actor in a Leading Role',
    basePoints: 40,
    emoji: '🎭',
    nominees: [
      { id: 'jessie-buckley-hamnet', name: 'Jessie Buckley — Hamnet', tmdb_id: "" },
      { id: 'rose-byrne-legs-kick-you', name: 'Rose Byrne — If I Had Legs I\'d Kick You', tmdb_id: "" },
      { id: 'kate-hudson-song-sung-blue', name: 'Kate Hudson — Song Sung Blue', tmdb_id: "" },
      { id: 'chase-infiniti-one-battle-after-another', name: 'Chase Infiniti — One Battle After Another', tmdb_id: "" },
      { id: 'emma-stone-bugonia', name: 'Emma Stone — Bugonia', tmdb_id: "" }
    ]
  },
  {
    id: 'supporting-actor-film',
    name: 'Outstanding Performance by a Male Actor in a Supporting Role',
    basePoints: 30,
    emoji: '🎭',
    nominees: [
      { id: 'miles-caton-sinners', name: 'Miles Caton — Sinners', tmdb_id: "" },
      { id: 'benicio-del-toro-one-battle-after-another', name: 'Benicio Del Toro — One Battle After Another', tmdb_id: "" },
      { id: 'jacob-elordi-frankenstein', name: 'Jacob Elordi — Frankenstein', tmdb_id: "" },
      { id: 'paul-mescal-hamnet', name: 'Paul Mescal — Hamnet', tmdb_id: "" },
      { id: 'sean-penn-one-battle-after-another', name: 'Sean Penn — One Battle After Another', tmdb_id: "" }
    ]
  },
  {
    id: 'supporting-actress-film',
    name: 'Outstanding Performance by a Female Actor in a Supporting Role',
    basePoints: 30,
    emoji: '🎭',
    nominees: [
      { id: 'odessa-azion-marty-supreme', name: 'Odessa A’zion — Marty Supreme', tmdb_id: "" },
      { id: 'ariana-grande-wicked-for-good', name: 'Ariana Grande — Wicked: For Good', tmdb_id: "" },
      { id: 'amy-madigan-weapons', name: 'Amy Madigan — Weapons', tmdb_id: "" },
      { id: 'wunmi-mosaku-sinners', name: 'Wunmi Mosaku — Sinners', tmdb_id: "" },
      { id: 'teyana-taylor-one-battle-after-another', name: 'Teyana Taylor — One Battle After Another', tmdb_id: "" }
    ]
  },
  {
    id: 'cast-film',
    name: 'Outstanding Performance by a Cast in a Motion Picture',
    basePoints: 50,
    emoji: '🎬',
    nominees: [
      { id: 'frankenstein-cast', name: 'Frankenstein', tmdb_id: "" },
      { id: 'hamnet-cast', name: 'Hamnet', tmdb_id: "" },
      { id: 'marty-supreme-cast', name: 'Marty Supreme', tmdb_id: "" },
      { id: 'one-battle-after-another-cast', name: 'One Battle After Another', tmdb_id: "" },
      { id: 'sinners-cast', name: 'Sinners', tmdb_id: "" }
    ]
  },
  {
    id: 'male-actor-drama-series',
    name: 'Outstanding Performance by a Male Actor in a Drama Series',
    basePoints: 30,
    emoji: '📺',
    nominees: [
      { id: 'sterling-k-brown-paradise', name: 'Sterling K. Brown — Paradise', tmdb_id: "" },
      { id: 'billy-crudup-morning-show', name: 'Billy Crudup — The Morning Show', tmdb_id: "" },
      { id: 'walton-goggins-white-lotus', name: 'Walton Goggins — The White Lotus', tmdb_id: "" },
      { id: 'gary-oldman-slow-horses', name: 'Gary Oldman — Slow Horses', tmdb_id: "" },
      { id: 'noah-wyle-the-pitt', name: 'Noah Wyle — The Pitt', tmdb_id: "" }
    ]
  },
  {
    id: 'female-actor-drama-series',
    name: 'Outstanding Performance by a Female Actor in a Drama Series',
    basePoints: 30,
    emoji: '📺',
    nominees: [
      { id: 'britt-lower-severance', name: 'Britt Lower — Severance', tmdb_id: "" },
      { id: 'parker-posey-white-lotus', name: 'Parker Posey — The White Lotus', tmdb_id: "" },
      { id: 'keri-russell-diplomat', name: 'Keri Russell — The Diplomat', tmdb_id: "" },
      { id: 'rhea-seehorn-pluribus', name: 'Rhea Seehorn — Pluribus', tmdb_id: "" },
      { id: 'aimee-lou-wood-white-lotus', name: 'Aimee Lou Wood — The White Lotus', tmdb_id: "" }
    ]
  },
  {
    id: 'male-actor-comedy-series',
    name: 'Outstanding Performance by a Male Actor in a Comedy Series',
    basePoints: 30,
    emoji: '📺',
    nominees: [
      { id: 'ike-barinholtz-the-studio', name: 'Ike Barinholtz — The Studio', tmdb_id: "" },
      { id: 'adam-brody-nobody-wants', name: 'Adam Brody — Nobody Wants This', tmdb_id: "" },
      { id: 'ted-danson-man-on-inside', name: 'Ted Danson — A Man on the Inside', tmdb_id: "" },
      { id: 'seth-rogen-the-studio', name: 'Seth Rogen — The Studio', tmdb_id: "" },
      { id: 'martin-short-only-murders', name: 'Martin Short — Only Murders in the Building', tmdb_id: "" }
    ]
  },
  {
    id: 'female-actor-comedy-series',
    name: 'Outstanding Performance by a Female Actor in a Comedy Series',
    basePoints: 30,
    emoji: '📺',
    nominees: [
      { id: 'kathryn-hahn-the-studio', name: 'Kathryn Hahn — The Studio', tmdb_id: "" },
      { id: 'catherine-ohara-the-studio', name: 'Catherine O\'Hara — The Studio', tmdb_id: "" },
      { id: 'jenna-ortega-wednesday', name: 'Jenna Ortega — Wednesday', tmdb_id: "" },
      { id: 'jean-smart-hacks', name: 'Jean Smart — Hacks', tmdb_id: "" },
      { id: 'kristen-wiig-palm-royale', name: 'Kristen Wiig — Palm Royale', tmdb_id: "" }
    ]
  },
  {
    id: 'ensemble-drama-series',
    name: 'Outstanding Performance by an Ensemble in a Drama Series',
    basePoints: 40,
    emoji: '📺',
    nominees: [
      { id: 'diplomat-ensemble', name: 'The Diplomat', tmdb_id: "" },
      { id: 'landman-ensemble', name: 'Landman', tmdb_id: "" },
      { id: 'the-pitt-ensemble', name: 'The Pitt', tmdb_id: "" },
      { id: 'severance-ensemble', name: 'Severance', tmdb_id: "" },
      { id: 'white-lotus-ensemble', name: 'The White Lotus', tmdb_id: "" }
    ]
  }
];
