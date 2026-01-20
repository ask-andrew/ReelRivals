import assert from 'assert';
import { sendNotification, extractWinnersFromPage } from './scraping-utils.mjs';

// Mock fetch
let fetchCalls = [];
global.fetch = async (url, options) => {
  fetchCalls.push({ url, options });
  return { ok: true };
};

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
    /*
    await runTest('sendNotification should send a notification to Slack and Discord', async () => {
        // Setup
        fetchCalls = [];
        process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00000000/B00000000/PLACEHOLDER_SLACK_TOKEN';
        process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/000000000000000000/PLACEHOLDER_DISCORD_TOKEN';
        const message = 'Test notification';

        // Execute
        await sendNotification(message);

        // Assert
        E('should make two fetch calls', () => {
            assert.strictEqual(fetchCalls.length, 2, 'Expected two fetch calls');
        });
        
        E('should call the Slack webhook URL', () => {
            assert.strictEqual(fetchCalls[0].url, process.env.SLACK_WEBHOOK_URL);
        });

        E('should send the correct payload to Slack', () => {
            const body = JSON.parse(fetchCalls[0].options.body);
            assert.strictEqual(body.text, message);
        });

        E('should call the Discord webhook URL', () => {
            assert.strictEqual(fetchCalls[1].url, process.env.DISCORD_WEBHOOK_URL);
        });
        
        E('should send the correct payload to Discord', () => {
            const body = JSON.parse(fetchCalls[1].options.body);
            assert.strictEqual(body.content, message);
        });

        // Teardown
        delete process.env.SLACK_WEBHOOK_URL;
        delete process.env.DISCORD_WEBHOOK_URL;
    });
    */

    await runTest('sendNotification should not fail if webhooks are not configured', async () => {
        // Setup
        fetchCalls = [];
        const message = 'Test notification without webhooks';

        // Execute
        await sendNotification(message);

        // Assert
        E('should not make any fetch calls', () => {
            assert.strictEqual(fetchCalls.length, 0, 'Expected no fetch calls');
        });
    });

    await runTest('extractWinnersFromPage should be performant', () => {
        // Setup
        const mockDocument = {
            querySelectorAll: (selector) => {
                if (selector.includes('.winner-card')) {
                    return Array.from({ length: 1000 }).map((_, i) => ({
                        querySelector: (innerSelector) => {
                            if (innerSelector.includes('.category-name')) return { textContent: `Category ${i}` };
                            if (innerSelector.includes('.winner-name')) return { textContent: `Winner ${i}` };
                            if (innerSelector.includes('.movie-title')) return { textContent: `Movie ${i}` };
                            return { textContent: '' };
                        }
                    }));
                }
                return [];
            }
        };

        // Execute
        const startTime = performance.now();
        const winners = extractWinnersFromPage(mockDocument);
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        console.log(`Execution time: ${executionTime}ms`);

        // Assert
        E('should parse all winners', () => {
            assert.strictEqual(winners.length, 1000);
        });

        E('should be performant', () => {
            assert.ok(executionTime < 50, 'Execution time should be less than 50ms');
        });
    });
}

main();