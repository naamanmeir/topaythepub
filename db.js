const mariadb = require('mariadb');
const functions = require('./functions');

const pool = mariadb.createPool({
  host: process.env.MYSQL,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,  
  connectionLimit: 5
});

const tableClients = process.env.MYSQL_TABLE_CLIENTS;
const tableOrders = process.env.MYSQL_TABLE_ORDERS;
let testovich = "testovich";

exports.dbCreateTableClients = async function() {
  let createTableClients;
  createTableClients = await pool.getConnection()
  .then(conn => {conn.query("CREATE TABLE IF NOT EXISTS `"+tableClients+
  "`(`id` INT NOT NULL AUTO_INCREMENT,"+
  "`last_action` DATETIME NOT NULL DEFAULT (now()),"+
  "`item1` INT NOT NULL DEFAULT '0',"+
  "`item2` INT NOT NULL DEFAULT '0',"+
  "`item3` INT NOT NULL DEFAULT '0',"+
  "`item4` INT NOT NULL DEFAULT '0',"+
  "`sum` INT NOT NULL DEFAULT '0',"+
  "`account` INT NOT NULL DEFAULT '1',"+
  "`name` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,"+
  "`nick` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,"+
  "PRIMARY KEY (`id`));"
  )
  .then((results) => {console.log(results);return results})
  .catch((err) => {console.log(err)})});
  return createTableClients;
};

exports.dbCreateTableOrders = async function() {
  let createTableOrders;
  createTableOrders = await pool.getConnection()
  .then(conn => {conn.query("CREATE TABLE IF NOT EXISTS `"+tableOrders+
  "`(`orderid` INT NOT NULL AUTO_INCREMENT,"+
  "`time` DATETIME NOT NULL DEFAULT (now()),"+
  "`item1` INT NOT NULL DEFAULT '0',"+
  "`item2` INT NOT NULL DEFAULT '0',"+
  "`item3` INT NOT NULL DEFAULT '0',"+
  "`item4` INT NOT NULL DEFAULT '0',"+
  "`sum` INT NOT NULL DEFAULT '0',"+
  "`clientid` INT NOT NULL DEFAULT '1',"+
  "`client` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,"+
  "`nick` CHAR(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'client',"+
  "PRIMARY KEY (`orderid`));"
  )
  .then((results) => {console.log(results);return results})
  .catch((err) => {console.log(err)})});
  return createTableOrders;
};

//--------------------INSERT NEW CLIENT TO DB----------------//
exports.dbInsertClient = async function(newClient){
  // console.log(newClient);
  let name = newClient[0];
  let nick = newClient[1];
  let number = newClient[2];
  let ifExist = await this.dbGetExactName(name,nick,number);
  let messageReturn;
  if(ifExist.length != 0){
    console.log("CLIENT EXIST");
    return ("שם תפוס");
  }else{
    console.log("CLIENT AVAILABLE");    
    messageReturn = await pool.query("INSERT INTO "+tableClients+
    " (name,nick,account) VALUES ('"+name+"','"+nick+"',"+number+");")
    .catch((err) => {
      console.log(err);return("NO OK");
    }).then((res) => {        
        return (res);
      });
  console.log("Inserted CLient: "+  messageReturn)
  return messageReturn;
  };  
};

//--------------------EDIT CLIENT FIELDS----------------//
exports.dbEditClient = async function(field,value){    
    messageReturn = await pool.query("UPDATE "+tableClients+
    " SET "+field+" = '"+value+"';")
    .catch((err) => {
      console.log(err)
    }).then((res) => {        
        return (res);
      });
  console.log("message EFTER EDIT FIELDS: "+  messageReturn)
  return ("EDITED FIELDS IN DATABASE -- NO PROOF YET"+ messageReturn);
};

//--------------------INSERT NEW NAME TO DB----------------//
exports.dbInsertName = async function(name){
  let ifExist = await this.dbGetExactName(name);  
  let newId;
  let messageReturn;
  if(ifExist.length != 0){
    console.log("name exist");
    return ("NAME ALLREADY EXIST IN DATABASE");
  }else{
    console.log("NAME DONT EXIST");    
    messageReturn = await pool.getConnection().then(conn => {conn.query(`INSERT INTO ${tableClients} (listed,last_action,item1,item2,item3,item4,sum,name) VALUES (1,(now()),0,0,0,0,0,'${name}');`)
      .then((rows) => {
        conn.end();
        return (rows);
      }).then((res) => {  
      console.log(res);
       conn.end();
        messageReturn = "HO MY";
       return (res);
      });
  console.log("message ruturn: "+messageReturn)
  });
  return ("INSERTED INTO DATABASE -- NO PROOF YET"+messageReturn);
};
};

//--------------------DELETE NAME FROM DB----------------//
exports.dbDeleteName = async function(name){
  let ifExist = await this.dbGetExactName(name);  
  let newId;
  let messageReturn;
  if(ifExist.length == 0){
    console.log("name exist");
    return ("NAME NOT EXIST IN DATABASE");
  }else{
    console.log("NAME DONT EXIST");    
    messageReturn = await pool.getConnection().then(conn => {conn.query(`DELETE FROM ${tableClients} WHERE name = '${name}';`)
      .then((rows) => {
        conn.end();
        return (rows);
      }).then((res) => {  
      console.log(res);
       conn.end();
        messageReturn = "HO MY";
       return (res);
      });
  console.log("message ruturn: "+messageReturn)
  });
  return ("REMOVED FROM DATABASE -- NO PROOF YET"+messageReturn);
};
};

//--------------------INSERT ORDER TO ORDERS TABLE----------------//
exports.dbInsertOrderToOrders = async function(orderTime,clientid,item1,item2,item3,item4){
  var sum = item1*10+item2*12+item3*10+item4*10;  
  let clientName;
  let insertReturn;
  let insertClientData;
  clientName = await this.dbGetClientNameById(clientid);
  clientName[0].name = clientName[0].name.replace(/\'/g, "''");
  insertReturn = await pool.query("INSERT INTO "+tableOrders+
   " (item1,item2,item3,item4,sum,clientid,client)"+ 
   " VALUES ("+item1+","+item2+","+item3+","+item4+","+sum+","+clientid+",'"+clientName[0].name+"');")
    .then((rows) => {
      // console.log(rows);
      return (rows)
    })
    .catch(err =>{
      console.log("CONNECTION Error: " + err)
    })
  insertClientData = await this.dbInsertOrderToClient(orderTime,clientid,item1,item2,item3,item4);
  insertReturn = insertReturn.insertId.toString();
  clientName = clientName[0].name.toString()
  let returnString = (`רישום מספר ${insertReturn}, נרשם בהצלחה, על חשבון, ${clientName} `)  
  return returnString;
};

//--------------------INSERT ORDER TO CLIENT TABLE----------------//
exports.dbInsertOrderToClient = async function(orderTime,id,item1,item2,item3,item4){  
  let sum = (item1+item2+item3+item4);
  let orderResult;
  orderResult = await pool.query(`UPDATE ${tableClients} SET last_action = (NOW()),
   item1 = item1+${item1},
   item2 = item2+${item2},
   item3 = item3+${item3},
   item4 = item4+${item4},
   sum = sum+((item1+item2+item3+item4)*10)
   WHERE id = ${id};`)
   .then((rows) => {
    // console.log(rows);
    return (rows)
  })
  .catch(err =>{
    console.log("CONNECTION Error: " + err)
  })
  orderResult = orderResult.affectedRows.toString();
  return orderResult;
};

//-----------------------GET CLIENT NAME BY ID----------------------//
exports.dbGetClientNameById = function(id) {
  return pool.query("SELECT name FROM "+tableClients+" WHERE id LIKE "+id+";");
};

//-----------------------GET ALL CLIENT DETAILS BY NAME OR NICK OR NUMBER----------------------//
exports.dbGetClientDetails = function(name,nick,account) {
  return pool.query("SELECT * FROM "+tableClients+
  " WHERE name LIKE '"+name+"' OR nick LIKE '"+nick+"' OR account LIKE '"+account+"';");
};

//-----------------------GET ALL CLIENT DETAILS BY ID----------------------//
exports.dbGetClientInfoById = function(id) {
  return pool.query("SELECT client,"+
  "sum,item2,item1,"+
  "DATE_FORMAT(`time`, '%Y-%m-%d %H:%i') AS `formatted_date`,orderid FROM "+
  tableOrders+
  " WHERE clientid LIKE "+id+
  " ORDER BY time DESC;");
};

//-----------------------GET EXACT NAME FROM DB----------------------//
exports.dbGetExactName = function(name,nick,account) {
  return pool.query("SELECT name FROM "+tableClients+
  " WHERE name LIKE '"+name+"' OR nick LIKE '"+nick+"' OR account LIKE '"+account+"';");
};

//-----------------------GET ID NICK AND NAME FROM DB BY SEARCH----------------------//
exports.dbGetNameBySearch = function(query) {
  return pool.query("SELECT id,nick,name FROM "+tableClients+
  " WHERE nick LIKE '%"+query+"%' ORDER BY last_action DESC;");
};

exports.dbGetDataByScope = async function(scope) {
  if (scope==1){
    data = await pool.query(`SELECT * FROM ${tableOrders} ORDER BY orderid DESC;`);
  };
  if (scope==2){
    data = await pool.query(`SELECT * FROM ${tableClients};`);
  };
  if (scope==3){
    data = await pool.query(`SELECT sum,account,name FROM ${tableClients};`);
  };
  // console.log(await data);
  return data;
};

exports.dbBackupTable = async function(time) {  
  let tsmp = time.toString();
  tsmp = tsmp.replace("/","");
  tsmp = tsmp.replace(",","");
  tsmp = tsmp.replace(":","");
  tsmp = tsmp.replace(" ","");
  tsmp = tsmp.replace("/","");
  tsmp = tsmp.replace(":","");
  const table_bk = (`${tableClients}_${tsmp}`);
  let backup_table = await pool.query(`CREATE OR REPLACE TABLE ${table_bk} LIKE ${tableClients};`);
  let backup_rows = await pool.query(`INSERT IGNORE INTO ${table_bk} SELECT * FROM ${tableClients}`);
  console.log(await backup_table);
  console.log(await backup_rows);
  return (table_bk);
};

