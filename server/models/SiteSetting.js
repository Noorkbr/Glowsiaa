const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed },
  label: { type: String, trim: true },
  updatedAt: { type: Date, default: Date.now },
});

siteSettingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SiteSetting', siteSettingSchema);

