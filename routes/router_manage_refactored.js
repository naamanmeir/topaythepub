/**
 * Management Router (Refactored)
 * Handles product and client management for admin interface
 * 
 * Pattern: Thin router that delegates to controllers
 * Controllers: /controllers/management/* and /controllers/accounting/*
 */

const express = require('express');
const routerManage = express.Router();
const sessionClassMW = require("../module/session/sessionClass");

// Import controllers
const productController = require('../controllers/management/productController');
const clientManagementController = require('../controllers/management/clientManagementController');
const utilityController = require('../controllers/management/utilityController');
const dataQueryController = require('../controllers/accounting/dataQueryController');
const maintenanceController = require('../controllers/accounting/maintenanceController');

//---------------------MAIN PAGES-----------------------------//

routerManage.get('/', utilityController.getManagePage);
routerManage.get('/infotables', utilityController.getInfoTablesPage);
routerManage.get('/retable/', utilityController.recreateTables);

//---------------------PRODUCT MANAGEMENT-----------------------------//

routerManage.get('/getProducts/', productController.getAllProducts);
routerManage.get('/getItemImgs', productController.getItemImages);
routerManage.post('/insertProduct/:data', productController.insertProduct);
routerManage.post('/editProduct/:data', productController.editProduct);
routerManage.post('/deleteProduct/:data', productController.deleteProduct);
routerManage.post('/uploadItemImg', productController.uploadItemImage);

//---------------------CLIENT MANAGEMENT-----------------------------//

routerManage.post('/searchNameManage/:data', clientManagementController.searchClients);
routerManage.post('/insertClient/:data', clientManagementController.insertClient);
routerManage.post('/deleteClient/:data', clientManagementController.deleteClient);
routerManage.post('/editClientFields/:data', clientManagementController.editClientFields);
routerManage.post('/getUserDetails/:data', clientManagementController.getClientDetails);
routerManage.post('/deleteLastOrder/:data', clientManagementController.deleteLastOrder);
routerManage.post('/updateNameList/', clientManagementController.bulkImportClients);

//---------------------DATA QUERY FUNCTIONS-----------------------------//

routerManage.post('/getAllData/:data', dataQueryController.getDataByScope);
routerManage.get('/getItemsBought/', dataQueryController.getItemsBought);
routerManage.post('/requestReportArchive/:data', dataQueryController.getArchiveReport);
routerManage.post('/getUserOrders/:data', dataQueryController.getUserOrders);
routerManage.get('/getListOfArchiveReport/', dataQueryController.getArchiveList);

//---------------------MAINTENANCE OPERATIONS-----------------------------//

routerManage.get('/removeOldBackups/', maintenanceController.removeOldBackups);
routerManage.get('/resetClientsDataAfterRead/', maintenanceController.resetClientsData);
routerManage.post('/backupTable/', maintenanceController.createBackup);

module.exports = routerManage;
