const express = require('express');
const routerClient = express.Router();
const functions = require('../functions');
const db = require('../db');
const sessionClassMW = require("../module/sessionClass");

routerClient.get('/', sessionClassMW(100), async function (req, res) {
    let session = req.session;
    let products = [];
    products = await db.dbGetProducts();
    console.log("LOGIN TO APP ON: " + Date());
    res.render('index', {
        products: products
    })
});

//------------------------CLIENT UI COMMANDS-------------------//


//------------------------CLIENT USER COMMANDS-------------------//

routerClient.post('/deleteLastOrder/:data', async (req, res) => {
    let clientID = JSON.parse(req.params.data);
    console.log("APP: DELETE LAST ORDER FROM ID: " + clientID);
    var deleteLastOrderResponse;
    deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientID).then((res) => { return (res) })
    console.log(deleteLastOrderResponse)
    res.send(deleteLastOrderResponse);
});

module.exports = routerClient;