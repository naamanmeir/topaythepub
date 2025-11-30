const express = require('express');
const routerClient = express.Router();
const functions = require('../module/utils/functions');
const db = require('../module/database/db');
const { actionsLogger, ordersLogger, errorLogger } = require('../module/logger');
const validatorClient = require("../module/input/inputValidatorClient.js");
const localizationService = require('../module/localization/LocalizationService');

function getMessages(req) {
    const lang = req.session && req.session.lang ? req.session.lang : 'he';
    return localizationService.getMessages(lang);
}

//------------------------CLIENT UI COMMANDS-------------------//

//------------------------CLIENT USER COMMANDS-------------------//

routerClient.post('/searchName/', async(req, res) => {
    if (!req.body || req.body == null) { res.end(); return; };
    var query = (req.body.name);
    let names = [];
    names = await db.dbGetNameByNick(query);
    const messages = getMessages(req);
    if (names.length == 0) {
        res.send(JSON.stringify({ 'errorClient': messages.client[0].notExist }));
        return;
    };
    res.send(JSON.stringify(names));
    return;
});

routerClient.post('/userLogin/', async(req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let loggedUserDetails = [];
    // actionsLogger.login(actionsLogger.login(req.body.id));
    loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
    const messages = getMessages(req);
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messages.client[0].logged
    });
    res.send(loggedUserDetails);
    return;
});

routerClient.post('/userLogout/', async(req, res) => {
    if (req.body.id) {
        if (req.body.id > 0 && req.body.id < 1000) {
            // console.log("CLIENT USER LOGOUT:");
            // console.log(req.body.id);
            // actionsLogger.logout(`id: ${req.body.id}`);
            res.send(JSON.stringify({ "message": `userId ${req.body.id}LogOut Verifyed on Server` }));
            return;
        };
    };
    res.send("No user data");
    return;
});

routerClient.post('/getUserPage/', async(req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let reqId = req.body.id;
    let userPageModule = require("../module/html/content/userPage");
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
    if (loggedUserDetails.length < 1) {
        console.log("ATTEMPTED INFO FOR INVALID USER ID");
        res.end();
        return;
    };
    const messages = getMessages(req);
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messages.client[0].logged
    });
    loggedUserDetails = JSON.parse(loggedUserDetails);
    let userDataFromDb = await db.dbGetClientInfoById(reqId);
    let html = JSON.stringify(userPageModule.buildHtml(messages.ui[0], loggedUserDetails, userDataFromDb));
    res.send(html);
    delete require.cache[require.resolve("../module/html/content/userPage")];
    return;
});

routerClient.post('/userAutoLogout/', async(req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let autoLoggedOutUserDetails = [];
    autoLoggedOutUserDetails = await db.dbGetClientDetailsById(req.body.id);
    // actionsLogger.userAction(`
    // message: AUTOLOGGEDOUT FROM USER : 
    // name:${autoLoggedOutUserDetails[0].name}
    // nick:${autoLoggedOutUserDetails[0].nick}
    // account:${autoLoggedOutUserDetails[0].account}
    // `);

    const messages = getMessages(req);
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

routerClient.post('/changeNick/', validatorClient(), async(req, res) => {
    if (!req.body.id || req.body.id == null || req.body.newNick == null || req.body.newNick == "") { res.end(); return; }
    let newNick = req.body.newNick;
    let id = req.body.id;
    let existingUserDetails = await db.dbGetClientDetailsById(id);

    let isNickExist = await db.dbGetNameByNickExact(newNick);

    const messages = getMessages(req);

    if (isNickExist.length != 0) {
        res.json({ 'errorClient': messages.client[0].clientChangeNickExist });
        return;
    };

    let newUserNickNameResults = await db.dbChangeNickById(newNick, id);
    console.log(messages.client[0].clientChangeNickOk + '' + newNick)
    res.json({ 'errorClient': messages.client[0].clientChangeNickOk + newNick });
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

routerClient.post('/requestOrderPage/', async(req, res) => {
    if (!req.body.order && !req.body.userId) { res.end(); return; };
    let orderDataRaw = req.body;
    let orderData = Object.entries(req.body.order);
    const messages = getMessages(req);
    for (i = 0; i < orderData.length; i++) {
        if (orderData[i][1] < 0 ||
            orderData[i][1] > 99 ||
            !Number.isInteger(orderData[i][1])) {
            console.log("ERROR WITH ITEMS QUANTITY");
            res.send(JSON.stringify({ 'errorClient': messages.error[0].orderQuantity }));
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
        'message': messages.client[0].orderMessage
    });
    loggedUserDetails = JSON.parse(loggedUserDetails);
    let html = orderConfirmPage.buildHtml(messages.ui[0], loggedUserDetails, orderBuiltData, orderPriceSum);
    orderBuiltData = JSON.stringify(orderBuiltData);
    let htmlOrderData = { "html": html, "orderData": orderDataRaw, "totalSum": orderPriceSum };
    orderBuiltData = JSON.stringify(htmlOrderData);
    res.send(htmlOrderData);
    delete require.cache[require.resolve("../module/html/content/orderConfirm")];
    return;
});

routerClient.post('/placeOrder/', async function(req, res) {
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
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(userId);
    let orderResult;
    orderResult = await db.dbInsertOrderToOrders(orderTime, userId, orderInfo, orderPriceSum).then((orderResult) => { return (orderResult) });
    let orderClient;
    orderClient = await db.dbInsertOrderToClient(orderTime, userId, orderPriceSum).then((orderResult) => { return (orderResult) });
    ordersLogger.order(`
        time: ${orderTime} 
        user: ${userId} 
        sum: ${orderPriceSum} 
        contains: ${orderInfo}
        `);
    const messages = getMessages(req);
    let orderResponse = `
    ${messages.client[0].orderResponse1}
    <br>
    ${orderInfo}
    <br>
    ${messages.client[0].orderResponse2}
    ${orderPriceSum}
    ${messages.client[0].orderResponse3}
    <br>
    ${messages.client[0].orderResponse4}
    ${loggedUserDetails[0].name}
    <br>
    ${messages.client[0].orderResponse5}
    `;
    orderResponse = JSON.stringify(orderResponse);
    res.send(orderResponse);
    return;
});

routerClient.post('/deleteLastOrderConfirm/', async(req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let userId = JSON.parse(req.body.id);
    let orderInfo;
    orderInfo = await db.dbConfirmDeleteLastOrderById(userId);
    orderInfo = JSON.stringify({
        'sign': orderInfo.sign,
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
    contains: ${orderInfo.info}
    `);
    const messages = getMessages(req);
    let deleteOrderConfirmPage = require("../module/html/content/orderDeleteConfirm");
    let html = JSON.stringify(deleteOrderConfirmPage.buildHtml(messages.client[0], messages.ui[0], loggedUserDetails, orderInfo));
    res.send(html);
    delete require.cache[require.resolve("../module/html/content/orderDeleteConfirm")];
    return;
});

routerClient.post('/deleteLastOrder/', async(req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; };
    let clientId = JSON.parse(req.body.id);
    let deleteLastOrderResponse;
    deleteLastOrderResponse = JSON.stringify(await db.dbDeleteLastOrderById(clientId));
    res.send(deleteLastOrderResponse);
    return;
});

//------------------------CLIENT UI ACTIONS-------------------//

routerClient.post('/getDisplayInfo/', async(req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let reqId = req.body.id;

    let displayInfo = await db.dbGetPindPosts();
    // console.log(displayInfo);
    // let displayInfoHtml = require("../module/html/content/getDisplayInfo");
    // console.log(displayInfo)
    let html = JSON.stringify(displayInfo);
    res.send(html);
    // delete require.cache[require.resolve("../module/html/content/getDisplayInfo")];
    return;
});

routerClient.get('/windowIsOpen/', async(req, res) => {
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    // actionsLogger.userAction(`
    // time: ${funcTime} 
    // "WINDOW IS OPEN"
    // `);    
    res.end();
});

routerClient.get('/windowIsClose/', async(req, res) => {
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    // actionsLogger.userAction(`
    // time: ${funcTime} 
    // "WINDOW IS CLOSE"
    // `);    
    res.end();
});

module.exports = routerClient;