// models/otp.model.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: "5m" }, 
  },
}, { timestamps: true });

export default mongoose.model("Otp", otpSchema);
