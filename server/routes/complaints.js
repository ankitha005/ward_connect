import express from 'express';
import { Complaint } from '../models/Complaint.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Generate an ID similar to how the store did it
    const ward = req.body.ward;
    const count = await Complaint.countDocuments({ ward });
    const prefix = ward ? ward.slice(0, 3).toUpperCase() : 'BLR';
    const year = new Date().getFullYear();
    const vid = req.body.voterId.toUpperCase().replace(/\s/g, '');
    const voterCode = (vid.slice(0, 3) + vid.slice(-3)).padEnd(6, '0');
    const seq = String(count + 1).padStart(5, '0');
    const id = `${prefix}-${year}-${voterCode}-${seq}`;

    const newComplaint = new Complaint({
      ...req.body,
      id,
      statusHistory: [{ status: 'Pending', note: 'Complaint registered successfully.' }]
    });

    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Admin only: update status
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status, note, afterPhotoData } = req.body;
    const complaint = await Complaint.findOne({ id: req.params.id });
    
    if (!complaint) return res.status(404).json({ error: 'Not found' });

    complaint.status = status;
    complaint.statusHistory.push({ status, note });
    
    if (afterPhotoData) {
      complaint.afterPhotoData = afterPhotoData;
    }

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;
