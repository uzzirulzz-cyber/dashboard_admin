const router = require('express').Router();
const Product = require('../models/Product');
const { protect, admin, optionalAuth } = require('../middleware/auth');

// GET all products (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, sort, featured, badge, page = 1, limit = 24, minPrice, maxPrice, region } = req.query;
    const filter = { active: true };
    if (category) filter.category = category;
    if (featured) filter.featured = true;
    if (badge) filter.badge = badge;
    if (region) filter.region = { $in: [region, 'Global'] };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'newest': { createdAt: -1 },
      'popular': { soldCount: -1 },
      'rating': { 'ratings.average': -1 }
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortBy).skip(skip).limit(Number(limit)).select('-keys -__v'),
      Product.countDocuments(filter)
    ]);
    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET single product
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
      active: true
    }).select('-keys');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });
    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const existing = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });
    product.reviews.push({ user: req.user._id, rating, comment });
    const total = product.reviews.reduce((a, r) => a + r.rating, 0);
    product.ratings = { average: total / product.reviews.length, count: product.reviews.length };
    await product.save();
    res.json({ success: true, product });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────────────────────
router.use(protect, admin);

// Create product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, product });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Add keys to product
router.post('/:id/keys', async (req, res) => {
  try {
    const { keys } = req.body; // array of key strings
    const product = await Product.findById(req.params.id);
    const newKeys = keys.map(k => ({ key: k, used: false }));
    product.keys.push(...newKeys);
    product.stock = product.keys.filter(k => !k.used).length;
    await product.save();
    res.json({ success: true, message: `Added ${keys.length} keys`, stock: product.stock });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
