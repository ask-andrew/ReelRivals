import { initCore } from '@instantdb/core';
import { dbCore } from '../src/instant.js';

// Netlify function for scheduled live scoring
export const handler = async (event) => {
  console.log('🏆 Netlify function triggered for live scoring');
  
  // Get event ID from query params or default to Golden Globes
  const eventId = event.queryStringParameters?.event_id || 'golden-globes-2026';
  
  try {
    // Import the scraping function
    const { scrapeWinnersInstantDB } = await import('./live-scraping-instant.mjs');
    
    // Run the scraping
    await scrapeWinnersInstantDB(eventId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Live scoring completed for ${eventId}`,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Error in live scoring function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Live scoring failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
