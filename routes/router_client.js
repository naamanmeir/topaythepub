const express = require('express');
const routerClient = express.Router();
const functions = require('../functions');
const db = require('../db');
const {actionsLogger, ordersLogger, errorLogger} = require('../module/logger');
const validatorClient = require("../module/input/inputValidatorClient.js");
let messagesJson = require('../messages.json');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];


//------------------------CLIENT UI COMMANDS-------------------//

//------------------------CLIENT USER COMMANDS-------------------//

routerClient.post('/searchName/', async (req, res) => {
    if (!req.body || req.body == null) { res.end(); return; };
    var query = (req.body.name);
    let names = [];
    names = await db.dbGetNameByNick(query);
    if (names.length == 0) {
        res.send(JSON.stringify({ 'errorClient': messageClient.notExist }));
        return;
    };    
    res.send(JSON.stringify(names));
    return;
});

routerClient.post('/userLogin/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);    
    actionsLogger.login(`
        id: ${req.body.id} ,
        name:${loggedUserDetails[0].name},
        nick:${loggedUserDetails[0].nick},
        account:${loggedUserDetails[0].account}
        `);
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messageClient.logged
    });
    res.send(loggedUserDetails);
    return;
});

routerClient.post('/userLogout/', async (req,res)=>{    
    if(req.body.id){
        if(req.body.id > 0 && req.body.id < 1000){
            console.log("CLIENT USER LOGOUT:");
            console.log(req.body.id);
            res.send(JSON.stringify({"message":`userId ${req.body.id}LogOut Verifyed on Server`}));
            return;
        };
    };
    res.send("No user data");
    return;
});

routerClient.post('/getUserPage/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let reqId = req.body.id;
    let userPageModule = require("../module/html/content/userPage");
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
    if(loggedUserDetails.length<1){
        console.log("ATTEMPTED INFO FOR INVALID USER ID");
        res.end();
        return;
    };
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messageClient.logged
    });
    loggedUserDetails = JSON.parse(loggedUserDetails);
    let userDataFromDb = await db.dbGetClientInfoById(reqId);
    let html = JSON.stringify(userPageModule.buildHtml(messageUi,loggedUserDetails, userDataFromDb));
    res.send(html);
    delete require.cache[require.resolve("../module/html/content/userPage")];
    return;
});

routerClient.post('/userAutoLogout/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let autoLoggedOutUserDetails = [];
    autoLoggedOutUserDetails = await db.dbGetClientDetailsById(req.body.id);
    actionsLogger.userAction(`
    message: AUTOLOGGEDOUT FROM USER : 
    name:${autoLoggedOutUserDetails[0].name}
    nick:${autoLoggedOutUserDetails[0].nick}
    account:${autoLoggedOutUserDetails[0].account}
    `);

    autoLoggedOutUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': autoLoggedOutUserDetails[0].name,
        'nick': autoLoggedOutUserDetails[0].nick,
        'account': autoLoggedOutUserDetails[0].account,
        'message': autoLoggedOutUserDetails.logged
    });
    res.send(autoLoggedOutUserDetails);
    return;
});

routerClient.post('/changeNick/', validatorClient(), async (req, res) => {
    if (!req.body.id || req.body.id == null || req.body.newNick == null || req.body.newNick == "") { res.end(); return; }
    let newNick = req.body.newNick;
    let id = req.body.id;
    let existingUserDetails = await db.dbGetClientDetailsById(id);
    
    let isNickExist = await db.dbGetNameByNickExact(newNick);

    if(isNickExist.length != 0){
        res.json({'errorClient':messageClient.clientChangeNickExist});
        return;
    };

    let newUserNickNameResults = await db.dbChangeNickById(newNick,id);
    console.log(messageClient.clientChangeNickOk +''+ newNick)
    res.json({'errorClient':messageClient.clientChangeNickOk + newNick});
    actionsLogger.userAction(`
    message: CHANGE NICKNAME OF USER : 
    id: ${req.body.id} ,
    name:${existingUserDetails[0].name},
    nick:${existingUserDetails[0].nick},
    account:${existingUserDetails[0].account}
    TO NEW NICKNAME: ${newNick}
    `);
    return;
});
//------------------------CLIENT USER ACTIONS-------------------//

routerClient.post('/requestOrderPage/', async (req, res) => {
    if (!req.body.order && !req.body.userId) { res.end(); return; };
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
    let orderConfirmPage = require("../module/html/content/orderConfirm");
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
    let html = orderConfirmPage.buildHtml(messageUi,loggedUserDetails, orderBuiltData, orderPriceSum);
    orderBuiltData = JSON.stringify(orderBuiltData);
    let htmlOrderData = { "html": html, "orderData": orderDataRaw, "totalSum": orderPriceSum };
    orderBuiltData = JSON.stringify(htmlOrderData);
    res.send(htmlOrderData);
    delete require.cache[require.resolve("../module/html/content/orderConfirm")];
    return;
});

routerClient.post('/placeOrder/', async function (req, res) {
    if (!req.body.order && !req.body.userId) { res.end(); return; };
    var orderTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    orderTime = orderTime.slice(0, 19).replace('T', ' ');
    let orderData = Object.entries(req.body.order);
    let userId = req.body.userId;
    let orderInfo = '';
    var orderPriceSum = 0;
    for (i = 0; i < orderData.length; i++) {
        let itemData = await db.dbGetProductDetailsById(orderData[i][0]);
        orderInfo += (itemData[0].itemname + " - " + orderData[i][1] + ", ");
        orderPriceSum += (itemData[0].price * orderData[i][1]);
    };
    let orderResult;
    orderResult = JSON.stringify(await db.dbInsertOrderToOrders(orderTime, userId, orderInfo, orderPriceSum).then((orderResult) => { return (orderResult) }));    
    ordersLogger.order(`
        time: ${orderTime} 
        user: ${userId} 
        sum: ${orderPriceSum} 
        contains: ${orderInfo}
        `);
    res.send(orderResult);
    return;
});

routerClient.post('/deleteLastOrderConfirm/', async (req, res) => {    
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let userId = JSON.parse(req.body.id);
    let orderInfo;
    orderInfo = await db.dbConfirmDeleteLastOrderById(userId);    
    orderInfo = JSON.stringify({
        'orderId': orderInfo.orderid,
        'sum': orderInfo.sum,
        'info': orderInfo.info,
        'time': orderInfo.time
    });
    orderInfo = JSON.parse(orderInfo);    
    loggedUserDetails = await db.dbGetClientDetailsById(userId);
    loggedUserDetails = JSON.stringify({
        'id': userId,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account
    });
    loggedUserDetails = JSON.parse(loggedUserDetails);
    ordersLogger.orderDelete(`
    user: ${userId} 
    contains: ${orderInfo}
    `);
    let deleteOrderConfirmPage = require("../module/html/content/orderDeleteConfirm");
    let html = JSON.stringify(deleteOrderConfirmPage.buildHtml(messageClient,messageUi,loggedUserDetails, orderInfo));    
    res.send(html);
    delete require.cache[require.resolve("../module/html/content/orderDeleteConfirm")];
    return;
});

routerClient.post('/deleteLastOrder/', async (req, res) => {    
    if (!req.body.id || req.body.id == null) { res.end(); return; };
    let clientId = JSON.parse(req.body.id);
    let deleteLastOrderResponse;
    deleteLastOrderResponse = JSON.stringify(await db.dbDeleteLastOrderById(clientId));
    res.send(deleteLastOrderResponse);
    return;
});

//------------------------CLIENT UI ACTIONS-------------------//

routerClient.get('/windowIsOpen/', async(req,res) => {
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    actionsLogger.userAction(`
    time: ${funcTime} 
    "WINDOW IS OPEN"
    `);    
    res.end();
});

routerClient.get('/windowIsClose/', async(req,res) => {
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    actionsLogger.userAction(`
    time: ${funcTime} 
    "WINDOW IS CLOSE"
    `);    
    res.end();
});

module.exports = routerClient;