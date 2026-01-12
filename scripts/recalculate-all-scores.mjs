import { init } from '@instantdb/core';

// Instant DB configuration
const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';

// Initialize Instant DB Core Client
const dbCore = init({
  appId: APP_ID,
});

const EVENT_ID = 'golden-globes-2026';

async function recalculateScoresInstantDB(eventId, categoryId, winnerNomineeId) {
  try {
    // Get all picks for this category
    const picksData = await dbCore.query({
      picks: {
        $: {
          where: {
            category_id: categoryId
          }
        },
        ballot: {
          user_id: true,
          league_id: true
        },
        category: {
          base_points: true
        }
      }
    });

    const picks = picksData.picks;

    // Group picks by user and league
    const userLeaguePicks = picks.reduce((acc, pick) => {
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

      const isCorrect = pick.nominee_id === winnerNomineeId;
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

    // Update scores for each user/league combination
    for (const [key, scoreData] of Object.entries(userLeaguePicks)) {
      const { userId, leagueId, correctPicks, powerPicksHit, totalPoints } = scoreData;

      // Check if score already exists
      const existingScores = await dbCore.query({
        scores: {
          $: {
            where: {
              user_id: userId,
              league_id: leagueId,
              event_id: eventId
            }
          }
        }
      });

      if (existingScores.scores && existingScores.scores.length > 0) {
        // Update existing score
        await dbCore.transact([
          dbCore.tx.scores[existingScores.scores[0].id].update({
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        ]);
      } else {
        // Create new score
        await dbCore.transact([
          dbCore.tx.scores.create({
            user_id: userId,
            league_id: leagueId,
            event_id: eventId,
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        ]);
      }
    }

    console.log(`✅ Scores recalculated for category ${categoryId}`);
    
  } catch (error) {
    console.error(`❌ Error recalculating scores:`, error);
  }
}

async function main() {
  console.log('🔄 Recalculating all scores for Golden Globes 2026...');

  // Get all results
  const resultsData = await dbCore.query({
    results: {
      $: {
        where: {
          // Note: results table doesn't have event_id field in current schema
          // We'll need to join with categories to filter by event
        }
      },
      category: {
        event_id: true
      }
    }
  });

  const results = resultsData.results || [];
  console.log(`📊 Found ${results.length} results to process`);

  for (const result of results) {
    if (result.category && result.category.event_id === EVENT_ID) {
      console.log(`🔄 Processing category: ${result.category.name}`);
      await recalculateScoresInstantDB(EVENT_ID, result.category_id, result.winner_nominee_id);
    }
  }

  console.log('🎉 Score recalculation completed!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
