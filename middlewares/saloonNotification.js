import { createNotification } from "../helpers/utils/notification.js";
import ownerModel from "../models/owner.model.js";

export const saloonNotification = (req, res, next) => {
  res.on("finish", async () => {
    try {
      const ownerId = res.locals.user?.id;
      if (!ownerId) return;

      // ✅ Saloon find karo based on ownerId
      const saloon = await Saloon.findOne({ owner: ownerId });
      if (!saloon) {
        console.error("Saloon not found for owner:", ownerId);
        return;
      }

      const saloonId = saloon._id;

      // ✅ Notification message
      const message = `Operation ${req.method} ${req.originalUrl} performed`;

      await createNotification(saloonId, "saloon_event", message, {
        ownerId,
        saloonId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        body: req.body,
      });
    } catch (err) {
      console.error("Notification middleware error:", err.message);
    }
  });

  next();
};
