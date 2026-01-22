import mongoose from 'mongoose';


const ImageSchema = new mongoose.Schema({
  id: { type: String, required: true },     
  path: { type: String, required: true }  
});

const saloonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  images: [ImageSchema],                     
  ownerName: { type: String, required: true },
  mobile: { type: String, required: true },
 salonType: {
    type: String,
    enum: ["men", "women", "unisex","everyone"], // optional
    required: true
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },

  operatingHours: {
    openTime: { type: String },
    closeTime: { type: String },
    workingDays: [
      {
        day: { type: String, required: true },
        openTime: { type: String, required: true },
        closeTime: { type: String, required: true }
      }
    ]
  },
   bookingsCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
   rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  isTrending: { type: Boolean, default: false },

  socialLinks: {
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    whatsapp: { type: String, trim: true }
  }
}, { timestamps: true });

export default mongoose.model('Saloon', saloonSchema);

