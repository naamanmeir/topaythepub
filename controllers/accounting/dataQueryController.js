/**
 * Data Query Controller
 * Handles data queries for accounting and management interfaces
 */

const db = require('../../module/database/db');

/**
 * Get data by scope
 * POST /accountant/getAllData/:data
 * POST /manage/getAllData/:data
 * 
 * Scopes:
 * 1 = All clients
 * 2 = All orders
 * 3 = All products
 * 4 = Clients with formatted dates
 * 5 = Orders with formatted dates
 * 6 = Items purchase statistics
 */
async function getDataByScope(req, res, next) {
    try {
        const scope = JSON.parse(req.params.data);
        const dbData = await db.dbGetDataByScope(scope);
        res.send(dbData);
    } catch (error) {
        next(error);
    }
}

/**
 * Get archive report data
 * POST /accountant/requestReportArchive/:data
 * POST /manage/requestReportArchive/:data
 */
async function getArchiveReport(req, res, next) {
    try {
        const tableName = req.params.data;
        console.log("GETTING ARCHIVE DATA FROM: " + tableName);
        
        const dbData = await db.dbGetDataFromArchiveByDate(tableName);
        res.send(dbData);
    } catch (error) {
        next(error);
    }
}

/**
 * Get list of available archive reports
 * GET /accountant/getListOfArchiveReport/
 * GET /manage/getListOfArchiveReport/
 */
async function getArchiveList(req, res, next) {
    try {
        const archiveList = [];
        const listFromDb = await db.dbGetListOfArchiveReport();
        
        // Extract table names from database results
        listFromDb.forEach(element => {
            const tableName = JSON.parse(
                JSON.stringify(element)
                    .split(':')[1]
                    .replace('}', '')
            );
            archiveList.push(tableName);
        });
        
        res.send(archiveList);
    } catch (error) {
        next(error);
    }
}

/**
 * Get user orders by client ID
 * POST /manage/getUserOrders/:data
 */
async function getUserOrders(req, res, next) {
    try {
        // Validate client ID
        if (req.params.data == null || isNaN(req.params.data)) {
            console.log("ID IS NOT A NUMBER");
            return res.status(400).send('Invalid client ID');
        }
        
        const clientId = JSON.parse(req.params.data);
        const dbData = await db.dbGetClientOrdersById(clientId);
        res.send(dbData);
    } catch (error) {
        next(error);
    }
}

/**
 * Get items purchase statistics
 * GET /manage/getItemsBought/
 */
async function getItemsBought(req, res, next) {
    try {
        console.log("GET ITEMS BOUGHT AT APP: ");
        const itemsBought = await db.dbGetItemsBought();
        console.log(itemsBought);
        res.send(itemsBought);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDataByScope,
    getArchiveReport,
    getArchiveList,
    getUserOrders,
    getItemsBought
};
