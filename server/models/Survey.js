import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  voterId: { type: String, required: true },
  priorities: [{ type: String }],
  safetyRating: { type: Number },
  feedback: { type: String },
  date: { type: Date, default: Date.now }
});

export const Survey = mongoose.model('Survey', surveySchema);
