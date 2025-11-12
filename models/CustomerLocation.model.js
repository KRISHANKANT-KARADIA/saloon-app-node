// // models/CustomerLocation.model.js
// import mongoose from 'mongoose';

// const customerLocationSchema = new mongoose.Schema({
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true,
//     unique: true, // one location per customer
//   },
//   address1: { type: String, required: true },
//   address2: { type: String },
//   lat: { type: Number },
//   long: { type: Number },
//   pincode: { type: String, required: true },
//   area: { type: String },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
// }, {
//   timestamps: true,
// });

// export default mongoose.model('CustomerLocation', customerLocationSchema);




// import mongoose from 'mongoose';

// const customerLocationSchema = new mongoose.Schema({
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true,
//   },
//   label: { type: String, trim: true },  // e.g., "Home", "Work"
//   address1: { type: String, required: true },
//   address2: { type: String },
//   lat: { type: Number },
//   long: { type: Number },
//   pincode: { type: String, required: true },
//   area: { type: String },
//   city: { type: String, required: true },
//   state: { type: String, required: true },

//   geoLocation: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//     },
//   },
// }, {
//   timestamps: true,
// });

// customerLocationSchema.index({ geoLocation: '2dsphere' });

// export default mongoose.model('CustomerLocation', customerLocationSchema);


// import mongoose from 'mongoose';

// const customerLocationSchema = new mongoose.Schema({
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true,
//     // ✅ DON'T use `unique: true` to allow multiple locations per customer
//   },
//   label: { type: String }, // e.g. Home, Work
//   address1: { type: String, required: true },
//   address2: { type: String },
//   lat: { type: Number },
//   long: { type: Number },
//   pincode: { type: String, required: true },
//   area: { type: String },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
//   geoLocation: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//     }
//   },
// }, {
//   timestamps: true,
// });

// customerLocationSchema.index({ geoLocation: '2dsphere' });

// export default mongoose.model('CustomerLocation', customerLocationSchema);


// import mongoose from 'mongoose';

// const customerLocationSchema = new mongoose.Schema({
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true,
//   },
//   label: { type: String }, // e.g. Home, Work, etc.
//   address1: { type: String, required: true },
//   address2: { type: String },
//   lat: { type: Number },
//   long: { type: Number },
//   pincode: { type: String, required: true },
//   area: { type: String },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
//   geoLocation: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//     }
//   }
// }, {
//   timestamps: true
// });

// customerLocationSchema.index({ geoLocation: '2dsphere' });

// export default mongoose.model('CustomerLocation', customerLocationSchema);


// models/CustomerLocation.model.js
// import mongoose from 'mongoose';

// const customerLocationSchema = new mongoose.Schema({
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true,
//   },
//   label: { type: String }, // e.g. Home, Work
//   address1: { type: String, required: true },
//   address2: { type: String },
//   lat: { type: Number },
//   long: { type: Number },
//   pincode: { type: String, required: true },
//   area: { type: String },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
//   geoLocation: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//     }
//   }
// }, {
//   timestamps: true
// });

// // 2dsphere index for geospatial queries
// customerLocationSchema.index({ geoLocation: '2dsphere' });

// export default mongoose.model('CustomerLocation', customerLocationSchema);


import mongoose from 'mongoose';

const customerLocationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer'},
  label: { type: String, trim: true, default: 'Home' },
  address1: { type: String, required: true },
  address2: { type: String, trim: true },
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
  pincode: { type: String, required: true },
  area: { type: String, trim: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  geoLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  }
}, { timestamps: true });

// 2dsphere index for geo queries
customerLocationSchema.index({ geoLocation: '2dsphere' });

export default mongoose.model('CustomerLocation', customerLocationSchema);
