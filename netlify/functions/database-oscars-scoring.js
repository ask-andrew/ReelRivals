import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export const handler = async (event) => {
  try {
    console.log('🎯 [DATABASE OSCAR] Using actual nominee data from InstantDB...');
    
    // Get Oscar categories with nominees
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: 'oscars-2026' } },
        nominees: {}
      }
    });

    const categories = categoriesQuery.categories || [];
    console.log(`📂 Found ${categories.length} Oscar categories`);
    
    // Winner mapping based on actual nominee names in database
    const winnerMapping = {
      'Sinners': '3a146005-d0d4-44ce-a5fe-251a474f35f6', // Best Picture
      'Chloé Zhao': '291cc199-64cb-4e75-a8ea-06d357008ad6', // Directing  
      'Timothée Chalamet': '28c7eeaf-9e46-4854-9a7a-49763de6fd8b', // Actor Leading
      'Kieran Culkin': '33943825-3f4c-47d0-8d11-98519f639ca3', // Actor Supporting
      'Zoe Saldaña': 'c39cda13-9609-4651-8850-f4356c1f1cab', // Actress Supporting
      'Mikey Madison': 'd009c8e9-c1fa-4b75-bd57-a1eece0e1c2c', // Actress Leading
      'Ryan Coogler': 'cad3d5c4-5f56-46cf-8980-e8e1249691c2', // Original Screenplay
      'Paul Thomas Anderson': 'c45d2355-eb91-4020-8a9b-4386e0c893ad', // Adapted Screenplay
      'The Secret Agent (Brazil)': 'e9466632-85d7-44ba-ae60-d619f2dccdf5', // International Feature
      'Zootopia 2': '24fbcdf8-fbe9-4c74-9f4f-c7dc33516250', // Animated Feature
      'Mr. Nobody Against Putin': '65d078c7-8b1c-48c2-9444-db1295c9f328', // Documentary Feature
      'Ludwig Göransson': 'ea6242db-e750-4e20-8b6c-aab58bbf0d80', // Original Score
      '"Golden" from KPop Demon Hunters': 'bfede57f-1221-4757-931a-b1740817ca94', // Original Song
      'Nina Gold (Hamnet)': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', // Casting
      'Michael Bauman (One Battle After Another)': 'e8da7ef2-19bd-4300-a9c5-2b075091880f', // Cinematography
      'Olivier Bugge Coutté (Sentimental Value)': 'eccf9b1b-9915-4cf4-b02a-0d2bb2b45398', // Film Editing
      'Ruth E. Carter (Sinners)': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', // Costume Design
      'Chris Welcker (Sinners)': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', // Production Design
      'Oscar Nominees (TBA)': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', // Makeup & Hairstyling
      'Chris Welcker, Benjamin A. Burtt, Felipe Pacheco, Brandon Proctor and Steve Boeddeker (Sinners)': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', // Sound
      'Michael Ralla, Espen Nordahl, Guido Wolter and Donnie Dean (Sinners)': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', // Visual Effects
      'A Friend of Dorothy': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', // Live Action Short
      '"All the Empty Rooms"': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6', // Documentary Short
      'Butterfly': 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6'  // Animated Short
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
      const nominees = category.nominees || [];
      
      // Find winner nominee by name matching
      let winnerNomineeId = null;
      let winnerName = '';
      
      // Determine winner based on category name
      const categoryName = category.name.toLowerCase();
      if (categoryName.includes('picture')) {
        winnerName = 'Sinners';
      } else if (categoryName.includes('actress') && categoryName.includes('leading')) {
        winnerName = 'Mikey Madison';
      } else if (categoryName.includes('actor') && categoryName.includes('leading')) {
        winnerName = 'Timothée Chalamet';
      } else if (categoryName.includes('actress') && categoryName.includes('supporting')) {
        winnerName = 'Zoe Saldaña';
      } else if (categoryName.includes('actor') && categoryName.includes('supporting')) {
        winnerName = 'Kieran Culkin';
      } else if (categoryName.includes('directing')) {
        winnerName = 'Chloé Zhao';
      } else if (categoryName.includes('original') && categoryName.includes('screenplay')) {
        winnerName = 'Ryan Coogler';
      } else if (categoryName.includes('adapted') && categoryName.includes('screenplay')) {
        winnerName = 'Paul Thomas Anderson';
      } else if (categoryName.includes('international')) {
        winnerName = 'The Secret Agent (Brazil)';
      } else if (categoryName.includes('animated')) {
        winnerName = 'Zootopia 2';
      } else if (categoryName.includes('documentary')) {
        winnerName = 'Mr. Nobody Against Putin';
      } else if (categoryName.includes('score')) {
        winnerName = 'Ludwig Göransson';
      } else if (categoryName.includes('song')) {
        winnerName = '"Golden" from KPop Demon Hunters';
      } else if (categoryName.includes('casting')) {
        winnerName = 'Nina Gold (Hamnet)';
      } else if (categoryName.includes('cinematography')) {
        winnerName = 'Michael Bauman (One Battle After Another)';
      } else if (categoryName.includes('editing')) {
        winnerName = 'Olivier Bugge Coutté (Sentimental Value)';
      } else if (categoryName.includes('costume')) {
        winnerName = 'Ruth E. Carter (Sinners)';
      } else if (categoryName.includes('production')) {
        winnerName = 'Chris Welcker (Sinners)';
      } else if (categoryName.includes('makeup')) {
        winnerName = 'Oscar Nominees (TBA)';
      } else if (categoryName.includes('sound')) {
        winnerName = 'Chris Welcker, Benjamin A. Burtt, Felipe Pacheco, Brandon Proctor and Steve Boeddeker (Sinners)';
      } else if (categoryName.includes('effects')) {
        winnerName = 'Michael Ralla, Espen Nordahl, Guido Wolter and Donnie Dean (Sinners)';
      } else if (categoryName.includes('short')) {
        winnerName = 'A Friend of Dorothy';
      }
      
      // Find matching nominee
      const matchingNominee = nominees.find(n => 
        n.name === winnerName || 
        n.name.includes(winnerName) || 
        winnerName.includes(n.name)
      );
      
      if (matchingNominee) {
        winnerNomineeId = matchingNominee.id;
        console.log(`✅ ${category.name}: "${winnerName}" -> "${matchingNominee.name}" (${matchingNominee.id})`);
      } else {
        console.log(`❌ ${category.name}: No match for "${winnerName}"`);
        console.log(`   Available: ${nominees.map(n => n.name).join(', ')}`);
        continue;
      }
      
      const existingResult = existingResultsByCategory.get(category.id);
      
      if (existingResult) {
        if (!existingResult.finalized_at) {
          resultTransactions.push(
            db.tx.results[existingResult.id].update({
              winner_nominee_id: winnerNomineeId,
              is_provisional: false,
              finalized_at: Date.now()
            })
          );
          updatedCount++;
          console.log(`🔄 Finalizing ${category.name}`);
        }
      } else {
        const resultId = id();
        resultTransactions.push(
          db.tx.results[resultId].create({
            category_id: category.id,
            winner_nominee_id: winnerNomineeId,
            announced_at: Date.now(),
            is_provisional: false,
            finalized_at: Date.now()
          })
        );
        updatedCount++;
        console.log(`✅ Creating ${category.name}`);
      }
    }
    
    if (resultTransactions.length > 0) {
      await db.transact(resultTransactions);
      console.log(`📊 Updated ${resultTransactions.length} Oscar results`);
    }
    
    // Calculate scores
    await calculateOscarScoresDatabase(categories);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Database Oscar scoring completed',
        categoriesProcessed: categories.length,
        resultsUpdated: resultTransactions.length,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Error in database Oscar scoring:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Database Oscar scoring failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function calculateOscarScoresDatabase(categories) {
  try {
    console.log('💯 Calculating Oscar scores with database data...');
    
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
    console.error('❌ Error calculating scores:', error);
  }
}
