import admin from "./firebase.js";
import { notificationModel } from "../../models/notification.model.js";

export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data: {
      ...data,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    return response;
  } catch (err) {
    console.error("❌ Failed to send notification:", err.message);
    throw err;
  }
};

/**
 * Send push notification to multiple FCM tokens
 * @param {Array<string>} fcmTokens - List of device tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Custom data payload (optional)
 */

export const sendPushNotificationToMultiple = async (fcmTokens, title, body, data = {}) => {
  if (!fcmTokens || fcmTokens.length === 0) {
    console.warn("⚠️ No FCM tokens provided");
    return null;
  }

  const message = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    ),
    tokens: fcmTokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    // const response = await admin.messaging().sendMulticast(message);
    console.log("✅ Push notification sent:", response);
    // Store in DB
    const savedNotification = await notificationModel.create({
      title,
      body,
      data,
      tokens: fcmTokens,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
      type: data.type,
      userId: data.userId,
      image: data?.image
    });
    return { response, savedNotification };
  } catch (err) {
    console.error("❌ Failed to send multicast notification:", err.message);
    throw err;
  }
};
