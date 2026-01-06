import { supabase } from './supabase'
import type { Database } from './supabase'

export type AuthUser = Database['public']['Tables']['users']['Row']

export async function signUp(email: string, password: string, username: string, avatarEmoji: string) {
  try {
    // First create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_emoji: avatarEmoji
        }
      }
    })

    if (authError) {
      throw authError
    }

    if (authData.user) {
      // Create user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          username,
          avatar_emoji: avatarEmoji
        })

      if (profileError) {
        throw profileError
      }
    }

    return { user: authData.user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { user: data.user, error }
  } catch (error) {
    return { user: null, error }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Get user profile from users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return profile
    }

    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        // Get user profile from users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        callback(profile || null)
      } else {
        callback(null)
      }
    }
  )

  return subscription
}

export function generateLeagueCode(): string {
  const eventCodes = ['GLOBES', 'GRAMMYS', 'OSCARS', 'SAG', 'BAFTA']
  const eventCode = eventCodes[Math.floor(Math.random() * eventCodes.length)]
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${eventCode}-${randomChars}`
}
