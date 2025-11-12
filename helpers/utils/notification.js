import Notification from "../../models/Notification.js";

export const createNotification = async (saloonId, type, message, meta = {}) => {
  try {
    await Notification.create({
      saloonId,
      type,
      message,
      meta,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};
