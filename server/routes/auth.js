const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, matchedData, validationResult } = require('express-validator');

const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many authentication requests, please try again later',
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
  '/register',
  authRateLimit,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      if (!handleValidation(req, res)) {
        return;
      }

      const { name, email, password } = matchedData(req);
      const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : undefined;
      const existingUser = await User.findOne(mongoose.sanitizeFilter({ email }));

      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }

      const user = await User.create({ name, email, password, phone });
      const token = signToken(user);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/login', authRateLimit, async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;

    console.log(`POST /api/auth/login received: email=${email}, password=${password}`);

    if (!email || !password) {
      const message = 'Email and password are required';
      console.log(`Login error: ${message}`);
      return res.status(400).json({ success: false, message });
    }

    const user = await User.findOne(mongoose.sanitizeFilter({ email })).select('+password');

    console.log(`User found: ${user ? user.email : 'NOT FOUND'}`);

    const passwordMatches = user ? await user.matchPassword(password) : false;

    console.log(`Password comparison result: ${passwordMatches}`);

    if (!user || !passwordMatches) {
      const message = 'Invalid credentials';
      console.log(`Login error: ${message}`);
      return res.status(401).json({ success: false, message });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authRateLimit, protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get('/orders', authRateLimit, protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('orderId customer items subtotal deliveryFee total paymentMethod status trackingNumber trackingCompany notes createdAt');
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

router.put('/change-password', authRateLimit, protect, async (req, res, next) => {
  try {
    const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
