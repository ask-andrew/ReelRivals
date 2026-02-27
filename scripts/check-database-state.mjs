import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname });

const APP_ID = process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set VITE_INSTANT_SECRET or INSTANT_APP_ADMIN_TOKEN.');
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n');
    
    // Check all main tables
    const tables = ['events', 'categories', 'nominees', 'ballots', 'picks', 'users', 'leagues'];
    
    for (const table of tables) {
      try {
        const result = await db.query({
          [table]: { $: {} }
        });
        
        const count = result.data[table]?.length || 0;
        console.log(`📊 ${table}: ${count} records`);
        
        if (table === 'events' && count > 0) {
          console.log('   Events found:');
          result.data.events.forEach(event => {
            console.log(`   - ${event.name} (${event.id}) - Active: ${event.is_active}`);
          });
        }
      } catch (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      }
    }
    
    // Check if we need to seed events
    const eventsResult = await db.query({
      events: { $: {} }
    });
    
    if (eventsResult.data.events.length === 0) {
      console.log('\n🌱 No events found. You may need to seed events first.');
      console.log('Try running: npm run seed-globes');
    }
    
  } catch (error) {
    console.error('Error checking database state:', error);
  }
}

checkDatabaseState();
