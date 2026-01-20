import { sendNotification, scrapeGoldenGlobesWinners } from './scraping-utils.mjs';
import puppeteer from 'puppeteer';
import { init } from '@instantdb/core';

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
    for (const winner of winners) {
      const transaction = await processWinner(winner, eventId);
      if (transaction) {
        transactions.push(transaction);
        // Also trigger score recalculation and notification for each winner individually for now
        // This part could be batched later if needed, but results insertion is the bottleneck for now
        // For the performance test, we're primarily concerned with the 'results' table
        await recalculateScoresInstantDB(eventId, transaction.data.category_id, transaction.data.winner_nominee_id);
        await sendNotification(`🏆 ${winner.winnerName} wins ${winner.categoryName}!`);
      }
    }

    if (transactions.length > 0) {
      await dbCore.transact(transactions);
      console.log(`🏆 Recorded ${transactions.length} new winners.`);
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
    const categories = await dbCore.query({
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
    const nominees = await dbCore.query({
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
    const existingResults = await dbCore.query({
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
    return dbCore.tx.results.create({
      category_id: category.id,
      winner_nominee_id: nominee.id,
      announced_at: Date.now()
    });
    
  } catch (error) {
    console.error(`❌ Error processing winner ${winner.winnerName}:`, error);
    return null; // Return null on error
  }
}

async function recalculateScoresInstantDB(eventId, categoryId, winnerNomineeId) {
  try {
    // Get all picks for this category
    const picksData = await dbCore.query({
      picks: {
        $: {
          where: {
            category_id: categoryId
          }
        },
        ballot: {
          user_id: true,
          league_id: true
        },
        category: {
          base_points: true
        }
      }
    });

    const picks = picksData.picks;

    // Group picks by user and league
    const userLeaguePicks = picks.reduce((acc, pick) => {
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

      const isCorrect = pick.nominee_id === winnerNomineeId;
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
    for (const [key, scoreData] of Object.entries(userLeaguePicks)) {
      const { userId, leagueId, correctPicks, powerPicksHit, totalPoints } = scoreData;

      // Check if score already exists
      const existingScores = await dbCore.query({
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

      if (existingScores.scores.length > 0) {
        // Update existing score
        scoreTransactions.push(
          dbCore.tx.scores[existingScores.scores[0].id].update({
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        );
      } else {
        // Create new score
        scoreTransactions.push(
          dbCore.tx.scores.create({
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

    if (scoreTransactions.length > 0) {
        await dbCore.transact(scoreTransactions);
        console.log(`✅ ${scoreTransactions.length} scores updated/created for category ${categoryId}`);
    } else {
        console.log(`ℹ️ No score changes needed for category ${categoryId}`);
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
