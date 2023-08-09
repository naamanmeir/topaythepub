require("dotenv").config();
const fs = require('fs');
const path = require('path');

exports.createQrToRemoteBoard = async function(userInput){
    console.log("--------------CREATE QR LINK TO REMOTE BOARD----------------");
    console.log(userInput);
    return userInput;
    
};