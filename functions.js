const path = require('node:path');
const fs = require('fs');

// console.log("IMPORTED FUNCTIONS FILE");

// READS IMG FILES OF ITEMS IN MANAGE VIEW
exports.itemImgArray = function () {
    const itemsFolder = path.join(__dirname, './public/img/items');
    var itemImgArray = [];
    itemImgArray = fs.readdirSync(itemsFolder);
    return itemImgArray;
};