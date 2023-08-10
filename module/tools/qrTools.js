require("dotenv").config();
const fs = require('fs');
const path = require('path');
var QRCode = require('qrcode');
let crypto = require('crypto');
const db = require('../../db.js');

let qrFolder = '/../../public/img/qrCode/';

const link1 = process.env.addressRemoteBoard;
const link2 = process.env.addressRemoteApp;

exports.createQrToRemoteBoard = async function(){   
  
  var opts = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 1,
    margin: 1,
    width: 400,
    height: 400,
    color: {
      dark:"#000000FF",
      light:"#FFFFFFFF"      
    }
  };
  const tokenName = 'tempLoginAtRemoteBoard';
  const tokenExp = 15;
  const tokenClass = 120;
  const randomString = crypto.randomBytes(8).toString('hex');
  let dbInsertToken = await db.dbInsertToken(randomString,tokenClass,tokenName,tokenExp);
  // console.log(dbInsertToken);
  let target = `${link1}?token=${randomString}`
  let date = Date.now();
  let filename = `${date}${randomString}.png`
  let qrFile = (__dirname) + (qrFolder)+(filename);    
  let qrData;
  // console.log(target);
  QRCode.toDataURL(target, opts ,(err, qr) => {
    if (err){return "Error occured";};
    var data = qr.substr(qr.indexOf('base64') + 7)
    var buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(qrFile, buffer);
  });  
  return filename;    
};

exports.createQrToRemoteApp = async function(){   
  
  var opts = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 1,
    margin: 1,
    width: 400,
    height: 400,
    color: {
      dark:"#000000FF",
      light:"#FFFFFFFF"      
    }
  };
  const tokenName = 'tempLoginAtRemoteApp';
  const tokenExp = 15;
  const tokenClass = 100;
  const randomString = crypto.randomBytes(8).toString('hex');
  let dbInsertToken = await db.dbInsertToken(randomString,tokenClass,tokenName,tokenExp);
  // console.log(dbInsertToken);
  let target = `${link2}?token=${randomString}`
  let date = Date.now();
  let filename = `${date}${randomString}.png`
  let qrFile = (__dirname) + (qrFolder)+(filename);    
  let qrData;
  // console.log(target);
  QRCode.toDataURL(target, opts ,(err, qr) => {
    if (err){return "Error occured";};
    var data = qr.substr(qr.indexOf('base64') + 7)
    var buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(qrFile, buffer);
  });  
  return filename;    
};