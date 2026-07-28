const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Tip title is required'], trim: true },
  content: { type: String, required: [true, 'Tip content is required'], trim: true },
  category: {
    type: String,
    enum: ['skincare', 'makeup', 'fragrance', 'haircare', 'wellness'],
    default: 'skincare',
  },
  imageUrl: { type: String, trim: true },
  emoji: { type: String, default: '✨', trim: true },
  readTime: { type: Number, default: 2 }, // minutes
  isPublished: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  tags: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tip', tipSchema);

