const express = require('express');
const routerManage = express.Router();
const functions = require('../functions');
const sessionClassMW = require("../module/sessionClass");
var formidable = require('formidable');
const fs = require('fs');
const db = require('./../db.js');
const { stringify } = require("csv-stringify");
const clientEvents = require('./router_client_events');

//---------------------MANAGE MAIN PAGE-----------------------------//

routerManage.get('/', (req, res) => {
    console.log("LOGIN TO MANAGE PANEL ON: " + Date());
    let itemImgArray = functions.itemImgArray();
    let session = req.session;
    res.render('manage', {
        imgArray: itemImgArray,
        username: session.userid
    })
});

//---------------------UI FUNCTIONS-----------------------------//

routerManage.post('/searchNameManage/:data', async (req, res) => {
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

routerManage.get('/getProducts/', async (req, res) => {
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

//---------------------DATA QUERY FUNCTIONS-----------------------------//

routerManage.post('/getAllData/:data', async (req, res) => {
    let scope = JSON.parse(req.params.data);
    // let itemsBought;
    // itemsBought = await db.dbGetItemsBought().then((dbData) => {return (dbData)});
    // console.log(itemsBought);
    let dbData;
    dbData = await db.dbGetDataByScope(scope).then((dbData) => { return (dbData) });
    // console.log(dbData);
    res.send(dbData)
});

routerManage.get('/getItemsBought/', async (req, res) => {
    console.log("GET ITEMS BOUGHT AT APP: ");
    let itemsBought;
    itemsBought = await db.dbGetItemsBought().then((dbData) => { return (dbData) });
    console.log(itemsBought);
    res.send(itemsBought);
});

routerManage.post('/requestReportArchive/:data', async (req, res) => {
    let tableName = req.params.data;
    console.log("GETTING ARCHIVE DATA FROM: " + tableName);
    dbData = await db.dbGetDataFromArchiveByDate(tableName).then((dbData) => { return (dbData) });
    res.send(dbData);
});

routerManage.post('/getUserOrders/:data', async (req, res) => {
    if (req.params.data == null || isNaN(req.params.data)) { console.log("ID IS NOT A NUMBER"); return; };
    let clientId = JSON.parse(req.params.data);
    let dbData;
    dbData = await db.dbGetClientOrdersById(clientId).then((dbData) => { return (dbData) });
    res.send(dbData)
});

routerManage.get('/getListOfArchiveReport/', async (req, res) => {
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

//-------------------------PRODUCTS-----------------------------------------//
routerManage.post('/insertProduct/:data', async (req, res, next) => {
    let newItem = JSON.parse(req.params.data);
    console.log("APP: ADD NEW PRODUCTS: " + newItem);
    var response;
    response = await db.dbInsertProduct(newItem).then((res) => { return (res) })
    clientEvents.sendEvents("reloadItems");
    res.send(response);
});

routerManage.post('/editProduct/:data', async (req, res) => {
    let newData = (req.params.data);
    let newArray = newData.split(',');
    console.log("APP: EDIT PRODUCT" + newArray);
    // let productID = newArray[0];
    var response;
    response = await db.dbEditProduct(newArray).then((res) => { return (res) })
    clientEvents.sendEvents("reloadItems");
    res.send(response);
});

routerManage.post('/deleteProduct/:data', async (req, res, next) => {
    let productID = JSON.parse(req.params.data);
    console.log("APP: DELETE PRODUCT: " + productID);
    var response;
    response = await db.dbDeleteProduct(productID).then((res) => { return (res) })
    clientEvents.sendEvents("reloadItems");
    res.send(response);
});

routerManage.post('/uploadItemImg', async (req, res) => {
    const options = {
        uploadDir: __dirname + '/../public/img/items',
        filter: function ({ name, originalFilename, mimetype }) {
            return mimetype && mimetype.includes("image");
        }
    };
    const form = formidable(options);
    let newName;
    let originalName;
    form.parse(req, function (err, fields, files) {
        newName = files.imgUpload.filepath;
        originalName = (__dirname + '../public/img/items/') + (files.imgUpload.originalFilename);
        fs.rename(newName, originalName, () => {

        });
    });
    functions.itemImgArray();
    res.redirect(req.get('referer'));
});

//-------------------------------------USERS---------------------------------------------//
routerManage.post('/insertClient/:data', async (req, res, next) => {
    let newClient = JSON.parse(req.params.data);
    console.log("APP: ADD NEW NAME: " + newClient);
    var insertClientResponse;
    insertClientResponse = await db.dbInsertClient(newClient).then((res) => { return (res) })
    console.log(await insertClientResponse)
    res.send(insertClientResponse);
});

routerManage.post('/deleteClient/:data', async (req, res, next) => {
    let clientId = JSON.parse(req.params.data);
    console.log("APP: DELETE CLIENT: " + clientId);
    var response;
    response = await db.dbDeleteClient(clientId).then((res) => { return (res) })
    res.send(response);
});

routerManage.post('/editClientFields/:data', async (req, res, next) => {
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

routerManage.post('/getUserDetails/:data', async (req, res, next) => {
    let clientId = (req.params.data);
    console.log("APP: GET DETAILS BY ID: " + clientId);
    var clientFields;
    clientFields = await db.dbGetClientDetailsById(clientId).then((res) => { return (res) })
    console.log(JSON.stringify(await clientFields));
    res.send(clientFields);
});

routerManage.post('/deleteLastOrder/:data', async (req, res) => {
    let clientID = JSON.parse(req.params.data);
    console.log("APP: DELETE LAST ORDER FROM ID: " + clientID);
    var deleteLastOrderResponse;
    deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientID).then((res) => { return (res) })
    console.log(deleteLastOrderResponse)
    res.send(deleteLastOrderResponse);
});


//--------------------- UTILS -------------------------------------------------//

routerManage.get('/removeOldBackups/', async function (req, res) {
    let removedOldBackups;
    removedOldBackups = await db.dbDeleteOldBackups();

    console.log(removedOldBackups);

    res.send(removedOldBackups);
});

routerManage.get('/resetClientsDataAfterRead/', async function (req, res) {
    if (!dbRateLimit) {
        dbRateLimit = true;
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

routerManage.get('/infotables', async function (req, res) {
    console.log("LOGIN TO MANAGE REPORT PAGE ON: " + Date());
    res.render('infotables', {})
});

routerManage.get('/retable/', async function (req, res) {
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

routerManage.post('/updateNameList/', async (req, res) => {
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

let dbRateLimit = false;
routerManage.post('/backupTable/', async (req, res) => {
    if (!dbRateLimit) {
        dbRateLimit = true;
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
    (dbRateLimit = false);
};

module.exports = routerManage;