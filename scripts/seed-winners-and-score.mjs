import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { init, id } from '@instantdb/admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set VITE_INSTANT_SECRET or INSTANT_APP_ADMIN_TOKEN in your environment.');
  process.exit(1);
}

const EVENT_ID = 'golden-globes-2026';

const db = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN
});

const winnersPath = path.join(__dirname, 'winners-2026.json');

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function seedWinners(winners) {
  console.log('📥 Seeding winners into InstantDB...');
  let created = 0;
  let updated = 0;
  let missingNominee = 0;

  // Debug: List all stored categories first
  const allCategoriesData = await db.query({
    categories: {
      $: {
        where: {
          event_id: EVENT_ID
        }
      }
    }
  });
  console.log('📋 Stored categories in InstantDB:');
  (allCategoriesData.categories || []).forEach(cat => {
    console.log(`   - "${cat.name}" (id: ${cat.id})`);
  });

  for (const winner of winners) {
    try {
      const categoryData = await db.query({
        categories: {
          $: {
            where: {
              event_id: EVENT_ID,
              name: winner.category
            }
          },
          nominees: {},
          results: {}
        }
      });

      const categories = categoryData.categories || [];
      if (categories.length === 0) {
        console.warn(`⚠️ Category not found: ${winner.category}`);
        continue;
      }

      const category = categories[0];
      const nominees = category.nominees || [];

      const normalizedWinner = normalizeName(winner.winner);
      let matchingNominee = nominees.find(n => normalizeName(n.name) === normalizedWinner);

      if (!matchingNominee) {
        matchingNominee = nominees.find(n => normalizeName(n.name).includes(normalizedWinner));
      }

      if (!matchingNominee) {
        matchingNominee = nominees.find(n => normalizedWinner.includes(normalizeName(n.name)));
      }

      if (!matchingNominee) {
        console.warn(`⚠️ No nominee match for "${winner.winner}" in category "${winner.category}"`);
        console.warn('   Available nominees:', nominees.map(n => n.name));
        missingNominee += 1;
        continue;
      }

      const existingResultsData = await db.query({
        results: {
          $: {
            where: {
              category_id: category.id
            }
          }
        }
      });

      const existingResults = existingResultsData.results || [];
      const now = Date.now();

      if (existingResults.length > 0) {
        const current = existingResults[0];
        if (current.winner_nominee_id === matchingNominee.id) {
          console.log(`⏭️ Winner already recorded for ${winner.category}`);
        } else {
          await db.transact([
            db.tx.results[current.id].update({
              winner_nominee_id: matchingNominee.id,
              announced_at: now
            })
          ]);
          console.log(`🔄 Updated winner for ${winner.category}`);
          updated += 1;
        }
        continue;
      }

      await db.transact([
        db.tx.results[id()].update({
          category_id: category.id,
          winner_nominee_id: matchingNominee.id,
          announced_at: now
        })
      ]);
      console.log(`✅ Recorded winner ${winner.winner} for ${winner.category}`);
      created += 1;
    } catch (err) {
      console.error(`❌ Error processing ${winner.category}:`, err);
    }
  }

  console.log(`📊 Winner seeding summary -> created: ${created}, updated: ${updated}, missing nominee: ${missingNominee}`);
}

async function calculateScores() {
  console.log('🧮 Calculating scores for event:', EVENT_ID);

  // Debug: Check what results we actually have
  const allResultsData = await db.query({
    results: {
      $: {}
    }
  });
  console.log('📋 Current results in database:');
  (allResultsData.results || []).forEach(result => {
    console.log(`   - Category ID: ${result.category_id}, Winner: ${result.winner_nominee_id}`);
  });

  const categoriesData = await db.query({
    categories: {
      $: {
        where: {
          event_id: EVENT_ID
        }
      },
      results: {},
      nominees: {}
    }
  });

  const categories = categoriesData.categories || [];
  if (categories.length === 0) {
    console.warn('⚠️ No categories found for event. Did you seed categories yet?');
    return;
  }

  const ballotsData = await db.query({
    ballots: {
      $: {
        where: {
          event_id: EVENT_ID
        }
      },
      picks: {}
    }
  });

  const ballots = ballotsData.ballots || [];
  const ballotMap = new Map(ballots.map(ballot => [ballot.id, ballot]));

  const scoreboard = new Map();

  for (const ballot of ballots) {
    const key = `${ballot.user_id}:${ballot.league_id}`;
    scoreboard.set(key, {
      userId: ballot.user_id,
      leagueId: ballot.league_id,
      totalPoints: 0,
      correctPicks: 0,
      powerPicksHit: 0
    });
  }

  for (const category of categories) {
    const basePoints = category.base_points ?? 50;
    
    // Look for winner in the allResultsData we already fetched
    const winnerResult = (allResultsData.results || []).find(result => result.category_id === category.id);
    
    if (!winnerResult) {
      console.warn(`⚠️ No winner recorded for category ${category.name} (${category.id})`);
      continue;
    }

    const winnerNomineeId = winnerResult.winner_nominee_id;
    if (!winnerNomineeId) {
      console.warn(`⚠️ Winner result missing nominee id for category ${category.name}`);
      continue;
    }

    const picksData = await db.query({
      picks: {
        $: {
          where: {
            category_id: category.id
          }
        }
      }
    });

    const picks = picksData.picks || [];

    for (const pick of picks) {
      const ballot = ballotMap.get(pick.ballot_id);
      if (!ballot) {
        continue;
      }

      const key = `${ballot.user_id}:${ballot.league_id}`;
      if (!scoreboard.has(key)) {
        scoreboard.set(key, {
          userId: ballot.user_id,
          leagueId: ballot.league_id,
          totalPoints: 0,
          correctPicks: 0,
          powerPicksHit: 0
        });
      }

      const entry = scoreboard.get(key);
      const isCorrect = pick.nominee_id === winnerNomineeId;

      if (isCorrect) {
        entry.correctPicks += 1;
        const isPower = !!pick.is_power_pick;
        entry.totalPoints += isPower ? basePoints * 3 : basePoints;
        if (isPower) {
          entry.powerPicksHit += 1;
        }
      }
    }
  }

  const scoresData = await db.query({
    scores: {
      $: {
        where: {
          event_id: EVENT_ID
        }
      }
    }
  });

  const existingScores = scoresData.scores || [];
  const existingMap = new Map(existingScores.map(score => [`${score.user_id}:${score.league_id}`, score]));

  const txs = [];
  const timestamp = Date.now();

  for (const entry of scoreboard.values()) {
    const key = `${entry.userId}:${entry.leagueId}`;
    const existing = existingMap.get(key);

    if (existing) {
      txs.push(
        db.tx.scores[existing.id].update({
          total_points: entry.totalPoints,
          correct_picks: entry.correctPicks,
          power_picks_hit: entry.powerPicksHit,
          updated_at: timestamp
        })
      );
    } else {
      txs.push(
        db.tx.scores[id()].update({
          user_id: entry.userId,
          league_id: entry.leagueId,
          event_id: EVENT_ID,
          total_points: entry.totalPoints,
          correct_picks: entry.correctPicks,
          power_picks_hit: entry.powerPicksHit,
          updated_at: timestamp
        })
      );
    }
  }

  for (const [key, score] of existingMap.entries()) {
    if (!scoreboard.has(key)) {
      txs.push(
        db.tx.scores[score.id].update({
          total_points: 0,
          correct_picks: 0,
          power_picks_hit: 0,
          updated_at: timestamp
        })
      );
    }
  }

  if (txs.length > 0) {
    await db.transact(txs);
  }

  console.log(`✅ Scores updated for ${scoreboard.size} user/league combinations.`);
}

async function main() {
  console.log('🏆 Loading winners data from JSON...');
  const data = JSON.parse(readFileSync(winnersPath, 'utf8'));
  const winners = data.winners || [];

  if (winners.length === 0) {
    console.error('❌ No winners found in JSON file. Aborting.');
    process.exit(1);
  }

  await seedWinners(winners);
  await calculateScores();
  console.log('🎉 Winners seeded and scores calculated!');
}

main().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
