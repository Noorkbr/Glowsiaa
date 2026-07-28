const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Banner title is required'], trim: true },
  subtitle: { type: String, trim: true },
  badgeText: { type: String, trim: true },
  buttonText: { type: String, default: 'Shop Now', trim: true },
  buttonLink: { type: String, default: '/products', trim: true },
  secondaryButtonText: { type: String, trim: true },
  secondaryButtonLink: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  gradient: {
    type: String,
    default: 'from-[#D5106E] via-[#9B2FD0] to-[#6E3992]',
    trim: true,
  },
  overlayColor: { type: String, default: 'rgba(11,11,18,0.55)', trim: true },
  textColor: { type: String, default: 'white' },
  type: {
    type: String,
    enum: ['hero', 'promo', 'announcement'],
    default: 'hero',
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Banner', bannerSchema);

