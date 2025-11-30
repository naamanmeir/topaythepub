/**
 * Centralized Configuration Management
 * Single source of truth for all environment variables and app configuration
 */

require('dotenv').config();

const config = {
    app: {
        port: parseInt(process.env.APP_PORT) || 3000,
        name: process.env.APP_NAME || 'ToPayThePub',
        mode: process.env.APP_MODE || 'development',
        isProduction: process.env.APP_MODE === 'production',
        isDevelopment: process.env.APP_MODE === 'development'
    },

    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DB,
        connectionLimit: 25,
        tables: {
            clients: process.env.DB_TABLE_CLIENTS || 'clients',
            orders: process.env.DB_TABLE_ORDERS || 'orders',
            products: process.env.DB_TABLE_PRODUCTS || 'products',
            users: process.env.DB_TABLE_USERS || 'users',
            sessions: process.env.DB_TABLE_SESSIONS || 'sessions',
            tokens: process.env.DB_TABLE_TOKENS || 'tokens',
            posts: process.env.DB_TABLE_POSTS || 'posts',
            facts: process.env.DB_TABLE_FACTS || 'facts'
        }
    },

    session: {
        name: process.env.SESSION_NAME || 'sessionId',
        secret: process.env.ACCESS_TOKEN_SECRET,
        cookieExpiration: parseInt(process.env.COOKIE_EXPIRATION) || 86400000, // 24 hours
        jwtExpiration: '30m'
    },

    security: {
        bcryptRounds: 10,
        rateLimitWindow: 15 * 1000, // 15 seconds
        rateLimitMax: 1000
    },

    external: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-3.5-turbo',
            maxTokens: 6000
        },
        huggingface: {
            apiKey: process.env.HUGGINGFACE_CIRCULUS
        }
    },

    defaults: {
        admin: {
            username: process.env.DEFAULTADMIN || 'admin',
            password: process.env.DEFAULTADMINPASS || 'changeme',
            class: 0
        }
    },

    remote: {
        boardAddress: process.env.addressRemoteBoard || 'https://yourdomain.com/remoteBoard',
        appAddress: process.env.addressRemoteApp || 'https://yourdomain.com/app'
    },

    /**
     * Validate required configuration on startup
     * Throws error if critical config is missing
     */
    validate() {
        const required = [
            { path: 'database.host', name: 'DB_HOST' },
            { path: 'database.user', name: 'DB_USER' },
            { path: 'database.password', name: 'DB_PASSWORD' },
            { path: 'database.database', name: 'DB_DB' },
            { path: 'session.secret', name: 'ACCESS_TOKEN_SECRET' }
        ];

        const missing = required.filter(({ path }) => {
            const value = path.split('.').reduce((obj, k) => obj?.[k], this);
            return !value;
        });

        if (missing.length > 0) {
            const missingNames = missing.map(m => m.name).join(', ');
            throw new Error(
                `Missing required environment variables: ${missingNames}\n` +
                `Please check your .env file and ensure these variables are set.`
            );
        }

        return true;
    }
};

// Validate configuration on module load
config.validate();

module.exports = config;
