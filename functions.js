const path = require('path');
// const fs = require('fs');
const db = require('./db');
const app = require('./app');

var filesArray = [];

exports.processAssets = function() {
    var regExpFormat = new RegExp(fileFormat,"g");
    filesArray = fs.readdirSync(assetsFolder);
    filesArray.forEach(function(file,index){
            var fileName = new String(file);
            fileName = fileName.replace(/\./g, " ");
            fileName = fileName.replace(/'/g, "");
            fileName = fileName.replace(regExpFormat, "");
            fileName = fileName.replace(/ jpg/,".jpg");
            fs.rename(assetsFolder+'/'+file, assetsFolder+'/'+fileName, function(err){
                if (err) throw err;                
            })
            fileName = fileName.substring(0, fileName.length - 4);            
            db.dbInsertName(index+1,fileName);
    });
    console.log("FUNCTIONS: ASSETS FILELIST WAS RELOADED TO DB");
    //SORT DB BY SCORE
};

exports.initDb = function()  {
    //SORT DB BY SCORE
};

exports.buildArrayFromDb = async function(){
    var arrayFromDb = [];    
    arrayFromDb = await db.dbGetAllVideos();
    return arrayFromDb;    
};

exports.dbGetLength = async function(){    
    var numberOfMoviesInDb = await db.dbAskLength();    
    return (numberOfMoviesInDb);
};

exports.getUserTime = function () {
    return Date();
};
