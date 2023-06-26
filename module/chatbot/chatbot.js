require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
  const openAiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(openAiConfig);

const davidHistory = [];

exports.talkToDavid = async function(user_input){
    const messages = [];
    for (const [input_text, completion_text] of davidHistory) {
        messages.push({ role: "user", content: input_text });
        messages.push({ role: "assistant", content: completion_text });
    }
    messages.push({ role: "user", content: user_input });

    try {
    
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

    const completion_text = completion.data.choices[0].message.content;
    // console.log(completion_text);

    davidHistory.push([user_input, completion_text]);

    return completion_text;

    }catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
      };      
    return;
};