import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Award show schedules (Central Time)
const AWARD_SCHEDULES = [
  {
    id: 'golden-globes-2026',
    name: 'Golden Globes 2026',
    datetime: '2026-01-11T19:00:00-06:00',
    timezone: 'America/Chicago'
  },
  {
    id: 'oscars-2026', 
    name: 'Oscars 2026',
    datetime: '2026-03-15T20:00:00-06:00',
    timezone: 'America/Chicago'
  },
  {
    id: 'baftas-2026',
    name: 'BAFTAs 2026', 
    datetime: '2026-02-22T19:00:00-06:00',
    timezone: 'America/Chicago'
  }
];

class LiveScoringScheduler {
  constructor() {
    this.jobs = new Map();
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

    const timeUntilStart = scheduledTime - now;
    const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
    
    console.log(`📅 Scheduling ${show.name} for ${scheduledTime.toLocaleString()}`);
    console.log(`⏰ Starts in ${hoursUntilStart} hours`);

    // Schedule the job
    const job = cron.schedule(
      scheduledTime,
      () => {
        console.log(`🎬 Starting live scoring for ${show.name}!`);
        this.startLiveScoring(eventId);
      },
      {
        scheduled: true
      }
    );

    this.jobs.set(eventId, job);
    
    // Also schedule a reminder 30 minutes before
    const reminderTime = new Date(scheduledTime.getTime() - 30 * 60 * 1000);
    cron.schedule(
      reminderTime,
      () => {
        console.log(`⏰ Reminder: ${show.name} starts in 30 minutes!`);
      },
      {
        scheduled: true
      }
    );

    return job;
  }

  // Start live scoring for an event
  async startLiveScoring(eventId) {
    try {
      console.log(`🚀 Starting live scoring for ${eventId}`);
      
      // Run the live scraping script
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
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
    
    this.jobs.forEach((job, eventId) => {
      const show = AWARD_SCHEDULES.find(s => s.id === eventId);
      console.log(`${eventId}: ${show?.name} - ${job.running ? 'RUNNING' : 'SCHEDULED'}`);
    });
  }

  // Cancel a scheduled job
  cancelJob(eventId) {
    const job = this.jobs.get(eventId);
    if (job) {
      job.stop();
      this.jobs.delete(eventId);
      console.log(`🛑 Cancelled job for ${eventId}`);
      return true;
    }
    console.log(`❌ No job found for ${eventId}`);
    return false;
  }

  // Cancel all jobs
  cancelAll() {
    console.log('🛑 Cancelling all scheduled jobs...');
    
    this.jobs.forEach((job, eventId) => {
      job.stop();
      console.log(`🛑 Cancelled ${eventId}`);
    });
    
    this.jobs.clear();
    console.log('✅ All jobs cancelled');
  }
}

// CLI interface
const scheduler = new LiveScoringScheduler();
const command = process.argv[2];
const eventId = process.argv[3];
const datetime = process.argv[4];

switch (command) {
  case 'schedule':
    if (!eventId || !datetime) {
      console.error('Usage: node scheduler.mjs schedule <event-id> <datetime>');
      console.error('Example: node scheduler.mjs schedule golden-globes-2026 "2026-01-11T19:00:00-06:00"');
      process.exit(1);
    }
    scheduler.scheduleShow(eventId, datetime);
    break;
    
  case 'start':
    if (!eventId) {
      console.error('Usage: node scheduler.mjs start <event-id>');
      process.exit(1);
    }
    scheduler.startLiveScoring(eventId);
    break;
    
  case 'list':
    scheduler.listJobs();
    break;
    
  case 'cancel':
    if (!eventId) {
      console.error('Usage: node scheduler.mjs cancel <event-id>');
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
🗓️ Reel Rivals Live Scoring Scheduler

Commands:
  schedule <event-id> <datetime>  Schedule specific show
  start <event-id>               Start live scoring now
  list                          List scheduled jobs
  cancel <event-id>              Cancel specific job
  cancel-all                     Cancel all jobs
  all                           Schedule all upcoming shows

Examples:
  node scheduler.mjs schedule golden-globes-2026 "2026-01-11T19:00:00-06:00"
  node scheduler.mjs start golden-globes-2026
  node scheduler.mjs list
  node scheduler.mjs all
    `);
}
