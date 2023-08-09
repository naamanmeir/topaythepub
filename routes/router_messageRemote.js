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

let chatbot = require("../module/outsource/chatbot");
let photobot =  require("../module/outsource/hug_circulus")
let translate =  require("../module/outsource/gpt_translate");

let chatbotCall = messageUi.chatbotName1;

//------------------------CLIENT MESSAGEBOARD UI-------------------//

routerRemoteMessageBoard.get('/', async function (req, res) {

    if (!req || req == null) { res.sendStatus(401).end(); };
    const clientIp = req.headers['x-forwarded-for'];
    messageBoardLogger.clientMessageBoard(`
    LOGIN PAGE VISITED FROM
    IP: ${clientIp}
    `);
  
    if (req.session != null) {session = req.session};  
  
    if (session.userid) {
    //   res.redirect('./');
      res.render('remoteMessage',{
        msgHeader:messageUi.remoteMessageBoardHeader,
        msgButtonSend:messageUi.remoteMessageBoardButtonSendMessage,
        msgButtonSendError:messageUi.remoteMessageBoardButtonErrorMessage,
        msgInputPlaceholder:messageUi.remoteMessageBoardPlaceholder,
        msgOtherSideIsTypingMessage:messageUi.otherSideIsTypingMessage,
        msgButtonAddPicture:messageUi.remoteMessageBoardButtonAddPicture,
        msgButtonRemovePicture:messageUi.remoteMessageBoardButtonRemovePicture,
        msgButtonSendError:messageUi.remoteMessageBoardButtonErrorMessage,
        mBoardPlaceHolder:messageUi.mBoardPlaceHolder,
        otherSideIsTypingMessage:messageUi.otherSideIsTypingMessage,
        photobotIsPaintingMessage:messageUi.photobotIsPainting,
        photobotIsPaintingApaintingMessage:messageUi.photobotIsPaintingPainting
    });
      return;
    } else {
        res.redirect('./');
      return;
    }
});

routerRemoteMessageBoard.get("/login", async (req,res) => {
    const clientIp = req.headers['x-forwarded-for'];
    res.render('login.ejs', {
        cssVariable: "../css/login.css",
        message: messageUi.loginMessage
    });
  });

// routerRemoteMessageBoard.post("/login/", async (req, res) => {
//     console.log("REMOTE BOARD LOGIN PAGE");
//     const clientIp = req.headers['x-forwarded-for'];
//     if (!req.body.username || !req.body.password) {
//       res.redirect('./');    
//       messageBoardLogger.clientMessageBoard(`
//       LOGIN ATTAMPTED WITH NO DETAILS
//       IP: ${clientIp}
//       `);
//       return;
//     }
//     if (!validator.isAlphanumeric(req.body.username)) { console.log("USERNAME NOT VALID"); loginAction(req, res, 0, null, null); return; }
//     if (!validator.isAlphanumeric(req.body.password)) { console.log("PASSWORD NOT VALID"); loginAction(req, res, 1, null, null); return; }
  
//     const user = req.body.username;
//     const password = req.body.password;  
  
//     let dbResponse = await db.userLogin(user, password);
  
//     loginAction(req, res, dbResponse,user,password);
//     return;
// });
  
// async function loginAction(req, res, reply, user, password) {
//     const clientIp = req.headers['x-forwarded-for'];
//     if (reply[0] == 0) {
//       // console.log("LOGIN ATTAMPTED WITH WRONG USERNAME");
//       messageBoardLogger.clientMessageBoard(`
//       LOGIN ATTAMPTED WITH WRONG USERNAME
//       IP: ${clientIp}
//       `);
//       const query = querystring.stringify({ "message": "username invalid" });
//       res.redirect('./?' + query);
//       return;
//     } // WRONG USER
//     if (reply[0] == 1) {
//       // console.log("LOGIN ATTAMPTED WITH WRONG PASSWORD");
//       messageBoardLogger.clientMessageBoard(`
//       LOGIN ATTAMPTED WITH WRONG PASSWORD
//       IP: ${clientIp}
//       `);
//       const query = querystring.stringify({ "message": "password invalid" });
//       res.redirect('./?' + query);
//       return;
//     } // WRONG PASS
//     if (reply[0] == 2) {    
//       const token = generateAccessToken({ user: user });
//       session = req.session;
//       let sessionName = req.cookies.sessionName;
//       session.userid = req.body.username;    
//       const userClass = await db.getUserClassByName(session.userid);
//       session.userclass = Number(userClass);    
//       const sessionStore = await db.storeSession(session.userid, userClass, sessionName);
//       session.sessionid = Number(sessionStore);
//       messageBoardLogger.clientMessageBoard(`
//       CLIENT: ${user}
//       CLASS: ${userClass}
//       SESSION ID: ${session.sessionid}
//       CLIENT IP: ${clientIp}
//       `);
//     //   if(userClass==120){res.redirect('./remoteMboard/');return;}
//       res.redirect('./');
//       return;
//     }// LOGIN OK
//     return;
// };

//------------------------CLIENT MESSAGEBOARD ACTIONS COMMANDS-------------------//

routerRemoteMessageBoard.post('/insertPost/', async (req, res) => {
    if (!req.body.post || req.body.post == null || req.body.post == "") { res.end(); return; };
    var post = (req.body.post);
    if(post.length > MaxPostLength){ res.end(); return; };
    if(findReferences(post,messageUi.chatbotName1Variations)==true){sendPostToChatbot(post);};
    if(findReferences(post,messageUi.photobotCodeActivate)==true){sendPostToPhotobot(1,post);};
    if(findReferences(post,messageUi.photobotCodeActivatePainting)==true){sendPostToPhotobot(2,post);};
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

routerRemoteMessageBoard.post('/pinPost/', async (req, res) => {
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

async function sendPostToPhotobot(mode,post){
    if(photobot.photobotIsBusy == 1){messageBoardLogger.clientMessageBoard(`"PHOTOBOT BUSY"`);return;};
    let messageStart = findReferencesWithIndex(post,messageUi.photobotCodeActivate);
    messageStart = messageStart+messageUi.photobotCodeActivate.length+1;
    post = post.substring(messageStart);
    photobot.photobotIsBusy = 1;
    sendPhotobotIsNotPaintingToAllClients();    
    let inputTranslated = await translate.askForTranslation(post).then((translatedInput)=>{
        return translatedInput;
    });
    let photobotPhoto;
    if(mode==1){
        sendPhotobotIsPaintingToAllClients();
        photobotPhoto = await photobot.askForPhoto(1,inputTranslated);
    };
    if(mode==2){
        sendPhotobotIsPaintingApaintingToAllClients();
        photobotPhoto = await photobot.askForPhoto(2,inputTranslated);
    };    
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
    post = post.indexOf(' ') == 0 ? post.substring(1) : post;
    let isPainting = findReferencesWithIndex(post,messageUi.photobotCodeActivateItemImagePainting);    
    let mode = (isPainting>=0)? 2:1;
    photobot.photobotIsBusy = 1;
    sendPhotobotIsNotPaintingToAllClients();
    if(mode==1) {
        sendPhotobotIsPaintingToAllClients();
    };
    if(mode==2) {
        sendPhotobotIsPaintingApaintingToAllClients();
    };  
    let inputTranslated = await translate.askForTranslation(post).then((translatedInput)=>{
        return translatedInput;
    });
    let photobotPhoto = await photobot.askForPhoto(mode,inputTranslated,1);
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
    clientEvents.sendEvents("chatbotIsTyping");
    return;
};

function sendChatBotIsNotTypingToAllClients(){
    clientEvents.sendEvents("chatbotIsNotTyping");
    return;
};

function sendPhotobotIsPaintingToAllClients(){
    // console.log("SENDING EVENT photobotIsPainting");
    clientEvents.sendEvents("photobotIsPainting");
    return;
};

function sendPhotobotIsPaintingApaintingToAllClients(){
    // console.log("SENDING EVENT photobotIsPaintingApainting");
    clientEvents.sendEvents("photobotIsPaintingApainting");
    return;
};

function sendPhotobotIsNotPaintingToAllClients(){
    // console.log("SENDING EVENT photobotIsNotPainting");
    clientEvents.sendEvents("photobotIsNotPainting");
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