const express = require('express');
const routerClientEvents = express.Router();
const functions = require('../functions');
const db = require('../db');
const sessionClassMW = require("../module/sessionClass");

let clients = [];

routerClientEvents.get('/status', (req, res) => res.json({ clients: clients.length }));

routerClientEvents.get('/', sessionClassMW(100), function (req, res) {
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
    getEvents(res);
});

function getEvents(res) {

}

routerClientEvents.get('/refreshClients', function (req, res) {
    routerClientEvents.sendEvents("refresh");
});

routerClientEvents.sendEvents = function (event) {
    console.log("SENDING SERVER SIDE EVENT: " + JSON.stringify(event));
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(event)}\n\n`))
}



module.exports = routerClientEvents;