import assert from 'assert';
import { validateInstantDBData } from '../src/utils/instantdb-validator.mjs';

function E(testName, testFn) {
  try {
    testFn();
    console.log(`✅ PASS: ${testName}`);
  } catch (error) {
    console.error(`❌ FAIL: ${testName}`);
    console.error(error);
    process.exit(1);
  }
}

async function runTest(testName, testFn) {
    console.log(`\nRunning test: ${testName}`);
    await testFn();
}


async function main() {
    await runTest('InstantDB Result schema validation - valid object', async () => {
        const validResult = {
            id: 'res1',
            category_id: 'cat1',
            winner_nominee_id: 'nom1',
            announced_at: Date.now(),
        };

        E('should validate a valid Result object', () => {
            assert.doesNotThrow(() => validateInstantDBData('results', validResult), 'Valid Result should not throw error');
        });
    });

    await runTest('InstantDB Result schema validation - invalid object (missing id)', async () => {
        const invalidResult = {
            category_id: 'cat1',
            winner_nominee_id: 'nom1',
            announced_at: Date.now(),
        };

        E('should not validate an invalid Result object (missing id)', () => {
            assert.throws(() => validateInstantDBData('results', invalidResult), Error, 'Invalid Result (missing id) should throw error');
        });
    });

    await runTest('InstantDB Result schema validation - invalid object (announced_at not a number)', async () => {
        const invalidResult = {
            id: 'res1',
            category_id: 'cat1',
            winner_nominee_id: 'nom1',
            announced_at: 'not a number',
        };

        E('should not validate an invalid Result object (announced_at not a number)', () => {
            assert.throws(() => validateInstantDBData('results', invalidResult), Error, 'Invalid Result (announced_at not a number) should throw error');
        });
    });

    await runTest('InstantDB Score schema validation - valid object', async () => {
        const validScore = {
            id: 'score1',
            user_id: 'user1',
            league_id: 'league1',
            event_id: 'event1',
            total_points: 100,
            correct_picks: 5,
            power_picks_hit: 1,
            updated_at: Date.now(),
        };

        E('should validate a valid Score object', () => {
            assert.doesNotThrow(() => validateInstantDBData('scores', validScore), 'Valid Score should not throw error');
        });
    });

    await runTest('InstantDB Score schema validation - invalid object (missing user_id)', async () => {
        const invalidScore = {
            id: 'score1',
            league_id: 'league1',
            event_id: 'event1',
            total_points: 100,
            correct_picks: 5,
            power_picks_hit: 1,
            updated_at: Date.now(),
        };

        E('should not validate an invalid Score object (missing user_id)', () => {
            assert.throws(() => validateInstantDBData('scores', invalidScore), Error, 'Invalid Score (missing user_id) should throw error');
        });
    });

    await runTest('InstantDB Score schema validation - invalid object (total_points not a number)', async () => {
        const invalidScore = {
            id: 'score1',
            user_id: 'user1',
            league_id: 'league1',
            event_id: 'event1',
            total_points: 'not a number',
            correct_picks: 5,
            power_picks_hit: 1,
            updated_at: Date.now(),
        };

        E('should not validate an invalid Score object (total_points not a number)', () => {
            assert.throws(() => validateInstantDBData('scores', invalidScore), Error, 'Invalid Score (total_points not a number) should throw error');
        });
    });
}

main();
