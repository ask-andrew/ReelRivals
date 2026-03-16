import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

if (!APP_ID) {
  throw new Error('Missing INSTANT_APP_ID');
}

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token');
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// All events that should have scores calculated
const ALL_EVENTS = [
  { id: 'golden-globes-2026', name: 'Golden Globes' },
  { id: 'baftas-2026', name: 'BAFTAs' },
  { id: 'sag-2026', name: 'SAG Awards' },
  { id: 'oscars-2026', name: 'Oscars' }
];

async function calculateAllEventScores() {
  try {
    console.log('🎭 Starting batch score calculation for ALL events...');

    for (const event of ALL_EVENTS) {
      console.log(`\n🏆 Processing ${event.name} (${event.id})...`);

      try {
        await calculateScoresForEvent(event.id);
        console.log(`✅ ${event.name} scores calculated successfully`);
      } catch (error) {
        console.error(`❌ Failed to calculate ${event.name} scores:`, error.message);
      }
    }

    console.log('\n🎉 Batch score calculation complete for all events!');

  } catch (error) {
    console.error('❌ Batch score calculation failed:', error);
  }
}

async function calculateScoresForEvent(eventId) {
  // Get categories for this event
  const categoriesQuery = await db.query({
    categories: {
      $: { where: { event_id: eventId } },
      nominees: {}
    }
  });

  const categories = categoriesQuery.categories || [];
  if (categories.length === 0) {
    console.log(`No categories found for ${eventId}, skipping...`);
    return;
  }

  console.log(`Found ${categories.length} categories for ${eventId}`);

  // Get finalized results
  const resultsQuery = await db.query({
    results: {
      $: { where: { category_id: { in: categories.map(c => c.id) }, finalized_at: { $exists: true } } }
    }
  });

  const results = resultsQuery.results || [];
  console.log(`Found ${results.length} finalized results for ${eventId}`);

  if (results.length === 0) {
    console.log(`No finalized results for ${eventId}, skipping score calculation...`);
    return;
  }

  // Get picks for this event
  const picksQuery = await db.query({
    picks: {
      $: { where: { category_id: { in: categories.map(c => c.id) } } },
      ballot: { user_id: true, league_id: true },
      category: { base_points: true }
    }
  });

  const picks = picksQuery.picks || [];
  console.log(`Found ${picks.length} picks for ${eventId}`);

  // Get existing scores
  const scoresQuery = await db.query({
    scores: {
      $: { where: { event_id: eventId } }
    }
  });

  const existingScores = scoresQuery.scores || [];

  // Calculate scores
  const winnerByCategory = new Map(results.map(r => [r.category_id, r.winner_nominee_id]));

  const userLeaguePicks = picks.reduce((acc, pick) => {
    const winnerId = winnerByCategory.get(pick.category_id);
    if (!winnerId) return acc;

    const ballot = pick.ballot;
    if (!ballot) return acc;

    const key = `${ballot.user_id}-${ballot.league_id}`;
    if (!acc[key]) {
      acc[key] = {
        userId: ballot.user_id,
        leagueId: ballot.league_id,
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

  console.log(`Calculated scores for ${Object.keys(userLeaguePicks).length} user-league combinations`);

  // Create score transactions
  const scoreTransactions = [];
  const seenKeys = new Set(Object.keys(userLeaguePicks));

  for (const [key, scoreData] of Object.entries(userLeaguePicks)) {
    const { userId, leagueId, correctPicks, powerPicksHit, totalPoints } = scoreData;
    const existingScore = existingScores.find(s => s.user_id === userId && s.league_id === leagueId);

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

  // Reset scores for users who no longer have picks
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
    console.log(`✅ Stored ${scoreTransactions.length} score records for ${eventId}`);
  } else {
    console.log(`No score changes needed for ${eventId}`);
  }
}

calculateAllEventScores();
