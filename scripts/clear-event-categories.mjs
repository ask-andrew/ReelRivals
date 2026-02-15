import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set VITE_INSTANT_SECRET or INSTANT_APP_ADMIN_TOKEN.');
  process.exit(1);
}

const EVENTS = ['baftas-2026', 'sag-2026', 'oscars-2026'];

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function clearEvent(eventId) {
  console.log(`\n🧹 Clearing categories/nominees for ${eventId}...`);
  const data = await db.query({
    categories: {
      $: { where: { event_id: eventId } },
      nominees: {},
    },
  });

  const categories = data.categories || [];
  let nomineesCount = 0;
  const txs = [];

  for (const cat of categories) {
    if (Array.isArray(cat.nominees)) {
      nomineesCount += cat.nominees.length;
      for (const nominee of cat.nominees) {
        txs.push(db.tx.nominees[nominee.id].delete());
      }
    }
    txs.push(db.tx.categories[cat.id].delete());
  }

  if (txs.length === 0) {
    console.log('✅ Nothing to delete.');
    return;
  }

  const BATCH = 200;
  for (let i = 0; i < txs.length; i += BATCH) {
    await db.transact(txs.slice(i, i + BATCH));
  }

  console.log(`✅ Deleted ${categories.length} categories and ${nomineesCount} nominees for ${eventId}.`);
}

async function run() {
  for (const eventId of EVENTS) {
    await clearEvent(eventId);
  }
  console.log('\n🎯 Done. Categories will re-seed on next app load for each event.');
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
