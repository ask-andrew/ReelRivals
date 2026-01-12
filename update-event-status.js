import { dbCore } from './src/instant.js';

const APP_ID = '14bcf449-e9b5-4c78-82f0-e5c63336fd68';

async function updateEventStatus() {
  try {
    console.log('Updating Golden Globes event status to complete...');
    
    // Update the event to mark it as complete
    await dbCore.transact(dbCore.tx.events['golden-globes-2026'].update({
      is_complete: true,
      is_active: false
    }));
    
    console.log('✅ Event status updated to complete');
  } catch (error) {
    console.error('❌ Error updating event status:', error);
  }
}

updateEventStatus();
