import { init, id } from '@instantdb/admin';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname });

const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set VITE_INSTANT_SECRET or INSTANT_APP_ADMIN_TOKEN.');
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// Define the events based on the frontend constants
const EVENTS = [
  {
    id: 'golden-globes-2026',
    name: 'Golden Globes 2026',
    ceremony_date: '2026-01-11',
    picks_lock_at: '2026-01-11T19:00:00-06:00',
    is_active: false,
    is_complete: true
  },
  {
    id: 'baftas-2026',
    name: 'BAFTA Film Awards 2026',
    ceremony_date: '2026-02-22',
    picks_lock_at: '2026-02-22T19:00:00-06:00',
    is_active: true,
    is_complete: false
  },
  {
    id: 'sag-2026',
    name: 'SAG Awards 2026',
    ceremony_date: '2026-03-01',
    picks_lock_at: '2026-03-01T19:00:00-06:00',
    is_active: true,
    is_complete: false
  },
  {
    id: 'oscars-2026',
    name: 'The Oscars 2026',
    ceremony_date: '2026-03-15',
    picks_lock_at: '2026-03-15T19:00:00-06:00',
    is_active: true,
    is_complete: false
  }
];

async function seedEvents() {
  try {
    console.log('🌱 Seeding events...');
    
    // Check if events already exist
    const existingEventsQuery = await db.query({
      events: { $: {} }
    });
    
    const existingEvents = existingEventsQuery.events || [];
    console.log(`Found ${existingEvents.length} existing events`);
    
    if (existingEvents.length > 0) {
      console.log('Events already exist:');
      existingEvents.forEach(event => {
        console.log(`  - ${event.name} (${event.id})`);
      });
      return;
    }
    
    // Create events
    const transactions = [];
    
    for (const event of EVENTS) {
      const eventId = id();
      transactions.push(
        db.tx.events[eventId].update({
          name: event.name,
          ceremony_date: event.ceremony_date,
          picks_lock_at: event.picks_lock_at,
          is_active: event.is_active,
          is_complete: event.is_complete
        })
      );
      
      // Store mapping for reference
      event.generatedId = eventId;
    }
    
    await db.transact(transactions);
    
    console.log('✅ Successfully seeded events!');
    
    // Verify the events were created
    const verifyQuery = await db.query({
      events: { $: {} }
    });
    
    console.log('\n📊 Created events:');
    verifyQuery.events.forEach(event => {
      console.log(`  - ${event.name} (${event.id})`);
      console.log(`    📅 Ceremony: ${event.ceremony_date}`);
      console.log(`    🔒 Locks at: ${event.picks_lock_at}`);
      console.log(`    🔄 Active: ${event.is_active}`);
      console.log(`    ✅ Complete: ${event.is_complete}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error seeding events:', error);
  }
}

seedEvents();
