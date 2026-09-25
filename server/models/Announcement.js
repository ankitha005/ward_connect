import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  img: { type: String },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Announcement = mongoose.model("Announcement", announcementSchema);
