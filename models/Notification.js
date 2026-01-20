import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  saloonId: { type: mongoose.Schema.Types.ObjectId, ref: "Saloon", required: true },
  type: { type: String, required: true }, 
  message: { type: String, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
