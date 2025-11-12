import mongoose from 'mongoose';

// Schema for each image
const ImageSchema = new mongoose.Schema({
  id: { type: String, required: true },     // Unique ID for deletion
  path: { type: String, required: true }    // File path
});

const saloonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  images: [ImageSchema],                     // <- use the ImageSchema here
  ownerName: { type: String, required: true },
  mobile: { type: String, required: true },
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



// import mongoose from 'mongoose';

// const saloonSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   logo: { type: String },
//   images: [String],
//   ownerName: { type: String, required: true },
//   mobile: { type: String, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },

//   operatingHours: {
//     openTime: { type: String },
//     closeTime: { type: String },
//     workingDays: [
//       {
//         day: { type: String, required: true },
//         openTime: { type: String, required: true },
//         closeTime: { type: String, required: true }
//       }
//     ]
//   },

//   socialLinks: {
//     instagram: { type: String, trim: true },
//     facebook: { type: String, trim: true },
//     twitter: { type: String, trim: true },
//     linkedin: { type: String, trim: true },
//     whatsapp: { type: String, trim: true }
//   }
// }, { timestamps: true });

// export default mongoose.model('Saloon', saloonSchema);



// import mongoose from 'mongoose';

// const saloonSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   logo: { type: String },
//   images: [String],  
//   ownerName: { type: String, required: true },
//   mobile: { type: String, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
//    operatingHours:{
//     openTime: { type: String },     
//     closeTime: { type: String },        
//     workingDays: [{ type: String }]     
//   },
//   socialLinks: {
//     instagram: { type: String, trim: true },
//     facebook: { type: String, trim: true },
//     twitter: { type: String, trim: true },
//     linkedin: { type: String, trim: true },
//     whatsapp: { type: String, trim: true }
//   }
// }, 



// {
//   timestamps: true,
// });

// export default mongoose.model('Saloon', saloonSchema);
