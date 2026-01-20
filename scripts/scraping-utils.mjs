import puppeteer from 'puppeteer';

async function sendNotification(message) {
  console.log(`📢 ${message}`);

  /*
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
  */

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

function extractWinnersFromPage(document) {
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
}

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
    
    try {
      await page.waitForSelector('.winner-card, .winner-item, .award-winner', { timeout: 10000 });
    } catch (e) {
      console.log('Could not find winner selectors, returning empty array.');
      return [];
    }
    
    // Extract winners
    const winners = await page.evaluate(extractWinnersFromPage);
    
    console.log(`🏆 Found ${winners.length} winners from Golden Globes`);
    return winners;
    
  } catch (error) {
    console.error('❌ Error scraping Golden Globes:', error);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

export { sendNotification, scrapeGoldenGlobesWinners, extractWinnersFromPage };
