const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: { type: String, trim: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0, min: 0 },
  maxDiscountAmount: { type: Number }, // cap for percentage discounts
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  applicableCategories: [{ type: String }], // empty = all categories
  createdAt: { type: Date, default: Date.now },
});

couponSchema.methods.isValid = function () {
  if (!this.isActive) return { valid: false, reason: 'Coupon is not active' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit reached' };
  }
  if (this.expiresAt && new Date() > this.expiresAt) {
    return { valid: false, reason: 'Coupon has expired' };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (orderTotal) {
  if (orderTotal < this.minOrderAmount) return 0;
  if (this.type === 'fixed') return Math.min(this.value, orderTotal);
  const discount = (orderTotal * this.value) / 100;
  return this.maxDiscountAmount ? Math.min(discount, this.maxDiscountAmount) : discount;
};

module.exports = mongoose.model('Coupon', couponSchema);

