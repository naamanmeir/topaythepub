const express = require('express');
const routerMessageBoard = express.Router();
const functions = require('../functions');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const {messageBoardLogger, actionsLogger, errorLogger} = require('../module/logger');
let messagesJson = require('../messages.json');
const clientEvents = require('./router_client_events');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];

const MaxPostLength = 400;

let chatbot = require("../module/outsource/chatbot");
let photobot =  require("../module/outsource/hug_circulus")
let translate =  require("../module/outsource/gpt_translate");

let chatbotCall = messageUi.chatbotName1;

//------------------------REMOTE CLIENT BOARD-------------------//

routerMessageBoard.get('/remoteMboard/', async function (req, res) {
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


//------------------------CLIENT MESSAGEBOARD UI-------------------//

routerMessageBoard.get('/openBoard', async function (req, res) {
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

routerMessageBoard.post('/insertPost/', async (req, res) => {
    if (!req.body.post || req.body.post == null || req.body.post == "") { res.end(); return; };
    var post = (req.body.post);
    if(post.length > MaxPostLength){ res.end(); return; };
    if(findReferences(post,messageUi.chatbotName1Variations)==true){sendPostToChatbot(post);};
    if(findReferences(post,messageUi.photobotCodeActivate)==true){sendPostToPhotobot(post);};
    if(findReferences(post,messageUi.photobotCodeActivateItemImage)==true){sendPostToPhotobotItemPhoto(post);};    
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

routerMessageBoard.post('/pinPost/', async (req, res) => {    
    if (!req.body.postid || req.body.postid == null) { res.end(); return; };    
    let postid = JSON.parse(req.body.postid);
    if (!Number.isInteger(postid)) {res.end();return;};
    let dbResponse = await db.dbIsPostPindById(postid);
    let dbAction;
    let currentPin = dbResponse[0].pin;
    let newPin;
    if(currentPin==null){
        currentPin=0;
        newPin = 1};
    newPin = currentPin==0?1:0;
    dbAction = await db.dbPinPostById(newPin,postid);    
    messageBoardLogger.clientMessageBoard(`
    set ${postid} pin value to ${newPin}
    `);
    res.json('ok post pind');
    res.end();
    sendRefreshPostsNoScrollEventToAllClients();
    return;
});

routerMessageBoard.post('/deletePost/', async (req, res) => {    
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
    sendRefreshPostsNoScrollEventToAllClients();
    return;    
});

function renameFileIfExist(file){
    if(fs.existsSync(file)){
        let fileNameDir = path.parse(file).dir;
        let fileNameBase = path.parse(file).name;
        let fileNameExt = path.parse(file).ext;
        let currentTime = Date.now();
        let nameAfterRename = fileNameDir + "/" + fileNameBase + currentTime + fileNameExt;        
        return nameAfterRename;
        }else{        
        return file;
        }
    };

routerMessageBoard.post('/insertImage', async (req, res) => {
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
        insertPostWithImage(req,res,post,null,finalImageName);
    });
   
});

async function insertPostWithImage(req,res,post,user,image){
    post = post.substring(0,MaxPostLength);
    if(findReferences(post,messageUi.chatbotName1Variations)==true){sendPostToChatbot(post);};
    let dbResponse = await db.dbInsertPost(post,user,image);
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "INSERTED POST"
    `); 
    let posts = await db.dbGetAllPosts();
    let renderMessageBoard = require("../module/html/messageBoard/boardWindowRemote");
    let html = renderMessageBoard.buildHtml(messageUi,posts);
    res.json(html);
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

async function sendPostToPhotobot(post){
    if(photobot.photobotIsBusy == 1){messageBoardLogger.clientMessageBoard(`"PHOTOBOT BUSY"`);return;};
    let messageStart = findReferencesWithIndex(post,messageUi.photobotCodeActivate);
    messageStart = messageStart+messageUi.photobotCodeActivate.length+1;
    post = post.substring(messageStart);
    photobot.photobotIsBusy = 1;
    sendPhotobotIsNotPaintingToAllClients();
    sendPhotobotIsPaintingToAllClients();
    let inputTranslated = await translate.askForTranslation(post).then((translatedInput)=>{
        return translatedInput;
    });
    let photobotPhoto = await photobot.askForPhoto(inputTranslated);
    let image = JSON.stringify(photobotPhoto);
    let user = 76;
    post = '';
    let dbResponse = await db.dbInsertPost(post,user,image);
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "INSERTED POST FROM PHOTOBOT"
    `); 
    sendPhotobotIsNotPaintingToAllClients();
    sendRefreshPostsEventToAllClients();
    photobot.photobotIsBusy = 0;
    return;
};

async function sendPostToPhotobotItemPhoto(post){
    if(photobot.photobotIsBusy == 1){messageBoardLogger.clientMessageBoard(`"PHOTOBOT BUSY"`);return;};
    let messageStart = findReferencesWithIndex(post,messageUi.photobotCodeActivate);
    messageStart = messageStart+messageUi.photobotCodeActivateItemImage.length+1;
    post = post.substring(messageStart);
    photobot.photobotIsBusy = 1;
    sendPhotobotIsNotPaintingToAllClients();
    sendPhotobotIsPaintingToAllClients();
    let inputTranslated = await translate.askForTranslation(post).then((translatedInput)=>{
        return translatedInput;
    });
    let photobotPhoto = await photobot.askForPhoto(inputTranslated,1);
    let image = JSON.stringify(photobotPhoto);
    let user = 76;
    post = '';
    let dbResponse = await db.dbInsertPost(post,user,image);
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "INSERTED ITEM PHOTO FROM PHOTOBOT"
    `); 
    sendPhotobotIsNotPaintingToAllClients();
    sendRefreshPostsEventToAllClients();
    photobot.photobotIsBusy = 0;
    return;
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

function sendRefreshPostsNoScrollEventToAllClients(){
    clientEvents.sendEvents("reloadPostsNoScroll");
    return;
};

function sendChatBotIsTypingToAllClients(){
    // console.log("SENDING EVENT CHATBOTISTYPING");
    clientEvents.sendEvents("chatbotIsTyping");
    return;
};

function sendChatBotIsNotTypingToAllClients(){
    // console.log("SENDING EVENT CHATBOTISNOTTYPING");
    clientEvents.sendEvents("chatbotIsNotTyping");
    return;
};
function sendPhotobotIsPaintingToAllClients(){
    // console.log("SENDING EVENT photobotIsPainting");
    clientEvents.sendEvents("photobotIsPainting");
    return;
};

function sendPhotobotIsNotPaintingToAllClients(){
    // console.log("SENDING EVENT photobotIsNotPainting");
    clientEvents.sendEvents("photobotIsNotPainting");
    return;
};

routerMessageBoard.get('/reloadPosts/', async (req, res) => {
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

//------------------------CLIENT MESSAGEBOARD UI ACTIONS-------------------//

routerMessageBoard.get('/windowIsOpen/', async(req,res) => {
    var funcTime = getTime();
    messageBoardLogger.clientMessageBoard(`
    time: ${funcTime} 
    "WINDOW IS OPEN"
    `);    
    res.end();
});

routerMessageBoard.get('/windowIsClose/', async(req,res) => {
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

module.exports = routerMessageBoard;