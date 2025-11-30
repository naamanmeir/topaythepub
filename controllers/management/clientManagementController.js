/**
 * Client Management Controller
 * Handles client CRUD operations for management interface
 */

const db = require('../../module/database/db');
const fs = require('fs');
const readline = require('readline');

/**
 * Search clients by name
 * POST /manage/searchNameManage/:data
 */
async function searchClients(req, res, next) {
    try {
        let clientName = req.params.data.replace(/\"/g, '');
        clientName = clientName.replace(/\'/g, "''");
        
        if (clientName == "-") {
            return res.send(JSON.stringify("clear"));
        }
        
        const clientsFound = await db.dbGetNameBySearchName(clientName);
        res.send(clientsFound);
    } catch (error) {
        next(error);
    }
}

/**
 * Insert new client
 * POST /manage/insertClient/:data
 */
async function insertClient(req, res, next) {
    try {
        const newClient = JSON.parse(req.params.data);
        console.log("APP: ADD NEW NAME: " + newClient);
        
        const insertClientResponse = await db.dbInsertClient(newClient);
        console.log(insertClientResponse);
        
        res.send(insertClientResponse);
    } catch (error) {
        next(error);
    }
}

/**
 * Delete client
 * POST /manage/deleteClient/:data
 */
async function deleteClient(req, res, next) {
    try {
        const clientId = JSON.parse(req.params.data);
        console.log("APP: DELETE CLIENT: " + clientId);
        
        const response = await db.dbDeleteClient(clientId);
        res.send(response);
    } catch (error) {
        next(error);
    }
}

/**
 * Edit client fields
 * POST /manage/editClientFields/:data
 */
async function editClientFields(req, res, next) {
    try {
        const newFields = req.params.data.split(",");
        console.log("APP: EDIT FIELD : " + newFields);
        
        let clientId = newFields[0].replace(/\'/g, "''");
        let field = newFields[1].replace(/\'/g, "''");
        let value = newFields[2].replace(/\'/g, "''");
        
        // Map field number to field name
        if (field == 1) field = "name";
        if (field == 2) field = "nick";
        if (field == 3) field = "account";
        
        const clientFieldsEdited = await db.dbEditClient(clientId, field, value);
        res.send(clientFieldsEdited);
    } catch (error) {
        next(error);
    }
}

/**
 * Get client details by ID
 * POST /manage/getUserDetails/:data
 */
async function getClientDetails(req, res, next) {
    try {
        const clientId = req.params.data;
        console.log("APP: GET DETAILS BY ID: " + clientId);
        
        const clientFields = await db.dbGetClientDetailsById(clientId);
        console.log(JSON.stringify(clientFields));
        
        res.send(clientFields);
    } catch (error) {
        next(error);
    }
}

/**
 * Delete last order for client
 * POST /manage/deleteLastOrder/:data
 */
async function deleteLastOrder(req, res, next) {
    try {
        const clientID = JSON.parse(req.params.data);
        console.log("APP: DELETE LAST ORDER FROM ID: " + clientID);
        
        const deleteLastOrderResponse = await db.dbDeleteLastOrderById(clientID);
        console.log(deleteLastOrderResponse);
        
        res.send(deleteLastOrderResponse);
    } catch (error) {
        next(error);
    }
}

/**
 * Bulk import clients from CSV
 * POST /manage/updateNameList/
 */
async function bulkImportClients(req, res, next) {
    try {
        const fileStream = fs.createReadStream('namelist.csv', 'utf8');
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        
        for await (const line of rl) {
            const number = line.split('\t')[0];
            const name = line.split('\t')[1];
            const nick = name;
            
            console.log(number);
            console.log(name);
            
            const newClient = [name, nick, number];
            const insertClientResponse = await db.dbInsertClient(newClient);
            console.log(insertClientResponse);
        }
        
        res.send("Import complete");
    } catch (error) {
        next(error);
    }
}

module.exports = {
    searchClients,
    insertClient,
    deleteClient,
    editClientFields,
    getClientDetails,
    deleteLastOrder,
    bulkImportClients
};
