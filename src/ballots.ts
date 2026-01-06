import { supabase } from './supabase'
import type { Database } from './supabase'

export type Category = Database['public']['Tables']['categories']['Row'] & {
  nominees: Database['public']['Tables']['nominees']['Row'][]
}

export type Ballot = Database['public']['Tables']['ballots']['Row'] & {
  picks: Database['public']['Tables']['picks']['Row'][]
}

export type Pick = Database['public']['Tables']['picks']['Row']

export async function getCategories(eventId: string): Promise<{ categories: Category[], error: any }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        nominees (
          id,
          name,
          tmdb_id,
          display_order
        )
      `)
      .eq('event_id', eventId)
      .order('display_order')
      .order('nominees.display_order', { foreignTable: 'nominees' })

    if (error) throw error

    return { categories: data || [], error: null }
  } catch (error) {
    return { categories: [], error }
  }
}

export async function getUserBallot(userId: string, eventId: string, leagueId: string): Promise<{ ballot: Ballot | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('ballots')
      .select(`
        *,
        picks (
          id,
          category_id,
          nominee_id,
          is_power_pick
        )
      `)
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('league_id', leagueId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error
    }

    return { ballot: data, error: null }
  } catch (error) {
    return { ballot: null, error }
  }
}

export async function createOrUpdateBallot(
  userId: string,
  eventId: string,
  leagueId: string,
  picks: { categoryId: string, nomineeId: string, isPowerPick: boolean }[]
): Promise<{ ballot: Ballot | null, error: any }> {
  try {
    // First, get or create the ballot
    const { ballot: existingBallot, error: ballotError } = await getUserBallot(userId, eventId, leagueId)
    
    if (ballotError) throw ballotError

    let ballotId: string

    if (existingBallot) {
      ballotId = existingBallot.id
    } else {
      // Create new ballot
      const { data: newBallot, error: createError } = await supabase
        .from('ballots')
        .insert({
          user_id: userId,
          event_id: eventId,
          league_id: leagueId
        })
        .select()
        .single()

      if (createError) throw createError
      ballotId = newBallot.id
    }

    // Delete existing picks
    const { error: deleteError } = await supabase
      .from('picks')
      .delete()
      .eq('ballot_id', ballotId)

    if (deleteError) throw deleteError

    // Insert new picks
    const picksToInsert = picks.map(pick => ({
      ballot_id: ballotId,
      category_id: pick.categoryId,
      nominee_id: pick.nomineeId,
      is_power_pick: pick.isPowerPick
    }))

    const { error: insertError } = await supabase
      .from('picks')
      .insert(picksToInsert)

    if (insertError) throw insertError

    // Return the complete ballot
    const result = await getUserBallot(userId, eventId, leagueId)
    return result
  } catch (error) {
    return { ballot: null, error }
  }
}

export async function lockBallot(ballotId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('ballots')
      .update({ is_locked: true })
      .eq('id', ballotId)

    return { error }
  } catch (error) {
    return { error }
  }
}

export async function getEvent(eventId: string): Promise<{ event: Database['public']['Tables']['events']['Row'] | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) throw error

    return { event: data, error: null }
  } catch (error) {
    return { event: null, error }
  }
}
