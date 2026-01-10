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
      const { data: newBallot, error: createError } = await (supabase
        .from('ballots')
        .insert({
          user_id: userId,
          event_id: eventId,
          league_id: leagueId
        } as any)
        .select()
        .single() as any)

      if (createError) throw createError
      ballotId = newBallot?.id
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

    const { error: insertError } = await (supabase
      .from('picks')
      .insert(picksToInsert as any) as any)

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
      .select()
      .single()

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

export async function getBallot(ballotId: string): Promise<{ ballot: Ballot | null, error: any }> {
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
      .eq('id', ballotId)
      .single()

    if (error) throw error

    return { ballot: data, error: null }
  } catch (error) {
    return { ballot: null, error }
  }
}

export async function getBallotsByLeague(leagueId: string, eventId: string): Promise<{ ballots: Ballot[], error: any }> {
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
      .eq('league_id', leagueId)
      .eq('event_id', eventId)

    if (error) throw error

    return { ballots: data || [], error: null }
  } catch (error) {
    return { ballots: [], error }
  }
}

export async function getNomineePercentages(categoryId: string, eventId: string, leagueId: string): Promise<{ percentages: Record<string, number>, totalUsers: number, error: any }> {
  try {
    // Get all ballots for this category in the league/event
    const { data: ballots, error: ballotsError } = await supabase
      .from('ballots')
      .select(`
        user_id,
        picks!inner(
          category_id,
          nominee_id
        )
      `)
      .eq('event_id', eventId)
      .eq('league_id', leagueId)
      .eq('picks.category_id', categoryId)

    if (ballotsError) throw ballotsError

    // Get user information for all ballots
    const userIds = (ballots as any[])?.map((b: any) => b.user_id) || []
    if (userIds.length === 0) {
      return { percentages: {}, totalUsers: 0, error: null }
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, username')
      .in('id', userIds)

    if (usersError) throw usersError

    // Create a map of user info for quick lookup
    const userMap = new Map()
    ;(users as any[])?.forEach((user: any) => {
      userMap.set(user.id, user)
    })

    // Filter out test users (emails containing 'test' or 'demo', case-insensitive)
    const realUserBallots = (ballots as any[])?.filter((ballot: any) => {
      const user = userMap.get(ballot.user_id)
      if (!user) return false
      
      const email = user.email || ''
      const username = user.username || ''
      return !email.toLowerCase().includes('test') && 
             !email.toLowerCase().includes('demo') &&
             !username.toLowerCase().includes('test') && 
             !username.toLowerCase().includes('demo')
    }) || []

    // Count picks for each nominee
    const nomineeCounts: Record<string, number> = {}
    realUserBallots.forEach((ballot: any) => {
      const nomineeId = ballot.picks.nominee_id
      nomineeCounts[nomineeId] = (nomineeCounts[nomineeId] || 0) + 1
    })

    // Calculate percentages
    const totalUsers = realUserBallots.length
    const percentages: Record<string, number> = {}
    
    if (totalUsers > 0) {
      Object.keys(nomineeCounts).forEach(nomineeId => {
        percentages[nomineeId] = Math.round((nomineeCounts[nomineeId] / totalUsers) * 100)
      })
    }

    return { percentages, totalUsers, error: null }
  } catch (error) {
    return { percentages: {}, totalUsers: 0, error }
  }
}
