const TelegramBot = require("node-telegram-bot-api");

const token = "8373169221:AAF-S1LiNMD4WLplJPj0d5BNSYaXBlzD9uA";

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log("Message:", text);

  if (text === "/start") {
    bot.sendMessage(chatId, "Bot working ✅");
  }

  if (text === "hi") {
    bot.sendMessage(chatId, "Hello 👋");
  }

  if (text.startsWith("/approve")) {
    bot.sendMessage(chatId, "Order Approved ✅");
  }

  if (text.startsWith("/reject")) {
    bot.sendMessage(chatId, "Order Rejected ❌");
  }
});
