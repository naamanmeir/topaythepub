require("dotenv").config();
var favicon = require('serve-favicon');
const express = require('express');
const sessions = require('express-session');
const path = require('node:path');
const fs = require('fs');
const readline = require('readline');
const { stringify } = require("csv-stringify");
var formidable = require('formidable');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const helmet = require('helmet');
let ejs = require('ejs');
const querystring = require('querystring');

var validator = require('validator');

var SSE = require('express-sse');
var sse = new SSE(["array", "containing", "initial", "content", "(optional)"]);

//--------------RATE LIMIT------------------------//
const rateLimit = require('express-rate-limit');
const rateLimitMain = rateLimit({
	windowMs: 1 * 25 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,  
  handler: function(req,res){
    console.log("--------RATE LIMIT---------")
    return res.end();
  }
});

const db = require('./db.js');
const functions = require('./functions.js');
const generateAccessToken = require("./module/session/tokenGen");
const validateToken = require("./module/session/tokenVal");
const sessionClassMW = require("./module/session/sessionClass.js");
const validatorClient = require("./module/input/inputValidatorClient.js");
// const rateLimitMiddle = require("./module/input/inputThresh.js");
const {errorLogger,clientLogger,actionsLogger,ordersLogger} = require('./module/logger');

let messagesJson = require('./messages.json');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];

const routerAdmin = require('./routes/router_admin');
const routerManage = require('./routes/router_manage');
const routerAccountant = require('./routes/router_accountant');
const routerClient = require('./routes/router_client');
const routerClientEvents = require('./routes/router_client_events');
const routerApp = require('./routes/router_app');

const appPort = process.env.APP_PORT;
const appName = process.env.APP_NAME;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const COOKIE_EXPIRATION = Number(process.env.COOKIE_EXPIRATION);
const SESSION_NAME = process.env.SESSION_NAME;

const app = express();
const port = appPort;

app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//--------------SESSION CONFIG------------------------//

app.use(sessions({
  name: SESSION_NAME,
  userid: `userId`,
  sessionid: ``,
  secret: ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    name: SESSION_NAME,
    secure: false,
    httpOnly: true,
    maxAge: COOKIE_EXPIRATION
  }
}));

var session;

//--------------HELMET CONFIG------------------------//
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
        "script-src-attr": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.use(rateLimitMain);

var now = new Date();
console.log("System Startup Time : " + Date());

app.use(express.static(__dirname + 'public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/report', express.static(__dirname + '/public/report'));
app.use('/items', express.static(__dirname + '/public/img/items'));
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.set('views', './views');
app.set('view engine', 'ejs');

function getSimpleTime() {
  const now = new Date();
  const simpleTime = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  return simpleTime;
};

// ---------------------- DB INIT ----------------------------------- //
function dbInit() {
  db.createUserTable();
  db.createSessionTable();
  db.dbCreateTableClients();
  db.dbCreateTableOrders();
  db.dbCreateTableProducts();

  const connectionTestTimeout = setTimeout(callDbStatus, 1000);
  function callDbStatus() {
    // db.connectionStatus();
  };
};
dbInit();

//------------------------------USER SESSION-------------------------------------//
app.get('/', (req, res) => {
  console.log(req.cookies);

  if (!req || req == null) { res.sendStatus(401).end(); };
  if (req.session != null) {session = req.session};
  if (req.cookies.session != null) {
    // console.log("sdgsdgsdgdsgdsg----------");
    const sessionId = req.cookies.session;
    // console.log(sessionId);    
  }else{
    console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");
  }
  const clientIp = req.headers['x-forwarded-for'];
  clientLogger.clientAttempted(`
  LOGIN PAGE VISITED FROM
  IP: ${clientIp}
  `);
  if (session.userid) {
    res.redirect('./app');
  } else {
    res.render('login.ejs', {
      // root: __dirname,
      message: "wellcome message"
    });
  }
});

app.post("/login", async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'];
  // console.log("LOGIN ATTAMPTED")
  if (!req.body.username || !req.body.password) {
    res.redirect('./');
    // console.log("ATTAMPTED LOGIN WITH NO DETAILS")
    clientLogger.clientAttempted(`
    LOGIN ATTAMPTED WITH NO DETAILS
    IP: ${clientIp}
    `);
    return;
  }
  if (!validator.isAlphanumeric(req.body.username)) { console.log("USERNAME NOT VALID"); loginAction(req, res, 0, null, null); return; }
  if (!validator.isAlphanumeric(req.body.password)) { console.log("PASSWORD NOT VALID"); loginAction(req, res, 1, null, null); return; }

  const user = req.body.username;
  const password = req.body.password;  

  let dbResponse = await db.userLogin(user, password);

  loginAction(req, res, dbResponse,user,password);
});

async function loginAction(req, res, reply, user, password) {
  const clientIp = req.headers['x-forwarded-for'];
  if (reply[0] == 0) {
    // console.log("LOGIN ATTAMPTED WITH WRONG USERNAME");
    clientLogger.clientAttempted(`
    LOGIN ATTAMPTED WITH WRONG USERNAME
    IP: ${clientIp}
    `);
    const query = querystring.stringify({ "message": "username invalid" });
    res.redirect('./?' + query);
    return;
  } // WRONG USER
  if (reply[0] == 1) {
    // console.log("LOGIN ATTAMPTED WITH WRONG PASSWORD");
    clientLogger.clientAttempted(`
    LOGIN ATTAMPTED WITH WRONG PASSWORD
    IP: ${clientIp}
    `);
    const query = querystring.stringify({ "message": "password invalid" });
    res.redirect('./?' + query);
    return;
  } // WRONG PASS
  if (reply[0] == 2) {    
    const token = generateAccessToken({ user: user });
    session = req.session;
    session.userid = req.body.username;
    const userClass = await db.getUserClassByName(session.userid);
    session.userclass = Number(userClass);
    const sessionStore = await db.storeSession(session.userid, userClass, token);
    session.sessionid = Number(sessionStore);
    // console.log(`LOGIN: USER: ${user} ,CLASS: ${userClass} ,SESSION ID: ${session.sessionid}`);
    clientLogger.clientLogin(`
    CLIENT: ${user}
    CLASS: ${userClass}
    SESSION ID: ${session.sessionid}
    CLIENT IP: ${clientIp}
    `);
    res.redirect('./');
    return;
  }// LOGIN OK
  return;
}

app.get("/logout", async (req, res) => {  
  if (req.session == null) { res.sendStatus(403); return; }
  const clientIp = req.headers['x-forwarded-for'];
  if (req.session.sessionid != null) {
    const sessionRemove = await db.removeSession(req.session.sessionid);
  };
  console.log(`USER ${req.session.userid} HAS LOGGED OUT`);
  clientLogger.clientLogout(`
  CLIENT: ${req.session.userid}  
  SESSION ID: ${session.sessionid}
  CLIENT IP: ${clientIp}
  `);
  req.session.destroy();
  res.redirect('./');
  return;
});

// ------------------------ ROUTERS ----------------------- //
app.use('/secretadminpanel', sessionClassMW(0), routerAdmin);
app.use('/manage', sessionClassMW(50), routerManage);
app.use('/accountant', sessionClassMW(75), routerAccountant);
app.use('/app', sessionClassMW(100), routerApp);
app.use('/client', sessionClassMW(100), validatorClient(), routerClient);
app.use('/events', sessionClassMW(100), routerClientEvents);

//-------------------------SERVER-----------------------------------//
app.listen(port, () => console.info(`App ${appName} is listening on port ${port}`));

//-------------------------SOME UTILITIES-----------------------------------//

//-----A simple dataSource that changes over time-----------------//
let dataSource = 0;
const updateDataSource = () => {
  const delta = Math.random();
  dataSource += delta;
  console.log(dataSource);
}
// setInterval(() => updateDataSource(), 5000);
