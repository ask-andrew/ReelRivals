import { dbCore } from '../src/instant.js';

// Official Golden Globes 2026 winners
const WINNERS = [
  { category: 'Best Picture - Drama', winner: 'The Brutalist' },
  { category: 'Best Picture - Musical or Comedy', winner: 'Emilia Pérez' },
  { category: 'Best Director', winner: 'Jacques Audiard - Emilia Pérez' },
  { category: 'Best Actor - Drama', winner: 'Adrien Brody - The Brutalist' },
  { category: 'Best Actress - Drama', winner: 'Karla Sofía Gascón - Emilia Pérez' },
  { category: 'Best Actor - Musical or Comedy', winner: 'Jesse Eisenberg - A Real Pain' },
  { category: 'Best Actress - Musical or Comedy', winner: 'Demi Moore - The Substance' },
  { category: 'Best Supporting Actor', winner: 'Kieran Culkin - A Real Pain' },
  { category: 'Best Supporting Actress', winner: 'Zoe Saldaña - Emilia Pérez' },
  { category: 'Best Screenplay', winner: 'The Brutalist' },
  { category: 'Best Animated Feature', winner: 'Flow' },
  { category: 'Best Foreign Language Film', winner: 'Emilia Pérez' },
  { category: 'Best Original Score', winner: 'The Brutalist' },
  { category: 'Best Original Song', winner: 'El Mal - Emilia Pérez' },
  { category: 'Best Cinematography', winner: 'The Brutalist' }
];

const EVENT_ID = 'golden-globes-2026';

async function processWinner(winner, eventId) {
  try {
    // Find the category in Instant DB
    const categories = await dbCore.query({
      categories: {
        $: {
          where: {
            event_id: eventId,
            name: winner.category
          }
        },
        nominees: {}
      }
    });

    if (!categories.categories || categories.categories.length === 0) {
      console.log(`⚠️ Category not found: ${winner.category}`);
      return;
    }

    const category = categories.categories[0];
    console.log(`📍 Found category: ${category.name} (${category.id})`);

    // Find the nominee
    const nominees = category.nominees || [];
    let matchingNominee = null;

    // Try exact match first
    matchingNominee = nominees.find(n => n.name === winner.winner);
    
    // Try fuzzy match if exact fails
    if (!matchingNominee) {
      const winnerName = winner.winner.toLowerCase();
      matchingNominee = nominees.find(n => 
        n.name.toLowerCase().includes(winnerName) ||
        winnerName.includes(n.name.toLowerCase())
      );
    }

    if (!matchingNominee) {
      console.log(`⚠️ No matching nominee found for: ${winner.winner} in ${category.name}`);
      console.log(`   Available nominees:`, nominees.map(n => n.name));
      return;
    }

    console.log(`🎯 Found nominee: ${matchingNominee.name} (${matchingNominee.id})`);

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

    if (existingResults.results && existingResults.results.length > 0) {
      console.log(`⏭️ Winner already recorded for ${category.name}`);
      return;
    }

    // Insert the result
    await dbCore.transact([
      dbCore.tx.results.create({
        category_id: category.id,
        winner_nominee_id: matchingNominee.id,
        announced_at: Date.now()
      })
    ]);

    console.log(`🏆 Winner recorded: ${winner.winner} for ${category.name}`);
    
  } catch (error) {
    console.error(`❌ Error processing winner ${winner.winner}:`, error);
  }
}

async function main() {
  console.log('🏆 Seeding Golden Globes 2026 winners...');

  for (const winnerData of WINNERS) {
    await processWinner(winnerData, EVENT_ID);
  }

  console.log('🎉 Winner seeding completed!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
