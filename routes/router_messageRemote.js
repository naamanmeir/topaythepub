const express = require('express');
const routerRemoteMessageBoard = express.Router();
const functions = require('../functions');
const db = require('../db');
const {messageBoardLogger, actionsLogger, errorLogger} = require('../module/logger');
let messagesJson = require('../messages.json');
const clientEvents = require('./router_client_events');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];
let reqThreshTime = 4000;
let reqThreshState = 0;
let reqThreshTimer;

//------------------------CLIENT MESSAGEBOARD UI-------------------//

routerRemoteMessageBoard.get('/', async function (req, res) {
    res.render('remoteMessage');
});


routerRemoteMessageBoard.get('/openBoard', async function (req, res) {
    let posts = await db.dbGetAllPosts();    
    let renderMessageBoard = require("../module/html/messageBoard/boardWindow");
    let html = renderMessageBoard.buildHtml(messageUi,posts);
    res.send(html);
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "OPEN BOARD WINDOW"
    `); 
    return;
});

//------------------------CLIENT MESSAGEBOARD ACTIONS COMMANDS-------------------//

routerRemoteMessageBoard.post('/insertPost/', async (req, res) => {
    if (!req.body.post || req.body.post == null || req.body.post == "") { res.end(); return; };
    var post = (req.body.post);
    // console.log("insert post");
    // console.log(post);    
    let dbResponse = await db.dbInserPost(post);
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "INSERTED POST"
    `); 
    let posts = await db.dbGetAllPosts();
    let renderMessageBoard = require("../module/html/messageBoard/boardWindow");
    let html = renderMessageBoard.buildHtml(messageUi,posts);
    res.json(html);
    res.end();
    sendRefreshPostsEventToAllClients();
    return;
});

function sendRefreshPostsEventToAllClients(){
    clientEvents.sendEvents("messageBoardReloadPosts");
    return;
};

routerRemoteMessageBoard.get('/refreshPosts/', async (req, res) => {
    let posts = await db.dbGetAllPosts();
    console.log("REFRESH FROM REMOTE")
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "SENT ALL POSTS TO CLIENT"
    `); 
    let renderMessageBoard = require("../module/html/messageBoard/postsDiv");
    let html = renderMessageBoard.buildHtml(messageUi,posts);
    console.log("SENDING")
    res.json(html);
    res.end();
    return;
});

//------------------------CLIENT MESSAGEBOARD UI ACTIONS-------------------//

routerRemoteMessageBoard.get('/windowIsOpen/', async(req,res) => {
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "WINDOW IS OPEN"
    `);    
    res.end();
});

routerRemoteMessageBoard.get('/windowIsClose/', async(req,res) => {
    var funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "WINDOW IS CLOSE"
    `);    
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

module.exports = routerRemoteMessageBoard;