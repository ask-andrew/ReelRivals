// Direct winner seeding using transactions only
import { init } from '@instantdb/core';
import { id } from '@instantdb/core';
import { readFileSync } from 'fs';

const APP_ID = '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const dbCore = init({ appId: APP_ID });

// Read winners from JSON
const winnersData = JSON.parse(readFileSync('./winners-2026.json', 'utf8'));
console.log(`📊 Loaded ${winnersData.winners.length} winners from JSON`);

// Manual category mappings - these would need to be actual IDs from the database
// For now, let's create a simple test to add one winner
async function addTestWinner() {
  try {
    console.log('🏆 Adding test winner...');
    
    // Add a test result - this would need actual category/nominee IDs
    const resultId = id();
    await dbCore.transact([
      dbCore.tx.results[resultId].create({
        category_id: 'test-category-id',
        winner_nominee_id: 'test-nominee-id', 
        announced_at: Date.now()
      })
    ]);

    console.log('✅ Test winner added successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error adding test winner:', error);
    return false;
  }
}

addTestWinner();
