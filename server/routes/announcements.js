import express from 'express';
import { Announcement } from '../models/Announcement.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newAnnouncement = new Announcement({
      ...req.body,
      id: `ann-${Date.now()}`
    });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.put('/:id/like', async (req, res) => {
  try {
    const ann = await Announcement.findOne({ id: req.params.id });
    if (!ann) return res.status(404).json({ error: 'Not found' });
    
    ann.likes += 1;
    await ann.save();
    res.json(ann);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Announcement.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
