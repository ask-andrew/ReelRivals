#!/usr/bin/env node

/**
 * Simple BAFTA 2026 Longlists Scraper
 * 
 * Based on the current BAFTA longlists (available now)
 * Ready for nominations on January 27, 2026
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Current BAFTA 2026 Longlists data (from official BAFTA website)
const BAFTA_LONGLISTS_2026 = {
  'BEST FILM': {
    emoji: '🏆',
    note: '10 films advancing from 109 eligible films'
  },
  'OUTSTANDING BRITISH FILM': {
    emoji: '🇬🇧', 
    note: '15 films advancing from 70 eligible films'
  },
  'OUTSTANDING DEBUT BY A BRITISH WRITER, DIRECTOR OR PRODUCER': {
    emoji: '🌟',
    nominees: [
      'The Ceremony',
      'The Man in My Basement', 
      'Mother Vera',
      'My Father\'s Shadow',
      'Pillion',
      'Ocean with David Attenborough',
      'The Shadow Scholars',
      'Urchin',
      'A Want In Her',
      'Wasteman'
    ],
    note: '10 films advancing from 43 eligible films'
  },
  'CHILDREN\'S & FAMILY FILM': {
    emoji: '👨‍👩‍👧‍👦',
    nominees: [
      'Arco',
      'Boong',
      'Elio', 
      'Grow',
      'How to Train Your Dragon',
      'Lilo & Stitch',
      'Little Amelie',
      'Zootropolis 2'
    ],
    note: '8 films advancing from 14 eligible films'
  },
  'FILM NOT IN ENGLISH LANGUAGE': {
    emoji: '🌍',
    nominees: [
      'It Was Just an Accident',
      'La Grazia',
      'Left-Handed Girl',
      'No Other Choice', 
      'Nouvelle Vague',
      'Rental Family',
      'The Secret Agent',
      'Sentimental Value',
      'Sirāt',
      'The Voice of Hind Rajab'
    ],
    note: '10 films advancing from 40 eligible films'
  },
  'DOCUMENTARY': {
    emoji: '📽️',
    nominees: [
      '2000 Meters To Andriivka',
      'Apocalypse In The Tropics',
      'Becoming Led Zeppelin',
      'Cover-Up',
      'The Librarians',
      'Mr Nobody Against Putin',
      'Ocean with David Attenborough',
      'One to One: John & Yoko',
      'The Perfect Neighbour',
      'Riefenstahl'
    ],
    note: '10 films advancing from 61 eligible films'
  },
  'ANIMATED FILM': {
    emoji: '🎨',
    nominees: [
      'Arco',
      'The Bad Guys 2',
      'Demon Slayer: Kimetsu no Yaiba Infinity Castle',
      'Elio',
      'Little Amelie',
      'Zootropolis 2'
    ],
    note: '6 films advancing from 10 eligible films'
  },
  'DIRECTOR': {
    emoji: '🎬',
    nominees: [
      'Bugonia (Yorgos Lanthimos)',
      'Die My Love (Lynne Ramsay)',
      'Hamnet (Chloé Zhao)',
      'A House of Dynamite (Kathryn Bigelow)',
      'Marty Supreme (Josh Safdie)',
      'One Battle After Another (Paul Thomas Anderson)',
      'Rental Family (Hikari)',
      'Sentimental Value (Joachim Trier)',
      'Sinners (Ryan Coogler)',
      'The Voice of Hind Rajab (Kaouther Ben Hania)'
    ],
    note: '10 films advancing from 182 eligible films'
  },
  'ORIGINAL SCREENPLAY': {
    emoji: '✍️',
    nominees: [
      'Blue Moon',
      'A House of Dynamite',
      'I Swear',
      'Is This Thing On?',
      'It Was Just an Accident',
      'Marty Supreme',
      'The Secret Agent',
      'Sentimental Value',
      'Sinners',
      'Weapons'
    ],
    note: '10 films advancing from 74 eligible films'
  }
};

// Categories that need to be scraped from the second page
const REMAINING_CATEGORIES = [
  'ADAPTED SCREENPLAY',
  'LEADING ACTRESS', 
  'LEADING ACTOR',
  'SUPPORTING ACTRESS',
  'SUPPORTING ACTOR',
  'CASTING',
  'CINEMATOGRAPHY',
  'COSTUME DESIGN', 
  'EDITING',
  'MAKE UP & HAIR',
  'ORIGINAL SCORE',
  'PRODUCTION DESIGN',
  'SPECIAL VISUAL EFFECTS',
  'SOUND',
  'BRITISH SHORT ANIMATION',
  'BRITISH SHORT FILM'
];

/**
 * Convert BAFTA longlists to ReelRivals format
 */
function convertToReelRivalsFormat() {
  const categories = [];
  
  // Process categories we have data for
  Object.entries(BAFTA_LONGLISTS_2026).forEach(([baftaName, data]) => {
    const nominees = data.nominees || [];
    
    categories.push({
      name: mapCategoryName(baftaName),
      base_points: 50,
      emoji: data.emoji,
      nominees: nominees.map((name, index) => ({
        name: cleanNomineeName(name),
        tmdb_id: "",
        display_order: index + 1
      }))
    });
  });
  
  // Add placeholder categories for remaining ones
  REMAINING_CATEGORIES.forEach(baftaName => {
    categories.push({
      name: mapCategoryName(baftaName),
      base_points: 50,
      emoji: getCategoryEmoji(baftaName),
      nominees: [
        { name: 'TBA - Nominations Jan 27', tmdb_id: "", display_order: 1 },
        { name: 'TBA - Nominations Jan 27', tmdb_id: "", display_order: 2 },
        { name: 'TBA - Nominations Jan 27', tmdb_id: "", display_order: 3 },
        { name: 'TBA - Nominations Jan 27', tmdb_id: "", display_order: 4 },
        { name: 'TBA - Nominations Jan 27', tmdb_id: "", display_order: 5 }
      ]
    });
  });
  
  return categories;
}

/**
 * Map BAFTA category names to our format
 */
function mapCategoryName(baftaName) {
  const mapping = {
    'BEST FILM': 'Best Film',
    'OUTSTANDING BRITISH FILM': 'Outstanding British Film',
    'OUTSTANDING DEBUT BY A BRITISH WRITER, DIRECTOR OR PRODUCER': 'Outstanding Debut by a British Writer, Director or Producer',
    'CHILDREN\'S & FAMILY FILM': 'Children\'s & Family Film',
    'FILM NOT IN ENGLISH LANGUAGE': 'Film Not in the English Language',
    'DOCUMENTARY': 'Best Documentary',
    'ANIMATED FILM': 'Best Animated Film',
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
    'BRITISH SHORT FILM': 'Best British Short Film'
  };
  
  return mapping[baftaName] || baftaName;
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(baftaName) {
  const emojis = {
    'ADAPTED SCREENPLAY': '📖',
    'LEADING ACTRESS': '👩',
    'LEADING ACTOR': '👨',
    'SUPPORTING ACTRESS': '👩‍🦰',
    'SUPPORTING ACTOR': '👨‍🦱',
    'CASTING': '🎭',
    'CINEMATOGRAPHY': '📷',
    'COSTUME DESIGN': '👗',
    'EDITING': '✂️',
    'MAKE UP & HAIR': '💄',
    'ORIGINAL SCORE': '🎵',
    'PRODUCTION DESIGN': '🏛️',
    'SPECIAL VISUAL EFFECTS': '💫',
    'SOUND': '🔊',
    'BRITISH SHORT ANIMATION': '🎞️',
    'BRITISH SHORT FILM': '🎬'
  };
  
  return emojis[baftaName] || '🏆';
}

/**
 * Clean nominee names (remove director info in parentheses)
 */
function cleanNomineeName(name) {
  return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

/**
 * Save BAFTA categories for integration
 */
function saveBAFTACategories() {
  const categories = convertToReelRivalsFormat();
  
  const output = {
    event_id: 'baftas-2026',
    event_name: 'BAFTA Film Awards 2026',
    type: 'longlists',
    updated: new Date().toISOString(),
    nominations_announced: '2026-01-27',
    ceremony_date: '2026-02-22',
    categories: categories
  };
  
  // Save JSON
  const jsonPath = path.join(__dirname, 'bafta-longlists-2026.json');
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
  console.log(`✅ Saved JSON to ${jsonPath}`);
  
  // Save TypeScript for easy integration
  const tsContent = `// Auto-generated BAFTA Longlists 2026
// Generated on: ${new Date().toISOString()}
// Nominations announced: January 27, 2026
// Ceremony: February 22, 2026

export interface BAFTACategory {
  name: string;
  base_points: number;
  emoji: string;
  nominees: Array<{
    name: string;
    tmdb_id: string;
    display_order: number;
  }>;
}

export const BAFTA_LONGLISTS_2026: BAFTACategory[] = ${JSON.stringify(categories, null, 2)} as const;

export default BAFTA_LONGLISTS_2026;
`;
  
  const tsPath = path.join(__dirname, 'bafta-longlists-2026.ts');
  fs.writeFileSync(tsPath, tsContent);
  console.log(`✅ Saved TypeScript to ${tsPath}`);
  
  // Display summary
  console.log(`\n🎬 BAFTA 2026 Longlists Summary:`);
  console.log(`📅 Nominations announced: January 27, 2026`);
  console.log(`🏆 Ceremony: February 22, 2026`);
  console.log(`📊 Total categories: ${categories.length}`);
  
  categories.forEach(category => {
    const status = category.nominees[0]?.name.includes('TBA') ? '📅 Pending nominations' : '✅ Longlist available';
    console.log(`   ${category.emoji} ${category.name}: ${category.nominees.length} nominees ${status}`);
  });
  
  console.log(`\n🎉 Ready for integration into ReelRivals!`);
}

// Run the script
console.log('🎬 BAFTA 2026 Longlists Generator');
console.log('=====================================');
saveBAFTACategories();
