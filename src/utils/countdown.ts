import { SEASON_CIRCUIT, AwardEvent } from '../../constants';

export interface CountdownInfo {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  nextEvent: AwardEvent | null;
  message: string;
}

export function parseEventDate(dateString: string): Date {
  // Handle different date formats from the constants
  // Examples: "Jan 11, 2026", "Feb 22, 2026", "Mar 1, 2026", "Mar 15, 2026"
  return new Date(dateString);
}

export function getNextAwardShow(): AwardEvent | null {
  const now = new Date();
  
  // Find events that haven't expired yet
  const upcomingEvents = SEASON_CIRCUIT.filter(event => {
    if (event.status === 'completed') return false;
    
    // Convert event date string to Date object for comparison
    const eventDate = parseEventDate(event.date);
    return eventDate > now;
  });

  // Sort by date and return the soonest
  return upcomingEvents.length > 0 
    ? upcomingEvents.sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime())[0]
    : null;
}

export function getCountdownToNextAwardShow(): CountdownInfo {
  const nextEvent = getNextAwardShow();
  
  if (!nextEvent) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      nextEvent: null,
      message: 'All award shows completed!'
    };
  }

  const now = new Date();
  const eventDate = parseEventDate(nextEvent.date);
  const difference = eventDate.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      nextEvent,
      message: `${nextEvent.name} voting has ended!`
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  let message = '';
  if (days > 0) {
    message = `${days} day${days !== 1 ? 's' : ''} until ${nextEvent.name}`;
  } else if (hours > 0) {
    message = `${hours} hour${hours !== 1 ? 's' : ''} until ${nextEvent.name}`;
  } else if (minutes > 0) {
    message = `${minutes} minute${minutes !== 1 ? 's' : ''} until ${nextEvent.name}`;
  } else {
    message = `${seconds} second${seconds !== 1 ? 's' : ''} until ${nextEvent.name}`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    nextEvent,
    message
  };
}

export function formatCountdown(countdown: CountdownInfo): string {
  if (countdown.isExpired) {
    return countdown.message;
  }

  const parts = [];
  if (countdown.days > 0) parts.push(`${countdown.days}d`);
  if (countdown.hours > 0) parts.push(`${countdown.hours}h`);
  if (countdown.minutes > 0) parts.push(`${countdown.minutes}m`);
  if (countdown.seconds > 0 && countdown.days === 0 && countdown.hours === 0) parts.push(`${countdown.seconds}s`);

  return parts.length > 0 ? `${parts.join(' ')} until ${countdown.nextEvent?.name}` : countdown.message;
}
