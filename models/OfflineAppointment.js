import mongoose from 'mongoose';

const offlineAppointmentSchema = new mongoose.Schema({
    saloonId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Saloon' },
   
    customerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Service' },
    serviceName: { type: String, required: true },
    teamMemberId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'TeamMember' },
    teamMemberName: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    notes: { type: String },
    mode: { type: String, default: 'offline' },
    status: { type: String, default: 'pending' },
      expireAt: {
    type: Date,
    index: true,
  }
}, { timestamps: true });

export default mongoose.model('OfflineAppointment', offlineAppointmentSchema);
