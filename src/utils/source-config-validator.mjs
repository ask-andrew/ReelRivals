// src/utils/source-config-validator.mjs

/**
 * Validates a SourceConfig object against the expected schema.
 * @param {object} config - The SourceConfig object to validate.
 * @returns {boolean} - True if the config is valid, throws an error otherwise.
 */
export function validateSourceConfig(config) {
    if (!config) {
        throw new Error('SourceConfig cannot be null or undefined.');
    }
    if (typeof config.id !== 'string' || config.id.trim() === '') {
        throw new Error('SourceConfig: id (string) is required.');
    }
    if (typeof config.name !== 'string' || config.name.trim() === '') {
        throw new Error('SourceConfig: name (string) is required.');
    }
    if (typeof config.url !== 'string' || !/^(ftp|http|https):\/\/[^ "]+$/.test(config.url)) {
        throw new Error('SourceConfig: url (valid string URL) is required.');
    }
    if (typeof config.reliabilityScore !== 'number' || config.reliabilityScore < 0 || config.reliabilityScore > 100) {
        throw new Error('SourceConfig: reliabilityScore (number between 0-100) is required.');
    }
    if (typeof config.updateFrequency !== 'number' || config.updateFrequency <= 0) {
        throw new Error('SourceConfig: updateFrequency (number > 0) is required.');
    }
    if (typeof config.enabled !== 'boolean') {
        throw new Error('SourceConfig: enabled (boolean) is required.');
    }
    if (typeof config.eventId !== 'string' || config.eventId.trim() === '') {
        throw new Error('SourceConfig: eventId (string) is required.');
    }

    // Validate selectors
    if (!config.selectors || typeof config.selectors !== 'object') {
        throw new Error('SourceConfig: selectors (object) is required.');
    }
    if (typeof config.selectors.winnerCard !== 'string' || config.selectors.winnerCard.trim() === '') {
        throw new Error('SourceConfig.selectors: winnerCard (string) is required.');
    }
    if (typeof config.selectors.categoryName !== 'string' || config.selectors.categoryName.trim() === '') {
        throw new Error('SourceConfig.selectors: categoryName (string) is required.');
    }
    // movieTitle and personName are optional, so we only check if they exist
    if (config.selectors.movieTitle !== undefined && typeof config.selectors.movieTitle !== 'string') {
        throw new Error('SourceConfig.selectors: movieTitle must be a string if provided.');
    }
    if (config.selectors.personName !== undefined && typeof config.selectors.personName !== 'string') {
        throw new Error('SourceConfig.selectors: personName must be a string if provided.');
    }

    return true;
}
