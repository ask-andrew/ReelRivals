import assert from 'assert';
import { validateSourceConfig } from '../src/utils/source-config-validator.mjs';

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
    await runTest('SourceConfig validation - valid object', async () => {
        const validConfig = {
            id: 'bafta-official',
            name: 'BAFTA Official Site',
            url: 'https://www.bafta.org/film/awards/winners',
            selectors: {
                winnerCard: '.winner-item',
                categoryName: '.category-title',
                winnerName: '.winner-name',
                movieTitle: '.film-title'
            },
            reliabilityScore: 95,
            updateFrequency: 30000, // 30 seconds
            enabled: true,
            eventId: 'bafta-2026'
        };

        E('should validate a valid SourceConfig object', () => {
            assert.doesNotThrow(() => validateSourceConfig(validConfig), 'Valid SourceConfig should not throw error');
        });
    });

    await runTest('SourceConfig validation - missing id', async () => {
        const invalidConfig = {
            name: 'BAFTA Official Site',
            url: 'https://www.bafta.org/film/awards/winners',
            selectors: {
                winnerCard: '.winner-item',
                categoryName: '.category-title',
                winnerName: '.winner-name',
            },
            reliabilityScore: 95,
            updateFrequency: 30000,
            enabled: true,
            eventId: 'bafta-2026'
        };

        E('should not validate SourceConfig with missing id', () => {
            assert.throws(() => validateSourceConfig(invalidConfig), Error, 'Missing id should throw error');
        });
    });

    await runTest('SourceConfig validation - invalid url', async () => {
        const invalidConfig = {
            id: 'bafta-official',
            name: 'BAFTA Official Site',
            url: 'invalid-url', // Invalid URL
            selectors: {
                winnerCard: '.winner-item',
                categoryName: '.category-title',
                winnerName: '.winner-name',
            },
            reliabilityScore: 95,
            updateFrequency: 30000,
            enabled: true,
            eventId: 'bafta-2026'
        };

        E('should not validate SourceConfig with invalid url', () => {
            assert.throws(() => validateSourceConfig(invalidConfig), Error, 'Invalid URL should throw error');
        });
    });

    await runTest('SourceConfig validation - missing selectors', async () => {
        const invalidConfig = {
            id: 'bafta-official',
            name: 'BAFTA Official Site',
            url: 'https://www.bafta.org/film/awards/winners',
            reliabilityScore: 95,
            updateFrequency: 30000,
            enabled: true,
            eventId: 'bafta-2026'
        };

        E('should not validate SourceConfig with missing selectors', () => {
            assert.throws(() => validateSourceConfig(invalidConfig), Error, 'Missing selectors should throw error');
        });
    });

    await runTest('SourceConfig validation - missing winnerCard selector', async () => {
        const invalidConfig = {
            id: 'bafta-official',
            name: 'BAFTA Official Site',
            url: 'https://www.bafta.org/film/awards/winners',
            selectors: {
                categoryName: '.category-title',
                winnerName: '.winner-name',
            },
            reliabilityScore: 95,
            updateFrequency: 30000,
            enabled: true,
            eventId: 'bafta-2026'
        };

        E('should not validate SourceConfig with missing winnerCard selector', () => {
            assert.throws(() => validateSourceConfig(invalidConfig), Error, 'Missing winnerCard selector should throw error');
        });
    });

    await runTest('SourceConfig validation - reliabilityScore out of range', async () => {
        const invalidConfig = {
            id: 'bafta-official',
            name: 'BAFTA Official Site',
            url: 'https://www.bafta.org/film/awards/winners',
            selectors: {
                winnerCard: '.winner-item',
                categoryName: '.category-title',
                winnerName: '.winner-name',
            },
            reliabilityScore: 101, // Out of range
            updateFrequency: 30000,
            enabled: true,
            eventId: 'bafta-2026'
        };

        E('should not validate SourceConfig with reliabilityScore out of range', () => {
            assert.throws(() => validateSourceConfig(invalidConfig), Error, 'Reliability score out of range should throw error');
        });
    });

    await runTest('SourceConfig validation - updateFrequency non-positive', async () => {
        const invalidConfig = {
            id: 'bafta-official',
            name: 'BAFTA Official Site',
            url: 'https://www.bafta.org/film/awards/winners',
            selectors: {
                winnerCard: '.winner-item',
                categoryName: '.category-title',
                winnerName: '.winner-name',
            },
            reliabilityScore: 95,
            updateFrequency: 0, // Non-positive
            enabled: true,
            eventId: 'bafta-2026'
        };

        E('should not validate SourceConfig with non-positive updateFrequency', () => {
            assert.throws(() => validateSourceConfig(invalidConfig), Error, 'Non-positive updateFrequency should throw error');
        });
    });
}

main();
