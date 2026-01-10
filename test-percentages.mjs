// Simple test to verify the getNomineePercentages function works
import { getNomineePercentages } from './src/ballots.js';

async function testPercentages() {
  console.log('Testing nominee percentages function...');
  
  try {
    const result = await getNomineePercentages(
      'test-category-id',
      'golden-globes-2026',
      'test-league-id'
    );
    
    console.log('Result:', result);
    console.log('✅ Function executed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPercentages();
