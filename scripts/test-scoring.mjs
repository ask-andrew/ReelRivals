// Simple script to manually add test winners using the frontend pattern
import { init } from '@instantdb/core';
import { id } from '@instantdb/core';

const APP_ID = '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const dbCore = init({ appId: APP_ID });

// Test data - manually add a few winners to test scoring
const testWinners = [
  {
    category_id: 'test-category-1', // This would need to be actual category IDs
    winner_nominee_id: 'test-nominee-1', // This would need to be actual nominee IDs
    announced_at: Date.now()
  }
];

async function addTestWinners() {
  try {
    console.log('🏆 Adding test winners...');
    
    for (const winner of testWinners) {
      const resultId = id();
      await dbCore.transact([
        dbCore.tx.results[resultId].create(winner)
      ]);
      console.log('✅ Added test winner:', resultId);
    }
    
    console.log('🎉 Test winners added successfully!');
  } catch (error) {
    console.error('❌ Error adding test winners:', error);
  }
}

// Function to calculate scores for testing
async function testScoreCalculation(eventId) {
  try {
    console.log('🧮 Testing score calculation...');
    
    // This would call the scoring function we created
    // For now, just log that it would be called
    console.log('✅ Score calculation would be called for event:', eventId);
    
  } catch (error) {
    console.error('❌ Error in score calculation test:', error);
  }
}

addTestWinners();
