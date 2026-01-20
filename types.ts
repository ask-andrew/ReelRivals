export type Avatar = '🎬' | '🍿' | '🏆' | '🎭' | '🎥' | '✨' | '🌟' | '📺' | '🎭' | '🎥' | '✨' | '🌟' | '📺';

export interface User {
  id: string;
  username: string;
  avatar_emoji: string;
  totalScore: number;
  email?: string; // Optional for future notifications
  user_type?: 'regular' | 'professional' | 'critic' | 'journalist';
  professional_title?: string;
  organization?: string;
  is_verified_pro?: boolean;
}

export interface InstantUser {
  id: string;
  email: string;
  username: string;
  avatar_emoji: string;
  created_at: number;
  user_type?: 'regular' | 'professional' | 'critic' | 'journalist';
  professional_title?: string;
  organization?: string;
  is_verified_pro?: boolean;
}

export interface Nominee {
  id: string;
  name: string;
  image?: string;
  odds?: string;
}

export interface Category {
  id: string;
  name: string;
  basePoints: number;
  nominees: Nominee[];
  winnerId?: string;
}

export interface Pick {
  nomineeId: string;
  isPowerPick: boolean;
}

export interface Ballot {
  userId: string;
  eventId: string;
  picks: Record<string, Pick>; // categoryId -> Pick
}

export interface League {
  id: string;
  name: string;
  code: string;
  creatorId: string;
  members: User[];
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  type: 'pick' | 'power' | 'join' | 'win';
}

export interface ProfessionalPick {
  id: string;
  user_id: string;
  category_id: string;
  nominee_id: string;
  confidence_level: number; // 1-10
  reasoning?: string;
  created_at: number;
}

export interface ProfessionalStats {
  id: string;
  user_id: string;
  event_id: string;
  total_picks: number;
  correct_picks: number;
  accuracy_percentage: number;
  average_confidence: number;
  created_at: number;
  updated_at: number;
}

export interface Result {
  id: string;
  category_id: string;
  winner_nominee_id: string;
  announced_at: number; // Unix timestamp
}

export interface Score {
  id: string;
  user_id: string;
  league_id: string;
  event_id: string;
  total_points: number;
  correct_picks: number;
  power_picks_hit: number;
  updated_at: number; // Unix timestamp
}

export interface SourceConfig {
  id: string;
  name: string;
  url: string;
  selectors: {
    winnerCard: string;
    categoryName: string;
    winnerName: string;
    movieTitle?: string; // Optional as not all awards have movies
    personName?: string; // Optional for acting awards
  };
  reliabilityScore: number; // e.g., 1-100, official sources are high
  updateFrequency: number; // in milliseconds
  enabled: boolean; // Whether this source is currently active
  eventId: string; // The event this source is configured for
}

export interface HealthCheckResult {
  sourceId: string;
  timestamp: number;
  isHealthy: boolean;
  status: 'OK' | 'URL_NOT_ACCESSIBLE' | 'HTML_STRUCTURE_CHANGED' | 'UNKNOWN_ERROR';
  details?: string;
}

export interface ScrapedWinner {
  categoryName: string;
  winnerName: string;
  movieTitle?: string;
  personName?: string;
  sourceUrl: string;
}
