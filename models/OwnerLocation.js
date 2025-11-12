import mongoose from 'mongoose';

const ownerLocationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  label: { type: String, default: 'Home' },
  address1: { type: String, required: true },
  address2: { type: String },
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
  pincode: { type: String, required: true },
  area: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  geoLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [long, lat]
  }
}, { timestamps: true });

ownerLocationSchema.index({ geoLocation: '2dsphere' });

export default mongoose.model('OwnerLocation', ownerLocationSchema);
