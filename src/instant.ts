import { init, i } from '@instantdb/react';
import { init as initCore } from '@instantdb/core';

// Instant DB configuration
const APP_ID = '14bcf449-e9b5-4c78-82f0-e5c63336fd68';

// User type
export interface InstantUser {
  id: string;
  email: string;
  username: string;
  avatar_emoji: string;
  password_hash?: string;
  created_at: number;
}

// Initialize Instant DB with schema
const schema = i.schema({
  entities: {
    users: i.entity({
      email: i.string(),
      username: i.string(),
      avatar_emoji: i.string(),
      password_hash: i.string().optional(),
      created_at: i.number(),
      user_type: i.string().optional(), // 'regular' | 'professional' | 'critic' | 'journalist'
      professional_title: i.string().optional(), // e.g., "Film Critic, Variety"
      organization: i.string().optional(), // e.g., "Variety", "The New York Times"
      is_verified_pro: i.boolean().optional(),
    }),
    leagues: i.entity({
      name: i.string(),
      code: i.string(),
      creator_id: i.string(),
      created_at: i.number(),
    }),
    categories: i.entity({
      event_id: i.string(),
      name: i.string(),
      display_order: i.number(),
      base_points: i.number(),
      emoji: i.string(),
    }),
    nominees: i.entity({
      category_id: i.string(),
      name: i.string(),
      tmdb_id: i.string(),
      display_order: i.number(),
    }),
    ballots: i.entity({
      user_id: i.string(),
      event_id: i.string(),
      league_id: i.string(),
      submitted_at: i.number(),
      is_locked: i.boolean(),
    }),
    picks: i.entity({
      ballot_id: i.string(),
      category_id: i.string(),
      nominee_id: i.string(),
      is_power_pick: i.boolean(),
      created_at: i.number(),
      is_professional_pick: i.boolean().optional(), // Legacy field for backwards compatibility
    }),
    professional_picks: i.entity({
      user_id: i.string(),
      category_id: i.string(),
      nominee_id: i.string(),
      confidence_level: i.number(), // 1-10 confidence rating
      reasoning: i.string().optional(), // Brief explanation of the pick
      created_at: i.number(),
    }),
    events: i.entity({
      name: i.string(),
      ceremony_date: i.string(),
      picks_lock_at: i.string(),
      is_active: i.boolean(),
      is_complete: i.boolean(),
    }),
    league_members: i.entity({
      league_id: i.string(),
      user_id: i.string(),
      joined_at: i.number(),
    }),
    scores: i.entity({
      user_id: i.string(),
      league_id: i.string(),
      event_id: i.string(),
      total_points: i.number(),
      correct_picks: i.number(),
      power_picks_hit: i.number(),
      updated_at: i.number(),
    }),
    results: i.entity({
      category_id: i.string(),
      winner_nominee_id: i.string(),
      announced_at: i.number(),
    }),
    professional_stats: i.entity({
      user_id: i.string(),
      event_id: i.string(),
      total_picks: i.number(),
      correct_picks: i.number(),
      accuracy_percentage: i.number(),
      average_confidence: i.number(),
      created_at: i.number(),
      updated_at: i.number(),
    }),
  },
  links: {
    categoriesNominees: {
      forward: {
        on: 'categories',
        has: 'many',
        label: 'nominees'
      },
      reverse: {
        on: 'nominees',
        has: 'one',
        label: 'category'
      }
    },
    ballotsPicks: {
      forward: {
        on: 'ballots',
        has: 'many',
        label: 'picks'
      },
      reverse: {
        on: 'picks',
        has: 'one',
        label: 'ballot'
      }
    },
    picksCategory: { // Optional but good for reverse lookup
      forward: {
        on: 'picks',
        has: 'one',
        label: 'category'
      },
      reverse: {
        on: 'categories',
        has: 'many',
        label: 'picks'
      }
    },
    picksNominee: {
        forward: {
            on: 'picks',
            has: 'one',
            label: 'nominee'
        },
        reverse: {
            on: 'nominees',
            has: 'many',
            label: 'picks'
        }
    },
    resultsCategory: {
      forward: {
        on: 'results',
        has: 'one',
        label: 'category'
      },
      reverse: {
        on: 'categories',
        has: 'many',
        label: 'results'
      }
    },
    resultsNominee: {
      forward: {
        on: 'results',
        has: 'one',
        label: 'nominee'
      },
      reverse: {
        on: 'nominees',
        has: 'many',
        label: 'results'
      }
    },
    professionalPicksUser: {
      forward: {
        on: 'professional_picks',
        has: 'one',
        label: 'user'
      },
      reverse: {
        on: 'users',
        has: 'many',
        label: 'professional_picks'
      }
    },
    professionalPicksCategory: {
      forward: {
        on: 'professional_picks',
        has: 'one',
        label: 'category'
      },
      reverse: {
        on: 'categories',
        has: 'many',
        label: 'professional_picks'
      }
    },
    professionalPicksNominee: {
      forward: {
        on: 'professional_picks',
        has: 'one',
        label: 'nominee'
      },
      reverse: {
        on: 'nominees',
        has: 'many',
        label: 'professional_picks'
      }
    }
  }
});

// React Client (for hooks)
const db = init({
  appId: APP_ID,
  schema,
});

// Core Client (for async functions outside components)
const dbCore = initCore({
  appId: APP_ID,
  schema,
});

export { db, dbCore };
