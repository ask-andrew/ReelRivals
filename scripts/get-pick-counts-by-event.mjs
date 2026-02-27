import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname });

const APP_ID = process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set VITE_INSTANT_SECRET or INSTANT_APP_ADMIN_TOKEN.');
  process.exit(1);
}

// Initialize with admin token for backend access
const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

const EVENT_NAME_TO_SLUG = {
  'Golden Globes 2026': 'golden-globes-2026',
  'BAFTA Film Awards 2026': 'baftas-2026',
  'SAG Awards 2026': 'sag-2026',
  'The Oscars 2026': 'oscars-2026',
};

function inferEventSlug(event) {
  if (EVENT_NAME_TO_SLUG[event.name]) {
    return EVENT_NAME_TO_SLUG[event.name];
  }

  // Fallback heuristic if event names change but still contain key words.
  const name = String(event.name || '').toLowerCase();
  if (name.includes('bafta')) return 'baftas-2026';
  if (name.includes('sag')) return 'sag-2026';
  if (name.includes('oscar')) return 'oscars-2026';
  if (name.includes('globe')) return 'golden-globes-2026';
  return event.id;
}

async function getPickCountsByEvent() {
  try {
    console.log('Getting pick counts by award event...');
    
    // Get all events first
    const eventsQuery = await db.query({
      events: { $: {} }
    });
    
    console.log('Raw events query result:', JSON.stringify(eventsQuery, null, 2));
    
    const events = eventsQuery.events || [];
    console.log(`Found ${events.length} events`);
    
    // For each event, count unique users who have submitted ballots.
    // Ballots are keyed by slug IDs (e.g. "baftas-2026"), while events may use UUID IDs.
    const eventCounts = await Promise.all(
      events.map(async (event) => {
        const ballotEventId = inferEventSlug(event);

        // Count ballots for this event (each ballot represents one user's submission)
        const ballotsQuery = await db.query({
          ballots: {
            $: {
              where: { event_id: ballotEventId }
            }
          }
        });
        
        const ballotCount = ballotsQuery.ballots.length;
        
        // Also count picks to see actual pick activity
        const picksQuery = await db.query({
          ballots: {
            $: {
              where: { event_id: ballotEventId }
            },
            picks: {}
          }
        });
        
        const totalPicks = picksQuery.ballots.reduce((sum, ballot) => {
          return sum + (ballot.picks ? ballot.picks.length : 0);
        }, 0);
        
        return {
          eventId: ballotEventId,
          eventDbId: event.id,
          eventName: event.name,
          ceremonyDate: event.ceremony_date,
          isActive: event.is_active,
          isComplete: event.is_complete,
          uniqueUsersWithBallots: ballotCount,
          totalPicksSubmitted: totalPicks,
          averagePicksPerUser: ballotCount > 0 ? (totalPicks / ballotCount).toFixed(2) : 0
        };
      })
    );
    
    // Sort by event name for readability
    eventCounts.sort((a, b) => a.eventName.localeCompare(b.eventName));
    
    console.log('\n=== PICK COUNTS BY AWARD EVENT ===\n');
    
    eventCounts.forEach(event => {
      console.log(`📊 ${event.eventName} (${event.eventId})`);
      console.log(`   🧩 Event Row ID: ${event.eventDbId}`);
      console.log(`   📅 Ceremony Date: ${event.ceremonyDate || 'TBD'}`);
      console.log(`   👥 Users with Ballots: ${event.uniqueUsersWithBallots}`);
      console.log(`   🗳️  Total Picks Submitted: ${event.totalPicksSubmitted}`);
      console.log(`   📈 Average Picks Per User: ${event.averagePicksPerUser}`);
      console.log(`   🔄 Status: ${event.isActive ? 'Active' : 'Inactive'}${event.isComplete ? ' (Complete)' : ''}`);
      console.log('');
    });
    
    // Summary statistics
    const totalUsersAcrossAllEvents = eventCounts.reduce((sum, event) => sum + event.uniqueUsersWithBallots, 0);
    const totalPicksAcrossAllEvents = eventCounts.reduce((sum, event) => sum + event.totalPicksSubmitted, 0);
    const activeEvents = eventCounts.filter(e => e.isActive).length;
    
    console.log('=== SUMMARY STATISTICS ===');
    console.log(`📊 Total Events: ${events.length}`);
    console.log(`🔄 Active Events: ${activeEvents}`);
    console.log(`👥 Total Unique User Submissions: ${totalUsersAcrossAllEvents}`);
    console.log(`🗳️  Total Picks Across All Events: ${totalPicksAcrossAllEvents}`);
    
    return eventCounts;
    
  } catch (error) {
    console.error('Error getting pick counts by event:', error);
    throw error;
  }
}

// Run the function if this file is executed directly
getPickCountsByEvent()
  .then(() => {
    console.log('\n✅ Pick count analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

export { getPickCountsByEvent };
