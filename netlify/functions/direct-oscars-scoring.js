import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export const handler = async (event) => {
  try {
    console.log('🎯 [DIRECT OSCAR] Direct Oscar scoring with known category IDs...');
    
    // Known Oscar category IDs from debug
    const oscarCategories = [
      { id: '80561ae9-6994-4c42-85e5-fa01e164595e', name: 'Best Picture', winner: 'Sinners' },
      { id: 'a35570f9-0a2d-4f8d-88eb-ff7e24471ac3', name: 'Directing', winner: 'Chloé Zhao' },
      { id: 'e7e96f91-d3e7-47bb-b2a8-a02797f4361d', name: 'Actor In A Leading Role', winner: 'Timothée Chalamet' },
      { id: '47a185d9-6e35-4bea-bb94-f33a7c5f2b7a', name: 'Actor In A Supporting Role', winner: 'Kieran Culkin' },
      { id: '7299606d-3ac5-41aa-8a5d-a4da543e2227', name: 'Actress In A Supporting Role', winner: 'Zoe Saldaña' },
      { id: 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', name: 'Actress In A Leading Role', winner: 'Mikey Madison' },
      { id: '2e8c2cfe-464a-48ff-8bdf-b06642818d49', name: 'Animated Feature Film', winner: 'Zootopia 2' },
      { id: '7e4874a2-be62-41d2-befe-d8edfc0d9c67', name: 'International Feature Film', winner: 'The Secret Agent (Brazil)' },
      { id: '90c49f28-5365-43b8-bd87-d203bf8f676f', name: 'Writing (Adapted Screenplay)', winner: 'Paul Thomas Anderson' },
      { id: 'bfede57f-1221-4757-931a-b1740817ca94', name: 'Writing (Original Screenplay)', winner: 'Ryan Coogler' }
    ];
    
    console.log(`📂 Processing ${oscarCategories.length} Oscar categories`);
    
    // Get existing results
    const existingResultsQuery = await db.query({
      results: {
        $: { where: { category_id: { in: oscarCategories.map(c => c.id) } } }
      }
    });
    
    const existingResults = existingResultsQuery.results || [];
    const existingResultsByCategory = new Map(
      existingResults.map((r) => [r.category_id, r])
    );
    
    console.log(`🏆 Found ${existingResults.length} existing results`);
    
    // Create/update results
    const resultTransactions = [];
    let updatedCount = 0;
    
    for (const category of oscarCategories) {
      const existingResult = existingResultsByCategory.get(category.id);
      
      if (existingResult) {
        if (!existingResult.finalized_at) {
          resultTransactions.push(
            db.tx.results[existingResult.id].update({
              winner_nominee_id: category.winner, // Store winner name directly for now
              is_provisional: false,
              finalized_at: Date.now()
            })
          );
          updatedCount++;
          console.log(`🔄 Finalizing ${category.name}: ${category.winner}`);
        }
      } else {
        const resultId = id();
        resultTransactions.push(
          db.tx.results[resultId].create({
            category_id: category.id,
            winner_nominee_id: category.winner, // Store winner name directly for now
            announced_at: Date.now(),
            is_provisional: false,
            finalized_at: Date.now()
          })
        );
        updatedCount++;
        console.log(`✅ Creating ${category.name}: ${category.winner}`);
      }
    }
    
    if (resultTransactions.length > 0) {
      await db.transact(resultTransactions);
      console.log(`📊 Updated ${resultTransactions.length} Oscar results`);
    }
    
    // Calculate scores based on picks
    await calculateOscarScoresDirect(oscarCategories);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Direct Oscar scoring completed',
        categoriesProcessed: oscarCategories.length,
        resultsUpdated: resultTransactions.length,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Error in direct Oscar scoring:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Direct Oscar scoring failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function calculateOscarScoresDirect(categories) {
  try {
    console.log('💯 Calculating Oscar scores directly...');
    
    // Get all Oscar picks with ballot info
    const picksQuery = await db.query({
      picks: {
        $: { where: { category_id: { in: categories.map(c => c.id) } } },
        ballot: { user_id: true, league_id: true }
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
      
      const winnerName = winnerByCategory.get(pick.category_id);
      if (!winnerName) return;
      
      // Simple string matching for now
      const isCorrect = pick.nominee_id === winnerName || 
                        pick.nominee_id?.includes(winnerName) || 
                        winnerName.includes(pick.nominee_id);
      
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
    console.error('❌ Error calculating scores:', error);
  }
}
