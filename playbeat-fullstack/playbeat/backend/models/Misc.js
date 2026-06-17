const mongoose = require('mongoose');

// ─── COUPON ────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent','fixed'], default: 'percent' },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxUses: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  categories: [String],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  expiresAt: Date,
  active: { type: Boolean, default: true }
}, { timestamps: true });

// ─── SETTINGS ──────────────────────────────────────────────────────────
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  group: String
}, { timestamps: true });

// ─── CATEGORY ──────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: String,
  description: String,
  image: String,
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

// ─── PROMO BANNER ──────────────────────────────────────────────────────
const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  image: String,
  link: String,
  badge: String,
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

module.exports = {
  Coupon: mongoose.model('Coupon', couponSchema),
  Settings: mongoose.model('Settings', settingsSchema),
  Category: mongoose.model('Category', categorySchema),
  Banner: mongoose.model('Banner', bannerSchema)
};
