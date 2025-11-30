/**
 * Order Model
 * Represents a customer order in the system
 */

class Order {
    constructor(data = {}) {
        this.orderId = data.orderId || data.orderid || null;
        this.clientId = data.clientId || data.clientid || null;
        this.time = data.time || null;
        this.info = data.info || '';
        this.sum = data.sum || 0;
        this.sign = data.sign || null;
    }

    /**
     * Create Order instance from database row
     * @param {Object} dbRow - Raw database row
     * @returns {Order}
     */
    static fromDatabase(dbRow) {
        if (!dbRow) return null;
        
        return new Order({
            orderId: dbRow.orderid,
            clientId: dbRow.clientid,
            time: dbRow.time,
            info: dbRow.info,
            sum: dbRow.sum,
            sign: dbRow.sign
        });
    }

    /**
     * Create Order from request data
     * @param {Object} orderItems - Object with itemId: quantity pairs
     * @param {number} clientId - Client ID
     * @param {Array} productDetails - Array of product details with prices
     * @returns {Order}
     */
    static fromRequest(orderItems, clientId, productDetails) {
        const orderDetails = [];
        let totalSum = 0;

        for (const [itemId, quantity] of Object.entries(orderItems)) {
            const product = productDetails.find(p => p.itemid == itemId);
            if (product) {
                orderDetails.push({
                    name: product.itemname,
                    quantity: quantity,
                    price: product.price,
                    subtotal: product.price * quantity
                });
                totalSum += product.price * quantity;
            }
        }

        const orderInfo = orderDetails
            .map(item => `${item.name} - ${item.quantity}`)
            .join(', ');

        return new Order({
            clientId: clientId,
            info: orderInfo,
            sum: totalSum,
            time: new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })
        });
    }

    /**
     * Convert to JSON (for API responses)
     * @returns {Object}
     */
    toJSON() {
        return {
            orderId: this.orderId,
            clientId: this.clientId,
            time: this.time,
            info: this.info,
            sum: this.sum,
            sign: this.sign
        };
    }

    /**
     * Format for order history display
     * @returns {Object}
     */
    toHistoryFormat() {
        return {
            orderId: this.orderId,
            time: this.time,
            items: this.info,
            total: this.sum,
            sign: this.sign
        };
    }

    /**
     * Get order items as array
     * @returns {Array}
     */
    getItemsArray() {
        if (!this.info) return [];
        return this.info.split(', ').map(item => {
            const [name, quantity] = item.split(' - ');
            return { name, quantity: parseInt(quantity) || 1 };
        });
    }

    /**
     * Validate order data
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (!this.clientId || this.clientId <= 0) {
            errors.push('Valid client ID is required');
        }

        if (!this.info || this.info.length === 0) {
            errors.push('Order info is required');
        }

        if (!this.sum || this.sum <= 0) {
            errors.push('Order sum must be greater than 0');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = Order;
