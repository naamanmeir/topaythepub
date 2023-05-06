const express = require('express');
const routerApp = express.Router();
const functions = require('../functions');
const db = require('../db');
const { json } = require('stream/consumers');

let messagesJson = require('../messages.json');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];

var now = new Date();

//--------------------------------UI-------------------------------//

routerApp.get('/', async function (req, res) {
    let session = req.session;
    console.log("LOGIN TO APP ON: " + Date());
    res.render('index');
});

routerApp.get('/messages', async function (req, res) {
    console.log("SEND MESSAGES OBJECT");
    messageUi = (messageUi);
    res.send(messagesJson);
});

routerApp.get('/header', function (req, res) {
    console.log("SEND HEADER");
    res.render('header');
});

routerApp.get('/topMenu', function (req, res) {
    console.log("SEND SIDEMENU");    
    res.render('topMenu');
});

routerApp.get('/sideMenu', function (req, res) {
    console.log("SEND TOPMENU");
    res.render('sideMenu');
});

routerApp.get('/floatMenu', function (req, res) {
    console.log("SEND FLOATMENU");
    res.render('floatMenu');
});

routerApp.get('/content', function (req, res) {
    console.log("SEND CONTENT DIV");
    res.render('content');
});

routerApp.get('/contentScript', function (req, res) {
    console.log("SEND CONTENT SCRIPT");
    res.render('contentScript');
});

routerApp.get('/about', function (req, res) {
    console.log("SEND ABOUT");
    res.render('about');
});

routerApp.get('/footer', function (req, res) {
    console.log("SEND FOOTER");
    res.render('footer');
});

//--------------------------------ELEMENTS-------------------------------//

routerApp.get('/getProducts/', async (req, res) => {
    let itemArrayToHtml = require("../module/buildItemHtml");
    let listFromDb = await db.dbGetProducts();
    let html = itemArrayToHtml.buildItemHtml(listFromDb);
    res.send(html);
    console.log("SENT PRODUCTS")
    delete require.cache[require.resolve("../module/buildItemHtml")];
    return;
});

routerApp.get('/getProductsJson/', async (req, res) => {
    let products = [];
    let listFromDb;
    listFromDb = await db.dbGetProducts();
    listFromDb.forEach(item => {
        let row = [item.itemid, item.itemname, item.price, item.itemimgpath];
        products.push(JSON.parse(JSON.stringify(row)));
    });
    res.send(products);
});

//--------------------------------USERS-------------------------------//

module.exports = routerApp;