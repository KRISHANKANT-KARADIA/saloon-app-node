import admin from "./controllers/firebase.js";

const testToken = "fCKrSnFGQceCgdy8n7P1PN:APA91bHsWieeIm0ZBv9wI-MTKMdiy4p8qudcMdcsmkM1YRfR-uogCvUuVYqJa7IeBNWCAdz1I3ksAIUv4YC3-XkjjesXR9d2xIRDoTUaKl7lMqKfS6RJEns";

const message = {
  notification: {
    title: "Firebase Test",
    body: "Your Firebase integration is working 🎉",
  },
  token: testToken,
};

const sendTest = async () => {
  try {
    const response = await admin.messaging().send(message);
    console.log("🔥 Notification Sent:", response);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

sendTest();
