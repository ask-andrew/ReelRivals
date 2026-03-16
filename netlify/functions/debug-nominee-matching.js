import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export const handler = async (event) => {
  try {
    console.log('🔍 [NOMINEE DEBUG] Checking nominee matching...');
    
    // Get Oscar categories with nominees
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: 'oscars-2026' } },
        nominees: {}
      }
    });

    const categories = categoriesQuery.categories || [];
    console.log(`📂 Found ${categories.length} Oscar categories`);
    
    const debugInfo = [];
    
    // Show detailed nominee info for each category
    for (const category of categories) {
      const nominees = category.nominees || [];
      
      // Show what winner would match
      const categoryLower = category.name.toLowerCase();
      let expectedWinner = '';
      
      if (categoryLower.includes('picture')) {
        expectedWinner = 'Sinners';
      } else if (categoryLower.includes('actress') && categoryLower.includes('leading')) {
        expectedWinner = 'Mikey Madison';
      } else if (categoryLower.includes('actor') && categoryLower.includes('leading')) {
        expectedWinner = 'Timothée Chalamet';
      } else if (categoryLower.includes('actress') && categoryLower.includes('supporting')) {
        expectedWinner = 'Zoe Saldaña';
      } else if (categoryLower.includes('actor') && categoryLower.includes('supporting')) {
        expectedWinner = 'Kieran Culkin';
      } else if (categoryLower.includes('directing')) {
        expectedWinner = 'Chloé Zhao';
      } else if (categoryLower.includes('original') && categoryLower.includes('screenplay')) {
        expectedWinner = 'Ryan Coogler';
      } else if (categoryLower.includes('adapted') && categoryLower.includes('screenplay')) {
        expectedWinner = 'Paul Thomas Anderson';
      } else if (categoryLower.includes('international')) {
        expectedWinner = 'The Secret Agent (Brazil)';
      } else if (categoryLower.includes('animated')) {
        expectedWinner = 'Zootopia 2';
      } else if (categoryLower.includes('documentary')) {
        expectedWinner = 'Mr. Nobody Against Putin';
      } else if (categoryLower.includes('score')) {
        expectedWinner = 'Ludwig Göransson';
      } else if (categoryLower.includes('song')) {
        expectedWinner = '"Golden" from KPop Demon Hunters';
      } else if (categoryLower.includes('casting')) {
        expectedWinner = 'Nina Gold (Hamnet)';
      } else if (categoryLower.includes('cinematography')) {
        expectedWinner = 'Michael Bauman (One Battle After Another)';
      } else if (categoryLower.includes('editing')) {
        expectedWinner = 'Olivier Bugge Coutté (Sentimental Value)';
      } else if (categoryLower.includes('costume')) {
        expectedWinner = 'Ruth E. Carter (Sinners)';
      } else if (categoryLower.includes('production')) {
        expectedWinner = 'Chris Welcker (Sinners)';
      } else if (categoryLower.includes('makeup')) {
        expectedWinner = 'Oscar Nominees (TBA)';
      } else if (categoryLower.includes('sound')) {
        expectedWinner = 'Chris Welcker, Benjamin A. Burtt, Felipe Pacheco, Brandon Proctor and Steve Boeddeker (Sinners)';
      } else if (categoryLower.includes('effects')) {
        expectedWinner = 'Michael Ralla, Espen Nordahl, Guido Wolter and Donnie Dean (Sinners)';
      } else if (categoryLower.includes('short')) {
        expectedWinner = 'A Friend of Dorothy';
      }
      
      // Check if expected winner matches any nominee
      const matchingNominee = nominees.find(n => 
        n.name === expectedWinner || 
        n.name.includes(expectedWinner) || 
        expectedWinner.includes(n.name)
      );
      
      debugInfo.push({
        categoryId: category.id,
        categoryName: category.name,
        nomineeCount: nominees.length,
        nominees: nominees.slice(0, 5).map(n => ({ id: n.id, name: n.name })),
        expectedWinner,
        hasMatch: !!matchingNominee,
        matchingNominee: matchingNominee ? { id: matchingNominee.id, name: matchingNominee.name } : null
      });
    }
    
    // Also check existing picks
    const picksQuery = await db.query({
      picks: {
        $: { where: { category_id: { in: categories.map(c => c.id) } } },
        ballot: { user_id: true, league_id: true },
        nominee: {}
      }
    });
    
    const picks = picksQuery.picks || [];
    
    // Group picks by user
    const userPicks = {};
    picks.forEach(pick => {
      if (!pick.ballot) return;
      
      if (!userPicks[pick.ballot.user_id]) {
        userPicks[pick.ballot.user_id] = [];
      }
      userPicks[pick.ballot.user_id].push({
        categoryId: pick.category_id,
        nomineeName: pick.nominee?.name || 'Unknown',
        isPowerPick: pick.is_power_pick
      });
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Nominee matching debug completed',
        categoriesProcessed: categories.length,
        debugInfo,
        userPicks: Object.keys(userPicks).length,
        totalPicks: picks.length,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Error in nominee debug:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Nominee debug failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
