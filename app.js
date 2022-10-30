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

// var now = new Date().toLocaleString("en-IL", {timeZone: "Asia/Jerusalem"});
var now = new Date();
console.log("System Startup Time :"+Date());


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

app.get('/retable/', async function(req,res){
    let createTableCLients;
    let createTableOrders;
    createTableCLients = await db.dbCreateTableClients().then((res) => {return (res)});
    createTableOrders = await db.dbCreateTableOrders().then((res) => {return (res)});    
    res.send(createTableOrders);
})

app.post('/getUserDetails/:data', async (req,res,next) => {
    let getClient = JSON.parse(req.params.data);
    console.log("APP: GET DETAILS BY NAME: "+getClient);
    let getName = getClient[0];
    let getNick = getClient[1];
    let getNumber = getClient[2];
    console.log(getName,getNick,getNumber)
    var response;
    response = await db.dbGetClientDetails(getName,getNick,getNumber).then((res) => {return (res)})
    res.send(response);    
});

app.post('/insertClient/:data', async (req,res,next) => {
    let newClient = JSON.parse(req.params.data);
    // console.log("APP: ADD NEW NAME: "+newClient);
    var response;
    response = await db.dbInsertClient(newClient).then((res) => {return (res)})
    res.send(response);    
});

app.post('/editClientFields/:data', async (req,res,next) => {
    let newFields = (req.params.data).split(",");
    console.log("APP: EDIT FIELD : "+newFields);
    let client = newFields[0];
    let field = newFields[1];
    let value = newFields[2];        
    if(field==1){
        field = "name";        
    }
    if(field==2){
        field = "nick";        
    }
    if(field==3){
        field = "account";        
    }
    var response;
    response = await db.dbEditClient(client,field,value).then((res) => {return (res)})
    res.send(response);    
});

app.post('/insertName/:data', async (req,res,next) => {
    let newName = JSON.parse(req.params.data);
    console.log("APP: ADD NEW NAME: "+newName);
    var response;
    response = await db.dbInsertName(newName).then((res) => {return (res)})
    res.send(response);    
});

app.post('/deleteName/:data', async (req,res,next) => {
    let deleteName = JSON.parse(req.params.data);
    console.log("APP: DELETE NAME: "+deleteName);
    var response;
    response = await db.dbDeleteName(deleteName).then((res) => {return (res)})
    res.send(response);    
});

function sendBackAddedName(req,res,message,next){

};

app.post('/getAllData/:data', async (req,res) => {
    let scope = JSON.parse(req.params.data);
    let dbData;
    dbData =  await db.dbGetDataByScope(scope).then((dbData) => {return (dbData)});
    res.send(dbData)
});

let limit = false;
app.post('/backupTable/', async (req,res) => {
    if(!limit){
        limit = true;
        let dbBackup;
        dbBackup = await db.dbBackupTable(now.getTime()).then((dbBackup) => {return (dbBackup)});
        console.log(dbBackup);
        const limiter = setTimeout(releaseLimit,5000);
        res.send("dbBackup ok at: "+dbBackup);
    }else{
        res.send("dbBackup limit rate wait a few seconds ha");
    }    
});
function releaseLimit(){
    (limit=false);
};

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
    orderResult = await db.dbInsertOrderToOrders(orderTime,id,item1,item2,item3,item4).then((orderResult) => {return (orderResult)});    
    res.send(orderResult);
});

// GET REQUEST FOR SEARCH FOR NAME IN DB BY QUERY
app.post('/searchName/:data', async (req,res) => {
    var query = (req.params.data).replace(/\"/g,'');    
    if(query == "-"){        
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

//GET USER INFO BY ID
app.post('/getUserInfo/:data', async (req,res) => {
    let clientId = JSON.parse(req.params.data);
    let clientInfo = await db.dbGetClientInfoById(clientId);
    // console.log(JSON.stringify(clientInfo));
    res.send(clientInfo)

});

//-------------------------SERVER-----------------------------------//
app.listen(port, () => console.info(`App topaythepub is listening on port ${port}`));
