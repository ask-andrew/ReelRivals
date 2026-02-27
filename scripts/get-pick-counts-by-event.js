import { dbCore } from '../src/instant.js';

async function getPickCountsByEvent() {
  try {
    console.log('Getting pick counts by award event...');
    
    // Get all events first
    const eventsQuery = await dbCore.queryOnce({
      events: { $: {} }
    });
    
    const events = eventsQuery.data.events || [];
    console.log(`Found ${events.length} events`);
    
    // For each event, count unique users who have submitted ballots
    const eventCounts = await Promise.all(
      events.map(async (event) => {
        // Count ballots for this event (each ballot represents one user's submission)
        const ballotsQuery = await dbCore.queryOnce({
          ballots: {
            $: {
              where: { event_id: event.id }
            }
          }
        });
        
        const ballotCount = ballotsQuery.data.ballots.length;
        
        // Also count picks to see actual pick activity
        const picksQuery = await dbCore.queryOnce({
          ballots: {
            $: {
              where: { event_id: event.id }
            },
            picks: {}
          }
        });
        
        const totalPicks = picksQuery.data.ballots.reduce((sum, ballot) => {
          return sum + (ballot.picks ? ballot.picks.length : 0);
        }, 0);
        
        return {
          eventId: event.id,
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
if (import.meta.url === `file://${process.argv[1]}`) {
  getPickCountsByEvent()
    .then(() => {
      console.log('\n✅ Pick count analysis complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { getPickCountsByEvent };
