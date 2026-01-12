import { dbCore } from './instant';
import { id } from '@instantdb/core';
import { 
  getCategories, 
  getBallot, 
  saveBallotPick, 
  saveBallotPicks,
  getActivePlayers,
  getAllPlayersWithScores,
  getPlayerStats,
  getNomineePercentages
} from './instantService';

// Types from InstantDB schema
export type Category = {
  id: string;
  event_id: string;
  name: string;
  display_order: number;
  base_points: number;
  emoji: string;
  nominees?: any[];
}

export type Ballot = {
  id: string;
  picks?: { id: string; }[];
}

export type Pick = {
  id: string;
  ballot_id: string;
  category_id: string;
  nominee_id: string;
  is_power_pick: boolean;
  created_at: number;
}

// Additional functions not available in instantService
export async function createOrUpdateBallot(
  userId: string,
  eventId: string,
  leagueId: string,
  picks: { categoryId: string, nomineeId: string, isPowerPick: boolean }[]
): Promise<{ ballot: Ballot | null, error: any }> {
  const result = await saveBallotPicks(userId, eventId, leagueId, picks);
  if (result.error) {
    return { ballot: null, error: result.error };
  }
  
  const ballotResult = await getBallot(userId, eventId);
  return { ballot: ballotResult, error: null };
}

export async function lockBallot(ballotId: string): Promise<{ error: any }> {
  const ballotQuery = await dbCore.queryOnce({
    ballots: {
      $: { where: { id: ballotId } }
    }
  });

  if (ballotQuery.data.ballots.length === 0) {
    return { error: { message: 'Ballot not found' } };
  }

  const ballot = ballotQuery.data.ballots[0];

  await dbCore.transact([
    dbCore.tx.ballots[ballotId].update({
      is_locked: true
    })
  ]);

  return { error: null };
}

export async function getEvent(eventId: string): Promise<{ event: any | null, error: any }> {
  const events = {
    'golden-globes-2026': {
      id: 'golden-globes-2026',
      name: 'Golden Globes 2026',
      ceremony_date: '2026-01-11',
      picks_lock_at: '2026-01-11T19:00:00-06:00',
      is_active: true,
      is_complete: false
    }
  };

  const event = events[eventId as keyof typeof events] || null;
  return { event, error: null };
}

export async function getBallotsByLeague(leagueId: string, eventId: string): Promise<{ ballots: Ballot[], error: any }> {
  const ballotsQuery = await dbCore.queryOnce({
    ballots: {
      $: {
        where: { 
          league_id: leagueId,
          event_id: eventId
        }
      },
      picks: {}
    },
    users: {}
  });

  const ballots = ballotsQuery.data.ballots.map((ballot: any) => ({
    ...ballot,
    username: ballot.users?.username || 'Unknown'
  }));

  return { ballots, error: null };
}

export async function getUserBallot(userId: string, eventId: string, leagueId: string): Promise<{ ballot: Ballot | null, error: any }> {
  const ballotResult = await getBallot(userId, eventId);
  return { ballot: ballotResult, error: null };
}

// Export all functions for backward compatibility
export { 
  getCategories,
  getBallot,
  saveBallotPick,
  saveBallotPicks,
  getActivePlayers,
  getAllPlayersWithScores,
  getPlayerStats,
  getNomineePercentages
};
