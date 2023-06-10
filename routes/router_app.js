const express = require('express');
const routerApp = express.Router();
const functions = require('../functions');
const db = require('../db');
const {actionsLogger, ordersLogger} = require('../module/logger');
const { json } = require('stream/consumers');

let messagesJson = require('../messages.json');
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];
let messageError = messagesJson.error[0];

var now = new Date();

//--------------------------------UI-------------------------------//

routerApp.get('/', async function (req, res) {
    // let session = req.session;
    // console.log("LOGIN TO APP ON: " + Date());
    res.render('index');
});

routerApp.get('/messages', async function (req, res) {
    // console.log("SEND MESSAGES OBJECT");
    messageUi = (messageUi);
    res.send(messagesJson);
});

routerApp.get('/header', function (req, res) {
    // console.log("SEND HEADER");
    // res.render('header');
    let renderHeader = require("../module/html/main/header");
    let html = renderHeader.buildHtml(messageUi);
    res.send(html);
});

routerApp.get('/topMenu', function (req, res) {
    // console.log("SEND SIDEMENU");    
    // res.render('topMenu');
    let renderTopMenu = require("../module/html/main/topMenu");
    let html = renderTopMenu.buildHtml(messageUi);
    res.send(html);
});

routerApp.get('/sideMenu', function (req, res) {
    // console.log("SEND TOPMENU");
    // res.render('sideMenu');
    let renderSideMenu = require("../module/html/main/sideMenu");
    let html = renderSideMenu.buildHtml(messageUi);
    res.send(html);
});

routerApp.get('/floatMenu', function (req, res) {
    // console.log("SEND FLOATMENU");
    // res.render('floatMenu');
    let renderFloatMenu = require("../module/html/main/floatMenu");
    let html = renderFloatMenu.buildHtml(messageUi);
    res.send(html);
});

routerApp.get('/content', function (req, res) {
    // console.log("SEND CONTENT DIV");
    res.render('content');
});

routerApp.get('/contentScript', function (req, res) {
    // console.log("SEND CONTENT SCRIPT");
    res.render('contentScript');
});

routerApp.get('/about', function (req, res) {
    // console.log("SEND ABOUT");
    // res.render('about');
    let renderAbout = require("../module/html/main/about");
    let html = renderAbout.buildHtml(messageUi);
    res.send(html);
});

routerApp.get('/footer', function (req, res) {
    // console.log("SEND FOOTER");
    // res.render('footer');
    let renderFooter = require("../module/html/main/footer");
    let html = renderFooter.buildHtml(messageUi);
    res.send(html);
});

//--------------------------------ELEMENTS-------------------------------//

routerApp.get('/getProducts/', async (req, res) => {
    let itemArrayToHtml = require("../module/html/content/productItem");
    let listFromDb = await db.dbGetProducts();
    let html = itemArrayToHtml.buildHtml(messageUi,listFromDb);
    res.send(html);
    // console.log("SENT PRODUCTS")
    delete require.cache[require.resolve("../module/html/content/productItem")];
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