import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function verifyJoins() {
  console.log('🔍 Verifying schema joins for user names...');

  try {
    // Test ballots -> user join
    const ballotsQuery = await db.query({
      ballots: {
        $: { limit: 5 },
        user: {}
      }
    });

    console.log('\n--- Ballots ---');
    ballotsQuery.data.ballots.forEach(ballot => {
      console.log(`Ballot ${ballot.id}: User ${ballot.user?.username || 'NOT FOUND'}`);
    });

    // Test scores -> user join
    const scoresQuery = await db.query({
      scores: {
        $: { limit: 5 },
        user: {}
      }
    });

    console.log('\n--- Scores ---');
    scoresQuery.data.scores.forEach(score => {
      console.log(`Score ${score.id}: User ${score.user?.username || 'NOT FOUND'}`);
    });

  } catch (error) {
    console.error('Error verifying joins:', error);
  }
}

verifyJoins();
