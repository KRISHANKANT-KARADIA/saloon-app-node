import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  saloon: { type: mongoose.Schema.Types.ObjectId, ref: "Saloon", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String },
  userProfile: { type: String },
  rating: { type: Number, required: true },
  comment: { type: String },
  replies: [
    {
      replyBy: { type: String, default: "Saloon" }, // e.g., salon name
      replyComment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });




export default mongoose.model("Review", reviewSchema);
