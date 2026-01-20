// models/SaloonContent.js
import mongoose from 'mongoose';

const SaloonContentSchema = new mongoose.Schema({
  saloon: { type: mongoose.Schema.Types.ObjectId, ref: 'Saloon', required: true },
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SaloonContent', SaloonContentSchema);
