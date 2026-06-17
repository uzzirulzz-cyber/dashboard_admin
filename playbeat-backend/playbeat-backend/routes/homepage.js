const express = require('express');
const router = express.Router();
const { protect, admin, staff } = require('../middleware/auth');
const { HomepageBlock, Announcement, Banner } = require('../models/Misc');

// ─── PUBLIC ───────────────────────────────────────────────────────────
router.get('/blocks', async (req, res) => {
  try {
    const blocks = await HomepageBlock.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, blocks });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/announcements', async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({ active: true, $or: [{ expiresAt: { $gte: now } }, { expiresAt: null }] });
    res.json({ success: true, announcements });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/banners', async (req, res) => {
  try {
    const now = new Date();
    const type = req.query.type;
    const filter = { active: true, $or: [{ endDate: { $gte: now } }, { endDate: null }] };
    if (type) filter.type = type;
    const banners = await Banner.find(filter).sort({ order: 1 });
    res.json({ success: true, banners });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ADMIN: blocks ────────────────────────────────────────────────────
router.get('/admin/blocks', protect, staff, async (req, res) => {
  try {
    const blocks = await HomepageBlock.find().sort({ order: 1 });
    res.json({ success: true, blocks });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/admin/blocks/:key', protect, staff, async (req, res) => {
  try {
    const block = await HomepageBlock.findOneAndUpdate(
      { key: req.params.key },
      req.body,
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, block });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.post('/admin/blocks', protect, staff, async (req, res) => {
  try {
    const block = await HomepageBlock.create(req.body);
    res.status(201).json({ success: true, block });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/admin/blocks-order', protect, staff, async (req, res) => {
  try {
    // req.body.order = [{key:'hero', order:0}, ...]
    await Promise.all(req.body.order.map(({ key, order }) =>
      HomepageBlock.findOneAndUpdate({ key }, { order })
    ));
    res.json({ success: true });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/admin/blocks/:id', protect, admin, async (req, res) => {
  try {
    await HomepageBlock.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ADMIN: announcements ─────────────────────────────────────────────
router.get('/admin/announcements', protect, staff, async (req, res) => {
  try {
    const a = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements: a });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/admin/announcements', protect, staff, async (req, res) => {
  try {
    const a = await Announcement.create(req.body);
    res.status(201).json({ success: true, announcement: a });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/admin/announcements/:id', protect, staff, async (req, res) => {
  try {
    const a = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, announcement: a });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/admin/announcements/:id', protect, admin, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ADMIN: banners ───────────────────────────────────────────────────
router.get('/admin/banners', protect, staff, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json({ success: true, banners });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/admin/banners', protect, staff, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/admin/banners/:id', protect, staff, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, banner });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/admin/banners/:id', protect, admin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
