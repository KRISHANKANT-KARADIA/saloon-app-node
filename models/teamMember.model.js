import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  saloon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Saloon',
    required: true,
  },
  profile: String,  
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  services: [String],  
  startTime: String, 
  endTime: String,     
  workingDays: [String],  
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
