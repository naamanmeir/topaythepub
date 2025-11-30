/**
 * User Page Controller
 * Handles user page rendering and display information
 */

const db = require('../../module/database/db');
const localizationService = require('../../module/localization/LocalizationService');
let messagesJson = localizationService.getMessages();
let messageUi = messagesJson.ui[0];
let messageClient = messagesJson.client[0];

/**
 * Get user page with order history
 * POST /client/getUserPage/
 */
async function getUserPage(req, res, next) {
    try {
        if (!req.body.id || req.body.id == null) {
            return res.end();
        }
        
        const reqId = req.body.id;
        const userPageModule = require("../../module/html/content/userPage");
        
        // Get user details
        let loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
        
        if (loggedUserDetails.length < 1) {
            console.log("ATTEMPTED INFO FOR INVALID USER ID");
            return res.end();
        }
        
        loggedUserDetails = {
            'id': req.body.id,
            'name': loggedUserDetails[0].name,
            'nick': loggedUserDetails[0].nick,
            'account': loggedUserDetails[0].account,
            'message': messageClient.logged
        };
        
        // Get user data with orders
        const userDataFromDb = await db.dbGetClientInfoById(reqId);
        
        // Build HTML
        const html = JSON.stringify(
            userPageModule.buildHtml(messageUi, loggedUserDetails, userDataFromDb)
        );
        
        res.send(html);
        delete require.cache[require.resolve("../../module/html/content/userPage")];
    } catch (error) {
        next(error);
    }
}

/**
 * Get pinned posts for display
 * POST /client/getDisplayInfo/
 */
async function getDisplayInfo(req, res, next) {
    try {
        if (!req.body.id || req.body.id == null) {
            return res.end();
        }
        
        const displayInfo = await db.dbGetPindPosts();
        const html = JSON.stringify(displayInfo);
        
        res.send(html);
    } catch (error) {
        next(error);
    }
}

/**
 * Track window open event
 * GET /client/windowIsOpen/
 */
async function trackWindowOpen(req, res, next) {
    try {
        // Optional: Log window open event
        // const funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
        res.end();
    } catch (error) {
        next(error);
    }
}

/**
 * Track window close event
 * GET /client/windowIsClose/
 */
async function trackWindowClose(req, res, next) {
    try {
        // Optional: Log window close event
        // const funcTime = new Date().toLocaleString("HE", { timeZone: "Asia/Jerusalem" });
        res.end();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserPage,
    getDisplayInfo,
    trackWindowOpen,
    trackWindowClose
};
