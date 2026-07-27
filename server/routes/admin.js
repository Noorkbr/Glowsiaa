const express = require('express');
const mongoose = require('mongoose');

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const deliveryCompanies = ['pathao', 'steadfast', 'redx'];
const adminRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: 'Too many admin requests, please try again later',
});

router.use(protect, adminOnly);

router.get('/stats', adminRateLimit, async (req, res, next) => {
  try {
    const [
      totalOrders,
      revenueResult,
      totalProducts,
      totalUsers,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments({ status: 'pending' }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('items.product'),
    ]);

    const stats = {
      totalOrders,
      totalRevenue: revenueResult[0] ? revenueResult[0].totalRevenue : 0,
      totalProducts,
      totalUsers,
      pendingOrders,
      recentOrders,
    };

    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
});

router.get('/revenue', adminRateLimit, async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
        },
      },
    ]);

    res.json({ success: true, revenue });
  } catch (error) {
    next(error);
  }
});

router.get('/orders', adminRateLimit, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('items.product');
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

router.post('/push-delivery', adminRateLimit, async (req, res, next) => {
  try {
    const orderId = typeof req.body.orderId === 'string' ? req.body.orderId.trim().toUpperCase() : '';
    const company = typeof req.body.company === 'string' ? req.body.company.trim().toLowerCase() : '';

    if (!orderId || !company) {
      return res.status(400).json({ success: false, message: 'orderId and company are required' });
    }

    if (!/^GLS-\d{6}$/.test(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid orderId format' });
    }

    if (!deliveryCompanies.includes(company)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery company' });
    }

    const order = await Order.findOne(mongoose.sanitizeFilter({ orderId }));

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const trackingNumber = `${company.toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`;

    order.trackingCompany = company;
    order.trackingNumber = trackingNumber;
    order.status = 'shipped';
    await order.save();

    res.json({ success: true, trackingNumber, order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
