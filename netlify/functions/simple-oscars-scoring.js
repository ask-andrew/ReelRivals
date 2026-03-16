import { load } from 'cheerio';
import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

if (!APP_ID) {
  throw new Error('Missing INSTANT_APP_ID. Set it in Netlify environment variables.');
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export const handler = async (event) => {
  if (!ADMIN_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing InstantDB admin token'
      })
    };
  }

  try {
    console.log('🎭 [SIMPLE OSCAR SCORING] Starting Oscar score calculation...');
    
    // Get Oscar categories
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: 'oscars-2026' } },
        nominees: {}
      }
    });

    const categories = categoriesQuery.categories || [];
    console.log(`📂 Found ${categories.length} Oscar categories`);
    
    // Debug: List all found categories
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.id} - ${cat.name}`);
    });
    
    if (categories.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No Oscar categories found' })
      };
    }

    // Manual Oscar winners
    const manualWinners = new Map([
      ['best-picture', 'Sinners'],
      ['actress-leading', 'Mikey Madison'],
      ['actor-leading', 'Timothée Chalamet'],
      ['actress-supporting', 'Zoe Saldaña'],
      ['actor-supporting', 'Kieran Culkin'],
      ['directing', 'Chloé Zhao'],
      ['original-screenplay', 'Ryan Coogler'],
      ['adapted-screenplay', 'Paul Thomas Anderson'],
      ['international-feature', 'The Secret Agent (Brazil)'],
      ['animated-feature', 'Zootopia 2'],
      ['documentary-feature', 'Mr. Nobody Against Putin'],
      ['original-score', 'Ludwig Göransson'],
      ['original-song', '"Golden" from KPop Demon Hunters'],
      ['casting', 'Nina Gold (Hamnet)'],
      ['cinematography', 'Michael Bauman (One Battle After Another)'],
      ['film-editing', 'Olivier Bugge Coutté (Sentimental Value)'],
      ['costume-design', 'Ruth E. Carter (Sinners)'],
      ['production-design', 'Chris Welcker (Sinners)'],
      ['makeup-hairstyling', 'Oscar Nominees (TBA)'],
      ['sound', 'Chris Welcker, Benjamin A. Burtt, Felipe Pacheco, Brandon Proctor and Steve Boeddeker (Sinners)'],
      ['visual-effects', 'Michael Ralla, Espen Nordahl, Guido Wolter and Donnie Dean (Sinners)'],
      ['live-action-short', 'A Friend of Dorothy'],
      ['documentary-short', '"All the Empty Rooms"'],
      ['animated-short', 'Butterfly']
    ]);

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

    // Update/create results
    const resultTransactions = [];
    let updatedCount = 0;

    for (const category of categories) {
      const winnerName = manualWinners.get(category.id);
      if (!winnerName) {
        console.log(`⚠️ No winner for category: ${category.id}`);
        continue;
      }
      
      const nominee = category.nominees?.find(n => 
        n.name === winnerName || 
        n.name.includes(winnerName) || 
        winnerName.includes(n.name)
      );
      
      if (!nominee) {
        console.log(`❌ No nominee match for ${category.id}: ${winnerName}`);
        continue;
      }
      
      const existingResult = existingResultsByCategory.get(category.id);
      
      if (existingResult) {
        if (existingResult.winner_nominee_id !== nominee.id || !existingResult.finalized_at) {
          resultTransactions.push(
            db.tx.results[existingResult.id].update({
              winner_nominee_id: nominee.id,
              is_provisional: false,
              finalized_at: Date.now()
            })
          );
          updatedCount++;
          console.log(`🔄 Updating ${category.name}: ${winnerName}`);
        }
      } else {
        const resultId = id();
        resultTransactions.push(
          db.tx.results[resultId].create({
            category_id: category.id,
            winner_nominee_id: nominee.id,
            announced_at: Date.now(),
            is_provisional: false,
            finalized_at: Date.now()
          })
        );
        updatedCount++;
        console.log(`✅ Creating ${category.name}: ${winnerName}`);
      }
    }
    
    if (resultTransactions.length > 0) {
      await db.transact(resultTransactions);
      console.log(`📊 Updated ${resultTransactions.length} Oscar results`);
    }

    // Calculate scores
    await calculateOscarScores(categories);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Oscar scoring completed',
        categoriesProcessed: categories.length,
        resultsUpdated: resultTransactions.length,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error in simple Oscar scoring:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Oscar scoring failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function calculateOscarScores(categories) {
  try {
    console.log('💯 Calculating Oscar scores...');
    
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
    
    // Group picks by user-league
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
      
      // Get base points from category
      const category = categories.find(c => c.id === pick.category_id);
      const basePoints = category?.base_points || 50;
      
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
