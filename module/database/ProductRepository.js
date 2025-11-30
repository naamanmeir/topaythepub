/**
 * Product Repository
 * Handles all database operations for products using parameterized queries
 */

const Product = require('../models/Product');
const config = require('../../config');

class ProductRepository {
    constructor(pool) {
        this.pool = pool;
        this.tableName = config.database.tables.products;
    }

    /**
     * Find product by ID
     * @param {number} itemId - Product ID
     * @returns {Product|null}
     */
    async findById(itemId) {
        const sql = `SELECT * FROM ?? WHERE itemid = ?`;
        const results = await this.pool.query(sql, [this.tableName, itemId]);
        return results.length > 0 ? Product.fromDatabase(results[0]) : null;
    }

    /**
     * Find products by IDs (bulk lookup)
     * @param {Array<number>} itemIds - Array of product IDs
     * @returns {Array<Product>}
     */
    async findByIds(itemIds) {
        if (!itemIds || itemIds.length === 0) return [];
        
        const placeholders = itemIds.map(() => '?').join(',');
        const sql = `SELECT * FROM ?? WHERE itemid IN (${placeholders})`;
        const results = await this.pool.query(sql, [this.tableName, ...itemIds]);
        return results.map(row => Product.fromDatabase(row));
    }

    /**
     * Get all products
     * @returns {Array<Product>}
     */
    async findAll() {
        const sql = `SELECT * FROM ?? ORDER BY \`order\``;
        const results = await this.pool.query(sql, [this.tableName]);
        return results.map(row => Product.fromDatabase(row));
    }

    /**
     * Get only available products (in stock)
     * @returns {Array<Product>}
     */
    async findAvailable() {
        const sql = `SELECT * FROM ?? WHERE stock > 0 ORDER BY \`order\``;
        const results = await this.pool.query(sql, [this.tableName]);
        return results.map(row => Product.fromDatabase(row));
    }

    /**
     * Get products out of stock
     * @returns {Array<Product>}
     */
    async findOutOfStock() {
        const sql = `SELECT * FROM ?? WHERE stock = 0 ORDER BY \`order\``;
        const results = await this.pool.query(sql, [this.tableName]);
        return results.map(row => Product.fromDatabase(row));
    }

    /**
     * Search products by name
     * @param {string} name - Product name to search for
     * @returns {Array<Product>}
     */
    async findByName(name) {
        const sql = `SELECT * FROM ?? WHERE itemname LIKE ? ORDER BY \`order\``;
        const results = await this.pool.query(sql, [this.tableName, `%${name}%`]);
        return results.map(row => Product.fromDatabase(row));
    }

    /**
     * Create new product
     * @param {Object} productData - Product data {name, price, stock, imgpath, order}
     * @returns {number} - Inserted product ID
     */
    async create(productData) {
        const sql = `INSERT INTO ?? (itemname, price, stock, imgpath, \`order\`) VALUES (?, ?, ?, ?, ?)`;
        const result = await this.pool.query(sql, [
            this.tableName,
            productData.name || productData.itemname,
            productData.price,
            productData.stock,
            productData.imgpath,
            productData.order
        ]);
        return result.insertId;
    }

    /**
     * Update product field
     * @param {number} itemId - Product ID
     * @param {string} field - Field name
     * @param {*} value - New value
     */
    async update(itemId, field, value) {
        const allowedFields = ['itemname', 'price', 'stock', 'imgpath', 'order'];
        if (!allowedFields.includes(field)) {
            throw new Error(`Invalid field: ${field}`);
        }

        // Handle 'order' field specially due to reserved keyword
        const fieldName = field === 'order' ? '`order`' : field;
        const sql = `UPDATE ?? SET ${fieldName} = ? WHERE itemid = ?`;
        await this.pool.query(sql, [this.tableName, value, itemId]);
    }

    /**
     * Update product stock
     * @param {number} itemId - Product ID
     * @param {number} quantity - Quantity to add (positive) or remove (negative)
     */
    async updateStock(itemId, quantity) {
        const sql = `UPDATE ?? SET stock = GREATEST(0, stock + ?) WHERE itemid = ?`;
        await this.pool.query(sql, [this.tableName, quantity, itemId]);
    }

    /**
     * Update multiple product fields at once
     * @param {number} itemId - Product ID
     * @param {Object} updates - Object with field: value pairs
     */
    async updateMultiple(itemId, updates) {
        const allowedFields = ['itemname', 'price', 'stock', 'imgpath', 'order'];
        const fields = Object.keys(updates).filter(f => allowedFields.includes(f));
        
        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        const setClauses = fields.map(f => f === 'order' ? '`order` = ?' : `${f} = ?`);
        const values = fields.map(f => updates[f]);
        
        const sql = `UPDATE ?? SET ${setClauses.join(', ')} WHERE itemid = ?`;
        await this.pool.query(sql, [this.tableName, ...values, itemId]);
    }

    /**
     * Delete product
     * @param {number} itemId - Product ID
     */
    async delete(itemId) {
        const sql = `DELETE FROM ?? WHERE itemid = ?`;
        await this.pool.query(sql, [this.tableName, itemId]);
    }

    /**
     * Check if product exists by ID
     * @param {number} itemId - Product ID
     * @returns {boolean}
     */
    async existsById(itemId) {
        const sql = `SELECT COUNT(*) as count FROM ?? WHERE itemid = ?`;
        const results = await this.pool.query(sql, [this.tableName, itemId]);
        return results[0].count > 0;
    }

    /**
     * Check if product exists by name
     * @param {string} name - Product name
     * @returns {boolean}
     */
    async existsByName(name) {
        const sql = `SELECT COUNT(*) as count FROM ?? WHERE itemname = ?`;
        const results = await this.pool.query(sql, [this.tableName, name]);
        return results[0].count > 0;
    }

    /**
     * Get total number of products
     * @returns {number}
     */
    async count() {
        const sql = `SELECT COUNT(*) as count FROM ??`;
        const results = await this.pool.query(sql, [this.tableName]);
        return results[0].count;
    }

    /**
     * Get total inventory value
     * @returns {number}
     */
    async getTotalInventoryValue() {
        const sql = `SELECT SUM(price * stock) as total FROM ??`;
        const results = await this.pool.query(sql, [this.tableName]);
        return results[0].total || 0;
    }

    /**
     * Get products with low stock
     * @param {number} threshold - Stock threshold (default: 5)
     * @returns {Array<Product>}
     */
    async findLowStock(threshold = 5) {
        const sql = `SELECT * FROM ?? WHERE stock > 0 AND stock <= ? ORDER BY stock ASC`;
        const results = await this.pool.query(sql, [this.tableName, threshold]);
        return results.map(row => Product.fromDatabase(row));
    }

    /**
     * Get price list (id and price only)
     * @returns {Array<Object>}
     */
    async getPriceList() {
        const sql = `SELECT itemid, itemname, price FROM ?? ORDER BY \`order\``;
        const results = await this.pool.query(sql, [this.tableName]);
        return results;
    }

    /**
     * Reorder products (update display order)
     * @param {Array<Object>} orderUpdates - Array of {itemid, order} objects
     */
    async reorder(orderUpdates) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            await conn.beginTransaction();

            for (const update of orderUpdates) {
                const sql = `UPDATE ?? SET \`order\` = ? WHERE itemid = ?`;
                await conn.query(sql, [this.tableName, update.order, update.itemid]);
            }

            await conn.commit();
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = ProductRepository;
