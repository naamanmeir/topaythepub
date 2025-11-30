require("dotenv").config();
const db = require('../database/db');
const { Configuration, OpenAIApi } = require("openai");
const fetch = global.fetch || require('node-fetch');

// Provider selection: set CHATBOT_PROVIDER=anthropic to use Claude Sonnet 3.7
const CHATBOT_PROVIDER = (process.env.CHATBOT_PROVIDER || 'openai').toLowerCase();

let openai;
if (CHATBOT_PROVIDER === 'openai' || !process.env.CLAUDE_API_KEY) {
  const openAiConfig = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  openai = new OpenAIApi(openAiConfig);
}

const CharLimitOnMessages = 6000;

let facts;
let lastMessage;

// Busy flag exposed on module object (other modules set/check this property)
exports.chatbotIsBusy = 0;

async function getFacts(){
  facts = (await db.dbGetFacts());
};
getFacts();

/**
 * talkToDavid(user_input)
 * - Uses provider based on CHATBOT_PROVIDER env var:
 *   - 'openai' (default): uses openai.createChatCompletion
 *   - 'anthropic': uses Anthropic Claude Sonnet 3.7 via REST API
 */
exports.talkToDavid = async function(user_input){

  const messages = [];
  let tokenCount = 0;
  let davidReply;

  for(let i = 0;i < (facts || []).length;i++){
    tokenCount += facts[i].fact.length;
    // keep facts as system instructions
    messages.push({role: "system", content: facts[i].fact});
  };
  if(lastMessage != null){ messages.push(lastMessage); };
  messages.push({ role: "user", content: user_input });

  if(tokenCount > CharLimitOnMessages){
    await db.dbRemoveOldestFact();
  };

  try {
    if (CHATBOT_PROVIDER === 'anthropic') {
      // Call Anthropic Claude Sonnet 3.7 via REST. Requires CLAUDE_API_KEY env var.
      const apiKey = process.env.CLAUDE_API_KEY;
      if (!apiKey) throw new Error('CLAUDE_API_KEY not set');

      // Build a simple prompt: include facts and the user input.
      // Anthropic expects a prompt string; we'll use a short delimiter format.
      let promptParts = [];
      for (const f of (facts || [])) {
        promptParts.push(`SYSTEM: ${f.fact}`);
      }
      if (lastMessage && lastMessage.role && lastMessage.content) {
        promptParts.push(`ASSISTANT: ${lastMessage.content}`);
      }
      promptParts.push(`USER: ${user_input}`);
      const prompt = promptParts.join('\n\n');

      const anthopicUrl = 'https://api.anthropic.com/v1/complete';
      const body = {
        model: 'claude-sonnet-3.7',
        prompt: prompt,
        // Keep answers reasonably short; tune max_tokens as needed
        max_tokens: 800,
        temperature: 0.7,
        stop_sequences: ["\nUSER:", "\nASSISTANT:"]
      };

      const response = await fetch(anthopicUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Accept either header style depending on Anthropic account
          'X-API-Key': apiKey,
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const text = await response.text();
        throw { response: { status: response.status, data: text } };
      }

      const data = await response.json();
      // Anthropic returns 'completion' or similar fields; try common ones
      const completion_text = data.completion || data.output || (data?.choices && data.choices[0]?.text) || '';

      lastMessage = ({ role: "user", content: user_input }, { role: "assistant", content: completion_text });
      davidReply = completion_text;

    } else {
      // Default: OpenAI flow (existing behavior)
      const completion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: messages,
      });

      const completion_text = completion.data.choices[0].message.content;
      lastMessage = ({ role: "user", content: user_input }, { role: "assistant", content: completion_text });
      davidReply = completion_text;
    }

  } catch (error) {
    // Keep existing Hebrew-friendly error messages
    if (error && error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
      let errorMessage = `נראה שהייתה תקלה מספר ${error.response.status},\n        תעבירו את המספר הלאה\n        ומתישהו מישהו יעשה משהו כדי לתקן את זה איכשהו\n        תודה דייויד מוסר שהוא ממש מתנצל ושיש לו דלי גבינה חבורה\n        `;
      return errorMessage;
    } else {
      console.log(error && error.message ? error.message : error);
      let errMsg = (error && error.message) ? error.message : 'unknown error';
      let errorMessage = `נראה שהייתה תקלה \n          ${errMsg},\n        תעבירו את ההודעה הלאה\n        ומתישהו מישהו יעשה משהו כדי לתקן את זה איכשהו\n        תודה דייויד מוסר שהוא ממש מתנצל אך העיקר לא לשפוך את המרק לפני התבלינים\n        `;
      return errMsg;
    }
  };

  // refresh facts cache
  getFacts();

  return davidReply;
};