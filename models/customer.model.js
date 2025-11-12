// // models/customer.model.js
// import mongoose from 'mongoose';

// const customerSchema = new mongoose.Schema({
//   mobile: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['customer'],
//     default: 'customer'
//   },
//   name: { type: String, trim: true },
//   gender: { type: String, enum: ['male', 'female', 'other'] },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },

//   otp: String,
//   otpExpiresAt: Date,
//   lastTokenIssuedAt: Date

// }, 
// favouriteSaloonIds: [
//     { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon' }
//   ]
// ,

// { timestamps: true });

// export default mongoose.model('Customer', customerSchema);

// models/customer.model.js

// import mongoose from 'mongoose';

// const customerSchema = new mongoose.Schema({
//   mobile: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['customer'],
//     default: 'customer'
//   },
//   name: { type: String, trim: true },
//   gender: { type: String, enum: ['male', 'female', 'other'] },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },

//   otp: String,
//   otpExpiresAt: Date,
//   lastTokenIssuedAt: Date,

//   // Favourite saloons
//   favouriteSaloonIds: [
//     { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon' }
//   ]

// }, { timestamps: true });

// export default mongoose.model('Customer', customerSchema);





// import mongoose from 'mongoose';

// const customerSchema = new mongoose.Schema({
//   mobile: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['customer'],
//     default: 'customer'
//   },
//   name: { type: String, trim: true },
//   gender: { type: String, enum: ['male', 'female', 'other'] },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },

//   otp: String,
//   otpExpiresAt: Date,
//   lastTokenIssuedAt: Date,

//   // ✅ Correct placement inside schema object
//   favouriteSaloonIds: [
//     { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon' }
//   ]

// }, { timestamps: true });

// export default mongoose.model('Customer', customerSchema);




// import mongoose from 'mongoose';

// const customerSchema = new mongoose.Schema({
//   profileImage: {
//     type: String,  // URL or path of profile image
//     default: null,
//     trim: true
//   },
//   mobile: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     trim: true,
//     unique: true,
//     sparse: true // allows email to be optional but unique if present
//   },
//   name: { 
//     type: String, 
//     trim: true,
//     required: true
//   },
//   dob: {
//     type: Date,
//     required: false
//   },
//   gender: { 
//     type: String, 
//     enum: ['male', 'female', 'other'] 
//   },
//   role: {
//     type: String,
//     enum: ['customer'],
//     default: 'customer'
//   },
//   status: { 
//     type: String, 
//     enum: ['active', 'inactive'], 
//     default: 'active' 
//   },

//   otp: String,
//   otpExpiresAt: Date,
//   lastTokenIssuedAt: Date,

//   // Favourite saloons
//   favouriteSaloonIds: [
//     { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon' }
//   ]

// }, { timestamps: true });

// export default mongoose.model('Customer', customerSchema);



// import mongoose from 'mongoose';

// const addressSchema = new mongoose.Schema({
//   label: { type: String, trim: true },       // e.g., Home, Work
//   addressLine1: { type: String, required: true },
//   addressLine2: { type: String, trim: true },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
//   postalCode: { type: String, required: true },
//   country: { type: String, required: true },
//   phoneNumber: { type: String, trim: true }, // Optional, alternative phone for address
// });

// const customerSchema = new mongoose.Schema({
//   mobile: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['customer'],
//     default: 'customer'
//   },
//   name: { type: String, trim: true },
//   email: { type: String, trim: true },
//   dob: { type: Date },
//   gender: { type: String, enum: ['male', 'female', 'other'] },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },

//   otp: String,
//   otpExpiresAt: Date,
//   lastTokenIssuedAt: Date,

//   profileImage: { type: String }, // URL or filename for profile image

//   favouriteSaloonIds: [
//     { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon' }
//   ],

//   addresses: [addressSchema] // <-- Array of addresses

// }, { timestamps: true });

// export default mongoose.model('Customer', customerSchema);



import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true },  // e.g., Home, Work
  address1: { type: String, required: true },
  address2: { type: String, trim: true },
  pincode: { type: String, required: true },
  area: { type: String, trim: true },
  city: { type: String, required: true },
  state: { type: String, required: true },

  // GeoJSON location
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { _id: false });

// Create 2dsphere index on embedded geoLocation for querying
addressSchema.index({ geoLocation: '2dsphere' });

const customerSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer'],
    default: 'customer'
  },
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  dob: { type: Date },
 
  gender: { type: String, enum: ['male', 'female', 'other'] },
status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  otp: String,
  otpExpiresAt: Date,
  lastTokenIssuedAt: Date,

  profileImage: { type: String },
country: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Country',
},
  favouriteSaloonIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon' }
  ],

  // Array of multiple addresses with geo location
  addresses: [addressSchema],
   user_state_status: {
    type: Number,
    enum: [1, 2, 3, 4], // You can extend as needed
    default: 1 // First-time users
  }

}, { timestamps: true });

// If you want to query addresses by geo, you can do:
// customerSchema.index({ "addresses.geoLocation": "2dsphere" });

export default mongoose.model('Customer', customerSchema);
