import { init } from '@instantdb/core';

const db = init({ 
  appId: 'a4c0e0b8-8b4a-4b4a-8b4a8b4a8b4a', 
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET || 'your-admin-token-here'
});

export const handler = async (event) => {
  try {
    console.log('🔍 [SCORES CHECK] Examining Oscar scores table...');
    
    // Check ALL scores in database
    const allScoresQuery = await db.query({
      scores: {}
    });
    
    const allScores = allScoresQuery.scores || [];
    console.log(`📊 Total scores in database: ${allScores.length}`);
    
    // Filter for Oscar scores
    const oscarScores = allScores.filter(score => score.event_id === 'oscars-2026');
    console.log(`🏆 Oscar scores found: ${oscarScores.length}`);
    
    if (oscarScores.length > 0) {
      console.log('🎯 Oscar scores details:');
      oscarScores.forEach((score, index) => {
        console.log(`  ${index + 1}. User: ${score.user_id}, League: ${score.league_id}, Points: ${score.total_points}, Correct: ${score.correct_picks}, Power: ${score.power_picks_hit}`);
      });
    } else {
      console.log('❌ No Oscar scores found in database');
    }
    
    // Check if there are any scores for other events to compare
    const eventScores = {};
    allScores.forEach(score => {
      if (!eventScores[score.event_id]) {
        eventScores[score.event_id] = 0;
      }
      eventScores[score.event_id]++;
    });
    
    console.log('📈 Scores by event:');
    Object.entries(eventScores).forEach(([eventId, count]) => {
      console.log(`  ${eventId}: ${count} scores`);
    });
    
    // Also check if there are any picks for Oscars
    const picksQuery = await db.query({
      picks: {
        $: { where: { category_id: { in: ['80561ae9-6994-4c42-85e5-fa01e164595e', 'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6'] } }, // Best Picture & Actress Leading
        ballot: { user_id: true, league_id: true }
      }
    });
    
    const picks = picksQuery.picks || [];
    console.log(`🎯 Oscar picks found: ${picks.length}`);
    
    if (picks.length > 0) {
      const userPicks = {};
      picks.forEach(pick => {
        if (!userPicks[pick.ballot.user_id]) {
          userPicks[pick.ballot.user_id] = 0;
        }
        userPicks[pick.ballot.user_id]++;
      });
      
      console.log('👥 Users with Oscar picks:');
      Object.entries(userPicks).forEach(([userId, count]) => {
        console.log(`  ${userId}: ${count} picks`);
      });
    }
    
    // Check results table too
    const resultsQuery = await db.query({
      results: {
        $: { where: { event_id: 'oscars-2026' } }
      }
    });
    
    const results = resultsQuery.results || [];
    const finalizedResults = results.filter(r => r.finalized_at);
    console.log(`🏆 Oscar results: ${results.length} total, ${finalizedResults.length} finalized`);
    
    if (finalizedResults.length > 0) {
      console.log('📋 Finalized results:');
      finalizedResults.slice(0, 5).forEach((result, index) => {
        console.log(`  ${index + 1}. Category: ${result.category_id}, Winner: ${result.winner_nominee_id}`);
      });
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Scores check completed',
        totalScores: allScores.length,
        oscarScores: oscarScores.length,
        oscarScoreDetails: oscarScores,
        scoresByEvent: eventScores,
        oscarPicks: picks.length,
        oscarResults: results.length,
        oscarFinalizedResults: finalizedResults.length,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Error checking scores:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Scores check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
