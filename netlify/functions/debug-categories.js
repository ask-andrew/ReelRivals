import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export const handler = async (event) => {
  try {
    console.log('🔍 [DEBUG] Checking Oscar categories...');
    
    // Get ALL categories to see what exists
    const allCategoriesQuery = await db.query({
      categories: {
        $: {},
        nominees: {}
      }
    });

    const allCategories = allCategoriesQuery.categories || [];
    console.log(`📊 Total categories in database: ${allCategories.length}`);
    
    // Group by event_id
    const events = {};
    allCategories.forEach(cat => {
      if (!events[cat.event_id]) {
        events[cat.event_id] = [];
      }
      events[cat.event_id].push({
        id: cat.id,
        name: cat.name,
        nomineeCount: cat.nominees?.length || 0
      });
    });
    
    console.log('🎭 Events found:', Object.keys(events));
    
    // Show Oscar categories specifically
    const oscarCategories = events['oscars-2026'] || [];
    console.log(`🏆 Oscar categories (${oscarCategories.length}):`);
    
    // Get detailed Oscar categories with nominees
    const oscarCategoriesDetailed = await db.query({
      categories: {
        $: { where: { event_id: 'oscars-2026' } },
        nominees: {}
      }
    });
    
    const detailedCategories = oscarCategoriesDetailed.categories || [];
    console.log(`📊 Detailed Oscar categories: ${detailedCategories.length}`);
    
    const categoryDetails = detailedCategories.map((cat, index) => {
      const nominees = cat.nominees || [];
      return {
        index: index + 1,
        id: cat.id,
        name: cat.name,
        nomineeCount: nominees.length,
        nominees: nominees.slice(0, 3).map(n => ({ id: n.id, name: n.name }))
      };
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        totalCategories: allCategories.length,
        events: Object.keys(events),
        oscarCategories: oscarCategories.length,
        oscarCategoryDetails: categoryDetails,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error in debug function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Debug failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
