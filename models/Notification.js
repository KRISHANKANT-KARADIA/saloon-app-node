import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  saloonId: { type: mongoose.Schema.Types.ObjectId, ref: "Saloon", required: true },
  type: { type: String, required: true }, // e.g., appointment_created, team_member_updated
  message: { type: String, required: true },
  meta: { type: Object, default: {} }, // extra data (appointmentId, memberId etc.)
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
