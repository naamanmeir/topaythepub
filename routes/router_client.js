const express = require('express');
const routerClient = express.Router();
const functions = require('../functions');
const db = require('../db');
let messagesJson = require('../messages.json');
let messageClient = messagesJson.client[0];
let messageUi = messagesJson.ui[0];
let messageError = messagesJson.error[0];

//------------------------CLIENT UI COMMANDS-------------------//

//------------------------CLIENT USER COMMANDS-------------------//

routerClient.post('/searchName/', async (req, res) => {
    if (!req.body || req.body == null) { res.end(); return; };
    var query = (req.body.name);
    if (query == "-") {
        res.send(JSON.stringify("clear"));
        return;
    };
    let names = [];
    names = (await db.dbGetNameBySearch(query));
    if (names.length == 0) {
        res.send(JSON.stringify({ 'errorClient': messageClient.notExist }));
        return;
    };
    names = JSON.stringify(names);
    res.send(names);
    return;
});

routerClient.post('/userLogin/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    console.log("USER LOGIN ACCEPTED: " + req.body.id);
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messageClient.logged
    });
    console.log("LOGGED USER DETAILS: " + loggedUserDetails)
    res.send(loggedUserDetails);
    return;
});

routerClient.post('/getUserPage/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let reqId = req.body.id;
    console.log("GET USER DATA FOR: " + reqId);
    let userPageModule = require("../module/buildUserPage");
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messageClient.logged
    });
    loggedUserDetails = JSON.parse(loggedUserDetails);
    let userDataFromDb = await db.dbGetClientInfoById(reqId);
    let html = userPageModule.buildUserPage(loggedUserDetails, userDataFromDb);
    res.send(html);
    console.log("SENT USER INFO AS HTML")
    delete require.cache[require.resolve("../module/buildUserPage")];
    return;
});

//------------------------CLIENT USER ACTIONS-------------------//

routerClient.post('/requestOrderPage/', async (req, res) => {
    if (!req.body.order && !req.body.userId) { res.end(); return; }
    let orderDataRaw = req.body;
    let orderData = Object.entries(req.body.order);
    for (i = 0; i < orderData.length; i++) {
        if (orderData[i][1] < 0 ||
            orderData[i][1] > 99 ||
            !Number.isInteger(orderData[i][1])) {
            console.log("ERROR WITH ITEMS QUANTITY");
            res.send(JSON.stringify({ 'errorClient': messageError.orderQuantity }));
            res.end();
            return;
        };
    };
    let userId = req.body.userId;
    console.log("request order confirmation for order: ");
    console.log(orderData);
    console.log("for user id: ");
    console.log(userId);
    let orderConfirmPage = require("../module/buildOrderConfirm");
    let orderBuiltData = [];
    var orderPriceSum = 0;
    for (i = 0; i < orderData.length; i++) {
        let itemData = await db.dbGetProductDetailsById(orderData[i][0]);
        let itemRaw = [orderData[i][1], itemData[0].itemname, itemData[0].price, (itemData[0].price * orderData[i][1]), itemData[0].itemimgpath];
        orderBuiltData[i] = itemRaw;
        orderPriceSum += (itemData[0].price * orderData[i][1]);
    };
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(userId);
    loggedUserDetails = JSON.stringify({
        'id': userId,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messageClient.orderMessage
    });
    loggedUserDetails = JSON.parse(loggedUserDetails);
    let html = orderConfirmPage.buildOrderConfirm(loggedUserDetails, orderBuiltData, orderPriceSum);
    orderBuiltData = JSON.stringify(orderBuiltData);
    let htmlOrderData = { "html": html, "orderData": orderDataRaw, "totalSum": orderPriceSum };
    orderBuiltData = JSON.stringify(htmlOrderData);
    res.send(htmlOrderData);
    console.log("SENT ORDER CONFIRMATION PAGE AS HTML")
    delete require.cache[require.resolve("../module/buildOrderConfirm")];
    return;
});

routerClient.post('/placeOrder/', async function (req, res) {
    if (!req.body.order && !req.body.userId) { res.end(); return; };
    var orderTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    orderTime = orderTime.toString().replace(',', '');
    let orderData = Object.entries(req.body.order);
    let userId = req.body.userId;
    let orderInfo = '';
    var orderPriceSum = 0;
    for (i = 0; i < orderData.length; i++) {
        let itemData = await db.dbGetProductDetailsById(orderData[i][0]);
        orderInfo += (itemData[0].itemname + " - " + orderData[i][1] + ", ");
        orderPriceSum += (itemData[0].price * orderData[i][1]);
    };
    console.log("NEW ORDER: ");
    console.log("order info: " + orderInfo);
    console.log("total sum: " + orderPriceSum);
    console.log("user id: " + userId);
    console.log("at time: " + orderTime);
    let orderResult;
    orderResult = await db.dbInsertOrderToOrders(orderTime, userId, orderInfo, orderPriceSum).then((orderResult) => { return (orderResult) });
    res.send(orderResult);
    return;
});

routerClient.post('/deleteLastOrder/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let clientId = JSON.parse(req.body.id);
    let deleteLastOrderResponse;
    deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientId);
    res.send(deleteLastOrderResponse);
    return;
});

module.exports = routerClient;