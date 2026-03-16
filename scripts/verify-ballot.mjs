import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function verifyBallot() {
  console.log('🔍 Verifying ballot picks population...');

  try {
    const ballotQuery = await db.query({
      ballots: {
        $: { limit: 1 },
        picks: {
          nominee: {},
          category: {}
        }
      },
    });

    const ballot = ballotQuery.data.ballots[0];

    if (ballot) {
      console.log(`✅ Ballot found`);
      if (ballot.picks && ballot.picks.length > 0) {
        const firstPick = ballot.picks[0];
        console.log(`Pick details:`, {
          category: firstPick.category?.name || 'MISSING',
          nominee: firstPick.nominee?.name || 'MISSING',
          isPowerPick: firstPick.is_power_pick
        });

        if (firstPick.category && firstPick.nominee) {
          console.log('✅ Joins are working correctly for picks');
        } else {
          console.log('❌ Joins failed for picks');
        }
      } else {
        console.log('ℹ️ Ballot has no picks');
      }
    } else {
      console.log('ℹ️ No ballots found in database');
    }
  } catch (error) {
    console.error('Error verifying ballot:', error);
  }
}

verifyBallot();
