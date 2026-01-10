import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Award show schedules (Central Time)
const AWARD_SCHEDULES = [
  {
    id: 'golden-globes-2026',
    name: 'Golden Globes 2026',
    datetime: '2026-01-11T19:00:00-06:00'
  },
  {
    id: 'oscars-2026', 
    name: 'Oscars 2026',
    datetime: '2026-03-02T20:00:00-06:00'
  },
  {
    id: 'baftas-2026',
    name: 'BAFTAs 2026', 
    datetime: '2026-02-15T19:00:00-06:00'
  }
];

class SimpleScheduler {
  constructor() {
    this.timers = new Map();
  }

  // Schedule a specific award show
  scheduleShow(eventId, datetime) {
    const show = AWARD_SCHEDULES.find(s => s.id === eventId);
    if (!show) {
      console.error(`❌ Show ${eventId} not found`);
      return;
    }

    const scheduledTime = new Date(datetime);
    const now = new Date();
    
    if (scheduledTime <= now) {
      console.log(`⚠️ ${show.name} time has passed. Starting now...`);
      this.startLiveScoring(eventId);
      return;
    }

    const delay = scheduledTime.getTime() - now.getTime();
    const hoursUntilStart = Math.floor(delay / (1000 * 60 * 60));
    
    console.log(`📅 Scheduling ${show.name} for ${scheduledTime.toLocaleString()}`);
    console.log(`⏰ Starts in ${hoursUntilStart} hours`);

    // Schedule with setTimeout
    const timer = setTimeout(() => {
      console.log(`🎬 Starting live scoring for ${show.name}!`);
      this.startLiveScoring(eventId);
    }, delay);

    this.timers.set(eventId, timer);
    
    // Schedule reminder 30 minutes before
    const reminderDelay = Math.max(0, delay - (30 * 60 * 1000));
    setTimeout(() => {
      console.log(`⏰ Reminder: ${show.name} starts in 30 minutes!`);
    }, reminderDelay);

    return timer;
  }

  // Start live scoring for an event
  async startLiveScoring(eventId) {
    try {
      console.log(`🚀 Starting live scoring for ${eventId}`);
      
      const result = await execAsync(`node scripts/live-scraping-instant.mjs live-scrape ${eventId}`, {
        cwd: process.cwd(),
        timeout: 4 * 60 * 60 * 1000 // 4 hour timeout
      });
      
      console.log('✅ Live scoring completed');
      console.log(result.stdout);
      
    } catch (error) {
      console.error(`❌ Error running live scoring for ${eventId}:`, error);
    }
  }

  // Schedule all upcoming shows
  scheduleAll() {
    console.log('🗓️ Scheduling all award shows...');
    
    const now = new Date();
    const upcomingShows = AWARD_SCHEDULES.filter(show => 
      new Date(show.datetime) > now
    );

    if (upcomingShows.length === 0) {
      console.log('ℹ️ No upcoming shows to schedule');
      return;
    }

    upcomingShows.forEach(show => {
      this.scheduleShow(show.id, show.datetime);
    });

    console.log(`✅ Scheduled ${upcomingShows.length} upcoming shows`);
  }

  // List scheduled jobs
  listJobs() {
    console.log('📋 Scheduled Jobs:');
    console.log('==================');
    
    this.timers.forEach((timer, eventId) => {
      const show = AWARD_SCHEDULES.find(s => s.id === eventId);
      const status = timer ? 'SCHEDULED' : 'EXPIRED';
      console.log(`${eventId}: ${show?.name} - ${status}`);
    });
  }

  // Cancel a scheduled job
  cancelJob(eventId) {
    const timer = this.timers.get(eventId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(eventId);
      console.log(`🛑 Cancelled job for ${eventId}`);
      return true;
    }
    console.log(`❌ No job found for ${eventId}`);
    return false;
  }

  // Cancel all jobs
  cancelAll() {
    console.log('🛑 Cancelling all scheduled jobs...');
    
    this.timers.forEach((timer, eventId) => {
      clearTimeout(timer);
      console.log(`🛑 Cancelled ${eventId}`);
    });
    
    this.timers.clear();
    console.log('✅ All jobs cancelled');
  }
}

// CLI interface
const scheduler = new SimpleScheduler();
const command = process.argv[2];
const eventId = process.argv[3];
const datetime = process.argv[4];

switch (command) {
  case 'schedule':
    if (!eventId || !datetime) {
      console.error('Usage: node simple-scheduler.mjs schedule <event-id> <datetime>');
      console.error('Example: node simple-scheduler.mjs schedule golden-globes-2026 "2026-01-11T19:00:00-06:00"');
      process.exit(1);
    }
    scheduler.scheduleShow(eventId, datetime);
    break;
    
  case 'start':
    if (!eventId) {
      console.error('Usage: node simple-scheduler.mjs start <event-id>');
      process.exit(1);
    }
    scheduler.startLiveScoring(eventId);
    break;
    
  case 'list':
    scheduler.listJobs();
    break;
    
  case 'cancel':
    if (!eventId) {
      console.error('Usage: node simple-scheduler.mjs cancel <event-id>');
      process.exit(1);
    }
    scheduler.cancelJob(eventId);
    break;
    
  case 'cancel-all':
    scheduler.cancelAll();
    break;
    
  case 'all':
    scheduler.scheduleAll();
    break;
    
  default:
    console.log(`
🗓️ Reel Rivals Simple Scheduler (No Cron Issues!)

Commands:
  schedule <event-id> <datetime>  Schedule specific show
  start <event-id>               Start live scoring now
  list                          List scheduled jobs
  cancel <event-id>              Cancel specific job
  cancel-all                     Cancel all jobs
  all                           Schedule all upcoming shows

Examples:
  node simple-scheduler.mjs schedule golden-globes-2026 "2026-01-11T19:00:00-06:00"
  node simple-scheduler.mjs start golden-globes-2026
  node simple-scheduler.mjs list
  node simple-scheduler.mjs all
    `);
}
