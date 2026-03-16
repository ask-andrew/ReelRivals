import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function verifyWinners() {
  console.log('🔍 Verifying Oscar winners in database...');

  try {
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: 'oscars-2026' } },
        nominees: {},
        results: {
          nominee: {}
        }
      }
    });

    const categories = categoriesQuery.data.categories || [];
    console.log(`Found ${categories.length} categories.`);

    categories.forEach(cat => {
      const result = cat.results?.[0];
      if (result) {
        console.log(`✅ ${cat.name}: ${result.nominee?.name || 'Unknown'}`);
      } else {
        console.log(`❌ ${cat.name}: No winner recorded`);
      }
    });

  } catch (error) {
    console.error('Error verifying winners:', error);
  }
}

verifyWinners();
