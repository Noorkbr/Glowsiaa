const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const rl = createRateLimit({ windowMs: 15 * 60 * 1000, max: 400, message: 'Too many category requests' });

// ─── Public Routes ──────────────────────────────────────────────────────────

// GET /api/categories — all active top-level categories with subcategory count
router.get('/', rl, async (req, res, next) => {
  try {
    const topLevel = await Category.find({ isActive: true, parent: null })
      .sort({ order: 1, name: 1 });

    // Attach subcategories
    const withSubs = await Promise.all(
      topLevel.map(async (cat) => {
        const subs = await Category.find({ isActive: true, parent: cat._id }).sort({ order: 1, name: 1 });
        const productCount = await Product.countDocuments({ category: cat.slug });
        return { ...cat.toObject(), subcategories: subs, productCount };
      })
    );

    res.json({ success: true, categories: withSubs });
  } catch (e) { next(e); }
});

// GET /api/categories/tree — full nested tree (public)
router.get('/tree', rl, async (req, res, next) => {
  try {
    const all = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    const topLevel = all.filter(c => !c.parent);
    const tree = topLevel.map(cat => ({
      ...cat.toObject(),
      subcategories: all.filter(c => c.parent && c.parent.toString() === cat._id.toString()),
    }));
    res.json({ success: true, categories: tree });
  } catch (e) { next(e); }
});

// GET /api/categories/:slug — single category with subcategories
router.get('/:slug', rl, async (req, res, next) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    const subcategories = await Category.find({ parent: cat._id, isActive: true }).sort({ order: 1 });
    const productCount = await Product.countDocuments({ category: cat.slug });

    res.json({ success: true, category: { ...cat.toObject(), subcategories, productCount } });
  } catch (e) { next(e); }
});

// ─── Admin Routes ────────────────────────────────────────────────────────────

// GET /api/categories/admin/all — all categories (including inactive)
router.get('/admin/all', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const all = await Category.find().sort({ order: 1, name: 1 }).populate('parent', 'name slug');
    // Attach product counts
    const withCounts = await Promise.all(
      all.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat.slug });
        return { ...cat.toObject(), productCount };
      })
    );
    res.json({ success: true, categories: withCounts });
  } catch (e) { next(e); }
});

// POST /api/categories — create
router.post('/', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.create({
      name: req.body.name,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      emoji: req.body.emoji,
      gradient: req.body.gradient,
      parent: req.body.parent || null,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      order: req.body.order || 0,
    });
    res.status(201).json({ success: true, category });
  } catch (e) { next(e); }
});

// PUT /api/categories/:id — update
router.put('/:id', rl, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid ID' });

    const updates = {
      name: req.body.name,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      emoji: req.body.emoji,
      gradient: req.body.gradient,
      parent: req.body.parent || null,
      isActive: req.body.isActive,
      order: req.body.order,
    };

    // Remove undefined keys
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    // Regenerate slug if name changed
    if (req.body.name) {
      const generateSlug = (n) => n.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      updates.slug = generateSlug(req.body.name);
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    res.json({ success: true, category });
  } catch (e) { next(e); }
});

// DELETE /api/categories/:id
router.delete('/:id', rl, protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid ID' });

    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    // Delete subcategories too
    await Category.deleteMany({ parent: req.params.id });
    await cat.deleteOne();

    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { next(e); }
});

module.exports = router;

