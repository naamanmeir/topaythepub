require("dotenv").config();
const fs = require('fs');
const path = require('path');

const HUG_CIRCULUS = process.env.HUGGINGFACE_CIRCULUS;

async function requestTranslate(data) {
    // console.log("start translating");
	const response = await fetch(
        "https://api-inference.huggingface.co/models/t5-base",
		{
			headers: { Authorization: "Bearer "+HUG_CIRCULUS },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

exports.askForTranslation = async function(userInput){
    // console.log(userInput);
    let text = requestTranslate({"inputs": userInput}).then((response) => {
        console.log(JSON.stringify(response));
    }).then((text) => {
        // console.log(text);
        return text;
    });
    
};