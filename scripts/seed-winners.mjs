import { init } from '@instantdb/core';

const APP_ID = process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here';
const EVENT_ID = 'golden-globes-2026';

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

async function main() {
  const dbCore = init({ appId: APP_ID });

  console.log('🏆 Seeding Golden Globes 2026 winners...');

  for (const winnerData of WINNERS) {
    try {
      // Find category
      const categoryResult = await dbCore.query({
        categories: {
          $: {
            where: { 
              event_id: EVENT_ID,
              name: winnerData.category 
            }
          },
          nominees: {}
        }
      });

      const categories = categoryResult.categories;
      if (!categories || categories.length === 0) {
        console.log(`⚠️ Category not found: ${winnerData.category}`);
        continue;
      }

      const category = categories[0];
      console.log(`📍 Found category: ${category.name} (${category.id})`);

      // Find matching nominee
      const nominees = category.nominees || [];
      let matchingNominee = null;

      // Try exact match first
      matchingNominee = nominees.find(n => n.name === winnerData.winner);
      
      // Try fuzzy match if exact fails
      if (!matchingNominee) {
        const winnerName = winnerData.winner.toLowerCase();
        matchingNominee = nominees.find(n => 
          n.name.toLowerCase().includes(winnerName) ||
          winnerName.includes(n.name.toLowerCase())
        );
      }

      if (!matchingNominee) {
        console.log(`⚠️ No matching nominee found for: ${winnerData.winner} in ${category.name}`);
        console.log(`   Available nominees:`, nominees.map(n => n.name));
        continue;
      }

      console.log(`🎯 Found nominee: ${matchingNominee.name} (${matchingNominee.id})`);

      // Check if result already exists
      const existingResult = await dbCore.query({
        results: {
          $: {
            where: { category_id: category.id }
          }
        }
      });

      if (existingResult.results && existingResult.results.length > 0) {
        console.log(`⏭️ Winner already recorded for ${category.name}`);
        continue;
      }

      // Insert the result
      await dbCore.transact([
        dbCore.tx.results.create({
          category_id: category.id,
          winner_nominee_id: matchingNominee.id,
          announced_at: Date.now()
        })
      ]);

      console.log(`✅ Winner recorded: ${winnerData.winner} for ${category.name}`);

    } catch (error) {
      console.error(`❌ Error processing ${winnerData.category}:`, error);
    }
  }

  console.log('🎉 Winner seeding completed!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
