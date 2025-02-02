+cmd install set.js module.exports = {
  config: {
    name: "set",
    aliases: ['ap'],
    version: "1.0",
    author: "Hasan",
    role: 0,
    shortDescription: {
      en: "Set coins and experience points"
    },
    longDescription: {
      en: "Set coins and experience points "
    },
    category: "economy",
    guide: {
      en: "{pn} set [money|exp] [amount] [@mention (optional)]"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const hasan = ["100092366766774"]; // কেবল অনুমোদিত ব্যবহারকারী
    if (!hasan.includes(event.senderID)) {
      return api.sendMessage("sudhu amr boss rimon aii cmd use korte parbe 🚫 ", event.threadID);
    }

    const toxiciter = args[0]?.toLowerCase();
    const amount = parseInt(args[1]); // পরিমাণ
    const { senderID, threadID, mentions } = event;
    const mentionKeys = Object.keys(mentions);

    if (!toxiciter || isNaN(amount) || amount <= 0) {
      return api.sendMessage("Invalid command! Usage:\nset [money|exp] [amount] [@mention (optional)]", threadID);
    }
    let targetUser = mentionKeys[0] || senderID;
    const userData = await usersData.get(targetUser);

    if (!userData) {
      return api.sendMessage("User not found.", threadID);
    }

    const name = await usersData.getName(targetUser);

    if (toxiciter === 'exp') {
      await usersData.set(targetUser, {
        money: userData.money,
        exp: amount,
        data: userData.data
      });

      return api.sendMessage(`Set experience points to ${amount} for ${name}.`, threadID);
    } else if (toxiciter === 'money') {
      await usersData.set(targetUser, {
        money: amount,
        exp: userData.exp,
        data: userData.data
      });

      return api.sendMessage(`Set coins to ${amount} for ${name}.`, threadID);
    } else {
      return api.sendMessage("Invalid query. Use 'exp' to set experience points or 'money' to set coins.", threadID);
    }
  }
};
