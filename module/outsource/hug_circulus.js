require("dotenv").config();
const fs = require('fs');
const path = require('path');


const HUG_CIRCULUS = process.env.HUGGINGFACE_CIRCULUS;

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/circulus/sd-photoreal-real-v2",
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
    let photo = await query({"inputs": userInput}).then((response) => {        
        return response;        
    });

    const buffer = Buffer.from( await photo.arrayBuffer() );    
    let originalName = (__dirname + '/../../public/img/photobot/') + (userInput+".jpg");
    originalName = renameFileIfExist(originalName);
    // console.log(originalName);
    fs.writeFile(originalName, buffer, () => {

        // console.log('photobot '+originalName); 
    });
    let fileReturn = "../photobot/"+path.basename(originalName);
    // console.log(fileReturn);
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
