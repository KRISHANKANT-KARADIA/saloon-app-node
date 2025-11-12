// import mongoose from 'mongoose';

// const appointmentSchema = new mongoose.Schema({
//   customer: {
//     id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//     mobile: { type: String, required: true },
//   },
//   saloonId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Saloon',
//     required: true
//   },
//   serviceIds: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true
//     }
//   ],
//   professionalId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Professional',
//     required: true
//   },
//   date: {
//     type: String,
//     required: true
//   },
//   time: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed','completed', 'cancelled'],
//     default: 'pending'
//   },

//   // Additional Fields
//   discount: { type: Boolean, default: false },
//   discountCode: { type: String },
//   discountAmount: { type: Number },
//   discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCode' },

//   cardName: { type: String },
//   cardNumber: { type: String },
//   expiryDate: { type: String }, // MM/YY
//   securityPin: { type: String },

// }, { timestamps: true });

// export default mongoose.model('Appointment', appointmentSchema);


// import mongoose from 'mongoose';
// import '../models/professional.model.js';  //
// const appointmentSchema = new mongoose.Schema({
//   customer: {
//     id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//     mobile: { type: String, required: true },
//   },
//   saloonId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Saloon',
//     required: true
//   },
//   serviceIds: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true
//     }
//   ],
//   professionalId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Professional',
//     required: true
//   },
//   date: {
//     type: String,
//     required: true
//   },
//   time: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'completed', 'cancelled'],
//     default: 'pending'
//   },

//     notes: { type: String, trim: true },
//   // Additional Fields
//   discount: { type: Boolean, default: false },
//   discountCode: { type: String },
//   discountAmount: { type: Number },
//   discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCode' },

//   cardName: { type: String },
//   cardNumber: { type: String },
//   expiryDate: { type: String }, // MM/YY
//   securityPin: { type: String },

// }, { timestamps: true });

// export default mongoose.model('Appointment', appointmentSchema);


// import mongoose from 'mongoose';
// import '../models/professional.model.js'; // Make sure professional model is registered

// // Utility function to generate booking reference
// function generateBookingRef() {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let result = '';
//   for (let i = 0; i < 8; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return result;
// }

// const appointmentSchema = new mongoose.Schema({
//   customer: {
//     id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//     mobile: { type: String, required: true },
//   },
//   saloonId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Saloon',
//     required: true
//   },
//   serviceIds: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true
//     }
//   ],
//   professionalId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Professional',
//     required: true
//   },
//   date: {
//     type: String,
//     required: true
//   },
//   time: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'completed', 'cancelled'],
//     default: 'pending'
//   },

//   discount: { type: Boolean, default: false },
//   discountCode: { type: String },
//   discountAmount: { type: Number },
//   discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCode' },

//   cardName: { type: String },
//   cardNumber: { type: String },
//   expiryDate: { type: String }, // MM/YY
//   securityPin: { type: String },

//   // ✅ New fields
//   notes: { type: String, trim: true },
//   bookingRef: { type: String, unique: true }

// }, { timestamps: true });

// // ✅ Automatically generate bookingRef if not set
// appointmentSchema.pre('save', async function (next) {
//   if (!this.bookingRef) {
//     let ref;
//     let exists = true;
//     while (exists) {
//       ref = generateBookingRef();
//       const existing = await mongoose.models.Appointment.findOne({ bookingRef: ref });
//       exists = !!existing;
//     }
//     this.bookingRef = ref;
//   }
//   next();
// });

// export default mongoose.model('Appointment', appointmentSchema);






// import mongoose from 'mongoose';
// import '../models/professional.model.js'; // Ensure the model is registered

// // Utility: Generate random booking reference
// function generateBookingRef() {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let result = '';
//   for (let i = 0; i < 8; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return result;
// }

// const appointmentSchema = new mongoose.Schema(
//   {
//     customer: {
//       id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//       mobile: { type: String, required: true },
//     },
//     saloonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon', required: true },
//     serviceIds: [
//       { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }
//     ],
//     professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
//     date: { type: String, required: true },
//     time: { type: String, required: true },
//        duration: { type: String },
//     price: { type: String, required: true },
//     status: {
//       type: String,
//       enum: ['pending','accepted', 'confirmed', 'completed', 'cancelled', 'Reschedule','schedule'],
//       default: 'pending',
//     },
//     discount: { type: Boolean, default: false },
//     discountCode: { type: String },
//     discountAmount: { type: Number },
//     discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCode' },
//     cardstatus: { type: Boolean, default: false },
//     cardName: { type: String },
//     cardNumber: { type: String },
//     expiryDate: { type: String }, // MM/YY
//     securityPin: { type: String },
//     notes: { type: String, trim: true },
//     bookingRef: { type: String, unique: true }
//   },
//   { timestamps: true }
// );

// // Generate unique bookingRef before saving
// appointmentSchema.pre('save', async function (next) {
//   if (!this.bookingRef) {
//     let ref;
//     let exists = true;
//     while (exists) {
//       ref = generateBookingRef();
//       const existing = await mongoose.models.Appointment.findOne({ bookingRef: ref });
//       exists = !!existing;
//     }
//     this.bookingRef = ref;
//   }
//   next();
// });

// export default mongoose.model('Appointment', appointmentSchema);


import mongoose from 'mongoose';
import '../models/professional.model.js'; // ensure Professional model exists

function generateBookingRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const appointmentSchema = new mongoose.Schema({
  customer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    mobile: { type: String, required: true },
  },
  saloonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon', required: true },
  serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }],
  professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String },
  price: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending','accepted','confirmed','completed','cancelled','Reschedule','schedule'],
    default: 'pending',
  },
  discount: { type: Boolean, default: false },
  discountCode: { type: String },
  discountAmount: { type: Number },
  discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCode' },
  cardstatus: { type: Boolean, default: false },
  cardName: { type: String },
  cardNumber: { type: String },
  expiryDate: { type: String },
  securityPin: { type: String },
  notes: { type: String, trim: true },
  bookingRef: { type: String, unique: true }
}, { timestamps: true });

appointmentSchema.pre('save', async function (next) {
  if (!this.bookingRef) {
    let ref, exists = true;
    while (exists) {
      ref = generateBookingRef();
      exists = !!(await mongoose.models.Appointment.findOne({ bookingRef: ref }));
    }
    this.bookingRef = ref;
  }
  next();
});

export default mongoose.model('Appointment', appointmentSchema);





//  Ye neeche wala used bhi kar sakte hao

// import mongoose from 'mongoose';
// import '../models/professional.model.js'; // Ensure the model is registered

// // Utility: Generate random booking reference
// function generateBookingRef() {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let result = '';
//   for (let i = 0; i < 8; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return result;
// }

// const appointmentSchema = new mongoose.Schema({
//   customer: {
//     id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//     mobile: { type: String, required: true },
//   },
//   saloonId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Saloon',
//     required: true
//   },
//   serviceIds: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true
//     }
//   ],
//   professionalId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Professional',
//     required: true
//   },
//   date: {
//     type: String,
//     required: true
//   },
//   time: {
//     type: String,
//     required: true
//   },
//    price: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'completed', 'cancelled','Reschedule'],
//     default: 'pending'
//   },

//   // Optional fields
//   discount: { type: Boolean, default: false },
//   discountCode: { type: String },
//   discountAmount: { type: Number },
//   discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCode' },

//    cardstatus: { type: Boolean, default: false },
//   cardName: { type: String },
//   cardNumber: { type: String },
//   expiryDate: { type: String }, // MM/YY
//   securityPin: { type: String },

//   notes: { type: String, trim: true }, // ✅ User notes
//   bookingRef: { type: String, unique: true } // ✅ Auto-generated reference

// }, { timestamps: true });

// // ✅ Generate unique bookingRef before save
// appointmentSchema.pre('save', async function (next) {
//   if (!this.bookingRef) {
//     let ref;
//     let exists = true;
//     while (exists) {
//       ref = generateBookingRef();
//       const existing = await mongoose.models.Appointment.findOne({ bookingRef: ref });
//       exists = !!existing;
//     }
//     this.bookingRef = ref;
//   }
//   next();
// });

// export default mongoose.model('Appointment', appointmentSchema);
