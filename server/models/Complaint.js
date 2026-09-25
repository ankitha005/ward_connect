import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // E.g. JYN-2026-ABC-00001
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  voterId: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  area: { type: String },
  ward: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  photoData: { type: String },
  afterPhotoData: { type: String },
  status: { type: String, default: "Pending" },
  upvotes: [{ type: String }], // Array of voterIds
  statusHistory: [
    {
      status: String,
      note: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const Complaint = mongoose.model("Complaint", complaintSchema);
