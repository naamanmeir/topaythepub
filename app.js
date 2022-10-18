// Imports
require("dotenv").config();
var favicon = require('serve-favicon')
const express = require('express')
const path = require('node:path');
const fs = require('fs');

// extrnal files
const functions = require('./functions.js');
const db = require('./db.js');
const { Script } = require("node:vm");
const msg = require('./strings.js');

//consts
const app = express();
const port = 3090;

// Static Files
app.use(express.static(__dirname + 'public'));
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/img', express.static(__dirname + '/public/img'))
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.set('views', './views');
app.set('view engine', 'ejs');

// ------------------------  MAIN INDEX  ----------------------- //
app.get('', async function(req, res) {    
    res.render('index', {
        item1 : msg.NAME_ITEM1,
        item2 : msg.NAME_ITEM2,
        item3 : msg.NAME_ITEM3,
        item4 : msg.NAME_ITEM4,
        msg1 : msg.MSG_ORDER_VALIDATE
    })
});

// PAY BY ID
app.get('/order/:data', async function(req,res,next) {
    console.log(req+" "+req.data)
    await getName(req,res,next);
    // RESPONSE FROM LAST FUNCION IN SERIAL
});

async function getName(req,res,next) {
    var id = req.params.data;
    console.log("get name"+req)
    // get names from db;
};

// LAST SERIAL => RESPONSE
async function appGetVideoDataById(req,res, next) {
    var id = req.params.data;
    var getNewData = await functions.dbGetVideoDataById(id);
    // console.log(`APP: getScore:ID: ${getNewData[0]} name: ${getNewData[1]} score: ${getNewData[2]}`);
    res.send(getNewData);
    // console.log("SENT RESPONSE FROM appGetDataById");
};

// GET NUMBER OF CLIENTS IN DB
appGetNumberOfVideos = async function() {
    let numberOfVideosInDb = await functions.dbGetLength();
    // console.log("APP: NUMBER OF VIDEOS: "+numberOfVideosInDb);
    return numberOfVideosInDb;
};

//-------------------------SERVER-----------------------------------//
app.listen(port, () => console.info(`App topaythepub is listening on port ${port}`));
