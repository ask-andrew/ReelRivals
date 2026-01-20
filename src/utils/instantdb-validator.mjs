// instantdb-validator.mjs

// In a real-world scenario, you might use a library like Zod or Joi for more robust schema validation.
// For this exercise, we'll implement a basic manual validator.

/**
 * Validates data against the expected schema for InstantDB collections.
 * @param {string} collection - The name of the InstantDB collection (e.g., 'results', 'scores').
 * @param {object} data - The data object to validate.
 * @returns {boolean} - True if the data is valid, throws an error otherwise.
 */
export function validateInstantDBData(collection, data) {
    switch (collection) {
        case 'results':
            if (!data.id || typeof data.id !== 'string') {
                throw new Error('Invalid Result: id (string) is required.');
            }
            if (!data.category_id || typeof data.category_id !== 'string') {
                throw new Error('Invalid Result: category_id (string) is required.');
            }
            if (!data.winner_nominee_id || typeof data.winner_nominee_id !== 'string') {
                throw new Error('Invalid Result: winner_nominee_id (string) is required.');
            }
            if (typeof data.announced_at !== 'number') {
                throw new Error('Invalid Result: announced_at (number) is required.');
            }
            return true;
        case 'scores':
            if (!data.id || typeof data.id !== 'string') {
                throw new Error('Invalid Score: id (string) is required.');
            }
            if (!data.user_id || typeof data.user_id !== 'string') {
                throw new Error('Invalid Score: user_id (string) is required.');
            }
            if (!data.league_id || typeof data.league_id !== 'string') {
                throw new Error('Invalid Score: league_id (string) is required.');
            }
            if (!data.event_id || typeof data.event_id !== 'string') {
                throw new Error('Invalid Score: event_id (string) is required.');
            }
            if (typeof data.total_points !== 'number') {
                throw new Error('Invalid Score: total_points (number) is required.');
            }
            if (typeof data.correct_picks !== 'number') {
                throw new Error('Invalid Score: correct_picks (number) is required.');
            }
            if (typeof data.power_picks_hit !== 'number') {
                throw new Error('Invalid Score: power_picks_hit (number) is required.');
            }
            if (typeof data.updated_at !== 'number') {
                throw new Error('Invalid Score: updated_at (number) is required.');
            }
            return true;
        default:
            throw new Error(`Unknown collection for validation: ${collection}`);
    }
}
