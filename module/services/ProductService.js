/**
 * Product Service
 * Business logic for product/inventory operations
 */

const ProductRepository = require('../database/ProductRepository');
const Product = require('../models/Product');

class ProductService {
    constructor(pool) {
        this.productRepo = new ProductRepository(pool);
    }

    /**
     * Get product by ID
     * @param {number} itemId - Product ID
     * @returns {Product}
     * @throws {Error} If product not found
     */
    async getProductById(itemId) {
        const product = await this.productRepo.findById(itemId);
        if (!product) {
            throw new Error('PRODUCT_NOT_FOUND');
        }
        return product;
    }

    /**
     * Get all products
     * @returns {Array<Product>}
     */
    async getAllProducts() {
        return await this.productRepo.findAll();
    }

    /**
     * Get only available products (for ordering)
     * @returns {Array<Product>}
     */
    async getAvailableProducts() {
        return await this.productRepo.findAvailable();
    }

    /**
     * Get products out of stock
     * @returns {Array<Product>}
     */
    async getOutOfStockProducts() {
        return await this.productRepo.findOutOfStock();
    }

    /**
     * Search products by name
     * @param {string} name - Product name
     * @returns {Array<Product>}
     */
    async searchProducts(name) {
        return await this.productRepo.findByName(name);
    }

    /**
     * Create new product
     * @param {Object} productData - Product data
     * @returns {number} New product ID
     * @throws {Error} If validation fails
     */
    async createProduct(productData) {
        // Validate product data
        const product = new Product(productData);
        const validation = product.validate();
        
        if (!validation.valid) {
            throw new Error(`VALIDATION_FAILED: ${validation.errors.join(', ')}`);
        }

        // Check if product with same name already exists
        if (await this.productRepo.existsByName(productData.name || productData.itemname)) {
            throw new Error('PRODUCT_EXISTS');
        }

        // Create product
        return await this.productRepo.create(productData);
    }

    /**
     * Update product field
     * @param {number} itemId - Product ID
     * @param {string} field - Field name
     * @param {*} value - New value
     * @throws {Error} If product not found or validation fails
     */
    async updateProduct(itemId, field, value) {
        // Check if product exists
        await this.getProductById(itemId);

        // Validate field
        const allowedFields = ['itemname', 'price', 'stock', 'imgpath', 'order'];
        if (!allowedFields.includes(field)) {
            throw new Error('INVALID_FIELD');
        }

        // Additional validation
        if (field === 'price' && (typeof value !== 'number' || value < 0)) {
            throw new Error('INVALID_PRICE');
        }

        if (field === 'stock' && (typeof value !== 'number' || value < 0)) {
            throw new Error('INVALID_STOCK');
        }

        await this.productRepo.update(itemId, field, value);
    }

    /**
     * Update product stock
     * @param {number} itemId - Product ID
     * @param {number} quantity - Quantity to add (positive) or remove (negative)
     * @throws {Error} If product not found
     */
    async updateStock(itemId, quantity) {
        // Check if product exists
        await this.getProductById(itemId);
        
        await this.productRepo.updateStock(itemId, quantity);
    }

    /**
     * Delete product
     * @param {number} itemId - Product ID
     * @throws {Error} If product not found
     */
    async deleteProduct(itemId) {
        // Check if product exists
        await this.getProductById(itemId);
        
        // TODO: Consider checking if product has been ordered
        // and whether to allow deletion
        
        await this.productRepo.delete(itemId);
    }

    /**
     * Get products with low stock
     * @param {number} threshold - Stock threshold (default: 5)
     * @returns {Array<Product>}
     */
    async getLowStockProducts(threshold = 5) {
        return await this.productRepo.findLowStock(threshold);
    }

    /**
     * Get price list
     * @returns {Array<Object>}
     */
    async getPriceList() {
        return await this.productRepo.getPriceList();
    }

    /**
     * Reorder products (change display order)
     * @param {Array<Object>} orderUpdates - Array of {itemid, order} objects
     * @throws {Error} If validation fails
     */
    async reorderProducts(orderUpdates) {
        if (!Array.isArray(orderUpdates) || orderUpdates.length === 0) {
            throw new Error('INVALID_ORDER_UPDATES');
        }

        // Validate all products exist
        for (const update of orderUpdates) {
            await this.getProductById(update.itemid);
        }

        await this.productRepo.reorder(orderUpdates);
    }

    /**
     * Get product statistics
     * @returns {Object} Statistics
     */
    async getStatistics() {
        const totalProducts = await this.productRepo.count();
        const availableProducts = await this.productRepo.findAvailable();
        const outOfStockProducts = await this.productRepo.findOutOfStock();
        const totalInventoryValue = await this.productRepo.getTotalInventoryValue();
        const lowStockProducts = await this.productRepo.findLowStock(5);
        
        return {
            totalProducts,
            availableProducts: availableProducts.length,
            outOfStockProducts: outOfStockProducts.length,
            totalInventoryValue,
            lowStockCount: lowStockProducts.length,
            lowStockItems: lowStockProducts.map(p => ({
                id: p.itemId,
                name: p.itemName,
                stock: p.stock
            }))
        };
    }

    /**
     * Bulk update products
     * @param {Array<Object>} updates - Array of {itemid, field, value} objects
     * @throws {Error} If validation fails
     */
    async bulkUpdate(updates) {
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new Error('INVALID_UPDATES');
        }

        for (const update of updates) {
            await this.updateProduct(update.itemid, update.field, update.value);
        }
    }
}

module.exports = ProductService;
