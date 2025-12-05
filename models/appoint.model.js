import mongoose from 'mongoose';

function generateBookingRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const appointSchema = new mongoose.Schema({
  customer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    mobile: { type: String, required: true },
  },
  saloonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon', required: true },
  serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }],
  professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional' },
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
  bookingRef: { type: String, unique: true },
  notes: { type: String, trim: true }
}, { timestamps: true });

appointSchema.pre('save', async function (next) {
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

export default mongoose.model('Appoint', appointSchema);
