const TelegramBot = require("node-telegram-bot-api");
const admin = require("firebase-admin");

// Telegram bot token
const token = "8373169221:AAF-S1LiNMD4WLplJPj0d5BNSYaXBlzD9uA";

// Admin chat id
const ADMIN_CHAT_ID = "6807603208";

// Firebase service account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const bot = new TelegramBot(token, { polling: true });

console.log("Bot running...");


// BUTTON CLICK
bot.on("callback_query", async (query) => {

  const data = query.data;
  const chatId = query.message.chat.id;

  console.log("Button:", data);

  // ---------- ORDER APPROVE ----------
  if (data.startsWith("order_success")) {

    const orderId = data.split("_")[2];

    await db.collection("orders").doc(orderId).update({
      status: "success"
    });

    bot.sendMessage(chatId, "✅ Order Approved");
  }


  // ---------- ORDER REJECT ----------
  if (data.startsWith("order_reject")) {

    const orderId = data.split("_")[2];

    await db.collection("orders").doc(orderId).update({
      status: "rejected"
    });

    bot.sendMessage(chatId, "❌ Order Rejected");
  }


  // ---------- DEPOSIT APPROVE ----------
  if (data.startsWith("deposit_success")) {

    const depositId = data.split("_")[2];

    const depDoc = await db.collection("deposits").doc(depositId).get();
    const depData = depDoc.data();

    await db.collection("users").doc(depData.userId).update({
      balance: admin.firestore.FieldValue.increment(depData.amount)
    });

    await db.collection("deposits").doc(depositId).update({
      status: "approved"
    });

    bot.sendMessage(chatId, "💰 Deposit Approved");
  }


  // ---------- DEPOSIT REJECT ----------
  if (data.startsWith("deposit_reject")) {

    const depositId = data.split("_")[2];

    await db.collection("deposits").doc(depositId).update({
      status: "rejected"
    });

    bot.sendMessage(chatId, "❌ Deposit Rejected");
  }

});



// ---------- SEND ORDER ----------
async function sendOrder(orderId, price, userId) {

  bot.sendMessage(ADMIN_CHAT_ID,

`📦 NEW ORDER

Order ID: ${orderId}
User: ${userId}
Price: ${price}`,

{
reply_markup:{
inline_keyboard:[
[
{ text:"✅ Approve", callback_data:`order_success_${orderId}` },
{ text:"❌ Reject", callback_data:`order_reject_${orderId}` }
]
]
}
});

}


// ---------- SEND DEPOSIT ----------
async function sendDeposit(depositId, amount, userId) {

  bot.sendMessage(ADMIN_CHAT_ID,

`💰 NEW DEPOSIT REQUEST

Deposit ID: ${depositId}
User: ${userId}
Amount: ${amount}`,

{
reply_markup:{
inline_keyboard:[
[
{ text:"✅ Approve", callback_data:`deposit_success_${depositId}` },
{ text:"❌ Reject", callback_data:`deposit_reject_${depositId}` }
]
]
}
});

}  }

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
