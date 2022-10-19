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
const { createPool } = require("mariadb");

//consts
const app = express();
const port = 3090;

var now = new Date();


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

// PLACE ORDER BY ID
app.get('/order/:data', async function(req,res,next) {
    console.log(now.toUTCString());
    console.log("ORDER: ");
    console.log(req.params.data);
    const orderData = req.params.data.split(',');
    var id = (orderData[0]);
    var item1 = (orderData[1]);
    var item2 = (orderData[2]);
    var item3 = (orderData[3]);
    var item4 = (orderData[4]);
    console.log(id+" "+item1+" "+item2+" "+item3+" "+item4);
    // await getName(req,res,next);
    // RESPONSE FROM LAST FUNCION IN SERIAL
});

// GET REQUEST FOR SEARCH FOR NAME IN DB BY QUERY

app.post('/searchName/:data', async (req,res) => {
    var query = (req.params.data).replace(/\"/g,'');
    let names = [];
    names = (await db.dbGetNameBySearch(query));    
    res.send(names);
});

// app.post('/searchName/:data', function(req,res,next){
//     console.log(req.params.data);
//     getNames(req,res,next);    
// })

async function getNames(req,res,next) {
    var query = req.params.data;
    // var names = await db.dbGetNameBySearch(query)
    // console.log(names);
    const promise1 = Promise.resolve(await db.dbGetNameBySearch(query))    
    promise1.then(names => {
        console.log("APP:"+names)
        returnNames(req,res,names,next)
      })
      .catch(err => {
        console.log("---------------ERROR READING FROM DB---------------");
        console.log(err);
       }) 
    // returnNames(req,res,names,next);
};

async function returnNames(req,res,names,next){
    // names = ["gog","ads","fas"];
    console.log("get names "+names);
    res.send(names);
}

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
