import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';
import dotenv from 'dotenv';
import { init, id } from '@instantdb/admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set VITE_INSTANT_SECRET or INSTANT_APP_ADMIN_TOKEN.');
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

function loadTop10Categories() {
  const constantsPath = path.resolve(__dirname, '../src/constants-main.ts');
  const source = readFileSync(constantsPath, 'utf8');

  const transformed = source
    .replace(/export const /g, 'const ')
    .replace(/export default /g, '');

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(
    `${transformed}\nthis.__CATS__ = { MAIN_OSCAR_CATEGORIES, MAIN_BAFTA_CATEGORIES, MAIN_SAG_CATEGORIES };`,
    sandbox
  );

  return sandbox.__CATS__;
}

async function clearEvent(eventId) {
  const data = await db.query({
    categories: {
      $: { where: { event_id: eventId } },
      nominees: {},
    },
  });

  const categories = data.categories || [];
  const txs = [];

  for (const cat of categories) {
    if (Array.isArray(cat.nominees)) {
      for (const nominee of cat.nominees) {
        txs.push(db.tx.nominees[nominee.id].delete());
      }
    }
    txs.push(db.tx.categories[cat.id].delete());
  }

  if (txs.length === 0) return { deletedCategories: 0, deletedNominees: 0 };

  const BATCH = 200;
  for (let i = 0; i < txs.length; i += BATCH) {
    await db.transact(txs.slice(i, i + BATCH));
  }

  const deletedCategories = categories.length;
  const deletedNominees = categories.reduce((sum, cat) => sum + (cat.nominees?.length || 0), 0);
  return { deletedCategories, deletedNominees };
}

async function seedEvent(eventId, categories) {
  const txs = [];

  categories.forEach((cat, index) => {
    const catId = id();
    txs.push(
      db.tx.categories[catId].update({
        event_id: eventId,
        name: cat.name,
        display_order: index + 1,
        base_points: cat.basePoints,
        emoji: cat.emoji || '🏆',
      })
    );

    (cat.nominees || []).forEach((nominee, nomineeIndex) => {
      const nomineeId = id();
      txs.push(
        db.tx.nominees[nomineeId].update({
          category_id: catId,
          name: nominee.name,
          tmdb_id: nominee.tmdb_id || '',
          display_order: nomineeIndex + 1,
        })
      );
    });
  });

  const BATCH = 200;
  for (let i = 0; i < txs.length; i += BATCH) {
    await db.transact(txs.slice(i, i + BATCH));
  }
}

async function reseed() {
  const { MAIN_OSCAR_CATEGORIES, MAIN_BAFTA_CATEGORIES, MAIN_SAG_CATEGORIES } = loadTop10Categories();

  const events = [
    { id: 'baftas-2026', categories: MAIN_BAFTA_CATEGORIES },
    { id: 'sag-2026', categories: MAIN_SAG_CATEGORIES },
    { id: 'oscars-2026', categories: MAIN_OSCAR_CATEGORIES },
  ];

  for (const event of events) {
    console.log(`\n🧹 Clearing ${event.id}...`);
    const cleared = await clearEvent(event.id);
    console.log(`✅ Deleted ${cleared.deletedCategories} categories and ${cleared.deletedNominees} nominees.`);

    console.log(`🌱 Seeding ${event.id}...`);
    await seedEvent(event.id, event.categories);
    console.log(`✅ Seeded ${event.categories.length} categories for ${event.id}.`);
  }

  console.log('\n🎯 Reseed complete.');
}

reseed().catch((err) => {
  console.error('❌ Reseed failed:', err);
  process.exit(1);
});
