/**
 * Client Router (Refactored Version)
 * Demonstrates new architecture with models, services, validation, and response helpers
 * 
 * This is a proof-of-concept refactoring that can be gradually migrated
 * to replace the original router_client.js
 */

const express = require('express');
const router = express.Router();

// Import new architecture components
const { asyncHandler } = require('../module/middleware/errorHandler');
const ResponseHelper = require('../module/utils/responseHelper');
const { validators, validate } = require('../module/validation/schemas');
const ClientService = require('../module/services/ClientService');
const OrderService = require('../module/services/OrderService');
const appEvents = require('../module/events/appEvents');

// Import existing dependencies
const db = require('../module/database/db');
const { actionsLogger, ordersLogger } = require('../module/logger');
const localizationService = require('../module/localization/LocalizationService');
const messagesJson = localizationService.getMessages();

// Initialize services (pool from existing db.js)
const clientService = new ClientService(db.pool || require('mariadb').createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    connectionLimit: 25
}));

const orderService = new OrderService(clientService.clientRepo.pool, {
    order: ordersLogger.order,
    action: actionsLogger.action,
    error: actionsLogger.error
});

// Extract messages
const messageUi = messagesJson.ui[0];
const messageClient = messagesJson.client[0];
const messageError = messagesJson.error[0];

// ======================== CLIENT SEARCH ========================

/**
 * Search for clients by name or nickname
 * POST /client/searchName/
 * Body: { name: string }
 */
router.post('/searchName/', 
    validate(validators.clientSearch),
    asyncHandler(async (req, res) => {
        const { name } = req.validatedBody;
        
        const clients = await clientService.searchClients(name);
        
        if (clients.length === 0) {
            return ResponseHelper.error(res, messageClient.notExist, 404);
        }
        
        // Return clients in search result format
        const results = clients.map(client => client.toSearchResult());
        return ResponseHelper.success(res, results);
    })
);

// ======================== CLIENT LOGIN/LOGOUT ========================

/**
 * Login a client
 * POST /client/userLogin/
 * Body: { id: number }
 */
router.post('/userLogin/',
    validate(validators.clientLogin),
    asyncHandler(async (req, res) => {
        const { id } = req.validatedBody;
        
        const client = await clientService.getClientById(id);
        
        // Emit login event
        appEvents.emitClientLoggedIn(client.id, client.name);
        
        // Return client response with message
        return ResponseHelper.success(
            res, 
            client.toClientResponse(messageClient.logged)
        );
    })
);

/**
 * Logout a client
 * POST /client/userLogout/
 * Body: { id: number }
 */
router.post('/userLogout/',
    validate(validators.clientLogin),
    asyncHandler(async (req, res) => {
        const { id } = req.validatedBody;
        
        // Verify client exists
        const client = await clientService.getClientById(id);
        
        // Emit logout event
        appEvents.emitClientLoggedOut(client.id);
        
        return ResponseHelper.success(res, {
            message: `userId ${id} LogOut Verified on Server`
        });
    })
);

// ======================== CLIENT INFO ========================

/**
 * Get client page with order history
 * POST /client/getUserPage/
 * Body: { id: number }
 */
router.post('/getUserPage/',
    validate(validators.clientLogin),
    asyncHandler(async (req, res) => {
        const { id } = req.validatedBody;
        
        // Get client with orders using service
        const clientWithOrders = await clientService.getClientWithOrders(id);
        
        // Build HTML using existing module (for backward compatibility)
        const userPageModule = require("../module/html/content/userPage");
        const html = userPageModule.buildHtml(
            messageUi, 
            clientWithOrders.toClientResponse(messageClient.logged),
            clientWithOrders
        );
        
        // Clean up require cache
        delete require.cache[require.resolve("../module/html/content/userPage")];
        
        return ResponseHelper.html(res, html);
    })
);

/**
 * Auto-logout handler (for session timeout)
 * POST /client/userAutoLogout/
 * Body: { id: number }
 */
router.post('/userAutoLogout/',
    validate(validators.clientLogin),
    asyncHandler(async (req, res) => {
        const { id } = req.validatedBody;
        
        const client = await clientService.getClientById(id);
        
        // Emit logout event
        appEvents.emitClientLoggedOut(client.id);
        
        return ResponseHelper.success(
            res,
            client.toClientResponse()
        );
    })
);

// ======================== CLIENT UPDATES ========================

/**
 * Change client nickname
 * POST /client/changeNick/
 * Body: { id: number, newNick: string }
 */
router.post('/changeNick/',
    validate(validators.clientUpdate),
    asyncHandler(async (req, res) => {
        const { id, newNick } = req.validatedBody;
        
        await clientService.updateNickname(id, newNick);
        
        // Emit client update event
        appEvents.emitClientChange('updated', id, { field: 'nick', value: newNick });
        
        // Log action
        actionsLogger.action(`Client ${id} changed nickname to ${newNick}`);
        
        return ResponseHelper.success(res, {
            message: messageClient.nickChanged || 'Nickname updated successfully'
        });
    })
);

// ======================== ORDER OPERATIONS ========================

/**
 * Request order confirmation page
 * POST /client/requestOrderPage/
 * Body: { userId: number, order: {itemId: quantity, ...} }
 */
router.post('/requestOrderPage/',
    validate(validators.orderCreate),
    asyncHandler(async (req, res) => {
        const { userId, order } = req.validatedBody;
        
        // Build order confirmation using service
        const orderData = await orderService.buildOrderConfirmation(userId, order);
        
        // Build confirmation HTML using existing module
        const orderConfirmModule = require("../module/html/content/orderConfirm");
        const html = orderConfirmModule.buildHtml(messageUi, orderData);
        
        delete require.cache[require.resolve("../module/html/content/orderConfirm")];
        
        return ResponseHelper.success(res, {
            html: html,
            orderData: orderData,
            totalSum: orderData.totalSum
        });
    })
);

/**
 * Place an order
 * POST /client/placeOrder/
 * Body: { userId: number, order: {itemId: quantity, ...} }
 */
router.post('/placeOrder/',
    validate(validators.orderCreate),
    asyncHandler(async (req, res) => {
        const { userId, order } = req.validatedBody;
        
        // Create order using service (handles transaction)
        const result = await orderService.createOrder(userId, order);
        
        // Emit order created event
        appEvents.emitOrderCreated(result);
        
        // Emit reload required for SSE clients
        appEvents.emitReloadRequired('orders');
        
        return ResponseHelper.success(res, {
            message: `${messageClient.orderResponse1} ${result.orderInfo} ${messageClient.orderResponse2} ${result.totalPrice}`
        });
    })
);

/**
 * Request confirmation for deleting last order
 * POST /client/deleteLastOrderConfirm/
 * Body: { id: number }
 */
router.post('/deleteLastOrderConfirm/',
    validate(validators.clientLogin),
    asyncHandler(async (req, res) => {
        const { id } = req.validatedBody;
        
        // Get last order
        const lastOrder = await orderService.getLastClientOrder(id);
        
        if (!lastOrder) {
            return ResponseHelper.error(res, messageClient.noOrders || 'No orders found', 404);
        }
        
        // Build confirmation HTML
        const confirmModule = require("../module/html/content/deleteOrderConfirm");
        const html = confirmModule.buildHtml(messageUi, lastOrder);
        
        delete require.cache[require.resolve("../module/html/content/deleteOrderConfirm")];
        
        return ResponseHelper.html(res, html);
    })
);

/**
 * Delete last order
 * POST /client/deleteLastOrder/
 * Body: { id: number }
 */
router.post('/deleteLastOrder/',
    validate(validators.clientLogin),
    asyncHandler(async (req, res) => {
        const { id } = req.validatedBody;
        
        // Delete last order using service (handles transaction)
        const deletedOrder = await orderService.deleteLastOrder(id);
        
        // Emit order deleted event
        appEvents.emitOrderDeleted(deletedOrder);
        
        // Emit reload required for SSE clients
        appEvents.emitReloadRequired('orders');
        
        return ResponseHelper.success(res, {
            message: messageClient.orderDeleted || 'Order deleted successfully',
            order: deletedOrder.toJSON()
        });
    })
);

// ======================== DISPLAY INFO ========================

/**
 * Get pinned posts for display
 * POST /client/getDisplayInfo/
 * Body: { id: number }
 */
router.post('/getDisplayInfo/',
    validate(validators.clientLogin),
    asyncHandler(async (req, res) => {
        const { id } = req.validatedBody;
        
        // Get pinned posts (using existing db function for now)
        const pinnedPosts = await db.dbGetPindPosts();
        
        return ResponseHelper.success(res, pinnedPosts);
    })
);

// ======================== WINDOW TRACKING ========================

/**
 * Track window open event
 * GET /client/windowIsOpen/
 */
router.get('/windowIsOpen/', (req, res) => {
    // Track window open (can add analytics here)
    res.sendStatus(200);
});

/**
 * Track window close event
 * GET /client/windowIsClose/
 */
router.get('/windowIsClose/', (req, res) => {
    // Track window close (can add analytics here)
    res.sendStatus(200);
});

module.exports = router;
