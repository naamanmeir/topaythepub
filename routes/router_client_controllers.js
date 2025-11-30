/**
 * Client Router (Refactored - Controller Pattern)
 * Handles client authentication, orders, and user page
 * 
 * Pattern: Thin router that delegates to controllers
 * Controllers: /controllers/client/*
 */

const express = require('express');
const routerClient = express.Router();
const validatorClient = require("../module/input/inputValidatorClient.js");

// Import controllers
const authController = require('../controllers/client/authController');
const orderController = require('../controllers/client/orderController');
const userPageController = require('../controllers/client/userPageController');

//------------------------CLIENT AUTHENTICATION-------------------//

routerClient.post('/searchName/', authController.searchClientByName);
routerClient.post('/userLogin/', authController.loginClient);
routerClient.post('/userLogout/', authController.logoutClient);
routerClient.post('/userAutoLogout/', authController.autoLogoutClient);
routerClient.post('/changeNick/', validatorClient(), authController.changeNickname);

//------------------------CLIENT USER PAGE-------------------//

routerClient.post('/getUserPage/', userPageController.getUserPage);
routerClient.post('/getDisplayInfo/', userPageController.getDisplayInfo);
routerClient.get('/windowIsOpen/', userPageController.trackWindowOpen);
routerClient.get('/windowIsClose/', userPageController.trackWindowClose);

//------------------------CLIENT ORDERS-------------------//

routerClient.post('/requestOrderPage/', orderController.requestOrderPage);
routerClient.post('/placeOrder/', orderController.placeOrder);
routerClient.post('/deleteLastOrderConfirm/', orderController.confirmDeleteLastOrder);
routerClient.post('/deleteLastOrder/', orderController.deleteLastOrder);

module.exports = routerClient;
