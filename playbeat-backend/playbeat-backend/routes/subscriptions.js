const express = require('express');
const router = express.Router();
const { protect, admin, staff } = require('../middleware/auth');
const { SubscriptionPlan, UserSubscription } = require('../models/Misc');

// ─── PUBLIC: list plans ───────────────────────────────────────────────
router.get('/plans', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { active: true };
    if (type) filter.type = type;
    const plans = await SubscriptionPlan.find(filter).sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/plans/:id', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── AUTH: my subscriptions ───────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const subs = await UserSubscription.find({ user: req.user._id })
      .populate('plan')
      .sort({ createdAt: -1 });
    res.json({ success: true, subscriptions: subs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/cancel/:id', protect, async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    sub.autoRenew = false;
    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    await sub.save();
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ADMIN: manage plans ──────────────────────────────────────────────
router.get('/admin/plans', protect, admin, async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/admin/plans', protect, admin, async (req, res) => {
  try {
    const { name, description, type, interval, price, comparePrice, features, autoRenew, trialDays } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const plan = await SubscriptionPlan.create({ name, slug, description, type, interval, price, comparePrice, features, autoRenew, trialDays });
    res.status(201).json({ success: true, plan });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/admin/plans/:id', protect, admin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, plan });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/admin/plans/:id', protect, admin, async (req, res) => {
  try {
    await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Plan deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ADMIN: user subscriptions ────────────────────────────────────────
router.get('/admin/subscriptions', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [subs, total] = await Promise.all([
      UserSubscription.find(filter).populate('user', 'name email').populate('plan', 'name interval type').sort({ createdAt: -1 }).skip(skip).limit(+limit),
      UserSubscription.countDocuments(filter)
    ]);
    res.json({ success: true, subscriptions: subs, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/admin/subscriptions/create', protect, admin, async (req, res) => {
  try {
    const { userId, planId, startDate, endDate, status, autoRenew, amount } = req.body;
    const plan = await SubscriptionPlan.findById(planId);
    const sub = await UserSubscription.create({
      user: userId,
      plan: planId,
      planName: plan?.name,
      planInterval: plan?.interval,
      status: status || 'active',
      startDate: startDate || new Date(),
      endDate,
      autoRenew: autoRenew !== undefined ? autoRenew : true,
      amount: amount || plan?.price
    });
    res.status(201).json({ success: true, subscription: sub });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/admin/subscriptions/:id', protect, admin, async (req, res) => {
  try {
    const sub = await UserSubscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, subscription: sub });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Expiry report — subscriptions expiring within N days
router.get('/admin/expiring', protect, admin, async (req, res) => {
  try {
    const days = parseInt(req.query.days || 7);
    const cutoff = new Date(Date.now() + days * 24 * 3600000);
    const subs = await UserSubscription.find({
      status: 'active',
      endDate: { $lte: cutoff, $gte: new Date() }
    }).populate('user', 'name email').populate('plan', 'name');
    res.json({ success: true, subscriptions: subs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
