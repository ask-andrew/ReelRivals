import { createClient } from '@supabase/supabase-js'
import { supabase } from '../src/supabase'

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
    id: 'baftas-2026', 
    name: 'BAFTA Awards',
    ceremonyDate: '2026-02-22',
    nomineesAnnounced: '2026-01-15',
    scrapingEnabled: true
  },
  {
    id: 'sag-2026',
    name: 'SAG Awards', 
    ceremonyDate: '2026-02-22',
    nomineesAnnounced: '2026-01-08',
    scrapingEnabled: true
  },
  {
    id: 'oscars-2026',
    name: 'The Oscars',
    ceremonyDate: '2026-03-15', 
    nomineesAnnounced: '2026-01-17',
    scrapingEnabled: true
  }
]

// Webhook URLs for notifications (set in environment variables)
const WEBHOOK_URLS = {
  slack: process.env.SLACK_WEBHOOK_URL,
  discord: process.env.DISCORD_WEBHOOK_URL
}

// Award show specific scraping configurations
const SCRAPING_CONFIGS = {
  'golden-globes-2026': {
    nomineesUrl: 'https://www.goldenglobes.com/nominees',
    winnersUrl: 'https://www.goldenglobes.com/winners',
    selectors: {
      category: '.nominee-category',
      nominee: '.nominee-name',
      winner: '.winner-announcement'
    }
  },
  'oscars-2026': {
    nomineesUrl: 'https://www.oscars.org/ceremonies/2026',
    winnersUrl: 'https://www.oscars.org/ceremonies/2026/winners',
    selectors: {
      category: '.award-category',
      nominee: '.nominee-name', 
      winner: '.winner-name'
    }
  }
  // Add configs for other award shows
}

async function scrapeNominees(eventId) {
  console.log(`🎬 Starting nominee scraping for ${eventId}...`)
  
  const config = SCRAPING_CONFIGS[eventId]
  if (!config) {
    console.error(`❌ No scraping config found for ${eventId}`)
    return
  }

  try {
    // In a real implementation, you'd use a scraping library like Puppeteer or Cheerio
    // For now, we'll simulate the scraping with mock data
    const mockNominees = await getMockNominees(eventId)
    
    // Clear existing categories and nominees for this event
    await supabase
      .from('categories')
      .delete()
      .eq('event_id', eventId)

    // Insert new categories and nominees
    for (let i = 0; i < mockNominees.length; i++) {
      const category = mockNominees[i]
      
      // Insert category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert({
          event_id: eventId,
          name: category.name,
          display_order: i + 1,
          base_points: category.basePoints,
          emoji: category.emoji
        })
        .select()
        .single()

      if (categoryError) {
        console.error(`❌ Error inserting category ${category.name}:`, categoryError)
        continue
      }

      console.log(`✅ Inserted category: ${category.name}`)

      // Insert nominees
      for (let j = 0; j < category.nominees.length; j++) {
        const nominee = category.nominees[j]
        
        const { error: nomineeError } = await supabase
          .from('nominees')
          .insert({
            category_id: categoryData.id,
            name: nominee.name,
            tmdb_id: nominee.tmdbId,
            display_order: j + 1
          })

        if (nomineeError) {
          console.error(`❌ Error inserting nominee ${nominee.name}:`, nomineeError)
        } else {
          console.log(`  - Inserted nominee: ${nominee.name}`)
        }
      }
    }

    console.log(`✅ Successfully scraped and inserted nominees for ${eventId}`)
    
    // Send notification
    await sendNotification(`🎬 New nominees announced for ${AWARD_SHOWS_2026.find(s => s.id === eventId)?.name}!`)
    
  } catch (error) {
    console.error(`❌ Error scraping nominees for ${eventId}:`, error)
    await sendNotification(`❌ Failed to scrape nominees for ${eventId}`)
  }
}

async function scrapeWinners(eventId) {
  console.log(`🏆 Starting live winner scraping for ${eventId}...`)
  
  const config = SCRAPING_CONFIGS[eventId]
  if (!config) {
    console.error(`❌ No scraping config found for ${eventId}`)
    return
  }

  try {
    // In a real implementation, this would run continuously during the ceremony
    // For now, we'll simulate with mock winners
    const mockWinners = await getMockWinners(eventId)
    
    for (const winner of mockWinners) {
      // Find the category and nominee IDs
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('event_id', eventId)
        .eq('name', winner.categoryName)
        .single()

      const { data: nomineeData } = await supabase
        .from('nominees')
        .select('id')
        .eq('category_id', categoryData?.id)
        .eq('name', winner.winnerName)
        .single()

      if (categoryData && nomineeData) {
        // Insert the result
        const { error: resultError } = await supabase
          .from('results')
          .insert({
            category_id: categoryData.id,
            winner_nominee_id: nomineeData.id,
            announced_at: new Date().toISOString()
          })

        if (resultError) {
          console.error(`❌ Error inserting result for ${winner.categoryName}:`, resultError)
        } else {
          console.log(`🏆 Winner announced: ${winner.winnerName} for ${winner.categoryName}`)
          
          // Trigger score recalculation
          await recalculateScores(eventId, categoryData.id, nomineeData.id)
          
          // Send real-time notification
          await sendNotification(`🏆 ${winner.winnerName} wins ${winner.categoryName}!`)
        }
      }
    }

    console.log(`✅ Successfully scraped winners for ${eventId}`)
    
  } catch (error) {
    console.error(`❌ Error scraping winners for ${eventId}:`, error)
  }
}

async function recalculateScores(eventId, categoryId, winnerNomineeId) {
  try {
    // Get all picks for this category
    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select(`
        *,
        ballot:ballots(user_id, league_id),
        category:categories(base_points)
      `)
      .eq('category_id', categoryId)

    if (picksError) throw picksError

    // Group picks by user and league
    const userLeaguePicks = picks.reduce((acc, pick) => {
      const key = `${pick.ballot.user_id}-${pick.ballot.league_id}`
      if (!acc[key]) {
        acc[key] = {
          userId: pick.ballot.user_id,
          leagueId: pick.ballot.league_id,
          correctPicks: 0,
          powerPicksHit: 0,
          totalPoints: 0
        }
      }

      const isCorrect = pick.nominee_id === winnerNomineeId
      const isPowerPick = pick.is_power_pick
      const basePoints = pick.category?.base_points || 50

      if (isCorrect) {
        acc[key].correctPicks++
        acc[key].totalPoints += isPowerPick ? basePoints * 3 : basePoints
        if (isPowerPick) {
          acc[key].powerPicksHit++
        }
      }

      return acc
    }, {})

    // Update scores for each user/league combination
    for (const [key, scoreData] of Object.entries(userLeaguePicks)) {
      const { userId, leagueId, correctPicks, powerPicksHit, totalPoints } = scoreData

      // Upsert the score
      const { error: upsertError } = await supabase
        .from('scores')
        .upsert({
          user_id: userId,
          league_id: leagueId,
          event_id: eventId,
          total_points: totalPoints,
          correct_picks: correctPicks,
          power_picks_hit: powerPicksHit,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,league_id,event_id'
        })

      if (upsertError) {
        console.error(`❌ Error updating score for user ${userId}:`, upsertError)
      }
    }

    console.log(`✅ Scores recalculated for category ${categoryId}`)
    
  } catch (error) {
    console.error(`❌ Error recalculating scores:`, error)
  }
}

async function sendNotification(message) {
  // Send to Slack if webhook is configured
  if (WEBHOOK_URLS.slack) {
    try {
      await fetch(WEBHOOK_URLS.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      })
    } catch (error) {
      console.error('❌ Error sending Slack notification:', error)
    }
  }

  // Send to Discord if webhook is configured  
  if (WEBHOOK_URLS.discord) {
    try {
      await fetch(WEBHOOK_URLS.discord, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      })
    } catch (error) {
      console.error('❌ Error sending Discord notification:', error)
    }
  }
}

// Mock data functions (replace with real scraping)
async function getMockNominees(eventId) {
  // Return mock nominees based on event
  const mockData = {
    'golden-globes-2026': [
      {
        name: 'Best Motion Picture – Drama',
        basePoints: 50,
        emoji: '🏆',
        nominees: [
          { name: 'The Brutalist', tmdbId: 1022789 },
          { name: 'A Complete Unknown', tmdbId: 872585 },
          { name: 'Conclave', tmdbId: 956542 }
        ]
      }
    ]
  }
  
  return mockData[eventId] || []
}

async function getMockWinners(eventId) {
  // Return mock winners based on event
  const mockData = {
    'golden-globes-2026': [
      { categoryName: 'Best Motion Picture – Drama', winnerName: 'The Brutalist' }
    ]
  }
  
  return mockData[eventId] || []
}

// Schedule scraping based on announcement dates
function scheduleScraping() {
  console.log('📅 Setting up automated scraping schedule...')
  
  AWARD_SHOWS_2026.forEach(show => {
    if (show.scrapingEnabled) {
      // Schedule nominee scraping
      const nomineeDate = new Date(show.nomineesAnnounced)
      const nomineeDelay = nomineeDate.getTime() - Date.now()
      
      if (nomineeDelay > 0) {
        setTimeout(() => {
          scrapeNominees(show.id)
        }, nomineeDelay)
        
        console.log(`📅 Scheduled nominee scraping for ${show.name} on ${show.nomineesAnnounced}`)
      }
      
      // Schedule winner scraping (start 1 hour before ceremony)
      const ceremonyDate = new Date(show.ceremonyDate)
      const winnerDelay = ceremonyDate.getTime() - Date.now() - (60 * 60 * 1000)
      
      if (winnerDelay > 0) {
        setTimeout(() => {
          scrapeWinners(show.id)
        }, winnerDelay)
        
        console.log(`📅 Scheduled winner scraping for ${show.name} on ${show.ceremonyDate}`)
      }
    }
  })
}

// CLI commands
const command = process.argv[2]

switch (command) {
  case 'schedule':
    scheduleScraping()
    break
  case 'scrape-nominees':
    const eventId = process.argv[3]
    if (eventId) {
      scrapeNominees(eventId)
    } else {
      console.error('❌ Please provide an event ID: npm run scrape-nominees golden-globes-2026')
    }
    break
  case 'scrape-winners':
    const winnerEventId = process.argv[3]
    if (winnerEventId) {
      scrapeWinners(winnerEventId)
    } else {
      console.error('❌ Please provide an event ID: npm run scrape-winners golden-globes-2026')
    }
    break
  default:
    console.log(`
🎬 Reel Rivals Scraping Tool

Commands:
  npm run scrape schedule          - Schedule all automated scraping
  npm run scrape-nominees [event]  - Scrape nominees for specific event
  npm run scrape-winners [event]   - Scrape winners for specific event
  
Examples:
  npm run scrape-nominees golden-globes-2026
  npm run scrape-winners oscars-2026
    `)
}
