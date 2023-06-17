const express = require('express');
const routerAccountant = express.Router();
const functions = require('../functions');
const sessionClassMW = require("../module/session/sessionClass");
const fs = require('fs');
const db = require('./../db.js');
const { stringify } = require("csv-stringify");


//------------------------ MAIN ACCOUNTANT PAGE ---------------------//

routerAccountant.get('/', sessionClassMW(75), async function (req, res) {
    console.log("LOGGED IN TO ACCOUNTANT ON: " + Date());
    res.render('accountant', {})
});

//------------------------ DATA QUERY FUNCTIONS ---------------------//

routerAccountant.post('/getAllData/:data', async (req, res) => {
    let scope = JSON.parse(req.params.data);
    // let itemsBought;
    // itemsBought = await db.dbGetItemsBought().then((dbData) => {return (dbData)});
    // console.log(itemsBought);
    let dbData;
    dbData = await db.dbGetDataByScope(scope).then((dbData) => { return (dbData) });
    // console.log(dbData);
    res.send(dbData)
});

routerAccountant.post('/requestReportArchive/:data', async (req, res) => {
    let tableName = req.params.data;
    console.log("GETTING ARCHIVE DATA FROM: " + tableName);
    dbData = await db.dbGetDataFromArchiveByDate(tableName).then((dbData) => { return (dbData) });
    res.send(dbData);
});

routerAccountant.get('/getListOfArchiveReport/', async (req, res) => {
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

//-----------------------WRITE REPORT FILE WITH ORDERS SCHEME---------------------//
routerAccountant.get('/createFileReportOrders/', async function (req, res) {
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
routerAccountant.get('/createFileReportClients/', async function (req, res) {
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
routerAccountant.get('/removeOldBackups/', async function (req, res) {
    let removedOldBackups;
    removedOldBackups = await db.dbDeleteOldBackups();

    console.log(removedOldBackups);

    res.send(removedOldBackups);
});

//-----------------------RESET CLIENTS TABLE AFTER REPORT---------------------//
routerAccountant.get('/resetClientsDataAfterRead/', async function (req, res) {
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

let dbRateLimit = false;
routerAccountant.post('/backupTable/', async (req, res) => {
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

module.exports = routerAccountant;