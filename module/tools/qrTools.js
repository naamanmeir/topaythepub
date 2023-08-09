require("dotenv").config();
const fs = require('fs');
const path = require('path');
var QRCode = require('qrcode');
let crypto = require('crypto');
let qrFolder = '/../../public/img/qrCode/';

const link1 = process.env.addressRemoteBoard;

exports.createQrToRemoteBoard = async function(){
    // console.log("--------------CREATE QR LINK TO REMOTE BOARD----------------");
    const randomString = crypto.randomBytes(8).toString('hex');
    // console.log(randomString);
    let target = `${link1}?token:${randomString}`
    let date = Date.now();
    let filename = `remoteBoardQr${date}.png`
    let qrFile = (__dirname) + (qrFolder)+(filename);
    // console.log(qrFile);
    let qrData;
    QRCode.toDataURL(target, (err, qr) => {
      if (err) res.send("Error occured");
      var data = qr.substr(qr.indexOf('base64') + 7)
      var buffer = Buffer.from(data, 'base64');
      fs.writeFileSync(qrFile, buffer);
    });
    console.log(qrFile);
    // console.log(await qrFile);
    return filename;
    
};