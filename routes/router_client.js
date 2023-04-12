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
    console.log(req.body);
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
});

routerClient.post('/userLogin/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    // console.log("login function")
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

// routerClient.post('/getUserInfo/:data', async (req, res) => {
//     let clientId = JSON.parse(req.params.data);
//     let clientInfo = await db.dbGetClientInfoById(clientId);
//     res.send(clientInfo)
// });

//------------------------CLIENT USER ACTIONS-------------------//

routerClient.post('/requestOrderPage/', async (req, res) => {
    if (!req.body.order && !req.body.userId) { res.end(); return; }
    let orderData = Object.entries(req.body.order);
    for (i = 0; i < orderData.length; i++) {
        if (orderData[i][0] < 0 ||
            orderData[i][0] > 99 ||
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
        let itemData = await db.dbGetProductDetailsById(orderData[i][0])
        let itemRaw = [orderData[i][1], itemData[0].itemname, itemData[0].price, (itemData[0].price * orderData[i][1]), itemData[0].itemimgpath]
        orderBuiltData[i] = itemRaw;
        orderPriceSum += (itemData[0].price * orderData[i][1]);
        console.log(orderPriceSum);
    };
    console.log(orderBuiltData);
    console.log(orderPriceSum);

    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(userId);
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messageClient.logged
    });
    loggedUserDetails = JSON.parse(loggedUserDetails);
    let html = orderConfirmPage.buildOrderConfirm(loggedUserDetails, orderData);
    res.send(html);
    console.log("SENT ORDER CONFIRMATION PAGE AS HTML")
    delete require.cache[require.resolve("../module/buildOrderConfirm")];
    return;
});

routerClient.post('/placeOrder/', async function (req, res) {
    console.log("ORDER: ");
    console.log(now);
    console.log(req.body.orderData);
    const orderData = (req.body.orderData);
    let clientId = orderData[orderData.length - 1];
    let totalPrice = orderData[orderData.length - 2];
    // console.log(clientId);
    // console.log(totalPrice);
    let orderInfo;
    for (let i = 0; i < orderData.length - 2; i = i + 2) {
        if (orderInfo == null || orderInfo == "") {
            orderInfo = (orderData[i] + "-" + orderData[i + 1] + ".");
        } else {
            orderInfo += (orderData[i] + "-" + orderData[i + 1] + ".");
        }
    }
    console.log("order info: " + orderInfo);
    var orderDate = now;
    var orderTime = now;
    // console.log("date: "+orderDate+" time: "+orderTime+" id: "+id+" ,item1: "+item1+" ,item2:"+item2+" ,item3: "+item3+" ,item4: "+item4);
    let orderResult;
    orderResult = await db.dbInsertOrderToOrders(orderTime, clientId, orderInfo, totalPrice).then((orderResult) => { return (orderResult) });
    res.send(orderResult);
});

routerClient.post('/deleteLastOrder/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let clientId = JSON.parse(req.body.id);
    let deleteLastOrderResponse;
    deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientId);
    console.log(deleteLastOrderResponse);
    res.send(deleteLastOrderResponse);
});

module.exports = routerClient;