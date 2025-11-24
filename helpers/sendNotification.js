import admin from "../controllers/firebas.js";


export const sendNotification = async (token, title, body, data = {}) => {
    if (!token) return;

    const message = {
        notification: { title, body },
        data,
        token,
    };

    try {
        await admin.messaging().send(message);
        console.log("Notification sent successfully");
    } catch (err) {
        console.error("FCM Error:", err);
    }
};