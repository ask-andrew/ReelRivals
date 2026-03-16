import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// Official Oscar winners from user - same as original script
const OSCAR_WINNERS = [
  { category: 'Best Picture', winner: 'One Battle After Another' },
  { category: 'Best Actress', winner: 'Jessie Buckley, Hamnet' },
  { category: 'Best Actor', winner: 'Michael B. Jordan, Sinners' },
  { category: 'Best Director', winner: 'Paul Thomas Anderson, One Battle After Another' },
  { category: 'Best Supporting Actor', winner: 'Sean Penn, One Battle After Another' },
  { category: 'Best Supporting Actress', winner: 'Amy Madigan, Weapons' },
  { category: 'Best Animated Feature', winner: 'Kpop Demon Hunters' },
  { category: 'Best Casting', winner: 'Cassandra Kulukundis, One Battle After Another' },
  { category: 'Best Live Action Short', winner: 'The Singers' }, // First tie winner
  { category: 'Best Live Action Short', winner: 'Two People Exchanging Saliva' }, // Second tie winner
  { category: 'Best Documentary Feature', winner: 'Mr. Nobody Against Putin' },
  { category: 'Best Original Score', winner: 'Ludwig Göransson, Sinners' },
  { category: 'Best International Feature', winner: 'Sentimental Value, Norway' }
];

export const handler = async (event) => {
  try {
    console.log('🏆 [FINAL OSCAR] Using original winner matching logic...');
    
    // Get Oscar categories
    const catQuery = await db.query({
      categories: {
        $: { where: { event_id: 'oscars-2026' } },
        nominees: {}
      }
    });

    const categories = catQuery.categories || [];
    console.log(`📂 Found ${categories.length} Oscar categories`);
    
    // Create category name to ID mapping (same as original script)
    const categoryMap = new Map();
    categories.forEach(cat => {
      const cleanName = cat.name.toLowerCase().replace(/best /i, '').trim();
      categoryMap.set(cleanName, cat);
    });
    
    // Get existing results
    const resultsQuery = await db.query({
      results: {
        $: { where: { event_id: 'oscars-2026' } }
      }
    });
    
    const existingResults = resultsQuery.results || [];
    const existingResultsByCategory = new Map(
      existingResults.map((r) => [r.category_id, r])
    );
    
    console.log(`🏆 Found ${existingResults.length} existing results`);
    
    // Create/update results using original matching logic
    const resultTransactions = [];
    let updatedCount = 0;
    
    for (const winner of OSCAR_WINNERS) {
      const categoryKey = winner.category.toLowerCase().replace(/best /i, '').trim();
      const category = categoryMap.get(categoryKey);
      
      if (!category) {
        console.log(`❌ Category not found: ${winner.category}`);
        continue;
      }
      
      // Find matching nominee using original logic
      const nominees = category.nominees || [];
      let matchingNominee = null;
      
      // Try exact match first
      matchingNominee = nominees.find(n => n.name.toLowerCase() === winner.winner.toLowerCase());
      
      // Try partial match (first part before comma)
      if (!matchingNominee && winner.winner.includes(',')) {
        const firstPart = winner.winner.split(',')[0].trim();
        matchingNominee = nominees.find(n => n.name.toLowerCase().includes(firstPart.toLowerCase()));
      }
      
      // Try containing match
      if (!matchingNominee) {
        matchingNominee = nominees.find(n =>
          n.name.toLowerCase().includes(winner.winner.toLowerCase()) ||
          winner.winner.toLowerCase().includes(n.name.toLowerCase())
        );
      }
      
      if (!matchingNominee) {
        console.log(`❌ No nominee match for: ${winner.category} -> ${winner.winner}`);
        console.log(`   Available: ${nominees.map(n => n.name).join(', ')}`);
        continue;
      }
      
      console.log(`✅ ${winner.category}: ${winner.winner} -> ${matchingNominee.name}`);
      
      const existingResult = existingResultsByCategory.get(category.id);
      
      if (existingResult) {
        if (!existingResult.finalized_at) {
          resultTransactions.push(
            db.tx.results[existingResult.id].update({
              winner_nominee_id: matchingNominee.id,
              is_provisional: false,
              finalized_at: Date.now()
            })
          );
          updatedCount++;
          console.log(`🔄 Finalizing ${winner.category}`);
        }
      } else {
        const resultId = id();
        resultTransactions.push(
          db.tx.results[resultId].create({
            category_id: category.id,
            winner_nominee_id: matchingNominee.id,
            announced_at: Date.now(),
            is_provisional: false,
            finalized_at: Date.now()
          })
        );
        updatedCount++;
        console.log(`✅ Creating ${winner.category}`);
      }
    }
    
    if (resultTransactions.length > 0) {
      await db.transact(resultTransactions);
      console.log(`📊 Updated ${resultTransactions.length} Oscar results`);
      
      // Calculate scores immediately after results are created
      await calculateOscarScoresFinal(categories);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Final Oscar scoring with original logic completed',
        categoriesProcessed: categories.length,
        resultsUpdated: resultTransactions.length,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Error in final Oscar scoring:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Final Oscar scoring failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function calculateOscarScoresFinal(categories) {
  try {
    console.log('💯 Calculating final Oscar scores...');
    
    // Get all Oscar picks with ballot info
    const picksQuery = await db.query({
      picks: {
        $: { where: { category_id: { in: categories.map(c => c.id) } } },
        ballot: { user_id: true, league_id: true },
        nominee: {}
      }
    });
    
    const picks = picksQuery.picks || [];
    console.log(`🎯 Found ${picks.length} Oscar picks`);
    
    // Get Oscar results
    const resultsQuery = await db.query({
      results: {
        $: { where: { category_id: { in: categories.map(c => c.id) } } }
      }
    });
    
    const results = resultsQuery.results || [];
    const winnerByCategory = new Map(
      results.filter(r => r.finalized_at).map(r => [r.category_id, r.winner_nominee_id])
    );
    
    console.log(`🏆 Found ${winnerByCategory.size} finalized winners`);
    
    // Group picks by user-league and calculate scores
    const userLeaguePicks = {};
    
    picks.forEach(pick => {
      if (!pick.ballot) return;
      
      const key = `${pick.ballot.user_id}-${pick.ballot.league_id}`;
      if (!userLeaguePicks[key]) {
        userLeaguePicks[key] = {
          userId: pick.ballot.user_id,
          leagueId: pick.ballot.league_id,
          correctPicks: 0,
          powerPicksHit: 0,
          totalPoints: 0
        };
      }
      
      const winnerId = winnerByCategory.get(pick.category_id);
      if (!winnerId) return;
      
      const isCorrect = pick.nominee_id === winnerId;
      const isPowerPick = pick.is_power_pick;
      const basePoints = 50; // Simplified
      
      if (isCorrect) {
        userLeaguePicks[key].correctPicks++;
        userLeaguePicks[key].totalPoints += isPowerPick ? basePoints * 3 : basePoints;
        if (isPowerPick) userLeaguePicks[key].powerPicksHit++;
      }
    });
    
    console.log(`👥 Calculating scores for ${Object.keys(userLeaguePicks).length} user-league combinations`);
    
    // Store scores
    const scoreTransactions = [];
    
    for (const [key, scoreData] of Object.entries(userLeaguePicks)) {
      const scoreId = id();
      
      scoreTransactions.push(
        db.tx.scores[scoreId].upsert({
          user_id: scoreData.userId,
          league_id: scoreData.leagueId,
          event_id: 'oscars-2026',
          total_points: scoreData.totalPoints,
          correct_picks: scoreData.correctPicks,
          power_picks_hit: scoreData.powerPicksHit,
          updated_at: Date.now()
        })
      );
      
      console.log(`💾 User ${scoreData.userId}: ${scoreData.totalPoints} points (${scoreData.correctPicks} correct)`);
    }
    
    if (scoreTransactions.length > 0) {
      await db.transact(scoreTransactions);
      console.log(`✅ Stored ${scoreTransactions.length} Oscar scores`);
    }
    
  } catch (error) {
    console.error('❌ Error calculating final scores:', error);
  }
}
