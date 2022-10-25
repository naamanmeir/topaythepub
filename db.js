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
    messageReturn = await pool.getConnection().then(conn => {conn.query("INSERT INTO "+table+" (name) VALUES ('"+name+"');")
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

//--------------------INSERT ORDER BY ID----------------//
exports.dbInsertOrder = async function(id){  
  pool.query("UPDATE "+table+" SET SCORE = SCORE+1 WHERE id = "+(id)+";")
  .then((res) => function(){
    console.log(res)
    return ("DB: inserted a score to: "+id+" score is now: ");
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
