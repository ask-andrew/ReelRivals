import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function verifyAnalytics() {
  console.log('🔍 Verifying analytics data processing...');

  try {
    const eventId = 'oscars-2026';

    // Manual query to simulate getAnalyticsData behavior
    const [ballotsResult, picksResult, categoriesResult, usersResult] = await Promise.all([
      db.query({
        ballots: {
          $: { where: { event_id: eventId } },
          user: {}
        }
      }),
      db.query({
        picks: {
          $: { where: { 'ballot.event_id': eventId } },
          ballot: {
            user: {}
          },
          category: {},
          nominee: {}
        }
      }),
      db.query({
        categories: {
          $: { where: { event_id: eventId } },
          nominees: {}
        }
      }),
      db.query({
        users: {}
      })
    ]);

    console.log('\n--- Data Fetch Success ---');
    console.log(`Ballots: ${ballotsResult.data.ballots.length}`);
    console.log(`Picks: ${picksResult.data.picks.length}`);
    console.log(`Categories: ${categoriesResult.data.categories.length}`);

    if (ballotsResult.data.ballots.length > 0) {
        const sampleBallot = ballotsResult.data.ballots[0];
        console.log(`Sample Ballot User Link: ${sampleBallot.user?.username || 'FAILED'}`);
    }

  } catch (error) {
    console.error('Error verifying analytics:', error);
  }
}

verifyAnalytics();
