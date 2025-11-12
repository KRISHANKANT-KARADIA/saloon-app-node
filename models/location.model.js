import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  // Link to owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  // Optional Saloon reference for future profile
  saloon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Saloon',
  },
  address1: { type: String, required: true },
  address2: { type: String },
  lat: { type: Number },
  long: { type: Number },
  pincode: { type: String, required: true },
  area: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  
   mapLink: { type: String, trim: true },

  // GeoJSON field
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },

  status: { type: String, enum: ['active', 'inactive'], default: 'active' }

}, {
  timestamps: true,
});

// 2dsphere index for geospatial queries
locationSchema.index({ geoLocation: '2dsphere' });

export default mongoose.model('Location', locationSchema);
