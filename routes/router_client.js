const express = require('express');
const routerClient = express.Router();
const functions = require('../functions');
const db = require('../db');

//------------------------CLIENT UI COMMANDS-------------------//


//------------------------CLIENT USER COMMANDS-------------------//
routerClient.post('/userLogin/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    console.log("USER LOGIN ACCEPTED: " + req.body.id);
    res.send("USER LOGIN ACCEPTED: " + req.body.id);
});


routerClient.post('/deleteLastOrder/:data', async (req, res) => {
    let clientID = JSON.parse(req.params.data);
    console.log("APP: DELETE LAST ORDER FROM ID: " + clientID);
    var deleteLastOrderResponse;
    deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientID).then((res) => { return (res) })
    console.log(deleteLastOrderResponse)
    res.send(deleteLastOrderResponse);
});

module.exports = routerClient;