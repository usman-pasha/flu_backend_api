// import admin from "./firebase.js";

// export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
//     const message = {
//         token: fcmToken,
//         notification: { title, body },
//         data, // optional custom key-value data for Flutter
//     };

//     try {
//         const response = await admin.messaging().send(message);
//         console.log("✅ Notification sent:", response);
//     } catch (err) {
//         console.error("❌ Failed to send notification:", err.message);
//     }
// };
