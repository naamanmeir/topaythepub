const express = require('express');
const routerAdmin = express.Router();
const functions = require('../functions');
const db = require('../db');
const sessionClassMW = require("../module/sessionClass");
const bcrypt = require("bcrypt");

routerAdmin.get('/', sessionClassMW(0), (req, res) => {
    console.log("LOGIN TO ADMIN PANEL ON: " + Date());
    let session = req.session;
    let message = "message from ejs";
    res.render('admin', {
        message: message,
        username: session.userid
    })
});

routerAdmin.post("/createUser", sessionClassMW(0), async (req, res) => {
    console.log(req.body);
    if (!req.body.username || !req.body.password || !req.body.class) { res.end; return }

    const username = req.body.username;
    const password = await bcrypt.hash(req.body.password, 10);
    const userclass = req.body.class;

    let dbResponse = await db.createUser(username, password, userclass);

    console.log("DB response: " + dbResponse[2]);
    if (dbResponse[0] == 0) {
        console.log("user creation failed");
        res.redirect(req.get('referer'));
    }
    if (dbResponse[0] == 1) {
        console.log("user created");
        res.redirect(req.get('referer'));
    }
});

module.exports = routerAdmin;