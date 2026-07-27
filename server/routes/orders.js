const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const orderRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: 'Too many order requests, please try again later',
});

const handleValidation = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }

  return true;
};

router.post(
  '/',
  orderRateLimit,
  [
    body('customer.name').trim().notEmpty().withMessage('Customer name is required'),
    body('customer.phone').matches(/^01[0-9]{9}$/).withMessage('Valid Bangladesh phone number is required'),
    body('customer.address').trim().notEmpty().withMessage('Customer address is required'),
    body('customer.location')
      .isIn(['inside_dhaka', 'outside_dhaka'])
      .withMessage('Customer location must be inside_dhaka or outside_dhaka'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Item price must be a positive number'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
    body('paymentMethod').optional().isIn(['cod', 'bkash', 'nagad']).withMessage('Invalid payment method'),
  ],
  async (req, res, next) => {
    try {
      if (!handleValidation(req, res)) {
        return;
      }

      const { customer, items, paymentMethod = 'cod', notes } = req.body;
      const normalizedItems = items.map((item) => ({
        product: item.product || undefined,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
      }));

      const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = customer.location === 'inside_dhaka' ? 60 : 120;
      const total = subtotal + deliveryFee;

      const order = await Order.create({
        customer,
        items: normalizedItems,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        notes,
        userId: req.user ? req.user._id : undefined,
      });

      res.status(201).json({ success: true, order });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', orderRateLimit, protect, adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product'),
      Order.countDocuments(),
    ]);

    res.json({ success: true, count: orders.length, total, orders });
  } catch (error) {
    next(error);
  }
});

router.get('/:orderId', orderRateLimit, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', orderRateLimit, protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
