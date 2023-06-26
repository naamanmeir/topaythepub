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
        insertPostWithImage(req,res,post,null,finalImageName)
    });
   
});

async function insertPostWithImage(req,res,post,user,image){
    post = post.substring(0,MaxPostLength);
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


function sendRefreshPostsEventToAllClients(){
    clientEvents.sendEvents("reloadPosts");
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