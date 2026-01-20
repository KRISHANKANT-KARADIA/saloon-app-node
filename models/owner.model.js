import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true  
  },
 
  role: {
    type: String,
    enum: ['owner'],
    default: 'owner'
  },
  name: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  saloonName: { type: String, trim: true },
  ownerName: { type: String, trim: true },
  logo: { type: String },
    fcmToken: String,

  otp: String,
  otpExpiresAt: Date,
  lastTokenIssuedAt: Date,
 owner_state_status: {
  type: Number,
  enum: [1, 2, 3, 4], 
  default: 1 
},
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
}, { timestamps: true });

export default mongoose.model('Owner', ownerSchema);
