// Main award categories - streamlined to 10 key categories
export const MAIN_OSCAR_CATEGORIES = [
  {
    id: 'best-picture',
    name: 'Best Picture',
    basePoints: 50,
    emoji: '🏆',
    nominees: [
      { id: 'anora', name: 'Anora', tmdb_id: "" },
      { id: 'the-brutalist', name: 'The Brutalist', tmdb_id: "" },
      { id: 'a-complete-unknown', name: 'A Complete Unknown', tmdb_id: "" },
      { id: 'conclave', name: 'Conclave', tmdb_id: "" },
      { id: 'dune-part-two', name: 'Dune: Part Two', tmdb_id: "" },
      { id: 'emilia-perez', name: 'Emilia Pérez', tmdb_id: "" },
      { id: 'im-still-here', name: 'I\'m Still Here', tmdb_id: "" },
      { id: 'nickel-boys', name: 'Nickel Boys', tmdb_id: "" },
      { id: 'the-substance', name: 'The Substance', tmdb_id: "" },
      { id: 'wicked', name: 'Wicked', tmdb_id: "" }
    ]
  },
  {
    id: 'best-director',
    name: 'Directing',
    basePoints: 40,
    emoji: '🎬',
    nominees: [
      { id: 'sean-baker-anora', name: 'Sean Baker — Anora', tmdb_id: "" },
      { id: 'brady-corbet-brutalist', name: 'Brady Corbet — The Brutalist', tmdb_id: "" },
      { id: 'james-mangold-complete-unknown', name: 'James Mangold — A Complete Unknown', tmdb_id: "" },
      { id: 'jacques-audiard-emilia-perez', name: 'Jacques Audiard — Emilia Pérez', tmdb_id: "" },
      { id: 'coralie-fargeat-substance', name: 'Coralie Fargeat — The Substance', tmdb_id: "" }
    ]
  },
  {
    id: 'best-actor',
    name: 'Actor In A Leading Role',
    basePoints: 30,
    emoji: '👨',
    nominees: [
      { id: 'adrien-brody-brutalist', name: 'Adrien Brody — The Brutalist', tmdb_id: "" },
      { id: 'timothee-chalamet-complete-unknown', name: 'Timothée Chalamet — A Complete Unknown', tmdb_id: "" },
      { id: 'colman-domingo-sing-sing', name: 'Colman Domingo — Sing Sing', tmdb_id: "" },
      { id: 'ralph-fiennes-conclave', name: 'Ralph Fiennes — Conclave', tmdb_id: "" },
      { id: 'sebastian-stan-apprentice', name: 'Sebastian Stan — The Apprentice', tmdb_id: "" }
    ]
  },
  {
    id: 'best-actress',
    name: 'Actress In A Leading Role',
    basePoints: 30,
    emoji: '👩',
    nominees: [
      { id: 'cynthia-erivo-wicked', name: 'Cynthia Erivo — Wicked', tmdb_id: "" },
      { id: 'karla-sofia-gascon-emilia-perez', name: 'Karla Sofía Gascón — Emilia Pérez', tmdb_id: "" },
      { id: 'mikey-madison-anora', name: 'Mikey Madison — Anora', tmdb_id: "" },
      { id: 'demi-moore-substance', name: 'Demi Moore — The Substance', tmdb_id: "" },
      { id: 'fernanda-torres-im-still-here', name: 'Fernanda Torres — I\'m Still Here', tmdb_id: "" }
    ]
  },
  {
    id: 'best-supporting-actor',
    name: 'Actor In A Supporting Role',
    basePoints: 20,
    emoji: '👨‍🎭',
    nominees: [
      { id: 'yura-borisov-anora', name: 'Yura Borisov — Anora', tmdb_id: "" },
      { id: 'kieran-culkin-a-real-pain', name: 'Kieran Culkin — A Real Pain', tmdb_id: "" },
      { id: 'edward-norton-complete-unknown', name: 'Edward Norton — A Complete Unknown', tmdb_id: "" },
      { id: 'guy-pearce-brutalist', name: 'Guy Pearce — The Brutalist', tmdb_id: "" },
      { id: 'jeremy-strong-apprentice', name: 'Jeremy Strong — The Apprentice', tmdb_id: "" }
    ]
  },
  {
    id: 'best-supporting-actress',
    name: 'Actress In A Supporting Role',
    basePoints: 20,
    emoji: '👩‍🎭',
    nominees: [
      { id: 'monica-barbaro-complete-unknown', name: 'Monica Barbaro — A Complete Unknown', tmdb_id: "" },
      { id: 'ariana-grande-wicked', name: 'Ariana Grande — Wicked', tmdb_id: "" },
      { id: 'felicity-jones-brutalist', name: 'Felicity Jones — The Brutalist', tmdb_id: "" },
      { id: 'isabella-rossellini-conclave', name: 'Isabella Rossellini — Conclave', tmdb_id: "" },
      { id: 'zoe-saldana-emilia-perez', name: 'Zoe Saldaña — Emilia Pérez', tmdb_id: "" }
    ]
  },
  {
    id: 'best-original-screenplay',
    name: 'Writing (Original Screenplay)',
    basePoints: 25,
    emoji: '✍️',
    nominees: [
      { id: 'anora-screenplay', name: 'Anora — Sean Baker', tmdb_id: "" },
      { id: 'brutalist-screenplay', name: 'The Brutalist — Brady Corbet, Mona Fastvold', tmdb_id: "" },
      { id: 'a-real-pain-screenplay', name: 'A Real Pain — Jesse Eisenberg', tmdb_id: "" },
      { id: 'september-5-screenplay', name: 'September 5 — Moritz Binder, Tim Fehlbaum, Alex David', tmdb_id: "" },
      { id: 'substance-screenplay', name: 'The Substance — Coralie Fargeat', tmdb_id: "" }
    ]
  },
  {
    id: 'best-adapted-screenplay',
    name: 'Writing (Adapted Screenplay)',
    basePoints: 25,
    emoji: '📝',
    nominees: [
      { id: 'complete-unknown-screenplay', name: 'A Complete Unknown — Jay Cocks, James Mangold', tmdb_id: "" },
      { id: 'conclave-screenplay', name: 'Conclave — Peter Straughan', tmdb_id: "" },
      { id: 'emilia-perez-screenplay', name: 'Emilia Pérez — Jacques Audiard', tmdb_id: "" },
      { id: 'nickel-boys-screenplay', name: 'Nickel Boys — RaMell Ross, Joslyn Barnes', tmdb_id: "" },
      { id: 'sing-sing-screenplay', name: 'Sing Sing — Clint Bentley, Greg Kwedar', tmdb_id: "" }
    ]
  },
  {
    id: 'best-international-feature',
    name: 'International Feature Film',
    basePoints: 20,
    emoji: '🌍',
    nominees: [
      { id: 'im-still-here-brazil', name: 'I\'m Still Here (Brazil)', tmdb_id: "" },
      { id: 'girl-with-the-needle-denmark', name: 'The Girl with the Needle (Denmark)', tmdb_id: "" },
      { id: 'emilia-perez-france', name: 'Emilia Pérez (France)', tmdb_id: "" },
      { id: 'seed-sacred-fig-germany', name: 'The Seed of the Sacred Fig (Germany)', tmdb_id: "" },
      { id: 'flow-latvia', name: 'Flow (Latvia)', tmdb_id: "" }
    ]
  },
  {
    id: 'best-animated-feature',
    name: 'Animated Feature Film',
    basePoints: 15,
    emoji: '🎨',
    nominees: [
      { id: 'flow-animated', name: 'Flow', tmdb_id: "" },
      { id: 'inside-out-2', name: 'Inside Out 2', tmdb_id: "" },
      { id: 'memoir-of-a-snail', name: 'Memoir of a Snail', tmdb_id: "" },
      { id: 'wallace-gromit-vengeance', name: 'Wallace & Gromit: Vengeance Most Fowl', tmdb_id: "" },
      { id: 'the-wild-robot', name: 'The Wild Robot', tmdb_id: "" }
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
      { id: 'anora', name: 'Anora', tmdb_id: "" },
      { id: 'the-brutalist', name: 'The Brutalist', tmdb_id: "" },
      { id: 'a-complete-unknown', name: 'A Complete Unknown', tmdb_id: "" },
      { id: 'conclave', name: 'Conclave', tmdb_id: "" },
      { id: 'emilia-perez', name: 'Emilia Pérez', tmdb_id: "" }
    ]
  },
  {
    id: 'best-director',
    name: 'Directing',
    basePoints: 40,
    emoji: '🎬',
    nominees: [
      { id: 'brady-corbet-brutalist', name: 'Brady Corbet — The Brutalist', tmdb_id: "" },
      { id: 'james-mangold-complete-unknown', name: 'James Mangold — A Complete Unknown', tmdb_id: "" },
      { id: 'jacques-audiard-emilia-perez', name: 'Jacques Audiard — Emilia Pérez', tmdb_id: "" },
      { id: 'coralie-fargeat-substance', name: 'Coralie Fargeat — The Substance', tmdb_id: "" },
      { id: 'sean-baker-anora', name: 'Sean Baker — Anora', tmdb_id: "" }
    ]
  },
  {
    id: 'best-actor',
    name: 'Leading Actor',
    basePoints: 30,
    emoji: '👨',
    nominees: [
      { id: 'adrien-brody-brutalist', name: 'Adrien Brody — The Brutalist', tmdb_id: "" },
      { id: 'timothee-chalamet-complete-unknown', name: 'Timothée Chalamet — A Complete Unknown', tmdb_id: "" },
      { id: 'colman-domingo-sing-sing', name: 'Colman Domingo — Sing Sing', tmdb_id: "" },
      { id: 'ralph-fiennes-conclave', name: 'Ralph Fiennes — Conclave', tmdb_id: "" },
      { id: 'hugh-grant-heretic', name: 'Hugh Grant — Heretic', tmdb_id: "" },
      { id: 'sebastian-stan-apprentice', name: 'Sebastian Stan — The Apprentice', tmdb_id: "" }
    ]
  },
  {
    id: 'best-actress',
    name: 'Leading Actress',
    basePoints: 30,
    emoji: '👩',
    nominees: [
      { id: 'cynthia-erivo-wicked', name: 'Cynthia Erivo — Wicked', tmdb_id: "" },
      { id: 'karla-sofia-gascon-emilia-perez', name: 'Karla Sofía Gascón — Emilia Pérez', tmdb_id: "" },
      { id: 'marianne-jean-baptiste-hard-truths', name: 'Marianne Jean-Baptiste — Hard Truths', tmdb_id: "" },
      { id: 'mikey-madison-anora', name: 'Mikey Madison — Anora', tmdb_id: "" },
      { id: 'demi-moore-substance', name: 'Demi Moore — The Substance', tmdb_id: "" },
      { id: 'saoirse-ronan-outrun', name: 'Saoirse Ronan — The Outrun', tmdb_id: "" }
    ]
  },
  {
    id: 'best-supporting-actor',
    name: 'Supporting Actor',
    basePoints: 20,
    emoji: '👨‍🎭',
    nominees: [
      { id: 'yura-borisov-anora', name: 'Yura Borisov — Anora', tmdb_id: "" },
      { id: 'kieran-culkin-a-real-pain', name: 'Kieran Culkin — A Real Pain', tmdb_id: "" },
      { id: 'clarence-maclin-sing-sing', name: 'Clarence Maclin — Sing Sing', tmdb_id: "" },
      { id: 'edward-norton-complete-unknown', name: 'Edward Norton — A Complete Unknown', tmdb_id: "" },
      { id: 'guy-pearce-brutalist', name: 'Guy Pearce — The Brutalist', tmdb_id: "" },
      { id: 'jeremy-strong-apprentice', name: 'Jeremy Strong — The Apprentice', tmdb_id: "" }
    ]
  },
  {
    id: 'best-supporting-actress',
    name: 'Supporting Actress',
    basePoints: 20,
    emoji: '👩‍🎭',
    nominees: [
      { id: 'selena-gomez-emilia-perez', name: 'Selena Gomez — Emilia Pérez', tmdb_id: "" },
      { id: 'ariana-grande-wicked', name: 'Ariana Grande — Wicked', tmdb_id: "" },
      { id: 'felicity-jones-brutalist', name: 'Felicity Jones — The Brutalist', tmdb_id: "" },
      { id: 'jamie-lee-curtis-last-showgirl', name: 'Jamie Lee Curtis — The Last Showgirl', tmdb_id: "" },
      { id: 'isabella-rossellini-conclave', name: 'Isabella Rossellini — Conclave', tmdb_id: "" },
      { id: 'zoe-saldana-emilia-perez', name: 'Zoe Saldaña — Emilia Pérez', tmdb_id: "" }
    ]
  },
  {
    id: 'best-original-screenplay',
    name: 'Original Screenplay',
    basePoints: 25,
    emoji: '✍️',
    nominees: [
      { id: 'anora-screenplay', name: 'Anora — Sean Baker', tmdb_id: "" },
      { id: 'brutalist-screenplay', name: 'The Brutalist — Brady Corbet, Mona Fastvold', tmdb_id: "" },
      { id: 'kneecap-screenplay', name: 'Kneecap — Rich Peppiatt', tmdb_id: "" },
      { id: 'a-real-pain-screenplay', name: 'A Real Pain — Jesse Eisenberg', tmdb_id: "" },
      { id: 'substance-screenplay', name: 'The Substance — Coralie Fargeat', tmdb_id: "" }
    ]
  },
  {
    id: 'best-adapted-screenplay',
    name: 'Adapted Screenplay',
    basePoints: 25,
    emoji: '📝',
    nominees: [
      { id: 'complete-unknown-screenplay', name: 'A Complete Unknown — James Mangold, Jay Cocks', tmdb_id: "" },
      { id: 'conclave-screenplay', name: 'Conclave — Peter Straughan', tmdb_id: "" },
      { id: 'emilia-perez-screenplay', name: 'Emilia Pérez — Jacques Audiard', tmdb_id: "" },
      { id: 'nickel-boys-screenplay', name: 'Nickel Boys — RaMell Ross, Joslyn Barnes', tmdb_id: "" },
      { id: 'sing-sing-screenplay', name: 'Sing Sing — Clint Bentley, Greg Kwedar', tmdb_id: "" }
    ]
  },
  {
    id: 'best-english-film',
    name: 'Outstanding British Film',
    basePoints: 20,
    emoji: '🇬🇧',
    nominees: [
      { id: 'all-we-imagine-as-light', name: 'All We Imagine As Light', tmdb_id: "" },
      { id: 'the-apprentice', name: 'The Apprentice', tmdb_id: "" },
      { id: 'bird', name: 'Bird', tmdb_id: "" },
      { id: 'blitz', name: 'Blitz', tmdb_id: "" },
      { id: 'conclave-british', name: 'Conclave', tmdb_id: "" },
      { id: 'gladiator-ii', name: 'Gladiator II', tmdb_id: "" },
      { id: 'hard-truths', name: 'Hard Truths', tmdb_id: "" },
      { id: 'kneecap', name: 'Kneecap', tmdb_id: "" },
      { id: 'lee', name: 'Lee', tmdb_id: "" },
      { id: 'love-lies-bleeding', name: 'Love Lies Bleeding', tmdb_id: "" }
    ]
  },
  {
    id: 'best-animated-film',
    name: 'Best Animated Film',
    basePoints: 15,
    emoji: '🎨',
    nominees: [
      { id: 'flow-animated', name: 'Flow', tmdb_id: "" },
      { id: 'the-wild-robot', name: 'The Wild Robot', tmdb_id: "" },
      { id: 'wallace-gromit-vengeance', name: 'Wallace & Gromit: Vengeance Most Fowl', tmdb_id: "" }
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
      { id: 'adrien-brody-brutalist', name: 'Adrien Brody — The Brutalist', tmdb_id: "" },
      { id: 'timothee-chalamet-complete-unknown', name: 'Timothée Chalamet — A Complete Unknown', tmdb_id: "" },
      { id: 'daniel-craig-queer', name: 'Daniel Craig — Queer', tmdb_id: "" },
      { id: 'colman-domingo-sing-sing', name: 'Colman Domingo — Sing Sing', tmdb_id: "" },
      { id: 'ralph-fiennes-conclave', name: 'Ralph Fiennes — Conclave', tmdb_id: "" }
    ]
  },
  {
    id: 'lead-actress-film',
    name: 'Outstanding Performance by a Female Actor in a Leading Role',
    basePoints: 40,
    emoji: '🎭',
    nominees: [
      { id: 'pamela-anderson-last-showgirl', name: 'Pamela Anderson — The Last Showgirl', tmdb_id: "" },
      { id: 'cynthia-erivo-wicked', name: 'Cynthia Erivo — Wicked', tmdb_id: "" },
      { id: 'karla-sofia-gascon-emilia-perez', name: 'Karla Sofía Gascón — Emilia Pérez', tmdb_id: "" },
      { id: 'mikey-madison-anora', name: 'Mikey Madison — Anora', tmdb_id: "" },
      { id: 'demi-moore-substance', name: 'Demi Moore — The Substance', tmdb_id: "" }
    ]
  },
  {
    id: 'supporting-actor-film',
    name: 'Outstanding Performance by a Male Actor in a Supporting Role',
    basePoints: 30,
    emoji: '🎭',
    nominees: [
      { id: 'jonathan-bailey-wicked', name: 'Jonathan Bailey — Wicked', tmdb_id: "" },
      { id: 'yura-borisov-anora', name: 'Yura Borisov — Anora', tmdb_id: "" },
      { id: 'kieran-culkin-a-real-pain', name: 'Kieran Culkin — A Real Pain', tmdb_id: "" },
      { id: 'edward-norton-complete-unknown', name: 'Edward Norton — A Complete Unknown', tmdb_id: "" },
      { id: 'jeremy-strong-apprentice', name: 'Jeremy Strong — The Apprentice', tmdb_id: "" }
    ]
  },
  {
    id: 'supporting-actress-film',
    name: 'Outstanding Performance by a Female Actor in a Supporting Role',
    basePoints: 30,
    emoji: '🎭',
    nominees: [
      { id: 'monica-barbaro-complete-unknown', name: 'Monica Barbaro — A Complete Unknown', tmdb_id: "" },
      { id: 'jamie-lee-curtis-last-showgirl', name: 'Jamie Lee Curtis — The Last Showgirl', tmdb_id: "" },
      { id: 'danielle-deadwyler-piano-lesson', name: 'Danielle Deadwyler — The Piano Lesson', tmdb_id: "" },
      { id: 'ariana-grande-wicked', name: 'Ariana Grande — Wicked', tmdb_id: "" },
      { id: 'zoe-saldana-emilia-perez', name: 'Zoe Saldaña — Emilia Pérez', tmdb_id: "" }
    ]
  },
  {
    id: 'cast-film',
    name: 'Outstanding Performance by a Cast in a Motion Picture',
    basePoints: 50,
    emoji: '🎬',
    nominees: [
      { id: 'a-complete-unknown-cast', name: 'A Complete Unknown', tmdb_id: "" },
      { id: 'anora-cast', name: 'Anora', tmdb_id: "" },
      { id: 'conclave-cast', name: 'Conclave', tmdb_id: "" },
      { id: 'emilia-perez-cast', name: 'Emilia Pérez', tmdb_id: "" },
      { id: 'wicked-cast', name: 'Wicked', tmdb_id: "" }
    ]
  },
  {
    id: 'male-actor-drama-series',
    name: 'Outstanding Performance by a Male Actor in a Drama Series',
    basePoints: 30,
    emoji: '📺',
    nominees: [
      { id: 'tadanobu-asano-shogun', name: 'Tadanobu Asano — Shōgun', tmdb_id: "" },
      { id: 'jeff-bridges-the-old-man', name: 'Jeff Bridges — The Old Man', tmdb_id: "" },
      { id: 'gary-oldman-slow-horses', name: 'Gary Oldman — Slow Horses', tmdb_id: "" },
      { id: 'eddie-redmayne-day-of-jackal', name: 'Eddie Redmayne — The Day of the Jackal', tmdb_id: "" },
      { id: 'hiroyuki-sanada-shogun', name: 'Hiroyuki Sanada — Shōgun', tmdb_id: "" }
    ]
  },
  {
    id: 'female-actor-drama-series',
    name: 'Outstanding Performance by a Female Actor in a Drama Series',
    basePoints: 30,
    emoji: '📺',
    nominees: [
      { id: 'kathy-bates-matlock', name: 'Kathy Bates — Matlock', tmdb_id: "" },
      { id: 'nicola-coughlan-bridgerton', name: 'Nicola Coughlan — Bridgerton', tmdb_id: "" },
      { id: 'allison-janney-diplomat', name: 'Allison Janney — The Diplomat', tmdb_id: "" },
      { id: 'keri-russell-diplomat', name: 'Keri Russell — The Diplomat', tmdb_id: "" },
      { id: 'anna-sawai-shogun', name: 'Anna Sawai — Shōgun', tmdb_id: "" }
    ]
  },
  {
    id: 'male-actor-comedy-series',
    name: 'Outstanding Performance by a Male Actor in a Comedy Series',
    basePoints: 30,
    emoji: '📺',
    nominees: [
      { id: 'adam-brody-nobody-wants', name: 'Adam Brody — Nobody Wants This', tmdb_id: "" },
      { id: 'ted-danson-man-on-inside', name: 'Ted Danson — A Man on the Inside', tmdb_id: "" },
      { id: 'harrison-ford-shrinking', name: 'Harrison Ford — Shrinking', tmdb_id: "" },
      { id: 'martin-short-only-murders', name: 'Martin Short — Only Murders in the Building', tmdb_id: "" },
      { id: 'jeremy-allen-white-bear', name: 'Jeremy Allen White — The Bear', tmdb_id: "" }
    ]
  },
  {
    id: 'female-actor-comedy-series',
    name: 'Outstanding Performance by a Female Actor in a Comedy Series',
    basePoints: 30,
    emoji: '📺',
    nominees: [
      { id: 'kristen-bell-nobody-wants', name: 'Kristen Bell — Nobody Wants This', tmdb_id: "" },
      { id: 'quinta-brunson-abbott', name: 'Quinta Brunson — Abbott Elementary', tmdb_id: "" },
      { id: 'liza-colon-zayas-bear', name: 'Liza Colón-Zayas — The Bear', tmdb_id: "" },
      { id: 'ayo-edebiri-bear', name: 'Ayo Edebiri — The Bear', tmdb_id: "" },
      { id: 'jean-smart-hacks', name: 'Jean Smart — Hacks', tmdb_id: "" }
    ]
  },
  {
    id: 'ensemble-drama-series',
    name: 'Outstanding Performance by an Ensemble in a Drama Series',
    basePoints: 40,
    emoji: '📺',
    nominees: [
      { id: 'bridgerton-ensemble', name: 'Bridgerton', tmdb_id: "" },
      { id: 'day-of-jackal-ensemble', name: 'The Day of the Jackal', tmdb_id: "" },
      { id: 'diplomat-ensemble', name: 'The Diplomat', tmdb_id: "" },
      { id: 'shogun-ensemble', name: 'Shōgun', tmdb_id: "" },
      { id: 'slow-horses-ensemble', name: 'Slow Horses', tmdb_id: "" }
    ]
  }
];
