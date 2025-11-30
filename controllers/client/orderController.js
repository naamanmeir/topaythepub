/**
 * Order Controller
 * Handles order creation, confirmation, and deletion
 */

const db = require('../../module/database/db');
const { ordersLogger } = require('../../module/logger');
const localizationService = require('../../module/localization/LocalizationService');
let messagesJson = localizationService.getMessages();
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];

/**
 * Request order confirmation page
 * POST /client/requestOrderPage/
 */
async function requestOrderPage(req, res, next) {
    try {
        if (!req.body.order && !req.body.userId) {
            return res.end();
        }
        
        const orderDataRaw = req.body;
        const orderData = Object.entries(req.body.order);
        
        // Validate order quantities
        for (let i = 0; i < orderData.length; i++) {
            if (orderData[i][1] < 0 ||
                orderData[i][1] > 99 ||
                !Number.isInteger(orderData[i][1])) {
                console.log("ERROR WITH ITEMS QUANTITY");
                return res.send(JSON.stringify({ 'errorClient': messageError.orderQuantity }));
            }
        }
        
        const userId = req.body.userId;
        const orderConfirmPage = require("../../module/html/content/orderConfirm");
        const orderBuiltData = [];
        let orderPriceSum = 0;
        
        // Build order details
        for (let i = 0; i < orderData.length; i++) {
            const itemData = await db.dbGetProductDetailsById(orderData[i][0]);
            const itemRaw = [
                orderData[i][1], 
                itemData[0].itemname, 
                itemData[0].price, 
                (itemData[0].price * orderData[i][1]), 
                itemData[0].itemimgpath
            ];
            orderBuiltData[i] = itemRaw;
            orderPriceSum += (itemData[0].price * orderData[i][1]);
        }
        
        // Get user details
        let loggedUserDetails = await db.dbGetClientDetailsById(userId);
        loggedUserDetails = {
            'id': userId,
            'name': loggedUserDetails[0].name,
            'nick': loggedUserDetails[0].nick,
            'account': loggedUserDetails[0].account,
            'message': messageClient.orderMessage
        };
        
        // Build HTML
        const html = orderConfirmPage.buildHtml(messageUi, loggedUserDetails, orderBuiltData, orderPriceSum);
        
        const htmlOrderData = { 
            "html": html, 
            "orderData": orderDataRaw, 
            "totalSum": orderPriceSum 
        };
        
        res.send(htmlOrderData);
        delete require.cache[require.resolve("../../module/html/content/orderConfirm")];
    } catch (error) {
        next(error);
    }
}

/**
 * Place/submit an order
 * POST /client/placeOrder/
 */
async function placeOrder(req, res, next) {
    try {
        if (!req.body.order && !req.body.userId) {
            return res.end();
        }
        
        const orderTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" })
            .slice(0, 19).replace('T', ' ');
        const orderData = Object.entries(req.body.order);
        const userId = req.body.userId;
        let orderInfo = '';
        let orderPriceSum = 0;
        
        // Build order info and calculate total
        for (let i = 0; i < orderData.length; i++) {
            const itemData = await db.dbGetProductDetailsById(orderData[i][0]);
            orderInfo += (itemData[0].itemname + " - " + orderData[i][1] + ", ");
            orderPriceSum += (itemData[0].price * orderData[i][1]);
        }
        
        // Get user details
        const loggedUserDetails = await db.dbGetClientDetailsById(userId);
        
        // Insert order into database
        await db.dbInsertOrderToOrders(orderTime, userId, orderInfo, orderPriceSum);
        await db.dbInsertOrderToClient(orderTime, userId, orderPriceSum);
        
        // Log order
        ordersLogger.order(`
        time: ${orderTime} 
        user: ${userId} 
        sum: ${orderPriceSum} 
        contains: ${orderInfo}
        `);
        
        // Build response
        const orderResponse = `
        ${messageClient.orderResponse1}
        <br>
        ${orderInfo}
        <br>
        ${messageClient.orderResponse2}
        ${orderPriceSum}
        ${messageClient.orderResponse3}
        <br>
        ${messageClient.orderResponse4}
        ${loggedUserDetails[0].name}
        <br>
        ${messageClient.orderResponse5}
        `;
        
        res.send(JSON.stringify(orderResponse));
    } catch (error) {
        next(error);
    }
}

/**
 * Request confirmation to delete last order
 * POST /client/deleteLastOrderConfirm/
 */
async function confirmDeleteLastOrder(req, res, next) {
    try {
        if (!req.body.id || req.body.id == null) {
            return res.end();
        }
        
        const userId = JSON.parse(req.body.id);
        
        // Get order info
        const orderInfo = await db.dbConfirmDeleteLastOrderById(userId);
        const orderData = {
            'sign': orderInfo.sign,
            'orderId': orderInfo.orderid,
            'sum': orderInfo.sum,
            'info': orderInfo.info,
            'time': orderInfo.time
        };
        
        // Get user details
        let loggedUserDetails = await db.dbGetClientDetailsById(userId);
        loggedUserDetails = {
            'id': userId,
            'name': loggedUserDetails[0].name,
            'nick': loggedUserDetails[0].nick,
            'account': loggedUserDetails[0].account
        };
        
        // Log deletion request
        ordersLogger.orderDelete(`
        user: ${userId} 
        contains: ${orderData.info}
        `);
        
        // Build confirmation page
        const deleteOrderConfirmPage = require("../../module/html/content/orderDeleteConfirm");
        const html = JSON.stringify(
            deleteOrderConfirmPage.buildHtml(messageClient, messageUi, loggedUserDetails, orderData)
        );
        
        res.send(html);
        delete require.cache[require.resolve("../../module/html/content/orderDeleteConfirm")];
    } catch (error) {
        next(error);
    }
}

/**
 * Delete last order (confirmed)
 * POST /client/deleteLastOrder/
 */
async function deleteLastOrder(req, res, next) {
    try {
        if (!req.body.id || req.body.id == null) {
            return res.end();
        }
        
        const clientId = JSON.parse(req.body.id);
        const deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientId);
        
        res.send(JSON.stringify(deleteLastOrderResponse));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    requestOrderPage,
    placeOrder,
    confirmDeleteLastOrder,
    deleteLastOrder
};
