import puppeteer from 'puppeteer';
import { init } from '@instantdb/core';

// Instant DB configuration
const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';

// Initialize Instant DB Core Client
const dbCore = init({
  appId: APP_ID,
});

// Award show announcement dates for 2026
const AWARD_SHOWS_2026 = [
  {
    id: 'golden-globes-2026',
    name: 'Golden Globes',
    ceremonyDate: '2026-01-11',
    nomineesAnnounced: '2025-12-09',
    scrapingEnabled: true
  },
  {
    id: 'oscars-2026',
    name: 'The Oscars',
    ceremonyDate: '2026-03-02', 
    nomineesAnnounced: '2026-01-17',
    scrapingEnabled: true
  }
];

// Web scraping configurations
const SCRAPING_CONFIGS = {
  'golden-globes-2026': {
    winnersUrl: 'https://www.goldenglobes.com/winners',
    checkInterval: 15 * 60 * 1000, // 15 minutes
    selectors: {
      winnerCard: '.winner-card',
      categoryName: '.category-name',
      winnerName: '.winner-name',
      movieTitle: '.movie-title'
    }
  },
  'oscars-2026': {
    winnersUrl: 'https://www.oscars.org/ceremonies/2026/winners',
    checkInterval: 15 * 60 * 1000, // 15 minutes,
    selectors: {
      winnerCard: '.award-card',
      categoryName: '.award-category',
      winnerName: '.winner-name',
      movieTitle: '.film-title'
    }
  }
};

async function scrapeGoldenGlobesWinners() {
  console.log('🎬 Scraping Golden Globes winners...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto('https://www.goldenglobes.com/winners', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for winner content to load
    await page.waitForSelector('.winner-card, .winner-item, .award-winner', { timeout: 10000 });
    
    // Extract winners
    const winners = await page.evaluate(() => {
      const results = [];
      
      // Try multiple possible selectors
      const selectors = [
        '.winner-card',
        '.winner-item', 
        '.award-winner',
        '.category-winner'
      ];
      
      let winnerCards = [];
      for (const selector of selectors) {
        winnerCards = document.querySelectorAll(selector);
        if (winnerCards.length > 0) break;
      }
      
      winnerCards.forEach((card, index) => {
        try {
          // Try multiple selectors for category name
          const categorySelectors = [
            '.category-name',
            '.category',
            '.award-category',
            'h3',
            'h4'
          ];
          
          let categoryName = '';
          for (const selector of categorySelectors) {
            const element = card.querySelector(selector);
            if (element) {
              categoryName = element.textContent?.trim() || '';
              break;
            }
          }
          
          // Try multiple selectors for winner name
          const winnerSelectors = [
            '.winner-name',
            '.winner',
            '.recipient',
            '.awardee',
            'strong',
            'b'
          ];
          
          let winnerName = '';
          for (const selector of winnerSelectors) {
            const element = card.querySelector(selector);
            if (element) {
              winnerName = element.textContent?.trim() || '';
              break;
            }
          }
          
          // Try to get movie/film title
          const movieSelectors = [
            '.movie-title',
            '.film-title',
            '.title',
            '.work'
          ];
          
          let movieTitle = '';
          for (const selector of movieSelectors) {
            const element = card.querySelector(selector);
            if (element) {
              movieTitle = element.textContent?.trim() || '';
              break;
            }
          }
          
          if (categoryName && winnerName) {
            results.push({
              categoryName: categoryName,
              winnerName: winnerName,
              movieTitle: movieTitle,
              index: index
            });
          }
        } catch (error) {
          console.log(`Error extracting winner ${index}:`, error);
        }
      });
      
      return results;
    });
    
    console.log(`🏆 Found ${winners.length} winners from Golden Globes`);
    return winners;
    
  } catch (error) {
    console.error('❌ Error scraping Golden Globes:', error);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

async function scrapeWinnersInstantDB(eventId) {
  console.log(`🏆 Starting live winner scraping for ${eventId}...`);
  
  const config = SCRAPING_CONFIGS[eventId];
  if (!config) {
    console.error(`❌ No scraping config found for ${eventId}`);
    return;
  }

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
    
    for (const winner of winners) {
      await processWinner(winner, eventId);
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
      return;
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
      return;
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
      return;
    }

    // Insert the result
    await dbCore.transact([
      dbCore.tx.results.create({
        category_id: category.id,
        winner_nominee_id: nominee.id,
        announced_at: Date.now()
      })
    ]);

    console.log(`🏆 Winner recorded: ${winner.winnerName} for ${category.name}`);
    
    // Trigger score recalculation
    await recalculateScoresInstantDB(eventId, category.id, nominee.id);
    
    // Send notification
    await sendNotification(`🏆 ${winner.winnerName} wins ${category.name}!`);
    
  } catch (error) {
    console.error(`❌ Error processing winner ${winner.winnerName}:`, error);
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
        await dbCore.transact([
          dbCore.tx.scores[existingScores.scores[0].id].update({
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        ]);
      } else {
        // Create new score
        await dbCore.transact([
          dbCore.tx.scores.create({
            user_id: userId,
            league_id: leagueId,
            event_id: eventId,
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        ]);
      }
    }

    console.log(`✅ Scores recalculated for category ${categoryId}`);
    
  } catch (error) {
    console.error(`❌ Error recalculating scores:`, error);
  }
}

async function startLiveScrapingInstantDB(eventId, intervalMinutes = 15) {
  console.log(`🏆 Starting live scoring for ${eventId} (every ${intervalMinutes} minutes)`);
  
  const config = SCRAPING_CONFIGS[eventId];
  if (!config) {
    console.error(`❌ No config found for ${eventId}`);
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;
  let ceremonyActive = true;
  
  // Initial scrape
  await scrapeWinnersInstantDB(eventId);
  
  const scrapeInterval = setInterval(async () => {
    if (!ceremonyActive) return;
    
    console.log(`🔄 Checking for new winners...`);
    await scrapeWinnersInstantDB(eventId);
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

async function sendNotification(message) {
  console.log(`📢 ${message}`);
  
  // Send to Slack if webhook is configured
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  if (slackWebhook) {
    try {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: message,
          username: 'Reel Rivals Bot',
          icon_emoji: ':trophy:'
        })
      });
      console.log('✅ Slack notification sent');
    } catch (error) {
      console.error('❌ Error sending Slack notification:', error);
    }
  }

  // Send to Discord if webhook is configured  
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhook) {
    try {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: message,
          username: 'Reel Rivals Bot'
        })
      });
      console.log('✅ Discord notification sent');
    } catch (error) {
      console.error('❌ Error sending Discord notification:', error);
    }
  }

  // Send email notification (optional)
  if (process.env.EMAIL_RECIPIENTS) {
    try {
      // Add email service integration here (SendGrid, etc.)
      console.log('📧 Email notifications would be sent to:', process.env.EMAIL_RECIPIENTS);
    } catch (error) {
      console.error('❌ Error sending email notification:', error);
    }
  }
}

// CLI commands
const command = process.argv[2];

switch (command) {
  case 'live-scrape':
    const eventId = process.argv[3];
    if (eventId) {
      startLiveScrapingInstantDB(eventId);
    } else {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs live-scrape golden-globes-2026');
    }
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
