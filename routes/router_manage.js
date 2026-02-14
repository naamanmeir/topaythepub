const express = require('express');
const routerManage = express.Router();
const db = require('../module/database/db.js');
const functions = require('../module/utils/functions');
const sessionClassMW = require("../module/session/sessionClass");
const fs = require('fs');
const path = require('path');
const getItemImgs = require("../module/html/elements/manageGetItemImg.js");
const formidable = require('formidable');
const { stringify } = require("csv-stringify");
const clientEvents = require('./router_client_events');
const uiConfigStore = require('../module/tools/uiConfigStore');

const publicDir = path.join(__dirname, '../public');
const imgDir = path.join(publicDir, 'img');
const allowedImageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);
const rootFolderKey = '__root__';

function listBackgroundImages(dirPath) {
    let results = [];
    if (!fs.existsSync(dirPath)) {
        return results;
    }
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    entries.forEach((entry) => {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(listBackgroundImages(fullPath));
            return;
        }
        const ext = path.extname(entry.name).toLowerCase();
        if (!allowedImageExts.has(ext)) {
            return;
        }
        const relative = path.relative(publicDir, fullPath).split(path.sep).join('/');
        results.push(relative);
    });
    return results;
}

function listBackgroundFolders() {
    const folders = new Set();
    let hasRootImages = false;
    if (!fs.existsSync(imgDir)) {
        return [];
    }
    const entries = fs.readdirSync(imgDir, { withFileTypes: true });
    entries.forEach((entry) => {
        if (entry.isDirectory()) {
            folders.add(entry.name);
            return;
        }
        const ext = path.extname(entry.name).toLowerCase();
        if (allowedImageExts.has(ext)) {
            hasRootImages = true;
        }
    });
    const sorted = Array.from(folders).sort();
    if (hasRootImages) {
        sorted.unshift(rootFolderKey);
    }
    return sorted;
}

//---------------------MANAGE MAIN PAGE-----------------------------//

routerManage.get('/', (req, res) => {
    console.log("MANAGE : " + Date());
    let itemImgArray = functions.itemImgArray();
    let session = req.session;
    res.render('manage', {
        imgArray: itemImgArray
    })
});

routerManage.get('/theme', (req, res) => {
    const config = uiConfigStore.getConfig();
    res.json({
        theme: config.theme,
        backgroundMode: config.backgroundMode
    });
});

routerManage.post('/theme', (req, res) => {
    const theme = req.body && req.body.theme ? String(req.body.theme) : 'default';
    const backgroundMode = req.body && req.body.backgroundMode
        ? String(req.body.backgroundMode)
        : 'none';
    const saved = uiConfigStore.setConfig({
        ...uiConfigStore.getConfig(),
        theme,
        backgroundMode
    });
    clientEvents.sendEvents("uiConfig");
    res.json(saved);
});

routerManage.get('/ui-config', (req, res) => {
    res.json(uiConfigStore.getConfig());
});

routerManage.get('/background-images', (req, res) => {
    try {
        const images = listBackgroundImages(imgDir).sort();
        res.json(images);
    } catch (error) {
        console.error('Error listing background images:', error);
        res.status(500).json([]);
    }
});

routerManage.get('/background-folders', (req, res) => {
    try {
        res.json(listBackgroundFolders());
    } catch (error) {
        console.error('Error listing background folders:', error);
        res.status(500).json([]);
    }
});

routerManage.post('/ui-config', (req, res) => {
    const current = uiConfigStore.getConfig();
    const next = {
        ...current,
        ...req.body
    };
    const saved = uiConfigStore.setConfig(next);
    clientEvents.sendEvents("uiConfig");
    res.json(saved);
});

//---------------------MESSAGE DISPLAY MANAGEMENT-----------------------------//

routerManage.get('/message-board/posts', async (req, res) => {
    try {
        const posts = await db.dbGetManagePinnedPosts();
        res.json(posts);
    } catch (err) {
        console.error('Error loading manage posts:', err);
        res.status(500).json([]);
    }
});

routerManage.post('/message-board/post', async (req, res) => {
    try {
        const postid = Number(req.body && req.body.postid);
        if (!Number.isInteger(postid)) {
            res.status(400).json({ error: 'Invalid post id' });
            return;
        }
        const displayEnabled = req.body && req.body.display_enabled ? 1 : 0;
        const displayTemporary = req.body && req.body.display_is_temporary ? 1 : 0;
        const rawDuration = Number(req.body && req.body.display_duration_min);
        const durationMin = Number.isFinite(rawDuration)
            ? Math.min(180, Math.max(1, Math.round(rawDuration)))
            : 5;
        const rawOrder = Number(req.body && req.body.display_order);
        const displayOrder = Number.isFinite(rawOrder) ? Math.round(rawOrder) : 0;
        const rawPriority = Number(req.body && req.body.display_priority);
        const displayPriority = Number.isFinite(rawPriority)
            ? Math.min(2, Math.max(0, Math.round(rawPriority)))
            : 1;
        const pinValue = Number.isInteger(Number(req.body && req.body.pin))
            ? Number(req.body.pin)
            : null;
        await db.dbUpdateDisplayPost(postid, displayEnabled, displayTemporary, durationMin, displayOrder, displayPriority, pinValue);
        clientEvents.sendEvents('reloadPosts');
        res.json({ ok: true });
    } catch (err) {
        console.error('Error updating manage post:', err);
        res.status(500).json({ ok: false });
    }
});

routerManage.post('/message-board/custom', async (req, res) => {
    try {
        const text = req.body && req.body.text ? String(req.body.text).trim() : '';
        if (!text) {
            res.status(400).json({ ok: false, error: 'Empty message' });
            return;
        }
        const rawDuration = Number(req.body && req.body.display_duration_min);
        const durationMin = Number.isFinite(rawDuration)
            ? Math.min(180, Math.max(1, Math.round(rawDuration)))
            : 5;
        const rawOrder = Number(req.body && req.body.display_order);
        const displayOrder = Number.isFinite(rawOrder) ? Math.round(rawOrder) : 0;
        const rawPriority = Number(req.body && req.body.display_priority);
        const displayPriority = Number.isFinite(rawPriority)
            ? Math.min(2, Math.max(0, Math.round(rawPriority)))
            : 1;
        const displayTemporary = req.body && req.body.display_is_temporary ? 1 : 0;
        await db.dbInsertManagePost(text, durationMin, displayOrder, displayPriority, displayTemporary);
        clientEvents.sendEvents('reloadPosts');
        res.json({ ok: true });
    } catch (err) {
        console.error('Error adding custom post:', err);
        res.status(500).json({ ok: false });
    }
});

routerManage.post('/message-board/delete', async (req, res) => {
    try {
        const postid = Number(req.body && req.body.postid);
        if (!Number.isInteger(postid)) {
            res.status(400).json({ ok: false });
            return;
        }
        await db.dbDeletePostById(postid);
        clientEvents.sendEvents('reloadPosts');
        res.json({ ok: true });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ ok: false });
    }
});

routerManage.get('/getItemImgs',(req,res) => {    
    let itemImgArray = functions.itemImgArray();    
    let html = getItemImgs.buildHtml(itemImgArray);    
    res.send(html);
    return;
});

//---------------------UI FUNCTIONS-----------------------------//

routerManage.post('/searchNameManage/:data', async (req, res) => {
    try {
        var clientName = (req.params.data).replace(/\"/g, '');
        clientName = clientName.replace(/\'/g, "''");
        if (clientName == "-") {
            res.send(JSON.stringify("clear"));
            return;
        };
        let clientsFound = [];
        clientsFound = (await db.dbGetNameBySearchName(clientName));
        res.send(clientsFound);
    } catch (err) {
        console.error("Error in searchNameManage:", err);
        res.status(500).send("Server Error");
    }
});

routerManage.get('/getProducts/', async (req, res) => {
    try {
        let products = [];
        let listFromDb;
        listFromDb = await db.dbGetProductsAll();
        listFromDb.forEach(element => {
            products.push([JSON.parse(JSON.stringify(element.itemname))]);
        });
        // console.log(JSON.stringify(listFromDb));
        // console.log(listFromDb);
        res.send(listFromDb);
    } catch (err) {
        console.error("Error in getProducts:", err);
        res.status(500).send("Server Error");
    }
});

//---------------------DATA QUERY FUNCTIONS-----------------------------//

routerManage.post('/getAllData/:data', async (req, res) => {
    try {
        let scope = JSON.parse(req.params.data);
        // let itemsBought;
        // itemsBought = await db.dbGetItemsBought().then((dbData) => {return (dbData)});
        // console.log(itemsBought);
        let dbData;
        dbData = await db.dbGetDataByScope(scope);
        // console.log(dbData);
        res.send(dbData)
    } catch (err) {
        console.error("Error in getAllData:", err);
        res.status(500).send("Server Error");
    }
});

routerManage.get('/getItemsBought/', async (req, res) => {
    try {
        console.log("GET ITEMS BOUGHT AT APP: ");
        let itemsBought;
        itemsBought = await db.dbGetItemsBought();
        console.log(itemsBought);
        res.send(itemsBought);
    } catch (err) {
        console.error("Error in getItemsBought:", err);
        res.status(500).send("Server Error");
    }
});

routerManage.post('/requestReportArchive/:data', async (req, res) => {
    try {
        let tableName = req.params.data;
        console.log("GETTING ARCHIVE DATA FROM: " + tableName);
        dbData = await db.dbGetDataFromArchiveByDate(tableName);
        res.send(dbData);
    } catch (err) {
        console.error("Error in requestReportArchive:", err);
        res.status(500).send("Server Error");
    }
});

routerManage.post('/getUserOrders/:data', async (req, res) => {
    try {
        if (req.params.data == null || isNaN(req.params.data)) { console.log("ID IS NOT A NUMBER"); return; };
        let clientId = JSON.parse(req.params.data);
        let dbData;
        dbData = await db.dbGetClientOrdersById(clientId);
        res.send(dbData)
    } catch (err) {
        console.error("Error in getUserOrders:", err);
        res.status(500).send("Server Error");
    }
});

routerManage.get('/getListOfArchiveReport/', async (req, res) => {
    try {
        let archiveList = [];
        let listFromDb;
        listFromDb = await db.dbGetListOfArchiveReport();
        listFromDb.forEach(element => {
            // console.log(JSON.parse(JSON.stringify(element).split(':')[1].replace('}','')));  
            archiveList.push(JSON.parse(JSON.stringify(element).split(':')[1].replace('}', '')));
        });
        // console.log(archiveList);
        res.send(archiveList);
    } catch (err) {
        console.error("Error in getListOfArchiveReport:", err);
        res.status(500).send("Server Error");
    }
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

routerManage.post('/uploadItemImgOld', async (req, res) => {
    console.log("START");
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
    // res.send('עלה אבל יש תקלה אז צריך לחזור דף אחורה זהו התמונה שם');
    res.redirect('referer');
    res.end();
});

function renameFileIfExist(file){
    if(fs.existsSync(file)){
        console.log("if exist rename try 1")
        let fileNameDir = path.parse(file).dir;
        let fileNameBase = path.parse(file).name;
        let fileNameExt = path.parse(file).ext;
        let currentTime = Date.now();
        let nameAfterRename = fileNameDir + "/" + fileNameBase + currentTime + fileNameExt;        
        return nameAfterRename;
        }else{        
        return file;
        }
    };

routerManage.post('/uploadItemImg', async (req, res) => {
    // console.log("start upload");
    // console.log(req);
    let maxFileSize = 70 * 1024 * 1024;;    
    const options = {
        uploadDir: __dirname + '/../public/img/items/',
        maxFileSize: maxFileSize,
        keepExtensions: true,
        filter: function ({ name, originalFilename, mimetype }) {
            return mimetype && mimetype.includes("image");
        }
    };
    const form = formidable(options);
    let newName;
    let originalName;
    let finalImageName;
    form.parse(req, function (err, fields, files) {
        // console.log("start image upload form parse")
        // console.log(fields);
        // console.log(files);        
        newName = files.img.filepath;
        // console.log(newName)
        originalName = (__dirname + '/../public/img/items/') + (files.img.originalFilename);
        originalName = renameFileIfExist(originalName);
        // console.log(originalName)
        fs.rename(newName, originalName, function(err) {
            if (err) console.log(err);
        });
        // console.log(files.img.originalFilename);
        // console.log(originalName);        
        finalImageName = (path.parse(originalName).name)+path.parse(originalName).ext;        
        finalImageName = JSON.stringify(finalImageName);
    });
    res.redirect('/manage');
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