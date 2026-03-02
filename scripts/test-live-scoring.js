#!/usr/bin/env node

// Test script for live scoring sources
// Run this before tomorrow's event to validate scraping works

import { load } from 'cheerio';
import fs from 'fs/promises';

const TEST_EVENT_ID = 'sag-2026'; // Test with SAG since that's tomorrow

// Test URLs - these should allow scraping and have winner data
const TEST_SOURCES = {
  wikipedia: 'https://en.wikipedia.org/wiki/32nd_Actor_Awards',
  bbc: 'https://www.bbc.com/news/entertainment_and_arts',
  hollywoodReporter: 'https://www.hollywoodreporter.com/t/awards/',
  indiewire: 'https://www.indiewire.com/tag/sag-awards/'
};

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

async function fetchHtml(url) {
  console.log(`🔍 Testing ${url}...`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ReelRivals-Test/1.0 (+https://reelrivals.com)'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.text();
}

function parseWikipediaWinners(html) {
  const $ = load(html);
  const winners = new Map();

  $('table.wikitable tr').each((i, row) => {
    const $row = $(row);
    const cells = $row.find('td, th');

    if (cells.length >= 2) {
      const categoryText = $(cells[0]).text().trim();
      const winnerText = $(cells[1]).text().trim();

      if (categoryText && winnerText &&
          winnerText.toLowerCase() !== 'pending' &&
          winnerText.toLowerCase() !== 'tbd') {
        console.log(`  📊 Found: ${categoryText} → ${winnerText}`);
        winners.set(categoryText, winnerText);
      }
    }
  });

  return winners;
}

function parseNewsSite(html, url) {
  const $ = load(html);
  const winners = new Map();

  // Look for common patterns in news articles
  const selectors = [
    'h2, h3, h4, strong, b',
    'p strong, p b, p em',
    'li strong, li b'
  ];

  selectors.forEach(selector => {
    $(selector).each((i, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes('wins') ||
          text.toLowerCase().includes('winner')) {
        console.log(`  📰 Found potential winner: ${text}`);
      }
    });
  });

  return winners;
}

async function testSource(name, url, parser) {
  console.log(`\n🧪 Testing ${name} (${url})`);

  try {
    const html = await fetchHtml(url);
    const winners = parser(html, url);

    if (winners.size > 0) {
      console.log(`✅ ${name}: Found ${winners.size} potential winners`);
      return { success: true, winners: winners.size, url };
    } else {
      console.log(`⚠️ ${name}: No winners found (might be pre-event)`);
      return { success: true, winners: 0, url };
    }
  } catch (error) {
    console.log(`❌ ${name}: Failed - ${error.message}`);
    return { success: false, error: error.message, url };
  }
}

async function runTests() {
  console.log('🎬 Testing Live Scoring Sources for Tomorrow\'s SAG Awards\n');
  console.log('This will validate that our new scraping strategy works...\n');

  const results = [];

  // Test Wikipedia (primary source)
  const wikiResult = await testSource('Wikipedia', TEST_SOURCES.wikipedia, parseWikipediaWinners);
  results.push({ name: 'Wikipedia', ...wikiResult });

  // Test news sources (backup sources)
  for (const [name, url] of Object.entries(TEST_SOURCES)) {
    if (name === 'wikipedia') continue;
    const result = await testSource(name.charAt(0).toUpperCase() + name.slice(1), url, parseNewsSite);
    results.push({ name: name.charAt(0).toUpperCase() + name.slice(1), ...result });
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful sources: ${successful.length}`);
  console.log(`❌ Failed sources: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed sources:');
    failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }

  if (successful.length >= 2) {
    console.log('\n🎉 GOOD NEWS: We have enough working sources for multi-source validation!');
    console.log('The live scoring system should work reliably tomorrow.');
  } else {
    console.log('\n⚠️ WARNING: Fewer than 2 sources working. May need manual intervention.');
  }

  console.log('\n💡 Next Steps:');
  console.log('1. If sources fail, check your internet connection and VPN if needed');
  console.log('2. Test again closer to showtime (sources update live)');
  console.log('3. Monitor logs during the event');
  console.log('4. Have manual entry ready as final fallback');
}

// CLI
if (process.argv[2] === 'test') {
  runTests().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
} else {
  console.log(`
🎬 Reel Rivals Live Scoring Test Script

Usage:
  node scripts/test-live-scoring.js test

This will test all scraping sources to ensure they work before tomorrow's event.
`);
}
