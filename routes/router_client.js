const express = require('express');
const routerClient = express.Router();
const functions = require('../functions');
const db = require('../db');
var validator = require('validator');

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
    res.send(names);
});

routerClient.post('/userLogin/', async (req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    console.log("login function")
    console.log("USER LOGIN ACCEPTED: " + req.body.id);
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account
    });
    console.log("LOGGED USER DETAILS: " + loggedUserDetails)
    res.send(loggedUserDetails);
});

routerClient.post('/getUserInfo/:data', async (req, res) => {
    let clientId = JSON.parse(req.params.data);
    let clientInfo = await db.dbGetClientInfoById(clientId);
    // console.log(JSON.stringify(clientInfo));
    res.send(clientInfo)
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