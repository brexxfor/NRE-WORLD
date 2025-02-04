const axios = require("axios");

const getAPIBase = async () => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json"
  );
  return data.bs;
};

const sendMessage = (api, threadID, message, messageID) => 
  api.sendMessage(message, threadID, messageID);

const cError = (api, threadID, messageID) => 
  sendMessage(api, threadID, "error🦆💨", messageID);

const teachBot = async (api, threadID, messageID, senderID, teachText) => {
  const [ask, answers] = teachText.split(" - ").map((text) => text.trim());
  if (!ask || !answers) {
    return sendMessage(api, threadID, "Invalid format. Use: {pn} teach <ask> - <answer1, answer2, ...>", messageID);
  }

  const answerArray = answers.split(",").map((ans) => ans.trim()).filter((ans) => ans !== "");

  try {
    const res = await axios.get(
      `${await getAPIBase()}/bby/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(answerArray.join(","))}&uid=${senderID}`
    );
    const responseMsg = res.data?.message === "Teaching recorded successfully!"
      ? `Successfully taught the bot!\n📖 Teaching Details:\n- Question: ${res.data.ask}\n- Answers: ${answerArray.join(", ")}\n- Your Total Teachings: ${res.data.userStats.user.totalTeachings}`
      : res.data?.message || "Teaching failed.";
    return sendMessage(api, threadID, responseMsg, messageID);
  } catch {
    return cError(api, threadID, messageID);
  }
};

const talkWithBot = async (api, threadID, messageID, senderID, input) => {
  try {
    const res = await axios.get(
      `${await getAPIBase()}/bby?text=${encodeURIComponent(input)}&uid=${senderID}&font=2`
    );
    const reply = res.data?.text || "Please teach me this sentence!🦆💨";
    const react = res.data.react || "";
    return api.sendMessage(reply + react, threadID, (error, info) => {
      if (error) return cError(api, threadID, messageID);
      global.GoatBot.onReply.set(info.messageID, {
        commandName: module.exports.config.name,
        type: "reply",
        messageID: info.messageID,
        author: senderID,
        msg: reply,
      });
    }, messageID);
  } catch {
    return cError(api, threadID, messageID);
  }
};

const botMsgInfo = async (api, threadID, messageID, senderID, input) => {
  try {
    const res = await axios.get(
      `${await getAPIBase()}/bby/msg?ask=${encodeURIComponent(input)}&uid=${senderID}`
    );

    if (!res.data || res.data.status !== "Success" || !Array.isArray(res.data.messages) || res.data.messages.length === 0) {
      return sendMessage(api, threadID, "No matching messages found!🦆💨", messageID);
    }

    const askText = `📜 Ask: ${res.data.ask}\n\n`;
    const answers = res.data.messages.map(msg => `🎀 [${msg.index}] ${msg.ans}`).join("\n");

    const finalMessage = `${askText}${answers}`;

    return sendMessage(api, threadID, finalMessage, messageID);
  } catch {
    return cError(api, threadID, messageID);
  }
};

const deleteMessage = async (api, threadID, messageID, senderID, input) => {
  try {
    const [text, index] = input.split(" ").map((str) => str.trim());

    if (index === undefined) {
      if (!text) {
        return sendMessage(api, threadID, "Invalid format. Use: {pn} delete <text>", messageID);
      }

      const res = await axios.get(
        `${await getAPIBase()}/bby/delete?text=${encodeURIComponent(text)}&uid=${senderID}`
      );

      if (res.data && res.data.status === "Success") {
        return sendMessage(api, threadID, `✅ Successfully deleted all answers related to: ${text}`, messageID);
      } else {
        return sendMessage(api, threadID, res.data?.message || "❌ Failed to delete the message!", messageID);
      }
    }

    if (isNaN(index)) {
      return sendMessage(api, threadID, "Invalid format. Index must be a number.", messageID);
    }

    const res = await axios.get(
      `${await getAPIBase()}/bby/delete?text=${encodeURIComponent(text)}&index=${index}&uid=${senderID}`
    );

    if (res.data && res.data.status === "Success") {
      return sendMessage(api, threadID, `✅ Successfully deleted answer [Index: ${index}] related to: ${text}`, messageID);
    } else {
      return sendMessage(api, threadID, res.data?.message || "❌ Failed to delete the message!", messageID);
    }
  } catch {
    return cError(api, threadID, messageID);
  }
};

const editMessage = async (api, threadID, messageID, senderID, input) => {
  try {
    const [ask, newAskOrIndex, newAns] = input.split(" ").map((str) => str.trim());

    if (!ask || (!newAskOrIndex && !newAns)) {
      return sendMessage(api, threadID, "Invalid format. Use:\n1. {pn} edit <ask>  <newAsk>\n2. {pn} edit <ask>  <index>  <newAnswer>", messageID);
    }

    if (newAskOrIndex && !newAns) {
      const res = await axios.get(
        `${await getAPIBase()}/bby/edit?ask=${encodeURIComponent(ask)}&newAsk=${encodeURIComponent(newAskOrIndex)}&uid=${senderID}`
      );

      const message = res.data?.status === "Success" ? `✅ Successfully updated question to: ${newAskOrIndex}` : res.data?.message || "❌ Failed to update the question!";
      return sendMessage(api, threadID, message, messageID);
    }

    if (newAskOrIndex && newAns) {
      const index = parseInt(newAskOrIndex, 10);

      if (isNaN(index)) {
        return sendMessage(api, threadID, "Invalid format. Index must be a number.", messageID);
      }

      const res = await axios.get(
        `${await getAPIBase()}/bby/edit?ask=${encodeURIComponent(ask)}&index=${index}&newAns=${encodeURIComponent(newAns)}&uid=${senderID}`
      );

      const message = res.data?.status === "Success" ? `✅ Successfully updated answer at index ${index} to: ${newAns}` : res.data?.message || "❌ Failed to update the answer!";
      return sendMessage(api, threadID, message, messageID);
    }
  } catch {
    return cError(api, threadID, messageID);
  }
};

module.exports.config = {
  name: "bot",
  aliases: ["sim", "bbyx"],
  version: "1.6.9",
  author: "Nazrul",
  role: 0,
  description: "Talk with the bot or teach it new responses",
  category: "talk",
  countDown: 3,
  guide: {
    en: `{pn} <text> - Ask the bot something\n{pn} teach <ask> - <answer> - Teach the bot a new response\n\nExamples:\n1. {pn} Hello\n2. {pn} teach hi - hello\n3. {pn} delete <text> - Delete all answers related to text\n4. {pn} delete <text> <index> - Delete specific answer at index\n5. {pn} edit <Ask> <New Ask> to update the ask query\n6. {pn} edit <ask> <index>  <new ans> update specific answer at index`,
  },
};

module.exports.onStart = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  if (args.length === 0) {
    return sendMessage(api, threadID, "Please provide text or teach the bot!", messageID);
  }

  const input = args.join(" ").trim();
  const [command, ...rest] = input.split(" ");

  if (command.toLowerCase() === "teach") {
    return teachBot(api, threadID, messageID, senderID, rest.join(" ").trim());
  }
  if (command.toLowerCase() === "msg") {
    return botMsgInfo(api, threadID, messageID, senderID, rest.join(" ").trim());
  }
  if (command.toLowerCase() === "edit") {
    return editMessage(api, threadID, messageID, senderID, rest.join(" ").trim());
  }
  if (command.toLowerCase() === "delete") {
    return deleteMessage(api, threadID, messageID, senderID, rest.join(" ").trim());
  }
  return talkWithBot(api, threadID, messageID, senderID, input);
};

module.exports.onChat = async ({ api, event }) => {
  const { threadID, messageID, body, senderID } = event;

  const cMessages = ["Hello bby!", "Hi there!", "Hey! How can I help?"];
  const userInput = body.toLowerCase().trim();

  const keywords = ["bby", "baby", "bot", "বট", "robot"];

  if (keywords.some((keyword) => userInput.startsWith(keyword))) {
    const isQuestion = userInput.split(" ").length > 1;
    if (isQuestion) {
      const question = userInput.slice(userInput.indexOf(" ") + 1).trim();

      try {
        const res = await axios.get(
          `${await getAPIBase()}/bby?text=${encodeURIComponent(question)}&uid=${senderID}&font=2`
        );
        const replyMsg = res.data?.text || "Please teach me this sentence!🦆💨";
        const react = res.data.react || "";

        return api.sendMessage(replyMsg + react, threadID, (error, info) => {
          if (!error) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              type: "reply",
              author: senderID,
              replyMsg
            });
          }
        }, messageID);
      } catch (error) {
        return api.sendMessage("error🦆💨", threadID, messageID);
      }
    } else {
      const rMsg = cMessages[Math.floor(Math.random() * cMessages.length)];
      return api.sendMessage(rMsg, threadID, (error, info) => {
          if (!error) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              type: "reply",
              author: senderID,
            });
          }
        }, messageID);
    }
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  const { threadID, messageID, senderID, body } = event;
  return talkWithBot(api, threadID, messageID, senderID, body);
};
