const { init } = require('@instantdb/core');

const db = init({ 
  appId: 'a4c0e0b8-8b4a-4b4a-8b4a8b4a8b4a', 
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET || 'your-admin-token-here'
});

exports.handler = async (event) => {
  try {
    console.log('🔍 [SCORES CHECK] Examining Oscar scores table...');
    
    // Check ALL scores in database
    const allScoresQuery = await db.queryOnce({
      scores: {}
    });
    
    const allScores = allScoresQuery.data?.scores || [];
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
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Scores check completed',
        totalScores: allScores.length,
        oscarScores: oscarScores.length,
        oscarScoreDetails: oscarScores,
        scoresByEvent: eventScores,
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
