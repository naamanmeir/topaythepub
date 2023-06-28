const express = require('express');
const routerClientEvents = express.Router();
const functions = require('../functions');
const db = require('../db');
const sessionClassMW = require("../module/session/sessionClass");
const {clientLogger, errorLogger} = require('../module/logger');

let clients = [];

routerClientEvents.get('/status', sessionClassMW(120), (req, res) => res.json({ clients: clients.length }));

routerClientEvents.get('/', sessionClassMW(120), function (req, res) {    
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
    // console.log(`Client registered for SSE : ${clientId}`);
    clientLogger.clientRegistered(`  
    SESSION ID: ${clientId} REGISTERED FOR SERVER EVENTS    
    `);
    req.on('close', () => {
        // console.log(`${clientId} Connection closed`);
        clientLogger.clientUnregistered(`  
        SESSION ID: ${clientId} CLOSED SESSION AND DISCONNECTED    
        `);
        clients = clients.filter(client => client.id !== clientId);
    });
    eventSendStatus(res);
});
let eventStatus = 1;
function eventSendStatus(res) {    
    let timerTest = setInterval(() => {
        if (eventStatus==1){
            routerClientEvents.sendEvents("0");
            eventStatus=0;
            return;
        }else if (eventStatus==0){
            routerClientEvents.sendEvents("1");
            eventStatus=1;
            return;
        }
        return;
    }, 10000);
}

routerClientEvents.get('/refreshClients', function (req, res) {
    routerClientEvents.sendEvents("refresh");
});

routerClientEvents.sendEvents = function (event) {
    // console.log("SENDING SERVER SIDE EVENT: " + JSON.stringify(event));
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(event)}\n\n`))
};

module.exports = routerClientEvents;