import { init } from '@instantdb/core';

const db = init({
  appId: 'a4c0e0b8-8b4a-4b4a-8b4a-8b4a8b4a8b4a', // Hardcoded for script
  apiURI: 'https://api.instantdb.com'
});

async function calculateSAGScores() {
  try {
    console.log('🔄 Calculating SAG scores...');

    // Get SAG categories
    const catQuery = await db.queryOnce({
      categories: {
        $: { where: { event_id: 'sag-2026' } }
      }
    });

    const categories = catQuery.data.categories || [];
    console.log(`Found ${categories.length} SAG categories`);

    if (categories.length === 0) {
      console.log('No SAG categories found');
      return;
    }

    // Get SAG results
    const resultsQuery = await db.queryOnce({
      results: {
        $: { where: { category_id: { in: categories.map(c => c.id) } } }
      }
    });

    const results = resultsQuery.data.results || [];
    console.log(`Found ${results.length} SAG results`);

    // Get SAG picks
    const picksQuery = await db.queryOnce({
      picks: {
        $: { where: { category_id: { in: categories.map(c => c.id) } } },
        ballot: { user_id: true, league_id: true },
        category: { base_points: true }
      }
    });

    const picks = picksQuery.data.picks || [];
    console.log(`Found ${picks.length} SAG picks`);

    // Get existing scores
    const scoresQuery = await db.queryOnce({
      scores: {
        $: { where: { event_id: 'sag-2026' } }
      }
    });

    const existingScores = scoresQuery.data.scores || [];
    console.log(`Found ${existingScores.length} existing SAG scores`);

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
          })
        );
      } else {
        const scoreId = `score-${userId}-${leagueId}-${Date.now()}`;
        scoreTransactions.push(
          db.tx.scores[scoreId].create({
            user_id: userId,
            league_id: leagueId,
            event_id: 'sag-2026',
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
          })
        );
      }
    }

    if (scoreTransactions.length > 0) {
      await db.transact(scoreTransactions);
      console.log(`✅ Stored ${scoreTransactions.length} SAG score records`);
    } else {
      console.log('No new scores to store');
    }

  } catch (error) {
    console.error('❌ Error calculating SAG scores:', error);
  }
}

calculateSAGScores();
