const express = require('express');
const SiteSetting = require('../models/SiteSetting');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const rl = createRateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: 'Too many setting requests' });

// Default settings used on first-time setup
const DEFAULTS = {
  top_banner_messages: [
    '🚚 Free Delivery on Orders Above ৳999',
    '✨ 100% Authentic Premium Quality',
    '💄 New Arrivals Every Week',
    "🇧🇩 Bangladesh's #1 Premium Cosmetics Store",
  ],
  announcement: '',
  announcement_active: false,
  store_name: 'Glowsiaa',
  support_email: 'hello@glowsiaa.com',
  support_phone: '+880 1711-000000',
  delivery_fee_inside: 60,
  delivery_fee_outside: 120,
  free_delivery_above: 999,
  bkash_enabled: false,
  nagad_enabled: false,
  cod_enabled: true,
  maintenance_mode: false,
  seo_title: 'Glowsiaa — Premium Beauty in Bangladesh',
  seo_description: 'Premium cosmetics curated for the modern Bangladeshi woman. 100% authentic.',
};

// Public: get public settings
router.get('/public', rl, async (req, res, next) => {
  try {
    const keys = [
      'top_banner_messages', 'announcement', 'announcement_active',
      'store_name', 'support_email', 'support_phone',
      'delivery_fee_inside', 'delivery_fee_outside', 'free_delivery_above',
      'bkash_enabled', 'nagad_enabled', 'cod_enabled',
      'seo_title', 'seo_description',
    ];
    const docs = await SiteSetting.find({ key: { $in: keys } });
    const settings = {};
    keys.forEach((k) => {
      const doc = docs.find((d) => d.key === k);
      settings[k] = doc ? doc.value : DEFAULTS[k] ?? null;
    });
    res.json({ success: true, settings });
  } catch (e) { next(e); }
});

// Admin: get all settings
router.get('/', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const docs = await SiteSetting.find();
    const settings = { ...DEFAULTS };
    docs.forEach((d) => { settings[d.key] = d.value; });
    res.json({ success: true, settings });
  } catch (e) { next(e); }
});

// Admin: update one setting
router.put('/:key', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const { value } = req.body;
    const setting = await SiteSetting.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, setting });
  } catch (e) { next(e); }
});

// Admin: bulk update settings
router.put('/', rl, protect, adminOnly, async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object')
      return res.status(400).json({ success: false, message: 'settings object is required' });

    const ops = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value, updatedAt: new Date() } },
        upsert: true,
      },
    }));

    await SiteSetting.bulkWrite(ops);
    res.json({ success: true, message: 'Settings updated' });
  } catch (e) { next(e); }
});

module.exports = router;

