// models/Comment.js
import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userAvatar: String,
  replyText: String,
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
  userId: String,
  userName: String,
  userAvatar: String,
  rating: Number,
  comment: String,
  service: String,
  images: [String],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  replies: [replySchema],
});

export default mongoose.model("Comment", commentSchema);
