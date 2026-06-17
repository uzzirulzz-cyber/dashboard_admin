const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { Coupon } = require('../models/Misc');
const { protect, admin, optionalAuth } = require('../middleware/auth');

// Get my orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name thumbnail category')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get single order
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.id })
      .populate('items.product', 'name thumbnail category');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user) {
      if (order.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Validate coupon
router.post('/validate-coupon', optionalAuth, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon limit reached' });
    if (cartTotal < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Min order $${coupon.minOrderAmount}` });
    const discount = coupon.type === 'percent' ? (cartTotal * coupon.value / 100) : coupon.value;
    res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount } });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ─── ADMIN ONLY ───────────────────────────────────────────────────────────────
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, paymentMethod, page = 1, limit = 50, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit))
        .populate('user', 'name email').populate('items.product', 'name category'),
      Order.countDocuments(filter)
    ]);
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update order status (admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, adminNotes, deliveryKey } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    if (status === 'completed') {
      order.completedAt = new Date();
      order.paymentStatus = 'paid';
      // Auto-deliver keys for digital products
      for (const item of order.items) {
        if (!item.deliveredKey && deliveryKey) {
          item.deliveredKey = deliveryKey;
          item.deliveryStatus = 'delivered';
        }
      }
      // Update product sold count
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.quantity } });
      }
    }
    await order.save();
    res.json({ success: true, order });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Dashboard stats
// Create pending order (for bank/jazz/meezan payments)
router.post('/create-pending', optionalAuth, async (req, res) => {
  try {
    const { items, customerInfo, paymentMethod, couponCode, total } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'No items' });

    // Build order number
    const orderNumber = 'PB-' + Date.now().toString(36).toUpperCase();

    // Resolve products
    const Product = require('../models/Product');
    const Coupon  = require('../models/Misc').Coupon;

    const productIds = items.map(i => i.product);
    const products   = await Product.find({ _id: { $in: productIds } });

    let subtotal = 0;
    const orderItems = items.map(i => {
      const p = products.find(x => x._id.toString() === i.product);
      if (!p) throw new Error('Product not found: ' + i.product);
      subtotal += p.price * i.quantity;
      return { product: p._id, name: p.name, price: p.price, quantity: i.quantity };
    });

    let discount = 0;
    let couponRef = null;
    if (couponCode) {
      const c = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (c && (!c.expiresAt || c.expiresAt > new Date()) && (!c.maxUses || c.usedCount < c.maxUses)) {
        discount = c.discountType === 'percent' ? subtotal * (c.discountValue / 100) : c.discountValue;
        couponRef = c._id;
        c.usedCount = (c.usedCount || 0) + 1;
        await c.save();
      }
    }

    const finalTotal = Math.max(0, subtotal - discount);

    const Order = require('../models/Order');
    const order = await Order.create({
      orderNumber,
      user: req.user?._id || null,
      guestEmail: customerInfo?.email,
      items: orderItems,
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      customerPhone: customerInfo?.phone,
      customerCountry: customerInfo?.country,
      subtotal,
      discount,
      couponCode: couponCode || undefined,
      total: finalTotal,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending'
    });

    res.json({ success: true, orderId: order._id, orderNumber });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const [totalOrders, totalRevenue, pending, completed] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' })
    ]);
    const revenueByMonth = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(Date.now() - 365 * 24 * 3600000) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders: pending,
        completedOrders: completed,
        revenueByMonth
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
