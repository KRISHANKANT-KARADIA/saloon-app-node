import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
  title: { type: String, required: true },
  description: { type: String },
  discount_type: { type: String, enum: ["percent", "fixed"], default: "percent" },
  discount_value: { type: Number, required: true },
  min_order_value: { type: Number, default: 0 },
  valid_from: { type: Date, required: true },
  valid_until: { type: Date, required: true },
  max_uses: { type: Number, default: 100 },
  max_uses_per_user: { type: Number, default: 1 },
  applicable_services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Offer", offerSchema);
