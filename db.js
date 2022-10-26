const mariadb = require('mariadb');
const functions = require('./functions');

const pool = mariadb.createPool({
  host: process.env.MYSQL,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,  
  connectionLimit: 5
});

const table = process.env.MYSQL_TABLE;

//--------------------GET LENGTH OF DB----------------//
exports.dbAskLength = async function(){
  let value;
  const numberOfVideos = pool.query("SELECT COUNT(*) AS videos FROM "+table+";")
  .then(res => {
    value = (res[0].videos);    
    return value;
  })
  .catch(err => {
    console.log(err);
  })  
  return numberOfVideos;
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
    messageReturn = await pool.getConnection().then(conn => {conn.query(`INSERT INTO ${table} (listed,last_action,item1,item2,item3,item4,sum,name) VALUES (1,(now()),0,0,0,0,0,'${name}');`)
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
    messageReturn = await pool.getConnection().then(conn => {conn.query(`DELETE FROM ${table} WHERE name = '${name}';`)
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

//--------------------INSERT ORDER BY ID----------------//
exports.dbInsertOrder = async function(orderTime,id,item1,item2,item3,item4){  
  let sum = (item1+item2+item3+item4);
  pool.query(`UPDATE ${table} SET last_action = (NOW()),
   item1 = item1+${item1},
   item2 = item2+${item2},
   item3 = item3+${item3},
   item4 = item4+${item4},
   sum = sum+((item1+item2+item3+item4)*10)
   WHERE id = ${id};`)
  .then((res) => function(){
    console.log(res)
    return (`MADE ORDER TO ID: ${id}`);
  })
  .catch(err =>{
    console.log("CONNECTION Error: " + err)
  })
};

//-----------------------GET EXACT NAME FROM DB ----------------------//
exports.dbGetExactName = function(query) {
  return pool.query("SELECT name FROM "+table+
  " WHERE name LIKE '"+query+
  "' collate utf8mb4_general_ci;");
};

//-----------------------GET ID AND NAME FROM DB BY SEARCH----------------------//
exports.dbGetNameBySearch = function(query) {
  return pool.query("SELECT id,name FROM "+table+
  " WHERE name LIKE '%"+query+
  "%' collate utf8mb4_general_ci;");
};

exports.dbGetAllClientsData = async function(scope) {
  if (scope==1){
    data = await pool.query(`SELECT * FROM ${table};`);
  };
  if (scope==2){
    data = await pool.query(`SELECT sum,account,name FROM ${table};`);
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
  const table_bk = (`${table}_${tsmp}`);
  let backup_table = await pool.query(`CREATE OR REPLACE TABLE ${table_bk} LIKE ${table};`);
  let backup_rows = await pool.query(`INSERT IGNORE INTO ${table_bk} SELECT * FROM ${table}`);
  console.log(await backup_table);
  console.log(await backup_rows);
  return (table_bk);
};

