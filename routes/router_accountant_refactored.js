/**
 * Accountant Router (Refactored)
 * Handles accounting, reporting, and maintenance operations
 * 
 * Pattern: Thin router that delegates to controllers
 * Controllers: /controllers/accounting/*
 */

const express = require('express');
const routerAccountant = express.Router();
const sessionClassMW = require("../module/session/sessionClass");

// Import controllers
const reportController = require('../controllers/accounting/reportController');
const dataQueryController = require('../controllers/accounting/dataQueryController');
const maintenanceController = require('../controllers/accounting/maintenanceController');

//------------------------ MAIN ACCOUNTANT PAGE ---------------------//

routerAccountant.get('/', sessionClassMW(75), (req, res) => {
    console.log("LOGGED IN TO ACCOUNTANT ON: " + Date());
    res.render('accountant', {});
});

//------------------------ DATA QUERY FUNCTIONS ---------------------//

routerAccountant.post('/getAllData/:data', dataQueryController.getDataByScope);
routerAccountant.post('/requestReportArchive/:data', dataQueryController.getArchiveReport);
routerAccountant.get('/getListOfArchiveReport/', dataQueryController.getArchiveList);

//------------------------ REPORT GENERATION ---------------------//

routerAccountant.get('/createFileReportOrders/', reportController.createOrdersReport);
routerAccountant.get('/createFileReportClients/', reportController.createClientsReport);

//------------------------ MAINTENANCE OPERATIONS ---------------------//

routerAccountant.get('/removeOldBackups/', maintenanceController.removeOldBackups);
routerAccountant.get('/resetClientsDataAfterRead/', maintenanceController.resetClientsData);
routerAccountant.post('/backupTable/', maintenanceController.createBackup);

module.exports = routerAccountant;
