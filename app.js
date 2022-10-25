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
const { response } = require("express");

//consts
const app = express();
const port = 3090;

var now = new Date().toLocaleString("en-IL", {timeZone: "Asia/Jerusalem"});
console.log("System Startup Time :"+now);


// Static Files
app.use(express.static(__dirname + 'public'));
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/img', express.static(__dirname + '/public/img'))
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.set('views', './views');
app.set('view engine', 'ejs');

// ------------------------  MANAGE VIEW  ----------------------- //
app.get('/manage', async function(req, res) {    
    res.render('manage', {})
});

app.post('/insertName/:data', async (req,res,next) => {
    let newName = JSON.parse(req.params.data);
    console.log("APP: ADD NEW NAME: "+newName);
    var response;
    response = await db.dbInsertName(newName).then((res) => {return (res)})
    res.send(response);    
});

function sendBackAddedName(req,res,message,next){

};

app.post('/getAllData/', async (req,res) => {
    let dbData;
    dbData =  await db.dbGetAllClientsData().then((dbData) => {return (dbData)});
    res.send(dbData)
});

// ------------------------  CLIENT VIEW  ----------------------- //
app.get('', async function(req, res) {  
    console.log("User Requested Index: "+now);  
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
    console.log("ORDER: ");
    console.log(now);
    // console.log(req.params.data);
    const orderData = req.params.data.split(',');
    var id = (orderData[0]);
    var item1 = (orderData[1]);
    var item2 = (orderData[2]);
    var item3 = (orderData[3]);
    var item4 = (orderData[4]);
    var orderDate = now;
    var orderTime = now;
    console.log("date: "+orderDate+" time: "+orderTime+" id: "+id+" ,item1: "+item1+" ,item2:"+item2+" ,item3: "+item3+" ,item4: "+item4);
    let orderResult;
    orderResult = await db.dbInsertOrder(orderTime,id,item1,item2,item3,item4).then((orderResult) => {return (orderResult)});
    res.send(orderResult);    
});

// GET REQUEST FOR SEARCH FOR NAME IN DB BY QUERY
app.post('/searchName/:data', async (req,res) => {
    var query = (req.params.data).replace(/\"/g,'');
    // console.log(query);
    if(query == "-"){
        // console.log("clear");
        res.send(JSON.stringify("clear"));
        return;
    };
    let names = [];
    names = (await db.dbGetNameBySearch(query));    
    res.send(names);
});

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
    // console.log("get names "+names);
    res.send(names);
};

//-------------------------SERVER-----------------------------------//
app.listen(port, () => console.info(`App topaythepub is listening on port ${port}`));
