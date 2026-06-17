const express = require('express');
const router = express.Router();
const { protect, admin, superAdmin, staff, logAudit } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { Coupon, Settings, Category, Banner, AuditLog, PaymentLog } = require('../models/Misc');

// ─── DASHBOARD (staff+) ───────────────────────────────────────────────
router.get('/dashboard', protect, staff, async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [totalRevenue, monthRevenue, totalOrders, pendingOrders, completedOrders, totalCustomers, recentOrders] = await Promise.all([
      Order.aggregate([{ $match: { paymentStatus:'paid' } }, { $group: { _id:null, t:{ $sum:'$total' } } }]),
      Order.aggregate([{ $match: { paymentStatus:'paid', createdAt:{ $gte:startOfMonth } } }, { $group: { _id:null, t:{ $sum:'$total' } } }]),
      Order.countDocuments(),
      Order.countDocuments({ status:'pending' }),
      Order.countDocuments({ status:'completed' }),
      User.countDocuments({ role:'customer' }),
      Order.find().sort({ createdAt:-1 }).limit(8).select('orderNumber customerName total status paymentMethod createdAt paymentStatus')
    ]);
    res.json({ success:true, stats: {
      totalRevenue: totalRevenue[0]?.t || 0,
      monthRevenue: monthRevenue[0]?.t || 0,
      totalOrders, pendingOrders, completedOrders, totalCustomers, recentOrders
    }});
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── USERS ────────────────────────────────────────────────────────────
router.get('/users', protect, admin, async (req, res) => {
  try {
    const { search, role, status, page=1, limit=20 } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name:new RegExp(search,'i') }, { email:new RegExp(search,'i') }];
    if (role) filter.role = role;
    if (status === 'suspended') filter.isSuspended = true;
    if (status === 'banned') filter.isBanned = true;
    if (status === 'inactive') filter.isActive = false;
    const skip = (page-1)*limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt:-1 }).skip(skip).limit(+limit),
      User.countDocuments(filter)
    ]);
    res.json({ success:true, users, total, pages:Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    const orders = await Order.find({ user: user._id }).sort({ createdAt:-1 }).limit(20);
    res.json({ success:true, user, orders });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { role, isActive, isSuspended, suspendReason, isBanned, banReason, notes } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    // Prevent downgrading super_admin unless caller is super_admin
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success:false, message:'Cannot modify super admin' });
    }
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isSuspended !== undefined) { user.isSuspended = isSuspended; user.suspendReason = suspendReason || ''; }
    if (isBanned !== undefined) { user.isBanned = isBanned; user.banReason = banReason || ''; }
    if (notes !== undefined) user.notes = notes;
    await user.save();
    await logAudit(req, 'UPDATE_USER', 'User', user._id, { role, isActive, isSuspended, isBanned });
    res.json({ success:true, user });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

router.post('/users/:id/reset-password', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    user.password = req.body.newPassword || 'Temp@12345';
    await user.save();
    await logAudit(req, 'RESET_USER_PASSWORD', 'User', user._id);
    res.json({ success:true, message:'Password reset' });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

router.delete('/users/:id', protect, superAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await logAudit(req, 'DELETE_USER', 'User', req.params.id);
    res.json({ success:true, message:'User deleted' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── CATEGORIES ───────────────────────────────────────────────────────
router.get('/categories', protect, staff, async (req, res) => {
  try {
    const categories = await Category.find().sort({ order:1 });
    res.json({ success:true, categories });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/categories', protect, admin, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success:true, category:cat });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

router.put('/categories/:id', protect, admin, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new:true });
    res.json({ success:true, category:cat });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

router.delete('/categories/:id', protect, admin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success:true });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── ORDERS (admin view) ──────────────────────────────────────────────
router.get('/orders', protect, staff, async (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod, search, page=1, limit=20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (search) filter.$or = [
      { orderNumber: new RegExp(search,'i') },
      { customerEmail: new RegExp(search,'i') },
      { customerName: new RegExp(search,'i') }
    ];
    const skip = (page-1)*limit;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user','name email').sort({ createdAt:-1 }).skip(skip).limit(+limit),
      Order.countDocuments(filter)
    ]);
    res.json({ success:true, orders, total, pages:Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success:false, message:'Order not found' });
    const { status, paymentStatus, adminNotes } = req.body;
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (adminNotes) order.adminNotes = adminNotes;
    if (status === 'completed') order.completedAt = new Date();
    if (status === 'refunded') { order.refundedAt = new Date(); order.refundReason = req.body.refundReason; }
    await order.save();
    await logAudit(req, 'UPDATE_ORDER_STATUS', 'Order', order._id, { status, paymentStatus });
    res.json({ success:true, order });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// Deliver key manually
router.post('/orders/:id/deliver-key', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success:false, message:'Order not found' });
    const { itemIndex, key } = req.body;
    if (order.items[itemIndex]) {
      order.items[itemIndex].deliveredKey = key;
      order.items[itemIndex].deliveryStatus = 'delivered';
    }
    if (order.items.every(i => i.deliveryStatus === 'delivered')) {
      order.status = 'completed';
      order.completedAt = new Date();
    }
    await order.save();
    res.json({ success:true, order });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// ─── INVENTORY (keys) ─────────────────────────────────────────────────
router.get('/inventory', protect, admin, async (req, res) => {
  try {
    const products = await Product.find({ active:true }).select('name category keys stock unlimited thumbnail');
    const inventory = products.map(p => ({
      _id: p._id, name: p.name, category: p.category,
      thumbnail: p.thumbnail, unlimited: p.unlimited,
      stock: p.keys?.filter(k=>!k.used).length || p.stock,
      totalKeys: p.keys?.length || 0,
      usedKeys: p.keys?.filter(k=>k.used).length || 0
    }));
    res.json({ success:true, inventory });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/inventory/:id/add-keys', protect, admin, async (req, res) => {
  try {
    const { keys } = req.body;
    const keyLines = keys.split('\n').map(k=>k.trim()).filter(Boolean);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    keyLines.forEach(k => product.keys.push({ key:k, used:false }));
    product.stock = product.keys.filter(k=>!k.used).length;
    await product.save();
    await logAudit(req, 'ADD_KEYS', 'Product', product._id, { count:keyLines.length });
    res.json({ success:true, added:keyLines.length, totalKeys:product.keys.length });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// ─── COUPONS ──────────────────────────────────────────────────────────
router.get('/coupons', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt:-1 });
    res.json({ success:true, coupons });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/coupons', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, discountValue: req.body.value, discountType: req.body.type });
    res.status(201).json({ success:true, coupon });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

router.put('/coupons/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new:true });
    res.json({ success:true, coupon });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

router.delete('/coupons/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success:true });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── SETTINGS ─────────────────────────────────────────────────────────
router.get('/settings', protect, admin, async (req, res) => {
  try {
    const settings = await Settings.find();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ success:true, settings: map });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put('/settings', protect, admin, async (req, res) => {
  try {
    const updates = Object.entries(req.body);
    await Promise.all(updates.map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value }, { upsert:true })
    ));
    await logAudit(req, 'UPDATE_SETTINGS', 'Settings', null, { keys: Object.keys(req.body) });
    res.json({ success:true });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// ─── PAYMENT GATEWAY CONFIG ───────────────────────────────────────────
// Returns only gateway names/status, NEVER API keys
router.get('/gateways', protect, admin, async (req, res) => {
  try {
    const gatewaySettings = await Settings.find({ group:'gateway' });
    const map = {};
    gatewaySettings.forEach(s => { map[s.key] = s.value; });
    // Build safe response — only enabled/label, no secrets
    const gateways = [
      { id:'stripe',           label:'Stripe',           region:'International', logo:'💳', enabled: map['gateway_stripe_enabled'] !== false },
      { id:'paypal',           label:'PayPal',           region:'International', logo:'🅿️',  enabled: map['gateway_paypal_enabled'] === true },
      { id:'paddle',           label:'Paddle',           region:'International', logo:'🏓', enabled: map['gateway_paddle_enabled'] === true },
      { id:'skrill',           label:'Skrill',           region:'International', logo:'💸', enabled: map['gateway_skrill_enabled'] === true },
      { id:'wise',             label:'Wise',             region:'International', logo:'💡', enabled: map['gateway_wise_enabled'] === true },
      { id:'revolut',          label:'Revolut Business', region:'International', logo:'🔄', enabled: map['gateway_revolut_enabled'] === true },
      { id:'jazzcash',         label:'JazzCash',         region:'Pakistan',      logo:'📱', enabled: map['gateway_jazzcash_enabled'] !== false },
      { id:'easypaisa',        label:'EasyPaisa',        region:'Pakistan',      logo:'💚', enabled: map['gateway_easypaisa_enabled'] === true },
      { id:'alfalah',          label:'Bank Alfalah',     region:'Pakistan',      logo:'🏦', enabled: map['gateway_alfalah_enabled'] !== false },
      { id:'meezan',           label:'Meezan Bank',      region:'Pakistan',      logo:'🕌', enabled: map['gateway_meezan_enabled'] !== false },
      { id:'raast',            label:'Raast',            region:'Pakistan',      logo:'⚡', enabled: map['gateway_raast_enabled'] === true },
      { id:'bank_transfer',    label:'Bank Transfer',    region:'Pakistan',      logo:'🏧', enabled: map['gateway_bank_transfer_enabled'] === true },
      { id:'crypto_btc',       label:'Bitcoin',          region:'Crypto',        logo:'₿',  enabled: map['gateway_crypto_btc_enabled'] === true },
      { id:'crypto_eth',       label:'Ethereum',         region:'Crypto',        logo:'Ξ',  enabled: map['gateway_crypto_eth_enabled'] === true },
      { id:'crypto_usdt_trc20',label:'USDT (TRC20)',     region:'Crypto',        logo:'💎', enabled: map['gateway_crypto_usdt_trc20_enabled'] === true },
      { id:'crypto_usdt_erc20',label:'USDT (ERC20)',     region:'Crypto',        logo:'💎', enabled: map['gateway_crypto_usdt_erc20_enabled'] === true },
      { id:'crypto_ltc',       label:'Litecoin',         region:'Crypto',        logo:'Ł',  enabled: map['gateway_crypto_ltc_enabled'] === true },
      { id:'manual',           label:'Manual',           region:'Admin',         logo:'✏️',  enabled: true }
    ];
    res.json({ success:true, gateways });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.put('/gateways/:id/toggle', protect, admin, async (req, res) => {
  try {
    const { enabled } = req.body;
    await Settings.findOneAndUpdate(
      { key:`gateway_${req.params.id}_enabled` },
      { key:`gateway_${req.params.id}_enabled`, value:enabled, group:'gateway' },
      { upsert:true }
    );
    await logAudit(req, 'TOGGLE_GATEWAY', 'Gateway', req.params.id, { enabled });
    res.json({ success:true, message:`Gateway ${enabled ? 'enabled' : 'disabled'}` });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// ─── AUDIT LOGS ───────────────────────────────────────────────────────
router.get('/audit-logs', protect, admin, async (req, res) => {
  try {
    const { page=1, limit=50 } = req.query;
    const skip = (page-1)*limit;
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt:-1 }).skip(skip).limit(+limit),
      AuditLog.countDocuments()
    ]);
    res.json({ success:true, logs, total, pages:Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// ─── PAYMENT LOGS ─────────────────────────────────────────────────────
router.get('/payment-logs', protect, admin, async (req, res) => {
  try {
    const { page=1, limit=50, gateway } = req.query;
    const filter = {};
    if (gateway) filter.gateway = gateway;
    const skip = (page-1)*limit;
    const [logs, total] = await Promise.all([
      PaymentLog.find(filter).sort({ createdAt:-1 }).skip(skip).limit(+limit),
      PaymentLog.countDocuments(filter)
    ]);
    res.json({ success:true, logs, total, pages:Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
