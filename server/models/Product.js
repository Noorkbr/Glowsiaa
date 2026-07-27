const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  category: {
    type: String,
    enum: ['skincare', 'makeup', 'fragrance', 'haircare'],
    required: [true, 'Product category is required'],
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  badge: {
    type: String,
    trim: true,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
