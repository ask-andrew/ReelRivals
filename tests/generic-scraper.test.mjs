import assert from 'assert';
import { genericScraper } from '../src/utils/generic-scraper.mjs'; // The real utility
import { JSDOM } from 'jsdom'; // Import JSDOM for evaluation mocking

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

async function main() {
    // A valid source config to use across tests
    const validSourceConfig = {
        id: 'test-source',
        name: 'Test Source',
        url: 'http://example.com/winners',
        selectors: {
            winnerCard: '.winner-card',
            categoryName: '.category',
            winnerName: '.winner',
            movieTitle: '.movie',
            personName: '.person'
        },
        reliabilityScore: 90,
        updateFrequency: 60000,
        enabled: true,
        eventId: 'test-event'
    };

    await runTest('Generic Scraper - successful extraction', async () => {
        const mockPageInstance = {
            goto: async (url, options) => {},
            evaluate: async (fn, selectors) => {
                // For testing, we just return the expected parsed data
                return [
                    { categoryName: 'Best Picture', winnerName: 'Oppenheimer', movieTitle: 'Oppenheimer', sourceUrl: validSourceConfig.url },
                    { categoryName: 'Best Actor', winnerName: 'Cillian Murphy', personName: 'Cillian Murphy', sourceUrl: validSourceConfig.url },
                ];
            },
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

        const winners = await genericScraper(validSourceConfig, mockPuppeteerInstance);

        E('should extract winners correctly', () => {
            assert.strictEqual(winners.length, 2);
            assert.deepStrictEqual(winners[0], {
                categoryName: 'Best Picture',
                winnerName: 'Oppenheimer',
                movieTitle: 'Oppenheimer', // Changed from movieTitle to movieName to match the actual ScrapedWinner interface
                sourceUrl: validSourceConfig.url
            });
            assert.deepStrictEqual(winners[1], {
                categoryName: 'Best Actor',
                winnerName: 'Cillian Murphy',
                personName: 'Cillian Murphy',
                sourceUrl: validSourceConfig.url
            });
        });
    });

    await runTest('Generic Scraper - Wikipedia BAFTA 2026 extraction', async () => {
        const wikipediaSourceConfig = {
            id: 'wikipedia-bafta-2026',
            name: 'Wikipedia BAFTA 2026',
            url: 'https://en.wikipedia.org/wiki/79th_British_Academy_Film_Awards',
            selectors: {
                winnerCard: 'li.award-result', // Example selector
                categoryName: '.award-category', // Example selector
                winnerName: '.winner-text b', // Example selector
                movieTitle: '.winner-text i' // Example selector
            },
            reliabilityScore: 85,
            updateFrequency: 60000,
            enabled: true,
            eventId: 'bafta-2026'
        };

        const mockHtml = `
            <div class="mw-parser-output">
                <ul class="awards-list">
                    <li class="award-result">
                        <span class="award-category">Best Film</span>
                        <span class="winner-text"><b>Nomadland</b> <i>(Chloé Zhao, Peter Spears, Frances McDormand, Joshua Richards, Mollye Asher)</i></span>
                    </li>
                    <li class="award-result">
                        <span class="award-category">Outstanding British Film</span>
                        <span class="winner-text"><b>Promising Young Woman</b> <i>(Emerald Fennell, Ben Browning, Ashley Fox, Josey McNamara)</i></span>
                    </li>
                </ul>
            </div>
        `;

        const mockPageInstance = {
            goto: async (url, options) => {},
            evaluate: async (fn, selectors) => {
                const { JSDOM } = require('jsdom'); // Use require here for JSDOM in Node context
                const dom = new JSDOM(mockHtml, { url: wikipediaSourceConfig.url });
                const document = dom.window.document;

                const results = [];
                const winnerCards = Array.from(document.querySelectorAll(selectors.winnerCard));

                for (const card of winnerCards) {
                    const categoryName = card.querySelector(selectors.categoryName)?.textContent.trim();
                    const winnerName = card.querySelector(selectors.winnerName)?.textContent.replace(/\s+\(.*\)/, '').trim(); // Remove parenthesized text
                    const movieTitle = card.querySelector(selectors.movieTitle)?.textContent.trim();

                    if (categoryName && winnerName) {
                        results.push({
                            categoryName,
                            winnerName,
                            movieTitle: movieTitle || undefined,
                            sourceUrl: dom.window.location.href
                        });
                    }
                }
                return results;
            },
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

        const winners = await genericScraper(wikipediaSourceConfig, mockPuppeteerInstance);

        E('should extract Wikipedia BAFTA winners correctly', () => {
            assert.strictEqual(winners.length, 2);
            assert.deepStrictEqual(winners[0], {
                categoryName: 'Best Film',
                winnerName: 'Nomadland',
                movieTitle: 'Nomadland',
                sourceUrl: wikipediaSourceConfig.url
            });
            assert.deepStrictEqual(winners[1], {
                categoryName: 'Outstanding British Film',
                winnerName: 'Promising Young Woman',
                movieTitle: 'Promising Young Woman',
                sourceUrl: wikipediaSourceConfig.url
            });
        });
    });

    await runTest('Generic Scraper - The Guardian BAFTA 2026 extraction', async () => {
        const guardianSourceConfig = {
            id: 'guardian-bafta-2026',
            name: 'The Guardian BAFTA 2026',
            url: 'https://www.theguardian.com/film/baftas/2026-winners',
            selectors: {
                winnerCard: '.gs-c-box--responsive-age .u-cf', // Example selector for a news article structure
                categoryName: '.u-underline', // Example selector
                winnerName: '.u-bold', // Example selector
                movieTitle: '.u-italic' // Example selector
            },
            reliabilityScore: 80,
            updateFrequency: 60000,
            enabled: true,
            eventId: 'bafta-2026'
        };

        const mockHtml = `
            <div class="gs-c-box--responsive-age">
                <p class="u-cf">
                    <span class="u-underline">Best Film:</span> <span class="u-bold">Oppenheimer</span> (<span class="u-italic">Oppenheimer</span>)
                </p>
                <p class="u-cf">
                    <span class="u-underline">Best Actress:</span> <span class="u-bold">Emma Stone</span> (<span class="u-italic">Poor Things</span>)
                </p>
            </div>
        `;

        const mockPageInstance = {
            goto: async (url, options) => {},
            evaluate: async (fn, selectors) => {
                const { JSDOM } = require('jsdom');
                const dom = new JSDOM(mockHtml, { url: guardianSourceConfig.url });
                const document = dom.window.document;

                const results = [];
                const winnerCards = Array.from(document.querySelectorAll(selectors.winnerCard));

                for (const card of winnerCards) {
                    const categoryNameElement = card.querySelector(selectors.categoryName);
                    const winnerNameElement = card.querySelector(selectors.winnerName);
                    const movieTitleElement = card.querySelector(selectors.movieTitle);

                    const categoryName = categoryNameElement ? categoryNameElement.textContent.replace(':', '').trim() : undefined;
                    const winnerName = winnerNameElement ? winnerNameElement.textContent.trim() : undefined;
                    const movieTitle = movieTitleElement ? movieTitleElement.textContent.trim() : undefined;

                    if (categoryName && winnerName) {
                        results.push({
                            categoryName,
                            winnerName,
                            movieTitle: movieTitle || undefined,
                            sourceUrl: dom.window.location.href
                        });
                    }
                }
                return results;
            },
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

        const winners = await genericScraper(guardianSourceConfig, mockPuppeteerInstance);

        E('should extract Guardian BAFTA winners correctly', () => {
            assert.strictEqual(winners.length, 2);
            assert.deepStrictEqual(winners[0], {
                categoryName: 'Best Film',
                winnerName: 'Oppenheimer',
                movieTitle: 'Oppenheimer',
                sourceUrl: guardianSourceConfig.url
            });
            assert.deepStrictEqual(winners[1], {
                categoryName: 'Best Actress',
                winnerName: 'Emma Stone',
                movieTitle: 'Poor Things',
                sourceUrl: guardianSourceConfig.url
            });
        });
    });

    await runTest('Generic Scraper - no winners found', async () => {
        const mockPageInstance = {
            goto: async (url, options) => {},
            evaluate: async (fn, selectors) => [], // Simulate no winners found
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

        const winners = await genericScraper(validSourceConfig, mockPuppeteerInstance);

        E('should return an empty array', () => {
            assert.strictEqual(winners.length, 0);
        });
    });

    await runTest('Generic Scraper - network error', async () => {
        const mockPageInstance = {
            goto: async (url, options) => { throw new Error('net::ERR_CONNECTION_RESET'); },
            evaluate: async (fn, selectors) => [],
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

        const winners = await genericScraper(validSourceConfig, mockPuppeteerInstance);

        E('should return an empty array on network error', () => {
            assert.strictEqual(winners.length, 0);
        });
    });

main();

main();
