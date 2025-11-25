
import admin from './controllers/firebase.js';
const fcmToken = "fCKrSnFGQceCgdy8n7P1PN:APA91bHsWieeIm0ZBv9wI-MTKMdiy4p8qudcMdcsmkM1YRfR-uogCvUuVYqJa7IeBNWCAdz1I3ksAIUv4YC3-XkjjesXR9d2xIRDoTUaKl7lMqKfS6RJEns";

const message = {
  notification: {
    title: "Test Notification",
    body: "Firebase integration is working ✅",
  },
  token: fcmToken,
};

const sendTestNotification = async () => {
  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

sendTestNotification();
