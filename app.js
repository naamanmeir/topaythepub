require("dotenv").config();
var favicon = require('serve-favicon');
const express = require('express');
const session = require('express-session');
const path = require('node:path');
const fs = require('fs');
const readline = require('readline');
const { stringify } = require("csv-stringify");

const db = require('./db.js');
const { Script } = require("node:vm");
const strings = require('./strings.js');
const { createPool } = require("mariadb");
const { response } = require("express");

const app = express();
const port = 3090;

const session_secret = process.env.SESSION_SECRET;
const user_masof = process.env.USER_MASOF;
const pass_masof = process.env.PASS_MASOF;
const user_admin = process.env.USER_ADMIN;
const password_admin = process.env.PASS_ADMIN;
const user_accountant = process.env.USER_ACCOUNTANT;
const password_accountant = process.env.PASS_ACCOUNTANT;

var now = new Date();
console.log("System Startup Time : "+Date());
console.log("System Startup Time : "+now.getTime());

app.use(express.static(__dirname + 'public'));
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/img', express.static(__dirname + '/public/img'))
app.use('/report', express.static(__dirname + '/public/report'))
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.set('views', './views');
app.set('view engine', 'ejs');

// ------------------------  SESSION SETTINGS  ----------------------- //
app.use(session({
  secret: session_secret,
  resave: true,
  saveUninitialized: true
}));

var auth = function(req, res, next) {
  if (req.session && req.session.user === user_admin && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
};

// ------------------------  MANAGE VIEW  ----------------------- //
app.get('/manage', async function(req, res) {
    const reject = () => {
        res.setHeader("www-authenticate", "Basic",realm="admin",uri="/manage",charset="UTF-8");
        res.sendStatus(401);
      };
    
      const authorization = req.headers.authorization;
    
      if (!authorization) {
        console.log("FAILED LOGIN ATTEMPTED TO MANAGE PANEL ON: "+Date());
        return reject();
      }
    
      const [username, password] = Buffer.from(
        authorization.replace("Basic ", ""),
        "base64"
      )
        .toString()
        .split(":");
    
      if (!(username === user_admin && password === password_admin)) {
        return reject();
      }
      console.log("LOGIN TO MANAGE PANEL ON: "+Date());  
      // req.session = true;
    res.render('manage', {})
});

// ------------------------  CREATE TABLE ----------------------- //
app.get('/retable/', async function(req,res){
    let createTableClients;
    let createTableOrders;
    let createTableProducts;
    let createTableUsers;
    createTableClients = await db.dbCreateTableClients().then((res) => {return (res)});
    createTableOrders = await db.dbCreateTableOrders().then((res) => {return (res)});
    createTableProducts = await db.dbCreateTableProducts().then((res) => {return (res)});
    createTableUsers = await db.dbCreateTableUsers().then((res) => {return (res)});
    res.send(createTableOrders);
})

//-----------READ NAMES FILE --------------
app.post('/updateNameList/', async (req,res) => {
  const fileStream = fs.createReadStream('namelist.csv','utf8');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  for await (const line of rl){    
    let number = (line.split('\t'))[0];
    let name = (line.split('\t'))[1];
    let nick = name;
    console.log(number)
    console.log(name);
    let newClient = [name,nick,number];
    var insertClientResponse;
    insertClientResponse = await db.dbInsertClient(newClient).then((res) => {return (res)})
    console.log(await insertClientResponse)
  }
});

// SERACH CLIENT IN DB BY SEARCHBOX
app.post('/searchNameManage/:data', async (req,res) => {
    var clientName = (req.params.data).replace(/\"/g,'');
    clientName = clientName.replace(/\'/g,"''");
    if(clientName == "-"){        
        res.send(JSON.stringify("clear"));
        return;
    };
    let clientsFound = [];
    clientsFound = (await db.dbGetNameBySearchName(clientName));    
    res.send(clientsFound);
});

app.post('/getUserDetails/:data', async (req,res,next) => {
    let clientId = (req.params.data);
    console.log("APP: GET DETAILS BY ID: "+clientId);
    var clientFields;
    clientFields = await db.dbGetClientDetailsById(clientId).then((res) => {return (res)})
    console.log(JSON.stringify(await clientFields));
    res.send(clientFields);    
});

app.post('/insertClient/:data', async (req,res,next) => {
    let newClient = JSON.parse(req.params.data);
    // console.log("APP: ADD NEW NAME: "+newClient);
    var insertClientResponse;
    insertClientResponse = await db.dbInsertClient(newClient).then((res) => {return (res)})
    console.log(await insertClientResponse)
    res.send(insertClientResponse);    
});

app.post('/editClientFields/:data', async (req,res,next) => {
    let newFields = (req.params.data).split(",");
    console.log("APP: EDIT FIELD : "+newFields);
    let clientId = newFields[0].replace(/\'/g, "''");;
    let field = newFields[1].replace(/\'/g, "''");;
    let value = newFields[2].replace(/\'/g, "''");;        
    if(field==1){
        field = "name";        
    }
    if(field==2){
        field = "nick";        
    }
    if(field==3){
        field = "account";        
    }
    var clientFieldsEdited;
    clientFieldsEdited = await db.dbEditClient(clientId,field,value).then((res) => {return (res)})
    res.send(clientFieldsEdited);    
});

app.post('/deleteLastOrder/:data', async (req,res) => {
    let clientID = JSON.parse(req.params.data);
    // console.log("APP: DELETE LAST ORDER FROM ID: "+clientID);
    var deleteLastOrderResponse;
    deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientID).then((res) => {return (res)})
    console.log(deleteLastOrderResponse)
    res.send(deleteLastOrderResponse);    
});

app.post('/insertName/:data', async (req,res,next) => {
    let newName = JSON.parse(req.params.data);
    console.log("APP: ADD NEW NAME: "+newName);
    var response;
    response = await db.dbInsertName(newName).then((res) => {return (res)})
    res.send(response);    
});

app.post('/deleteClient/:data', async (req,res,next) => {
    let clientId = JSON.parse(req.params.data);
    console.log("APP: DELETE CLIENT: "+clientId);
    var response;
    response = await db.dbDeleteClient(clientId).then((res) => {return (res)})
    res.send(response);    
});

app.post('/getAllData/:data', async (req,res) => {
    let scope = JSON.parse(req.params.data);
    let dbData;
    dbData =  await db.dbGetDataByScope(scope).then((dbData) => {return (dbData)});
    res.send(dbData)
});

app.post('/requestReportArchive/:data', async (req,res) => {
  let tableName = req.params.data;
  console.log("GETTING ARCHIVE DATA FROM: "+tableName);  
  dbData =  await db.dbGetDataFromArchiveByDate(tableName).then((dbData) => {return (dbData)});
  res.send(dbData);
})

app.post('/getUserOrders/:data', async (req,res) => {
  if(req.params.data==null||isNaN(req.params.data)){console.log("ID IS NOT A NUMBER");return;};
  let clientId = JSON.parse(req.params.data);  
  let dbData;
  dbData =  await db.dbGetClientOrdersById(clientId).then((dbData) => {return (dbData)});
  res.send(dbData)
});

app.get('/getListOfArchiveReport/', async (req,res) => {
  let archiveList = [];
  let listFromDb;
  listFromDb =  await db.dbGetListOfArchiveReport().then((archiveList) => {return (archiveList)});
  listFromDb.forEach(element => {
    // console.log(JSON.parse(JSON.stringify(element).split(':')[1].replace('}','')));  
    archiveList.push(JSON.parse(JSON.stringify(element).split(':')[1].replace('}','')));
  });  
  // console.log(archiveList);
  res.send(archiveList);
});

let limit = false;
app.post('/backupTable/', async (req,res) => {
    if(!limit){
        limit = true;
        let dbBackup;
        let dateObj = new Date().toISOString().substr(0, 19);
        dateFormat = dateObj.replace(/-/g,'_').replace(/:/g,'_').replace(/T/g,'_');
        console.log("BACKUP TIME: "+dateFormat);        
        dbBackup = await db.dbBackupTable(dateFormat).then((dbBackup) => {return (dbBackup)});        
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
  let products = [];
  products.push([strings.NAME_ITEM1,strings.PRICE_ITEM1]);
  products.push([strings.NAME_ITEM2,strings.PRICE_ITEM2]);
  products.push([strings.NAME_ITEM3,strings.PRICE_ITEM3]);
  products.push([strings.NAME_ITEM4,strings.PRICE_ITEM4]);

    const reject = () => {
        res.setHeader("www-authenticate", "Basic",realm="masof",uri="/",charset="UTF-8");
        res.sendStatus(401);
      };
    
      const authorization = req.headers.authorization;
    
      if (!authorization) {
        console.log("FAILED LOGIN ATTEMPTED TO MASOF APP ON: "+Date());
        return reject();
      }
    
      const [username, password] = Buffer.from(
        authorization.replace("Basic ", ""),
        "base64"
      )
        .toString()
        .split(":");
    
      if (!(username === user_masof && password === pass_masof)) {
        return reject();
      }
    console.log("LOGIN TO APP ON: "+Date());
    res.render('index', {
        products: products,
        msg1 : strings.MSG_ORDER_VALIDATE
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
    if(item1<0||item2<0||item3<0||item4<0){return "cmon ERROR"};
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

//GET USER INFO BY ID
app.post('/getUserInfo/:data', async (req,res) => {
    let clientId = JSON.parse(req.params.data);
    let clientInfo = await db.dbGetClientInfoById(clientId);
    // console.log(JSON.stringify(clientInfo));
    res.send(clientInfo)

});

//-------------------------accountant---------------------
app.get('/accountant', async function(req, res) {
    const reject = () => {
        res.setHeader("www-authenticate", "Basic",realm="accountant",uri="/accountant",charset="UTF-8");
        res.sendStatus(401);
      };
    
      const authorization = req.headers.authorization;
    
      if (!authorization) {
        console.log("FAILED LOGIN ATTEMPTED TO ACCOUNTANT ON: "+Date());
        return reject();
      }
    
      const [username, password] = Buffer.from(
        authorization.replace("Basic ", ""),
        "base64"
      )
        .toString()
        .split(":");
    
      if (!(username === user_accountant && password === password_accountant)) {
        return reject();
      }
    console.log("LOGGED IN TO ACCOUNTANT ON: "+Date());
    res.render('accountant', {})
});

//-----------------------WRITE REPORT FILE AND SEND TO DOWNLOAD---------------------//
app.get('/createFile/', async function(req,res){
  let fileDate = new Date();  
  fileDate = (fileDate.getFullYear()+"-"+fileDate.getMonth()+"-"+
  fileDate.getDate()+"-"+fileDate.getHours()+"-"+fileDate.getMinutes());  
  const filename = "pub_report_"+fileDate+".csv";
  const writableStream = fs.createWriteStream('public/report/'+filename);
  const columns = [
    "",
    "מס. לקוח",
    "שם לקוח",
    "פרטים",
    "סכום"
  ];
  const stringifier = stringify({ header: true, columns: columns, bom: true});  
  let data;
  data = await db.dbGetDataByScope(4);
  for(let i = 0;i < data.length; i++){
    let row = ["",data[i].account,data[i].name,"פאב "+data[i].formatted_date,"₪ "+data[i].sum.toFixed(2)];    
    stringifier.write(row);    
    }
  stringifier.pipe(writableStream);
  res.setHeader('Content-disposition', "'attachment; filename="+filename+"'");
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.status(200).send('./report/'+filename);
});

//-----------------------REMOVE OLD BACKUPS WITH SUFFIX---------------------//
app.get('/removeOldBackups/', async function(req,res){
  let removedOldBackups;
  removedOldBackups = await db.dbDeleteOldBackups();

  console.log(removedOldBackups);
  
  res.send(removedOldBackups);
});

//-----------------------RESET CLIENTS TABLE AFTER REPORT---------------------//
app.get('/resetClientsDataAfterRead/', async function(req,res){
  if(!limit){
    limit = true;
    let dbBackup;
    let dateObj = new Date().toISOString().substr(0, 19);
    dateFormat = dateObj.replace(/-/g,'_').replace(/:/g,'_').replace(/T/g,'_');
    console.log("BACKUP TIME: "+dateFormat);        
    dbBackup = await db.dbBackupTable(dateFormat).then((dbBackup) => {return (dbBackup)});        
    const limiter = setTimeout(releaseLimit,5000);
    // res.send("dbBackup ok at: "+dbBackup);
  }else{
    res.send("dbBackup limit rate wait a few seconds ha");
  } 
  let resetClientsData;
  resetClientsData = await db.dbResetClientOrders();
  console.log(resetClientsData);  
  res.send(resetClientsData);
});
//-------------------------SERVER-----------------------------------//
app.listen(port, () => console.info(`App topaythepub is listening on port ${port}`));
