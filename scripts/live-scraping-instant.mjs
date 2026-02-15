import { sendNotification, scrapeGoldenGlobesWinners } from './scraping-utils.mjs';
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

async function scrapeWinnersInstantDB(eventId) {
  console.log(`🏆 Starting live winner scraping for ${eventId}...`);

  try {
    let winners;
    
    if (eventId === 'golden-globes-2026') {
      winners = await scrapeGoldenGlobesWinners();
    } else {
      // Fallback to mock data for other events
      winners = await getMockWinners(eventId);
    }
    
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
        await sendNotification(`🏆 ${winner.winnerName} wins ${winner.categoryName}!`);
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
    const category = categories.categories.find(cat => 
      cat.name.toLowerCase().includes(winner.categoryName.toLowerCase()) ||
      winner.categoryName.toLowerCase().includes(cat.name.toLowerCase())
    );

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
    const nominee = nominees.nominees.find(nom => 
      nom.name.toLowerCase().includes(winner.winnerName.toLowerCase()) ||
      winner.winnerName.toLowerCase().includes(nom.name.toLowerCase())
    );

    if (!nominee) {
      console.log(`⚠️ No matching nominee found for: ${winner.winnerName} in category: ${category.name}`);
      return null; // Return null if no nominee found
    }

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
      console.log(`⏭️ Winner already recorded for ${category.name}`);
      return null; // Return null if winner already recorded
    }

    // Return the create operation
    const resultId = id();
    return db.tx.results[resultId].create({
      category_id: category.id,
      winner_nominee_id: nominee.id,
      announced_at: Date.now()
    });
    
  } catch (error) {
    console.error(`❌ Error processing winner ${winner.winnerName}:`, error);
    return null; // Return null on error
  }
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

// Mock data (replace with real scraping)
async function getMockWinners(eventId) {
  const mockData = {
    'golden-globes-2026': [
      { categoryName: 'Best Motion Picture – Drama', winnerName: 'The Brutalist' }
    ]
  };
  
  return mockData[eventId] || [];
}

// CLI commands
const command = process.argv[2];

switch (command) {
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
  node live-scraping-instant.mjs live-scrape [event]  - Start live scoring for event
  
Examples:
  node live-scraping-instant.mjs live-scrape golden-globes-2026
    `);
}
