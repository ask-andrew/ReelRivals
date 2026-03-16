import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export const handler = async (event) => {
  try {
    console.log('🎯 [FINAL OSCAR] Simple Oscar scoring with exact nominee names...');
    
    // Get Oscar categories
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: 'oscars-2026' } },
        nominees: {}
      }
    });

    const categories = categoriesQuery.categories || [];
    console.log(`📂 Found ${categories.length} Oscar categories`);
    
    // Create exact winner mapping based on constants file
    const winnerMapping = {
      'Best Picture': 'Sinners',
      'Actress In A Leading Role': 'Mikey Madison', 
      'Actor In A Leading Role': 'Timothée Chalamet',
      'Actress In A Supporting Role': 'Zoe Saldaña',
      'Actor In A Supporting Role': 'Kieran Culkin',
      'Directing': 'Chloé Zhao',
      'Writing (Original Screenplay)': 'Ryan Coogler',
      'Writing (Adapted Screenplay)': 'Paul Thomas Anderson',
      'International Feature Film': 'The Secret Agent (Brazil)',
      'Animated Feature Film': 'Zootopia 2',
      'Documentary Feature Film': 'Mr. Nobody Against Putin',
      'Original Score': 'Ludwig Göransson',
      'Original Song': '"Golden" from KPop Demon Hunters',
      'Casting': 'Nina Gold (Hamnet)',
      'Cinematography': 'Michael Bauman (One Battle After Another)',
      'Film Editing': 'Olivier Bugge Coutté (Sentimental Value)',
      'Costume Design': 'Ruth E. Carter (Sinners)',
      'Production Design': 'Chris Welcker (Sinners)',
      'Makeup and Hairstyling': 'Oscar Nominees (TBA)',
      'Sound': 'Chris Welcker, Benjamin A. Burtt, Felipe Pacheco, Brandon Proctor and Steve Boeddeker (Sinners)',
      'Visual Effects': 'Michael Ralla, Espen Nordahl, Guido Wolter and Donnie Dean (Sinners)',
      'Live Action Short Film': 'A Friend of Dorothy',
      'Documentary Short Film': '"All the Empty Rooms"',
      'Animated Short Film': 'Butterfly'
    };
    
    // Get existing results
    const existingResultsQuery = await db.query({
      results: {
        $: { where: { category_id: { in: categories.map(c => c.id) } } }
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
    
    for (const category of categories) {
      const winnerName = winnerMapping[category.name];
      if (!winnerName) {
        console.log(`⚠️ No winner mapping for: ${category.name}`);
        continue;
      }
      
      const nominees = category.nominees || [];
      const matchingNominee = nominees.find(n => 
        n.name === winnerName || 
        n.name.includes(winnerName) || 
        winnerName.includes(n.name)
      );
      
      if (!matchingNominee) {
        console.log(`❌ No nominee match for ${category.name}: "${winnerName}"`);
        console.log(`   Available nominees: ${nominees.map(n => n.name).join(', ')}`);
        continue;
      }
      
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
          console.log(`🔄 Finalizing ${category.name}: ${winnerName} -> ${matchingNominee.name}`);
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
        console.log(`✅ Creating ${category.name}: ${winnerName} -> ${matchingNominee.name}`);
      }
    }
    
    if (resultTransactions.length > 0) {
      await db.transact(resultTransactions);
      console.log(`📊 Updated ${resultTransactions.length} Oscar results`);
    }
    
    // Calculate scores
    await calculateOscarScoresFinal(categories);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Final Oscar scoring completed',
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
