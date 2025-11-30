/**
 * Client Authentication Controller
 * Handles client login, logout, and authentication
 */

const db = require('../../module/database/db');
const { actionsLogger } = require('../../module/logger');
const localizationService = require('../../module/localization/LocalizationService');
let messagesJson = localizationService.getMessages();
let messageClient = messagesJson.client[0];

/**
 * Search for clients by name/nickname
 * POST /client/searchName/
 */
async function searchClientByName(req, res, next) {
    try {
        if (!req.body || req.body == null) {
            return res.end();
        }
        
        const query = req.body.name;
        const names = await db.dbGetNameByNick(query);
        
        if (names.length == 0) {
            return res.send(JSON.stringify({ 'errorClient': messageClient.notExist }));
        }
        
        res.send(JSON.stringify(names));
    } catch (error) {
        next(error);
    }
}

/**
 * Client login
 * POST /client/userLogin/
 */
async function loginClient(req, res, next) {
    try {
        if (!req.body.id || req.body.id == null) {
            return res.end();
        }
        
        const loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
        
        const response = JSON.stringify({
            'id': req.body.id,
            'name': loggedUserDetails[0].name,
            'nick': loggedUserDetails[0].nick,
            'account': loggedUserDetails[0].account,
            'message': messageClient.logged
        });
        
        res.send(response);
    } catch (error) {
        next(error);
    }
}

/**
 * Client logout
 * POST /client/userLogout/
 */
async function logoutClient(req, res, next) {
    try {
        if (req.body.id) {
            if (req.body.id > 0 && req.body.id < 1000) {
                return res.send(JSON.stringify({ 
                    "message": `userId ${req.body.id}LogOut Verifyed on Server` 
                }));
            }
        }
        
        res.send("No user data");
    } catch (error) {
        next(error);
    }
}

/**
 * Auto-logout handler
 * POST /client/userAutoLogout/
 */
async function autoLogoutClient(req, res, next) {
    try {
        if (!req.body.id || req.body.id == null) {
            return res.end();
        }
        
        const autoLoggedOutUserDetails = await db.dbGetClientDetailsById(req.body.id);
        
        const response = JSON.stringify({
            'id': req.body.id,
            'name': autoLoggedOutUserDetails[0].name,
            'nick': autoLoggedOutUserDetails[0].nick,
            'account': autoLoggedOutUserDetails[0].account,
            'message': autoLoggedOutUserDetails.logged
        });
        
        res.send(response);
    } catch (error) {
        next(error);
    }
}

/**
 * Change client nickname
 * POST /client/changeNick/
 */
async function changeNickname(req, res, next) {
    try {
        if (!req.body.id || req.body.id == null || 
            req.body.newNick == null || req.body.newNick == "") {
            return res.end();
        }
        
        const newNick = req.body.newNick;
        const id = req.body.id;
        
        // Get existing user details for logging
        const existingUserDetails = await db.dbGetClientDetailsById(id);
        
        // Check if nickname already exists
        const isNickExist = await db.dbGetNameByNickExact(newNick);
        
        if (isNickExist.length != 0) {
            return res.json({ 'errorClient': messageClient.clientChangeNickExist });
        }
        
        // Update nickname
        await db.dbChangeNickById(newNick, id);
        
        console.log(messageClient.clientChangeNickOk + '' + newNick);
        
        // Log the change
        actionsLogger.userAction(`
        message: CHANGE NICKNAME OF USER : 
        id: ${req.body.id} ,
        name:${existingUserDetails[0].name},
        nick:${existingUserDetails[0].nick},
        account:${existingUserDetails[0].account}
        TO NEW NICKNAME: ${newNick}
        `);
        
        res.json({ 'errorClient': messageClient.clientChangeNickOk + newNick });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    searchClientByName,
    loginClient,
    logoutClient,
    autoLogoutClient,
    changeNickname
};
