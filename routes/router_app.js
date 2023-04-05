const express = require('express');
const routerApp = express.Router();
const functions = require('../functions');
const db = require('../db');

var now = new Date();

//--------------------------------UI-------------------------------//

routerApp.get('/', async function (req, res) {
    let session = req.session;
    console.log("LOGIN TO APP ON: " + Date());
    res.render('index');
});

routerApp.get('/header', function (req, res) {
    console.log("SEND HEADER");
    res.render('header');
});

routerApp.get('/topMenu', function (req, res) {
    console.log("SEND SIDEMENU");
    res.render('topMenu');
});

routerApp.get('/sideMenu', function (req, res) {
    console.log("SEND TOPMENU");
    res.render('sideMenu');
});

routerApp.get('/floatMenu', function (req, res) {
    console.log("SEND FLOATMENU");
    res.render('floatMenu');
});

routerApp.get('/content', function (req, res) {
    console.log("SEND CONTENT DIV");
    res.render('content');
});

routerApp.get('/contentScript', function (req, res) {
    console.log("SEND CONTENT SCRIPT");
    res.render('contentScript');
});

routerApp.get('/footer', function (req, res) {
    console.log("SEND FOOTER");
    res.render('footer');
});

routerApp.get('/about', function (req, res) {
    console.log("SEND ABOUT");
    res.render('about');
});

//--------------------------------PRODUCTS-------------------------------//

routerApp.get('/getProducts/', async (req, res) => {
    let itemArrayToHtml = require("../module/buildItemHtml");
    let listFromDb = await db.dbGetProducts();
    let html = itemArrayToHtml.buildItemHtml(listFromDb);
    res.send(html);
    console.log("SENT PRODUCTS")
    delete require.cache[require.resolve("../module/buildItemHtml")];
    return;
});

routerApp.get('/getProductsJson/', async (req, res) => {
    let products = [];
    let listFromDb;
    listFromDb = await db.dbGetProducts();
    listFromDb.forEach(item => {
        let row = [item.itemid, item.itemname, item.price, item.itemimgpath];
        products.push(JSON.parse(JSON.stringify(row)));
    });
    res.send(products);
});

routerApp.get('/placeOrder/:data', async function (req, res) {
    console.log("ORDER: ");
    console.log(now);
    // console.log(req.params.data);
    const orderData = (req.params.data).split(',');
    // console.log(orderData);
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

//--------------------------------USERS-------------------------------//

module.exports = routerApp;