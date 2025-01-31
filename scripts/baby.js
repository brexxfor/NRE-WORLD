const axios = require('axios');

const baseApiUrl = async () => {
  const response = await axios.get('https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json');
  return response.data.api;
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe"],
  version: "6.9.0",
  author: "dipto",
  countDown: 0,
  role: 0,
  description: "Better than all sim simi",
  category: "chat",
  guide: {
    en: `
      {pn} [anyMessage]
      OR teach [YourMessage] - [Reply1], [Reply2]...
      OR remove [YourMessage]
      OR rm [YourMessage] - [indexNumber]
      OR msg [YourMessage]
      OR list OR all
      OR edit [YourMessage] - [NewMessage]
    `,
  },
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const apiUrl = `${await baseApiUrl()}/baby`;
  const input = args.join(" ").toLowerCase().trim();
  const senderID = event.senderID;

  try {
    if (!args[0]) {
      const randomReplies = ["Bolo baby", "hum", "Type help baby", "Type !baby hi"];
      return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, event.messageID);
    }

    // Handle 'remove' command
    if (args[0] === 'remove') {
      const message = input.replace("remove ", "").trim();
      const response = await axios.get(`${apiUrl}?remove=${message}&senderID=${senderID}`);
      return api.sendMessage(response.data.message, event.threadID, event.messageID);
    }

    // Handle 'rm' command
    if (args[0] === 'rm' && input.includes('-')) {
      const [message, index] = input.replace("rm ", "").split(' - ').map(s => s.trim());
      const response = await axios.get(`${apiUrl}?remove=${message}&index=${index}`);
      return api.sendMessage(response.data.message, event.threadID, event.messageID);
    }

    // Handle 'list' and 'list all' commands
    if (args[0] === 'list') {
      const listType = args[1] === 'all' ? 'all' : '';
      const response = await axios.get(`${apiUrl}?list=${listType}`);
      if (listType === 'all') {
        const teachers = await Promise.all(
          response.data.teacher.teacherList.map(async (item) => {
            const userID = Object.keys(item)[0];
            const value = item[userID];
            const name = (await usersData.get(userID)).name;
            return { name, value };
          })
        );

        teachers.sort((a, b) => b.value - a.value);
        const formattedList = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
        return api.sendMessage(`Total Teach = ${response.data.length}\n👑 Teachers:\n${formattedList}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage(`Total Teach = ${response.data.length}`, event.threadID, event.messageID);
      }
    }

    // Handle 'msg' command
    if (args[0] === 'msg') {
      const message = input.replace("msg ", "").trim();
      const response = await axios.get(`${apiUrl}?list=${message}`);
      return api.sendMessage(`Message "${message}" = ${response.data.data}`, event.threadID, event.messageID);
    }

    // Handle 'edit' command
    if (args[0] === 'edit') {
      const [oldMessage, newMessage] = input.replace("edit ", "").split(' - ').map(s => s.trim());
      if (!newMessage) {
        return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
      }
      const response = await axios.get(`${apiUrl}?edit=${oldMessage}&replace=${newMessage}&senderID=${senderID}`);
      return api.sendMessage(`✅ Changed: ${response.data.message}`, event.threadID, event.messageID);
    }

    // Handle 'teach' command
    if (args[0] === 'teach') {
      const [message, replies] = input.replace("teach ", "").split(' - ').map(s => s.trim());
      if (!replies) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);

      const key = args[1] === 'react' ? 'react' : 'intro';
      const response = await axios.get(`${apiUrl}?teach=${message}&reply=${replies}&senderID=${senderID}&key=${key}`);
      return api.sendMessage(`✅ Replies added: ${response.data.message}`, event.threadID, event.messageID);
    }

    // General message handling
    const response = await axios.get(`${apiUrl}?text=${encodeURIComponent(input)}&senderID=${senderID}&font=1`);
    api.sendMessage(response.data.reply, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: senderID,
      });
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("An error occurred. Check the console for details.", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  try {
    const input = event.body ? event.body.toLowerCase().trim() : "";
    const apiUrl = `${await baseApiUrl()}/baby`;
    const response = await axios.get(`${apiUrl}?text=${encodeURIComponent(input)}&senderID=${event.senderID}&font=1`);
    api.sendMessage(response.data.reply, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage("Error baby 🥺🥺", event.threadID, event.messageID);
  }
};
module.exports.onChat = async ({ api, event,message }) => {
  try{
    const body = event.body ? event.body.toLowerCase() : ""
    if(body.startsWith("baby") || body.startsWith("bby") || body.startsWith("janu")){
      const arr = body.replace(/^\S+\s*/, "")
      if(!arr){ api.sendMessage("𝗵𝗲𝗮 𝗯𝗮𝗯𝘆", event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
      });
    }, event.messageID);}
    const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
    await api.sendMessage(a, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        a
      });
    }, event.messageID);
    }
  }catch(err){
    return;
  }
};