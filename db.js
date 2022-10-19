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
    // console.log("DB SELECT COUNT OF videos ROWS: "+value);
    return value;
  })
  .catch(err => {
    console.log(err);
  })  
  return numberOfVideos;
};

//--------------------INSERT NEW NAME AND ID TO DB----------------//
exports.dbInsertName = function(id,name){        
  pool.getConnection().then(conn => {
    // console.log("INSERT INTO "+table+" (id,name,score,played) VALUES ("+(id)+",'"+name+"',0,0);");    
    conn.query(
      "INSERT INTO "+table+
    " (id,name,score,played) VALUES ("
    +(id)+",'"+name+
    "',0,0);")
    .then((rows) => {
    // console.log(rows);
  })
  .then((res)=> {
    // console.log(res);
    conn.end();
  })
  .catch(err =>{
    // console.log(err);
    conn.end();
  })
}).catch(err => {
  console.log("CONNECTION Error: " + err)
});
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

//-----------------------GET ID AND NAME FROM DB BY SEARCH----------------------//
exports.dbGetNameBySearch = function(query) {
  return pool.query("SELECT id,name FROM "+table+" WHERE name LIKE '%"+query+"%' collate utf8mb4_general_ci;");
};
