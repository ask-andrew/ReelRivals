// src/utils/config-loader.mjs
import fs from 'fs/promises';
import { validateSourceConfig } from './source-config-validator.mjs'; // Re-using our validator

/**
 * Loads and validates an array of SourceConfig objects from a JSON file.
 * @param {string} filePath - The path to the JSON configuration file.
 * @returns {Promise<Array<SourceConfig>>} - A promise that resolves with an array of validated SourceConfig objects.
 * @throws {Error} - Throws an error if the file cannot be read, parsed, or if validation fails.
 */
export async function loadSourceConfigs(filePath) {
    let fileContent;
    try {
        fileContent = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Configuration file not found: ${filePath}`);
        }
        throw new Error(`Failed to read configuration file ${filePath}: ${error.message}`);
    }

    let configs;
    try {
        configs = JSON.parse(fileContent);
    } catch (error) {
        throw new Error(`Failed to parse configuration file ${filePath} as JSON: ${error.message}`);
    }

    if (!Array.isArray(configs)) {
        throw new Error('Configuration file must contain an array of source configs.');
    }

    const validatedConfigs = [];
    for (const config of configs) {
        try {
            validateSourceConfig(config); // Use the actual validator
            validatedConfigs.push(config);
        } catch (validationError) {
            throw new Error(`Validation failed for a source configuration in ${filePath}: ${validationError.message}`);
        }
    }
    return validatedConfigs;
}
