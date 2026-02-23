import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateSourceConfig } from '../src/utils/source-config-validator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOURCE_CONFIG_DIR = path.join(__dirname, 'source-configs');

const FALLBACK_EVENT_SOURCES = {
  'golden-globes-2026': [
    {
      id: 'globes-official',
      name: 'Golden Globes Official',
      url: 'https://www.goldenglobes.com/winners',
      trust: 'official',
      type: 'selectors',
      selectors: {
        winnerCard: '.winner-card, .winner-item, .award-winner, .category-winner',
        categoryName: '.category-name, .category, .award-category, h3, h4',
        winnerName: '.winner-name, .winner, .recipient, .awardee, strong, b',
        movieTitle: '.movie-title, .film-title, .title, .work',
        personName: '.person-name, .recipient, .winner-name'
      }
    }
  ],
  'baftas-2026': [
    {
      id: 'wikipedia-bafta-2026',
      name: 'Wikipedia BAFTA 2026',
      url: 'https://en.wikipedia.org/wiki/79th_British_Academy_Film_Awards',
      trust: 'secondary',
      type: 'wikipedia-table',
      searchQuery: '79th British Academy Film Awards'
    },
    {
      id: 'bafta-official',
      name: 'BAFTA Official Winners',
      url: 'https://www.bafta.org/film/awards/winners',
      trust: 'official',
      type: 'selectors',
      selectors: {
        winnerCard: '.view-content .views-row, .results li, article, .award',
        categoryName: '.category, .views-field-title, h2, h3, h4',
        winnerName: '.winner, .field--name-title, strong, b',
        movieTitle: 'em, i'
      }
    }
  ],
  'sag-2026': [
    {
      id: 'wikipedia-sag-2026',
      name: 'Wikipedia SAG 2026',
      url: 'https://en.wikipedia.org/wiki/32nd_Screen_Actors_Guild_Awards',
      trust: 'secondary',
      type: 'wikipedia-table',
      searchQuery: '32nd Screen Actors Guild Awards'
    }
  ],
  'oscars-2026': [
    {
      id: 'wikipedia-oscars-2026',
      name: 'Wikipedia Oscars 2026',
      url: 'https://en.wikipedia.org/wiki/98th_Academy_Awards',
      trust: 'secondary',
      type: 'wikipedia-table',
      searchQuery: '98th Academy Awards'
    },
    {
      id: 'oscars-official',
      name: 'Oscars Official Winners',
      url: 'https://www.oscars.org/oscars/ceremonies/2026',
      trust: 'official',
      type: 'selectors',
      selectors: {
        winnerCard: '.view-content .views-row, .award, article, .field-item',
        categoryName: '.category, h2, h3, h4',
        winnerName: '.winner, strong, b, .field--name-title',
        movieTitle: 'em, i'
      }
    }
  ]
};

async function loadEventSources(eventId) {
  const filePath = path.join(SOURCE_CONFIG_DIR, `${eventId}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected array in ${filePath}`);
    }
    const enabled = parsed.filter((source) => source.enabled !== false);
    for (const source of enabled) {
      validateSourceConfig(source);
    }
    return enabled;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`⚠️ Failed to load ${filePath}: ${error.message}. Falling back to built-in source config.`);
    }
    return (FALLBACK_EVENT_SOURCES[eventId] || []).map((source) => ({
      ...source,
      reliabilityScore: source.reliabilityScore ?? 80,
      updateFrequency: source.updateFrequency ?? 30000,
      enabled: source.enabled ?? true,
      eventId: source.eventId ?? eventId
    }));
  }
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  return response.text();
}

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

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

function dedupeWinners(winners) {
  const seen = new Set();
  const deduped = [];
  const junkValues = new Set(['share', 'menu', 'read more', 'more', 'video']);

  for (const winner of winners) {
    const normalizedCategory = normalizeText(winner.categoryName);
    const normalizedName = normalizeText(winner.winnerName);
    const category = normalizedCategory.toLowerCase();
    const name = normalizedName.toLowerCase();
    if (!category || !name) continue;
    if (category.length < 4 || name.length < 2) continue;
    if (junkValues.has(category) || junkValues.has(name)) continue;
    if (/^[^a-z0-9]+$/.test(category) || /^[^a-z0-9]+$/.test(name)) continue;

    const key = `${category}::${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({
      categoryName: normalizedCategory,
      winnerName: normalizedName,
      movieTitle: normalizeText(winner.movieTitle) || undefined,
      personName: normalizeText(winner.personName) || undefined,
      sourceUrl: winner.sourceUrl
    });
  }

  return deduped;
}

async function scrapeWithSelectors(source) {
  try {
    const html = await fetchHtml(source.url);
    const $ = cheerio.load(html);

    const pickFirstText = ($root, selectorList) => {
      const selectorsArray = Array.isArray(selectorList)
        ? selectorList
        : String(selectorList || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
      for (const selector of selectorsArray) {
        const value = $root.find(selector).first().text().trim();
        if (value) return value;
      }
      return '';
    };

    const winners = [];
    $(source.selectors.winnerCard || '').each((_, el) => {
      const $card = $(el);
      const categoryName = pickFirstText($card, source.selectors.categoryName);
      const winnerName = pickFirstText($card, source.selectors.winnerName);
      const movieTitle = pickFirstText($card, source.selectors.movieTitle);
      const personName = pickFirstText($card, source.selectors.personName);

      if (categoryName && winnerName) {
        winners.push({
          categoryName,
          winnerName,
          movieTitle: movieTitle || undefined,
          personName: personName || undefined,
          sourceUrl: source.url
        });
      }
    });

    return dedupeWinners(winners);
  } catch (error) {
    console.error(`❌ Error scraping selector source ${source.name}:`, error.message);
    return [];
  }
}

async function scrapeWikipediaTable(source) {
  const parseWikipediaWinners = (html, url) => {
    const $ = cheerio.load(html);
    const winners = [];

    // Primary parser for paired-category award tables where each TD contains one category block.
    $('table.wikitable tr').each((_, row) => {
      const $cells = $(row).find('td');
      if ($cells.length === 0) return;

      $cells.each((__, cell) => {
        const $cell = $(cell);
        const categoryName = $cell
          .find('div b, .navbox-title b, b')
          .first()
          .text()
          .replace(/\[[^\]]+\]/g, '')
          .trim();
        if (!categoryName || categoryName.length < 4) {
          return;
        }

        const $winnerBold = $cell.find('ul > li b').first();
        if ($winnerBold.length === 0) return;

        const winnerName = $winnerBold
          .find('a')
          .first()
          .text()
          .replace(/\[[^\]]+\]/g, '')
          .trim()
          || $winnerBold
            .text()
            .replace(/\[[^\]]+\]/g, '')
            .split('–')[0]
            .trim();

        if (!winnerName) return;

        const movieTitle = $winnerBold
          .find('i a, i, em a, em')
          .first()
          .text()
          .replace(/\[[^\]]+\]/g, '')
          .trim();

        winners.push({
          categoryName,
          winnerName,
          movieTitle: movieTitle || undefined,
          sourceUrl: url
        });
      });
    });

    if (winners.length > 0) {
      return winners;
    }

    // Fallback parser for simpler table layouts.
    $('table.wikitable tr').each((_, row) => {
      const $cells = $(row).find('td');
      const hasHeaderCategory = $(row).find('th').length > 0;
      // Skip paired two-column award rows in fallback mode to avoid false positives.
      if (!hasHeaderCategory && $cells.length > 1) return;
      const categoryNameRaw = hasHeaderCategory
        ? $(row).find('th').first().text()
        : $cells.first().text();
      const categoryName = categoryNameRaw.replace(/\[[^\]]+\]/g, '').trim();
      const $resultCell = hasHeaderCategory ? $cells.first() : $cells.eq(1);
      if (!categoryName || $resultCell.length === 0) return;

      const winnerName = $resultCell
        .find('b a, b, strong a, strong')
        .first()
        .text()
        .replace(/\[[^\]]+\]/g, '')
        .trim();

      // Fallback: some tables use list items without bold for the winner.
      const fallbackWinnerName = $resultCell
        .find('li a, li')
        .first()
        .text()
        .replace(/\[[^\]]+\]/g, '')
        .trim();
      const resolvedWinnerName = winnerName || fallbackWinnerName;
      if (!resolvedWinnerName) return;

      const movieTitle = $resultCell
        .find('i a, i, em a, em')
        .first()
        .text()
        .replace(/\[[^\]]+\]/g, '')
        .trim();

      winners.push({
        categoryName,
        winnerName: resolvedWinnerName,
        movieTitle: movieTitle || undefined,
        sourceUrl: url
      });
    });

    return winners;
  };

  const resolveWikipediaUrl = async (searchQuery, expectedTitleIncludes) => {
    if (!searchQuery) return null;
    const queryUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&srlimit=1`;
    try {
      const response = await fetch(queryUrl, {
        headers: { 'User-Agent': 'ReelRivals/1.0 (live scoring)' }
      });
      if (!response.ok) return null;
      const payload = await response.json();
      const title = payload?.query?.search?.[0]?.title;
      if (!title) return null;
      if (expectedTitleIncludes && !title.toLowerCase().includes(String(expectedTitleIncludes).toLowerCase())) {
        console.warn(`⚠️ Wikipedia search returned unexpected page title "${title}" (expected to include "${expectedTitleIncludes}")`);
        return null;
      }
      return `https://en.wikipedia.org/wiki/${title.replace(/\s+/g, '_')}`;
    } catch {
      return null;
    }
  };

  try {
    const primaryHtml = await fetchHtml(source.url);
    let winners = parseWikipediaWinners(primaryHtml, source.url);
    if (winners.length > 0) {
      return dedupeWinners(winners);
    }

    const resolvedUrl = await resolveWikipediaUrl(source.searchQuery, source.expectedTitleIncludes);
    if (resolvedUrl && resolvedUrl !== source.url) {
      console.log(`🔁 Wikipedia fallback URL: ${resolvedUrl}`);
      const fallbackHtml = await fetchHtml(resolvedUrl);
      winners = parseWikipediaWinners(fallbackHtml, resolvedUrl);
      return dedupeWinners(winners);
    }

    return [];
  } catch (error) {
    console.error(`❌ Error scraping Wikipedia source ${source.name}:`, error.message);
    const resolvedUrl = await resolveWikipediaUrl(source.searchQuery, source.expectedTitleIncludes);
    if (resolvedUrl && resolvedUrl !== source.url) {
      try {
        console.log(`🔁 Wikipedia recovery URL: ${resolvedUrl}`);
        const fallbackHtml = await fetchHtml(resolvedUrl);
        const winners = parseWikipediaWinners(fallbackHtml, resolvedUrl);
        return dedupeWinners(winners);
      } catch (fallbackError) {
        console.error(`❌ Wikipedia recovery failed for ${source.name}:`, fallbackError.message);
      }
    }
    return [];
  }
}

async function scrapeSource(source) {
  if (source.type === 'wikipedia-table') {
    return scrapeWikipediaTable(source);
  }
  return scrapeWithSelectors(source);
}

async function scrapeEventWinners(eventId) {
  const sources = await loadEventSources(eventId);
  if (sources.length === 0) {
    console.warn(`⚠️ No sources configured for ${eventId}`);
    return [];
  }

  for (const source of sources) {
    console.log(`🔎 Scraping ${source.name}...`);
    const winners = await scrapeSource(source);
    if (winners.length > 0) {
      const enriched = winners.map((winner) => ({
        ...winner,
        sourceId: source.id,
        sourceName: source.name,
        sourceUrl: winner.sourceUrl || source.url,
        sourceTrust: source.trust || 'secondary'
      }));
      console.log(`✅ Found ${enriched.length} winners from ${source.name}`);
      return enriched;
    }
    console.log(`ℹ️ No winners from ${source.name}, trying next source...`);
  }

  return [];
}

async function scrapeEventWinnersDetailed(eventId) {
  const sources = await loadEventSources(eventId);
  if (sources.length === 0) {
    return { eventId, observations: [], bySource: [] };
  }

  const bySource = [];
  const observations = [];

  for (const source of sources) {
    console.log(`🔎 Scraping ${source.name}...`);
    const winners = await scrapeSource(source);
    const enriched = winners.map((winner) => ({
      ...winner,
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: winner.sourceUrl || source.url,
      sourceTrust: source.trust || 'secondary'
    }));
    bySource.push({
      sourceId: source.id,
      sourceName: source.name,
      sourceTrust: source.trust || 'secondary',
      winnerCount: enriched.length
    });
    observations.push(...enriched);
    if (enriched.length > 0) {
      console.log(`✅ Found ${enriched.length} winners from ${source.name}`);
    } else {
      console.log(`ℹ️ No winners from ${source.name}`);
    }
  }

  return { eventId, observations, bySource };
}

async function scrapeGoldenGlobesWinners() {
  console.log('🎬 Scraping Golden Globes winners...');
  return scrapeEventWinners('golden-globes-2026');
}

export {
  sendNotification,
  scrapeGoldenGlobesWinners,
  extractWinnersFromPage,
  scrapeEventWinners,
  scrapeEventWinnersDetailed
};
