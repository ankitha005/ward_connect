import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  citizen: {
    name: { type: String, required: true },
    ward: { type: String, required: true },
  },
  responses: {
    roadQuality: { type: String },
    safety: { type: String },
    priorityArea: { type: String },
  },
  date: { type: Date, default: Date.now },
});

export const Survey = mongoose.model("Survey", surveySchema);
