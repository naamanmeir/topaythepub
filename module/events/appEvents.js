/**
 * Application Events
 * Event-driven architecture for loose coupling between modules
 * Uses EventEmitter pattern for publish-subscribe communication
 */

const EventEmitter = require('events');

class AppEvents extends EventEmitter {
    /**
     * Event type constants
     * Centralized event names to prevent typos and provide documentation
     */
    static EVENTS = {
        // Product events
        PRODUCT_CREATED: 'product:created',
        PRODUCT_UPDATED: 'product:updated',
        PRODUCT_DELETED: 'product:deleted',
        PRODUCT_STOCK_CHANGED: 'product:stock:changed',
        PRODUCT_LOW_STOCK: 'product:stock:low',
        
        // Order events
        ORDER_CREATED: 'order:created',
        ORDER_DELETED: 'order:deleted',
        ORDER_CONFIRMED: 'order:confirmed',
        
        // Client events
        CLIENT_CREATED: 'client:created',
        CLIENT_UPDATED: 'client:updated',
        CLIENT_DELETED: 'client:deleted',
        CLIENT_LOGGED_IN: 'client:logged:in',
        CLIENT_LOGGED_OUT: 'client:logged:out',
        CLIENT_BALANCE_CHANGED: 'client:balance:changed',
        
        // Message board events
        POST_CREATED: 'post:created',
        POST_UPDATED: 'post:updated',
        POST_DELETED: 'post:deleted',
        POST_PINNED: 'post:pinned',
        POST_UNPINNED: 'post:unpinned',
        
        // System events
        DATA_CHANGED: 'data:changed',
        RELOAD_REQUIRED: 'reload:required'
    };

    constructor() {
        super();
        this.setMaxListeners(20); // Increase if needed for multiple listeners
    }

    // ========== Product Events ==========

    /**
     * Emit product change event (created/updated/deleted)
     * @param {string} action - 'created', 'updated', or 'deleted'
     * @param {number} productId - Product ID
     * @param {Object} data - Additional data
     */
    emitProductChange(action, productId, data = {}) {
        const event = AppEvents.EVENTS[`PRODUCT_${action.toUpperCase()}`];
        if (event) {
            this.emit(event, { productId, ...data });
            this.emit(AppEvents.EVENTS.DATA_CHANGED, { type: 'product', action, productId });
        }
    }

    /**
     * Emit product stock change event
     * @param {number} productId - Product ID
     * @param {number} oldStock - Previous stock level
     * @param {number} newStock - New stock level
     */
    emitProductStockChanged(productId, oldStock, newStock) {
        this.emit(AppEvents.EVENTS.PRODUCT_STOCK_CHANGED, { 
            productId, 
            oldStock, 
            newStock,
            difference: newStock - oldStock 
        });
        
        // Emit low stock warning if threshold reached
        if (newStock > 0 && newStock <= 5) {
            this.emit(AppEvents.EVENTS.PRODUCT_LOW_STOCK, { productId, stock: newStock });
        }
    }

    /**
     * Listen for any product change
     * @param {Function} callback - Callback function
     */
    onProductChange(callback) {
        this.on(AppEvents.EVENTS.PRODUCT_CREATED, callback);
        this.on(AppEvents.EVENTS.PRODUCT_UPDATED, callback);
        this.on(AppEvents.EVENTS.PRODUCT_DELETED, callback);
    }

    // ========== Order Events ==========

    /**
     * Emit order created event
     * @param {Object} order - Order data
     */
    emitOrderCreated(order) {
        this.emit(AppEvents.EVENTS.ORDER_CREATED, order);
        this.emit(AppEvents.EVENTS.DATA_CHANGED, { type: 'order', action: 'created' });
    }

    /**
     * Emit order deleted event
     * @param {Object} order - Deleted order data
     */
    emitOrderDeleted(order) {
        this.emit(AppEvents.EVENTS.ORDER_DELETED, order);
        this.emit(AppEvents.EVENTS.DATA_CHANGED, { type: 'order', action: 'deleted' });
    }

    /**
     * Listen for order changes
     * @param {Function} callback - Callback function
     */
    onOrderChange(callback) {
        this.on(AppEvents.EVENTS.ORDER_CREATED, callback);
        this.on(AppEvents.EVENTS.ORDER_DELETED, callback);
    }

    // ========== Client Events ==========

    /**
     * Emit client change event
     * @param {string} action - 'created', 'updated', or 'deleted'
     * @param {number} clientId - Client ID
     * @param {Object} data - Additional data
     */
    emitClientChange(action, clientId, data = {}) {
        const event = AppEvents.EVENTS[`CLIENT_${action.toUpperCase()}`];
        if (event) {
            this.emit(event, { clientId, ...data });
            this.emit(AppEvents.EVENTS.DATA_CHANGED, { type: 'client', action, clientId });
        }
    }

    /**
     * Emit client login event
     * @param {number} clientId - Client ID
     * @param {string} clientName - Client name
     */
    emitClientLoggedIn(clientId, clientName) {
        this.emit(AppEvents.EVENTS.CLIENT_LOGGED_IN, { clientId, clientName });
    }

    /**
     * Emit client logout event
     * @param {number} clientId - Client ID
     */
    emitClientLoggedOut(clientId) {
        this.emit(AppEvents.EVENTS.CLIENT_LOGGED_OUT, { clientId });
    }

    /**
     * Emit client balance changed event
     * @param {number} clientId - Client ID
     * @param {number} oldBalance - Previous balance
     * @param {number} newBalance - New balance
     */
    emitClientBalanceChanged(clientId, oldBalance, newBalance) {
        this.emit(AppEvents.EVENTS.CLIENT_BALANCE_CHANGED, { 
            clientId, 
            oldBalance, 
            newBalance,
            difference: newBalance - oldBalance 
        });
    }

    /**
     * Listen for client changes
     * @param {Function} callback - Callback function
     */
    onClientChange(callback) {
        this.on(AppEvents.EVENTS.CLIENT_CREATED, callback);
        this.on(AppEvents.EVENTS.CLIENT_UPDATED, callback);
        this.on(AppEvents.EVENTS.CLIENT_DELETED, callback);
    }

    // ========== Message Board Events ==========

    /**
     * Emit post change event
     * @param {string} action - 'created', 'updated', or 'deleted'
     * @param {number} postId - Post ID
     * @param {Object} data - Additional data
     */
    emitPostChange(action, postId, data = {}) {
        const event = AppEvents.EVENTS[`POST_${action.toUpperCase()}`];
        if (event) {
            this.emit(event, { postId, ...data });
        }
    }

    /**
     * Emit post pinned event
     * @param {number} postId - Post ID
     * @param {boolean} pinned - Pin status
     */
    emitPostPinned(postId, pinned) {
        const event = pinned ? AppEvents.EVENTS.POST_PINNED : AppEvents.EVENTS.POST_UNPINNED;
        this.emit(event, { postId });
    }

    /**
     * Listen for post changes
     * @param {Function} callback - Callback function
     */
    onPostChange(callback) {
        this.on(AppEvents.EVENTS.POST_CREATED, callback);
        this.on(AppEvents.EVENTS.POST_UPDATED, callback);
        this.on(AppEvents.EVENTS.POST_DELETED, callback);
        this.on(AppEvents.EVENTS.POST_PINNED, callback);
        this.on(AppEvents.EVENTS.POST_UNPINNED, callback);
    }

    // ========== System Events ==========

    /**
     * Emit reload required event (for SSE clients)
     * @param {string} type - Type of data that needs reload ('items', 'posts', 'clients')
     */
    emitReloadRequired(type) {
        this.emit(AppEvents.EVENTS.RELOAD_REQUIRED, { type });
    }

    /**
     * Listen for any data change
     * @param {Function} callback - Callback function
     */
    onDataChange(callback) {
        this.on(AppEvents.EVENTS.DATA_CHANGED, callback);
    }

    // ========== Utility Methods ==========

    /**
     * Remove all listeners for a specific event
     * @param {string} eventName - Event name
     */
    removeAllListenersForEvent(eventName) {
        this.removeAllListeners(eventName);
    }

    /**
     * Get count of listeners for an event
     * @param {string} eventName - Event name
     * @returns {number} Listener count
     */
    getListenerCount(eventName) {
        return this.listenerCount(eventName);
    }

    /**
     * Log all registered events (for debugging)
     */
    logEventStatus() {
        console.log('=== Event System Status ===');
        Object.entries(AppEvents.EVENTS).forEach(([name, event]) => {
            const count = this.listenerCount(event);
            if (count > 0) {
                console.log(`${name} (${event}): ${count} listener(s)`);
            }
        });
        console.log('==========================');
    }
}

// Export singleton instance
module.exports = new AppEvents();
