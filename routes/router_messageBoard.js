const express = require('express');
const routerMessageBoard = express.Router();
const functions = require('../functions');
const db = require('../db');
const {messageBoardLogger, actionsLogger, errorLogger} = require('../module/logger');
let messagesJson = require('../messages.json');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];
let reqThreshTime = 4000;
let reqThreshState = 0;
let reqThreshTimer;

//------------------------CLIENT MESSAGEBOARD UI-------------------//

routerMessageBoard.get('/openBoard', function (req, res) {
    let renderMessageBoard = require("../module/html/messageBoard/boardWindow");
    let html = renderMessageBoard.buildHtml(messageUi);
    res.send(html);
});

//------------------------CLIENT MESSAGEBOARD ACTIONS COMMANDS-------------------//

routerMessageBoard.post('/insertPost/', async (req, res) => {
    if (!req.body || req.body == null) { res.end(); return; };
    var user = (req.body.name);
    let names = [];
    names = await db.dbGetNameBySearch(query);
    if (names.length == 0) {
        res.send(JSON.stringify({ 'errorClient': messageClient.notExist }));
        return;
    };    
    res.send(JSON.stringify(names));
    return;
});

//------------------------CLIENT MESSAGEBOARD UI ACTIONS-------------------//

routerMessageBoard.get('/windowIsOpen/', async(req,res) => {
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    actionsLogger.userAction(`
    time: ${funcTime} 
    "WINDOW IS OPEN"
    `);
    // reqThreshState = 0;
    res.end();
});

routerMessageBoard.get('/windowIsClose/', async(req,res) => {
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    actionsLogger.userAction(`
    time: ${funcTime} 
    "WINDOW IS CLOSE"
    `);
    // reqThreshState = 0;
    res.end();
});

function reqThreshFunc(){
    if(reqThreshState==1){return true};
    if(reqThreshState==0){reqThreshState=1};
    clearTimeout(reqThreshTimer);
    reqThreshTimer = setTimeout(()=>{
        reqThreshState = 0;
    },reqThreshTime)
    return false;
};

module.exports = routerMessageBoard;