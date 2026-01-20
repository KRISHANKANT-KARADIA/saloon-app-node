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
    coordinates: { type: [Number], required: true }, 
  }
}, { timestamps: true });


customerLocationSchema.index({ geoLocation: '2dsphere' });

export default mongoose.model('CustomerLocation', customerLocationSchema);
