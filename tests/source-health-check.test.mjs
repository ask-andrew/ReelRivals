import assert from 'assert';
import { checkSourceHealth } from '../src/utils/source-health-checker.mjs'; // The real utility

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
    console.log(`
Running test: ${testName}`);
    await testFn();
}

// A valid source config to use across tests
const validSourceConfig = {
    id: 'test-source',
    name: 'Test Source',
    url: 'http://example.com',
    selectors: {
        winnerCard: '.winner',
        categoryName: '.category',
        winnerName: '.name'
    },
    reliabilityScore: 90,
    updateFrequency: 60000,
    enabled: true,
    eventId: 'test-event'
};

async function main() {
    // A valid source config to use across tests
    const validSourceConfig = {
        id: 'test-source',
        name: 'Test Source',
        url: 'http://example.com',
        selectors: {
            winnerCard: '.winner',
            categoryName: '.category',
            winnerName: '.name'
        },
        reliabilityScore: 90,
        updateFrequency: 60000,
        enabled: true,
        eventId: 'test-event'
    };

    await runTest('Health check - successful', async () => {
        const mockPageInstance = {
            goto: async (url, options) => {},
            evaluate: async (fn, selectors) => ({ winnerCard: true }),
            close: async () => {},
            setDefaultNavigationTimeout: (timeout) => {}
        };
        const mockBrowserInstance = {
            newPage: async () => mockPageInstance,
            close: async () => {}
        };
        const mockPuppeteerInstance = {
            launch: async (options) => mockBrowserInstance
        };

        const result = await checkSourceHealth(validSourceConfig, mockPuppeteerInstance);

        E('should return a healthy status', () => {
            assert.strictEqual(result.isHealthy, true);
            assert.strictEqual(result.status, 'OK');
        });
    });

    await runTest('Health check - URL not accessible', async () => {
        const mockPageInstance = {
            goto: async (url, options) => { throw new Error('net::ERR_BLOCKED_BY_CLIENT'); },
            evaluate: async (fn, selectors) => ({ winnerCard: true }),
            close: async () => {},
            setDefaultNavigationTimeout: (timeout) => {}
        };
        const mockBrowserInstance = {
            newPage: async () => mockPageInstance,
            close: async () => {}
        };
        const mockPuppeteerInstance = {
            launch: async (options) => mockBrowserInstance
        };
        
        const result = await checkSourceHealth(validSourceConfig, mockPuppeteerInstance);

        E('should return URL_NOT_ACCESSIBLE status', () => {
            assert.strictEqual(result.isHealthy, false);
            assert.strictEqual(result.status, 'URL_NOT_ACCESSIBLE');
        });
    });

    await runTest('Health check - HTML structure changed', async () => {
        const mockPageInstance = {
            goto: async (url, options) => {},
            evaluate: async (fn, selectors) => ({ winnerCard: false }), // Selector not found
            close: async () => {},
            setDefaultNavigationTimeout: (timeout) => {}
        };
        const mockBrowserInstance = {
            newPage: async () => mockPageInstance,
            close: async () => {}
        };
        const mockPuppeteerInstance = {
            launch: async (options) => mockBrowserInstance
        };
        
        const result = await checkSourceHealth(validSourceConfig, mockPuppeteerInstance);

        E('should return HTML_STRUCTURE_CHANGED status', () => {
            assert.strictEqual(result.isHealthy, false);
            assert.strictEqual(result.status, 'HTML_STRUCTURE_CHANGED');
        });
    });

    await runTest('Health check - unknown error', async () => {
        const mockPageInstance = {
            goto: async (url, options) => {},
            evaluate: async (fn, selectors) => { throw new Error('Some other unexpected error'); },
            close: async () => {},
            setDefaultNavigationTimeout: (timeout) => {}
        };
        const mockBrowserInstance = {
            newPage: async () => mockPageInstance,
            close: async () => {}
        };
        const mockPuppeteerInstance = {
            launch: async (options) => mockBrowserInstance
        };
        
        const result = await checkSourceHealth(validSourceConfig, mockPuppeteerInstance);

        E('should return UNKNOWN_ERROR status', () => {
            assert.strictEqual(result.isHealthy, false);
            assert.strictEqual(result.status, 'UNKNOWN_ERROR');
        });
    });
}

main();