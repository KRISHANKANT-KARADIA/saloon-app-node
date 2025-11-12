// models/professional.model.js
import mongoose from 'mongoose';

const professionalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // other fields as needed
}, { timestamps: true });

export default mongoose.model('Professional', professionalSchema);
