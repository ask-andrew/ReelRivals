import { init, id } from '@instantdb/admin';

const db = init({
  appId: 'a4c0e0b8-8b4a-4b4a-8b4a-8b4a8b4a8b4a',
  adminToken: 'b2f0e0b8-8b4a-4b4a-8b4a-8b4a8b4a8b4a'
});

// Official Oscar winners from user
const OSCAR_WINNERS = [
  { category: 'Best Picture', winner: 'One Battle After Another' },
  { category: 'Best Actress', winner: 'Jessie Buckley, Hamnet' },
  { category: 'Best Actor', winner: 'Michael B. Jordan, Sinners' },
  { category: 'Best Director', winner: 'Paul Thomas Anderson, One Battle After Another' },
  { category: 'Best Supporting Actor', winner: 'Sean Penn, One Battle After Another' },
  { category: 'Best Supporting Actress', winner: 'Amy Madigan, Weapons' },
  { category: 'Best Animated Feature', winner: 'Kpop Demon Hunters' },
  { category: 'Best Casting', winner: 'Cassandra Kulukundis, One Battle After Another' },
  { category: 'Best Live Action Short', winner: 'The Singers' }, // First tie winner
  { category: 'Best Live Action Short', winner: 'Two People Exchanging Saliva' }, // Second tie winner
  { category: 'Best Documentary Feature', winner: 'Mr. Nobody Against Putin' },
  { category: 'Best Original Score', winner: 'Ludwig Göransson, Sinners' },
  { category: 'Best International Feature', winner: 'Sentimental Value, Norway' }
];

async function storeOscarWinners() {
  console.log('🏆 Storing official Oscar winners...');

  // Get all Oscar categories
  const catQuery = await db.query({
    categories: {
      $: { where: { event_id: 'oscars-2026' } },
      nominees: {}
    }
  });

  const categories = catQuery.data.categories || [];
  console.log(`Found ${categories.length} Oscar categories`);

  // Create category name to ID mapping
  const categoryMap = new Map();
  categories.forEach(cat => {
    const cleanName = cat.name.toLowerCase().replace(/best /i, '').trim();
    categoryMap.set(cleanName, cat);
  });

  // Get existing results to avoid duplicates
  const resultsQuery = await db.query({
    results: {
      $: { where: { event_id: 'oscars-2026' } }
    }
  });

  const existingResults = resultsQuery.data.results || [];
  const existingResultsByCategory = new Map();
  existingResults.forEach(result => {
    existingResultsByCategory.set(result.category_id, result);
  });

  const transactions = [];

  for (const winner of OSCAR_WINNERS) {
    const categoryKey = winner.category.toLowerCase().replace(/best /i, '').trim();
    const category = categoryMap.get(categoryKey);

    if (!category) {
      console.log(`❌ Category not found: ${winner.category}`);
      continue;
    }

    console.log(`✅ Processing: ${winner.category} -> ${winner.winner}`);

    // Find matching nominee
    const nominees = category.nominees || [];
    let matchingNominee = null;

    // Try exact match first
    matchingNominee = nominees.find(n => n.name.toLowerCase() === winner.winner.toLowerCase());

    // Try partial match (first part before comma)
    if (!matchingNominee && winner.winner.includes(',')) {
      const firstPart = winner.winner.split(',')[0].trim();
      matchingNominee = nominees.find(n => n.name.toLowerCase().includes(firstPart.toLowerCase()));
    }

    // Try containing match
    if (!matchingNominee) {
      matchingNominee = nominees.find(n =>
        n.name.toLowerCase().includes(winner.winner.toLowerCase()) ||
        winner.winner.toLowerCase().includes(n.name.toLowerCase())
      );
    }

    if (!matchingNominee) {
      console.log(`❌ Nominee not found for: ${winner.winner}`);
      console.log(`   Available nominees:`, nominees.map(n => n.name));
      continue;
    }

    console.log(`   ✅ Matched nominee: ${matchingNominee.name}`);

    // Check if result already exists
    const existingResult = existingResultsByCategory.get(category.id);
    if (existingResult) {
      console.log(`   📝 Updating existing result`);
      transactions.push(
        db.tx.results[existingResult.id].update({
          winner_nominee_id: matchingNominee.id,
          finalized_at: Date.now(),
          is_provisional: false
        })
      );
    } else {
      console.log(`   ➕ Creating new result`);
      const resultId = id();
      transactions.push(
        db.tx.results[resultId].create({
          event_id: 'oscars-2026',
          category_id: category.id,
          winner_nominee_id: matchingNominee.id,
          announced_at: Date.now(),
          finalized_at: Date.now(),
          is_provisional: false
        })
      );
    }
  }

  if (transactions.length > 0) {
    console.log(`\n💾 Executing ${transactions.length} transactions...`);
    await db.transact(transactions);
    console.log('✅ Oscar winners stored successfully!');
  } else {
    console.log('ℹ️ No new winners to store');
  }
}

storeOscarWinners().catch(console.error);
