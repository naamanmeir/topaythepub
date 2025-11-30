/**
 * User Model (System Users)
 * Represents staff/admin users who access the system
 */

class User {
    constructor(data = {}) {
        this.userId = data.userId || data.userid || null;
        this.username = data.username || data.user || '';
        this.userClass = data.userClass || data.userclass || data.class || 100;
        this.sessionId = data.sessionId || data.sessionid || null;
    }

    /**
     * Create User instance from database row
     * @param {Object} dbRow - Raw database row
     * @returns {User}
     */
    static fromDatabase(dbRow) {
        if (!dbRow) return null;
        
        return new User({
            userId: dbRow.userid,
            username: dbRow.user,
            userClass: dbRow.class
        });
    }

    /**
     * Create User from session data
     * @param {Object} sessionData - Session object
     * @returns {User}
     */
    static fromSession(sessionData) {
        if (!sessionData) return null;
        
        return new User({
            username: sessionData.userid,
            userClass: sessionData.userclass,
            sessionId: sessionData.sessionid
        });
    }

    /**
     * Convert to JSON (for API responses)
     * @returns {Object}
     */
    toJSON() {
        return {
            userId: this.userId,
            username: this.username,
            userClass: this.userClass,
            role: this.getRole()
        };
    }

    /**
     * Get user role name based on class
     * @returns {string}
     */
    getRole() {
        if (this.userClass === 0) return 'admin';
        if (this.userClass === 50) return 'manager';
        if (this.userClass === 75) return 'accountant';
        if (this.userClass === 100) return 'staff';
        if (this.userClass === 120) return 'remote';
        return 'unknown';
    }

    /**
     * Check if user has permission for a given class level
     * Lower number = higher privilege (counterintuitive!)
     * @param {number} requiredClass - Required class level
     * @returns {boolean}
     */
    hasPermission(requiredClass) {
        return this.userClass <= requiredClass;
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdmin() {
        return this.userClass === 0;
    }

    /**
     * Check if user is manager or higher
     * @returns {boolean}
     */
    isManager() {
        return this.userClass <= 50;
    }

    /**
     * Check if user is staff (can take orders)
     * @returns {boolean}
     */
    isStaff() {
        return this.userClass <= 100;
    }

    /**
     * Check if user is remote only
     * @returns {boolean}
     */
    isRemote() {
        return this.userClass === 120;
    }

    /**
     * Validate user data
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (!this.username || this.username.length === 0) {
            errors.push('Username is required');
        }

        if (this.username && !/^[a-zA-Z0-9]+$/.test(this.username)) {
            errors.push('Username must be alphanumeric');
        }

        const validClasses = [0, 50, 75, 100, 120];
        if (!validClasses.includes(this.userClass)) {
            errors.push('Invalid user class');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = User;
