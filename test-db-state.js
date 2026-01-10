// Test script to check database state for andrew.ledet@gmail.com
import { dbCore } from './src/instant';
import { getCurrentUser, getBallot, getAllPlayersWithScores } from './src/instantService';

async function testDatabaseState() {
  console.log('🔍 Testing database state for andrew.ledet@gmail.com...');
  
  try {
    // Get current user
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user) {
      console.log('❌ No user found');
      return;
    }
    
    // Get ballot for this user
    const ballot = await getBallot(user.id, 'golden-globes-2026');
    console.log('User ballot:', ballot);
    
    if (ballot && ballot.picks) {
      console.log(`✅ Found ballot with ${ballot.picks.length} picks`);
      console.log('Picks:', ballot.picks);
    } else {
      console.log('❌ No ballot or picks found');
    }
    
    // Check all players to see if user appears as submitted
    const allPlayers = await getAllPlayersWithScores('golden-globes-2026');
    console.log('All players:', allPlayers);
    
    const currentUser = allPlayers.players.find(p => p.id === user.id);
    if (currentUser) {
      console.log('✅ User found in players list:', currentUser);
      console.log('Has submitted:', currentUser.hasSubmitted);
    } else {
      console.log('❌ User not found in players list');
    }
    
  } catch (error) {
    console.error('❌ Error testing database:', error);
  }
}

// Run the test
testDatabaseState();
