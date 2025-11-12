import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },  // e.g. 'saloonId'
  seq: { type: Number, default: 0 }
});

export default mongoose.model('Counter', counterSchema);
