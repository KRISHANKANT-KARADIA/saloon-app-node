// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   mobile: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['owner', 'customer'],
//     default: 'customer'
//   },
//   // 🧑 Owner-specific fields (optional if role === 'owner')
//   name: { type: String, trim: true }, // person name
//   gender: { type: String, enum: ['male', 'female', 'other'] },
//   saloonName: { type: String, trim: true },
//   ownerName: { type: String, trim: true },
//   logo: { type: String } // store image URL or filename
// }, { timestamps: true });

// export default mongoose.model('User', userSchema);


// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   mobile: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['owner', 'customer', 'user'],
//     default: 'user'
//   },
//   name: String,
//   gender: String,
//   saloonName: String,
//   ownerName: String,
//   logo: String,

//   // 🆕 Add this field
//   lastTokenIssuedAt: {
//     type: Date,
//     default: null
//   }

// }, { timestamps: true });

// export default mongoose.model('User', userSchema);

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





