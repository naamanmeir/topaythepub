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

routerMessageBoard.get('/openBoard', async function (req, res) {
    let posts = await db.dbGetAllPosts();
    console.log(await posts);
    let renderMessageBoard = require("../module/html/messageBoard/boardWindow");
    let html = renderMessageBoard.buildHtml(messageUi,posts);
    res.send(html);
});

//------------------------CLIENT MESSAGEBOARD ACTIONS COMMANDS-------------------//

routerMessageBoard.post('/insertPost/', async (req, res) => {
    if (!req.body || req.body == null) { res.end(); return; };
    var post = (req.body.post);
    console.log(post);
    let dbResponse = db.dbInserPost(post);
    console.log(dbResponse);
    let posts = await db.dbGetAllPosts();
    let renderMessageBoard = require("../module/html/messageBoard/boardWindow");
    let html = renderMessageBoard.buildHtml(messageUi,posts);
    res.send(html);
    return;
});

routerMessageBoard.get('/getAllPosts/', async (req, res) => {
    console.log("get all posts");
    res.send("get all posts");
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