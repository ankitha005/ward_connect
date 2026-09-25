import express from "express";
import { Survey } from "../models/Survey.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ date: -1 });
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newSurvey = new Survey({
      ...req.body,
      id: `SRV-${Date.now()}`,
    });
    await newSurvey.save();
    res.status(201).json(newSurvey);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
