const express = require('express');
const SiteSetting = require('../models/SiteSetting');
const { protect, adminOnly } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');
const sse = require('../services/sseManager');

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
  store_tagline: 'Glow Like Never Before',
  store_description: "Bangladesh's premier destination for authentic luxury cosmetics.",
  support_email: 'hello@glowsiaa.com',
  support_phone: '+880 1711-000000',
  whatsapp_number: '+8801711000000',
  store_address: 'Dhaka, Bangladesh',
  footer_copyright: '© 2026 Glowsiaa. All rights reserved.',
  logo_url: '',
  favicon_url: '',
  primary_color: '#D5106E',
  secondary_color: '#6E3992',
  delivery_fee_inside: 60,
  delivery_fee_outside: 120,
  free_delivery_above: 999,
  bkash_enabled: false,
  nagad_enabled: false,
  rocket_enabled: false,
  cod_enabled: true,
  bkash_merchant_number: '',
  nagad_merchant_number: '',
  rocket_merchant_number: '',
  maintenance_mode: false,
  seo_title: 'Glowsiaa — Premium Beauty in Bangladesh',
  seo_description: 'Premium cosmetics curated for the modern Bangladeshi woman. 100% authentic.',
  social_facebook: '',
  social_instagram: '',
  social_tiktok: '',
  social_youtube: '',
  social_twitter: '',
  social_pinterest: '',
  social_linkedin: '',
  facebook_pixel_id: '',
  facebook_pixel_enabled: false,
};

// Public: SSE stream — kept for backward compat, real traffic goes to /api/events
// This endpoint is effectively unused now but kept to avoid 404s from old clients
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
  }, 25_000);
  sse.addClient(res);
  req.on('close', () => { clearInterval(heartbeat); sse.removeClient(res); });
});

// Public: get public settings
router.get('/public', rl, async (req, res, next) => {
  try {
    const keys = [
      'top_banner_messages', 'announcement', 'announcement_active',
      'store_name', 'store_tagline', 'store_description',
      'support_email', 'support_phone', 'whatsapp_number', 'store_address',
      'footer_copyright', 'logo_url', 'favicon_url',
      'primary_color', 'secondary_color',
      'delivery_fee_inside', 'delivery_fee_outside', 'free_delivery_above',
      'bkash_enabled', 'nagad_enabled', 'rocket_enabled', 'cod_enabled',
      'bkash_merchant_number', 'nagad_merchant_number', 'rocket_merchant_number',
      'seo_title', 'seo_description',
      'social_facebook', 'social_instagram', 'social_tiktok',
      'social_youtube', 'social_twitter', 'social_pinterest', 'social_linkedin',
      'promo_cards',
      'facebook_pixel_id', 'facebook_pixel_enabled',
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

// Admin: bulk update settings  ← must be defined BEFORE /:key to avoid shadowing
router.put('/', rl, protect, adminOnly, async (req, res, next) => {
  try {
    // Accept both { settings: {...} } and a direct flat object { key: value, ... }
    let settings = req.body.settings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      // Fallback: treat the whole body as the settings map (exclude internal keys)
      const { settings: _s, ...rest } = req.body;
      settings = Object.keys(rest).length > 0 ? rest : null;
    }

    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Request body must contain a settings object' });
    }

    const ops = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value, updatedAt: new Date() } },
        upsert: true,
      },
    }));

    // Guard: bulkWrite throws if ops array is empty
    if (ops.length > 0) await SiteSetting.bulkWrite(ops);

    // Push updated settings to every open client tab via SSE immediately
    const PUBLIC_KEYS = [
      'top_banner_messages', 'announcement', 'announcement_active',
      'store_name', 'store_tagline', 'store_description',
      'support_email', 'support_phone', 'whatsapp_number', 'store_address',
      'footer_copyright', 'logo_url', 'favicon_url',
      'primary_color', 'secondary_color',
      'delivery_fee_inside', 'delivery_fee_outside', 'free_delivery_above',
      'bkash_enabled', 'nagad_enabled', 'rocket_enabled', 'cod_enabled',
      'bkash_merchant_number', 'nagad_merchant_number', 'rocket_merchant_number',
      'seo_title', 'seo_description',
      'social_facebook', 'social_instagram', 'social_tiktok',
      'social_youtube', 'social_twitter', 'social_pinterest', 'social_linkedin',
      'promo_cards', 'facebook_pixel_id', 'facebook_pixel_enabled',
    ];
    if (sse.clientCount() > 0) {
      const docs = await SiteSetting.find({ key: { $in: PUBLIC_KEYS } });
      const updated = {};
      PUBLIC_KEYS.forEach((k) => {
        const doc = docs.find((d) => d.key === k);
        updated[k] = doc ? doc.value : DEFAULTS[k] ?? null;
      });
      sse.broadcast(updated);
    }

    res.json({ success: true, message: 'Settings updated' });
  } catch (e) { next(e); }
});

// Admin: update one setting by key  ← after bulk route so '/' is not shadowed
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

module.exports = router;

