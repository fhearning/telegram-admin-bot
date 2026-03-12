const TelegramBot = require("node-telegram-bot-api");

// এখানে তোমার bot token বসাও
const token = "8373169221:AAF-S1LiNMD4WLplJPj0d5BNSYaXBlzD9uA";

const bot = new TelegramBot(token, { polling: true });

console.log("Bot running...");

// start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Admin Bot Running ✅");
});

// button click handle
bot.on("callback_query", (query) => {

  const data = query.data;
  const chatId = query.message.chat.id;

  console.log("Button:", data);

  if (data.startsWith("approve")) {

    const orderId = data.split("_")[1];

    bot.sendMessage(chatId, `✅ Order Approved\nOrder ID: ${orderId}`);

  }

  if (data.startsWith("reject")) {

    const orderId = data.split("_")[1];

    bot.sendMessage(chatId, `❌ Order Rejected\nOrder ID: ${orderId}`);

  }

});


// function: app থেকে order পাঠানো
function sendOrder(orderId, amount, userId, chatId) {

  bot.sendMessage(chatId,

`📦 New Order

Order ID: ${orderId}
User ID: ${userId}
Amount: ${amount}

Approve or Reject?`,

{
reply_markup: {
inline_keyboard: [
[
{ text: "✅ Approve", callback_data: `approve_${orderId}` },
{ text: "❌ Reject", callback_data: `reject_${orderId}` }
]
]
}
});

}


// test order (৫ সেকেন্ড পরে পাঠাবে)
setTimeout(() => {

sendOrder("12345","100","USER001","6807603208");

},5000);
