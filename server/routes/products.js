const express = require('express');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const productRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many product requests, please try again later',
});
const pickProductFields = (input) => {
  const allowedFields = [
    'name', 'description', 'price', 'comparePrice', 'category', 'subCategory',
    'stock', 'images', 'badge', 'discount', 'rating', 'reviewCount', 'isFeatured',
  ];

  return allowedFields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      payload[field] = input[field];
    }

    return payload;
  }, {});
};

router.get('/', productRateLimit, async (req, res, next) => {
  try {
    const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const categoryFilter = typeof req.query.category === 'string' ? req.query.category.toLowerCase() : '';
    const subCategoryFilter = typeof req.query.subCategory === 'string' ? req.query.subCategory.toLowerCase() : '';

    const query = {};
    if (categoryFilter) query.category = categoryFilter;
    if (subCategoryFilter) query.subCategory = subCategoryFilter;
    if (typeof req.query.isFeatured === 'string') {
      if (!['true', 'false'].includes(req.query.isFeatured)) {
        return res.status(400).json({ success: false, message: 'Invalid isFeatured filter' });
      }
      query.isFeatured = req.query.isFeatured === 'true';
    }
    if (searchTerm) {
      const safeSearch = new RegExp(escapeRegex(searchTerm), 'i');
      query.$or = [{ name: safeSearch }, { description: safeSearch }];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', productRateLimit, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

router.post('/', productRateLimit, protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.create(pickProductFields(req.body));
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', productRateLimit, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = pickProductFields(req.body);
    Object.entries(updates).forEach(([key, value]) => {
      product[key] = value;
    });

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', productRateLimit, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
