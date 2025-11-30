/**
 * Order Repository
 * Handles all database operations for orders using parameterized queries
 */

const Order = require('../models/Order');
const config = require('../../config');

class OrderRepository {
    constructor(pool) {
        this.pool = pool;
        this.tableName = config.database.tables.orders;
        this.clientsTable = config.database.tables.clients;
    }

    /**
     * Find order by ID
     * @param {number} orderId - Order ID
     * @returns {Order|null}
     */
    async findById(orderId) {
        const sql = `SELECT * FROM ?? WHERE orderid = ?`;
        const results = await this.pool.query(sql, [this.tableName, orderId]);
        return results.length > 0 ? Order.fromDatabase(results[0]) : null;
    }

    /**
     * Get all orders for a client
     * @param {number} clientId - Client ID
     * @returns {Array<Order>}
     */
    async findByClientId(clientId) {
        const sql = `SELECT * FROM ?? WHERE clientid = ? ORDER BY orderid DESC`;
        const results = await this.pool.query(sql, [this.tableName, clientId]);
        return results.map(row => Order.fromDatabase(row));
    }

    /**
     * Get last order for a client
     * @param {number} clientId - Client ID
     * @returns {Order|null}
     */
    async getLastByClientId(clientId) {
        const sql = `SELECT * FROM ?? WHERE clientid = ? ORDER BY orderid DESC LIMIT 1`;
        const results = await this.pool.query(sql, [this.tableName, clientId]);
        return results.length > 0 ? Order.fromDatabase(results[0]) : null;
    }

    /**
     * Get all orders
     * @returns {Array<Order>}
     */
    async findAll() {
        const sql = `SELECT * FROM ?? ORDER BY orderid DESC`;
        const results = await this.pool.query(sql, [this.tableName]);
        return results.map(row => Order.fromDatabase(row));
    }

    /**
     * Get all orders with client information
     * @returns {Array<Object>}
     */
    async findAllWithClients() {
        const sql = `
            SELECT o.*, c.name as client_name, c.nick as client_nick
            FROM ?? o
            LEFT JOIN ?? c ON o.clientid = c.id
            ORDER BY o.orderid DESC
        `;
        const results = await this.pool.query(sql, [this.tableName, this.clientsTable]);
        return results.map(row => ({
            ...Order.fromDatabase(row).toJSON(),
            clientName: row.client_name,
            clientNick: row.client_nick
        }));
    }

    /**
     * Create new order
     * @param {Object} orderData - Order data {clientId, info, sum, time}
     * @returns {number} - Inserted order ID
     */
    async create(orderData) {
        const sql = `INSERT INTO ?? (clientid, time, info, sum, sign) VALUES (?, ?, ?, ?, ?)`;
        const result = await this.pool.query(sql, [
            this.tableName,
            orderData.clientId,
            orderData.time,
            orderData.info,
            orderData.sum,
            orderData.sign || null
        ]);
        return result.insertId;
    }

    /**
     * Create order with transaction (ensures client balance is updated)
     * @param {Object} orderData - Order data {clientId, info, sum, time}
     * @returns {number} - Inserted order ID
     */
    async createWithTransaction(orderData) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            await conn.beginTransaction();

            // Insert order
            const orderSql = `INSERT INTO ?? (clientid, time, info, sum) VALUES (?, ?, ?, ?)`;
            const orderResult = await conn.query(orderSql, [
                this.tableName,
                orderData.clientId,
                orderData.time,
                orderData.info,
                orderData.sum
            ]);

            // Update client balance
            const balanceSql = `UPDATE ?? SET sum = sum + ?, last_action = NOW() WHERE id = ?`;
            await conn.query(balanceSql, [
                this.clientsTable,
                orderData.sum,
                orderData.clientId
            ]);

            await conn.commit();
            return orderResult.insertId;
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Delete order
     * @param {number} orderId - Order ID
     */
    async delete(orderId) {
        const sql = `DELETE FROM ?? WHERE orderid = ?`;
        await this.pool.query(sql, [this.tableName, orderId]);
    }

    /**
     * Delete last order with transaction (updates client balance)
     * @param {number} clientId - Client ID
     * @returns {Order|null} - Deleted order or null if no orders
     */
    async deleteLastWithTransaction(clientId) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            await conn.beginTransaction();

            // Get last order
            const getOrderSql = `SELECT * FROM ?? WHERE clientid = ? ORDER BY orderid DESC LIMIT 1`;
            const orders = await conn.query(getOrderSql, [this.tableName, clientId]);
            
            if (orders.length === 0) {
                await conn.rollback();
                return null;
            }

            const lastOrder = Order.fromDatabase(orders[0]);

            // Delete order
            const deleteSql = `DELETE FROM ?? WHERE orderid = ?`;
            await conn.query(deleteSql, [this.tableName, lastOrder.orderId]);

            // Update client balance
            const balanceSql = `UPDATE ?? SET sum = sum - ?, last_action = NOW() WHERE id = ?`;
            await conn.query(balanceSql, [
                this.clientsTable,
                lastOrder.sum,
                clientId
            ]);

            await conn.commit();
            return lastOrder;
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Get total number of orders
     * @returns {number}
     */
    async count() {
        const sql = `SELECT COUNT(*) as count FROM ??`;
        const results = await this.pool.query(sql, [this.tableName]);
        return results[0].count;
    }

    /**
     * Get total revenue
     * @returns {number}
     */
    async getTotalRevenue() {
        const sql = `SELECT SUM(sum) as total FROM ??`;
        const results = await this.pool.query(sql, [this.tableName]);
        return results[0].total || 0;
    }

    /**
     * Get orders within date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Array<Order>}
     */
    async findByDateRange(startDate, endDate) {
        const sql = `SELECT * FROM ?? WHERE time BETWEEN ? AND ? ORDER BY orderid DESC`;
        const results = await this.pool.query(sql, [this.tableName, startDate, endDate]);
        return results.map(row => Order.fromDatabase(row));
    }

    /**
     * Delete all orders for a client
     * @param {number} clientId - Client ID
     */
    async deleteByClientId(clientId) {
        const sql = `DELETE FROM ?? WHERE clientid = ?`;
        await this.pool.query(sql, [this.tableName, clientId]);
    }
}

module.exports = OrderRepository;
