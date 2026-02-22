import { sendNotification, scrapeEventWinners } from './scraping-utils.mjs';
import { init, id } from '@instantdb/admin';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname });

const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set VITE_INSTANT_SECRET or INSTANT_APP_ADMIN_TOKEN.');
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

function normalizeForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function scrapeWinnersInstantDB(eventId) {
  console.log(`🏆 Starting live winner scraping for ${eventId}...`);

  try {
    const winners = await scrapeEventWinners(eventId);

    if (winners.length === 0) {
      console.log('ℹ️ No new winners found');
      return;
    }

    const transactions = [];
    const newWinners = [];
    for (const winner of winners) {
      const transaction = await processWinner(winner, eventId);
      if (transaction) {
        transactions.push(transaction);
        newWinners.push(winner);
      }
    }

    if (transactions.length > 0) {
      await db.transact(transactions);
      console.log(`🏆 Recorded ${transactions.length} new winners.`);
      await recalculateScoresInstantDB(eventId);
      for (const winner of newWinners) {
        const pendingText = winner.isProvisional ? ' (pending verification)' : '';
        await sendNotification(`🏆 ${winner.winnerName} wins ${winner.categoryName}${pendingText}`);
      }
    } else {
      console.log('ℹ️ No new winners found after processing.');
    }

  } catch (error) {
    console.error(`❌ Error scraping winners for ${eventId}:`, error);
  }
}

async function processWinner(winner, eventId) {
  try {
    // Find the category in Instant DB
    const categories = await db.query({
      categories: {
        $: {
          where: {
            event_id: eventId
          }
        }
      }
    });

    // Find matching category (fuzzy match)
    const normalizedWinnerCategory = normalizeForMatch(winner.categoryName);
    const category = categories.categories.find((cat) => {
      const normalizedCategory = normalizeForMatch(cat.name);
      return (
        normalizedCategory.includes(normalizedWinnerCategory) ||
        normalizedWinnerCategory.includes(normalizedCategory)
      );
    });

    if (!category) {
      console.log(`⚠️ No matching category found for: ${winner.categoryName}`);
      return null; // Return null if no category found
    }

    // Find the nominee
    const nominees = await db.query({
      nominees: {
        $: {
          where: {
            category_id: category.id
          }
        }
      }
    });

    // Find matching nominee (fuzzy match)
    const normalizedWinnerName = normalizeForMatch(winner.winnerName);
    const nominee = nominees.nominees.find((nom) => {
      const normalizedNominee = normalizeForMatch(nom.name);
      return (
        normalizedNominee.includes(normalizedWinnerName) ||
        normalizedWinnerName.includes(normalizedNominee)
      );
    });

    if (!nominee) {
      console.log(`⚠️ No matching nominee found for: ${winner.winnerName} in category: ${category.name}`);
      return null; // Return null if no nominee found
    }

    const isProvisional = winner.sourceTrust !== 'official';
    winner.isProvisional = isProvisional;

    // Check if result already exists
    const existingResults = await db.query({
      results: {
        $: {
          where: {
            category_id: category.id
          }
        }
      }
    });

    if (existingResults.results.length > 0) {
      const existing = existingResults.results[0];
      const sameWinner = existing.winner_nominee_id === nominee.id;
      const existingIsProvisional = !!existing.is_provisional;

      // Existing winner is already finalized; do not override.
      if (!existingIsProvisional && sameWinner) {
        console.log(`⏭️ Winner already finalized for ${category.name}`);
        return null;
      }

      // Upgrade existing provisional winner to finalized if authoritative source matches.
      if (sameWinner && existingIsProvisional && !isProvisional) {
        console.log(`✅ Finalizing previously provisional winner for ${category.name}`);
        return db.tx.results[existing.id].update({
          is_provisional: false,
          finalized_at: Date.now(),
          verified_source_name: winner.sourceName || null,
          verified_source_url: winner.sourceUrl || null
        });
      }

      // Keep current provisional winner if we only have another non-authoritative signal.
      if (!sameWinner && existingIsProvisional && isProvisional) {
        console.log(`⚠️ Conflicting provisional winner for ${category.name}; keeping existing pending result`);
        return null;
      }

      // Authoritative source contradicts provisional winner: replace and finalize.
      if (!sameWinner && existingIsProvisional && !isProvisional) {
        console.log(`🔄 Replacing provisional winner with verified winner for ${category.name}`);
        return db.tx.results[existing.id].update({
          winner_nominee_id: nominee.id,
          announced_at: Date.now(),
          is_provisional: false,
          finalized_at: Date.now(),
          verified_source_name: winner.sourceName || null,
          verified_source_url: winner.sourceUrl || null
        });
      }

      console.log(`⏭️ Winner already recorded for ${category.name}`);
      return null;
    }

    // Return the create operation
    const resultId = id();
    return db.tx.results[resultId].create({
      category_id: category.id,
      winner_nominee_id: nominee.id,
      announced_at: Date.now(),
      is_provisional: isProvisional,
      finalized_at: isProvisional ? null : Date.now(),
      source_name: winner.sourceName || null,
      source_url: winner.sourceUrl || null,
      verified_source_name: isProvisional ? null : (winner.sourceName || null),
      verified_source_url: isProvisional ? null : (winner.sourceUrl || null)
    });
    
  } catch (error) {
    console.error(`❌ Error processing winner ${winner.winnerName}:`, error);
    return null; // Return null on error
  }
}

async function getProvisionalStatus(eventId) {
  const categoriesQuery = await db.query({
    categories: { $: { where: { event_id: eventId } } }
  });
  const categories = categoriesQuery.categories || [];
  const categoryIds = categories.map((c) => c.id);
  if (categoryIds.length === 0) {
    return { total: 0, provisional: 0, finalized: 0 };
  }

  const resultsQuery = await db.query({
    results: { $: { where: { category_id: { in: categoryIds } } } }
  });
  const results = resultsQuery.results || [];
  const provisional = results.filter((r) => !!r.is_provisional).length;
  const finalized = results.length - provisional;
  return { total: results.length, provisional, finalized };
}

async function finalizeEventResults(eventId) {
  console.log(`🔒 Finalizing provisional results for ${eventId}...`);
  const categoriesQuery = await db.query({
    categories: { $: { where: { event_id: eventId } } }
  });
  const categories = categoriesQuery.categories || [];
  const categoryIds = categories.map((c) => c.id);
  if (categoryIds.length === 0) {
    console.log(`ℹ️ No categories found for ${eventId}`);
    return;
  }

  const resultsQuery = await db.query({
    results: { $: { where: { category_id: { in: categoryIds } } } }
  });
  const results = resultsQuery.results || [];
  const provisionalResults = results.filter((r) => !!r.is_provisional);

  if (provisionalResults.length === 0) {
    console.log('ℹ️ No provisional results to finalize');
    await recalculateScoresInstantDB(eventId);
    return;
  }

  const now = Date.now();
  const txs = provisionalResults.map((result) =>
    db.tx.results[result.id].update({
      is_provisional: false,
      finalized_at: now,
      verification_note: 'Finalized via finalize-event command'
    })
  );
  await db.transact(txs);
  console.log(`✅ Finalized ${provisionalResults.length} results`);
  await recalculateScoresInstantDB(eventId);
}

async function recalculateScoresInstantDB(eventId) {
  try {
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: eventId } }
      }
    });

    const categories = categoriesQuery.categories || [];
    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length === 0) {
      console.log(`ℹ️ No categories found for event ${eventId}`);
      return;
    }

    const [resultsData, picksData, scoresData] = await Promise.all([
      db.query({
        results: {
          $: { where: { category_id: { in: categoryIds } } }
        }
      }),
      db.query({
        picks: {
          $: { where: { category_id: { in: categoryIds } } },
          ballot: { user_id: true, league_id: true },
          category: { base_points: true }
        }
      }),
      db.query({
        scores: {
          $: { where: { event_id: eventId } }
        }
      })
    ]);

    const results = resultsData.results || [];
    const picks = picksData.picks || [];
    const existingScores = scoresData.scores || [];

    const winnerByCategory = new Map(
      results.map((r) => [r.category_id, r.winner_nominee_id])
    );

    const userLeaguePicks = picks.reduce((acc, pick) => {
      const winnerId = winnerByCategory.get(pick.category_id);
      if (!winnerId) return acc;

      const key = `${pick.ballot.user_id}-${pick.ballot.league_id}`;
      if (!acc[key]) {
        acc[key] = {
          userId: pick.ballot.user_id,
          leagueId: pick.ballot.league_id,
          correctPicks: 0,
          powerPicksHit: 0,
          totalPoints: 0
        };
      }

      const isCorrect = pick.nominee_id === winnerId;
      const isPowerPick = pick.is_power_pick;
      const basePoints = pick.category?.base_points || 50;

      if (isCorrect) {
        acc[key].correctPicks++;
        acc[key].totalPoints += isPowerPick ? basePoints * 3 : basePoints;
        if (isPowerPick) {
          acc[key].powerPicksHit++;
        }
      }

      return acc;
    }, {});

    const scoreTransactions = [];

    // Update scores for each user/league combination
    const seenKeys = new Set(Object.keys(userLeaguePicks));

    for (const [key, scoreData] of Object.entries(userLeaguePicks)) {
      const { userId, leagueId, correctPicks, powerPicksHit, totalPoints } = scoreData;

      // Check if score already exists
      const existingScore = existingScores.find(
        (s) => s.user_id === userId && s.league_id === leagueId
      );

      if (existingScore) {
        // Update existing score
        scoreTransactions.push(
          db.tx.scores[existingScore.id].update({
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        );
      } else {
        // Create new score
        const scoreId = id();
        scoreTransactions.push(
          db.tx.scores[scoreId].create({
            user_id: userId,
            league_id: leagueId,
            event_id: eventId,
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        );
      }
    }

    for (const existing of existingScores) {
      const key = `${existing.user_id}-${existing.league_id}`;
      if (!seenKeys.has(key)) {
        scoreTransactions.push(
          db.tx.scores[existing.id].update({
            total_points: 0,
            correct_picks: 0,
            power_picks_hit: 0,
            updated_at: Date.now()
          })
        );
      }
    }

    if (scoreTransactions.length > 0) {
        await db.transact(scoreTransactions);
        console.log(`✅ ${scoreTransactions.length} scores updated/created for event ${eventId}`);
    } else {
        console.log(`ℹ️ No score changes needed for event ${eventId}`);
    }
    
  } catch (error) {
    console.error(`❌ Error recalculating scores:`, error);
  }
}

async function startLiveScrapingInstantDB(eventId, intervalMinutes = 15) {
  console.log(`🏆 Starting live scoring for ${eventId} (every ${intervalMinutes} minutes)`);

  const intervalMs = intervalMinutes * 60 * 1000;
  let ceremonyActive = true;
  
  // Initial scrape
  await scrapeWinnersInstantDB(eventId);
  
  const scrapeInterval = setInterval(async () => {
    if (!ceremonyActive) return;
    
    try {
      console.log(`🔄 Checking for new winners...`);
      await scrapeWinnersInstantDB(eventId);
    } catch (error) {
      console.error(`❌ Error during scheduled scrape for ${eventId}:`, error);
    }
  }, intervalMs);
  
  // Stop after ceremony (e.g., 4 hours)
  setTimeout(() => {
    ceremonyActive = false;
    clearInterval(scrapeInterval);
    console.log(`✅ Live scoring ended for ${eventId}`);
  }, 4 * 60 * 60 * 1000);
}

// CLI commands
const command = process.argv[2];

switch (command) {
  case 'finalize-event':
    const finalizeEventId = process.argv[3];
    if (!finalizeEventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs finalize-event baftas-2026');
      process.exit(1);
    }
    await finalizeEventResults(finalizeEventId);
    process.exit(0);
    break;
  case 'provisional-status':
    const statusEventId = process.argv[3];
    if (!statusEventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs provisional-status baftas-2026');
      process.exit(1);
    }
    const status = await getProvisionalStatus(statusEventId);
    console.log(`📊 ${statusEventId} -> total: ${status.total}, provisional: ${status.provisional}, finalized: ${status.finalized}`);
    process.exit(0);
    break;
  case 'scrape-once':
    const singleEventId = process.argv[3];
    if (!singleEventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs scrape-once baftas-2026');
      process.exit(1);
    }
    await scrapeWinnersInstantDB(singleEventId);
    process.exit(0);
    break;
  case 'live-scrape':
    const eventId = process.argv[3];
    if (!eventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs live-scrape golden-globes-2026');
      console.error('');
      console.error('Available events:');
      console.error('- golden-globes-2026');
      console.error('- oscars-2026');
      console.error('- baftas-2026');
      process.exit(1);
    }
    startLiveScrapingInstantDB(eventId);
    break;
  default:
    console.log(`
🏆 Instant DB Live Scoring Tool

Commands:
  node live-scraping-instant.mjs provisional-status [event] - Show pending/finalized winner counts
  node live-scraping-instant.mjs finalize-event [event]     - Finalize provisional winners and recalculate scores
  node live-scraping-instant.mjs scrape-once [event] - Run a single winner scrape pass
  node live-scraping-instant.mjs live-scrape [event]  - Start live scoring for event
  
Examples:
  node live-scraping-instant.mjs provisional-status baftas-2026
  node live-scraping-instant.mjs finalize-event baftas-2026
  node live-scraping-instant.mjs scrape-once baftas-2026
  node live-scraping-instant.mjs live-scrape golden-globes-2026
    `);
}
