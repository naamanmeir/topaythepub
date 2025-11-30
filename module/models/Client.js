/**
 * Client Model
 * Represents a customer/client in the pub system
 */

class Client {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.nick = data.nick || '';
        this.account = data.account || 0;
        this.sum = data.sum || 0;
        this.lastAction = data.last_action || data.lastAction || null;
    }

    /**
     * Create Client instance from database row
     * @param {Object} dbRow - Raw database row
     * @returns {Client}
     */
    static fromDatabase(dbRow) {
        if (!dbRow) return null;
        
        return new Client({
            id: dbRow.id,
            name: dbRow.name,
            nick: dbRow.nick,
            account: dbRow.account,
            sum: dbRow.sum,
            lastAction: dbRow.last_action
        });
    }

    /**
     * Convert to JSON (for API responses)
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            nick: this.nick,
            account: this.account,
            sum: this.sum,
            lastAction: this.lastAction
        };
    }

    /**
     * Format for client login response
     * @param {string} message - Optional message to include
     * @returns {Object}
     */
    toClientResponse(message = null) {
        const response = {
            id: this.id,
            name: this.name,
            nick: this.nick,
            account: this.account
        };

        if (message) {
            response.message = message;
        }

        return response;
    }

    /**
     * Format for search results (minimal data)
     * @returns {Object}
     */
    toSearchResult() {
        return {
            id: this.id,
            name: this.name,
            nick: this.nick
        };
    }

    /**
     * Check if client has sufficient balance
     * @param {number} amount - Amount to check
     * @returns {boolean}
     */
    hasBalance(amount) {
        return this.sum >= amount;
    }

    /**
     * Validate client data
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (!this.name || this.name.length === 0) {
            errors.push('Client name is required');
        }

        if (this.name && this.name.length > 99) {
            errors.push('Client name must be less than 100 characters');
        }

        if (this.nick && this.nick.length > 40) {
            errors.push('Nick must be less than 41 characters');
        }

        if (typeof this.account !== 'number') {
            errors.push('Account must be a number');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = Client;
