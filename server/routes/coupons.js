const express = require('express');
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const rl = createRateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many coupon requests' });

// Public: validate coupon
router.post('/validate', rl, async (req, res, next) => {
  try {
    const code = typeof req.body.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    const orderTotal = Number(req.body.orderTotal) || 0;

    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    const coupon = await Coupon.findOne(mongoose.sanitizeFilter({ code, isActive: true }));
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

    const validity = coupon.isValid();
    if (!validity.valid) return res.status(400).json({ success: false, message: validity.reason });

    const discountAmount = Math.round(coupon.calculateDiscount(orderTotal));

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      discountAmount,
      finalTotal: Math.max(0, orderTotal - discountAmount),
    });
  } catch (e) { next(e); }
});

// Admin: list all coupons
router.get('/', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (e) { next(e); }
});

// Admin: create coupon
router.post('/', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (e) { next(e); }
});

// Admin: update coupon
router.put('/:id', rl, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid ID' });

    // Strip immutable/internal fields
    const { _id, __v, createdAt, ...safeBody } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, safeBody, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (e) { next(e); }
});

// Admin: delete coupon
router.delete('/:id', rl, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (e) { next(e); }
});

module.exports = router;

