const express = require('express');
const router = express.Router();
const { protect, admin, staff, optionalAuth } = require('../middleware/auth');
const { SupportTicket } = require('../models/Misc');

// ─── CREATE TICKET (public/auth) ──────────────────────────────────────
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { subject, category, message, orderId, guestEmail, guestName } = req.body;
    if (!subject || !message) return res.status(400).json({ success: false, message: 'Subject and message required' });
    const ticket = await SupportTicket.create({
      user: req.user?._id || null,
      guestEmail: guestEmail || req.user?.email,
      guestName: guestName || req.user?.name,
      subject,
      category: category || 'general',
      orderId,
      messages: [{
        senderName: req.user?.name || guestName || 'Guest',
        senderRole: req.user?.role || 'customer',
        content: message
      }]
    });
    res.status(201).json({ success: true, ticket, ticketNumber: ticket.ticketNumber });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ─── MY TICKETS ───────────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, tickets });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/my/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Reply to ticket (customer)
router.post('/my/:id/reply', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (['resolved','closed'].includes(ticket.status)) return res.status(400).json({ success: false, message: 'Ticket is closed' });
    ticket.messages.push({ sender: req.user._id, senderName: req.user.name, senderRole: 'customer', content: req.body.message });
    ticket.status = 'open';
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ─── ADMIN ────────────────────────────────────────────────────────────
router.get('/admin', protect, staff, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter).populate('user', 'name email').populate('assignedTo', 'name').sort({ updatedAt: -1 }).skip(skip).limit(+limit),
      SupportTicket.countDocuments(filter)
    ]);
    res.json({ success: true, tickets, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/admin/:id', protect, staff, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('user', 'name email').populate('assignedTo', 'name email');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/admin/:id', protect, staff, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (status) { ticket.status = status; if (status === 'resolved') ticket.resolvedAt = new Date(); if (status === 'closed') ticket.closedAt = new Date(); }
    if (priority) ticket.priority = priority;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo || null;
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.post('/admin/:id/reply', protect, staff, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    ticket.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      content: req.body.message,
      isInternal: req.body.isInternal || false
    });
    if (!req.body.isInternal) ticket.status = 'in_progress';
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Stats
router.get('/admin/stats/overview', protect, staff, async (req, res) => {
  try {
    const [open, in_progress, resolved, urgent] = await Promise.all([
      SupportTicket.countDocuments({ status: 'open' }),
      SupportTicket.countDocuments({ status: 'in_progress' }),
      SupportTicket.countDocuments({ status: 'resolved' }),
      SupportTicket.countDocuments({ priority: 'urgent', status: { $in: ['open','in_progress'] } })
    ]);
    res.json({ success: true, stats: { open, in_progress, resolved, urgent } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
