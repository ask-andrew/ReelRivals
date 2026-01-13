#!/usr/bin/env node

/**
 * BAFTA 2026 Awards Scraper
 * 
 * This scraper extracts categories and nominees from BAFTA's official website.
 * It can handle both longlists (available now) and nominations (announced Jan 27, 2026).
 * 
 * Usage: node bafta-scraper.js [longlists|nominations]
 * Default: longlists
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// BAFTA URLs
const BAFTA_URLS = {
  longlists: 'https://www.bafta.org/stories/longlists-2026-ee-bafta-film-awards/',
  nominations: 'https://www.bafta.org/stories/nominations-2026-ee-bafta-film-awards/' // Will be live Jan 27, 2026
};

// Category mapping from BAFTA names to our internal names
const CATEGORY_MAPPING = {
  'BEST FILM': 'Best Film',
  'OUTSTANDING BRITISH FILM': 'Outstanding British Film', 
  'OUTSTANDING DEBUT BY A BRITISH WRITER, DIRECTOR OR PRODUCER': 'Outstanding Debut by a British Writer, Director or Producer',
  'CHILDREN\'S & FAMILY FILM': 'Children\'s & Family Film',
  'FILM NOT IN ENGLISH LANGUAGE': 'Film Not in the English Language',
  'DOCUMENTARY': 'Documentary',
  'ANIMATED FILM': 'Animated Film',
  'DIRECTOR': 'Best Director',
  'ORIGINAL SCREENPLAY': 'Best Original Screenplay',
  'ADAPTED SCREENPLAY': 'Best Adapted Screenplay',
  'LEADING ACTRESS': 'Best Actress',
  'LEADING ACTOR': 'Best Actor',
  'SUPPORTING ACTRESS': 'Best Supporting Actress',
  'SUPPORTING ACTOR': 'Best Supporting Actor',
  'CASTING': 'Best Casting',
  'CINEMATOGRAPHY': 'Best Cinematography',
  'COSTUME DESIGN': 'Best Costume Design',
  'EDITING': 'Best Editing',
  'MAKE UP & HAIR': 'Best Makeup & Hair',
  'ORIGINAL SCORE': 'Best Original Score',
  'PRODUCTION DESIGN': 'Best Production Design',
  'SPECIAL VISUAL EFFECTS': 'Best Special Visual Effects',
  'SOUND': 'Best Sound',
  'BRITISH SHORT ANIMATION': 'Best British Short Animation',
  'BRITISH SHORT FILM': 'Best British Short Film',
  'EE RISING STAR AWARD': 'EE Rising Star Award' // Voted by public
};

// Emoji mapping for categories
const CATEGORY_EMOJIS = {
  'Best Film': '🏆',
  'Outstanding British Film': '🇬🇧',
  'Outstanding Debut by a British Writer, Director or Producer': '🌟',
  'Children\'s & Family Film': '👨‍👩‍👧‍👦',
  'Film Not in the English Language': '🌍',
  'Documentary': '📽️',
  'Animated Film': '🎨',
  'Best Director': '🎬',
  'Best Original Screenplay': '✍️',
  'Best Adapted Screenplay': '📖',
  'Best Actress': '👩',
  'Best Actor': '👨',
  'Best Supporting Actress': '👩‍🦰',
  'Best Supporting Actor': '👨‍🦱',
  'Best Casting': '🎭',
  'Best Cinematography': '📷',
  'Best Costume Design': '👗',
  'Best Editing': '✂️',
  'Best Makeup & Hair': '💄',
  'Best Original Score': '🎵',
  'Best Production Design': '🏛️',
  'Best Special Visual Effects': '💫',
  'Best Sound': '🔊',
  'Best British Short Animation': '🎞️',
  'Best British Short Film': '🎬',
  'EE Rising Star Award': '⭐'
};

/**
 * Fetch HTML content from a URL
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Extract categories and nominees from HTML content
 * This is a simplified parser - in production you'd want cheerio or similar
 */
function parseBAFTAContent(html, type) {
  const categories = [];
  
  // Find all category headers (h2 elements)
  const categoryRegex = /<h2[^>]*>([^<]+)<\/h2>/gi;
  let categoryMatch;
  
  while ((categoryMatch = categoryRegex.exec(html)) !== null) {
    const categoryName = categoryMatch[1].trim();
    
    // Skip non-category headers
    if (!Object.keys(CATEGORY_MAPPING).includes(categoryName)) {
      continue;
    }
    
    // Get the content after this header until the next h2
    const startIndex = categoryMatch.index + categoryMatch[0].length;
    const nextHeaderIndex = html.indexOf('<h2', startIndex);
    const categoryContent = html.substring(startIndex, nextHeaderIndex !== -1 ? nextHeaderIndex : html.length);
    
    // Extract nominees/films from this category
    const nominees = extractNominees(categoryContent, categoryName, type);
    
    if (nominees.length > 0) {
      const mappedName = CATEGORY_MAPPING[categoryName];
      categories.push({
        name: mappedName,
        base_points: 50, // Standard points for all categories
        emoji: CATEGORY_EMOJIS[mappedName] || '🏆',
        nominees: nominees
      });
    }
  }
  
  return categories;
}

/**
 * Extract nominees from category content
 */
function extractNominees(content, categoryName, type) {
  const nominees = [];
  
  if (type === 'longlists') {
    // Longlists use bullet points or numbered lists
    const listItemRegex = /<li[^>]*>([^<]+)<\/li>/gi;
    let match;
    
    while ((match = listItemRegex.exec(content)) !== null) {
      const nomineeText = match[1].trim();
      
      // Clean up the text - remove extra info like director names in parentheses
      const cleanText = nomineeText.replace(/\s*\([^)]*\)\s*/g, '').trim();
      
      if (cleanText && cleanText !== '') {
        nominees.push({
          name: cleanText,
          tmdb_id: "", // We'll need to match these later
          display_order: nominees.length + 1
        });
      }
    }
  } else {
    // Nominations might have different format - we'll update this when we see the actual structure
    const nomineeRegex = /<p[^>]*>([^<]+)<\/p>/gi;
    let match;
    
    while ((match = nomineeRegex.exec(content)) !== null) {
      const nomineeText = match[1].trim();
      
      if (nomineeText && nomineeText !== '' && !nomineeText.toLowerCase().includes('vote')) {
        nominees.push({
          name: nomineeText,
          tmdb_id: "",
          display_order: nominees.length + 1
        });
      }
    }
  }
  
  return nominees;
}

/**
 * Convert BAFTA categories to our ReelRivals format
 */
function convertToReelRivalsFormat(categories) {
  return categories.map((category, index) => ({
    name: category.name,
    base_points: category.base_points,
    emoji: category.emoji,
    nominees: category.nominees.map((nominee, nomineeIndex) => ({
      name: nominee.name,
      tmdb_id: nominee.tmdb_id,
      display_order: nomineeIndex + 1
    }))
  }));
}

/**
 * Save categories to JSON file
 */
function saveCategories(categories, type) {
  const fileName = `bafta-${type}-2026.json`;
  const filePath = path.join(__dirname, fileName);
  
  const output = {
    event_id: 'baftas-2026',
    event_name: 'BAFTA Film Awards 2026',
    type: type,
    updated: new Date().toISOString(),
    categories: convertToReelRivalsFormat(categories)
  };
  
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  console.log(`✅ Saved ${categories.length} categories to ${fileName}`);
  
  // Also save as TypeScript for easy integration
  const tsFileName = `bafta-${type}-2026.ts`;
  const tsFilePath = path.join(__dirname, tsFileName);
  
  const tsContent = `// Auto-generated BAFTA ${type} 2026 categories
// Generated on: ${new Date().toISOString()}

export const BAFTA_${type.toUpperCase()}_2026 = ${JSON.stringify(convertToReelRivalsFormat(categories), null, 2)} as const;

export default BAFTA_${type.toUpperCase()}_2026;
`;
  
  fs.writeFileSync(tsFilePath, tsContent);
  console.log(`✅ Saved TypeScript file to ${tsFileName}`);
}

/**
 * Main scraping function
 */
async function scrapeBAFTA(type = 'longlists') {
  console.log(`🎬 Starting BAFTA ${type} scraper...`);
  console.log(`📅 Target date: ${type === 'nominations' ? 'January 27, 2026' : 'Available now'}`);
  
  try {
    const url = BAFTA_URLS[type];
    console.log(`🌐 Fetching: ${url}`);
    
    const html = await fetchUrl(url);
    console.log(`📄 Fetched ${html.length} characters of HTML`);
    
    const categories = parseBAFTAContent(html, type);
    console.log(`🏆 Found ${categories.length} categories`);
    
    // Display summary
    categories.forEach(category => {
      console.log(`   ${category.emoji} ${category.name}: ${category.nominees.length} nominees`);
    });
    
    saveCategories(categories, type);
    
    console.log(`\n🎉 BAFTA ${type} scraping complete!`);
    console.log(`📁 Files saved: bafta-${type}-2026.json, bafta-${type}-2026.ts`);
    
  } catch (error) {
    console.error(`❌ Error scraping BAFTA ${type}:`, error.message);
    
    if (type === 'nominations') {
      console.log(`\n💡 Tip: Nominations will be announced on January 27, 2026`);
      console.log(`   The URL might not be live yet. Try again after the announcement.`);
    }
  }
}

// Run the scraper
const type = process.argv[2] || 'longlists';
if (!['longlists', 'nominations'].includes(type)) {
  console.log('❌ Invalid type. Use: longlists or nominations');
  process.exit(1);
}

scrapeBAFTA(type);
