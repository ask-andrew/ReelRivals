// src/utils/source-health-checker.mjs
import defaultPuppeteer from 'puppeteer';
// Assuming SourceConfig and HealthCheckResult types are available globally or imported
// import { SourceConfig, HealthCheckResult } from '../../types.ts'; // Adjust path as needed

/**
 * Checks the health of a single scraping source.
 * @param {SourceConfig} sourceConfig - The configuration for the source to check.
 * @param {object} [puppeteer=defaultPuppeteer] - The puppeteer instance to use (for testing).
 * @returns {Promise<HealthCheckResult>} - A promise that resolves with the health check result.
 */
export async function checkSourceHealth(sourceConfig, puppeteer = defaultPuppeteer) {
    let browser;
    let page;
    try {
        browser = await puppeteer.launch({ headless: 'new' });
        page = await browser.newPage();
        page.setDefaultNavigationTimeout(30000); // 30 seconds timeout

        await page.goto(sourceConfig.url, { waitUntil: 'domcontentloaded' });

        const selectorsFound = await page.evaluate((selectors) => {
            const results = {};
            // Check for the main winnerCard selector
            results.winnerCard = document.querySelector(selectors.winnerCard) !== null;
            // Potentially add checks for other critical selectors here
            return results;
        }, sourceConfig.selectors);
        console.log('Selectors found:', selectorsFound); // DEBUG LOG

        if (selectorsFound.winnerCard) {
            return {
                sourceId: sourceConfig.id,
                timestamp: Date.now(),
                isHealthy: true,
                status: 'OK'
            };
        } else {
            return {
                sourceId: sourceConfig.id,
                timestamp: Date.now(),
                isHealthy: false,
                status: 'HTML_STRUCTURE_CHANGED',
                details: `Could not find main winnerCard selector: ${sourceConfig.selectors.winnerCard}`
            };
        }
    } catch (error) {
        // Puppeteer navigation errors, network issues, etc.
        if (error.message.includes('net::ERR_') || error.message.includes('TimeoutError') || error.message.includes('404')) {
            return {
                sourceId: sourceConfig.id,
                timestamp: Date.now(),
                isHealthy: false,
                status: 'URL_NOT_ACCESSIBLE',
                details: error.message
            };
        }
        return {
            sourceId: sourceConfig.id,
            timestamp: Date.now(),
            isHealthy: false,
            status: 'UNKNOWN_ERROR',
            details: error.message
        };
    } finally {
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }
}
