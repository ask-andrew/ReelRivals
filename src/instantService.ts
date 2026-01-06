import { dbCore, InstantUser } from "./instant";
import { id } from "@instantdb/core";

export type { InstantUser };

export async function testInstantDB() {
  try {
     // Just a dummy read
     await dbCore.queryOnce({ users: { $: { limit: 1 } } });
     return { success: true, error: null };
  } catch (e) {
     return { success: false, error: e };
  }
}

// --- Auth Functions --- //

export async function signUp(
  email: string,
  username: string,
  avatarEmoji: string
): Promise<{ user: InstantUser | null; error: any }> {
  try {
    // Check if user already exists
    const userQuery = await dbCore.queryOnce({ users: { $: { where: { email } } } });

    if (userQuery.data.users.length > 0) {
      return {
        user: null,
        error: { message: "User with this email already exists" },
      };
    }

    const userId = id();

    const newUser = {
      id: userId,
      email,
      username,
      avatar_emoji: avatarEmoji,
      created_at: Date.now(),
    };

    await dbCore.transact(dbCore.tx.users[userId].update(newUser));

    // Store userId in localStorage for session persistence
    localStorage.setItem("reelrivals_user_id", userId);

    return { user: newUser as unknown as InstantUser, error: null };
  } catch (error) {
    console.error("Instant DB signup error:", error);
    return { user: null, error };
  }
}

export async function signIn(
  email: string
): Promise<{ user: InstantUser | null; error: any }> {
  try {
    const userQuery = await dbCore.queryOnce({ users: { $: { where: { email } } } });

    if (userQuery.data.users.length === 0) {
      return { user: null, error: { message: "User not found" } };
    }

    const user = userQuery.data.users[0];
    localStorage.setItem("reelrivals_user_id", user.id);

    return { user: user as unknown as InstantUser, error: null };
  } catch (error) {
    console.error("Instant DB signin error:", error);
    return { user: null, error };
  }
}

export async function signOut() {
  localStorage.removeItem("reelrivals_user_id");
  window.location.reload();
}

export async function getCurrentUser(): Promise<InstantUser | null> {
  const userId = localStorage.getItem("reelrivals_user_id");
  if (!userId) return null;

  try {
    const userQuery = await dbCore.queryOnce({
      users: { $: { where: { id: userId } } },
    });
    if (userQuery.data.users.length > 0) {
      return userQuery.data.users[0] as unknown as InstantUser;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// --- League Functions --- //

export async function getOrCreateDefaultLeague(userId: string) {
  try {
    // Check if user is in any league
    const memberQuery = await dbCore.queryOnce({
      league_members: {
        $: { where: { user_id: userId } },
      },
    });

    if (memberQuery.data.league_members.length > 0) {
      // Get the first league
      const member = memberQuery.data.league_members[0] as any;
      const leagueId = member.league_id;
      return { league: { id: leagueId }, error: null };
    }

    // Create default league
    const leagueId = id();
    const memberId = id();
    const timestamp = Date.now();

    await dbCore.transact([
      dbCore.tx.leagues[leagueId].update({
        name: "My First League",
        code: `GLOBES-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}`,
        creator_id: userId,
        created_at: timestamp,
      }),
      dbCore.tx.league_members[memberId].update({
        league_id: leagueId,
        user_id: userId,
        joined_at: timestamp,
      }),
    ]);

    return { league: { id: leagueId }, error: null };
  } catch (error) {
    console.error("Error in getOrCreateDefaultLeague:", error);
    return { league: null, error };
  }
}

// --- Data Seeding (Golden Globes) --- //

const goldenGlobesCategories = [
  {
    name: 'Best Motion Picture – Drama',
    base_points: 50,
    emoji: '🏆',
    nominees: [
      { name: 'Frankenstein', tmdb_id: "" },
      { name: 'Hamnet', tmdb_id: "" },
      { name: 'It Was Just an Accident', tmdb_id: "" },
      { name: 'The Secret Agent', tmdb_id: "" },
      { name: 'Sentimental Value', tmdb_id: "" },
      { name: 'Sinners', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Motion Picture – Musical or Comedy',
    base_points: 50,
    emoji: '🎭',
    nominees: [
      { name: 'Blue Moon', tmdb_id: "" },
      { name: 'Bugonia', tmdb_id: "" },
      { name: 'Marty Supreme', tmdb_id: "" },
      { name: 'No Other Choice', tmdb_id: "" },
      { name: 'Nouvelle Vague', tmdb_id: "" },
      { name: 'One Battle After Another', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Director – Motion Picture',
    base_points: 50,
    emoji: '🎬',
    nominees: [
      { name: 'Paul Thomas Anderson - One Battle After Another', tmdb_id: "" },
      { name: 'Ryan Coogler - Sinners', tmdb_id: "" },
      { name: 'Guillermo del Toro - Frankenstein', tmdb_id: "" },
      { name: 'Jafar Panahi - It Was Just an Accident', tmdb_id: "" },
      { name: 'Joachim Trier - Sentimental Value', tmdb_id: "" },
      { name: 'Chloé Zhao - Hamnet', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Performance by a Female Actor – Drama',
    base_points: 50,
    emoji: '🌟',
    nominees: [
      { name: 'Jessie Buckley - Hamnet', tmdb_id: "" },
      { name: 'Jennifer Lawrence - Die My Love', tmdb_id: "" },
      { name: 'Renate Reinsve - Sentimental Value', tmdb_id: "" },
      { name: 'Julia Roberts - After the Hunt', tmdb_id: "" },
      { name: 'Tessa Thompson - Hedda', tmdb_id: "" },
      { name: 'Eva Victor - Sorry, Baby', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Performance by a Male Actor – Drama',
    base_points: 50,
    emoji: '🎭',
    nominees: [
      { name: 'Joel Edgerton - Train Dreams', tmdb_id: "" },
      { name: 'Oscar Isaac - Frankenstein', tmdb_id: "" },
      { name: 'Dwayne Johnson - The Smashing Machine', tmdb_id: "" },
      { name: 'Michael B. Jordan - Sinners', tmdb_id: "" },
      { name: 'Wagner Moura - The Secret Agent', tmdb_id: "" },
      { name: 'Jeremy Allen White - Springsteen: Deliver Me From Nowhere', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Performance by a Female Actor – Musical or Comedy',
    base_points: 50,
    emoji: '🌟',
    nominees: [
      { name: 'Rose Byrne - If I Had Legs I’d Kick You', tmdb_id: "" },
      { name: 'Cynthia Erivo - Wicked: For Good', tmdb_id: "" },
      { name: 'Kate Hudson - Song Sung Blue', tmdb_id: "" },
      { name: 'Chase Infiniti - One Battle After Another', tmdb_id: "" },
      { name: 'Amanda Seyfried - The Testament of Ann Lee', tmdb_id: "" },
      { name: 'Emma Stone - Bugonia', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Performance by a Male Actor – Musical or Comedy',
    base_points: 50,
    emoji: '🎭',
    nominees: [
      { name: 'Timothée Chalamet - Marty Supreme', tmdb_id: "" },
      { name: 'George Clooney - Jay Kelly', tmdb_id: "" },
      { name: 'Leonardo DiCaprio - One Battle After Another', tmdb_id: "" },
      { name: 'Ethan Hawke - Blue Moon', tmdb_id: "" },
      { name: 'Lee Byung-hun - No Other Choice', tmdb_id: "" },
      { name: 'Jesse Plemons - Bugonia', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Television Series – Drama',
    base_points: 50,
    emoji: '📺',
    nominees: [
      { name: 'The Diplomat', tmdb_id: "" },
      { name: 'The Pitt', tmdb_id: "" },
      { name: 'Pluribus', tmdb_id: "" },
      { name: 'Severance', tmdb_id: "" },
      { name: 'Slow Horses', tmdb_id: "" },
      { name: 'The White Lotus', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Television Series – Musical or Comedy',
    base_points: 50,
    emoji: '😂',
    nominees: [
      { name: 'Abbott Elementary', tmdb_id: "" },
      { name: 'The Bear', tmdb_id: "" },
      { name: 'Hacks', tmdb_id: "" },
      { name: 'Nobody Wants This', tmdb_id: "" },
      { name: 'Only Murders in the Building', tmdb_id: "" },
      { name: 'The Studio', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Limited Series, Anthology Series, or Motion Picture Made for TV',
    base_points: 50,
    emoji: '🎞️',
    nominees: [
      { name: 'Adolescence', tmdb_id: "" },
      { name: 'All Her Fault', tmdb_id: "" },
      { name: 'The Beast in Me', tmdb_id: "" },
      { name: 'Black Mirror', tmdb_id: "" },
      { name: 'Dying for Sex', tmdb_id: "" },
      { name: 'The Girlfriend', tmdb_id: "" }
    ]
  }
];

export async function ensureCategoriesSeeded() {
  const eventId = "golden-globes-2026";

  // Check if categories exist AND have nominees linked
  const cats = await dbCore.queryOnce({
    categories: { 
      $: { where: { event_id: eventId } },
      nominees: {} 
    },
  });

  const existingCategories = cats.data.categories;
  
  // Force re-seed if the category count doesn't match our new official list (10 categories)
  const isDataComplete = existingCategories.length === goldenGlobesCategories.length && 
    existingCategories.every((c: any) => c.nominees && c.nominees.length > 0);

  if (isDataComplete) {
    return; // Data is good!
  }

  console.log("Detecting incomplete or old data. Re-seeding Golden Globes...");

  const txs = [];

  // 1. Cleanup bad data
  if (existingCategories.length > 0) {
    for (const cat of existingCategories) {
      txs.push(dbCore.tx.categories[cat.id].delete());
      if (cat.nominees && cat.nominees.length) {
        for (const nom of cat.nominees) {
          txs.push(dbCore.tx.nominees[nom.id].delete());
        }
      }
    }
  }

  // 2. Create fresh data
  for (let i = 0; i < goldenGlobesCategories.length; i++) {
    const cat = goldenGlobesCategories[i];
    const catId = id();

    txs.push(
      dbCore.tx.categories[catId].update({
        event_id: eventId,
        name: cat.name,
        display_order: i + 1,
        base_points: cat.base_points,
        emoji: cat.emoji,
      })
    );

    for (const nom of cat.nominees) {
      const nomId = id();
      txs.push(
        dbCore.tx.nominees[nomId].update({
          name: nom.name,
          tmdb_id: nom.tmdb_id || "",
          display_order: 0,
        }).link({category: catId})
      );
    }
  }

  await dbCore.transact(txs);
  console.log("Re-seeding complete.");
}

// --- Ballot Functions --- //

export async function getCategories(eventId: string) {
  try {
    await ensureCategoriesSeeded();

    const data = await dbCore.queryOnce({
      categories: {
        $: {
          where: { event_id: eventId },
        },
        nominees: {},
      },
    });

    // Sort categories (InstantDB supports sort in query but safer manually if data is mixed)
    const sortedCats = data.data.categories.sort((a: any, b: any) => a.display_order - b.display_order);

    return { categories: sortedCats, error: null };
  } catch (error) {
    console.error("Error getting categories:", error);
    return { categories: [], error };
  }
}

export async function getBallot(userId: string, eventId: string) {
  try {
    const ballotQuery = await dbCore.queryOnce({
      ballots: {
        $: { where: { user_id: userId, event_id: eventId } },
        picks: {}
      },
    });

    if (ballotQuery.data.ballots.length > 0) {
      return ballotQuery.data.ballots[0];
    }
    return null;
  } catch (e) {
    console.error("Error fetching ballot:", e);
    return null;
  }
}

export async function saveBallotPick(
  userId: string,
  eventId: string,
  leagueId: string,
  categoryId: string,
  nomineeId: string,
  isPowerPick: boolean
) {
  try {
    // 1. Find or create ballot
    const ballotQuery = await dbCore.queryOnce({
      ballots: {
        $: { where: { user_id: userId, event_id: eventId } },
      },
    });

    let ballotId = "";

    if (ballotQuery.data.ballots.length > 0) {
      ballotId = ballotQuery.data.ballots[0].id;
    } else {
      ballotId = id();
      await dbCore.transact(
        dbCore.tx.ballots[ballotId].update({
          user_id: userId,
          event_id: eventId,
          league_id: leagueId,
          submitted_at: Date.now(),
          is_locked: false,
        })
      );
    }

    // 2. Manage the pick
    
    // Check if a pick already exists for this category on this ballot
    // (We need to query picks to find the one for this category to delete/update it)
    const existingPicksQuery = await dbCore.queryOnce({
      picks: { $: { where: { ballot_id: ballotId, category_id: categoryId } } },
    });

    const txs = [];

    // Delete existing pick for this category if it exists
    existingPicksQuery.data.picks.forEach((p: any) => {
      txs.push(dbCore.tx.picks[p.id].delete());
    });

    // Create new pick
    const pickId = id();
    txs.push(
      dbCore.tx.picks[pickId].update({
        ballot_id: ballotId, // kept for reference, but link is key
        category_id: categoryId,
        nominee_id: nomineeId,
        is_power_pick: isPowerPick,
        created_at: Date.now(),
      }).link({
        ballot: ballotId, 
        category: categoryId, 
        nominee: nomineeId
      })
    );

    await dbCore.transact(txs);
    return { error: null };
  } catch (error) {
    console.error("Error saving single pick:", error);
    return { error };
  }
}

// Bulk save function - saves multiple picks at once
export async function saveBallotPicks(
  userId: string,
  eventId: string,
  leagueId: string,
  picks: { categoryId: string; nomineeId: string; isPowerPick: boolean }[]
) {
  if (!picks || picks.length === 0) {
    return { error: new Error("No picks to save") };
  }

  try {
    // Save each pick individually - could optimize with a batch transaction later
    for (const pick of picks) {
      const result = await saveBallotPick(
        userId,
        eventId,
        leagueId,
        pick.categoryId,
        pick.nomineeId,
        pick.isPowerPick
      );
      
      if (result.error) {
        console.error(`Failed to save pick for category ${pick.categoryId}:`, result.error);
        return result; // Return on first error
      }
    }
    
    return { error: null };
  } catch (error) {
    console.error("Error in saveBallotPicks:", error);
    return { error };
  }
}
