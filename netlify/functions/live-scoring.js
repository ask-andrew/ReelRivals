import { load } from 'cheerio';
import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

if (!APP_ID) {
  throw new Error('Missing INSTANT_APP_ID. Set it in Netlify environment variables.');
}

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set INSTANT_APP_ADMIN_TOKEN (or VITE_INSTANT_SECRET for local development).');
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

const BAFTA_CATEGORY_SLUGS = {
  'Best Film': 'best-film',
  'Directing': 'director',
  'Leading Actor': 'leading-actor',
  'Leading Actress': 'leading-actress',
  'Supporting Actor': 'supporting-actor',
  'Supporting Actress': 'supporting-actress',
  'Original Screenplay': 'original-screenplay',
  'Adapted Screenplay': 'adapted-screenplay',
  'Outstanding British Film': 'outstanding-british-film',
  'Best Animated Film': 'animated-film'
};

const SAG_SLUG_BY_EVENT = {
  'sag-2026': process.env.SAG_EVENT_SLUG_2026 || '32nd-annual-actor-awards'
};

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const buildCategoryAliases = (name) => {
  const aliases = new Set([name]);
  if (name.toLowerCase().startsWith('outstanding performance by')) {
    aliases.add(name.replace(/^Outstanding Performance by (an?|the)\s*/i, ''));
  }
  return [...aliases];
};

const extractLines = (html) => {
  const $ = load(html);
  const text = $('body').text();
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const findCategoryMatch = (line, categories) => {
  const normLine = normalize(line);
  for (const category of categories) {
    const aliases = buildCategoryAliases(category.name);
    for (const alias of aliases) {
      const normAlias = normalize(alias);
      if (!normAlias) continue;
      if (normLine === normAlias) return category;
      if (normLine.includes(normAlias) || normAlias.includes(normLine)) return category;
    }
  }
  return null;
};

const findNomineeMatch = (winnerName, nominees) => {
  const normWinner = normalize(winnerName);
  return nominees.find((nominee) => {
    const normNominee = normalize(nominee.name);
    return normNominee.includes(normWinner) || normWinner.includes(normNominee);
  });
};

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ReelRivals/1.0 (+https://reelrivals.com)'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return await response.text();
}

function parseOscarsWinners(html, categories) {
  const lines = extractLines(html);
  const winners = new Map();
  let currentCategory = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matchedCategory = findCategoryMatch(line, categories);
    if (matchedCategory) {
      currentCategory = matchedCategory;
      continue;
    }

    if (currentCategory && line.toLowerCase() === 'winner') {
      let winner = '';
      for (let j = i + 1; j < lines.length; j++) {
        const candidate = lines[j];
        if (!candidate) continue;
        winner = candidate;
        break;
      }
      if (winner) {
        winners.set(currentCategory.id, winner);
      }
    }
  }

  return winners;
}

function parseSagWinners(html, categories) {
  const lines = extractLines(html);
  const winners = new Map();
  let currentCategory = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matchedCategory = findCategoryMatch(line, categories);
    if (matchedCategory) {
      currentCategory = matchedCategory;
      continue;
    }

    if (currentCategory && line.toLowerCase().startsWith('recipient')) {
      const winner = line.replace(/^recipient\s*/i, '').trim();
      if (winner) {
        winners.set(currentCategory.id, winner);
      }
    }
  }

  return winners;
}

function parseBaftaCategoryWinner(html, year) {
  const lines = extractLines(html);
  const yearLabel = String(year);
  let inYear = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === yearLabel) {
      inYear = true;
      continue;
    }
    if (inYear && /^\d{4}$/.test(line)) {
      break;
    }
    if (inYear && line.toLowerCase() === 'winner') {
      for (let j = i + 1; j < lines.length; j++) {
        const candidate = lines[j];
        if (!candidate) continue;
        if (candidate.toLowerCase() === 'nominee') continue;
        return candidate;
      }
    }
  }

  return null;
}

function parseMediaList(html, categories) {
  const lines = extractLines(html);
  const winners = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matchedCategory = findCategoryMatch(line, categories);
    if (!matchedCategory) continue;

    let winner = '';
    if (line.includes('—') || line.includes(' - ') || line.includes(':')) {
      const split = line.split(/—| - |:/);
      winner = split.slice(1).join(' ').trim();
    } else {
      for (let j = i + 1; j < lines.length; j++) {
        const candidate = lines[j];
        if (!candidate) continue;
        winner = candidate;
        break;
      }
    }

    if (winner) {
      winners.set(matchedCategory.id, winner);
    }
  }

  return winners;
}

async function fetchOfficialWinners(eventId, year, categories) {
  // Skip official sites for now since they block scraping
  // Will rely on media sources and Wikipedia instead
  return new Map();
}

async function fetchMediaWinners(eventId, categories) {
  const envKey = eventId.startsWith('oscars-')
    ? 'MEDIA_OSCARS_URLS'
    : eventId.startsWith('baftas-')
      ? 'MEDIA_BAFTAS_URLS'
      : eventId.startsWith('sag-')
        ? 'MEDIA_SAG_URLS'
        : null;

  if (!envKey || !process.env[envKey]) {
    return new Map();
  }

  const urls = process.env[envKey]
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const merged = new Map();
  for (const url of urls) {
    try {
      const html = await fetchHtml(url);
      const winners = parseMediaList(html, categories);
      for (const [catId, winner] of winners.entries()) {
        merged.set(catId, winner);
      }
    } catch (error) {
      console.warn(`⚠️ Media source failed ${url}:`, error.message);
    }
  }
  return merged;
}

// Add Wikipedia scraping as primary source
async function fetchWikipediaWinners(eventId, categories) {
  const wikiUrls = {
    'oscars-2026': 'https://en.wikipedia.org/wiki/98th_Academy_Awards',
    'baftas-2026': 'https://en.wikipedia.org/wiki/79th_British_Academy_Film_Awards',
    'sag-2026': 'https://en.wikipedia.org/wiki/32nd_Actor_Awards',
    'golden-globes-2026': 'https://en.wikipedia.org/wiki/81st_Golden_Globe_Awards'
  };

  const url = wikiUrls[eventId];
  if (!url) return new Map();

  try {
    const html = await fetchHtml(url);
    // Use custom SAG parser for SAG events, standard parser for others
    if (eventId === 'sag-2026') {
      return parseSagWikipediaWinners(html, categories);
    } else {
      return parseWikipediaWinners(html, categories);
    }
  } catch (error) {
    console.warn(`⚠️ Wikipedia scraping failed:`, error.message);
    return new Map();
  }
}

function parseWikipediaWinners(html, categories) {
  const $ = load(html);
  const winners = new Map();

  // Look for winner tables
  $('table.wikitable tr').each((i, row) => {
    const $row = $(row);
    const cells = $row.find('td, th');

    if (cells.length >= 2) {
      const categoryText = $(cells[0]).text().trim();
      const winnerText = $(cells[1]).text().trim();

      if (categoryText && winnerText && winnerText.toLowerCase() !== 'pending') {
        const matchedCategory = findCategoryMatch(categoryText, categories);
        if (matchedCategory) {
          winners.set(matchedCategory.id, winnerText);
        }
      }
    }
  });

  return winners;
}

// Custom SAG parser for unique Wikipedia table structure
function parseSagWikipediaWinners(html, categories) {
  const $ = load(html);
  const winners = new Map();

  console.log('[SAG Parser] Categories available:', categories.map(c => c.name));

  // SAG uses complex tables with yellow background winners
  $('table.wikitable td').each((i, cell) => {
    const $cell = $(cell);
    
    // Look for yellow background divs (indicate winners)
    const $winnerDiv = $cell.find('div[style*="background-color:#FAEB86"], div[style*="background-color: #FAEB86"]');
    
    if ($winnerDiv.length > 0) {
      // This cell contains a winner category
      const categoryText = $winnerDiv.text().trim();
      
      // Find the FIRST <li> in the nested <ul> structure - that's the winner
      // SAG has nested <ul><li><ul><li>WINNER</li><li>nominee</li></ul></li></ul>
      const $firstLi = $cell.find('ul li ul li').first();
      const winnerText = $firstLi.text().trim();
      
      console.log(`[SAG Parser] Found potential winner: "${categoryText}" -> "${winnerText}"`);
      
      if (categoryText && winnerText) {
        const matchedCategory = findCategoryMatch(categoryText, categories);
        if (matchedCategory) {
          console.log(`[SAG Parser] ✅ Matched category: "${categoryText}" -> "${matchedCategory.name}" (${matchedCategory.id})`);
          winners.set(matchedCategory.id, winnerText);
        } else {
          console.log(`[SAG Parser] ❌ No match found for category: "${categoryText}"`);
        }
      }
    }
  });

  console.log(`[SAG Parser] Final winners found: ${winners.size}`);
  return winners;
}

async function recalculateScoresForEvent(eventId, categoryIds) {
  const [resultsData, picksData, scoresData] = await Promise.all([
    db.query({
      results: { $: { where: { category_id: { in: categoryIds } } } }
    }),
    db.query({
      picks: {
        $: { where: { category_id: { in: categoryIds } } },
        ballot: { user_id: true, league_id: true },
        category: { base_points: true }
      }
    }),
    db.query({
      scores: { $: { where: { event_id: eventId } } }
    })
  ]);

  const results = resultsData.results || [];
  const picks = picksData.picks || [];
  const existingScores = scoresData.scores || [];

  const winnerByCategory = new Map(
    results.map((r) => [r.category_id, r.winner_nominee_id])
  );

  const userLeaguePicks = picks.reduce((acc, pick) => {
    const winnerId = winnerByCategory.get(pick.category_id);
    if (!winnerId) return acc;

    const key = `${pick.ballot.user_id}-${pick.ballot.league_id}`;
    if (!acc[key]) {
      acc[key] = {
        userId: pick.ballot.user_id,
        leagueId: pick.ballot.league_id,
        correctPicks: 0,
        powerPicksHit: 0,
        totalPoints: 0
      };
    }

    const isCorrect = pick.nominee_id === winnerId;
    const isPowerPick = pick.is_power_pick;
    const basePoints = pick.category?.base_points || 50;

    if (isCorrect) {
      acc[key].correctPicks++;
      acc[key].totalPoints += isPowerPick ? basePoints * 3 : basePoints;
      if (isPowerPick) {
        acc[key].powerPicksHit++;
      }
    }

    return acc;
  }, {});

  const scoreTransactions = [];
  const seenKeys = new Set(Object.keys(userLeaguePicks));

  for (const [key, scoreData] of Object.entries(userLeaguePicks)) {
    const { userId, leagueId, correctPicks, powerPicksHit, totalPoints } = scoreData;
    const existingScore = existingScores.find(
      (s) => s.user_id === userId && s.league_id === leagueId
    );

    if (existingScore) {
      scoreTransactions.push(
        db.tx.scores[existingScore.id].update({
          total_points: totalPoints,
          correct_picks: correctPicks,
          power_picks_hit: powerPicksHit,
          updated_at: Date.now()
        })
      );
    } else {
      const scoreId = id();
      scoreTransactions.push(
        db.tx.scores[scoreId].create({
          user_id: userId,
          league_id: leagueId,
          event_id: eventId,
          total_points: totalPoints,
          correct_picks: correctPicks,
          power_picks_hit: powerPicksHit,
          updated_at: Date.now()
        })
      );
    }
  }

  for (const existing of existingScores) {
    const key = `${existing.user_id}-${existing.league_id}`;
    if (!seenKeys.has(key)) {
      scoreTransactions.push(
        db.tx.scores[existing.id].update({
          total_points: 0,
          correct_picks: 0,
          power_picks_hit: 0,
          updated_at: Date.now()
        })
      );
    }
  }

  if (scoreTransactions.length > 0) {
    await db.transact(scoreTransactions);
  }
}

export const handler = async (event) => {
  if (!ADMIN_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing InstantDB admin token'
      })
    };
  }

  // Determine current event based on date
  const today = new Date();
  const currentEvents = [
    { id: 'golden-globes-2026', name: 'Golden Globe Awards', date: new Date('2026-02-02T17:00:00-08:00') },
    { id: 'baftas-2026', name: 'BAFTA Awards', date: new Date('2026-02-16T17:00:00-08:00') },
    { id: 'sag-2026', name: 'SAG Awards', date: new Date('2026-03-01T17:00:00-08:00') },
    { id: 'oscars-2026', name: 'The Oscars', date: new Date('2026-03-15T17:00:00-08:00') }
  ];
  
  // Find the most recent past event, or the first upcoming one
  const pastEvents = currentEvents.filter(event => today >= event.date);
  const currentEvent = pastEvents.length > 0 ? pastEvents[pastEvents.length - 1] : currentEvents[0];
  const eventId = event.queryStringParameters?.event_id || currentEvent.id;
  const yearMatch = currentEvent.id.match(/(\d{4})$/);
  const year = yearMatch ? Number(yearMatch[1]) : null;

  if (!year) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid event_id format. Expected e.g. oscars-2026.' })
    };
  }

  try {
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: eventId } },
        nominees: {}
      }
    });

    const categories = categoriesQuery.categories || [];
    if (categories.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `No categories found for ${eventId}` })
      };
    }

    const officialWinners = await fetchOfficialWinners(eventId, year, categories);
    const mediaWinners = await fetchMediaWinners(eventId, categories);
    const wikipediaWinners = await fetchWikipediaWinners(eventId, categories);

    // Multi-source validation: require consensus from at least 2 sources
    const validatedWinners = new Map();
    for (const category of categories) {
      const officialWinner = officialWinners.get(category.id);
      const mediaWinner = mediaWinners.get(category.id);
      const wikiWinner = wikipediaWinners.get(category.id);

      const sources = [officialWinner, mediaWinner, wikiWinner].filter(Boolean);
      if (sources.length >= 2) {
        // Check if at least 2 sources agree
        const winnerCounts = {};
        sources.forEach(winner => {
          const normWinner = normalize(winner);
          winnerCounts[normWinner] = (winnerCounts[normWinner] || 0) + 1;
        });

        const agreedWinner = Object.entries(winnerCounts).find(([_, count]) => count >= 2)?.[0];
        if (agreedWinner) {
          // Find the original winner name (not normalized)
          const originalWinner = sources.find(w => normalize(w) === agreedWinner);
          validatedWinners.set(category.id, originalWinner);
        }
      } else if (wikiWinner) {
        // If only Wikipedia has data, use it (Wikipedia is reliable for live events)
        validatedWinners.set(category.id, wikiWinner);
      }
    }

    const existingResultsQuery = await db.query({
      results: {
        $: { where: { category_id: { in: categories.map((c) => c.id) } } }
      }
    });
    const existingResults = existingResultsQuery.results || [];
    const existingResultsByCategory = new Map(
      existingResults.map((r) => [r.category_id, r])
    );

    const resultTransactions = [];
    let matchedCount = 0;
    let provisionalCount = 0;

    for (const category of categories) {
      const validatedWinner = validatedWinners.get(category.id);
      const existingResult = existingResultsByCategory.get(category.id);

      if (validatedWinner) {
        const nominee = findNomineeMatch(validatedWinner, category.nominees || []);
        if (!nominee) continue;

        if (existingResult) {
          if (existingResult.winner_nominee_id !== nominee.id) {
            resultTransactions.push(
              db.tx.results[existingResult.id].update({
                winner_nominee_id: nominee.id,
                is_provisional: false,
                finalized_at: Date.now()
              })
            );
            matchedCount++;
          }
        } else {
          const resultId = id();
          resultTransactions.push(
            db.tx.results[resultId].create({
              category_id: category.id,
              winner_nominee_id: nominee.id,
              announced_at: Date.now(),
              is_provisional: false
            })
          );
          matchedCount++;
        }
      }
    }

    if (resultTransactions.length > 0) {
      await db.transact(resultTransactions);
      await recalculateScoresForEvent(eventId, categories.map((c) => c.id));
    }

    console.log(`🎭 [LIVE SCORING] Starting for event: ${eventId}`);
    console.log(`🎭 [LIVE SCORING] Processing event: ${eventId}`);
    console.log(`🎭 [LIVE SCORING] Found ${categories.length} categories`);
    console.log(`🎭 [LIVE SCORING] Found ${validatedWinners.size} winners`);
    console.log(`🎭 [LIVE SCORING] Result:`, { eventId, matched: matchedCount, provisional: provisionalCount, existing: existingResults.length, timestamp: new Date().toISOString() });

    return {
      statusCode: 200,
      body: JSON.stringify({
        eventId,
        matched: matchedCount,
        provisional: provisionalCount,
        existing: existingResults.length,
        debug: {
          categoriesFound: categories.length,
          winnersDetected: validatedWinners.size,
          sampleCategories: categories.slice(0, 3).map(c => c.name),
          sampleWinners: Array.from(validatedWinners.entries()).slice(0, 3)
        },
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('❌ Error in live scoring function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Live scoring failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
