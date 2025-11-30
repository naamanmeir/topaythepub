/**
 * Management Utility Controller
 * Handles database utilities, info tables, and system operations
 */

const db = require('../../module/database/db');
const functions = require('../../functions');

/**
 * Management main page
 * GET /manage/
 */
async function getManagePage(req, res, next) {
    try {
        console.log("MANAGE : " + Date());
        const itemImgArray = functions.itemImgArray();
        
        res.render('manage', {
            imgArray: itemImgArray
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Info tables page
 * GET /manage/infotables
 */
async function getInfoTablesPage(req, res, next) {
    try {
        console.log("LOGIN TO MANAGE REPORT PAGE ON: " + Date());
        res.render('infotables', {});
    } catch (error) {
        next(error);
    }
}

/**
 * Recreate database tables
 * GET /manage/retable/
 */
async function recreateTables(req, res, next) {
    try {
        const createTableClients = await db.dbCreateTableClients();
        const createTableOrders = await db.dbCreateTableOrders();
        const createTableProducts = await db.dbCreateTableProducts();
        const createTableUsers = await db.dbCreateTableUsers();
        
        res.send(createTableOrders);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getManagePage,
    getInfoTablesPage,
    recreateTables
};
