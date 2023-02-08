require("dotenv").config();
var favicon = require('serve-favicon');
const express = require('express');
const sessions = require('express-session');
const path = require('node:path');
const fs = require('fs');
const readline = require('readline');
const { stringify } = require("csv-stringify");
const { createPool } = require("mariadb");
const { response } = require("express");
const { Script } = require("node:vm");
var formidable = require('formidable');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
var morgan = require('morgan');
const helmet = require('helmet');
let ejs = require('ejs');
const querystring = require('querystring');

var SSE = require('express-sse');
var sse = new SSE(["array", "containing", "initial", "content", "(optional)"]);

const db = require('./db.js');
const functions = require('./functions.js');
const strings = require('./strings.js');
const generateAccessToken = require("./module/tokenGen");
const validateToken = require("./module/tokenVal");
const sessionClassMW = require("./module/sessionClass.js");

const appPort = process.env.APP_PORT;
const appName = process.env.APP_NAME;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const COOKIE_EXPIRATION = Number(process.env.COOKIE_EXPIRATION);
const SESSION_NAME = process.env.SESSION_NAME;

morgan.token('splitter', (req) => {
  return "\x1b[36m--------------------------------------------\x1b[0m\n";
}); // MORGAN LOGGING COLOR CODES
morgan.token('statusColor', (req, res, args) => {  
  var status = (typeof res.headersSent !== 'boolean' ? Boolean(res.header) : res.headersSent)
      ? res.statusCode
      : undefined  
  var color = status >= 500 ? 31 // red
      : status >= 400 ? 33 // yellow
          : status >= 300 ? 36 // cyan
              : status >= 200 ? 32 // green
                  : 0; // no color
  return '\x1b[' + color + 'm' + status + '\x1b[0m';
});
morgan.token('time', function(req, res, param) {
  return getSimpleTime();  
});
morgan.token('sessionid', function(req, res, param) {
  return req.sessionID;
});
morgan.token('user', function(req, res, param) {
  return req.session.user;
});

const session_secret = process.env.SESSION_SECRET;
const user_masof = process.env.USER_MASOF;
const pass_masof = process.env.PASS_MASOF;
const user_admin = process.env.USER_ADMIN;
const pass_admin = process.env.PASS_ADMIN;
const user_accountant = process.env.USER_ACCOUNTANT;
const pass_accountant = process.env.PASS_ACCOUNTANT;

const app = express();
const port = 3090;

app.set('trust proxy', 1);


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname));

app.use(sessions({
  name: SESSION_NAME,
  userid: `userId`,
  sessionid: ``,
  secret: ACCESS_TOKEN_SECRET,  
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: COOKIE_EXPIRATION
  } 
}));

var session;

let clients = [];

app.use(helmet());

app.use(sessionClassMW({ class: '100', name: 'name'}));

app.use(morgan(`\x1b[0m:time \x1b[0m \x1b[33m:remote-addr\x1b[0m \x1b[32m:url
  \x1b[36m:sessionid\x1b[0m \x1b[0m :response-time ms `));

var now = new Date();
console.log("System Startup Time : " + Date());
console.log("System Startup Time : " + now.getTime());

app.use(express.static(__dirname + 'public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/report', express.static(__dirname + '/public/report'));
app.use('/items', express.static(__dirname + '/public/img/items'));
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.set('views', './views');
app.set('view engine', 'ejs');

function getSimpleTime(){
  const now = new Date();
  const simpleTime = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  return simpleTime;
};

// DB INIT
function dbInit(){
  db.createSessionTable();
  db.createUserTable();
  const connectionTestTimeout = setTimeout(callDbStatus, 1000);
  function callDbStatus(){
    db.connectionStatus();
  };
};
dbInit();

require('./routes/routes_basic')(app);

// ------------------------  OLD SESSION SETTINGS  ----------------------- //
// app.use(session({
//   secret: session_secret,
//   resave: true,
//   saveUninitialized: true
// }));

// var auth = function (req, res, next) {
//   if (req.session && req.session.user === user_admin && req.session.admin)
//     return next();
//   else
//     return res.sendStatus(401);
// };

// ------------------------  MANAGE VIEW  ----------------------- //
app.get('/manage', async function (req, res) {
  const reject = () => {
    res.setHeader("www-authenticate", "Basic", realm = "admin", uri = "/manage", charset = "UTF-8");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;

  if (!authorization) {
    console.log("FAILED LOGIN ATTEMPTED TO MANAGE PANEL ON: " + Date());
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!(username === user_admin && password === pass_admin)) {
    return reject();
  }
  console.log("LOGIN TO MANAGE PANEL ON: " + Date());
  // req.session = true;
  imgToArray();  
  // console.log(imgArray);
  res.render('manage', {imgArray : imgArray})
});

const imgFolder = path.join(__dirname, '/public/img/items');
var imgArray = [];
function imgToArray() {  
  imgArray = fs.readdirSync(imgFolder);  
};

//------------------------------USER SESSION-------------------------------------//
app.get('/', (req,res) => {
  session=req.session;
  if(session.userid){
      res.redirect('./app');
  }else{
    res.render('login.ejs',{
      root:__dirname,
      message: "please enter your details"      
    });
  }
});

app.post("/createUser", async (req,res) => {
  if(!req.body.name || !req.body.password){res.sendStatus(403);return}

  const user = req.body.name;
  const password = await bcrypt.hash(req.body.password,10);

  // let user = generateRandomUserName(7);
  // const password = await bcrypt.hash(user,10);

  let dbResponse = await db.createUser(user,password);

  console.log("DB response: "+dbResponse[2]);
  if(dbResponse[0]==0){
    res.sendStatus(409);
  }
  if(dbResponse[0]==1){
    res.sendStatus(201);
  }
});

app.post("/login", async (req, res)=> {
if(!req.body.username || !req.body.password){
  res.redirect('./');
  console.log("ATTAMPTED LOGIN WITH NO DETAILS")
  return;
}

const user = req.body.username;
const password = req.body.password;

let dbResponse = await db.userLogin(user,password);

if(dbResponse[0]==0){
  console.log("LOGIN ATTAMPTED WITH WRONG USERNAME")
  const query = querystring.stringify({"message":"username invalid"});
  res.redirect('./?' + query);
}
if(dbResponse[0]==1){
  console.log("LOGIN ATTAMPTED WITH WRONG PASSWORD")
  const query = querystring.stringify({"message":"password invalid"});
  res.redirect('./?' + query);
}
if(dbResponse[0]==2){
  const token = generateAccessToken({user: user});
  session=req.session;
  session.userid=req.body.username;    
  const userClass = await db.getUserClassByName(session.userid);    
  session.userclass = Number(userClass);
  const sessionStore = await db.storeSession(session.userid,userClass,token);    
  session.sessionid = Number(sessionStore);
  console.log(`LOGIN: USER: ${user} ,CLASS: ${userClass} ,SESSION ID: ${session.sessionid}`);
  res.redirect('./');
}
});

app.get("/logout", async (req,res)=>{
if(req.session == null){res.sendStatus(403);return;}
if (req.session.sessionid!=null){
  const sessionRemove = await db.removeSession(req.session.sessionid);
};
console.log(`USER ${req.session.userid} HAS LOGGED OUT`);
req.session.destroy();
res.redirect('./');
});

// ------------------------  MANAGE REPORT VIEW  ----------------------- //
app.get('/infotables', async function (req, res) {
  const reject = () => {
    res.setHeader("www-authenticate", "Basic", realm = "infotables", uri = "/infotables", charset = "UTF-8");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;

  if (!authorization) {
    console.log("FAILED LOGIN ATTEMPTED TO MANAGE PANEL ON: " + Date());
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!(username === user_admin && password === pass_admin)) {
    return reject();
  }
  console.log("LOGIN TO MANAGE REPORT PAGE ON: " + Date());
  // req.session = true;
  res.render('infotables', {})
});

// ------------------------  CREATE TABLE ----------------------- //
app.get('/retable/', async function (req, res) {
  let createTableClients;
  let createTableOrders;
  let createTableProducts;
  let createTableUsers;
  createTableClients = await db.dbCreateTableClients().then((res) => { return (res) });
  createTableOrders = await db.dbCreateTableOrders().then((res) => { return (res) });
  createTableProducts = await db.dbCreateTableProducts().then((res) => { return (res) });
  createTableUsers = await db.dbCreateTableUsers().then((res) => { return (res) });
  res.send(createTableOrders);
});

//-----------READ NAMES FILE --------------
app.post('/updateNameList/', async (req, res) => {
  const fileStream = fs.createReadStream('namelist.csv', 'utf8');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    let number = (line.split('\t'))[0];
    let name = (line.split('\t'))[1];
    let nick = name;
    console.log(number)
    console.log(name);
    let newClient = [name, nick, number];
    var insertClientResponse;
    insertClientResponse = await db.dbInsertClient(newClient).then((res) => { return (res) })
    console.log(await insertClientResponse)
  }
});

//-----------------GET ITEMS IMG
app.post('/uploadItemImg/', async  (req,res) => {  
    // var form = new formidable.IncomingForm();
    const options = {
      uploadDir: __dirname + '/public/img/items',
      filter: function ({name, originalFilename, mimetype}) {
        // keep only images
        return mimetype && mimetype.includes("image");
      }
    };
    const form = formidable(options);

    // form.on('file', function(field, file) {
      //rename the incoming file to the file's name
          // fs.rename(file.path, form.uploadDir + "/" + file.name);
  // });
    let newName;
    let originalName;
    form.parse(req, function (err, fields, files) {
      // var oldpath = files.filetoupload.filepath;
      // var newpath = 'img/items/' + files.filetoupload.originalFilename;      
        console.log('fields:', fields);
        console.log('files:', files);
        console.log(files.imgUpload.newFilename);
        console.log(files.imgUpload.originalFilename);
        newName = files.imgUpload.filepath;
        originalName = (__dirname + '/public/img/items/')+(files.imgUpload.originalFilename);
        console.log(newName)
        console.log(originalName)
        fs.rename(newName,originalName, () => {
      console.log("\nFile Renamed!\n");});
        // fs.rename(files.imgUpload.newFilename, files.imgUpload.originalFilename);
      //   res.write('File uploaded and moved!');      
      // res.render('manage', {imgArray : imgArray})
    });
    console.log("----------------------------------------------");
    console.log(newName)
    console.log(originalName)
    // fs.rename(newName,originalName, () => {
      // console.log("\nFile Renamed!\n");});
    imgToArray();
    res.redirect('./manage');
});

// SERACH CLIENT IN DB BY SEARCHBOX
app.post('/searchNameManage/:data', async (req, res) => {
  var clientName = (req.params.data).replace(/\"/g, '');
  clientName = clientName.replace(/\'/g, "''");
  if (clientName == "-") {
    res.send(JSON.stringify("clear"));
    return;
  };
  let clientsFound = [];
  clientsFound = (await db.dbGetNameBySearchName(clientName));
  res.send(clientsFound);
});

app.post('/getUserDetails/:data', async (req, res, next) => {
  let clientId = (req.params.data);
  console.log("APP: GET DETAILS BY ID: " + clientId);
  var clientFields;
  clientFields = await db.dbGetClientDetailsById(clientId).then((res) => { return (res) })
  console.log(JSON.stringify(await clientFields));
  res.send(clientFields);
});

app.post('/insertClient/:data', async (req, res, next) => {
  let newClient = JSON.parse(req.params.data);
  // console.log("APP: ADD NEW NAME: "+newClient);
  var insertClientResponse;
  insertClientResponse = await db.dbInsertClient(newClient).then((res) => { return (res) })
  console.log(await insertClientResponse)
  res.send(insertClientResponse);
});

app.post('/editClientFields/:data', async (req, res, next) => {
  let newFields = (req.params.data).split(",");
  console.log("APP: EDIT FIELD : " + newFields);
  let clientId = newFields[0].replace(/\'/g, "''");;
  let field = newFields[1].replace(/\'/g, "''");;
  let value = newFields[2].replace(/\'/g, "''");;
  if (field == 1) {
    field = "name";
  }
  if (field == 2) {
    field = "nick";
  }
  if (field == 3) {
    field = "account";
  }
  var clientFieldsEdited;
  clientFieldsEdited = await db.dbEditClient(clientId, field, value).then((res) => { return (res) })
  res.send(clientFieldsEdited);
});

app.post('/deleteLastOrder/:data', async (req, res) => {
  let clientID = JSON.parse(req.params.data);
  // console.log("APP: DELETE LAST ORDER FROM ID: "+clientID);
  var deleteLastOrderResponse;
  deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientID).then((res) => { return (res) })
  console.log(deleteLastOrderResponse)
  res.send(deleteLastOrderResponse);
});

app.post('/insertName/:data', async (req, res, next) => {
  let newName = JSON.parse(req.params.data);
  console.log("APP: ADD NEW NAME: " + newName);
  var response;
  response = await db.dbInsertName(newName).then((res) => { return (res) })
  res.send(response);
});

app.post('/deleteClient/:data', async (req, res, next) => {
  let clientId = JSON.parse(req.params.data);
  console.log("APP: DELETE CLIENT: " + clientId);
  var response;
  response = await db.dbDeleteClient(clientId).then((res) => { return (res) })
  res.send(response);
});

app.post('/getAllData/:data', async (req, res) => {
  let scope = JSON.parse(req.params.data);
  // let itemsBought;
  // itemsBought = await db.dbGetItemsBought().then((dbData) => {return (dbData)});
  // console.log(itemsBought);
  let dbData;
  dbData = await db.dbGetDataByScope(scope).then((dbData) => { return (dbData) });
  // console.log(dbData);
  res.send(dbData)
});

app.get('/getItemsBought/', async (req, res) => {
  console.log("GET ITEMS BOUGHT AT APP: ");
  let itemsBought;
  itemsBought = await db.dbGetItemsBought().then((dbData) => { return (dbData) });
  console.log(itemsBought);
  res.send(itemsBought);
});

app.post('/requestReportArchive/:data', async (req, res) => {
  let tableName = req.params.data;
  console.log("GETTING ARCHIVE DATA FROM: " + tableName);
  dbData = await db.dbGetDataFromArchiveByDate(tableName).then((dbData) => { return (dbData) });
  res.send(dbData);
});

app.post('/getUserOrders/:data', async (req, res) => {
  if (req.params.data == null || isNaN(req.params.data)) { console.log("ID IS NOT A NUMBER"); return; };
  let clientId = JSON.parse(req.params.data);
  let dbData;
  dbData = await db.dbGetClientOrdersById(clientId).then((dbData) => { return (dbData) });
  res.send(dbData)
});

app.get('/getProducts/', async (req, res) => {
  let products = [];
  let listFromDb;
  listFromDb = await db.dbGetProductsAll();
  listFromDb.forEach(element => {
    products.push([JSON.parse(JSON.stringify(element.itemname))]);
  });
  // console.log(JSON.stringify(listFromDb));
  // console.log(listFromDb);
  res.send(listFromDb);
});

app.post('/insertProduct/:data', async (req, res, next) => {
  let newItem = JSON.parse(req.params.data);
  console.log("APP: ADD NEW PRODUCTS: " + newItem);
  var response;
  response = await db.dbInsertProduct(newItem).then((res) => { return (res) })
  sendEvents("reloadItems");
  res.send(response);
});

app.post('/editProduct/:data', async (req, res) => {
  let newData = (req.params.data);
  let newArray = newData.split(',');
  console.log("APP: EDIT PRODUCT" + newArray);
  // let productID = newArray[0];
  var response;
  response = await db.dbEditProduct(newArray).then((res) => { return (res) })
  sendEvents("reloadItems");
  res.send(response);
});

app.post('/deleteProduct/:data', async (req, res, next) => {
  let productID = JSON.parse(req.params.data);
  console.log("APP: DELETE PRODUCT: " + productID);
  var response;
  response = await db.dbDeleteProduct(productID).then((res) => { return (res) })
  sendEvents("reloadItems");
  res.send(response);
});

app.get('/getListOfArchiveReport/', async (req, res) => {
  let archiveList = [];
  let listFromDb;
  listFromDb = await db.dbGetListOfArchiveReport().then((archiveList) => { return (archiveList) });
  listFromDb.forEach(element => {
    // console.log(JSON.parse(JSON.stringify(element).split(':')[1].replace('}','')));  
    archiveList.push(JSON.parse(JSON.stringify(element).split(':')[1].replace('}', '')));
  });
  // console.log(archiveList);
  res.send(archiveList);
});

let limit = false;
app.post('/backupTable/', async (req, res) => {
  if (!limit) {
    limit = true;
    let dbBackup;
    let dateObj = new Date().toISOString().substr(0, 19);
    dateFormat = dateObj.replace(/-/g, '_').replace(/:/g, '_').replace(/T/g, '_');
    console.log("BACKUP TIME: " + dateFormat);
    dbBackup = await db.dbBackupTable(dateFormat).then((dbBackup) => { return (dbBackup) });
    const limiter = setTimeout(releaseLimit, 5000);
    res.send("dbBackup ok at: " + dbBackup);
  } else {
    res.send("dbBackup limit rate wait a few seconds ha");
  }
});

function releaseLimit() {
  (limit = false);
};

// ------------------------  CLIENT VIEW  ----------------------- //
app.get('/app', sessionClassMW(100), async function (req, res) {
  let products = [];
  products = await db.dbGetProducts();
  console.log("LOGIN TO APP ON: " + Date());
  res.render('index', {
    products: products,
    msg1: strings.MSG_ORDER_VALIDATE
  })
});


// app.get('', async function (req, res) {
//   let products = [];
//   products = await db.dbGetProducts();
//   // console.log(products);

//   const reject = () => {
//     res.setHeader("www-authenticate", "Basic", realm = "masof", uri = "/", charset = "UTF-8");
//     res.sendStatus(401);
//   };

//   const authorization = req.headers.authorization;

//   if (!authorization) {
//     console.log("FAILED LOGIN ATTEMPTED TO MASOF APP ON: " + Date());
//     return reject();
//   }

//   const [username, password] = Buffer.from(
//     authorization.replace("Basic ", ""),
//     "base64"
//   )
//     .toString()
//     .split(":");

//   if (!(username === user_masof || username === user_admin && password === pass_masof || password === pass_admin)) {
//     return reject();
//   }
//   console.log("LOGIN TO APP ON: " + Date());
//   res.render('index', {
//     products: products,
//     msg1: strings.MSG_ORDER_VALIDATE
//   })
// });

// ------------------------  CLIENT GET PRODUCTS  ----------------------- //
app.get('/clientGetProducts/', async (req, res) => {
  let products = [];
  let listFromDb;
  listFromDb = await db.dbGetProducts();
  listFromDb.forEach(item => {
    let row = [item.itemid, item.itemname, item.price, item.itemimgpath];
    products.push(JSON.parse(JSON.stringify(row)));
  });
  res.send(products);
});

// PLACE ORDER BY ID
app.get('/order/:data', async function (req, res) {
  console.log("ORDER: ");
  console.log(now);
  // console.log(req.params.data);
  const orderData = (req.params.data).split(',');
  // console.log(orderData);
  let clientId = orderData[orderData.length - 1];
  let totalPrice = orderData[orderData.length - 2];
  // console.log(clientId);
  // console.log(totalPrice);
  let orderInfo;
  for (let i = 0; i < orderData.length - 2; i = i + 2) {
    if (orderInfo == null || orderInfo == "") {
      orderInfo = (orderData[i] + "-" + orderData[i + 1] + ".");
    } else {
      orderInfo += (orderData[i] + "-" + orderData[i + 1] + ".");
    }
  }
  console.log("order info: " + orderInfo);
  var orderDate = now;
  var orderTime = now;
  // console.log("date: "+orderDate+" time: "+orderTime+" id: "+id+" ,item1: "+item1+" ,item2:"+item2+" ,item3: "+item3+" ,item4: "+item4);
  let orderResult;
  orderResult = await db.dbInsertOrderToOrders(orderTime, clientId, orderInfo, totalPrice).then((orderResult) => { return (orderResult) });
  res.send(orderResult);
});

// GET REQUEST FOR SEARCH FOR NAME IN DB BY QUERY
app.post('/searchName/:data', async (req, res) => {
  var query = (req.params.data).replace(/\"/g, '');
  if (query == "-") {
    res.send(JSON.stringify("clear"));
    return;
  };
  let names = [];
  names = (await db.dbGetNameBySearch(query));
  res.send(names);
});

//GET USER INFO BY ID
app.post('/getUserInfo/:data', async (req, res) => {
  let clientId = JSON.parse(req.params.data);
  let clientInfo = await db.dbGetClientInfoById(clientId);
  // console.log(JSON.stringify(clientInfo));
  res.send(clientInfo)

});

//-------------------------accountant---------------------
app.get('/accountant', async function (req, res) {
  const reject = () => {
    res.setHeader("www-authenticate", "Basic", realm = "accountant", uri = "/accountant", charset = "UTF-8");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;

  if (!authorization) {
    console.log("FAILED LOGIN ATTEMPTED TO ACCOUNTANT ON: " + Date());
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!(username === user_accountant && password === pass_accountant)) {
    return reject();
  }
  console.log("LOGGED IN TO ACCOUNTANT ON: " + Date());
  res.render('accountant', {})
});

//-----------------------WRITE REPORT FILE WITH ORDERS SCHEME---------------------//
app.get('/createFileReportOrders/', async function (req, res) {
  console.log("REPORT FILE CREATE ON " + Date())
  let fileDate = new Date();
  var month = fileDate.getMonth();
  month = month + 1;
  var minutes = fileDate.getMinutes();
  minutes = ("0" + minutes).slice(-2);
  fileDate = (fileDate.getFullYear().toString().substr(-2) + "-" + month + "-" +
    fileDate.getDate() + "-" + fileDate.getHours() + "-" + minutes);
  const filename = "pub_orders_" + fileDate + ".csv";
  const writableStream = fs.createWriteStream('public/report/' + filename);
  const columns = [
    "",
    "מס. לקוח",
    "שם לקוח",
    "פרטים",
    "תאריך",
    "סכום"
  ];
  const stringifier = stringify({ header: true, columns: columns, bom: true });
  let data;
  data = await db.dbGetDataByScope(5);
  // console.log(JSON.stringify(data));
  for (let i = 0; i < data.length; i++) {
    let row = ["", data[i].account, data[i].client, data[i].info, "פאב " + data[i].date, "₪ " + data[i].sum];
    stringifier.write(row);
  }
  stringifier.pipe(writableStream);
  res.setHeader('Content-disposition', "'attachment; filename=" + filename + "'");
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.status(200).send('./report/' + filename);
});

//-----------------------WRITE REPORT FILE WITH CLIENTS SCHEME---------------------//
app.get('/createFileReportClients/', async function (req, res) {
  let fileDate = new Date();
  fileDate = (fileDate.getFullYear() + "-" + fileDate.getMonth() + "-" +
    fileDate.getDate() + "-" + fileDate.getHours() + "-" + fileDate.getMinutes());
  const filename = "pub_report_clients" + fileDate + ".csv";
  const writableStream = fs.createWriteStream('public/report/' + filename);
  const columns = [
    "",
    "מס. לקוח",
    "שם לקוח",
    "פרטים",
    "סכום"
  ];
  const stringifier = stringify({ header: true, columns: columns, bom: true });
  let data;
  data = await db.dbGetDataByScope(4);
  for (let i = 0; i < data.length; i++) {
    let row = ["", data[i].account, data[i].name, "פאב " + data[i].formatted_date, "₪ " + data[i].sum.toFixed(2)];
    stringifier.write(row);
  }
  stringifier.pipe(writableStream);
  res.setHeader('Content-disposition', "'attachment; filename=" + filename + "'");
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.status(200).send('./report/' + filename);
});

//-----------------------REMOVE OLD BACKUPS WITH SUFFIX---------------------//
app.get('/removeOldBackups/', async function (req, res) {
  let removedOldBackups;
  removedOldBackups = await db.dbDeleteOldBackups();

  console.log(removedOldBackups);

  res.send(removedOldBackups);
});

//-----------------------RESET CLIENTS TABLE AFTER REPORT---------------------//
app.get('/resetClientsDataAfterRead/', async function (req, res) {
  if (!limit) {
    limit = true;
    let dbBackup;
    let dateObj = new Date().toISOString().substr(0, 19);
    dateFormat = dateObj.replace(/-/g, '_').replace(/:/g, '_').replace(/T/g, '_');
    console.log("BACKUP TIME: " + dateFormat);
    dbBackup = await db.dbBackupTable(dateFormat).then((dbBackup) => { return (dbBackup) });
    const limiter = setTimeout(releaseLimit, 5000);
    // res.send("dbBackup ok at: "+dbBackup);
  } else {
    res.send("dbBackup limit rate wait a few seconds ha");
  }
  let resetClientsData;
  resetClientsData = await db.dbResetClientOrders();
  console.log(resetClientsData);
  res.send(resetClientsData);
});

app.get('/refreshClients', function(req,res){
  sendEvents("refresh");
});

//-------------------------SERVER-----------------------------------//
app.listen(port, () => console.info(`App topaythepub is listening on port ${port}`));

//--------------------------EVENTS---------------------------------------//
app.get('/status', (req, res) => res.json({clients: clients.length}));

app.get('/events', function(req,res){
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);
  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
  // getValues(res);
  getEvents(res);
});

function getEvents(res){

}

function sendEvents(event){
  console.log("SENDING SERVER SIDE EVENT: "+JSON.stringify(event));
  clients.forEach(client => client.res.write(`data: ${JSON.stringify(event)}\n\n`))
}

function getValues(res){
  res.write("data: " + dataSource + "\n\n")
  console.log("data: " + dataSource + "\n\n")
  if (dataSource)
    setTimeout(() => getValues(res), 5000)
  else
    res.end()
}

// A simple dataSource that changes over time
let dataSource = 0;
const updateDataSource = () => {
  const delta = Math.random();
  dataSource += delta;
  console.log(dataSource);
}
// setInterval(() => updateDataSource(), 5000);

