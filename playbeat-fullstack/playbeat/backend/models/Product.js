const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: String,
  category: {
    type: String,
    required: true,
    enum: ['games','gift-cards','software','ai-tools','game-items','accounts','subscriptions','top-up']
  },
  subcategory: String,
  platform: String,
  region: { type: String, default: 'Global' },
  images: [String],
  thumbnail: String,
  price: { type: Number, required: true, min: 0 },
  comparePrice: Number,
  costPrice: Number,
  currency: { type: String, default: 'USD' },
  stock: { type: Number, default: 0 },
  unlimited: { type: Boolean, default: false },
  sku: { type: String, unique: true, sparse: true },
  keys: [{ // digital delivery keys
    key: String,
    used: { type: Boolean, default: false },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: Date
  }],
  deliveryType: { type: String, enum: ['instant','manual','email'], default: 'instant' },
  deliveryInstructions: String,
  tags: [String],
  badge: String, // HOT, NEW, SALE, TRENDING
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  seoTitle: String,
  seoDescription: String,
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
