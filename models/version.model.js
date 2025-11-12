import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema(
  {
    version: { type: String, required: true },
    platform: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Version = mongoose.model('Version', versionSchema);
