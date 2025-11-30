const mariadb = require('mariadb');
require("dotenv").config();
const bcrypt = require("bcrypt");

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    connectionLimit: 25
});

const tableClients = process.env.DB_TABLE_CLIENTS;
const tableOrders = process.env.DB_TABLE_ORDERS;
const tableProducts = process.env.DB_TABLE_PRODUCTS;
const tableUsers = process.env.DB_TABLE_USERS;
const tableSessions = process.env.DB_TABLE_SESSIONS;
const tableTokens = process.env.DB_TABLE_TOKENS;
const tablePosts = process.env.DB_TABLE_POSTS;
const tableFacts = process.env.DB_TABLE_FACTS;

//-----------------------------INIT----------------------------------//
exports.dbConnectionTest = async function() {
    try {
        await pool.getConnection();
        console.log("Successfully connected to database");
    } catch (error) {
        console.log("database connection failed. exiting now...");
        console.error(error);
        process.exit(1);
    }
};

exports.createUserTable = async function() {
    try {
        return await pool.query("CREATE TABLE IF NOT EXISTS `" + tableUsers +
            "`(`userId` INT NOT NULL AUTO_INCREMENT," +
            "`class` INT NOT NULL DEFAULT '100'," +
            "`user` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'user'," +
            "`password` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'pass'," +
            "PRIMARY KEY (`userId`));"
        );
    } catch (err) {
        console.error("Error creating user table:", err);
        throw err;
    }
};

exports.createSessionTable = async function() {
    try {
        return await pool.query("CREATE TABLE IF NOT EXISTS `" + tableSessions +
            "`(`sessionId` INT NOT NULL AUTO_INCREMENT," +
            "`time` DATE ," +
            "`userClass` INT NOT NULL DEFAULT '100'," +
            "`userName` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'userDefault'," +
            "`session` TEXT(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin ," +
            "PRIMARY KEY (`sessionId`));"
        );
    } catch (err) {
        console.error("Error creating session table:", err);
        throw err;
    }
};

exports.createTokenTable = async function() {
    try {
        return await pool.query("CREATE TABLE IF NOT EXISTS `" + tableTokens +
            "`(`tokenId` INT NOT NULL AUTO_INCREMENT," +
            "`time` DATE DEFAULT NOW()," +
            "`tokenClass` INT NOT NULL DEFAULT '100'," +
            "`tokenName` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'token'," +
            "`tokenExp` INT NOT NULL DEFAULT '15'," +
            "`token` TEXT(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin ," +
            "PRIMARY KEY (`tokenId`));"
        );
    } catch (err) {
        console.error("Error creating token table:", err);
        throw err;
    }
};

exports.dbCreateTableClients = async function() {
    try {
        return await pool.query("CREATE TABLE IF NOT EXISTS `" + tableClients +
            "`(`id` INT NOT NULL AUTO_INCREMENT," +
            "`last_action` DATETIME NOT NULL DEFAULT (now())," +
            "`sum` INT NOT NULL DEFAULT '0'," +
            "`account` INT NOT NULL DEFAULT '1'," +
            "`name` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL," +
            "`nick` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL," +
            "PRIMARY KEY (`id`));"
        );
    } catch (err) {
        console.error("Error creating clients table:", err);
        throw err;
    }
};

exports.dbCreateTableOrders = async function() {
    try {
        return await pool.query("CREATE TABLE IF NOT EXISTS `" + tableOrders +
            "`(`orderid` INT NOT NULL AUTO_INCREMENT," +
            "`sign` INT NOT NULL DEFAULT '0'," +
            "`time` DATETIME NOT NULL DEFAULT (now())," +
            "`info` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin," +
            "`sum` INT NOT NULL DEFAULT '0'," +
            "`clientid` INT NOT NULL DEFAULT '1'," +
            "`client` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL," +
            "PRIMARY KEY (`orderid`));"
        );
    } catch (err) {
        console.error("Error creating orders table:", err);
        throw err;
    }
};

exports.dbCreateTableProducts = async function() {
    try {
        return await pool.query("CREATE TABLE IF NOT EXISTS `" + tableProducts +
            "`(`itemid` INT NOT NULL AUTO_INCREMENT," +
            "`itemorder` INT NOT NULL DEFAULT '1'," +
            "`stock` INT NOT NULL DEFAULT '0'," +
            "`price` INT NOT NULL DEFAULT '10'," +
            "`itemname` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'beer'," +
            "`itemimgpath` VARCHAR(1024) NOT NULL DEFAULT 'img/items/1.png'," +
            "PRIMARY KEY (`itemid`));"
        );
    } catch (err) {
        console.error("Error creating products table:", err);
        throw err;
    }
};

exports.dbCreateTablePosts = async function() {
    try {
        return await pool.query("CREATE TABLE IF NOT EXISTS `" + tablePosts + "`(" +
            "`postid` INT NOT NULL AUTO_INCREMENT," +
            "`date` DATE," +
            "`user` INT," +
            "`post` TEXT(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin," +
            "`img` VARCHAR(1024)," +
            "`pin` INT," +
            "PRIMARY KEY (`postid`)" +
            ");"
        );
    } catch (err) {
        console.error("Error creating posts table:", err);
        throw err;
    }
};

exports.dbCreateTableFacts = async function() {
    try {
        return await pool.query("CREATE TABLE IF NOT EXISTS `" + tableFacts + "`(" +
            "`factid` INT NOT NULL AUTO_INCREMENT," +
            "`date` DATE," +
            "`level` INT," +
            "`fact` TEXT(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin," +
            "PRIMARY KEY (`factid`)" +
            ");"
        );
    } catch (err) {
        console.error("Error creating facts table:", err);
        throw err;
    }
};

exports.connectionStatus = async function() {
    console.log("Total connections: ", pool.totalConnections());
    console.log("Active connections: ", pool.activeConnections());
    console.log("Idle connections: ", pool.idleConnections());
};

//--------------------------------USER MANAGE--------------------------//
exports.createUser = async function(user, password, userclass) {
    try {
        let ifExist = await checkUserExist(user);
        if (ifExist && ifExist.length != 0) {
            return [0, user, `A USER NAME ${user} ALLREADY EXIST IN TABLE , ABORTING`];
        } else {
            console.log("USER AVAILABLE");
            let sql = `INSERT INTO ${tableUsers} (user,password,class) VALUES (?,?,?);`;
            let values = [user, password, userclass];
            await pool.query(sql, values);
            return [1, user, `USER ${user} ADDED TO USER TABLE , CONTINUE`];
        }
    } catch (err) {
        console.error("Error creating user:", err);
        throw err;
    }
};

exports.userLogin = async function(user, password) {
    try {
        let userQuery = await checkUserExist(user);
        if (userQuery && userQuery.length == 0) {
            return [0, user, `A USER NAME ${user} NOT EXIST IN TABLE , ACCESS DENIED`];
        } else {
            const hashedPassword = userQuery[0].password;
            if (await bcrypt.compare(password, hashedPassword)) {
                return [2, user, `USER ${user} IS VALID AND AUTHENTICTED, ACCESS GRANTED`];
            } else {
                return [1, user, `USER ${user} USED WRONG PASSWORD , ACCESS DENIED`];
            }
        }
    } catch (err) {
        console.error("Error logging in:", err);
        throw err;
    }
};

async function checkUserExist(user) {
    const sql = `SELECT * FROM ${tableUsers} WHERE user = ?;`;
    return await pool.query(sql, [user]);
};

exports.getUserClassByName = async function getUserClassByName(user) {
    const sql = `SELECT class FROM ${tableUsers} WHERE user = ?;`;
    let userClass = await pool.query(sql, [user]);
    return userClass[0].class;
};

exports.getUserTableLength = async function getUserTableLength() {
    const sql = (`SELECT * FROM ${tableUsers};`)
    let userLength = await pool.query(sql);
    return userLength.length;
};

//----------------------------------------SESSION MANAGE-----------------------//

exports.storeSession = async function storeSession(username, userclass, session) {
    const sql = `INSERT INTO ${tableSessions} (time,userClass,userName,session) VALUES (NOW(),?,?,?);`;
    let storeSession = await pool.query(sql, [userclass, username, session]);
    return parseInt(storeSession.insertId);
};

exports.findSession = async function findSession(session) {
    const sql = `SELECT * FROM ${tableSessions} WHERE session = ?`;
    let results = await pool.query(sql, [session]);
    return (results.length === 1);
};

exports.removeSession = async function removeSession(sessionId) {
    const sql = `DELETE FROM ${tableSessions} WHERE sessionId = ?;`;
    return await pool.query(sql, [sessionId]);
};

//-------------------------------LOGIN TOKENS----------------//

exports.dbInsertToken = async function(token, tokenClass, tokenName, tokenExp) {
    if (tokenClass == null) { tokenClass = 100 };
    let sql = ('INSERT INTO ' + tableTokens + ' (token, tokenClass, tokenName, tokenExp) VALUES (?);');
    let values = [
        [token, tokenClass, tokenName, tokenExp]
    ];
    return await pool.query(sql, values);
};

exports.dbFindToken = async function(token) {
    const sql = `SELECT tokenId FROM ${tableTokens} WHERE token = ?`;
    let results = await pool.query(sql, [token]);
    return (results.length === 1);
};

exports.dbRemoveToken = async function(token) {
    const sql = `DELETE FROM ${tableTokens} WHERE token = ?;`;
    return await pool.query(sql, [token]);
};

//-----------------------GET PRODUCTS IF YESH----------------------//
exports.dbGetProducts = async function() {
    return await pool.query("SELECT * FROM " + tableProducts +
        " WHERE stock > 0 ORDER BY itemorder ASC;");
};

exports.dbGetProductsAll = async function() {
    return await pool.query("SELECT * FROM " + tableProducts +
        " ORDER BY itemorder ASC;");
};

exports.dbGetPricesAll = async function() {
    return await pool.query("SELECT price FROM " + tableProducts + " ORDER BY itemid ASC;");
};

//--------------------INSERT NEW CLIENT TO DB----------------//
exports.dbInsertClient = async function(newClient) {
    let name = newClient[0];
    let nick = newClient[1];
    let account = newClient[2];
    
    try {
        let ifName = await this.dbGetNameIfExist(name);
        let ifNick = await this.dbGetNickIfExist(nick);
        let ifAccount = await this.dbGetAccountIfExist(account);
        
        if (ifName.length != 0) { console.log("NAME EXIST"); return ("שם משתמש תפוס"); } 
        if (ifNick.length != 0) { console.log("NICK EXIST"); return ("כינוי תפוס"); } 
        if (ifAccount.length != 0 && account != 0) { console.log("ACCOUNT EXIST"); return ("מספר חשבון תפוס"); } 

        console.log("CLIENT AVAILABLE");
        await pool.query("INSERT INTO " + tableClients +
                " (name,nick,account) VALUES (?,?,?);", [name, nick, account]);
        
        return ("התווסף קליינט : " + name + " במספר שירות: " + account + " וכינויו: " + nick);
    } catch (err) {
        console.error("Error inserting client:", err);
        throw err;
    }
};

//--------------------EDIT CLIENT FIELDS----------------//
exports.dbEditClient = async function(clientId, field, value) {
    var fieldHeb;
    if (field == 'name') { fieldHeb = ("שם משתמש") };
    if (field == 'nick') { fieldHeb = ("כינוי") };
    if (field == 'account') { fieldHeb = ("מספר חשבון") };
    
    const allowedFields = ['name', 'nick', 'account'];
    if (!allowedFields.includes(field)) {
        return ("שדה לא חוקי");
    }

    try {
        await pool.query(`UPDATE ${tableClients} SET ${field} = ? WHERE id = ?;`, [value, clientId]);
        return ("למשתמש מספר " + clientId + " עודכן " + fieldHeb + " ונרשם: " + value);
    } catch (err) {
        console.error("Error editing client:", err);
        throw err;
    }
};

//--------------------VALIDATE LAST ORDER EXIST BY CLIEND ID----------------//
exports.dbConfirmDeleteLastOrderById = async function(clientId) {
    try {
        let lastOrderDetails = await pool.query("SELECT sign,orderid,sum,info," +
                "DATE_FORMAT(`time`, '%Y-%m-%d %H:%i') AS `time`,client FROM " + tableOrders +
                " WHERE clientid = ? ORDER BY orderid DESC LIMIT 1;", [clientId]);
        
        if (lastOrderDetails[0] == null) { console.log("no order"); return ("no such order"); };

        let clientDetail = await pool.query("SELECT sum FROM " + tableClients +
            " WHERE id = ?;", [clientId]);
        
        if (lastOrderDetails[0].sum > clientDetail[0].sum) {
            console.log("ERROR SUM IS NO LOGICAL");
            // return ("ERROR WITH THE NUMBERS");
        };

        return lastOrderDetails[0];
    } catch (err) {
        console.error("Error confirming delete last order:", err);
        throw err;
    }
};

//--------------------DELETE LAST ORDER BY CLIEND ID----------------//
exports.dbDeleteLastOrderById = async function(clientId) {
    try {
        let lastOrderDetails = await pool.query("SELECT orderid,sum FROM " + tableOrders +
                " WHERE clientid = ? ORDER BY orderid DESC LIMIT 1;", [clientId]);
        
        if (lastOrderDetails[0] == null) { console.log("no order"); return ("no such order"); };

        let clientDetail = await pool.query("SELECT sum FROM " + tableClients +
            " WHERE id = ?;", [clientId]);
        
        if (lastOrderDetails[0].sum > clientDetail[0].sum) { 
            console.log("ERROR SUM IS NO LOGICAL"); 
            return ("ERROR WITH THE NUMBERS");
        }

        await pool.query("UPDATE " + tableClients +
                " SET sum = (sum - ?) WHERE id = ?;", [lastOrderDetails[0].sum, clientId]);
        
        await pool.query("DELETE FROM " + tableOrders + " WHERE orderid = ?;", [lastOrderDetails[0].orderid]);
        
        return ("DELETE LAST ORDER FROM: " + clientId + " SUM OF: " + lastOrderDetails[0].sum);
    } catch (err) {
        console.error("Error deleting last order:", err);
        throw err;
    }
};

//--------------------INSERT NEW NAME TO DB----------------//
exports.dbInsertName = async function(name) {
    try {
        let ifExist = await this.dbGetExactName(name);
        if (ifExist.length != 0) {
            console.log("name exist");
            return ("NAME ALLREADY EXIST IN DATABASE");
        } else {
            console.log("NAME DONT EXIST");
            await pool.query(`INSERT INTO ${tableClients} (listed,last_action,item1,item2,item3,item4,sum,name) VALUES (1,(now()),0,0,0,0,0,?);`, [name]);
            return ("INSERTED INTO DATABASE -- NO PROOF YET");
        }
    } catch (err) {
        console.error("Error inserting name:", err);
        throw err;
    }
};

//--------------------DELETE CLIENT BY ID----------------//
exports.dbDeleteClient = async function(clientId) {
    try {
        let ifExist = await this.dbGetClientDetailsById(clientId);
        if (ifExist.length == 0) {
            console.log("CLIENT DONT EXIST");
            return ("CLIENT NOT FOUND IN DATABASE");
        } else {
            await pool.query(`DELETE FROM ${tableClients} WHERE id = ?;`, [clientId]);
            return ("REMOVED FROM DATABASE -- NO PROOF YET");
        }
    } catch (err) {
        console.error("Error deleting client:", err);
        throw err;
    }
};

//--------------------INSERT ORDER TO ORDERS TABLE----------------//
exports.dbInsertOrderToOrdersOld = async function(orderTime, clientId, orderInfo, totalPrice) {
    try {
        let clientName = await this.dbGetClientNameById(clientId);
        let insertReturn = await pool.query(`INSERT INTO ${tableOrders} 
         (time,info,sum,clientid,client)
          VALUES (now(), ? , ? , ? , ?);`, [orderInfo, totalPrice, clientId, clientName[0].name]);
        
        await this.dbInsertOrderToClient(orderTime, clientId, totalPrice);
        
        let insertId = insertReturn.insertId.toString();
        let name = clientName[0].name.toString();
        return (`רישום מספר ${insertId}, נרשם בהצלחה, על חשבון, ${name} `);
    } catch (err) {
        console.error("Error inserting order (old):", err);
        throw err;
    }
};

//--------------------INSERT ORDER TO ORDERS TABLE----------------//
exports.dbInsertOrderToOrders = async function(orderTime, clientId, orderInfo, totalPrice) {
    try {
        let clientName = await this.dbGetClientNameById(clientId);
        let sql = ('INSERT INTO ' + tableOrders + ' (time,info,sum,clientid,client) VALUES (now(),?);');
        let values = [
            [orderInfo, totalPrice, clientId, clientName[0].name]
        ];
        return await pool.query(sql, values);
    } catch (err) {
        console.error("Error inserting order:", err);
        throw err;
    }
};

//--------------------INSERT ORDER TO CLIENT TABLE----------------//
exports.dbInsertOrderToClient = async function(orderTime, clientId, totalPrice) {
    let sql = (`UPDATE ${tableClients} SET last_action = (NOW()),
  sum = sum+?
  WHERE id = ?;`);
    let values = [
        totalPrice, clientId
    ];
    return await pool.query(sql, values);
};

exports.dbInsertOrderToClientOld = async function(orderTime, clientId, totalPrice) {
    try {
        let orderResult = await pool.query(`UPDATE ${tableClients} SET last_action = (NOW()),
       sum = sum+?
       WHERE id = ?;`, [totalPrice, clientId]);
        
        let affectedRows = orderResult.affectedRows.toString();
        console.log("------------------------------------------");
        console.log(affectedRows);
        console.log("------------------------------------------");
        return affectedRows;
    } catch (err) {
        console.error("Error inserting order to client (old):", err);
        throw err;
    }
};

//-----------------------GET CLIENT NAME BY ID----------------------//
exports.dbGetClientNameById = function(id) {
    return pool.query("SELECT name FROM " + tableClients + " WHERE id = ?;", [id]);
};

//-----------------------GET ALL CLIENT DETAILS BY NAME OR NICK OR NUMBER----------------------//
exports.dbGetClientDetailsByFields = function(name, nick, account) {
    return pool.query("SELECT name,nick,account FROM " + tableClients +
        " WHERE name LIKE ? OR nick LIKE ? OR account LIKE ?;", [name, nick, account]);
};

//-----------------------GET CLIENT DETAILS BY ID----------------------//
exports.dbGetClientDetailsById = function(clientId) {
    return pool.query("SELECT name,nick,account FROM " + tableClients +
        " WHERE id= ?;", [clientId]);
};

//-----------------------CHANGE USER NICKNAME BY ID----------------------//
exports.dbChangeNickById = function(newNick, clientId) {
    let sql = ("UPDATE " + tableClients + " SET nick = ? WHERE id = ?;");
    let values = [
        newNick, clientId
    ];
    return pool.query(sql, values);
};

//-----------------------GET ALL CLIENT DETAILS BY ID----------------------//
exports.dbGetClientInfoById = function(id) {
    return pool.query("SELECT sign,sum,info," +
        "DATE_FORMAT(`time`, '%Y-%m-%d %H:%i') AS `formatted_date`,orderid FROM " +
        tableOrders +
        " WHERE clientid = ? " +
        " ORDER BY time DESC;", [id]);
};

//-----------------------GET EXACT NAME FROM DB----------------------//
exports.dbGetExactName = function(name, nick, account) {
    return pool.query("SELECT name FROM " + tableClients +
        " WHERE name LIKE ? OR nick LIKE ? OR account LIKE ?;", [name, nick, account]);
};

//-----------------------GET BY NAME FROM DB----------------------//
exports.dbGetNameIfExist = function(name) {
    return pool.query("SELECT name FROM " + tableClients +
        " WHERE name LIKE ?;", [name]);
};

//-----------------------GET BY NICK FROM DB----------------------//
exports.dbGetNickIfExist = function(nick) {
    return pool.query("SELECT nick FROM " + tableClients +
        " WHERE nick LIKE ?;", [nick]);
};

//-----------------------GET BY ACCOUNT FROM DB----------------------//
exports.dbGetAccountIfExist = function(account) {
    return pool.query("SELECT account FROM " + tableClients +
        " WHERE account LIKE ?;", [account]);
};

//-----------------------GET ID NICK AND NAME FROM DB BY NAME SEARCH----------------------//
exports.dbGetNameBySearchName = function(clientName) {
    return pool.query("SELECT id,account,name,nick FROM " + tableClients +
        " WHERE name LIKE ? ORDER BY last_action DESC;", ['%' + clientName + '%']);
};

//-----------------------GET ID NICK AND NAME FROM DB BY NICK ----------------------//
exports.dbGetNameByNick = function(query) {
    let queryList = query.split(" ");
    if (queryList[1] == null) { queryList[1] = queryList[0] };
    if (queryList[2] == null) { queryList[2] = queryList[0] };
    if (queryList[3] == null) { queryList[3] = queryList[0] };
    if (queryList[4] == null) { queryList[4] = queryList[0] };
    return pool.query("SELECT id,nick,name FROM " + tableClients +
        " WHERE nick LIKE ? OR nick LIKE ? OR nick LIKE ? OR nick LIKE ? OR name LIKE ? OR name LIKE ? OR name LIKE ? OR name LIKE ? ORDER BY last_action DESC;",
        ['%' + queryList[0] + '%', '%' + queryList[1] + '%', '%' + queryList[2] + '%', '%' + queryList[3] + '%',
         '%' + queryList[0] + '%', '%' + queryList[1] + '%', '%' + queryList[2] + '%', '%' + queryList[3] + '%']);
};

//-----------------------GET ID NICK AND NAME FROM DB BY EXACT NICK ----------------------//
exports.dbGetNameByNickExact = function(query) {
    return pool.query("SELECT id,nick,name FROM " + tableClients +
        " WHERE nick LIKE ? ORDER BY last_action DESC;", [query]);
};

//-----------------------GET ID NICK AND NAME FROM DB BY NICK AND NAME----------------------//
exports.dbGetNameBySearch = function(query) {
    let queryList = query.split(" ");
    if (queryList[1] == null) { queryList[1] = queryList[0] };
    if (queryList[2] == null) { queryList[2] = queryList[0] };
    if (queryList[3] == null) { queryList[3] = queryList[0] };
    if (queryList[4] == null) { queryList[4] = queryList[0] };
    return pool.query("SELECT id,nick,name FROM " + tableClients +
        " WHERE nick LIKE ? AND nick LIKE ? AND nick LIKE ? AND nick LIKE ? OR name LIKE ? OR name LIKE ? OR name LIKE ? OR name LIKE ? ORDER BY last_action DESC;",
        ['%' + queryList[0] + '%', '%' + queryList[1] + '%', '%' + queryList[2] + '%', '%' + queryList[3] + '%',
         '%' + queryList[0] + '%', '%' + queryList[1] + '%', '%' + queryList[2] + '%', '%' + queryList[3] + '%']);
};

//-----------------------GET INFO BY SCOPE----------------------//
exports.dbGetDataByScope = async function(scope) {
    if (scope == 1) { //SCOPE ORDERS
        return await pool.query("SELECT orderid,DATE_FORMAT(`time`, '%d-%m-%y') AS `formatted_date`" +
            ",info,sum,clientid,client FROM " + tableOrders +
            " WHERE clientid IN ( SELECT id FROM " + tableClients + " WHERE account >= 50 )" +
            " ORDER BY orderid DESC;");
    };
    if (scope == 2) { //SCOPE CLIENTS ALL
        return await pool.query("SELECT id,DATE_FORMAT(`last_action`, '%d-%m-%y %h:%i') AS `formatted_date`" +
            ",sum,account,name,nick FROM " + tableClients +
            " WHERE account > 50" +
            " ORDER BY name;");
    };
    if (scope == 3) { //SCOPE CLIENTS REAL
        return await pool.query("SELECT id,DATE_FORMAT(`last_action`, '%d-%m-%y %h:%i') AS `formatted_date`" +
            ",sum,account,name,nick FROM " + tableClients +
            " ORDER BY name;");
    };
    if (scope == 4) { //SCOPE REPORT WITH TOTAL SUM PER CLIENT
        return await pool.query("SELECT sum," +
            " DATE_FORMAT(`last_action`, '%d/%m/%y') AS `formatted_date`" +
            ",name,account FROM " + tableClients +
            " WHERE account >= 50 AND sum > 0 " +
            " ORDER BY last_action DESC ;");
    };
    if (scope == 5) { //SCOPE REPORT WITH ORDERS MERGED BY DATE
        return await pool.query("SELECT sum(" +
            tableOrders + ".sum) AS `sum`" +
            ",DATE_FORMAT(`time`, '%d-%m-%y') AS `date`" +
            ",GROUP_CONCAT(" +
            tableOrders + ".info SEPARATOR ',') AS `info`," +
            tableOrders + ".client AS `client`," +
            tableClients + ".account AS `account`" +
            " FROM " + tableOrders +
            " INNER JOIN " + tableClients + " ON " + tableOrders + ".clientid = clients.id " +
            " WHERE sign = 0 AND " +
            " clientid IN ( SELECT id FROM " + tableClients + " WHERE account >= 50 AND sum > 0)" +
            " GROUP BY date, clientid " +
            " ORDER BY orderid DESC;");
    };
};

//-----------------------GET ARCHIVE REPORT BY DATE----------------------//
exports.dbGetDataFromArchiveByDate = async function(archiveTableName) {
    return await pool.query("SELECT sum," +
        " DATE_FORMAT(`last_action`, '%d/%m/%y') AS `formatted_date`" +
        ",name,account FROM " + archiveTableName +
        " WHERE account >= 50 AND sum > 0 " +
        " ORDER BY last_action DESC ;");
};

//-----------------------GET ACCOUNT ORDERS BY ID----------------------//
exports.dbGetClientOrdersById = async function(clientId) {
    return await pool.query("SELECT orderid,DATE_FORMAT(`time`, '%Y-%m-%d %H:%i') AS `formatted_date`" +
        ",info,sum,client FROM " + tableOrders +
        " WHERE clientid = ? " +
        " ORDER BY orderid DESC;", [clientId]);
};

//-----------------------BACKUP TABLES INTERNALLY-----------------------//
exports.dbBackupTable = async function(time) {
    try {
        let tsmp = time.toString();
        tsmp = tsmp.replace("/", "");
        tsmp = tsmp.replace(",", "");
        tsmp = tsmp.replace(":", "");
        tsmp = tsmp.replace(" ", "");
        tsmp = tsmp.replace("/", "");
        tsmp = tsmp.replace(":", "");
        const backupTableName = (`${tableClients}_${tsmp}`);
        console.log(backupTableName);
        let backup_table = await pool.query(`CREATE OR REPLACE TABLE ${backupTableName} LIKE ${tableClients};`);
        let backup_rows = await pool.query(`INSERT IGNORE INTO ${backupTableName} SELECT * FROM ${tableClients}`);
        console.log(await backup_table);
        console.log(await backup_rows);
        return (backupTableName);
    } catch (err) {
        console.error("Error backing up table:", err);
        throw err;
    }
};

//-----------------------GET LIST OF ARCHIVE REPORT-----------------------//
exports.dbGetListOfArchiveReport = async function() {
    return await pool.query("SHOW TABLES LIKE 'clients_%';");
};
//-----------------------DELETE OLD BACKUP TABLES INTERNALLY-----------------------//
exports.dbDeleteOldBackups = async function(time) {
    try {
        let tableBackups = await pool.query(`SHOW TABLES LIKE 'bk_%';`);
        for (i = 0; i < tableBackups.length - 1; i++) {
            let tableName = (JSON.stringify(tableBackups).split(',')[i].split(':')[1].replace('"', '').replace('"', '').replace('}', ''));
            console.log(tableName);
            let tableDropResponse = await pool.query("DROP TABLE " + tableName + ";");
            console.log(tableDropResponse);
        }
        return;
    } catch (err) {
        console.error("Error deleting old backups:", err);
        throw err;
    }
};

//-----------------------RESET CLIENTS ORDERS AFTER REPORT-----------------------//
exports.dbResetClientOrders = async function() {
    try {
        let resetClientOrders = await pool.query("UPDATE " + tableClients + " SET sum=0;");
        let resetOrders = await pool.query("UPDATE " + tableOrders + " SET sign=1 WHERE sign = 0;");
        console.log(resetClientOrders);
        return;
    } catch (err) {
        console.error("Error resetting client orders:", err);
        throw err;
    }
};

//--------------------INSERT NEW PRODUCTS TO DB----------------//
exports.dbInsertProduct = async function(newProduct) {
    let name = newProduct[0];
    let price = newProduct[1];
    let img = newProduct[2];
    let stock = newProduct[3];
    img = ("img/items/" + img);
    
    try {
        console.log("PRODUCT NAME AVAILABLE");
        await pool.query("INSERT INTO " + tableProducts +
                " (itemname,price,itemimgpath,stock) VALUES (?,?,?,?);", [name, price, img, stock]);
        
        return ("התווסף מוצר : " + name + " במחיר : " + price);
    } catch (err) {
        console.error("Error inserting product:", err);
        throw err;
    }
};

//--------------------EDIT PRODUCT IN DB----------------//
exports.dbEditProduct = async function(values) {
    console.log("DB EDIT PRODUCT");
    let productId = values[0];
    let newName = values[1];
    let newPrice = values[2];
    let newImage = "img/items/" + values[3];
    let newStock = values[4];
    let newOrder = values[5];
    
    try {
        let editProductRes = await pool.query("UPDATE " + tableProducts +
                " SET itemname = ? ,price = ? ,itemimgpath = ? ,stock = ? ,itemorder = ? WHERE itemid = ?;",
                [newName, newPrice, newImage, newStock, newOrder, productId]);
        
        console.log(editProductRes);
        return (productId);
    } catch (err) {
        console.error("Error editing product:", err);
        throw err;
    }
}

//--------------------DELETE PRODUCT BY ID----------------//
exports.dbDeleteProduct = async function(productId) {
    try {
        console.log("NAME DONT EXIST");
        await pool.query(`DELETE FROM ${tableProducts} WHERE itemid = ?;`, [productId]);
        return ("REMOVED FROM DATABASE -- NO PROOF YET");
    } catch (err) {
        console.error("Error deleting product:", err);
        throw err;
    }
};

//----------------------GET ITEMS BOUGHT IN CURRENT REPORT---------------------//
exports.dbGetItemsBought = async function() {
    try {
        console.log("GET ITEMS: ");
        let item1Bought = await pool.query("SELECT SUM(item1) FROM " + tableClients + " WHERE account > 50;");
        let item2Bought = await pool.query("SELECT SUM(item2) FROM " + tableClients + " WHERE account > 50;");
        
        // Safe extraction
        let val1 = item1Bought[0]['SUM(item1)'] || 0;
        let val2 = item2Bought[0]['SUM(item2)'] || 0;
        
        return [val1, val2];
    } catch (err) {
        console.error("Error getting items bought:", err);
        throw err;
    }
};

//----------------------GET PRODUCTS INFO FOR ORDER---------------------//

exports.dbGetProductDetailsById = async function(itemId) {
    return await pool.query(`SELECT itemorder,itemname,price,itemimgpath FROM ${tableProducts}
 WHERE itemid = ?;`, [itemId]);
};

//----------------------MESSAGE BOARD POSTS---------------------//

exports.dbInsertPost = async function(post, user, img) {
    if (user == null) { user = 0 }
    if (img == null) { img = 0 }
    let sql = ('INSERT INTO ' + tablePosts + ' (user, post,img) VALUES (?);');
    let values = [
        [user, post, img]
    ];
    return await pool.query(sql, values);
};

exports.dbGetAllPosts = async function() {
    let sql = (`SELECT * FROM ${tablePosts} ORDER BY postid ASC;`);
    return await pool.query(sql);
};

exports.dbGetPindPosts = async function() {
    let sql = (`SELECT post FROM ${tablePosts} WHERE pin = 1 ORDER BY RAND();`);
    return await pool.query(sql);
};

exports.dbGetPostById = async function(postid) {
    let sql = (`SELECT * FROM ${tablePosts} WHERE postid = ?;`);
    let values = [
        [postid]
    ];
    return await pool.query(sql, values);
};

exports.dbIsPostPindById = async function(postid) {
    let sql = (`SELECT pin FROM ${tablePosts} WHERE postid = ?;`);
    let values = [
        [postid]
    ];
    return await pool.query(sql, values);
};

exports.dbPinPostById = async function(pin, postid) {
    let sql = (`UPDATE ${tablePosts} SET pin=? WHERE postid=?;`);
    let values = [
        [pin, postid]
    ];
    return await pool.query(sql, values);
};

exports.dbDeletePostById = async function(postid) {
    let sql = ('DELETE FROM ' + tablePosts + ' WHERE postid = ?;');
    return await pool.query(sql, [postid]);
};

exports.dbDeletePostByUsername = async function(user) {
    let sql = ('DELETE FROM ' + tablePosts + ' WHERE user = ?;');
    return await pool.query(sql, [user]);
};

//-------------------------CHATBOT FACTS----------------------//
exports.dbInsertFact = async function(fact, level) {
    if (level == null) { level = 0 };
    let sql = ('INSERT INTO ' + tableFacts + ' (fact, level) VALUES (?);');
    let values = [
        [fact, level]
    ];
    return await pool.query(sql, values);
};

exports.dbRemoveFact = async function(fact, level) {
    if (level == null) { level = 0 };
    let sql = ("DELETE FROM " + tableFacts + " WHERE fact LIKE ? AND factid > 1;");
    return await pool.query(sql, ['%' + fact + '%']);
};

exports.dbRemoveOldestFact = async function(fact, level) {
    if (level == null) { level = 0 };
    let sql = ("DELETE FROM " + tableFacts + " WHERE factid > 1 ORDER BY factid ASC LIMIT 1;");
    return await pool.query(sql);
};

exports.dbRemoveAllFacts = async function() {
    let sql = ("DELETE FROM " + tableFacts + " WHERE factid > 1;");
    return await pool.query(sql);
};

exports.dbGetFacts = async function() {
    let sql = ('SELECT fact FROM ' + tableFacts + ';');
    return await pool.query(sql);
};

//-------------------------------DISPLAY MESSAGES----------------//

exports.dbGetDisplayInfoByClient = async function() {
    let sql = ('SELECT fact FROM ' + tableFacts + ';');
    return await pool.query(sql);
};
