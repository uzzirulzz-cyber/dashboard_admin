const express = require('express');
const router = express.Router();
const { protect, admin, staff } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { UserSubscription, AuditLog, PaymentLog } = require('../models/Misc');

// ─── DASHBOARD OVERVIEW ───────────────────────────────────────────────
router.get('/dashboard', protect, staff, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last30 = new Date(Date.now() - 30 * 24 * 3600000);

    const [
      totalRevenue, monthRevenue, todayRevenue,
      totalOrders, pendingOrders, completedOrders,
      totalCustomers, newCustomers,
      activeSubscriptions,
      topProducts,
      revenueByDay,
      revenueByMonth,
      ordersByStatus,
      ordersByPayment,
      recentOrders
    ] = await Promise.all([
      // Revenue
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      // Orders
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' }),
      // Users
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: last30 } }),
      // Subscriptions
      UserSubscription.countDocuments({ status: 'active' }),
      // Top products by soldCount
      Product.find().sort({ soldCount: -1 }).limit(5).select('name soldCount price thumbnail'),
      // Revenue by day (last 30)
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: last30 } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Revenue by month (this year)
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfYear } } },
        { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { '_id.month': 1 } }
      ]),
      // Orders by status
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      // Orders by payment method
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { revenue: -1 } }
      ]),
      // Recent orders
      Order.find().sort({ createdAt: -1 }).limit(10).select('orderNumber customerName total status paymentMethod createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: monthRevenue[0]?.total || 0,
          today: todayRevenue[0]?.total || 0
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        customers: {
          total: totalCustomers,
          newLast30Days: newCustomers
        },
        activeSubscriptions,
        topProducts,
        revenueByDay,
        revenueByMonth,
        ordersByStatus,
        ordersByPayment,
        recentOrders
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── REVENUE REPORT ───────────────────────────────────────────────────
router.get('/revenue', protect, admin, async (req, res) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;
    const match = { paymentStatus: 'paid' };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }
    const format = groupBy === 'month' ? '%Y-%m' : groupBy === 'year' ? '%Y' : '%Y-%m-%d';
    const data = await Order.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── PRODUCT PERFORMANCE ──────────────────────────────────────────────
router.get('/products', protect, admin, async (req, res) => {
  try {
    const products = await Product.find().sort({ soldCount: -1 }).limit(50).select('name category soldCount viewCount price ratings thumbnail');
    res.json({ success: true, products });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── PAYMENT GATEWAY PERFORMANCE ─────────────────────────────────────
router.get('/gateways', protect, admin, async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: {
        _id: '$paymentMethod',
        totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus','paid'] }, '$total', 0] } },
        paidCount: { $sum: { $cond: [{ $eq: ['$paymentStatus','paid'] }, 1, 0] } },
        failedCount: { $sum: { $cond: [{ $eq: ['$paymentStatus','failed'] }, 1, 0] } },
        totalCount: { $sum: 1 }
      }}
    ]);
    const enhanced = data.map(g => ({
      ...g,
      successRate: g.totalCount > 0 ? Math.round((g.paidCount / g.totalCount) * 100) : 0
    }));
    res.json({ success: true, gateways: enhanced });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── AUDIT LOGS ───────────────────────────────────────────────────────
router.get('/audit-logs', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const filter = {};
    if (action) filter.action = new RegExp(action, 'i');
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(+limit),
      AuditLog.countDocuments(filter)
    ]);
    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── PAYMENT LOGS ─────────────────────────────────────────────────────
router.get('/payment-logs', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 50, gateway } = req.query;
    const filter = {};
    if (gateway) filter.gateway = gateway;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      PaymentLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(+limit),
      PaymentLog.countDocuments(filter)
    ]);
    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
