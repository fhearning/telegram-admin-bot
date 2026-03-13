const TelegramBot = require("node-telegram-bot-api");
const admin = require("firebase-admin");

// Telegram bot token
const token = "8373169221:AAF-S1LiNMD4WLplJPj0d5BNSYaXBlzD9uA";

// Admin chat id
const ADMIN_CHAT_ID = "6807603208";

// Firebase key
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const bot = new TelegramBot(token, { polling: true });

console.log("Bot running...");


// ================= ORDER DETECT =================
db.collection("orders")
.where("status","==","pending")
.onSnapshot((snapshot)=>{

snapshot.docChanges().forEach((change)=>{

if(change.type==="added"){

const data = change.doc.data();
const orderId = change.doc.id;

bot.sendMessage(
ADMIN_CHAT_ID,

`📦 NEW ORDER

User: ${data.userName}
Player ID: ${data.playerId}
Product: ${data.productName}
Price: ${data.price}`,

{
reply_markup:{
inline_keyboard:[
[
{ text:"✅ Approve", callback_data:`order_success_${orderId}` },
{ text:"❌ Reject", callback_data:`order_reject_${orderId}` }
]
]
}
}
);

}

});

});


// ================= DEPOSIT DETECT =================
db.collection("deposits")
.where("status","==","pending")
.onSnapshot((snapshot)=>{

snapshot.docChanges().forEach((change)=>{

if(change.type==="added"){

const data = change.doc.data();
const depId = change.doc.id;

bot.sendMessage(
ADMIN_CHAT_ID,

`💰 NEW DEPOSIT

Amount: ${data.amount}
Method: ${data.method}
TrxID: ${data.trxId}`,

{
reply_markup:{
inline_keyboard:[
[
{ text:"✅ Approve", callback_data:`deposit_success_${depId}` },
{ text:"❌ Reject", callback_data:`deposit_reject_${depId}` }
]
]
}
}
);

}

});

});


// ================= BUTTON HANDLE =================
bot.on("callback_query", async (query)=>{

const data = query.data;
const chatId = query.message.chat.id;


// ---------- ORDER APPROVE ----------
if(data.startsWith("order_success")){

const orderId = data.split("_")[2];

await db.collection("orders").doc(orderId).update({
status:"success"
});

bot.sendMessage(chatId,"✅ Order Approved");

}


// ---------- ORDER REJECT + REFUND ----------
if(data.startsWith("order_reject")){

const orderId = data.split("_")[2];

const orderDoc = await db.collection("orders").doc(orderId).get();
const orderData = orderDoc.data();

// refund balance
await db.collection("users").doc(orderData.userId).update({
balance: admin.firestore.FieldValue.increment(orderData.price)
});

await db.collection("orders").doc(orderId).update({
status:"rejected"
});

bot.sendMessage(chatId,"❌ Order Rejected & Refunded");

}


// ---------- DEPOSIT APPROVE ----------
if(data.startsWith("deposit_success")){

const depId = data.split("_")[2];

const depDoc = await db.collection("deposits").doc(depId).get();
const depData = depDoc.data();

await db.collection("users").doc(depData.userId).update({
balance: admin.firestore.FieldValue.increment(depData.amount)
});

await db.collection("deposits").doc(depId).update({
status:"approved"
});

bot.sendMessage(chatId,"💰 Deposit Approved");

}


// ---------- DEPOSIT REJECT ----------
if(data.startsWith("deposit_reject")){

const depId = data.split("_")[2];

await db.collection("deposits").doc(depId).update({
status:"rejected"
});

bot.sendMessage(chatId,"❌ Deposit Rejected");

}

});
