const express = require('express');
const mongoose = require('mongoose');

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');
const { pushOrderToDelivery, getSteadfastBalance } = require('../services/delivery');

const router = express.Router();
const deliveryCompanies = ['pathao', 'steadfast', 'redx'];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({ success: true, stats: { ...stats, ordersByStatus: statusMap } });
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

router.get('/users', adminRateLimit, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const skip = (page - 1) * limit;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    let filter = { role: 'user' };
    if (search) {
      const safeSearch = new RegExp(escapeRegex(search), 'i');
      filter = { role: 'user', $or: [{ name: safeSearch }, { email: safeSearch }, { phone: safeSearch }] };
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, total, page, limit });
  } catch (error) {
    next(error);
  }
});

router.post('/push-delivery', adminRateLimit, async (req, res, next) => {
  try {
    const orderId = typeof req.body.orderId === 'string' ? req.body.orderId.trim().toUpperCase() : '';
    const company = typeof req.body.company === 'string' ? req.body.company.trim().toLowerCase() : '';
    const useRealApi = req.body.useRealApi === true;

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
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    let trackingNumber;
    let apiResult = null;

    if (useRealApi) {
      // Try real delivery API
      try {
        const result = await pushOrderToDelivery(order, company, req.body.options || {});
        trackingNumber = result.trackingCode || result.trackingId || result.consignmentId || `${company.toUpperCase()}${Date.now()}`;
        apiResult = result;
      } catch (apiError) {
        return res.status(502).json({
          success: false,
          message: `Delivery API error: ${apiError.message}`,
          company,
        });
      }
    } else {
      // Simulated tracking number
      trackingNumber = `${company.toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    order.trackingCompany = company;
    order.trackingNumber = trackingNumber;
    order.status = 'shipped';
    await order.save();

    res.json({ success: true, trackingNumber, order, apiResult });
  } catch (error) {
    next(error);
  }
});

// Delivery partner balance / health check
router.get('/delivery/balance', adminRateLimit, async (req, res, next) => {
  try {
    if (!process.env.STEADFAST_API_KEY) {
      return res.json({ success: false, message: 'Steadfast API key not configured' });
    }
    const balance = await getSteadfastBalance();
    res.json({ success: true, balance });
  } catch (e) { next(e); }
});

module.exports = router;
