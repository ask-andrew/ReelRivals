import { init } from '@instantdb/core';

const db = init({
  appId: process.env.VITE_INSTANT_APP_ID!,
  apiURI: 'https://api.instantdb.com'
});

// Manual SAG winners to store
const sagWinners = [
  { categoryId: '136780db-83e9-43db-9459-48bf1c0c11f6', winner: 'Timothée Chalamet' },
  { categoryId: 'b746eaa4-a7a7-47aa-88e9-db0e83b3fa9a', winner: 'Jessie Buckley' },
  { categoryId: 'c2f53d11-35a9-4534-8912-a353c7efbb0d', winner: 'Kieran Culkin' },
  { categoryId: '5ac5eaa9-f194-4121-9034-497247c18eb9', winner: 'Selena Gomez' },
  { categoryId: '8a1c5b0-1234-4a53-8b3c-1e3c0a8a3e0', winner: 'Ariana Grande' },
  { categoryId: 'd4a1c5b0-1234-4a53-8b3c-1e3c0a8a3e0', winner: 'Jeremy Strong' },
  { categoryId: 'e8a1c5b0-1234-4a53-8b3c-1e3c0a8a3e0', winner: 'Zoe Saldaña' },
  { categoryId: 'f1a2c5b0-1234-4a53-8b3c-1e3c0a8a3e0', winner: 'Conclave' },
  { categoryId: 'd4a1c5b0-1234-4a53-8b3c-1e3c0a8a3e0', winner: 'The Diplomat' },
  { categoryId: 'e8a1c5b0-1234-4a53-8b3c-1e3c0a8a3e0', winner: 'Shogun' },
  { categoryId: '9c1a5b0-1234-4a53-8b3c-1e3c0a8a3e0', winner: 'Miyagi' }
];

async function storeSAGWinners() {
  try {
    console.log('Storing SAG winners manually...');

    // First check if SAG categories exist
    const catQuery = await db.queryOnce({
      categories: {
        $: { where: { event_id: 'sag-2026' } }
      }
    });

    const categories = catQuery.data.categories || [];
    console.log(`Found ${categories.length} SAG categories`);

    if (categories.length === 0) {
      console.log('No SAG categories found - need to seed categories first');
      return;
    }

    // Check existing results
    const existingQuery = await db.queryOnce({
      results: {
        $: { where: { category_id: { in: categories.map(c => c.id) } } }
      }
    });

    const existingResults = existingQuery.data.results || [];
    console.log(`Found ${existingResults.length} existing SAG results`);

    if (existingResults.length > 0) {
      console.log('SAG results already exist!');
      return;
    }

    // Get nominees to match winner names
    const nomineeQuery = await db.queryOnce({
      nominees: {
        $: { where: { event_id: 'sag-2026' } }
      }
    });

    const nominees = nomineeQuery.data.nominees || [];
    console.log(`Found ${nominees.length} SAG nominees`);

    // Match winners to nominees
    const transactions = [];
    const winnerMatches = [];

    for (const winner of sagWinners) {
      const nominee = nominees.find(n =>
        n.name.toLowerCase().includes(winner.winner.toLowerCase()) ||
        winner.winner.toLowerCase().includes(n.name.toLowerCase())
      );

      if (nominee) {
        const resultId = `result-${winner.categoryId}-${Date.now()}`;
        transactions.push(
          db.tx.results[resultId].create({
            category_id: winner.categoryId,
            winner_nominee_id: nominee.id,
            announced_at: Date.now(),
            is_provisional: false,
            finalized_at: Date.now()
          })
        );
        winnerMatches.push(`${winner.winner} -> ${nominee.name}`);
      } else {
        console.log(`❌ No match found for: ${winner.winner}`);
      }
    }

    if (transactions.length > 0) {
      await db.transact(transactions);
      console.log(`✅ Stored ${transactions.length} SAG results:`);
      winnerMatches.forEach(match => console.log(`  ${match}`));
    }

  } catch (error) {
    console.error('Error storing SAG winners:', error);
  }
}

storeSAGWinners();
