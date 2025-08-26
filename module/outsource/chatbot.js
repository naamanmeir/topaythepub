require("dotenv").config();
const db = require('../../db');
const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const CharLimitOnMessages = 6000;

let facts;

let lastMessage;

let chatbotIsBusy = 0;

exports.chatbotIsBusy = chatbotIsBusy;

async function getFacts(){
  facts = (await db.dbGetFacts());
};
getFacts();

exports.talkToDavid = async function(user_input){

  const messages = [];
  let tokenCount = 0;
  let davidReplay;
  for(let i = 0;i<facts.length;i++){
    tokenCount += facts[i].fact.length;
    messages.push({role: "system", content: facts[i].fact})
  };
  if(lastMessage!=null){messages.push(lastMessage);};
  messages.push({ role: "user", content: user_input });    

  if(tokenCount > CharLimitOnMessages){
    let dbResponse = await db.dbRemoveOldestFact();
  };

  try {
  
  const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

  const completion_text = completion.choices[0].message.content;

  lastMessage = ({ role: "user", content: user_input},
  {role: "assistant", content: completion_text });    

  davidReply = completion_text;

  }catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
        let errorMessage = `נראה שהייתה תקלה מספר ${error.response.status},
        תעבירו את המספר הלאה
        ומתישהו מישהו יעשה משהו כדי לתקן את זה איכשהו
        תודה דייויד מוסר שהוא ממש מתנצל ושיש לו דלי גבינה חבוצה
        `
        return errorMessage;
      } else {
        console.log(error.message);
        let errorMessage = `נראה שהייתה תקלה 
          ${error.message},
        תעבירו את ההודעה הלאה
        ומתישהו מישהו יעשה משהו כדי לתקן את זה איכשהו
        תודה דייויד מוסר שהוא ממש מתנצל אך העיקר לא לשפוך את המרק לפני התבלינים
        `
        return error.message;
      }
    };

  getFacts();
  
  return davidReply;
};