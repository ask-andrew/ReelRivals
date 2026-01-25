import { dbCore, InstantUser } from "./instant";
import { id } from "@instantdb/core";
import { AWARD_SHOW_CATEGORIES } from "../constants";

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

// Simple password hashing function (for demo purposes)
async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  // For now, simple base64 encoding (NOT SECURE FOR PRODUCTION)
  return btoa(password + 'reelrivals_salt');
}

export async function signUp(
  email: string,
  username: string,
  avatarEmoji: string,
  password?: string
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
      password_hash: password ? await hashPassword(password) : undefined,
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
  email: string,
  password?: string
): Promise<{ user: InstantUser | null; error: any }> {
  try {
    const userQuery = await dbCore.queryOnce({ users: { $: { where: { email } } } });

    if (userQuery.data.users.length === 0) {
      return { user: null, error: { message: "User not found" } };
    }

    const user = userQuery.data.users[0] as any;
    
    // Verify password if provided
    if (password && user.password_hash) {
      const hashedPassword = await hashPassword(password);
      if (hashedPassword !== user.password_hash) {
        return { user: null, error: { message: "Incorrect password" } };
      }
    }

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

const baftaCategories = [
  {
    name: 'Best Film',
    base_points: 50,
    emoji: '🏆',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Outstanding British Film',
    base_points: 50,
    emoji: '🇬🇧',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Outstanding Debut by a British Writer, Director or Producer',
    base_points: 50,
    emoji: '🌟',
    nominees: [
      { name: 'The Ceremony', tmdb_id: "" },
      { name: 'The Man in My Basement', tmdb_id: "" },
      { name: 'Mother Vera', tmdb_id: "" },
      { name: 'My Father\'s Shadow', tmdb_id: "" },
      { name: 'Pillion', tmdb_id: "" },
      { name: 'Ocean with David Attenborough', tmdb_id: "" },
      { name: 'The Shadow Scholars', tmdb_id: "" },
      { name: 'Urchin', tmdb_id: "" },
      { name: 'A Want In Her', tmdb_id: "" },
      { name: 'Wasteman', tmdb_id: "" }
    ]
  },
  {
    name: 'Children\'s & Family Film',
    base_points: 50,
    emoji: '👨‍👩‍👧‍👦',
    nominees: [
      { name: 'Arco', tmdb_id: "" },
      { name: 'Boong', tmdb_id: "" },
      { name: 'Elio', tmdb_id: "" },
      { name: 'Grow', tmdb_id: "" },
      { name: 'How to Train Your Dragon', tmdb_id: "" },
      { name: 'Lilo & Stitch', tmdb_id: "" },
      { name: 'Little Amelie', tmdb_id: "" },
      { name: 'Zootropolis 2', tmdb_id: "" }
    ]
  },
  {
    name: 'Film Not in the English Language',
    base_points: 50,
    emoji: '🌍',
    nominees: [
      { name: 'It Was Just an Accident', tmdb_id: "" },
      { name: 'La Grazia', tmdb_id: "" },
      { name: 'Left-Handed Girl', tmdb_id: "" },
      { name: 'No Other Choice', tmdb_id: "" },
      { name: 'Nouvelle Vague', tmdb_id: "" },
      { name: 'Rental Family', tmdb_id: "" },
      { name: 'The Secret Agent', tmdb_id: "" },
      { name: 'Sentimental Value', tmdb_id: "" },
      { name: 'Sirāt', tmdb_id: "" },
      { name: 'The Voice of Hind Rajab', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Documentary',
    base_points: 50,
    emoji: '📽️',
    nominees: [
      { name: '2000 Meters To Andriivka', tmdb_id: "" },
      { name: 'Apocalypse In The Tropics', tmdb_id: "" },
      { name: 'Becoming Led Zeppelin', tmdb_id: "" },
      { name: 'Cover-Up', tmdb_id: "" },
      { name: 'The Librarians', tmdb_id: "" },
      { name: 'Mr Nobody Against Putin', tmdb_id: "" },
      { name: 'Ocean with David Attenborough', tmdb_id: "" },
      { name: 'One to One: John & Yoko', tmdb_id: "" },
      { name: 'The Perfect Neighbour', tmdb_id: "" },
      { name: 'Riefenstahl', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Animated Film',
    base_points: 50,
    emoji: '🎨',
    nominees: [
      { name: 'Arco', tmdb_id: "" },
      { name: 'The Bad Guys 2', tmdb_id: "" },
      { name: 'Demon Slayer: Kimetsu no Yaiba Infinity Castle', tmdb_id: "" },
      { name: 'Elio', tmdb_id: "" },
      { name: 'Little Amelie', tmdb_id: "" },
      { name: 'Zootropolis 2', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Director',
    base_points: 50,
    emoji: '🎬',
    nominees: [
      { name: 'Bugonia (Yorgos Lanthimos)', tmdb_id: "" },
      { name: 'Die My Love (Lynne Ramsay)', tmdb_id: "" },
      { name: 'Hamnet (Chloé Zhao)', tmdb_id: "" },
      { name: 'A House of Dynamite (Kathryn Bigelow)', tmdb_id: "" },
      { name: 'Marty Supreme (Josh Safdie)', tmdb_id: "" },
      { name: 'One Battle After Another (Paul Thomas Anderson)', tmdb_id: "" },
      { name: 'Rental Family (Hikari)', tmdb_id: "" },
      { name: 'Sentimental Value (Joachim Trier)', tmdb_id: "" },
      { name: 'Sinners (Ryan Coogler)', tmdb_id: "" },
      { name: 'The Voice of Hind Rajab (Kaouther Ben Hania)', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Original Screenplay',
    base_points: 50,
    emoji: '✍️',
    nominees: [
      { name: 'Blue Moon', tmdb_id: "" },
      { name: 'A House of Dynamite', tmdb_id: "" },
      { name: 'I Swear', tmdb_id: "" },
      { name: 'Is This Thing On?', tmdb_id: "" },
      { name: 'It Was Just an Accident', tmdb_id: "" },
      { name: 'Marty Supreme', tmdb_id: "" },
      { name: 'The Secret Agent', tmdb_id: "" },
      { name: 'Sentimental Value', tmdb_id: "" },
      { name: 'Sinners', tmdb_id: "" },
      { name: 'Weapons', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Adapted Screenplay',
    base_points: 50,
    emoji: '📖',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Actress',
    base_points: 50,
    emoji: '👩',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Actor',
    base_points: 50,
    emoji: '👨',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Supporting Actress',
    base_points: 50,
    emoji: '👩‍🦰',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Supporting Actor',
    base_points: 50,
    emoji: '👨‍🦱',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Casting',
    base_points: 50,
    emoji: '🎭',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Cinematography',
    base_points: 50,
    emoji: '📷',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Costume Design',
    base_points: 50,
    emoji: '👗',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Editing',
    base_points: 50,
    emoji: '✂️',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Makeup & Hair',
    base_points: 50,
    emoji: '💄',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Original Score',
    base_points: 50,
    emoji: '🎵',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Production Design',
    base_points: 50,
    emoji: '🏛️',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Special Visual Effects',
    base_points: 50,
    emoji: '💫',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best Sound',
    base_points: 50,
    emoji: '🔊',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best British Short Animation',
    base_points: 50,
    emoji: '🎞️',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  },
  {
    name: 'Best British Short Film',
    base_points: 50,
    emoji: '🎬',
    nominees: [
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" },
      { name: 'TBA - Nominations Jan 27', tmdb_id: "" }
    ]
  }
];

export async function ensureCategoriesSeeded(eventId: string = "golden-globes-2026") {
  console.log('[ensureCategoriesSeeded] Starting check for event:', eventId);
  
  try {
    // Check if categories exist AND have nominees linked
    const cats = await dbCore.queryOnce({
      categories: {
        $: {
          where: { event_id: eventId },
        },
        nominees: {}
      },
    });

    console.log('[ensureCategoriesSeeded] Query result:', cats);
    const existingCategories = cats.data.categories;
    console.log('[ensureCategoriesSeeded] Existing categories:', existingCategories.length);
    
    // Get the right category data for this event
    let eventCategories;
    switch (eventId) {
      case 'golden-globes-2026':
        eventCategories = AWARD_SHOW_CATEGORIES['golden-globes-2026'];
        break;
      case 'baftas-2026':
        eventCategories = AWARD_SHOW_CATEGORIES['baftas-2026'];
        break;
      case 'sag-2026':
        // TODO: Add SAG categories when available
        eventCategories = AWARD_SHOW_CATEGORIES['golden-globes-2026']; // Fallback for now
        break;
      case 'oscars-2026':
        eventCategories = AWARD_SHOW_CATEGORIES['oscars-2026'];
        break;
      default:
        eventCategories = AWARD_SHOW_CATEGORIES['golden-globes-2026']; // Fallback
    }
    
    // Force re-seed if category count doesn't match our new official list (10 categories)
    const isDataComplete = existingCategories.length === eventCategories.length && 
      existingCategories.every((c: any) => c.nominees && c.nominees.length > 0);

    console.log('[ensureCategoriesSeeded] Is data complete?', isDataComplete);
    console.log('[ensureCategoriesSeeded] Expected categories:', eventCategories.length);

    if (isDataComplete) {
      console.log('[ensureCategoriesSeeded] Data is good, no seeding needed');
      return existingCategories; // Return existing data
    }

    console.log("⚠️ [ensureCategoriesSeeded] Detecting incomplete or old data. Re-seeding", eventId, "...");

    const txs = [];

    // 1. Cleanup bad data
    if (existingCategories.length > 0) {
      console.log('[ensureCategoriesSeeded] Cleaning up', existingCategories.length, 'old categories');
      for (const cat of existingCategories) {
        txs.push(dbCore.tx.categories[cat.id].delete());
        if (cat.nominees && cat.nominees.length) {
          for (const nominee of cat.nominees) {
            txs.push(dbCore.tx.nominees[nominee.id].delete());
          }
        }
      }
    }

    // 2. Create fresh data
    console.log('[ensureCategoriesSeeded] Creating', eventCategories.length, 'new categories for', eventId);
    for (let i = 0; i < eventCategories.length; i++) {
      const cat = eventCategories[i];
      const catId = id();
      
      txs.push(dbCore.tx.categories[catId].update({
        event_id: eventId,
        name: cat.name,
        base_points: cat.base_points,
        emoji: cat.emoji,
        display_order: i + 1,
      }));
      
      // Create nominees for this category
      if (cat.nominees && cat.nominees.length > 0) {
        for (let j = 0; j < cat.nominees.length; j++) {
          const nominee = cat.nominees[j];
          const nomineeId = id();
          
          txs.push(dbCore.tx.nominees[nomineeId].update({
            category_id: catId,
            name: nominee.name,
            display_order: j + 1,
            tmdb_id: nominee.tmdb_id || "",
          }));
        }
      }
    }

    console.log('[ensureCategoriesSeeded] Executing', txs.length, 'transactions...');
    await dbCore.transact(txs);
    console.log("✅ [ensureCategoriesSeeded] Re-seeding complete for", eventId, "!");
    
    // Query again to get fresh data
    const freshCats = await dbCore.queryOnce({
      categories: {
        $: {
          where: { event_id: eventId },
        },
        nominees: {}
      },
    });
    
    console.log('[ensureCategoriesSeeded] Returning fresh categories:', freshCats.data.categories.length);
    return freshCats.data.categories;
  } catch (error) {
    console.error("❌ [ensureCategoriesSeeded] ERROR:", error);
    throw error;
  }
}

// --- Ballot Functions --- //

export async function getCategories(eventId: string) {
  try {
    console.log('[getCategories] Starting - eventId:', eventId);
    
    // First ensure categories are seeded for this event
    const categories = await ensureCategoriesSeeded(eventId);
    
    console.log('[getCategories] Got categories from seeding:', categories.length);

    // Sort categories (InstantDB supports sort in query but safer manually if data is mixed)
    const sortedCats = categories.sort((a: any, b: any) => a.display_order - b.display_order);

    console.log('[getCategories] Returning sorted categories:', sortedCats.length);
    return { categories: sortedCats, error: null };
  } catch (error) {
    console.error("[getCategories] ERROR:", error);
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

// --- Player Functions --- //

export async function getActivePlayers(eventId: string) {
  try {
    console.log('[getActivePlayers] Starting - eventId:', eventId);
    
    // Get all ballots for the event
    const ballotsQuery = await dbCore.queryOnce({
      ballots: {
        $: {
          where: { event_id: eventId },
        },
      },
      users: {}
    });

    console.log('[getActivePlayers] Raw ballots data:', ballotsQuery.data);

    // Transform the data to get unique users with their latest ballot
    const players = ballotsQuery.data.ballots.map((ballot: any) => ({
      id: ballot.user_id,
      username: ballot.users?.username || 'Unknown',
      avatar_emoji: ballot.users?.avatar_emoji || '🎬',
      submittedAt: new Date(ballot.submitted_at).toISOString().split('T')[0], // Format as YYYY-MM-DD
      ballotId: ballot.id,
    }));

    console.log('[getActivePlayers] Transformed players:', players);

    return { players, error: null };
  } catch (error) {
    console.error("Error fetching active players:", error);
    return { players: [], error };
  }
}

export async function getAllPlayersWithScores(eventId: string) {
  try {
    console.log('[getAllPlayersWithScores] Starting - eventId:', eventId);
    
    // Get all users first
    const allUsersQuery = await dbCore.queryOnce({
      users: { $: {} }
    });

    // Get all scores for this event
    const scoresQuery = await dbCore.queryOnce({
      scores: {
        $: {
          where: { event_id: eventId },
        },
      },
      users: {}
    });

    // Get all ballots for this event to check submission status
    const ballotsQuery = await dbCore.queryOnce({
      ballots: {
        $: {
          where: { event_id: eventId },
        },
        picks: {}
      },
    });

    console.log('[getAllPlayersWithScores] Raw scores data:', scoresQuery.data);
    console.log('[getAllPlayersWithScores] Raw ballots data:', ballotsQuery.data);

    // Create a map of user_id -> score for quick lookup
    const scoreMap = new Map();
    scoresQuery.data.scores.forEach((score: any) => {
      scoreMap.set(score.user_id, {
        totalPoints: score.total_points || 0,
        correctPicks: score.correct_picks || 0,
        powerPicksHit: score.power_picks_hit || 0,
        updatedAt: score.updated_at
      });
    });

    // Create a set of user IDs who have submitted ballots
    const submittedUserIds = new Set();
    ballotsQuery.data.ballots.forEach((ballot: any) => {
      if (ballot.picks && ballot.picks.length > 0) {
        submittedUserIds.add(ballot.user_id);
      }
    });

    // Combine users with their scores
    const playersWithScores = allUsersQuery.data.users.map((user: any) => {
      const score = scoreMap.get(user.id);
      const hasSubmittedBallot = submittedUserIds.has(user.id);
      
      return {
        id: user.id,
        username: user.username,
        avatar_emoji: user.avatar_emoji,
        totalPoints: score?.totalPoints || 0,
        correctPicks: score?.correctPicks || 0,
        powerPicksHit: score?.powerPicksHit || 0,
        hasSubmitted: hasSubmittedBallot,
        updatedAt: score?.updatedAt || user.created_at
      };
    });

    // Sort by total points (highest first), then by username
    playersWithScores.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return a.username.localeCompare(b.username);
    });

    console.log('[getAllPlayersWithScores] Transformed players:', playersWithScores);

    return { players: playersWithScores, error: null };
  } catch (error) {
    console.error("Error fetching players with scores:", error);
    return { players: [], error };
  }
}

export async function getPlayerStats(eventId: string) {
  try {
    // Get all users
    const allUsersQuery = await dbCore.queryOnce({
      users: { $: {} }
    });

    // Filter out test/demo accounts
    const realUsers = allUsersQuery.data.users.filter((user: any) => 
      !user.email.includes('demo') && 
      !user.email.includes('test') && 
      !user.email.includes('example')
    );

    // Get all ballots for this event
    const ballotsQuery = await dbCore.queryOnce({
      ballots: {
        $: {
          where: { event_id: eventId },
        },
        picks: {}
      }
    });

    const totalUsers = realUsers.length;
    
    // Count ballots with at least one pick from real users
    const activeBallots = ballotsQuery.data.ballots.filter((ballot: any) => 
      ballot.picks && 
      ballot.picks.length > 0 &&
      realUsers.some((user: any) => user.id === ballot.user_id)
    );
    
    const activePlayers = activeBallots.length;
    const completionRate = totalUsers > 0 ? Math.round((activePlayers / totalUsers) * 100) : 0;

    return {
      totalUsers,
      activePlayers,
      completionRate,
      error: null
    };
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return {
      totalUsers: 0,
      activePlayers: 0,
      completionRate: 0,
      error
    };
  }
}

export async function getNomineePercentages(categoryId: string, eventId: string, leagueId: string): Promise<{ percentages: Record<string, number>, totalUsers: number, error: any }> {
  try {
    console.log('🔍 Debug - Querying with params:', { categoryId, eventId, leagueId });
    
    // Get all ballots for this event (like the working query does)
    const ballotsQuery = await dbCore.queryOnce({
      ballots: {
        $: {
          where: { event_id: eventId },
        },
        picks: {
          $: {
            where: { category_id: categoryId }
          }
        }
      },
      users: {}
    });

    console.log('🔍 Debug - Raw ballots query result:', ballotsQuery);
    console.log('🔍 Debug - Total ballots found:', ballotsQuery.data.ballots?.length || 0);
    console.log('🔍 Debug - Total users found:', ballotsQuery.data.users?.length || 0);

    // Filter out test users (emails containing 'test' or 'demo', case-insensitive)
    const realUserBallots = ballotsQuery.data.ballots.filter((ballot: any) => {
      const user = ballotsQuery.data.users.find((u: any) => u.id === ballot.user_id);
      if (!user) return false;
      
      const email = (user as any).email || '';
      const username = (user as any).username || '';
      
      console.log('🔍 Debug - User:', { email, username, isTest: email.toLowerCase().includes('test') || username.toLowerCase().includes('test') });
      
      return !email.toLowerCase().includes('test') && 
             !email.toLowerCase().includes('demo') &&
             !username.toLowerCase().includes('test') && 
             !username.toLowerCase().includes('demo');
    });

    console.log('🔍 Debug - Real user ballots after filtering:', realUserBallots.length);

    // Count picks for each nominee
    const nomineeCounts: Record<string, number> = {}
    realUserBallots.forEach((ballot: any) => {
      if (ballot.picks && ballot.picks.length > 0) {
        ballot.picks.forEach((pick: any) => {
          const nomineeId = pick.nominee_id;
          nomineeCounts[nomineeId] = (nomineeCounts[nomineeId] || 0) + 1;
        });
      }
    });

    console.log('🔍 Debug - Nominee counts:', nomineeCounts);

    // Calculate percentages
    const totalUsers = realUserBallots.length;
    const percentages: Record<string, number> = {}
    
    if (totalUsers > 0) {
      Object.keys(nomineeCounts).forEach(nomineeId => {
        percentages[nomineeId] = Math.round((nomineeCounts[nomineeId] / totalUsers) * 100);
      });
    }

    console.log('🔍 Debug - Final result:', { percentages, totalUsers });

    return { percentages, totalUsers, error: null };
  } catch (error) {
    console.error('Error loading nominee percentages:', error);
    return { percentages: {}, totalUsers: 0, error };
  }
}

// --- Bulk save function - saves multiple picks at once
export async function getResults(eventId: string): Promise<{ results: any[], error: any }> {
  try {
    // Get all results and categories to filter by event
    const [resultsQuery, categoriesQuery] = await Promise.all([
      dbCore.queryOnce({
        results: {
          $: {}
        }
      }),
      dbCore.queryOnce({
        categories: {
          $: {
            where: { event_id: eventId }
          }
        }
      })
    ]);

    const allResults = resultsQuery.data.results || [];
    const eventCategories = categoriesQuery.data.categories || [];
    const eventCategoryIds = new Set(eventCategories.map((c: any) => c.id));
    
    // Filter results to only include categories from this event
    const eventResults = allResults.filter((result: any) => eventCategoryIds.has(result.category_id));

    return { results: eventResults, error: null };
  } catch (error) {
    return { results: [], error };
  }
}

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

// --- Scoring Calculation Functions --- //

export async function calculateScoresForEvent(eventId: string): Promise<{ success: boolean, error: any }> {
  try {
    console.log('[calculateScoresForEvent] Starting score calculation for event:', eventId);
    
    // Get all results and all categories
    const resultsQuery = await dbCore.queryOnce({
      results: {
        $: {}
      }
    });

    const categoriesQuery = await dbCore.queryOnce({
      categories: {
        $: {
          where: { event_id: eventId }
        }
      }
    });

    const allResults = resultsQuery.data.results || [];
    const eventCategories = categoriesQuery.data.categories || [];
    const eventCategoryIds = new Set(eventCategories.map((c: any) => c.id));
    
    // Filter results to only include categories from this event
    const eventResults = allResults.filter((r: any) => eventCategoryIds.has(r.category_id));
    
    console.log('[calculateScoresForEvent] Found results for event:', eventResults.length);

    // Process each result
    for (const result of eventResults as any[]) {
      await calculateScoresForCategory(eventId, result.category_id, result.winner_nominee_id);
    }

    console.log('[calculateScoresForEvent] Score calculation completed');
    return { success: true, error: null };
    
  } catch (error) {
    console.error('[calculateScoresForEvent] Error calculating scores:', error);
    return { success: false, error };
  }
}

// --- Automatic Score Trigger --- //

export async function addWinnerAndCalculateScores(
  categoryId: string, 
  winnerNomineeId: string
): Promise<{ success: boolean, error: any }> {
  try {
    console.log('[addWinnerAndCalculateScores] Adding winner and calculating scores');
    
    // Add the winner result
    const resultId = id();
    await dbCore.transact([
      dbCore.tx.results[resultId].create({
        category_id: categoryId,
        winner_nominee_id: winnerNomineeId,
        announced_at: Date.now()
      })
    ]);

    console.log('[addWinnerAndCalculateScores] Winner added, calculating scores...');
    
    // Get the event_id for this category
    const categoriesQuery = await dbCore.queryOnce({
      categories: {
        $: {
          where: { id: categoryId }
        }
      }
    });

    const category = (categoriesQuery.data.categories?.[0] as any);
    const eventId = category?.event_id;

    if (eventId) {
      // Calculate scores for this event
      await calculateScoresForEvent(eventId);
    }

    return { success: true, error: null };
    
  } catch (error) {
    console.error('[addWinnerAndCalculateScores] Error:', error);
    return { success: false, error };
  }
}

async function calculateScoresForCategory(eventId: string, categoryId: string, winnerNomineeId: string): Promise<void> {
  try {
    console.log('[calculateScoresForCategory] Processing category:', categoryId, 'winner:', winnerNomineeId);
    
    // Get all picks for this category
    const picksQuery = await dbCore.queryOnce({
      picks: {
        $: {
          where: {
            category_id: categoryId
          }
        }
      }
    });

    const picks = picksQuery.data.picks || [];
    console.log('[calculateScoresForCategory] Found picks:', picks.length);

    // Get category info for base points
    const categoriesQuery = await dbCore.queryOnce({
      categories: {
        $: {
          where: { id: categoryId }
        }
      }
    });

    const category = (categoriesQuery.data.categories?.[0] as any);
    const basePoints = category?.base_points || 50;

    // Get ballots for user/league info
    const ballotIds = [...new Set((picks as any[]).map((p: any) => p.ballot_id))];
    const ballotsQuery = await dbCore.queryOnce({
      ballots: {
        $: {
          where: {
            id: { in: ballotIds }
          }
        }
      }
    });

    const ballots = (ballotsQuery.data.ballots || []) as any[];
    const ballotMap = new Map(ballots.map((b: any) => [b.id, b]));

    // Group picks by user and league
    const userLeaguePicks = (picks as any[]).reduce((acc, pick) => {
      const ballot = ballotMap.get(pick.ballot_id);
      if (!ballot) return acc;
      
      const key = `${ballot.user_id}-${ballot.league_id}`;
      if (!acc[key]) {
        acc[key] = {
          userId: ballot.user_id,
          leagueId: ballot.league_id,
          correctPicks: 0,
          powerPicksHit: 0,
          totalPoints: 0
        };
      }

      const isCorrect = pick.nominee_id === winnerNomineeId;
      const isPowerPick = pick.is_power_pick;

      if (isCorrect) {
        acc[key].correctPicks++;
        acc[key].totalPoints += isPowerPick ? basePoints * 3 : basePoints; // Power picks are worth 3x
        if (isPowerPick) {
          acc[key].powerPicksHit++;
        }
      }

      return acc;
    }, {} as Record<string, any>);

    // Update scores for each user/league combination
    for (const [key, scoreData] of Object.entries(userLeaguePicks as any)) {
      const { userId, leagueId, correctPicks, powerPicksHit, totalPoints } = scoreData as any;

      // Check if score already exists
      const existingScoresQuery = await dbCore.queryOnce({
        scores: {
          $: {
            where: {
              user_id: userId,
              league_id: leagueId,
              event_id: eventId
            }
          }
        }
      });

      const existingScores = existingScoresQuery.data.scores || [];

      if (existingScores.length > 0) {
        // Update existing score
        await dbCore.transact([
          dbCore.tx.scores[existingScores[0].id].update({
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        ]);
        console.log('[calculateScoresForCategory] Updated score for user:', userId);
      } else {
        // Create new score
        const scoreId = id();
        await dbCore.transact([
          dbCore.tx.scores[scoreId].create({
            user_id: userId,
            league_id: leagueId,
            event_id: eventId,
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        ]);
        console.log('[calculateScoresForCategory] Created new score for user:', userId);
      }
    }
    
  } catch (error) {
    console.error('[calculateScoresForCategory] Error:', error);
    throw error;
  }
}

// --- Analytics Functions --- //

export async function getWinnersForEvent(eventId: string): Promise<{ winners: any[], error: any }> {
  try {
    const resultsQuery = await dbCore.queryOnce({
      results: {
        $: {}
      },
      categories: {
        $: {
          where: { event_id: eventId }
        }
      },
      nominees: {
        $: {}
      }
    });

    const allResults = resultsQuery.data.results || [];
    const eventCategories = resultsQuery.data.categories || [];
    const allNominees = resultsQuery.data.nominees || [];
    
    const eventCategoryIds = new Set(eventCategories.map((c: any) => c.id));
    
    // Filter results to only include categories from this event
    const eventResults = allResults.filter((r: any) => eventCategoryIds.has(r.category_id));
    
    // Enrich results with category and nominee names
    const winners = eventResults.map((result: any) => {
      const category = eventCategories.find((c: any) => c.id === result.category_id);
      const winnerNominee = allNominees.find((n: any) => n.id === result.winner_nominee_id);
      
      return {
        categoryId: result.category_id,
        categoryName: (category as any)?.name || 'Unknown Category',
        winnerNomineeId: result.winner_nominee_id,
        winnerNomineeName: (winnerNominee as any)?.name || 'Unknown Nominee',
        announcedAt: result.announced_at
      };
    });

    return { winners, error: null };
    
  } catch (error) {
    console.error('[getWinnersForEvent] Error:', error);
    return { winners: [], error };
  }
}

export async function signupForEventNotifications(userId: string, eventId: string): Promise<{ success: boolean, error: any }> {
  try {
    console.log('[signupForEventNotifications] Signing up user:', userId, 'for event:', eventId);
    
    // Check if user already signed up
    const existingSignupQuery = await dbCore.queryOnce({
      notification_signups: {
        $: {
          where: {
            user_id: userId,
            event_id: eventId
          }
        }
      }
    });
    
    const existingSignups = existingSignupQuery.data.notification_signups || [];
    
    if (existingSignups.length > 0) {
      console.log('[signupForEventNotifications] User already signed up');
      return { success: true, error: null };
    }
    
    // Create new notification signup
    const signupId = id();
    await dbCore.transact([
      dbCore.tx.notification_signups[signupId].create({
        user_id: userId,
        event_id: eventId,
        created_at: Date.now(),
        notified: false
      })
    ]);
    
    console.log('[signupForEventNotifications] Successfully signed up user');
    return { success: true, error: null };
    
  } catch (error) {
    console.error('[signupForEventNotifications] Error:', error);
    return { success: false, error };
  }
}

export async function getAnalyticsData(leagueId: string, eventId: string): Promise<{ analytics: any, error: any }> {
  try {
    console.log('[getAnalyticsData] Fetching data for league:', leagueId, 'event:', eventId);
    
    // For global analytics, always get all ballots for the event
    console.log('[getAnalyticsData] Getting all event ballots for global analytics...');
    const ballotsResult = await (dbCore.queryOnce as any)({
      ballots: {
        $: {
          where: { 
            event_id: eventId
          }
        },
        picks: {}
      }
    });
    
    let ballots = ballotsResult.data.ballots || [];
    console.log('[getAnalyticsData] Found all ballots for event:', ballots.length);
    
    // Get all data we need in parallel
    const [
      categoriesResult, 
      winnersResult,
      usersResult
    ] = await Promise.all([
      dbCore.queryOnce({
        categories: {
          $: {
            where: { event_id: eventId }
          },
          nominees: {}
        }
      }),
      getWinnersForEvent(eventId),
      dbCore.queryOnce({
        users: {
          $: {}
        }
      })
    ]);

    const categories = categoriesResult.data.categories || [];
    const winners = winnersResult.winners || [];
    const users = usersResult.data.users || [];

    console.log('[getAnalyticsData] Found categories:', categories.length);
    console.log('[getAnalyticsData] Found winners:', winners.length);
    console.log('[getAnalyticsData] Found users:', users.length);

    // Debug: Print some ballot info
    if (ballots.length > 0) {
      console.log('[getAnalyticsData] Sample ballot IDs:', ballots.slice(0, 3).map((b: any) => b.id));
      console.log('[getAnalyticsData] Sample ballot user IDs:', ballots.slice(0, 3).map((b: any) => b.user_id));
      console.log('[getAnalyticsData] Sample ballot pick counts:', ballots.slice(0, 3).map((b: any) => b.picks?.length || 0));
    }

    // Process analytics data
    const analytics = processAnalyticsData(ballots, categories, winners, users);
    
    return { analytics, error: null };
    
  } catch (error) {
    console.error('[getAnalyticsData] Error:', error);
    return { analytics: null, error };
  }
}

function processAnalyticsData(ballots: any[], categories: any[], winners: any[], users: any[]) {
  const nomineePopularity: Record<string, any> = {};
  const powerPickAnalysis: Record<string, any> = {};
  const categoryAnalytics: Record<string, any> = {};
  let totalPicks = 0;
  let totalCorrectPicks = 0;
  let totalPowerPicks = 0;
  let correctPowerPicks = 0;

  // Create lookup maps
  const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
  const nomineeMap = new Map();
  const winnerMap = new Map(winners.map((w: any) => [w.categoryId, w.winnerNomineeId]));
  const userMap = new Map(users.map((u: any) => [u.id, u]));

  categories.forEach((category: any) => {
    if (category.nominees) {
      category.nominees.forEach((nominee: any) => {
        nomineeMap.set(nominee.id, nominee);
      });
    }
  });

  // Process each ballot and pick
  ballots.forEach(ballot => {
    if (!ballot.picks) return;
    
    ballot.picks.forEach((pick: any) => {
      totalPicks++;
      const category = categoryMap.get(pick.category_id);
      const nominee = nomineeMap.get(pick.nominee_id);
      
      if (!category || !nominee) return;

      // Nominee popularity
      if (!nomineePopularity[pick.nominee_id]) {
        nomineePopularity[pick.nominee_id] = {
          name: nominee.name,
          count: 0,
          percentage: 0,
          powerPickCount: 0,
          correctPicks: 0,
          correctPowerPicks: 0, // Track correct power picks separately
          isWinner: false
        };
      }
      nomineePopularity[pick.nominee_id].count++;
      
      if (pick.is_power_pick) {
        totalPowerPicks++;
        nomineePopularity[pick.nominee_id].powerPickCount++;
        
        // Power pick analysis
        if (!powerPickAnalysis[pick.nominee_id]) {
          powerPickAnalysis[pick.nominee_id] = {
            nomineeName: nominee.name,
            count: 0,
            category: category.name,
            successRate: 0
          };
        }
        powerPickAnalysis[pick.nominee_id].count++;
      }

      // Check if pick was correct
      const winnerId = winnerMap.get(pick.category_id);
      const isCorrect = pick.nominee_id === winnerId;
      
      if (isCorrect) {
        totalCorrectPicks++;
        nomineePopularity[pick.nominee_id].correctPicks++;
        if (pick.is_power_pick) {
          correctPowerPicks++;
          nomineePopularity[pick.nominee_id].correctPowerPicks++; // Track correct power picks
        }
      }

      // Category analytics
      if (!categoryAnalytics[pick.category_id]) {
        categoryAnalytics[pick.category_id] = {
          categoryName: category.name,
          totalPicks: 0,
          uniqueNominees: new Set(),
          winnerNomineeId: winnerId,
          winnerNomineeName: nomineeMap.get(winnerId)?.name || 'Unknown',
          consensusCorrect: false
        };
      }
      categoryAnalytics[pick.category_id].totalPicks++;
      categoryAnalytics[pick.category_id].uniqueNominees.add(pick.nominee_id);
    });
  });

  // Calculate percentages and determine winners
  Object.keys(nomineePopularity).forEach(nomineeId => {
    const data = nomineePopularity[nomineeId];
    // Calculate percentage based on category total, not global total
    // We need to find which category this nominee belongs to
    const nomineeCategory = Array.from(categoryMap.values()).find((cat: any) => 
      cat.nominees?.some((nom: any) => nom.id === nomineeId)
    );
    
    if (nomineeCategory) {
      const categoryTotalPicks = categoryAnalytics[nomineeCategory.id]?.totalPicks || 1;
      data.percentage = (data.count / categoryTotalPicks) * 100;
    } else {
      data.percentage = 0; // Fallback if category not found
    }
    
    data.accuracy = data.count > 0 ? (data.correctPicks / data.count) * 100 : 0;
    
    // Check if this nominee was a winner
    const isWinner = Array.from(winnerMap.values()).includes(nomineeId);
    data.isWinner = isWinner;
  });

  // Calculate power pick success rates
  Object.keys(powerPickAnalysis).forEach(nomineeId => {
    const data = powerPickAnalysis[nomineeId];
    const nomineeData = nomineePopularity[nomineeId];
    // Success rate = (correct power picks) / (total power picks) * 100
    data.successRate = nomineeData && nomineeData.powerPickCount > 0 
      ? (nomineeData.correctPowerPicks / nomineeData.powerPickCount) * 100 
      : 0;
  });

  // Calculate category insights
  Object.keys(categoryAnalytics).forEach(categoryId => {
    const data = categoryAnalytics[categoryId];
    data.uniqueNominees = data.uniqueNominees.size;
    
    // Find most popular pick in this category
    let mostPopularPick = null;
    let highestCount = 0;
    
    Object.entries(nomineePopularity).forEach(([nomineeId, nomineeData]: [string, any]) => {
      // Check if this nominee belongs to this category
      const category = categoryMap.get(categoryId);
      if (category?.nominees?.some((n: any) => n.id === nomineeId)) {
        if (nomineeData.count > highestCount) {
          highestCount = nomineeData.count;
          mostPopularPick = nomineeData;
        }
      }
    });
    
    data.mostPopularPick = mostPopularPick;
    data.consensusCorrect = mostPopularPick?.isWinner || false;
    data.upset = mostPopularPick && !mostPopularPick.isWinner && mostPopularPick.percentage > 30;
  });

  // Generate insights
  const insights = generateInsights(
    nomineePopularity, 
    powerPickAnalysis, 
    categoryAnalytics, 
    {
      totalPicks,
      totalCorrectPicks,
      totalPowerPicks,
      correctPowerPicks,
      overallAccuracy: totalPicks > 0 ? (totalCorrectPicks / totalPicks) * 100 : 0,
      powerPickSuccessRate: totalPowerPicks > 0 ? (correctPowerPicks / totalPowerPicks) * 100 : 0
    },
    ballots.length
  );

  return {
    totalBallots: ballots.length,
    nomineePopularity,
    powerPickAnalysis,
    categoryAnalytics,
    overallStats: {
      totalPicks,
      totalCorrectPicks,
      totalPowerPicks,
      correctPowerPicks,
      overallAccuracy: totalPicks > 0 ? (totalCorrectPicks / totalPicks) * 100 : 0,
      powerPickSuccessRate: totalPowerPicks > 0 ? (correctPowerPicks / totalPowerPicks) * 100 : 0
    },
    insights
  };
}

function generateInsights(nomineePopularity: any, powerPickAnalysis: any, categoryAnalytics: any, stats: any, totalBallots: number) {
  const insights = [];

  // Most popular winner
  const popularWinners = Object.entries(nomineePopularity)
    .filter(([, data]: [string, any]) => data.isWinner)
    .sort(([, a], [, b]: [string, any]) => (b as any).count - (a as any).count);
  
  if (popularWinners.length > 0) {
    const [winnerId, winnerData] = popularWinners[0] as [string, any];
    insights.push({
      type: 'popular_winner',
      title: '🏆 Crowd Favorite Won',
      description: `${winnerData.name} was the most popular pick (${winnerData.count} picks, ${winnerData.percentage.toFixed(1)}%) and took home the award!`,
      impact: 'high'
    });
  }

  // Biggest upsets
  const upsets = Object.entries(categoryAnalytics)
    .filter(([, data]: [string, any]) => data.upset)
    .sort(([, a], [, b]: [string, any]) => (b as any).mostPopularPick.percentage - (a as any).mostPopularPick.percentage);
  
  if (upsets.length > 0) {
    const upset = upsets[0][1] as any;
    insights.push({
      type: 'upset',
      title: '😲 Biggest Upset',
      description: `${upset.mostPopularPick.name} had ${upset.mostPopularPick.percentage.toFixed(1)}% of picks but lost to ${upset.winnerNomineeName}`,
      impact: 'high'
    });
  }

  // Power pick effectiveness
  if (stats.powerPickSuccessRate > 60) {
    insights.push({
      type: 'power_pick_success',
      title: '⚡ Power Picks Paid Off',
      description: `Power picks had a ${stats.powerPickSuccessRate.toFixed(1)}% success rate - well above random chance!`,
      impact: 'medium'
    });
  } else if (stats.powerPickSuccessRate < 30) {
    insights.push({
      type: 'power_pick_fail',
      title: '⚡ Power Picks Missed',
      description: `Only ${stats.powerPickSuccessRate.toFixed(1)}% of power picks were correct - sometimes the underdog wins!`,
      impact: 'medium'
    });
  }

  // Consensus categories
  const consensusCategories = Object.entries(categoryAnalytics)
    .filter(([, data]: [string, any]) => data.consensusCorrect)
    .length;
  
  if (consensusCategories > 10) {
    insights.push({
      type: 'consensus',
      title: '🎯 Wisdom of the Crowd',
      description: `${consensusCategories} categories went to the most popular pick - the crowd knew best!`,
      impact: 'medium'
    });
  }

  // Participation insight
  if (totalBallots > 100) {
    insights.push({
      type: 'participation',
      title: '👥 Great Turnout',
      description: `${totalBallots} people made their picks - that's some serious award show dedication!`,
      impact: 'low'
    });
  }

  return insights;
}
