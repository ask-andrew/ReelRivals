import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { loadSourceConfigs } from '../src/utils/config-loader.mjs';
import { validateSourceConfig } from '../src/utils/source-config-validator.mjs'; // Import the real validator


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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, 'temp');

async function createTempFile(fileName, content) {
    await fs.mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
}

async function cleanupTempDir() {
    await fs.rm(tempDir, { recursive: true, force: true });
}

async function main() {
    // Cleanup before running tests
    await cleanupTempDir();

    // Mock valid config content
    const validConfigContent = JSON.stringify([
        {
            id: 'valid-source-1',
            name: 'Valid Source 1',
            url: 'https://example.com/valid1',
            selectors: { winnerCard: '.card', categoryName: '.category' },
            reliabilityScore: 80,
            updateFrequency: 60000,
            enabled: true,
            eventId: 'event-id-1'
        },
        {
            id: 'valid-source-2',
            name: 'Valid Source 2',
            url: 'https://example.com/valid2',
            selectors: { winnerCard: '.card', categoryName: '.category' },
            reliabilityScore: 90,
            updateFrequency: 30000,
            enabled: true,
            eventId: 'event-id-2'
        }
    ]);

    // Mock invalid config content (missing URL)
    const invalidConfigContent = JSON.stringify([
        {
            id: 'invalid-source', // This will trigger mock validation error
            name: 'Invalid Source',
            selectors: { winnerCard: '.card' },
            reliabilityScore: 70,
            updateFrequency: 60000,
            enabled: true,
            eventId: 'event-id-3'
        }
    ]);

    await runTest('Configuration loader - valid file', async () => {
        const filePath = await createTempFile('valid-sources.json', validConfigContent);
        const configs = await loadSourceConfigs(filePath);

        E('should return an array of validated configs', () => {
            assert.ok(Array.isArray(configs), 'Should return an array');
            assert.strictEqual(configs.length, 2, 'Should contain 2 configs');
        });
    });

    await runTest('Configuration loader - invalid file (validation error)', async () => {
        // This config will have a missing 'url', which the real validateSourceConfig will catch.
        const invalidConfigContentReal = JSON.stringify([
            {
                id: 'invalid-source-real',
                name: 'Invalid Source Real',
                selectors: { winnerCard: '.card' },
                reliabilityScore: 70,
                updateFrequency: 60000,
                enabled: true,
                eventId: 'event-id-3'
            }
        ]);
        const filePath = await createTempFile('invalid-sources-real.json', invalidConfigContentReal);
        let caughtError = false;
        try {
            await loadSourceConfigs(filePath);
        } catch (error) {
            caughtError = true;
            E('should throw validation error', () => {
                assert.ok(error.message.includes('Validation failed for a source configuration'), 'Should contain validation error message');
            });
        }
        E('should have caught an error', () => {
            assert.ok(caughtError, 'An error should have been caught');
        });
    });

    await runTest('Configuration loader - non-existent file', async () => {
        const nonExistentFilePath = path.join(tempDir, 'non-existent.json');
        let caughtError = false;
        try {
            await loadSourceConfigs(nonExistentFilePath);
        } catch (error) {
            caughtError = true;
            E('should throw file not found error', () => {
                assert.ok(error.message.includes('Configuration file not found'), 'Should contain file not found error message');
            });
        }
        E('should have caught an error', () => {
            assert.ok(caughtError, 'An error should have been caught');
        });
    });

    // Cleanup after running tests
    await cleanupTempDir();
}

main();
