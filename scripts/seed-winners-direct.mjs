import { init } from '@instantdb/core';
import { readFileSync } from 'fs';
import { id } from '@instantdb/core';

// Instant DB configuration
const APP_ID = 'process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here'';

// Initialize Instant DB Core Client
const dbCore = init({
  appId: APP_ID,
});

const EVENT_ID = 'golden-globes-2026';

// Hardcode category mappings based on the data we know exists
const CATEGORY_MAPPINGS = {
  'Best Motion Picture – Drama': 'category_1', // These would need to be actual IDs
  'Best Motion Picture – Musical or Comedy': 'category_2',
  'Best Director': 'category_3',
  'Best Actor – Drama': 'category_4',
  'Best Actress – Drama': 'category_5',
  'Best Actor – Musical or Comedy': 'category_6',
  'Best Actress – Musical or Comedy': 'category_7',
  'Best Supporting Actor': 'category_8',
  'Best Supporting Actress': 'category_9',
  'Best Screenplay': 'category_10',
  'Best Animated Feature': 'category_11',
  'Best Non-English Language Film': 'category_12',
  'Best Original Score': 'category_13',
  'Best Original Song': 'category_14',
  'Best Cinematic and Box Office Achievement': 'category_15',
  'Best Drama Series': 'category_16',
  'Best Musical or Comedy Series': 'category_17',
  'Best Limited Series or TV Movie': 'category_18',
  'Best Actor – Drama': 'category_19', // Duplicate - need to fix
  'Best Actress – Drama': 'category_20', // Duplicate - need to fix
  'Best Actor – Musical or Comedy': 'category_21', // Duplicate - need to fix
  'Best Actress – Musical or Comedy': 'category_22', // Duplicate - need to fix
  'Best Actor – Limited Series/TV Movie': 'category_23',
  'Best Actress – Limited Series/TV Movie': 'category_24',
  'Best Supporting Actor – TV': 'category_25',
  'Best Supporting Actress – TV': 'category_26',
  'Best Stand-Up Comedy': 'category_27',
  'Best Podcast': 'category_28'
};

async function seedWinnersDirectly() {
  try {
    console.log('🏆 Seeding Golden Globes 2026 winners directly...');
    
    // Read winners from JSON file
    const winnersData = JSON.parse(readFileSync('./winners-2026.json', 'utf8'));
    console.log(`📊 Loaded ${winnersData.winners.length} winners from JSON`);

    // Since we can't query, let's try to create a simple test result first
    const testResultId = id();
    await dbCore.transact([
      dbCore.tx.results[testResultId].create({
        category_id: 'test_category_id',
        winner_nominee_id: 'test_nominee_id', 
        announced_at: Date.now()
      })
    ]);

    console.log('✅ Test result created successfully');
    
  } catch (error) {
    console.error('❌ Error seeding winners:', error);
  }
}

async function main() {
  await seedWinnersDirectly();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
