const express = require('express');
const routerRemoteMessageBoard = express.Router();
const functions = require('../functions');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const clientEvents = require('./router_client_events');
const {messageBoardLogger, actionsLogger, errorLogger} = require('../module/logger');
let messagesJson = require('../messages.json');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];

const MaxPostLength = 400;

let chatbot = require("../module/chatbot/chatbot");

let chatbotCall = messageUi.chatbotName1;

//------------------------CLIENT MESSAGEBOARD UI-------------------//

routerRemoteMessageBoard.get('/', async function (req, res) {
    res.render('remoteMessage',{
        msgHeader:messageUi.remoteMessageBoardHeader,
        msgButtonSend:messageUi.remoteMessageBoardButtonSendMessage,
        msgButtonSendError:messageUi.remoteMessageBoardButtonErrorMessage,
        msgInputPlaceholder:messageUi.remoteMessageBoardPlaceholder,
        msgOtherSideIsTypingMessage:messageUi.otherSideIsTypingMessage,
        msgButtonAddPicture:messageUi.remoteMessageBoardButtonAddPicture,
        msgButtonRemovePicture:messageUi.remoteMessageBoardButtonRemovePicture,
        msgButtonSendError:messageUi.remoteMessageBoardButtonErrorMessage
    });
});

//------------------------CLIENT MESSAGEBOARD ACTIONS COMMANDS-------------------//

routerRemoteMessageBoard.post('/insertPost/', async (req, res) => {
    if (!req.body.post || req.body.post == null || req.body.post == "") { res.end(); return; };
    var post = (req.body.post);
    if(post.length > MaxPostLength){ res.end(); return; };
    if(findReferences(post,messageUi.chatbotName1Variations)){sendPostToChatbot(post);};
    var img;    
    let dbResponse = await db.dbInsertPost(post,null,img);
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

routerRemoteMessageBoard.post('/deletePost/', async (req, res) => {    
    if (!req.body.postid || req.body.postid == null) { res.end(); return; };    
    let postid = JSON.parse(req.body.postid);
    if (!Number.isInteger(postid)) {res.end();return;};
    if (req.body.postContent) {console.log("call method deleteByContent");return;};
    let dbResponse = await db.dbDeletePostById(postid);
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "DELETED POST"
    `); 
    let posts = await db.dbGetAllPosts();
    let renderMessageBoard = require("../module/html/messageBoard/postsDiv");
    let html = renderMessageBoard.buildHtml(messageUi,posts);
    res.json(html);
    res.end();
    sendRefreshPostsEventToAllClients();
    return;    
});

function renameFileIfExist(file){
    if(fs.existsSync(file)){
        let fileNameDir = path.parse(file).dir;
        let fileNameBase = path.parse(file).name;
        let fileNameExt = path.parse(file).ext;
        let currentTime = Date.now();
        let nameAfterRename = fileNameDir + "/" + fileNameBase + currentTime + fileNameExt;
        console.log(nameAfterRename);
        return nameAfterRename;
        }else{        
        return file;
        }
    };

routerRemoteMessageBoard.post('/insertImage', async (req, res) => {
    const options = {
        uploadDir: __dirname + '/../public/img/posts/',
        filter: function ({ name, originalFilename, mimetype }) {
            return mimetype && mimetype.includes("image");
        }
    };
    const form = formidable(options);
    let newName;
    let originalName;
    let post;
    let finalImageName;
    form.parse(req, function (err, fields, files) {
        newName = files.img.filepath;
        originalName = (__dirname + '/../public/img/posts/') + (files.img.originalFilename);
        originalName = renameFileIfExist(originalName);
        fs.rename(newName, originalName, function(err) {
            if (err) console.log(err);
        });
        post = fields.post;
        finalImageName = (path.parse(originalName).name)+path.parse(originalName).ext;        
        finalImageName = JSON.stringify(finalImageName);
        insertPostWithImage(req,res,post,null,finalImageName)
    });
   
});

async function insertPostWithImage(req,res,post,user,image){
    post = post.substring(0,MaxPostLength);
    if(findReferences(post,messageUi.chatbotName1Variations)){sendPostToChatbot(post);};
    let dbResponse = await db.dbInsertPost(post,user,image);
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "INSERTED POST"
    `); 
    // let posts = await db.dbGetAllPosts();
    // let renderMessageBoard = require("../module/html/messageBoard/boardWindowRemote");
    // let html = renderMessageBoard.buildHtml(messageUi,posts);
    // res.json(html);
    res.end();
    sendRefreshPostsEventToAllClients();
    return; 
};

function findReferences(source,target){
    if(Array.isArray(target)){
        for(let i = 0;i < target.length;i++){
            if(source.search(target[i])>=0){                
                return true;};
        };
    };
    if(source.search(target)>=0){        
        return true;
    };
    return false;
};

function findReferencesWithIndex(source,target){      
    if(Array.isArray(target)){
        for(let i = 0;i < target.length;i++){
            let find =  source.search(target[i]);
            if(find >= 0){
                return find;
          };
        };
    };
    let find = source.search(target);
    if(find >= 0){
        return find;
    };
    return -1;
};

async function sendPostToChatbot(post){
    let findChatbotCodeRemember = findReferencesWithIndex(post,messageUi.chatbotRememberCode);
    let findChatbotCodeForget = findReferencesWithIndex(post,messageUi.chatbotForgetCode);
    let findChatbotCodeForgetEverything = findReferencesWithIndex(post,messageUi.chatbotForgetEverythingCode);

    if(findChatbotCodeRemember >= 0){
        sendFactToChatbot(post.substring(findChatbotCodeRemember+messageUi.chatbotRememberCode.length));
    };
    if(findChatbotCodeForget >= 0){
        sendRemoveFactToChatbot(post.substring(findChatbotCodeForget+messageUi.chatbotForgetCode.length));
    };
    if(findChatbotCodeForgetEverything >= 0){
        sendRemoveAllFactsToChatbot();
    };
    if(chatbot.chatbotIsBusy == 1){
        var funcTime = getTime();        
        messageBoardLogger.clientMessageBoard(`
        time: ${funcTime} 
        "ATTEMPTED CHATBOT REPLY BUT CHATBOT WAS BUSY : ${messageUi.chatbotName1}"
        `);
        return;
    };
    sendChatBotIsNotTypingToAllClients();
    sendChatBotIsTypingToAllClients();
    chatbot.chatbotIsBusy = 1;
    let chatbotPost = await chatbot.talkToDavid(post);
    let img;    
    let dbResponse = await db.dbInsertPost(chatbotPost,75,img);
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "INSERTED POST FROM ${messageUi.chatbotName1}"
    `);
    sendChatBotIsNotTypingToAllClients();
    sendRefreshPostsEventToAllClients();
    chatbot.chatbotIsBusy = 0;
    return;
};

async function sendFactToChatbot(fact){    
    let dbResponse = db.dbInsertFact(fact);
    return dbResponse;
};

async function sendRemoveFactToChatbot(fact){    
    let dbResponse = db.dbRemoveFact(fact);
    return dbResponse;
};

async function sendRemoveAllFactsToChatbot(){    
    let dbResponse = db.dbRemoveAllFacts();
    return dbResponse;
};

function sendRefreshPostsEventToAllClients(){
    clientEvents.sendEvents("reloadPosts");
    return;
};

function sendChatBotIsTypingToAllClients(){
    clientEvents.sendEvents("chatbotIsTyping");
    return;
};

function sendChatBotIsNotTypingToAllClients(){
    clientEvents.sendEvents("chatbotIsNotTyping");
    return;
};

routerRemoteMessageBoard.get('/reloadPosts/', async (req, res) => {
    let posts = await db.dbGetAllPosts();    
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "SENT ALL POSTS TO CLIENT"
    `); 
    let renderMessageBoard = require("../module/html/messageBoard/postsDivRemote");
    let html = renderMessageBoard.buildHtml(messageUi,posts);    
    res.json(html);
    res.end();
    return;
});

//------------------------CLIENT REDIRECT EVENTS TO EVENTS ROUTER-------------------//

routerRemoteMessageBoard.get('/events/', (req, res) => {    
    res.redirect('../events/')
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