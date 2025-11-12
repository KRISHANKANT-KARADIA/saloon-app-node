import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  saloon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Saloon',
    required: true,
  },
  profile: String,  // profile image URL/path
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
  services: [String],  // list of services
  startTime: String,   // e.g. "09:00"
  endTime: String,     // e.g. "17:00"
  workingDays: [String],  // e.g. ["Monday", "Tuesday"]
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
