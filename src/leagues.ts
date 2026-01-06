import { supabase } from './supabase'
import { generateLeagueCode } from './auth'
import type { Database } from './supabase'

export type League = Database['public']['Tables']['leagues']['Row']
export type LeagueMember = Database['public']['Tables']['league_members']['Row']
export type User = Database['public']['Tables']['users']['Row']

export async function createLeague(name: string, creatorId: string) {
  try {
    const code = generateLeagueCode()
    
    // Create the league
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .insert({
        name,
        code,
        creator_id: creatorId
      })
      .select()
      .single()

    if (leagueError) throw leagueError

    // Add creator as a member
    const { error: memberError } = await supabase
      .from('league_members')
      .insert({
        league_id: league.id,
        user_id: creatorId
      })

    if (memberError) throw memberError

    return { league, error: null }
  } catch (error) {
    return { league: null, error }
  }
}

export async function joinLeague(code: string, userId: string) {
  try {
    // Find league by code
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('code', code)
      .single()

    if (leagueError) throw leagueError

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('league_members')
      .select('*')
      .eq('league_id', league.id)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      throw new Error('You are already a member of this league')
    }

    // Add user to league
    const { error: memberError } = await supabase
      .from('league_members')
      .insert({
        league_id: league.id,
        user_id: userId
      })

    if (memberError) throw memberError

    return { league, error: null }
  } catch (error) {
    return { league: null, error }
  }
}

export async function getUserLeagues(userId: string) {
  try {
    const { data, error } = await supabase
      .from('league_members')
      .select(`
        league_id,
        leagues!inner(
          id,
          name,
          code,
          creator_id,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (error) throw error

    return { leagues: data?.map(m => m.leagues) || [], error: null }
  } catch (error) {
    return { leagues: [], error }
  }
}

export async function getLeagueMembers(leagueId: string) {
  try {
    const { data, error } = await supabase
      .from('league_members')
      .select(`
        user_id,
        joined_at,
        users!inner(
          id,
          username,
          avatar_emoji,
          email
        )
      `)
      .eq('league_id', leagueId)

    if (error) throw error

    return { members: data?.map(m => m.users) || [], error: null }
  } catch (error) {
    return { members: [], error }
  }
}

export async function leaveLeague(leagueId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('league_members')
      .delete()
      .eq('league_id', leagueId)
      .eq('user_id', userId)

    return { error }
  } catch (error) {
    return { error }
  }
}
