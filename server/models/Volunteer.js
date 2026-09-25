import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  ward: { type: String, required: true },
  skills: [{ type: String }],
  availability: { type: String },
  date: { type: Date, default: Date.now },
});

export const Volunteer = mongoose.model("Volunteer", volunteerSchema);
