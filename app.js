require("dotenv").config();
var favicon = require('serve-favicon');
const express = require('express');
const sessions = require('express-session');
const sqlStore = require('express-mysql-session')(sessions);
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
    windowMs: 1 * 15 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: function(req, res) {
        console.log(getTime());
        console.log("--------RATE LIMIT---------");
        return res.end();
    }
});

const startupTools = require('./module/tools/startupClean.js');
const db = require('./db.js');
const functions = require('./functions.js');
const generateAccessToken = require("./module/session/tokenGen");
const validateToken = require("./module/session/tokenVal");
const sessionClassMW = require("./module/session/sessionClass.js");
const validatorClient = require("./module/input/inputValidatorClient.js");
const clientEvents = require('./routes/router_client_events');
// const rateLimitMiddle = require("./module/input/inputThresh.js");
const { errorLogger, clientLogger, actionsLogger, ordersLogger } = require('./module/logger');

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
const routerMessageBoard = require('./routes/router_messageBoard');
const routerRemoteMessageBoard = require('./routes/router_messageRemote');


const appPort = process.env.APP_PORT;
const appName = process.env.APP_NAME;
const appMode = process.env.APP_MODE;
const production = process.env.APP_MODE === "production";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const COOKIE_EXPIRATION = Number(process.env.COOKIE_EXPIRATION);
const SESSION_NAME = process.env.SESSION_NAME;

const DEFAULTADMIN = process.env.DEFAULTADMIN;
const DEFAULTADMINPASS = process.env.DEFAULTADMINPASS;

const OPENAI_KEY = process.env.OPENAI_API_KEY;

const app = express();
const port = appPort;

app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

//--------------SESSION CONFIG------------------------//

const sqlSessionStoreOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
};

const sessionStore = new sqlStore(sqlSessionStoreOptions);

app.use(sessions({
    name: SESSION_NAME,
    userid: `userId`,
    sessionid: ``,
    secret: ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    expires: COOKIE_EXPIRATION,
    cookie: {
        name: SESSION_NAME,
        secure: false,
        httpOnly: true,
        maxAge: COOKIE_EXPIRATION
    }
}));

if (!production) {
    sessionStore.onReady().then(() => {
        console.log('MySQLStore ready');
    }).catch(error => {
        console.error(error);
    });
};

var session;

let clientsSSE = [];

//--------------HELMET CONFIG------------------------//
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "script-src": ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
                "script-src-attr": ["'self'", "'unsafe-inline'"],
                "img-src": ["'self'", "blob: https: data:"],
            },
        },
    })
);

app.use(rateLimitMain);

var now = new Date();
console.log("System Startup Time : " + Date());

app.use(express.static(__dirname + 'public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', sessionClassMW(120), express.static(__dirname + '/public/js'));
app.use('/img', sessionClassMW(120), express.static(__dirname + '/public/img'));
app.use('/photobot', express.static(__dirname + '/public/img/photobot'));
app.use('/qrCode', sessionClassMW(120), express.static(__dirname + '/public/img/qrCode'));
app.use('/posts', sessionClassMW(120), express.static(__dirname + '/public/img/posts'));
app.use('/fonts', sessionClassMW(120), express.static(__dirname + '/public/fonts'));
app.use('/report', sessionClassMW(120), express.static(__dirname + '/public/report'));
app.use('/items', sessionClassMW(120), express.static(__dirname + '/public/img/items'));
app.use('/posts', sessionClassMW(120), express.static(__dirname + '/public/img/posts'));
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.set('views', './views');
app.set('view engine', 'ejs');

function getSimpleTime() {
    const now = new Date();
    const simpleTime = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    return simpleTime;
};

// ---------------------- DB INIT ----------------------------------- //
async function dbInit() {
    await db.createUserTable();
    await db.createSessionTable();
    await db.createTokenTable();
    await db.dbCreateTableClients();
    await db.dbCreateTableOrders();
    await db.dbCreateTableProducts();
    await db.dbCreateTablePosts();
    await db.dbCreateTableFacts();

    let dbDefaultUser = await db.getUserTableLength();
    if (dbDefaultUser == 0) {
        dbCreateAdmin();
    };

    const connectionTestTimeout = setTimeout(callDbStatus, 1000);

    function callDbStatus() {
        // db.connectionStatus();
    };
};
dbInit();

async function dbCreateAdmin() {
    const username = DEFAULTADMIN;
    const password = await bcrypt.hash(DEFAULTADMINPASS, 10);
    const userclass = 0;

    let dbResponse = await db.createUser(username, password, userclass);

    console.log("DB response: " + dbResponse[2]);
    if (dbResponse[0] == 0) {
        console.log("user creation failed");
    }
    if (dbResponse[0] == 1) {
        console.log("admin user created");
    }
};

//------------------------------USER SESSION-------------------------------------//
app.get('/', async(req, res) => {
    if (!req || req == null) { res.sendStatus(401).end(); };
    const clientIp = req.headers['x-forwarded-for'];
    clientLogger.clientAttempted(`
  LOGIN ATTEMPT FROM ${clientIp}
  `);

    if (req.session != null) { session = req.session };

    if (session.userid) {
        res.redirect('./app');
        return;
    } else {
        res.render('login.ejs', {
            message: messageUi.loginMessage
        });
        return;
    }
});

app.get("/login", async(req, res) => {
    const clientIp = req.headers['x-forwarded-for'];
    res.render('login.ejs', {
        message: messageUi.loginMessage
    });
});

app.post("/login", async(req, res) => {
    const clientIp = req.headers['x-forwarded-for'];
    if (!req.body.username || !req.body.password) {
        res.redirect('./');
        clientLogger.clientAttempted(`
    LOGIN ATTAMPTED WITH NO DETAILS
    IP: ${clientIp}
    `);
        return;
    }
    if (!validator.isAlphanumeric(req.body.username)) {
        console.log("USERNAME NOT VALID");
        loginAction(req, res, 0, null, null);
        return;
    }
    if (!validator.isAlphanumeric(req.body.password)) {
        console.log("PASSWORD NOT VALID");
        loginAction(req, res, 1, null, null);
        return;
    }

    const user = req.body.username;
    const password = req.body.password;

    let dbResponse = await db.userLogin(user, password);

    loginAction(req, res, dbResponse, user, password);
    return;
});

async function loginAction(req, res, reply, user, password) {
    const clientIp = req.headers['x-forwarded-for'];
    console.log(req.baseUrl);
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
        let sessionName = req.cookies.sessionName;
        session.userid = user;
        // session.userid = req.body.username;
        const userClass = await db.getUserClassByName(session.userid);
        session.userclass = Number(userClass);
        const sessionStore = await db.storeSession(session.userid, userClass, sessionName);
        session.sessionid = Number(sessionStore);
        //     clientLogger.clientLogin(`
        // CLIENT: ${user}
        // CLASS: ${userClass}
        // SESSION ID: ${session.sessionid}
        // CLIENT IP: ${clientIp}
        // `);
        if (userClass == 120) { res.redirect('./remoteMboard/'); return; }
        res.redirect('./');
        return;
    } // LOGIN OK
    if (reply[0] == 3) {
        const token = generateAccessToken({ user: user });
        session = req.session;
        let sessionName = req.cookies.sessionName;
        session.userid = user;
        // session.userid = req.body.username;
        const userClass = await db.getUserClassByName(session.userid);
        session.userclass = Number(userClass);
        const sessionStore = await db.storeSession(session.userid, userClass, sessionName);
        session.sessionid = Number(sessionStore);
        //     clientLogger.clientLogin(`
        // CLIENT: ${user}
        // CLASS: ${userClass}
        // SESSION ID: ${session.sessionid}
        // CLIENT IP: ${clientIp}
        // `);
        res.redirect('./remoteMboard/');
        return;
    } // LOGIN OK
    return;
};

app.get('/tempLogin', async(req, res) => {
    if (req.query.token !== null || typeof req.query.token !== 'undefined') {
        let tokenClient = req.query.token;
        let valid = await db.dbFindToken(tokenClient);
        if (valid) {
            console.log("TEMP LOGIN");
            const user = 'tempBoard';
            const password = 'temp1Board2';
            let dbResponse = await db.userLogin(user, password);
            loginAction(req, res, '3', user, password);
            let dbRemoveToken = db.dbRemoveToken(tokenClient);
            let dbRemovePosts = db.dbDeletePostByUsername(77);
            sendRefreshPostsEventToAllClients();
            return;
        } else {
            console.log("FAILED TOKEN ON TEMPORARY LOGIN LINK");
            res.status(400);
            res.send(messageUi.createQrToRemoteBoardLinkExpired);
            res.end();
            return;
        };
        console.log("FAILED TOKEN ON TEMPORARY LOGIN LINK");
        res.status(400);
        res.send(messageUi.createQrToRemoteBoardLinkExpired);
        res.end();
        return;
    };
    console.log("FAILED TOKEN ON TEMPORARY LOGIN LINK");
    res.status(400);
    res.send(messageUi.createQrToRemoteBoardLinkExpired);
    res.end();
    return;
});

app.get('/tempLoginToApp', async(req, res) => {
    if (req.query.token !== null || typeof req.query.token !== 'undefined') {
        let tokenClient = req.query.token;
        let valid = await db.dbFindToken(tokenClient);
        if (valid) {
            console.log("TEMP LOGIN");
            const user = 'tempMasof';
            const password = 'temp1Masof2';
            let dbResponse = await db.userLogin(user, password);
            loginAction(req, res, '2', user, password);
            let dbRemoveToken = db.dbRemoveToken(tokenClient);
            let dbRemovePosts = db.dbDeletePostByUsername(77);
            sendRefreshPostsEventToAllClients();
            return;
        } else {
            console.log("FAILED TOKEN ON TEMPORARY LOGIN LINK");
            res.status(400);
            res.send(messageUi.createQrToRemoteBoardLinkExpired);
            res.end();
            return;
        };
        console.log("FAILED TOKEN ON TEMPORARY LOGIN LINK");
        res.status(400);
        res.send(messageUi.createQrToRemoteBoardLinkExpired);
        res.end();
        return;
    };
    console.log("FAILED TOKEN ON TEMPORARY LOGIN LINK");
    res.status(400);
    res.send(messageUi.createQrToRemoteBoardLinkExpired);
    res.end();
    return;
});

app.get("/logout", async(req, res) => {
    if (req.session == null) { res.sendStatus(403); return; }
    const clientIp = req.headers['x-forwarded-for'];
    if (req.session.sessionid != null) {
        const sessionRemove = await db.removeSession(req.session.sessionid);
    };
    console.log(`USER ${req.session.userid} HAS LOGGED OUT`);
    clientLogger.clientLogout(`
  CLIENT: ${req.session.userid}  
  SESSION ID: ${req.session.sessionid}
  CLIENT IP: ${clientIp}
  `);
    req.session.destroy();
    setTimeout(()=>{
        res.redirect('./');
    },2500)
    
    return;
});

// ------------------------ ROUTERS ----------------------- //
app.use('/secretadminpanel', sessionClassMW(0), routerAdmin);
app.use('/manage', sessionClassMW(50), routerManage);
app.use('/accountant', sessionClassMW(75), routerAccountant);
app.use('/app', sessionClassMW(100), routerApp);
app.use('/client', sessionClassMW(100), validatorClient(), routerClient);
app.use('/events', sessionClassMW(120), routerClientEvents);
app.use('/mboard', sessionClassMW(100), validatorClient(), routerMessageBoard);
app.use('/remoteMboard', sessionClassMW(120), validatorClient(), routerRemoteMessageBoard);


//-------------------------SERVER-----------------------------------//
app.listen(port, () => console.info(`App ${appName} is listening on port ${port} at ${appMode} mode`));

//-------------------------SOME UTILITIES-----------------------------------//

function getTime() {
    return new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
};

function sendRefreshPostsEventToAllClients() {
    clientEvents.sendEvents("reloadPosts");
    return;
};

//-----A simple dataSource that changes over time-----------------//
let dataSource = 0;
const updateDataSource = () => {
        const delta = Math.random();
        dataSource += delta;
        console.log(dataSource);
    }
    // setInterval(() => updateDataSource(), 5000);