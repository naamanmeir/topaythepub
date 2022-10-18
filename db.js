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

//--------------------INSERT NAME BY ID----------------//
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

exports.dbGetAllVideos = async function() {
  const result = await pool.query("SELECT * FROM "+table+" ORDER BY score asc;")
  // console.log(result);
  return result;
};

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

//--------------------INSERT SCORE BY ID----------------//
exports.dbInsertScore = async function(id){  
  pool.query("UPDATE "+table+" SET SCORE = SCORE+1 WHERE id = "+(id)+";")
  .then((res) => function(){
    console.log(res)
    return ("DB: inserted a score to: "+id+" score is now: ");
  })
  .catch(err =>{
    console.log("CONNECTION Error: " + err)
  })
};

//-----------------------GET VIDEO DATA FROM DB----------------------//
exports.dbAskVideoData = async function(id) {  
  let name;
  let score;
  let played;
  var videoRow = [];
  const result = pool.query("SELECT id,name,score,played FROM "+table+" WHERE id = "+id+";")
  .then(res => {
    name = (res[0].name);
    score = (res[0].score);
    played = (res[0].played);
    videoRow = [id,name,score,played];      
   return videoRow;
  })
  .catch(err => {
    console.log("---------------ERROR READING FROM DB---------------");
    console.log(err);
   })   
  //  console.log("Total connections: ", pool.totalConnections());
  //  console.log("Active connections: ", pool.activeConnections());
  //  console.log("Idle connections: ", pool.idleConnections());
   return result;
};

//-----------------------GET SCORE BY ID FROM DB----------------------//
exports.dbAskScore = async function(id) {
  let score;
  var videoRow = [];
  const result = pool.query("SELECT score FROM "+table+" WHERE id = "+id+";")
  .then(res => {    
    score = (res[0].score);
   return score;
  })
  .catch(err => {
    console.log("---------------ERROR READING FROM DB---------------");
    console.log(err);
   })   
  //  console.log("Total connections: ", pool.totalConnections());
  //  console.log("Active connections: ", pool.activeConnections());
  //  console.log("Idle connections: ", pool.idleConnections());
   return result;
};
