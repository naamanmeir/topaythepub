/**
 * Product Model
 * Represents a product/item in the pub inventory
 */

class Product {
    constructor(data = {}) {
        this.itemId = data.itemId || data.itemid || null;
        this.itemName = data.itemName || data.itemname || '';
        this.price = data.price || 0;
        this.stock = data.stock || 0;
        this.imgPath = data.imgPath || data.imgpath || '';
        this.order = data.order || 0;
    }

    /**
     * Create Product instance from database row
     * @param {Object} dbRow - Raw database row
     * @returns {Product}
     */
    static fromDatabase(dbRow) {
        if (!dbRow) return null;
        
        return new Product({
            itemId: dbRow.itemid,
            itemName: dbRow.itemname,
            price: dbRow.price,
            stock: dbRow.stock,
            imgPath: dbRow.imgpath,
            order: dbRow.order
        });
    }

    /**
     * Convert to JSON (for API responses)
     * @returns {Object}
     */
    toJSON() {
        return {
            itemid: this.itemId,
            itemname: this.itemName,
            price: this.price,
            stock: this.stock,
            imgpath: this.imgPath,
            order: this.order
        };
    }

    /**
     * Format for product list display (client-facing)
     * @returns {Object}
     */
    toClientFormat() {
        return {
            itemid: this.itemId,
            itemname: this.itemName,
            price: this.price,
            imgpath: this.imgPath
        };
    }

    /**
     * Format for management interface
     * @returns {Object}
     */
    toManagementFormat() {
        return {
            itemid: this.itemId,
            itemname: this.itemName,
            price: this.price,
            stock: this.stock,
            imgpath: this.imgPath,
            order: this.order,
            inStock: this.isInStock(),
            displayOrder: this.order
        };
    }

    /**
     * Check if product is in stock
     * @returns {boolean}
     */
    isInStock() {
        return this.stock > 0;
    }

    /**
     * Check if product is available for ordering
     * @returns {boolean}
     */
    isAvailable() {
        return this.isInStock() && this.itemName && this.price >= 0;
    }

    /**
     * Update stock quantity
     * @param {number} quantity - Quantity to add (positive) or remove (negative)
     */
    updateStock(quantity) {
        this.stock = Math.max(0, this.stock + quantity);
    }

    /**
     * Validate product data
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (!this.itemName || this.itemName.length === 0) {
            errors.push('Product name is required');
        }

        if (this.itemName && this.itemName.length > 99) {
            errors.push('Product name must be less than 100 characters');
        }

        if (typeof this.price !== 'number' || this.price < 0) {
            errors.push('Price must be a non-negative number');
        }

        if (typeof this.stock !== 'number' || this.stock < 0) {
            errors.push('Stock must be a non-negative number');
        }

        if (this.imgPath && this.imgPath.length > 1024) {
            errors.push('Image path must be less than 1024 characters');
        }

        if (typeof this.order !== 'number') {
            errors.push('Order must be a number');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = Product;
