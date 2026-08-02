const express = require('express');
const mongoose = require('mongoose');
const Banner = require('../models/Banner');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');
const sse = require('../services/sseManager');

const router = express.Router();
const rl = createRateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: 'Too many banner requests' });

// Public: get active banners
router.get('/', rl, async (req, res, next) => {
  try {
    const type = req.query.type; // hero | promo | announcement
    const filter = { isActive: true };
    if (type) filter.type = type;
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (e) { next(e); }
});

// Admin: get all banners
router.get('/all', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (e) { next(e); }
});

// Admin: create banner
router.post('/', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    sse.broadcastEvent('banners', { action: 'create' });
    res.status(201).json({ success: true, banner });
  } catch (e) { next(e); }
});

// Admin: update banner
router.put('/:id', rl, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid ID' });

    // Strip immutable/internal fields that must never be updated
    const { _id, __v, createdAt, ...safeBody } = req.body;

    const banner = await Banner.findByIdAndUpdate(req.params.id, safeBody, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    sse.broadcastEvent('banners', { action: 'update' });
    res.json({ success: true, banner });
  } catch (e) { next(e); }
});

// Admin: delete banner
router.delete('/:id', rl, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    await Banner.findByIdAndDelete(req.params.id);
    sse.broadcastEvent('banners', { action: 'delete' });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (e) { next(e); }
});

module.exports = router;

