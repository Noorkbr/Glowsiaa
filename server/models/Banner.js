const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title:                { type: String, required: [true, 'Banner title is required'], trim: true },
  subtitle:             { type: String, trim: true },
  badgeText:            { type: String, trim: true },
  buttonText:           { type: String, default: 'Shop Now', trim: true },
  buttonLink:           { type: String, default: '/products', trim: true },
  secondaryButtonText:  { type: String, trim: true },
  secondaryButtonLink:  { type: String, trim: true },
  imageUrl:             { type: String, trim: true },
  gradient:             { type: String, default: 'from-[#D5106E] via-[#9B2FD0] to-[#6E3992]', trim: true },
  overlayColor:         { type: String, default: 'rgba(11,11,18,0.55)', trim: true },
  textColor:            { type: String, default: 'white' },
  // Bangla translations (optional)
  title_bn:             { type: String, trim: true },
  subtitle_bn:          { type: String, trim: true },
  buttonText_bn:        { type: String, trim: true },
  type: {
    type: String,
    // hero: full-screen hero slider
    // promo: promotional card
    // announcement: announcement bar
    // slider: compact horizontal slide
    // flash: flash sale strip
    // popup: modal popup banner
    enum: ['hero', 'promo', 'announcement', 'slider', 'flash', 'popup'],
    default: 'hero',
  },
  isActive:  { type: Boolean, default: true },
  order:     { type: Number, default: 0 },
  // For popup: delay before showing (ms)
  popupDelay: { type: Number, default: 3000 },
  // For flash: countdown end time
  flashEndsAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Banner', bannerSchema);

