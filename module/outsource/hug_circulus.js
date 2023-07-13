require("dotenv").config();
const fs = require('fs');
const path = require('path');
let translate =  require("./hug_translate");

const HUG_CIRCULUS = process.env.HUGGINGFACE_CIRCULUS;

let photobotIsBusy = 0;

exports.photobotIsBusy = photobotIsBusy;

async function requestImage(data) {
    // console.log("start painting");
	const response = await fetch(
		"https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
		{
			headers: { Authorization: "Bearer "+HUG_CIRCULUS },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}

exports.askForPhoto = async function(userInput){    
    // let input = await translate.askForTranslation(userInput); // TRANSLATE TO ENGLISH
    let photo = await requestImage({"inputs": userInput}).then((response) => {        
        return response;
    });

    const buffer = Buffer.from( await photo.arrayBuffer() );    
    let originalName = (__dirname + '/../../public/img/photobot/') + (userInput+".jpg");
    originalName = renameFileIfExist(originalName);
    fs.writeFile(originalName, buffer, () => {// console.log('photobot '+originalName); 
    });
    let fileReturn = "../photobot/"+path.basename(originalName);    
    return fileReturn;
};

function renameFileIfExist(file){
    if(fs.existsSync(file)){
        let fileNameDir = path.parse(file).dir;
        let fileNameBase = path.parse(file).name;
        let fileNameExt = path.parse(file).ext;
        let currentTime = Date.now();
        let nameAfterRename = fileNameDir + "/" + fileNameBase + currentTime + fileNameExt;        
        return nameAfterRename;
        }else{        
        return file;
        }
    };
