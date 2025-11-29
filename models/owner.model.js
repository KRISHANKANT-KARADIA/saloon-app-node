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
    sparse: true   // ✅ Allows email to be optional
  },
<<<<<<< HEAD
 
=======

>>>>>>> 27573fe1304c5274a50b02fa6d39d7db0f9513f5
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
<<<<<<< HEAD
    fcmToken: String,
=======
>>>>>>> 27573fe1304c5274a50b02fa6d39d7db0f9513f5

  otp: String,
  otpExpiresAt: Date,
  lastTokenIssuedAt: Date,
<<<<<<< HEAD
 owner_state_status: {
  type: Number,
  enum: [1, 2, 3, 4], // extend as needed
  default: 1 // first-time users
},
=======
  owner_state_status: {
    type: Number,
    enum: [1, 2, 3, 4], // extend as needed
    default: 1 // first-time users
  },
  fcmToken: { type: String },
>>>>>>> 27573fe1304c5274a50b02fa6d39d7db0f9513f5
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
}, { timestamps: true });

export default mongoose.model('Owner', ownerSchema);
