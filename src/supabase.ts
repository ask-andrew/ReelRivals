import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Check if environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  })
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_emoji?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_emoji?: string
          created_at?: string
        }
      }
      leagues: {
        Row: {
          id: string
          name: string
          code: string
          creator_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          creator_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          creator_id?: string
          created_at?: string
        }
      }
      league_members: {
        Row: {
          id: string
          league_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          league_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      events: {
        Row: {
          id: string
          name: string
          ceremony_date: string
          picks_lock_at: string
          is_active: boolean
          is_complete: boolean
        }
        Insert: {
          id: string
          name: string
          ceremony_date: string
          picks_lock_at: string
          is_active?: boolean
          is_complete?: boolean
        }
        Update: {
          id?: string
          name?: string
          ceremony_date?: string
          picks_lock_at?: string
          is_active?: boolean
          is_complete?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          event_id: string
          name: string
          display_order: number
          base_points: number
          emoji: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          display_order: number
          base_points: number
          emoji?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          display_order?: number
          base_points?: number
          emoji?: string
        }
      }
      nominees: {
        Row: {
          id: string
          category_id: string
          name: string
          tmdb_id: number | null
          display_order: number
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          tmdb_id?: number | null
          display_order: number
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          tmdb_id?: number | null
          display_order?: number
        }
      }
      ballots: {
        Row: {
          id: string
          user_id: string
          event_id: string
          league_id: string
          submitted_at: string
          is_locked: boolean
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          league_id: string
          submitted_at?: string
          is_locked?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          league_id?: string
          submitted_at?: string
          is_locked?: boolean
        }
      }
      picks: {
        Row: {
          id: string
          ballot_id: string
          category_id: string
          nominee_id: string
          is_power_pick: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ballot_id: string
          category_id: string
          nominee_id: string
          is_power_pick?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ballot_id?: string
          category_id?: string
          nominee_id?: string
          is_power_pick?: boolean
          created_at?: string
        }
      }
      results: {
        Row: {
          id: string
          category_id: string
          winner_nominee_id: string
          announced_at: string
        }
        Insert: {
          id?: string
          category_id: string
          winner_nominee_id: string
          announced_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          winner_nominee_id?: string
          announced_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          league_id: string
          event_id: string
          total_points: number
          correct_picks: number
          power_picks_hit: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          league_id: string
          event_id: string
          total_points?: number
          correct_picks?: number
          power_picks_hit?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          league_id?: string
          event_id?: string
          total_points?: number
          correct_picks?: number
          power_picks_hit?: number
          updated_at?: string
        }
      }
    }
  }
}
