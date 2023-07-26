require("dotenv").config();
const fs = require('fs');
const path = require('path');

const HUG_CIRCULUS = process.env.HUGGINGFACE_CIRCULUS;


// import { HfInference } from '@huggingface/inference';
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(HUG_CIRCULUS)


console.log(hf);
console.log("gggggggggggggg")



async function requestTranslate(data) {
    console.log("start translating");
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

    console.log("------------------------------");

    const myPromise = new Promise((resolve, reject) => {
    let ttr = hf.translation({
        model: 't5-base',
        inputs: 'My name is Wolfgang and I live in Berlin'
      });    
    console.log(ttr);
    return ttr;
    });
    
    console.log(myPromise);

    myPromise.then((value)=>{
        console.log(value);
    });

    console.log("------------------------------");
    
    let text = await hf.translation({model: 't5-base',inputs: userInput}).then((response) => {
        console.log(JSON.stringify(response))
    }).then((text) => {
        console.log("inside hf");
        console.log(text);
        return text;
    });
    console.log("------------------------------");

    console.log(text);

    console.log("------------------------------");

    let text2 = requestTranslate({"inputs": userInput}).then((response) => {
        console.log(JSON.stringify(response));
    }).then((text2) => {
        console.log(text2);
        return text2;
    });
    
};