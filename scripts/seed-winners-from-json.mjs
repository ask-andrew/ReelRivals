import { init } from '@instantdb/core';
import { readFileSync } from 'fs';

// Instant DB configuration - using same pattern as frontend
const APP_ID = 'process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here'';

// Initialize exactly like the frontend instant.ts
const dbCore = init({
  appId: APP_ID,
});

const EVENT_ID = 'golden-globes-2026';

async function processWinner(winnerData, eventId) {
  try {
    console.log(`🎯 Processing: ${winnerData.category} - ${winnerData.winner}`);
    
    // Find the category in Instant DB
    const categories = await dbCore.queryOnce({
      categories: {
        $: {
          where: {
            event_id: eventId,
            name: winnerData.category
          }
        },
        nominees: {}
      }
    });

    if (!categories.categories || categories.categories.length === 0) {
      console.log(`⚠️ Category not found: ${winnerData.category}`);
      return;
    }

    const category = categories.categories[0];
    console.log(`📍 Found category: ${category.name} (${category.id})`);

    // Find the matching nominee
    const nominees = category.nominees || [];
    let matchingNominee = null;

    // Try exact match first
    matchingNominee = nominees.find(n => n.name === winnerData.winner);
    
    // Try fuzzy match if exact fails
    if (!matchingNominee) {
      const winnerName = winnerData.winner.toLowerCase();
      matchingNominee = nominees.find(n => 
        n.name.toLowerCase().includes(winnerName) ||
        winnerName.includes(n.name.toLowerCase())
      );
    }

    if (!matchingNominee) {
      console.log(`⚠️ No matching nominee found for: ${winnerData.winner} in ${category.name}`);
      console.log(`   Available nominees:`, nominees.map(n => n.name));
      return;
    }

    console.log(`🎯 Found nominee: ${matchingNominee.name} (${matchingNominee.id})`);

    // Check if result already exists
    const existingResults = await dbCore.queryOnce({
      results: {
        $: {
          where: {
            category_id: category.id
          }
        }
      }
    });

    if (existingResults.results && existingResults.results.length > 0) {
      console.log(`⏭️ Winner already recorded for ${category.name}`);
      return;
    }

    // Insert the result
    await dbCore.transact([
      dbCore.tx.results.create({
        category_id: category.id,
        winner_nominee_id: matchingNominee.id,
        announced_at: Date.now()
      })
    ]);

    console.log(`✅ Winner recorded: ${winnerData.winner} for ${category.name}`);
    
  } catch (error) {
    console.error(`❌ Error processing winner ${winnerData.winner}:`, error);
  }
}

async function main() {
  console.log('🏆 Seeding Golden Globes 2026 winners from JSON...');

  try {
    // Read winners from JSON file
    const winnersData = JSON.parse(readFileSync('../scripts/winners-2026.json', 'utf8'));
    console.log(`📊 Loaded ${winnersData.winners.length} winners from JSON`);

    for (const winnerData of winnersData.winners) {
      await processWinner(winnerData, EVENT_ID);
    }

    console.log('🎉 Winner seeding completed!');
  } catch (error) {
    console.error('❌ Error reading or processing winners:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
