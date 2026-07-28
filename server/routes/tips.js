const express = require('express');
const mongoose = require('mongoose');
const Tip = require('../models/Tip');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const rl = createRateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: 'Too many tip requests' });

// Public: get published tips
router.get('/', rl, async (req, res, next) => {
  try {
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 20);
    const tips = await Tip.find(filter).sort({ order: 1, createdAt: -1 }).limit(limit);
    res.json({ success: true, tips });
  } catch (e) { next(e); }
});

// Admin: all tips
router.get('/all', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const tips = await Tip.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, tips });
  } catch (e) { next(e); }
});

// Admin: create
router.post('/', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const tip = await Tip.create(req.body);
    res.status(201).json({ success: true, tip });
  } catch (e) { next(e); }
});

// Admin: update
router.put('/:id', rl, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    const tip = await Tip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });
    res.json({ success: true, tip });
  } catch (e) { next(e); }
});

// Admin: delete
router.delete('/:id', rl, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    await Tip.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tip deleted' });
  } catch (e) { next(e); }
});

module.exports = router;

