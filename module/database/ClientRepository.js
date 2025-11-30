/**
 * Client Repository
 * Handles all database operations for clients using parameterized queries
 */

const Client = require('../models/Client');
const config = require('../../config');

class ClientRepository {
    constructor(pool) {
        this.pool = pool;
        this.tableName = config.database.tables.clients;
        this.ordersTable = config.database.tables.orders;
    }

    /**
     * Find client by ID
     * @param {number} id - Client ID
     * @returns {Client|null}
     */
    async findById(id) {
        const sql = `SELECT * FROM ?? WHERE id = ?`;
        const results = await this.pool.query(sql, [this.tableName, id]);
        return results.length > 0 ? Client.fromDatabase(results[0]) : null;
    }

    /**
     * Find clients by nickname (partial match)
     * @param {string} nick - Nickname to search for
     * @returns {Array<Client>}
     */
    async findByNick(nick) {
        const sql = `SELECT * FROM ?? WHERE nick LIKE ? ORDER BY name`;
        const results = await this.pool.query(sql, [this.tableName, `%${nick}%`]);
        return results.map(row => Client.fromDatabase(row));
    }

    /**
     * Find clients by nickname (exact match)
     * @param {string} nick - Exact nickname
     * @returns {Array<Client>}
     */
    async findByNickExact(nick) {
        const sql = `SELECT * FROM ?? WHERE nick = ? ORDER BY name`;
        const results = await this.pool.query(sql, [this.tableName, nick]);
        return results.map(row => Client.fromDatabase(row));
    }

    /**
     * Find clients by name (partial match)
     * @param {string} name - Name to search for
     * @returns {Array<Client>}
     */
    async findByName(name) {
        const sql = `SELECT * FROM ?? WHERE name LIKE ? ORDER BY name`;
        const results = await this.pool.query(sql, [this.tableName, `%${name}%`]);
        return results.map(row => Client.fromDatabase(row));
    }

    /**
     * Get all clients
     * @returns {Array<Client>}
     */
    async findAll() {
        const sql = `SELECT * FROM ?? ORDER BY name`;
        const results = await this.pool.query(sql, [this.tableName]);
        return results.map(row => Client.fromDatabase(row));
    }

    /**
     * Create new client
     * @param {Object} clientData - Client data {name, nick, account}
     * @returns {number} - Inserted client ID
     */
    async create(clientData) {
        const sql = `INSERT INTO ?? (name, nick, account) VALUES (?, ?, ?)`;
        const result = await this.pool.query(sql, [
            this.tableName,
            clientData.name,
            clientData.nick,
            clientData.account || 0
        ]);
        return result.insertId;
    }

    /**
     * Update client field
     * @param {number} id - Client ID
     * @param {string} field - Field name (name, nick, account)
     * @param {*} value - New value
     */
    async update(id, field, value) {
        const allowedFields = ['name', 'nick', 'account', 'sum'];
        if (!allowedFields.includes(field)) {
            throw new Error(`Invalid field: ${field}`);
        }

        const sql = `UPDATE ?? SET ?? = ?, last_action = NOW() WHERE id = ?`;
        await this.pool.query(sql, [this.tableName, field, value, id]);
    }

    /**
     * Update client balance (add or subtract)
     * @param {number} id - Client ID
     * @param {number} amount - Amount to add (positive) or subtract (negative)
     */
    async updateBalance(id, amount) {
        const sql = `UPDATE ?? SET sum = sum + ?, last_action = NOW() WHERE id = ?`;
        await this.pool.query(sql, [this.tableName, amount, id]);
    }

    /**
     * Reset client balance to zero
     * @param {number} id - Client ID
     */
    async resetBalance(id) {
        const sql = `UPDATE ?? SET sum = 0, last_action = NOW() WHERE id = ?`;
        await this.pool.query(sql, [this.tableName, id]);
    }

    /**
     * Delete client
     * @param {number} id - Client ID
     */
    async delete(id) {
        const sql = `DELETE FROM ?? WHERE id = ?`;
        await this.pool.query(sql, [this.tableName, id]);
    }

    /**
     * Get client with their orders
     * @param {number} id - Client ID
     * @returns {Object} - Client with orders array
     */
    async getWithOrders(id) {
        const sql = `
            SELECT c.*, 
                   o.orderid, o.time, o.info, o.sum as order_sum, o.sign
            FROM ?? c
            LEFT JOIN ?? o ON c.id = o.clientid
            WHERE c.id = ?
            ORDER BY o.orderid DESC
        `;
        const results = await this.pool.query(sql, [this.tableName, this.ordersTable, id]);
        
        if (results.length === 0) {
            return null;
        }

        // Build client object with orders
        const client = Client.fromDatabase(results[0]);
        client.orders = results
            .filter(row => row.orderid)
            .map(row => ({
                orderId: row.orderid,
                time: row.time,
                info: row.info,
                sum: row.order_sum,
                sign: row.sign
            }));

        return client;
    }

    /**
     * Check if client exists by name
     * @param {string} name - Client name
     * @returns {boolean}
     */
    async existsByName(name) {
        const sql = `SELECT COUNT(*) as count FROM ?? WHERE name = ?`;
        const results = await this.pool.query(sql, [this.tableName, name]);
        return results[0].count > 0;
    }

    /**
     * Check if client exists by nickname
     * @param {string} nick - Client nickname
     * @returns {boolean}
     */
    async existsByNick(nick) {
        const sql = `SELECT COUNT(*) as count FROM ?? WHERE nick = ?`;
        const results = await this.pool.query(sql, [this.tableName, nick]);
        return results[0].count > 0;
    }

    /**
     * Check if client exists by account number
     * @param {number} account - Account number
     * @returns {boolean}
     */
    async existsByAccount(account) {
        const sql = `SELECT COUNT(*) as count FROM ?? WHERE account = ?`;
        const results = await this.pool.query(sql, [this.tableName, account]);
        return results[0].count > 0;
    }

    /**
     * Reset all client balances to zero
     */
    async resetAllBalances() {
        const sql = `UPDATE ?? SET sum = 0, last_action = NOW()`;
        await this.pool.query(sql, [this.tableName]);
    }

    /**
     * Get total number of clients
     * @returns {number}
     */
    async count() {
        const sql = `SELECT COUNT(*) as count FROM ??`;
        const results = await this.pool.query(sql, [this.tableName]);
        return results[0].count;
    }
}

module.exports = ClientRepository;
