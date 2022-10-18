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

//consts
const app = express();
const port = 3090;

//vars
// var thumbList = []
var userName = 'niva';

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
    res.render('index', {})
});

// PAY BY ID
app.get('/score/:data', async function(req,res,next) {
    await getName(req,res,next);
    // RESPONSE FROM LAST FUNCION IN SERIAL
});

async function scoreId(req,res,next) {
    var id = req.params.data;
    // await functions.dbAddScoreById(id);
    setTimeout(async function(){
        await appGetVideoDataById(req,res,next);
    },100)
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
app.listen(port, () => console.info(`App listening on port ${port}`));
