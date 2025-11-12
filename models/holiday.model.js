import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
  saloon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Saloon',
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

export default mongoose.model('Holiday', holidaySchema);
