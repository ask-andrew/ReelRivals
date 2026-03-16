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
    
    // Debug: List all found categories and nominees
    const categoryDebug = categories.map((cat, index) => {
      const nomineeNames = cat.nominees?.map(n => n.name) || [];
      return {
        index: index + 1,
        id: cat.id,
        name: cat.name,
        nomineeCount: cat.nominees?.length || 0,
        nominees: nomineeNames.slice(0, 3) // Show first 3 nominees
      };
    });
    
    console.log('🔍 Category Debug Info:', JSON.stringify(categoryDebug, null, 2));
    
    if (categories.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No Oscar categories found' })
      };
    }

    // Create dynamic manual winners based on actual categories found
    const manualWinners = new Map();
    
    // Map winners based on category names and IDs
    categories.forEach(category => {
      const categoryId = category.id;
      const categoryName = category.name.toLowerCase();
      
      // Map winners based on category identification
      if (categoryId.includes('picture') || categoryName.includes('picture')) {
        manualWinners.set(categoryId, 'Sinners');
      } else if (categoryId.includes('actress-leading') || categoryName.includes('actress') && categoryName.includes('leading')) {
        manualWinners.set(categoryId, 'Mikey Madison');
      } else if (categoryId.includes('actor-leading') || categoryName.includes('actor') && categoryName.includes('leading')) {
        manualWinners.set(categoryId, 'Timothée Chalamet');
      } else if (categoryId.includes('actress-supporting') || categoryName.includes('actress') && categoryName.includes('supporting')) {
        manualWinners.set(categoryId, 'Zoe Saldaña');
      } else if (categoryId.includes('actor-supporting') || categoryName.includes('actor') && categoryName.includes('supporting')) {
        manualWinners.set(categoryId, 'Kieran Culkin');
      } else if (categoryId.includes('directing') || categoryName.includes('director')) {
        manualWinners.set(categoryId, 'Chloé Zhao');
      } else if (categoryId.includes('original-screenplay') || categoryName.includes('original') && categoryName.includes('screenplay')) {
        manualWinners.set(categoryId, 'Ryan Coogler');
      } else if (categoryId.includes('adapted-screenplay') || categoryName.includes('adapted') && categoryName.includes('screenplay')) {
        manualWinners.set(categoryId, 'Paul Thomas Anderson');
      } else if (categoryId.includes('international-feature') || categoryName.includes('international')) {
        manualWinners.set(categoryId, 'The Secret Agent (Brazil)');
      } else if (categoryId.includes('animated-feature') || categoryName.includes('animated')) {
        manualWinners.set(categoryId, 'Zootopia 2');
      } else if (categoryId.includes('documentary-feature') || categoryName.includes('documentary')) {
        manualWinners.set(categoryId, 'Mr. Nobody Against Putin');
      } else if (categoryId.includes('original-score') || categoryName.includes('score')) {
        manualWinners.set(categoryId, 'Ludwig Göransson');
      } else if (categoryId.includes('original-song') || categoryName.includes('song')) {
        manualWinners.set(categoryId, '"Golden" from KPop Demon Hunters');
      } else if (categoryId.includes('casting')) {
        manualWinners.set(categoryId, 'Nina Gold (Hamnet)');
      } else if (categoryId.includes('cinematography')) {
        manualWinners.set(categoryId, 'Michael Bauman (One Battle After Another)');
      } else if (categoryId.includes('film-editing') || categoryName.includes('editing')) {
        manualWinners.set(categoryId, 'Olivier Bugge Coutté (Sentimental Value)');
      } else if (categoryId.includes('costume-design') || categoryName.includes('costume')) {
        manualWinners.set(categoryId, 'Ruth E. Carter (Sinners)');
      } else if (categoryId.includes('production-design') || categoryName.includes('production')) {
        manualWinners.set(categoryId, 'Chris Welcker (Sinners)');
      } else if (categoryId.includes('makeup-hairstyling') || categoryName.includes('makeup')) {
        manualWinners.set(categoryId, 'Oscar Nominees (TBA)');
      } else if (categoryId.includes('sound')) {
        manualWinners.set(categoryId, 'Chris Welcker, Benjamin A. Burtt, Felipe Pacheco, Brandon Proctor and Steve Boeddeker (Sinners)');
      } else if (categoryId.includes('visual-effects') || categoryName.includes('effects')) {
        manualWinners.set(categoryId, 'Michael Ralla, Espen Nordahl, Guido Wolter and Donnie Dean (Sinners)');
      } else if (categoryId.includes('live-action-short') || categoryName.includes('short')) {
        manualWinners.set(categoryId, 'A Friend of Dorothy');
      } else if (categoryId.includes('documentary-short')) {
        manualWinners.set(categoryId, '"All the Empty Rooms"');
      } else if (categoryId.includes('animated-short')) {
        manualWinners.set(categoryId, 'Butterfly');
      } else {
        // Default fallback
        console.log(` Unknown category: ${categoryId} - ${category.name}`);
        manualWinners.set(categoryId, 'Sinners'); // Default fallback
      }
    });
    
    console.log(` Mapped ${manualWinners.size} manual winners`);
    
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
