import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  saloon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Saloon',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: String, 
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  logo: {
    type: String 
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Service', serviceSchema);
