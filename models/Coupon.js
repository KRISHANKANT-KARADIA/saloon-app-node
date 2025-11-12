import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    discount_type: {
      type: String,
      enum: ['percent', 'fixed'],
      required: true
    },
    discount_value: { type: Number, required: true },
    min_order_value: { type: Number, default: 0 },
    valid_from: { type: Date, required: true },
    valid_until: { type: Date, required: true },
    max_uses: { type: Number },
    uses: { type: Number, default: 0 },
    max_uses_per_user: { type: Number },
    users_used: {
      type: Map,
      of: Number,
      default: {}
    },
    applicable_services: [{ type: String }],
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
