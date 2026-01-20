// src/utils/generic-scraper.mjs
import puppeteer from 'puppeteer';
// Assuming SourceConfig and ScrapedWinner types are available globally or imported
// import { SourceConfig, ScrapedWinner } from '../../types.ts'; // Adjust path as needed

/**
 * A generic scraping utility to extract winner data from a given source configuration.
 * @param {SourceConfig} sourceConfig - The configuration for the source to scrape.
 * @param {object} [puppeteerInstance=defaultPuppeteer] - The puppeteer instance to use (for testing or re-use).
 * @returns {Promise<ScrapedWinner[]>} - A promise that resolves with an array of ScrapedWinner objects.
 */
export async function genericScraper(sourceConfig, puppeteerInstance = puppeteer) {
    let browser;
    let page;
    const scrapedWinners = [];

    try {
        browser = await puppeteerInstance.launch({ headless: 'new' });
        page = await browser.newPage();
        page.setDefaultNavigationTimeout(sourceConfig.updateFrequency); // Use update frequency as timeout

        await page.goto(sourceConfig.url, { waitUntil: 'domcontentloaded' });

        const winnersData = await page.evaluate((selectors, currentUrl) => {
            const results = [];
            const winnerCards = Array.from(document.querySelectorAll(selectors.winnerCard));

            for (const card of winnerCards) {
                const categoryName = card.querySelector(selectors.categoryName)?.textContent.trim();
                const winnerName = card.querySelector(selectors.winnerName)?.textContent.trim();
                const movieTitle = card.querySelector(selectors.movieTitle)?.textContent.trim();
                const personName = card.querySelector(selectors.personName)?.textContent.trim();

                if (categoryName && winnerName) {
                    results.push({
                        categoryName,
                        winnerName,
                        movieTitle: movieTitle || undefined,
                        personName: personName || undefined,
                        sourceUrl: currentUrl
                    });
                }
            }
            return results;
        }, sourceConfig.selectors, sourceConfig.url); // Pass selectors and currentUrl to browser context
        
        scrapedWinners.push(...winnersData);

    } catch (error) {
        console.error(`Error scraping ${sourceConfig.name} (${sourceConfig.url}):`, error);
        return []; // Return empty array on error
    } finally {
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }
    return scrapedWinners;
}
