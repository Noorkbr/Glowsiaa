const mongoose = require('mongoose');

const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: { type: String, trim: true, default: '' },
  imageUrl: { type: String, trim: true, default: '' },
  emoji: { type: String, default: '✨', trim: true },
  gradient: {
    type: String,
    default: 'from-[#6E3992] to-[#D5106E]',
    trim: true,
  },
  // null = top-level category, ObjectId = subcategory of that parent
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate slug from name before saving
categorySchema.pre('validate', async function (next) {
  if (!this.slug || this.isModified('name')) {
    const base = generateSlug(this.name);
    let slug = base;
    let n = 1;
    // Ensure uniqueness
    while (await mongoose.model('Category').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${n}`;
      n++;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);

