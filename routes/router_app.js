const express = require('express');
const routerApp = express.Router();
const functions = require('../functions');
const db = require('../db');
const sessionClassMW = require("../module/sessionClass");

var now = new Date();

//--------------------------------UI-------------------------------//

routerApp.get('/', sessionClassMW(100), async function (req, res) {
    let session = req.session;
    let products = [];
    products = await db.dbGetProducts();
    console.log("LOGIN TO APP ON: " + Date());
    res.render('index', {
        products: products
    })
});

routerApp.get('/about', function (req, res) {
    console.log("SEND ABOUT");
    res.render('about');
    // res.send("SEND TEST");
});

//--------------------------------PRODUCTS-------------------------------//

routerApp.get('/getProducts/', async (req, res) => {
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

routerApp.post('/searchName/:data', async (req, res) => {
    var query = (req.params.data).replace(/\"/g, '');
    if (query == "-") {
        res.send(JSON.stringify("clear"));
        return;
    };
    let names = [];
    names = (await db.dbGetNameBySearch(query));
    res.send(names);
});

routerApp.post('/getUserInfo/:data', async (req, res) => {
    let clientId = JSON.parse(req.params.data);
    let clientInfo = await db.dbGetClientInfoById(clientId);
    // console.log(JSON.stringify(clientInfo));
    res.send(clientInfo)

});

module.exports = routerApp;