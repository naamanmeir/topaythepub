/**
 * Order Service
 * Business logic for order operations
 */

const OrderRepository = require('../database/OrderRepository');
const ClientRepository = require('../database/ClientRepository');
const ProductRepository = require('../database/ProductRepository');
const Order = require('../models/Order');

class OrderService {
    constructor(pool, logger = null) {
        this.orderRepo = new OrderRepository(pool);
        this.clientRepo = new ClientRepository(pool);
        this.productRepo = new ProductRepository(pool);
        this.logger = logger;
    }

    /**
     * Create new order
     * @param {number} clientId - Client ID
     * @param {Object} orderItems - Object with itemId: quantity pairs
     * @returns {Object} Order details {orderId, orderInfo, totalPrice, clientName}
     * @throws {Error} If validation fails
     */
    async createOrder(clientId, orderItems) {
        // 1. Validate client exists
        const client = await this.clientRepo.findById(clientId);
        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }

        // 2. Get product details for all items in order
        const itemIds = Object.keys(orderItems);
        const products = await this.productRepo.findByIds(itemIds);
        
        if (products.length === 0) {
            throw new Error('NO_VALID_PRODUCTS');
        }

        // 3. Build order details and calculate total
        const orderDetails = [];
        let totalPrice = 0;

        for (const [itemId, quantity] of Object.entries(orderItems)) {
            const product = products.find(p => p.itemId == itemId);
            if (!product) continue;

            // Check if product is available
            if (!product.isAvailable()) {
                throw new Error(`PRODUCT_NOT_AVAILABLE: ${product.itemName}`);
            }

            const subtotal = product.price * quantity;
            orderDetails.push({
                productId: product.itemId,
                name: product.itemName,
                price: product.price,
                quantity: quantity,
                subtotal: subtotal
            });
            
            totalPrice += subtotal;
        }

        if (orderDetails.length === 0) {
            throw new Error('EMPTY_ORDER');
        }

        // 4. Create order info string (Hebrew format)
        const orderInfo = orderDetails
            .map(item => `${item.name} - ${item.quantity}`)
            .join(', ');

        // 5. Get current time in Israel timezone
        const orderTime = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

        // 6. Create order using transaction (ensures client balance is updated)
        const orderId = await this.orderRepo.createWithTransaction({
            clientId: clientId,
            info: orderInfo,
            sum: totalPrice,
            time: orderTime
        });

        // 7. Log order if logger is available
        if (this.logger && this.logger.order) {
            this.logger.order(`
                time: ${orderTime}
                orderId: ${orderId}
                clientId: ${clientId}
                client: ${client.name} (${client.nick})
                sum: ${totalPrice}
                contains: ${orderInfo}
            `);
        }

        return {
            orderId,
            orderInfo,
            totalPrice,
            clientName: client.name,
            clientNick: client.nick,
            items: orderDetails
        };
    }

    /**
     * Get order by ID
     * @param {number} orderId - Order ID
     * @returns {Order}
     * @throws {Error} If order not found
     */
    async getOrderById(orderId) {
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
            throw new Error('ORDER_NOT_FOUND');
        }
        return order;
    }

    /**
     * Get all orders for a client
     * @param {number} clientId - Client ID
     * @returns {Array<Order>}
     */
    async getClientOrders(clientId) {
        return await this.orderRepo.findByClientId(clientId);
    }

    /**
     * Get last order for a client
     * @param {number} clientId - Client ID
     * @returns {Order|null}
     */
    async getLastClientOrder(clientId) {
        return await this.orderRepo.getLastByClientId(clientId);
    }

    /**
     * Delete last order for a client
     * @param {number} clientId - Client ID
     * @returns {Order} Deleted order
     * @throws {Error} If no orders exist or validation fails
     */
    async deleteLastOrder(clientId) {
        // 1. Validate client exists
        const client = await this.clientRepo.findById(clientId);
        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }

        // 2. Get last order
        const lastOrder = await this.orderRepo.getLastByClientId(clientId);
        if (!lastOrder) {
            throw new Error('NO_ORDERS_FOUND');
        }

        // 3. Validate that client balance is sufficient
        // (balance should be >= order sum, otherwise data is inconsistent)
        if (lastOrder.sum > client.sum) {
            // Log this as it indicates data inconsistency
            if (this.logger && this.logger.error) {
                this.logger.error(`
                    Data inconsistency detected:
                    Client ${clientId} has balance ${client.sum} but order sum is ${lastOrder.sum}
                `);
            }
            throw new Error('INVALID_BALANCE');
        }

        // 4. Delete order using transaction (updates client balance)
        const deletedOrder = await this.orderRepo.deleteLastWithTransaction(clientId);

        // 5. Log deletion if logger is available
        if (this.logger && this.logger.action) {
            this.logger.action(`
                Order deleted:
                orderId: ${deletedOrder.orderId}
                clientId: ${clientId}
                client: ${client.name}
                sum: ${deletedOrder.sum}
                info: ${deletedOrder.info}
            `);
        }

        return deletedOrder;
    }

    /**
     * Get all orders with client information
     * @returns {Array<Object>}
     */
    async getAllOrdersWithClients() {
        return await this.orderRepo.findAllWithClients();
    }

    /**
     * Get order statistics
     * @returns {Object} Statistics
     */
    async getStatistics() {
        const totalOrders = await this.orderRepo.count();
        const totalRevenue = await this.orderRepo.getTotalRevenue();
        
        return {
            totalOrders,
            totalRevenue,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
    }

    /**
     * Get orders within date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Array<Order>}
     */
    async getOrdersByDateRange(startDate, endDate) {
        return await this.orderRepo.findByDateRange(startDate, endDate);
    }

    /**
     * Build order confirmation data (for UI display before placing order)
     * @param {number} clientId - Client ID
     * @param {Object} orderItems - Object with itemId: quantity pairs
     * @returns {Object} Order preview {items, totalSum, clientName}
     * @throws {Error} If validation fails
     */
    async buildOrderConfirmation(clientId, orderItems) {
        // 1. Validate client exists
        const client = await this.clientRepo.findById(clientId);
        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }

        // 2. Get product details
        const itemIds = Object.keys(orderItems);
        const products = await this.productRepo.findByIds(itemIds);

        // 3. Build order preview
        const items = [];
        let totalSum = 0;

        for (const [itemId, quantity] of Object.entries(orderItems)) {
            const product = products.find(p => p.itemId == itemId);
            if (!product) continue;

            const subtotal = product.price * quantity;
            items.push({
                name: product.itemName,
                price: product.price,
                quantity: quantity,
                subtotal: subtotal
            });
            
            totalSum += subtotal;
        }

        return {
            items,
            totalSum,
            clientName: client.name,
            clientNick: client.nick,
            currentBalance: client.sum,
            newBalance: client.sum + totalSum
        };
    }
}

module.exports = OrderService;
