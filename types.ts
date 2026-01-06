
export type Avatar = '🎬' | '🍿' | '🏆' | '🎭' | '🎥' | '✨' | '🌟' | '📺';

export interface User {
  id: string;
  username: string;
  avatar_emoji: string;
  totalScore: number;
  email?: string; // Optional for future notifications
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
