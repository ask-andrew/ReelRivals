import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token');
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });
const EVENT_ID = 'golden-globes-2026';

async function checkScores() {
  try {
    console.log('🔍 Checking scores in database...');
    
    // Check scores table
    const scoresData = await db.query({
      scores: {
        $: {
          where: { event_id: EVENT_ID }
        }
      }
    });
    
    console.log('📊 Scores found:', scoresData.scores?.length || 0);
    scoresData.scores?.forEach((score, i) => {
      console.log(`  ${i+1}. User: ${score.user_id}, League: ${score.league_id}, Points: ${score.total_points}, Correct: ${score.correct_picks}, Power: ${score.power_picks_hit}`);
    });
    
    // Check users table
    const usersData = await db.query({
      users: { $: {} }
    });
    
    console.log('👥 Users found:', usersData.users?.length || 0);
    usersData.users?.forEach((user, i) => {
      console.log(`  ${i+1}. ID: ${user.id}, Username: ${user.username}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkScores();
