const mariadb = require('mariadb');

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
  let name = newClient[0].replace(/\'/g,"''");
  let nick = newClient[1].replace(/\'/g,"''");
  let account = newClient[2].replace(/\'/g,"''");
  let ifName = await this.dbGetNameIfExist(name);
  let ifNick = await this.dbGetNickIfExist(nick);
  let ifAccount = await this.dbGetAccountIfExist(account);
  if(ifName.length != 0){console.log("NAME EXIST");return ("שם משתמש תפוס");}
  else if(ifNick.length != 0){console.log("NICK EXIST");return ("כינוי תפוס");}
  else if(ifAccount.length != 0 && account != 0){console.log("ACCOUNT EXIST");return ("מספר חשבון תפוס");}  
  else{
    let messageReturn;
    console.log("CLIENT AVAILABLE");    
    messageReturn = await pool.query("INSERT INTO "+tableClients+
    " (name,nick,account) VALUES ('"+name+"','"+nick+"',"+account+");")
    .catch((err) => {
      console.log(err);return("NO OK");
    }).then((res) => { 
      console.log(res);       
        return ("התווסף קליינט : "+name+ " במספר שירות: "+account+" וכינויו: "+nick);
      });
  console.log("Inserted Client: "+  messageReturn)
  return messageReturn;
  };  
};

//--------------------EDIT CLIENT FIELDS----------------//
exports.dbEditClient = async function(clientId,field,value){
    var fieldHeb;
    if(field=='name'){fieldHeb=("שם משתמש")};
    if(field=='nick'){fieldHeb=("כינוי")};
    if(field=='account'){fieldHeb=("מספר חשבון")};
    messageReturn = await pool.query("UPDATE "+tableClients+
    " SET "+field+" = '"+value+"' WHERE id = "+clientId+";")
    .catch((err) => {
      console.log(err)
      return ("הייתה תקלה");
    }).then((res) => {
        console.log(res);
        return ("למשתמש מספר "+clientId+" עודכן "+fieldHeb+" ונרשם: "+value);
      });
  console.log("clientID: "+clientId+" Column: "+field+" Value: "+value);
  console.log(messageReturn);
  return (messageReturn);
};

//--------------------DELETE LAST ORDER BY CLIEND ID----------------//
exports.dbDeleteLastOrderById = async function(clientId){
  lastOrderDetails = await pool.query("SELECT orderid,item1,item2,item3,item4,sum FROM "+tableOrders+
  " WHERE clientid = "+clientId+" ORDER BY orderid DESC LIMIT 1;")
  .catch((err) => {
    console.log(err)
  }).then((res) => {        
      return (res);
    });
if(lastOrderDetails[0]==null){console.log("no order");return ("no such order")};

clientDetail = await pool.query("SELECT item1,item2,item3,item4,sum FROM "+tableClients+
" WHERE id = "+clientId+";");

if(lastOrderDetails[0].sum>clientDetail[0].sum||lastOrderDetails[0].item1>clientDetail[0].item1||
  lastOrderDetails[0].item2>clientDetail[0].item2||lastOrderDetails[0].item3>clientDetail[0].item3||
  lastOrderDetails[0].item4>clientDetail[0].item4){console.log("ERROR SUM IS NO LOGICAL");return ("ERROR WITH THE NUMBERS")};
  
// console.log("Order Sum: "+lastOrderDetails[0].sum);
// console.log("Client Sum: "+clientDetail[0].sum);

deletedOrderFromClients = await pool.query("UPDATE "+tableClients+" SET"+
" item1 = (item1 - "+lastOrderDetails[0].item1+")"+
",item2 = (item2 - "+lastOrderDetails[0].item2+")"+
",item3 = (item3 - "+lastOrderDetails[0].item3+")"+
",item4 = (item4 - "+lastOrderDetails[0].item4+")"+
",sum = (sum - "+lastOrderDetails[0].sum+")"+
"WHERE id = "+clientId+";")
.catch((err) => {
  console.log(err)
}).then((res) => {        
    return (res);
  });
deleteOrderFromOrders = await pool.query("DELETE FROM "+tableOrders+" WHERE orderid = "+
lastOrderDetails[0].orderid+";");
// console.log(deletedOrderFromClients);
// console.log("DB DELETE LAST ORDER FROM: "+clientId+" SUM OF: "+lastOrderDetails[0].sum);
return ("DELETE LAST ORDER FROM: "+clientId+" SUM OF: "+lastOrderDetails[0].sum);
}

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

//--------------------DELETE CLIENT BY ID----------------//
exports.dbDeleteClient = async function(clientId){  
  let ifExist = await this.dbGetClientDetailsById(clientId);  
  let newId;
  let messageReturn;
  if(ifExist.length == 0){
    console.log("CLIENT DONT EXIST");
    return ("CLIENT NOT FOUND IN DATABASE");
  }else{
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
  return ("REMOVED FROM DATABASE -- NO PROOF YET"+messageReturn);
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
  var sum = item1*10+item2*12+item3*10+item4*10;  
  let orderResult;
  orderResult = await pool.query(`UPDATE ${tableClients} SET last_action = (NOW()),
   item1 = item1+${item1},
   item2 = item2+${item2},
   item3 = item3+${item3},
   item4 = item4+${item4},
   sum = sum+${sum}
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
exports.dbGetClientDetailsByFields = function(name,nick,account) {
  return pool.query("SELECT name,nick,account FROM "+tableClients+
  " WHERE name LIKE '"+name+"' OR nick LIKE '"+nick+"' OR account LIKE '"+account+"';");
};

//-----------------------GET CLIENT DETAILS BY ID----------------------//
exports.dbGetClientDetailsById = function(clientId) {
  return pool.query("SELECT name,nick,account FROM "+tableClients+
  " WHERE id="+clientId+";");
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

//-----------------------GET BY NAME FROM DB----------------------//
exports.dbGetNameIfExist = function(name) {
  return pool.query("SELECT name FROM "+tableClients+
  " WHERE name LIKE '"+name+"';");
};

//-----------------------GET BY NICK FROM DB----------------------//
exports.dbGetNickIfExist = function(nick) {
  return pool.query("SELECT nick FROM "+tableClients+
  " WHERE nick LIKE '"+nick+"';");
};
//-----------------------GET BY ACCOUNT FROM DB----------------------//
exports.dbGetAccountIfExist = function(account) {
  return pool.query("SELECT account FROM "+tableClients+
  " WHERE account LIKE '"+account+"';");
};

//-----------------------GET ID NICK AND NAME FROM DB BY NICK SEARCH----------------------//
exports.dbGetNameBySearchName = function(clientName) {
  return pool.query("SELECT id,account,name,nick FROM "+tableClients+
  " WHERE name LIKE '%"+clientName+"%' ORDER BY last_action DESC;");
};

//-----------------------GET ID NICK AND NAME FROM DB BY NICK SEARCH----------------------//
exports.dbGetNameBySearch = function(query) {
  return pool.query("SELECT id,nick,name FROM "+tableClients+
  " WHERE nick LIKE '%"+query+"%' ORDER BY last_action DESC;");
};

//-----------------------GET ACCOUNT INFO BY SCOPE----------------------//
exports.dbGetDataByScope = async function(scope) {
  if (scope==1){//SCOPE ORDERS
    data = await pool.query("SELECT orderid,DATE_FORMAT(`time`, '%Y-%m-%d %H:%i') AS `formatted_date`"+
    ",item1,item2,item3,item4,sum,clientid,client FROM "+tableOrders+
    " ORDER BY orderid DESC;");
  };
  if (scope==2){//SCOPE CLIENTS ALL
    data = await pool.query("SELECT id,DATE_FORMAT(`last_action`, '%Y-%m-%d %H:%i') AS `formatted_date`"+
    ",item1,item2,item3,item4,sum,account,name,nick FROM "+tableClients+
    " WHERE account > 50"+
    " ORDER BY name;");    
  };
  if (scope==3){//SCOPE CLIENTS REAL
    data = await pool.query("SELECT id,DATE_FORMAT(`last_action`, '%Y-%m-%d %H:%i') AS `formatted_date`"+
    ",item1,item2,item3,item4,sum,account,name,nick FROM "+tableClients+    
    " ORDER BY name;");    
  };
  if (scope==4){//SCOPE REPORT
    data = await pool.query("SELECT sum,"+
    " DATE_FORMAT(`last_action`, '%y/%m/%d') AS `formatted_date`"+
    ",name,account FROM "+tableClients+    
    " WHERE account >= 50 AND sum > 0 "+
    " ORDER BY last_action DESC ;");
  };
  // console.log(await data);
  return data;
};

//-----------------------BACKUP TABLES INTERNALLY-----------------------//
exports.dbBackupTable = async function(time) {  
  let tsmp = time.toString();
  tsmp = tsmp.replace("/","");
  tsmp = tsmp.replace(",","");
  tsmp = tsmp.replace(":","");
  tsmp = tsmp.replace(" ","");
  tsmp = tsmp.replace("/","");
  tsmp = tsmp.replace(":","");
  const backupTableName = (`bk_${tsmp}_${tableClients}`);
  let backup_table = await pool.query(`CREATE OR REPLACE TABLE ${backupTableName} LIKE ${tableClients};`);
  let backup_rows = await pool.query(`INSERT IGNORE INTO ${backupTableName} SELECT * FROM ${tableClients}`);
  console.log(await backup_table);
  console.log(await backup_rows);
  return (backupTableName);
};

//-----------------------DELETE OLD BACKUP TABLES INTERNALLY-----------------------//
exports.dbDeleteOldBackups = async function(time) {
let tableBackups;
tableBackups = await pool.query(`SHOW TABLES LIKE 'clients_%';`);
for(i=0;i<tableBackups.length-1;i++){
  let tableName = (JSON.stringify(tableBackups).split(',')[i].split(':')[1].replace('"','').replace('"','').replace('}',''));   
  console.log(tableName);
  tableDropResponse = await pool.query("DROP TABLE "+tableName+";");
  console.log(tableDropResponse);
  }
};

