require("dotenv").config();
const fs = require('fs');
const path = require('path');

const HUG_CIRCULUS = process.env.HUGGINGFACE_CIRCULUS;

let photobotIsBusy = 0;

exports.photobotIsBusy = photobotIsBusy;

async function requestImage(data) {    
	const response = await fetch(
        // "https://api-inference.huggingface.co/models/WarriorMama777/OrangeMixs",
        // "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
		// "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-refiner-1.0",
		{
			headers: { Authorization: "Bearer "+HUG_CIRCULUS },
			method: "POST",
			body: JSON.stringify(data),            
		}
	);
	const result = await response.blob();
    // console.log(response);
    // console.log(result);
	return result;
}

exports.askForPhoto = async function(input,mode){
    console.log("ASK FOR PHOTO HUGGINGFACE");
    console.log(input);    
    let photo;
    let buffer;
    try {
        photo = await requestImage({"inputs": input})
    } catch (error) {
        console.error('Error with photobot api:', error);
    }
    // let photo = await requestImage({"inputs": input}).then((response) => {   
    //     console.log(response);     
    //     return response;
    // })
    // .catch(error => console.error('Error with photobot response:', error));
    try {
        buffer = Buffer.from( await photo.arrayBuffer() )
    } catch (error) {
        console.error('Error with photobot response:', error);
    }
    input = input.replace(',','');
    let currentTime = Date.now();
    if(input.length >= 24){input = (input.slice(0,20)+currentTime)}
    let originalName = (__dirname + '/../../public/img/photobot/') + (input+".jpg");
    originalName = renameFileIfExist(originalName);
    try {
        fs.writeFile(originalName, buffer, () => {});    
    } catch (error) {
        console.error('Error with photobot writing to file:', error);
    }
    if(mode==null){
        let fileReturn = "../photobot/"+path.basename(originalName);    
        return fileReturn;
    }
    if(mode!=null && mode==1){
        console.log("adding item photo");
        let itemPhotoName = (__dirname + '/../../public/img/items/') + (input+".jpg");
        itemPhotoName = renameFileIfExist(itemPhotoName);
        try {
            fs.writeFile(itemPhotoName, buffer, () => {});    
        } catch (error) {
            console.error('Error with photobot adding item photo:', error);
        }
        console.log("ADDED ITEM PHOTO");
    }    
    let fileReturn = "../photobot/"+path.basename(originalName);    
    return fileReturn;
};

// exports.askForItemPhoto = async function(input){
//     console.log("ASK FOR ITEM PHOTO HUGGINGFACE");
//     console.log(input);
//     input = input.replace(',','');
//     let photo;
//     let buffer;
//     try {
//         photo = await requestImage({"inputs": input})
//     } catch (error) {
//         console.error('Error with photobot api:', error);
//     }
//     // let photo = await requestImage({"inputs": input}).then((response) => {   
//     //     console.log(response);     
//     //     return response;
//     // })
//     // .catch(error => console.error('Error with photobot response:', error));
//     try {
//         buffer = Buffer.from( await photo.arrayBuffer() )
//     } catch (error) {
//         console.error('Error with photobot response:', error);
//     }
//     let currentTime = Date.now();
//     if(input.length >= 14){input = (input.slice(0,25)+currentTime)}
//     let originalName = (__dirname + '/../../public/img/items/') + (input+".jpg");
//     originalName = renameFileIfExist(originalName);
//     try {
//         fs.writeFile(originalName, buffer, () => {});    
//     } catch (error) {
//         console.error('Error with photobot response:', error);
//     }
    
//     let fileReturn = "../photobot/"+path.basename(originalName);    
//     return fileReturn;
// };


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