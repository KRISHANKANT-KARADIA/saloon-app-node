import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true }, 
  address1: { type: String, required: true },
  address2: { type: String, trim: true },
  pincode: { type: String, required: true },
  area: { type: String, trim: true },
  city: { type: String, required: true },
  state: { type: String, required: true },

 
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  }
}, { _id: false });


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

  addresses: [addressSchema],
   user_state_status: {
    type: Number,
    enum: [1, 2, 3, 4],
    default: 1 
  }

}, { timestamps: true });


export default mongoose.model('Customer', customerSchema);
