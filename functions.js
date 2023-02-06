const fs = require('fs');
const path = require('path');

const itemsFolder = path.join(__dirname, '/public/img/items');

exports.processItemsImgs = function() {
    // var regExpFormat = new RegExp(fileFormat,"g");
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