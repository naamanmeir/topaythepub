require("dotenv").config();
const db = require('../../db');
const { Configuration, OpenAIApi } = require("openai");
  const openAiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(openAiConfig);

let facts;

let lastMessage;

async function getFacts(){
  facts = (await db.dbGetFacts());
};
getFacts();

exports.talkToDavid = async function(user_input){
    const messages = [];
    let davidReplay;
    for(let i = 0;i<facts.length;i++){
      messages.push({role: "system", content: facts[i].fact})
    };
    if(lastMessage!=null){messages.push(lastMessage);};
    messages.push({ role: "user", content: user_input });    

    try {
    
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

    const completion_text = completion.data.choices[0].message.content;

    lastMessage = ({ role: "user", content: user_input},
    {role: "assistant", content: completion_text });    

    davidReply = completion_text;

    }catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
          return error.response.status;
        } else {
          console.log(error.message);
          return error.message;
        }
      };

    return davidReply;
};