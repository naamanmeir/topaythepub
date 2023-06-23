const express = require('express');
const routerRemoteMessageBoard = express.Router();
const functions = require('../functions');
const db = require('../db');
const clientEvents = require('./router_client_events');
const {messageBoardLogger, actionsLogger, errorLogger} = require('../module/logger');
let messagesJson = require('../messages.json');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];

//------------------------CLIENT MESSAGEBOARD UI-------------------//

routerRemoteMessageBoard.get('/', async function (req, res) {
    res.render('remoteMessage',{
        msgHeader:messageUi.remoteMessageBoardHeader,
        msgButtonSend:messageUi.remoteMessageBoardButtonSendMessage,        
        msgInputPlaceholder:messageUi.remoteMessageBoardPlaceholder,
        msgButtonPicture:messageUi.remoteMessageBoardButtonSendPicture
    });
});

//------------------------CLIENT MESSAGEBOARD ACTIONS COMMANDS-------------------//

routerRemoteMessageBoard.post('/insertPost/', async (req, res) => {
    if (!req.body.post || req.body.post == null || req.body.post == "") { res.end(); return; };
    var post = (req.body.post);  
    let dbResponse = await db.dbInserPost(post);
    var funcTime = getTime();
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
    clientEvents.sendEvents("reloadPosts");
    return;
};

routerRemoteMessageBoard.get('/reloadPosts/', async (req, res) => {
    let posts = await db.dbGetAllPosts();    
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "SENT ALL POSTS TO CLIENT"
    `); 
    let renderMessageBoard = require("../module/html/messageBoard/postsDiv");
    let html = renderMessageBoard.buildHtml(messageUi,posts);    
    res.json(html);
    res.end();
    return;
});

//------------------------CLIENT REDIRECT EVENTS TO EVENTS ROUTER-------------------//


routerRemoteMessageBoard.get('/events/', (req, res) => {    
    res.redirect('../events/')
});

routerRemoteMessageBoard.get('/reloadPosts/', (req, res) => {    
    res.redirect('../reloadPosts/')
});
//------------------------CLIENT MESSAGEBOARD UI ACTIONS-------------------//

routerRemoteMessageBoard.get('/windowIsOpen/', async(req,res) => {
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "WINDOW IS OPEN"
    `);    
    res.end();
});

routerRemoteMessageBoard.get('/windowIsClose/', async(req,res) => {
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "WINDOW IS CLOSE"
    `);    
    res.end();
});

function getTime(){
    return new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
};

module.exports = routerRemoteMessageBoard;