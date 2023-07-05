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
const tablePosts = process.env.DB_TABLE_POSTS;
const tableFacts = process.env.DB_TABLE_FACTS;

//-----------------------------INIT----------------------------------//
exports.dbConnectionTest = async function () {
  pool.getConnection()
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};

exports.createUserTable = async function () {
  let createUserTable;
  createUserTable = pool.query("CREATE TABLE IF NOT EXISTS `" + tableUsers +
    "`(`userId` INT NOT NULL AUTO_INCREMENT," +
    "`class` INT NOT NULL DEFAULT '100'," +
    "`user` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'user'," +
    "`password` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'pass'," +
    "PRIMARY KEY (`userId`));"
  )
    .catch((err) => { console.log(err) })
    .then((results) => {
      return results;
    })
  return createUserTable;
};

exports.createSessionTable = async function () {
  let createSessionTable;
  createSessionTable = pool.query("CREATE TABLE IF NOT EXISTS `" + tableSessions +
    "`(`sessionId` INT NOT NULL AUTO_INCREMENT," +
    "`time` DATE ," +
    "`userClass` INT NOT NULL DEFAULT '100'," +
    "`userName` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'userDefault'," +
    "`session` TEXT(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin ," +
    "PRIMARY KEY (`sessionId`));"
  )
    .catch((err) => { console.log(err) })
    .then((results) => {
      return results;
    })
  return createSessionTable;
};

exports.dbCreateTableClients = async function () {
  let createTableClients;
  createTableClients = await pool.getConnection()
    .then(conn => {
      conn.query("CREATE TABLE IF NOT EXISTS `" + tableClients +
        "`(`id` INT NOT NULL AUTO_INCREMENT," +
        "`last_action` DATETIME NOT NULL DEFAULT (now())," +
        "`sum` INT NOT NULL DEFAULT '0'," +
        "`account` INT NOT NULL DEFAULT '1'," +
        "`name` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL," +
        "`nick` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL," +
        "PRIMARY KEY (`id`));"
      )
        .then((results) => { 
          // console.log(results);
          return results })
        .catch((err) => { console.log(err) })
    });
  return createTableClients;
};

exports.dbCreateTableOrders = async function () {
  let createTableOrders;
  createTableOrders = await pool.getConnection()
    .then(conn => {
      conn.query("CREATE TABLE IF NOT EXISTS `" + tableOrders +
        "`(`orderid` INT NOT NULL AUTO_INCREMENT," +
        "`sign` INT NOT NULL DEFAULT '0'," +
        "`time` DATETIME NOT NULL DEFAULT (now())," +
        "`info` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin," +
        "`sum` INT NOT NULL DEFAULT '0'," +
        "`clientid` INT NOT NULL DEFAULT '1'," +
        "`client` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL," +
        "PRIMARY KEY (`orderid`));"
      )
        .then((results) => {
          //  console.log(results);
            return results;
          })
        .catch((err) => { console.log(err) })
    });
  return createTableOrders;
};

exports.dbCreateTableProducts = async function () {
  let createTableProducts;
  createTableProducts = await pool.getConnection()
    .then(conn => {
      conn.query("CREATE TABLE IF NOT EXISTS `" + tableProducts +
        "`(`itemid` INT NOT NULL AUTO_INCREMENT," +
        "`itemnumber` INT NOT NULL DEFAULT '0'," +
        "`stock` INT NOT NULL DEFAULT '0'," +
        "`price` INT NOT NULL DEFAULT '10'," +
        "`itemname` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'beer'," +
        "`itemimgpath` VARCHAR(1024) NOT NULL DEFAULT 'img/items/2.png'," +
        "PRIMARY KEY (`itemid`));"
      )
        .then((results) => { 
          // console.log(results); 
          return results })
        .catch((err) => { console.log(err) })
    });
  return createTableProducts;
};

exports.dbCreateTablePosts = async function () {
  let createTablePosts;
  createTablePosts = await pool.getConnection()
    .then(conn => {
      conn.query("CREATE TABLE IF NOT EXISTS `"+ tablePosts +"`("+ 
        "`postid` INT NOT NULL AUTO_INCREMENT,"+
        "`date` DATE,"+
        "`user` INT,"+
        "`post` TEXT(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,"+
        "`img` VARCHAR(1024),"+
        "PRIMARY KEY (`postid`)"+
        ");"
      )
        .then((results) => {           
          return results })
        .catch((err) => { console.log(err) })
    });
  return createTablePosts;
};

exports.dbCreateTableFacts = async function () {
  let createTableFacts;
  createTableFacts = await pool.getConnection()
    .then(conn => {
      conn.query("CREATE TABLE IF NOT EXISTS `"+ tableFacts +"`("+ 
        "`factid` INT NOT NULL AUTO_INCREMENT,"+
        "`date` DATE,"+
        "`level` INT,"+
        "`fact` TEXT(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,"+        
        "PRIMARY KEY (`factid`)"+
        ");"
      )
        .then((results) => {           
          return results })
        .catch((err) => { console.log(err) })
    });
  return createTableFacts;
};

exports.connectionStatus = async function () {
  console.log("Total connections: ", pool.totalConnections());
  console.log("Active connections: ", pool.activeConnections());
  console.log("Idle connections: ", pool.idleConnections());
};

//--------------------------------USER MANAGE--------------------------//
exports.createUser = async function (user, password, userclass) {
  let ifExist = await checkUserExist(user);
  if (ifExist && ifExist.length != 0) {
    return [0, user, `A USER NAME ${user} ALLREADY EXIST IN TABLE , ABORTING`];
  } else {
    console.log("USER AVAILABLE");
    sql = (`INSERT INTO ${tableUsers} (user,password,class) VALUES ('${user}','${password}',${userclass});`)
    // messageReturn = await dbQuery(sql);
    let messageReturn = await pool.query(sql);
    return [1, user, `USER ${user} ADDED TO USER TABLE , CONTINUE`];
  }
};

exports.userLogin = async function (user, password) {
  let userQuery = await checkUserExist(user);
  if (userQuery && userQuery.length == 0) {
    return [0, user, `A USER NAME ${user} NOT EXIST IN TABLE , ACCESS DENIED`];
  } else {
    const hashedPassword = userQuery[0].password;
    if (await bcrypt.compare(password, hashedPassword)) {
      return [2, user, `USER ${user} IS VALID AND AUTHENTICTED, ACCESS GRANTED`];
    }
    else {
      return [1, user, `USER ${user} USED WRONG PASSWORD , ACCESS DENIED`];
    }
  }
};

async function checkUserExist(user) {
  const sql = (`SELECT * FROM ${tableUsers} WHERE user = '${user}';`)
  let userExistance = await pool.query(sql);
  return userExistance;
};

exports.getUserClassByName = async function getUserClassByName(user) {
  const sql = (`SELECT class FROM ${tableUsers} WHERE user = '${user}';`)
  let userClass = await pool.query(sql);
  userClass = userClass[0].class;
  return userClass;
};

//----------------------------------------SESSION MANAGE-----------------------//

exports.storeSession = async function storeSession(username, userclass, session) {
  const sql = (`INSERT INTO ${tableSessions} (time,userClass,userName,session)` +
    ` VALUES (NOW(),'${userclass}','${username}','${session}');`);
  let storeSession = await pool.query(sql);
  const sessionId = parseInt(storeSession.insertId);
  return sessionId;
};

exports.findSession = async function findSession(session){
  const sql = (`SELECT * FROM ${tableSessions} WHERE session = '${session}'`);
  let results = await pool.query(sql);  
  let foundResults = results.length;
  let valid = (foundResults === 1); 
  let sessionUserId = results.userId; 
  return valid;
};

exports.removeSession = async function removeSession(sessionId) {
  const sql = (`DELETE FROM ${tableSessions} WHERE sessionId = '${sessionId}';`);
  let removeSession = await pool.query(sql);
  return removeSession;
};

//-----------------------GET PRODUCTS IF YESH----------------------//
exports.dbGetProducts = async function () {
  products = await pool.query("SELECT itemid,itemnumber,itemname,price,itemimgpath,stock FROM " + tableProducts +
    " WHERE stock > 0 ORDER BY itemid ASC;");
  return products;
};

exports.dbGetProductsAll = async function () {
  products = await pool.query("SELECT itemid,itemnumber,itemname,price,itemimgpath,stock FROM " + tableProducts +
    " ORDER BY itemid ASC;");
  return products;
};

exports.dbGetPricesAll = async function () {
  products = await pool.query("SELECT price FROM " + tableProducts + " ORDER BY itemid ASC;");
  return products;
};

//--------------------INSERT NEW CLIENT TO DB----------------//
exports.dbInsertClient = async function (newClient) {
  // console.log(newClient);
  let name = newClient[0].replace(/\'/g, "''");
  let nick = newClient[1].replace(/\'/g, "''");
  let account = newClient[2].replace(/\'/g, "''");
  let ifName = await this.dbGetNameIfExist(name);
  let ifNick = await this.dbGetNickIfExist(nick);
  let ifAccount = await this.dbGetAccountIfExist(account);
  if (ifName.length != 0) { console.log("NAME EXIST"); return ("שם משתמש תפוס"); }
  else if (ifNick.length != 0) { console.log("NICK EXIST"); return ("כינוי תפוס"); }
  else if (ifAccount.length != 0 && account != 0) { console.log("ACCOUNT EXIST"); return ("מספר חשבון תפוס"); }
  else {
    let messageReturn;
    console.log("CLIENT AVAILABLE");
    messageReturn = await pool.query("INSERT INTO " + tableClients +
      " (name,nick,account) VALUES ('" + name + "','" + nick + "'," + account + ");")
      .catch((err) => {
        console.log(err); return ("NO OK");
      }).then((res) => {
        console.log(res);
        return ("התווסף קליינט : " + name + " במספר שירות: " + account + " וכינויו: " + nick);
      });
    console.log("Inserted Client: " + messageReturn)
    return messageReturn;
  };
};

//--------------------EDIT CLIENT FIELDS----------------//
exports.dbEditClient = async function (clientId, field, value) {
  var fieldHeb;
  if (field == 'name') { fieldHeb = ("שם משתמש") };
  if (field == 'nick') { fieldHeb = ("כינוי") };
  if (field == 'account') { fieldHeb = ("מספר חשבון") };
  messageReturn = await pool.query("UPDATE " + tableClients +
    " SET " + field + " = '" + value + "' WHERE id = " + clientId + ";")
    .catch((err) => {
      console.log(err)
      return ("הייתה תקלה");
    }).then((res) => {
      console.log(res);
      return ("למשתמש מספר " + clientId + " עודכן " + fieldHeb + " ונרשם: " + value);
    });
  console.log("clientID: " + clientId + " Column: " + field + " Value: " + value);
  console.log(messageReturn);
  return (messageReturn);
};

//--------------------VALIDATE LAST ORDER EXIST BY CLIEND ID----------------//
exports.dbConfirmDeleteLastOrderById = async function (clientId) {
  // if order exist in user columns
  let lastOrderDetails = await pool.query("SELECT sign,orderid,sum,info,"+
  "DATE_FORMAT(`time`, '%Y-%m-%d %H:%i') AS `time`,client FROM " + tableOrders +
    " WHERE clientid = " + clientId + " ORDER BY orderid DESC LIMIT 1;")
    .catch((err) => {
      console.log(err)
    }).then((res) => {
      return (res);
    });
  if (lastOrderDetails[0] == null) { console.log("no order"); return ("no such order"); };

  // if subtrcting order sum is more then user credit sum
  let clientDetail = await pool.query("SELECT sum FROM " + tableClients +
  " WHERE id = " + clientId + ";");
  if (lastOrderDetails[0].sum > clientDetail[0].sum) { 
    console.log("ERROR SUM IS NO LOGICAL"); 
    // return ("ERROR WITH THE NUMBERS");
  };

  // return order DATA to be inserted into html from MODULE
  lastOrderDetails = lastOrderDetails[0];
  return lastOrderDetails;
};

//--------------------DELETE LAST ORDER BY CLIEND ID----------------//
exports.dbDeleteLastOrderById = async function (clientId) {
  let lastOrderDetails = await pool.query("SELECT orderid,sum FROM " + tableOrders +
    " WHERE clientid = " + clientId + " ORDER BY orderid DESC LIMIT 1;")
    .catch((err) => {
      console.log(err)
    }).then((res) => {
      return (res);
    });
  if (lastOrderDetails[0] == null) { console.log("no order"); return ("no such order"); };

  clientDetail = await pool.query("SELECT sum FROM " + tableClients +
    " WHERE id = " + clientId + ";");
  if (lastOrderDetails[0].sum > clientDetail[0].sum) { console.log("ERROR SUM IS NO LOGICAL"); return ("ERROR WITH THE NUMBERS") };

  deletedOrderFromClients = await pool.query("UPDATE " + tableClients +
    " SET sum = (sum - " + lastOrderDetails[0].sum + ") WHERE id = " + clientId + ";")
    .catch((err) => {
      console.log(err)
    }).then((res) => {
      return (res);
    });
  deleteOrderFromOrders = await pool.query("DELETE FROM " + tableOrders + " WHERE orderid = " +
    lastOrderDetails[0].orderid + ";");
  // console.log(deletedOrderFromClients);
  // console.log("DB DELETE LAST ORDER FROM: "+clientId+" SUM OF: "+lastOrderDetails[0].sum);
  return ("DELETE LAST ORDER FROM: " + clientId + " SUM OF: " + lastOrderDetails[0].sum);
};

//--------------------INSERT NEW NAME TO DB----------------//
exports.dbInsertName = async function (name) {
  let ifExist = await this.dbGetExactName(name);
  let newId;
  let messageReturn;
  if (ifExist.length != 0) {
    console.log("name exist");
    return ("NAME ALLREADY EXIST IN DATABASE");
  } else {
    console.log("NAME DONT EXIST");
    messageReturn = await pool.getConnection().then(conn => {
      conn.query(`INSERT INTO ${tableClients} (listed,last_action,item1,item2,item3,item4,sum,name) VALUES (1,(now()),0,0,0,0,0,'${name}');`)
        .then((rows) => {
          conn.end();
          return (rows);
        }).then((res) => {
          console.log(res);
          conn.end();
          messageReturn = "HO MY";
          return (res);
        });
      console.log("message ruturn: " + messageReturn)
    });
    return ("INSERTED INTO DATABASE -- NO PROOF YET" + messageReturn);
  };
};

//--------------------DELETE CLIENT BY ID----------------//
exports.dbDeleteClient = async function (clientId) {
  let ifExist = await this.dbGetClientDetailsById(clientId);
  let newId;
  let messageReturn;
  if (ifExist.length == 0) {
    console.log("CLIENT DONT EXIST");
    return ("CLIENT NOT FOUND IN DATABASE");
  } else {
    console.log("NAME DONT EXIST");
    messageReturn = await pool.query(`DELETE FROM ${tableClients} WHERE id = '${clientId}';`)
      .then((rows) => {
        return (rows);
      }).then((res) => {
        console.log(res);
        return (res);
      });
    console.log(messageReturn)
  };
  return ("REMOVED FROM DATABASE -- NO PROOF YET" + messageReturn);
};

//--------------------INSERT ORDER TO ORDERS TABLE----------------//
exports.dbInsertOrderToOrdersOld = async function (orderTime, clientId, orderInfo, totalPrice) {
  let prices;
  // prices = await this.dbGetPricesAll().then((response) => {return (response)});
  // var sum = item1*prices[0]+item2*prices[1]+item3*prices[2]+item4*prices[3];  
  let clientName;
  let insertReturn;
  let insertClientData;
  clientName = await this.dbGetClientNameById(clientId);
  clientName[0].name = clientName[0].name.replace(/\'/g, "''");
  orderInfo = orderInfo.replace(/\'/g, "''");
  insertReturn = await pool.query(`INSERT INTO ${tableOrders} 
     (time,info,sum,clientid,client)
      VALUES (now(), '${orderInfo}' , ${totalPrice} , ${clientId} , '${clientName[0].name}');`)
    .then((rows) => {
      // console.log(rows);
      return (rows)
    })
    .catch(err => {
      console.log("CONNECTION Error: " + err)
    })
  insertClientData = await this.dbInsertOrderToClient(orderTime, clientId, totalPrice);
  insertReturn = insertReturn.insertId.toString();
  clientName = clientName[0].name.toString()
  let returnString = (`רישום מספר ${insertReturn}, נרשם בהצלחה, על חשבון, ${clientName} `)
  return returnString;
};

//--------------------INSERT ORDER TO ORDERS TABLE----------------//
exports.dbInsertOrderToOrders = async function (orderTime, clientId, orderInfo, totalPrice) {
  let prices; 
  let clientName;
  let insertReturn;
  let insertClientData;
  clientName = await this.dbGetClientNameById(clientId);
  clientName[0].name = clientName[0].name.replace(/\'/g, "''");
  orderInfo = orderInfo.replace(/\'/g, "''");

  let sql = ('INSERT INTO '+tableOrders+' (time,info,sum,clientid,client) VALUES (now(),?);');
  let values = [
    [orderInfo,totalPrice,clientId,clientName[0].name]
  ];
  let sqlReturn = await pool.query(sql,values);
  let dbReturn = sqlReturn;
  console.log("INSERT TO ORDERS TABLE:");
  console.log(dbReturn);
  console.log("-----------------------");
  return dbReturn;
};

//--------------------INSERT ORDER TO CLIENT TABLE----------------//
exports.dbInsertOrderToClient = async function (orderTime, clientId, totalPrice) {
  let orderResult;
  let sql = (`UPDATE ${tableClients} SET last_action = (NOW()),
  sum = sum+${totalPrice}
  WHERE id = ${clientId};`);
  let values = [
    []
  ];
  let sqlReturn = await pool.query(sql,values);
  let dbReturn = sqlReturn;
  console.log("INSERT TO CLIENT TABLE:");
  console.log(dbReturn);
  console.log("-----------------------");
  return dbReturn;



  // orderResult = await pool.query(`UPDATE ${tableClients} SET last_action = (NOW()),
  //  sum = sum+${totalPrice}
  //  WHERE id = ${clientId};`)
  //   .then((rows) => {
  //     // console.log(rows);
  //     return (rows)
  //   })
  //   .catch(err => {
  //     console.log("CONNECTION Error: " + err)
  //   })
  // orderResult = orderResult.affectedRows.toString();
  // // console.log("------------------------------------------");
  // // console.log(orderResult);
  // // console.log("------------------------------------------");
  // return orderResult;
};

exports.dbInsertOrderToClientOld = async function (orderTime, clientId, totalPrice) {
  let orderResult;
  orderResult = await pool.query(`UPDATE ${tableClients} SET last_action = (NOW()),
   sum = sum+${totalPrice}
   WHERE id = ${clientId};`)
    .then((rows) => {
      // console.log(rows);
      return (rows)
    })
    .catch(err => {
      console.log("CONNECTION Error: " + err)
    })
  orderResult = orderResult.affectedRows.toString();
  console.log("------------------------------------------");
  console.log(orderResult);
  console.log("------------------------------------------");
  return orderResult;
};

//-----------------------GET CLIENT NAME BY ID----------------------//
exports.dbGetClientNameById = function (id) {
  return pool.query("SELECT name FROM " + tableClients + " WHERE id LIKE " + id + ";");
};

//-----------------------GET ALL CLIENT DETAILS BY NAME OR NICK OR NUMBER----------------------//
exports.dbGetClientDetailsByFields = function (name, nick, account) {
  return pool.query("SELECT name,nick,account FROM " + tableClients +
    " WHERE name LIKE '" + name + "' OR nick LIKE '" + nick + "' OR account LIKE '" + account + "';");
};

//-----------------------GET CLIENT DETAILS BY ID----------------------//
exports.dbGetClientDetailsById = function (clientId) {
  return pool.query("SELECT name,nick,account FROM " + tableClients +
    " WHERE id=" + clientId + ";");
};

//-----------------------CHANGE USER NICKNAME BY ID----------------------//
exports.dbChangeNickById = function (newNick,clientId) {
  let sql = ("UPDATE "+tableClients+" SET nick = ? WHERE id = "+clientId+";");
  let values = [
    [newNick]
  ];
  return pool.query(sql,values,(error,result) => {
    if(error)throw error;
  });
};

//-----------------------GET ALL CLIENT DETAILS BY ID----------------------//
exports.dbGetClientInfoById = function (id) {
  return pool.query("SELECT sum,info," +
    "DATE_FORMAT(`time`, '%Y-%m-%d %H:%i') AS `formatted_date`,orderid FROM " +
    tableOrders +
    " WHERE clientid LIKE " + id +
    " ORDER BY time DESC;");
};

//-----------------------GET EXACT NAME FROM DB----------------------//
exports.dbGetExactName = function (name, nick, account) {
  return pool.query("SELECT name FROM " + tableClients +
    " WHERE name LIKE '" + name + "' OR nick LIKE '" + nick + "' OR account LIKE '" + account + "';");
};

//-----------------------GET BY NAME FROM DB----------------------//
exports.dbGetNameIfExist = function (name) {
  return pool.query("SELECT name FROM " + tableClients +
    " WHERE name LIKE '" + name + "';");
};

//-----------------------GET BY NICK FROM DB----------------------//
exports.dbGetNickIfExist = function (nick) {
  return pool.query("SELECT nick FROM " + tableClients +
    " WHERE nick LIKE '" + nick + "';");
};

//-----------------------GET BY ACCOUNT FROM DB----------------------//
exports.dbGetAccountIfExist = function (account) {
  return pool.query("SELECT account FROM " + tableClients +
    " WHERE account LIKE '" + account + "';");
};

//-----------------------GET ID NICK AND NAME FROM DB BY NAME SEARCH----------------------//
exports.dbGetNameBySearchName = function (clientName) {
  return pool.query("SELECT id,account,name,nick FROM " + tableClients +
    " WHERE name LIKE '%" + clientName + "%' ORDER BY last_action DESC;");
};

//-----------------------GET ID NICK AND NAME FROM DB BY NICK ----------------------//
exports.dbGetNameByNick = function (query) {  
  let queryList = query.split(" ");
  if (queryList[1] == null) { queryList[1] = queryList[0] };
  if (queryList[2] == null) { queryList[2] = queryList[0] };
  if (queryList[3] == null) { queryList[3] = queryList[0] };
  if (queryList[4] == null) { queryList[4] = queryList[0] };
  return pool.query("SELECT id,nick,name FROM " + tableClients +
    " WHERE nick LIKE '%" + queryList[0] + "%'" +
    " OR nick LIKE '%" + queryList[1] + "%'" +
    " OR nick LIKE '%" + queryList[2] + "%'" +
    " OR nick LIKE '%" + queryList[3] + "%'" +
    " OR name LIKE '%" + queryList[0] + "%'" +
    " OR name LIKE '%" + queryList[1] + "%'" +
    " OR name LIKE '%" + queryList[2] + "%'" +
    " OR name LIKE '%" + queryList[3] + "%'" +
    " ORDER BY last_action DESC;");
};

//-----------------------GET ID NICK AND NAME FROM DB BY EXACT NICK ----------------------//
exports.dbGetNameByNickExact = function (query) {
  return pool.query("SELECT id,nick,name FROM " + tableClients +
    " WHERE nick LIKE '" + query + "'" +    
    " ORDER BY last_action DESC;");
};

//-----------------------GET ID NICK AND NAME FROM DB BY NICK AND NAME----------------------//
exports.dbGetNameBySearch = function (query) {  
  let queryList = query.split(" ");
  if (queryList[1] == null) { queryList[1] = queryList[0] };
  if (queryList[2] == null) { queryList[2] = queryList[0] };
  if (queryList[3] == null) { queryList[3] = queryList[0] };
  if (queryList[4] == null) { queryList[4] = queryList[0] };
  return pool.query("SELECT id,nick,name FROM " + tableClients +
    " WHERE nick LIKE '%" + queryList[0] + "%'" +
    " AND nick LIKE '%" + queryList[1] + "%'" +
    " AND nick LIKE '%" + queryList[2] + "%'" +
    " AND nick LIKE '%" + queryList[3] + "%'" +
    " OR name LIKE '%" + queryList[0] + "%'" +
    " OR name LIKE '%" + queryList[1] + "%'" +
    " OR name LIKE '%" + queryList[2] + "%'" +
    " OR name LIKE '%" + queryList[3] + "%'" +
    " ORDER BY last_action DESC;");
};

//-----------------------GET INFO BY SCOPE----------------------//
exports.dbGetDataByScope = async function (scope) {
  if (scope == 1) {//SCOPE ORDERS
    data = await pool.query("SELECT orderid,DATE_FORMAT(`time`, '%d-%m-%y') AS `formatted_date`" +
      ",info,sum,clientid,client FROM " + tableOrders +
      " WHERE clientid IN ( SELECT id FROM " + tableClients + " WHERE account >= 50 )" +
      " ORDER BY orderid DESC;");
  };
  if (scope == 2) {//SCOPE CLIENTS ALL
    data = await pool.query("SELECT id,DATE_FORMAT(`last_action`, '%d-%m-%y %h:%i') AS `formatted_date`" +
      ",sum,account,name,nick FROM " + tableClients +
      " WHERE account > 50" +
      " ORDER BY name;");
  };
  if (scope == 3) {//SCOPE CLIENTS REAL
    data = await pool.query("SELECT id,DATE_FORMAT(`last_action`, '%d-%m-%y %h:%i') AS `formatted_date`" +
      ",sum,account,name,nick FROM " + tableClients +
      " ORDER BY name;");
  };
  if (scope == 4) {//SCOPE REPORT WITH TOTAL SUM PER CLIENT
    data = await pool.query("SELECT sum," +
      " DATE_FORMAT(`last_action`, '%d/%m/%y') AS `formatted_date`" +
      ",name,account FROM " + tableClients +
      " WHERE account >= 50 AND sum > 0 " +
      " ORDER BY last_action DESC ;");
  };
  if (scope == 5) {//SCOPE REPORT WITH ORDERS MERGED BY DATE
    data = await pool.query("SELECT sum(" +
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
  return data;
};

//-----------------------GET ARCHIVE REPORT BY DATE----------------------//
exports.dbGetDataFromArchiveByDate = async function (archiveTableName) {
  data = await pool.query("SELECT sum," +
    " DATE_FORMAT(`last_action`, '%d/%m/%y') AS `formatted_date`" +
    ",name,account FROM " + archiveTableName +
    " WHERE account >= 50 AND sum > 0 " +
    " ORDER BY last_action DESC ;");
  return data;
};

//-----------------------GET ACCOUNT ORDERS BY ID----------------------//
exports.dbGetClientOrdersById = async function (clientId) {
  data = await pool.query("SELECT orderid,DATE_FORMAT(`time`, '%Y-%m-%d %H:%i') AS `formatted_date`" +
    ",info,sum,client FROM " + tableOrders +
    " WHERE clientid = " + clientId +
    " ORDER BY orderid DESC;");
  // console.log(await data);
  return data;
};

//-----------------------BACKUP TABLES INTERNALLY-----------------------//
exports.dbBackupTable = async function (time) {
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
};

//-----------------------GET LIST OF ARCHIVE REPORT-----------------------//
exports.dbGetListOfArchiveReport = async function () {
  let archiveList = await pool.query("SHOW TABLES LIKE 'clients_%';");
  return (archiveList);
};
//-----------------------DELETE OLD BACKUP TABLES INTERNALLY-----------------------//
exports.dbDeleteOldBackups = async function (time) {
  let tableBackups;
  tableBackups = await pool.query(`SHOW TABLES LIKE 'bk_%';`);
  for (i = 0; i < tableBackups.length - 1; i++) {
    let tableName = (JSON.stringify(tableBackups).split(',')[i].split(':')[1].replace('"', '').replace('"', '').replace('}', ''));
    console.log(tableName);
    tableDropResponse = await pool.query("DROP TABLE " + tableName + ";");
    console.log(tableDropResponse);
  }
  return;
};

//-----------------------RESET CLIENTS ORDERS AFTER REPORT-----------------------//
exports.dbResetClientOrders = async function () {
  let resetClientOrders;
  let resetOrders;
  resetClientOrders = await pool.query("UPDATE " + tableClients + " SET sum=0;");
  resetOrders = await pool.query("UPDATE " + tableOrders + " SET sign=1 WHERE sign = 0;");
  console.log(resetClientOrders);
  return;
};

//--------------------INSERT NEW PRODUCTS TO DB----------------//
exports.dbInsertProduct = async function (newProduct) {
  // console.log(newProduct);
  let name = newProduct[0].replace(/\'/g, "''");
  let price = newProduct[1].replace(/\'/g, "''");
  let img = newProduct[2];
  let stock = newProduct[3];
  img = ("img/items/" + img);
  console.log(img);
  let messageReturn;
  console.log("PRODUCT NAME AVAILABLE");
  messageReturn = await pool.query("INSERT INTO " + tableProducts +
    " (itemname,price,itemimgpath,stock) VALUES ('" + name + "','" + price + "','" + img + "','" + stock + "');")
    .catch((err) => {
      console.log(err); return ("NO OK");
    }).then((res) => {
      console.log(res);
      return ("התווסף מוצר : " + name + " במחיר : " + price);
    });
  console.log("Inserted Product: " + messageReturn)
  return messageReturn;
};

//--------------------EDIT PRODUCT IN DB----------------//
exports.dbEditProduct = async function (values) {
  console.log("DB EDIT PRODUCT");
  console.log(values);
  let productId = values[0];
  let newName = values[1].replace(/\'/g, "''");;
  let newPrice = values[2].replace(/\'/g, "''");;
  let newImage = "img/items/" + values[3];
  let newStock = values[4].replace(/\'/g, "''");;
  let editProductRes;
  editProductRes = await pool.query("UPDATE " + tableProducts +
    " SET itemname = '" + newName + "' ,price = '" + newPrice + "' ,itemimgpath = '" + newImage + "' ,stock = '" + newStock +
    "' WHERE itemid = " + productId + ";")
    .catch((err) => {
      console.log(err)
      return ("הייתה תקלה");
    }).then((res) => {
      console.log(res);
      return (productId);
    });
  // console.log("clientID: "+clientId+" Column: "+field+" Value: "+value);
  console.log(editProductRes);
  console.log("Total connections: ", pool.totalConnections());
  console.log("Active connections: ", pool.activeConnections());
  console.log("Idle connections: ", pool.idleConnections());
  return (editProductRes);
}

//--------------------DELETE PRODUCT BY ID----------------//
exports.dbDeleteProduct = async function (productId) {
  // let ifExist = await this.dbGetClientDetailsById(clientId);  
  let newId;
  let messageReturn;
  // if(ifExist.length == 0){
  // console.log("CLIENT DONT EXIST");
  // return ("CLIENT NOT FOUND IN DATABASE");
  // }else{
  console.log("NAME DONT EXIST");
  messageReturn = await pool.query(`DELETE FROM ${tableProducts} WHERE itemid = '${productId}';`)
    .then((rows) => {
      return (rows);
    }).then((res) => {
      console.log(res);
      return (res);
    });
  console.log(messageReturn)
  // };
  return ("REMOVED FROM DATABASE -- NO PROOF YET" + messageReturn);
};

//----------------------GET ITEMS BOUGHT IN CURRENT REPORT---------------------//
exports.dbGetItemsBought = async function () {
  //get items amount from db
  console.log("GET ITEMS: ");
  let item1Bought;
  let item2Bought;
  let itemsBought = [];
  item1Bought = await pool.query("SELECT SUM(item1) FROM " + tableClients + " WHERE account > 50;");
  item2Bought = await pool.query("SELECT SUM(item2) FROM " + tableClients + " WHERE account > 50;");
  item1Bought = (JSON.stringify(item1Bought).split(':')[1].replace('"}]', '').replace('"', ''));
  item2Bought = (JSON.stringify(item2Bought).split(':')[1].replace('"}]', '').replace('"', ''));
  itemsBought.push(item1Bought);
  itemsBought.push(item2Bought);
  // console.log(itemsBought);
  return itemsBought;
};

//----------------------GET PRODUCTS INFO FOR ORDER---------------------//

exports.dbGetProductDetailsById = async function (itemId) {
  itemDetails = await pool.query(`SELECT itemnumber,itemname,price,itemimgpath FROM ${tableProducts}
 WHERE itemid = ${itemId};`);
  return itemDetails;
}; 

//----------------------MESSAGE BOARD POSTS---------------------//

exports.dbInsertPost = async function (post,user,img){
  if (user == null){user=0}  
  if (img == null){img=0}  
  let sql = ('INSERT INTO '+tablePosts+' (user, post,img) VALUES (?);');
  let values = [
    [user,post,img]
  ];
  let messageReturn = await pool.query(sql,values);
  return messageReturn;
};

exports.dbGetAllPosts = async function (){
  let sql = (`SELECT * FROM ${tablePosts} ORDER BY postid ASC;`);
  let messageReturn = await pool.query(sql);  
  return messageReturn;
};

exports.dbDeletePostById = async function (postid){  
  let sql = ('DELETE FROM '+tablePosts+' WHERE postid = '+postid+';');  
  let messageReturn = await pool.query(sql);
  return messageReturn;
};

//-------------------------CHATBOT FACTS----------------------//
exports.dbInsertFact = async function (fact,level){  
  if (level == null){level=0};  
  let sql = ('INSERT INTO '+tableFacts+' (fact, level) VALUES (?);');
  let values = [
    [fact,level]
  ];
  let messageReturn = await pool.query(sql,values);
  return messageReturn;
};

exports.dbRemoveFact = async function (fact,level){  
  if (level == null){level=0};  
  let sql = ("DELETE FROM "+tableFacts+" WHERE fact LIKE '%"+fact+"%' AND factid > 1;");  
  let messageReturn = await pool.query(sql);
  return messageReturn;
};


exports.dbRemoveOldestFact = async function (fact,level){  
  if (level == null){level=0};  
  let sql = ("DELETE FROM "+tableFacts+" WHERE factid > 1 ORDER BY factid ASC LIMIT 1;");  
  let messageReturn = await pool.query(sql);
  return messageReturn;
};


exports.dbRemoveAllFacts = async function (){    
  let sql = ("DELETE FROM "+tableFacts+" WHERE factid > 1;");  
  let messageReturn = await pool.query(sql);
  return messageReturn;
};

exports.dbGetFacts = async function(){
  let sql = ('SELECT fact FROM '+tableFacts+';');  
  let messageReturn = await pool.query(sql);
  return messageReturn;
};
