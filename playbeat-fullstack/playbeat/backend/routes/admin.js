const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { Coupon, Settings, Category, Banner } = require('../models/Misc');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

// ─── DASHBOARD SUMMARY ───────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [users, products, orders, revenue, recentOrders, topProducts] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ active: true }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email').populate('items.product', 'name'),
      Product.find({ active: true }).sort({ soldCount: -1 }).limit(5).select('name soldCount price thumbnail category')
    ]);
    res.json({
      success: true,
      stats: { users, products, orders, revenue: revenue[0]?.total || 0 },
      recentOrders,
      topProducts
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── USERS ────────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({ success: true, users, total });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ─── COUPONS ──────────────────────────────────────────────────────────────────
router.get('/coupons', async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

router.post('/coupons', async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, coupon });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  const categories = await Category.find().sort({ order: 1 });
  res.json({ success: true, categories });
});

router.post('/categories', async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, category: cat });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category: cat });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ─── BANNERS ─────────────────────────────────────────────────────────────────
router.get('/banners', async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json({ success: true, banners });
});

router.post('/banners', async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, banner });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.delete('/banners/:id', async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ─── SETTINGS ────────────────────────────────────────────────────────────────
router.get('/settings', async (req, res) => {
  const settings = await Settings.find();
  const obj = {};
  settings.forEach(s => obj[s.key] = s.value);
  res.json({ success: true, settings: obj });
});

router.post('/settings', async (req, res) => {
  try {
    const { key, value, group } = req.body;
    await Settings.findOneAndUpdate({ key }, { value, group }, { upsert: true, new: true });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ─── INVENTORY / KEY MANAGEMENT ──────────────────────────────────────────────
router.get('/inventory', async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .select('name category stock keys unlimited deliveryType')
      .sort({ category: 1, name: 1 });
    const inventory = products.map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      stock: p.unlimited ? 'Unlimited' : p.stock,
      totalKeys: p.keys?.length || 0,
      usedKeys: p.keys?.filter(k => k.used).length || 0,
      availableKeys: p.keys?.filter(k => !k.used).length || 0,
      deliveryType: p.deliveryType
    }));
    res.json({ success: true, inventory });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
