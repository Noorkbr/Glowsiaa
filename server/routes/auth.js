const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, matchedData, validationResult } = require('express-validator');

const User = require('../models/User');
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

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne(mongoose.sanitizeFilter({ email })).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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

module.exports = router;
