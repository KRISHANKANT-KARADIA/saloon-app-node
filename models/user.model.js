
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  role: { type: String, default: 'owner' },
  otp: String,
  otpExpiresAt: Date,
  lastTokenIssuedAt: Date,
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);





