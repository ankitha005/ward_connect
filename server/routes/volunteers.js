import express from 'express';
import { Volunteer } from '../models/Volunteer.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ date: -1 });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newVolunteer = new Volunteer({
      ...req.body,
      id: `VOL-${Date.now()}`
    });
    await newVolunteer.save();
    res.status(201).json(newVolunteer);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;
