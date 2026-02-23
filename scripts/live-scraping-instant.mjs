import { sendNotification, scrapeEventWinnersDetailed } from './scraping-utils.mjs';
import { init, id } from '@instantdb/admin';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname });

const APP_ID = process.env.VITE_INSTANT_APP_ID || '14bcf449-e9b5-4c78-82f0-e5c63336fd68';
const ADMIN_TOKEN = process.env.VITE_INSTANT_SECRET || process.env.INSTANT_APP_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Missing admin token. Set VITE_INSTANT_SECRET or INSTANT_APP_ADMIN_TOKEN.');
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

const EVENT_MATCH_ALIASES = {
  'baftas-2026': {
    category: {
      'best director': 'directing',
      'director': 'directing',
      'best animated film': 'best animated film',
      "outstanding british film": "outstanding british film"
    },
    nominee: {
      'zootopia 2': 'zootropolis 2'
    }
  },
  'oscars-2026': {
    category: {
      'best director': 'directing',
      'best directing': 'directing',
      'leading actor': 'actor in a leading role',
      'leading actress': 'actress in a leading role',
      'supporting actor': 'actor in a supporting role',
      'supporting actress': 'actress in a supporting role',
      'original screenplay': 'writing original screenplay',
      'adapted screenplay': 'writing adapted screenplay',
      'international feature': 'international feature film',
      'animated feature': 'animated feature film'
    },
    nominee: {}
  },
  'sag-2026': {
    category: {
      'best actor': 'outstanding performance by a male actor in a leading role',
      'best actress': 'outstanding performance by a female actor in a leading role',
      'best supporting actor': 'outstanding performance by a male actor in a supporting role',
      'best supporting actress': 'outstanding performance by a female actor in a supporting role',
      'ensemble': 'outstanding performance by a cast in a motion picture'
    },
    nominee: {}
  }
};

function normalizeForMatch(value, aliasMap = {}) {
  let normalized = String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\bdirecting\b/g, 'director')
    .replace(/\bbest\b/g, ' ')
    .replace(/\boutstanding\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (aliasMap[normalized]) {
    normalized = aliasMap[normalized];
  }

  return normalized;
}

function pickBestMatch(target, candidates, accessor, minScore = 20, aliasMap = {}) {
  const normalizedTarget = normalizeForMatch(target, aliasMap);
  if (!normalizedTarget || candidates.length === 0) return null;

  let best = null;
  let bestScore = -1;
  for (const candidate of candidates) {
    const candidateValue = accessor(candidate);
    const normalizedCandidate = normalizeForMatch(candidateValue, aliasMap);
    if (!normalizedCandidate) continue;

    let score = 0;
    if (normalizedCandidate === normalizedTarget) score = 100;
    else if (normalizedCandidate.includes(normalizedTarget)) score = 80;
    else if (normalizedTarget.includes(normalizedCandidate)) score = 70;
    else {
      const targetTokens = new Set(normalizedTarget.split(' '));
      const candidateTokens = new Set(normalizedCandidate.split(' '));
      let overlap = 0;
      for (const token of targetTokens) {
        if (candidateTokens.has(token)) overlap++;
      }
      score = overlap * 10;
    }

    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return bestScore >= minScore ? best : null;
}

async function getEventContext(eventId) {
  const categoriesQuery = await db.query({
    categories: {
      $: { where: { event_id: eventId } }
    }
  });
  const categories = categoriesQuery.categories || [];
  const categoryIds = categories.map((c) => c.id);

  const nomineesQuery = categoryIds.length > 0
    ? await db.query({
        nominees: {
          $: { where: { category_id: { in: categoryIds } } }
        }
      })
    : { nominees: [] };
  const nominees = nomineesQuery.nominees || [];

  const nomineesByCategory = new Map();
  for (const nominee of nominees) {
    if (!nomineesByCategory.has(nominee.category_id)) {
      nomineesByCategory.set(nominee.category_id, []);
    }
    nomineesByCategory.get(nominee.category_id).push(nominee);
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const nomineeById = new Map(nominees.map((n) => [n.id, n]));
  return { categories, nomineesByCategory, categoryById, nomineeById };
}

function mapObservationsToCandidates(observations, context, eventId) {
  const categoryAliasMap = EVENT_MATCH_ALIASES[eventId]?.category || {};
  const nomineeAliasMap = EVENT_MATCH_ALIASES[eventId]?.nominee || {};
  const mapped = [];
  for (const observation of observations) {
    const category = pickBestMatch(observation.categoryName, context.categories, (c) => c.name, 20, categoryAliasMap);
    if (!category) {
      console.log(`⚠️ No matching category found for observation: ${observation.categoryName}`);
      continue;
    }

    const categoryNominees = context.nomineesByCategory.get(category.id) || [];
    const nominee = pickBestMatch(observation.winnerName, categoryNominees, (n) => n.name, 10, nomineeAliasMap);
    if (!nominee) {
      console.log(`⚠️ No matching nominee for ${observation.winnerName} in ${category.name}`);
      continue;
    }

    mapped.push({
      ...observation,
      categoryId: category.id,
      categoryName: category.name,
      nomineeId: nominee.id,
      nomineeName: nominee.name
    });
  }
  return mapped;
}

async function buildReadinessReport(eventId) {
  const context = await getEventContext(eventId);
  const { observations, bySource } = await scrapeEventWinnersDetailed(eventId);
  const mappedCandidates = mapObservationsToCandidates(observations, context, eventId);
  const resolved = resolveConsensusCandidates(mappedCandidates);

  const resolvedCategoryIds = new Set(resolved.map((r) => r.categoryId));
  const unresolvedCategories = context.categories
    .filter((c) => !resolvedCategoryIds.has(c.id))
    .map((c) => c.name);

  const coveragePct = context.categories.length > 0
    ? ((resolvedCategoryIds.size / context.categories.length) * 100).toFixed(1)
    : '0.0';

  return {
    eventId,
    sourceSummary: bySource,
    categoriesTotal: context.categories.length,
    observationsTotal: observations.length,
    mappedCandidates: mappedCandidates.length,
    resolvedCategories: resolvedCategoryIds.size,
    coveragePct,
    unresolvedCategories,
    sampleResolved: resolved.slice(0, 10).map((r) => ({
      category: r.categoryName,
      winner: r.winnerName,
      provisional: r.isProvisional,
      reason: r.resolutionReason,
      sources: r.sourceNames
    }))
  };
}

function resolveConsensusCandidates(mappedCandidates) {
  const byCategory = new Map();
  for (const candidate of mappedCandidates) {
    if (!byCategory.has(candidate.categoryId)) {
      byCategory.set(candidate.categoryId, new Map());
    }
    const nomineeMap = byCategory.get(candidate.categoryId);
    if (!nomineeMap.has(candidate.nomineeId)) {
      nomineeMap.set(candidate.nomineeId, {
        categoryId: candidate.categoryId,
        categoryName: candidate.categoryName,
        nomineeId: candidate.nomineeId,
        winnerName: candidate.nomineeName,
        sourceIds: new Set(),
        sourceNames: new Set(),
        officialCount: 0,
        secondaryCount: 0,
        totalCount: 0
      });
    }
    const agg = nomineeMap.get(candidate.nomineeId);
    agg.totalCount++;
    agg.sourceIds.add(candidate.sourceId);
    agg.sourceNames.add(candidate.sourceName);
    if (candidate.sourceTrust === 'official') agg.officialCount++;
    else agg.secondaryCount++;
  }

  const resolved = [];
  for (const nomineeMap of byCategory.values()) {
    const candidates = [...nomineeMap.values()];
    candidates.sort((a, b) => {
      if (b.officialCount !== a.officialCount) return b.officialCount - a.officialCount;
      if (b.sourceIds.size !== a.sourceIds.size) return b.sourceIds.size - a.sourceIds.size;
      return b.totalCount - a.totalCount;
    });
    const winner = candidates[0];
    const verifiedByOfficial = winner.officialCount > 0;
    const verifiedByConsensus = winner.officialCount === 0 && winner.sourceIds.size >= 2;
    const isProvisional = !(verifiedByOfficial || verifiedByConsensus);
    const confidenceScore = verifiedByOfficial ? 0.95 : verifiedByConsensus ? 0.8 : 0.55;
    const resolutionReason = verifiedByOfficial
      ? 'official_source'
      : verifiedByConsensus
        ? 'secondary_consensus'
        : 'single_secondary_source';

    resolved.push({
      categoryId: winner.categoryId,
      categoryName: winner.categoryName,
      nomineeId: winner.nomineeId,
      winnerName: winner.winnerName,
      isProvisional,
      confidenceScore,
      resolutionReason,
      sourceIds: [...winner.sourceIds],
      sourceNames: [...winner.sourceNames]
    });
  }

  return resolved;
}

async function upsertResolvedWinner(winner) {
  const existingResults = await db.query({
    results: {
      $: {
        where: { category_id: winner.categoryId }
      }
    }
  });

  if (existingResults.results.length > 0) {
    const existing = existingResults.results[0];
    const sameWinner = existing.winner_nominee_id === winner.nomineeId;
    const existingIsProvisional = !!existing.is_provisional;
    const existingConfidence = Number(existing.confidence_score || 0);

    if (sameWinner) {
      if (existingIsProvisional && !winner.isProvisional) {
        return db.tx.results[existing.id].update({
          is_provisional: false,
          finalized_at: Date.now(),
          verified_source_name: winner.sourceNames.join(' | '),
          verified_source_url: null,
          confidence_score: winner.confidenceScore,
          resolution_reason: winner.resolutionReason,
          evidence_source_ids: winner.sourceIds.join(','),
          evidence_sources: winner.sourceNames.join(' | ')
        });
      }
      return null;
    }

    if (!existingIsProvisional) {
      console.log(`⏭️ Category already finalized: ${winner.categoryName}`);
      return null;
    }

    if (!winner.isProvisional || winner.confidenceScore > existingConfidence) {
      return db.tx.results[existing.id].update({
        winner_nominee_id: winner.nomineeId,
        announced_at: Date.now(),
        is_provisional: winner.isProvisional,
        finalized_at: winner.isProvisional ? null : Date.now(),
        source_name: winner.sourceNames.join(' | '),
        source_url: null,
        verified_source_name: winner.isProvisional ? null : winner.sourceNames.join(' | '),
        verified_source_url: null,
        confidence_score: winner.confidenceScore,
        resolution_reason: winner.resolutionReason,
        evidence_source_ids: winner.sourceIds.join(','),
        evidence_sources: winner.sourceNames.join(' | ')
      });
    }

    return null;
  }

  const resultId = id();
  return db.tx.results[resultId].create({
    category_id: winner.categoryId,
    winner_nominee_id: winner.nomineeId,
    announced_at: Date.now(),
    is_provisional: winner.isProvisional,
    finalized_at: winner.isProvisional ? null : Date.now(),
    source_name: winner.sourceNames.join(' | '),
    source_url: null,
    verified_source_name: winner.isProvisional ? null : winner.sourceNames.join(' | '),
    verified_source_url: null,
    confidence_score: winner.confidenceScore,
    resolution_reason: winner.resolutionReason,
    evidence_source_ids: winner.sourceIds.join(','),
    evidence_sources: winner.sourceNames.join(' | ')
  });
}

async function scrapeWinnersInstantDB(eventId) {
  console.log(`🏆 Starting live winner scraping for ${eventId}...`);

  try {
    const context = await getEventContext(eventId);
    const { observations, bySource } = await scrapeEventWinnersDetailed(eventId);
    if (bySource.length > 0) {
      const summary = bySource.map((s) => `${s.sourceName}: ${s.winnerCount}`).join(' | ');
      console.log(`📡 Source summary -> ${summary}`);
    }
    const mappedCandidates = mapObservationsToCandidates(observations, context, eventId);
    const winners = resolveConsensusCandidates(mappedCandidates);

    if (winners.length === 0) {
      console.log('ℹ️ No new winners found');
      return;
    }

    const transactions = [];
    const newWinners = [];
    for (const winner of winners) {
      const transaction = await upsertResolvedWinner(winner);
      if (transaction) {
        transactions.push(transaction);
        newWinners.push(winner);
      }
    }

    if (transactions.length > 0) {
      await db.transact(transactions);
      console.log(`🏆 Recorded ${transactions.length} new winners.`);
      await recalculateScoresInstantDB(eventId);
      for (const winner of newWinners) {
        const pendingText = winner.isProvisional ? ' (pending verification)' : '';
        await sendNotification(`🏆 ${winner.winnerName} wins ${winner.categoryName}${pendingText} [${winner.resolutionReason}]`);
      }
    } else {
      console.log('ℹ️ No new winners found after processing.');
    }

  } catch (error) {
    console.error(`❌ Error scraping winners for ${eventId}:`, error);
  }
}

async function getProvisionalStatus(eventId) {
  const categoriesQuery = await db.query({
    categories: { $: { where: { event_id: eventId } } }
  });
  const categories = categoriesQuery.categories || [];
  const categoryIds = categories.map((c) => c.id);
  if (categoryIds.length === 0) {
    return { total: 0, provisional: 0, finalized: 0 };
  }

  const resultsQuery = await db.query({
    results: { $: { where: { category_id: { in: categoryIds } } } }
  });
  const results = resultsQuery.results || [];
  const provisional = results.filter((r) => !!r.is_provisional).length;
  const finalized = results.length - provisional;
  return { total: results.length, provisional, finalized };
}

async function finalizeEventResults(eventId) {
  console.log(`🔒 Finalizing provisional results for ${eventId}...`);
  const categoriesQuery = await db.query({
    categories: { $: { where: { event_id: eventId } } }
  });
  const categories = categoriesQuery.categories || [];
  const categoryIds = categories.map((c) => c.id);
  if (categoryIds.length === 0) {
    console.log(`ℹ️ No categories found for ${eventId}`);
    return;
  }

  const resultsQuery = await db.query({
    results: { $: { where: { category_id: { in: categoryIds } } } }
  });
  const results = resultsQuery.results || [];
  const provisionalResults = results.filter((r) => !!r.is_provisional);

  if (provisionalResults.length === 0) {
    console.log('ℹ️ No provisional results to finalize');
    await recalculateScoresInstantDB(eventId);
    return;
  }

  const now = Date.now();
  const txs = provisionalResults.map((result) =>
    db.tx.results[result.id].update({
      is_provisional: false,
      finalized_at: now,
      verification_note: 'Finalized via finalize-event command'
    })
  );
  await db.transact(txs);
  console.log(`✅ Finalized ${provisionalResults.length} results`);
  await recalculateScoresInstantDB(eventId);
}

async function recalculateScoresInstantDB(eventId) {
  try {
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: eventId } }
      }
    });

    const categories = categoriesQuery.categories || [];
    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length === 0) {
      console.log(`ℹ️ No categories found for event ${eventId}`);
      return;
    }

    const [resultsData, ballotsData, scoresData] = await Promise.all([
      db.query({
        results: {
          $: { where: { category_id: { in: categoryIds } } }
        }
      }),
      db.query({
        ballots: {
          $: { where: { event_id: eventId } },
          picks: {
            $: { where: { category_id: { in: categoryIds } } }
          }
        }
      }),
      db.query({
        scores: {
          $: { where: { event_id: eventId } }
        }
      })
    ]);

    const results = resultsData.results || [];
    const ballots = ballotsData.ballots || [];
    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const picks = ballots.flatMap((ballot) =>
      (ballot.picks || []).map((pick) => ({
        ...pick,
        ballot,
        category: categoryById.get(pick.category_id)
      }))
    );
    const existingScores = scoresData.scores || [];

    const winnerByCategory = new Map(
      results.map((r) => [r.category_id, r.winner_nominee_id])
    );

    const userLeaguePicks = picks.reduce((acc, pick) => {
      const winnerId = winnerByCategory.get(pick.category_id);
      if (!winnerId) return acc;

      const key = `${pick.ballot.user_id}-${pick.ballot.league_id}`;
      if (!acc[key]) {
        acc[key] = {
          userId: pick.ballot.user_id,
          leagueId: pick.ballot.league_id,
          correctPicks: 0,
          powerPicksHit: 0,
          totalPoints: 0
        };
      }

      const isCorrect = pick.nominee_id === winnerId;
      const isPowerPick = pick.is_power_pick;
      const basePoints = pick.category?.base_points || 50;

      if (isCorrect) {
        acc[key].correctPicks++;
        acc[key].totalPoints += isPowerPick ? basePoints * 3 : basePoints;
        if (isPowerPick) {
          acc[key].powerPicksHit++;
        }
      }

      return acc;
    }, {});

    const scoreTransactions = [];

    // Update scores for each user/league combination
    const seenKeys = new Set(Object.keys(userLeaguePicks));

    for (const [key, scoreData] of Object.entries(userLeaguePicks)) {
      const { userId, leagueId, correctPicks, powerPicksHit, totalPoints } = scoreData;

      // Check if score already exists
      const existingScore = existingScores.find(
        (s) => s.user_id === userId && s.league_id === leagueId
      );

      if (existingScore) {
        // Update existing score
        scoreTransactions.push(
          db.tx.scores[existingScore.id].update({
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        );
      } else {
        // Create new score
        const scoreId = id();
        scoreTransactions.push(
          db.tx.scores[scoreId].create({
            user_id: userId,
            league_id: leagueId,
            event_id: eventId,
            total_points: totalPoints,
            correct_picks: correctPicks,
            power_picks_hit: powerPicksHit,
            updated_at: Date.now()
          })
        );
      }
    }

    for (const existing of existingScores) {
      const key = `${existing.user_id}-${existing.league_id}`;
      if (!seenKeys.has(key)) {
        scoreTransactions.push(
          db.tx.scores[existing.id].update({
            total_points: 0,
            correct_picks: 0,
            power_picks_hit: 0,
            updated_at: Date.now()
          })
        );
      }
    }

    if (scoreTransactions.length > 0) {
        await db.transact(scoreTransactions);
        console.log(`✅ ${scoreTransactions.length} scores updated/created for event ${eventId}`);
    } else {
        console.log(`ℹ️ No score changes needed for event ${eventId}`);
    }
    
  } catch (error) {
    console.error(`❌ Error recalculating scores:`, error);
  }
}

async function startLiveScrapingInstantDB(eventId, intervalMinutes = 15) {
  console.log(`🏆 Starting live scoring for ${eventId} (every ${intervalMinutes} minutes)`);

  const intervalMs = intervalMinutes * 60 * 1000;
  let ceremonyActive = true;
  
  // Initial scrape
  await scrapeWinnersInstantDB(eventId);
  
  const scrapeInterval = setInterval(async () => {
    if (!ceremonyActive) return;
    
    try {
      console.log(`🔄 Checking for new winners...`);
      await scrapeWinnersInstantDB(eventId);
    } catch (error) {
      console.error(`❌ Error during scheduled scrape for ${eventId}:`, error);
    }
  }, intervalMs);
  
  // Stop after ceremony (e.g., 4 hours)
  setTimeout(() => {
    ceremonyActive = false;
    clearInterval(scrapeInterval);
    console.log(`✅ Live scoring ended for ${eventId}`);
  }, 4 * 60 * 60 * 1000);
}

// CLI commands
const command = process.argv[2];

switch (command) {
  case 'readiness-report':
    const readinessEventId = process.argv[3];
    if (!readinessEventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs readiness-report sag-2026');
      process.exit(1);
    }
    const report = await buildReadinessReport(readinessEventId);
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
    break;
  case 'finalize-event':
    const finalizeEventId = process.argv[3];
    if (!finalizeEventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs finalize-event baftas-2026');
      process.exit(1);
    }
    await finalizeEventResults(finalizeEventId);
    process.exit(0);
    break;
  case 'provisional-status':
    const statusEventId = process.argv[3];
    if (!statusEventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs provisional-status baftas-2026');
      process.exit(1);
    }
    const status = await getProvisionalStatus(statusEventId);
    console.log(`📊 ${statusEventId} -> total: ${status.total}, provisional: ${status.provisional}, finalized: ${status.finalized}`);
    process.exit(0);
    break;
  case 'scrape-once':
    const singleEventId = process.argv[3];
    if (!singleEventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs scrape-once baftas-2026');
      process.exit(1);
    }
    await scrapeWinnersInstantDB(singleEventId);
    process.exit(0);
    break;
  case 'reconcile':
    const reconcileEventId = process.argv[3];
    if (!reconcileEventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs reconcile baftas-2026');
      process.exit(1);
    }
    await scrapeWinnersInstantDB(reconcileEventId);
    await recalculateScoresInstantDB(reconcileEventId);
    process.exit(0);
    break;
  case 'live-scrape':
    const eventId = process.argv[3];
    if (!eventId) {
      console.error('❌ Please provide an event ID: node live-scraping-instant.mjs live-scrape golden-globes-2026');
      console.error('');
      console.error('Available events:');
      console.error('- golden-globes-2026');
      console.error('- oscars-2026');
      console.error('- baftas-2026');
      process.exit(1);
    }
    startLiveScrapingInstantDB(eventId);
    break;
  default:
    console.log(`
🏆 Instant DB Live Scoring Tool

Commands:
  node live-scraping-instant.mjs readiness-report [event]   - Dry-run scrape+match coverage report
  node live-scraping-instant.mjs provisional-status [event] - Show pending/finalized winner counts
  node live-scraping-instant.mjs finalize-event [event]     - Finalize provisional winners and recalculate scores
  node live-scraping-instant.mjs scrape-once [event] - Run a single winner scrape pass
  node live-scraping-instant.mjs reconcile [event]   - Re-run ingestion + score reconciliation
  node live-scraping-instant.mjs live-scrape [event]  - Start live scoring for event
  
Examples:
  node live-scraping-instant.mjs readiness-report sag-2026
  node live-scraping-instant.mjs provisional-status baftas-2026
  node live-scraping-instant.mjs finalize-event baftas-2026
  node live-scraping-instant.mjs scrape-once baftas-2026
  node live-scraping-instant.mjs reconcile baftas-2026
  node live-scraping-instant.mjs live-scrape golden-globes-2026
    `);
}
