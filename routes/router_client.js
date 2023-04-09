const express = require('express');
const routerClient = express.Router();
const functions = require('../functions');
const db = require('../db');
let messagesJson = require('../messages.json');
let messageClient = messagesJson.client[0];
let messageUi = messagesJson.ui[0];

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

routerClient.post('/getUserInfo/:data', async (req, res) => {
    let clientId = JSON.parse(req.params.data);
    let clientInfo = await db.dbGetClientInfoById(clientId);
    res.send(clientInfo)
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