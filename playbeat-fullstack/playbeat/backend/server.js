require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();

// ─── SECURITY ─────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3001', 'https://playbeat.digital', 'https://www.playbeat.digital'],
  credentials: true
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests' } });
app.use('/api/', limiter);

// ─── BODY PARSER (raw for Stripe webhook, json for all else) ──────────────────
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── DB ───────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(e => console.error('❌ MongoDB error:', e.message));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin',    require('./routes/admin'));

// ─── CATEGORIES (public) ─────────────────────────────────────────────────────
const { Category, Banner } = require('./models/Misc');
app.get('/api/categories', async (req, res) => {
  const categories = await Category.find({ active: true }).sort({ order: 1 });
  res.json({ success: true, categories });
});
app.get('/api/banners', async (req, res) => {
  const now = new Date();
  const banners = await Banner.find({ active: true, $or: [{ endDate: { $gte: now } }, { endDate: null }] }).sort({ order: 1 });
  res.json({ success: true, banners });
});

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV, time: new Date() }));
app.get('/', (req, res) => res.json({ message: 'PlayBeat Digital API', version: '1.0.0' }));

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 PlayBeat API running on port ${process.env.PORT || 3000}`)
);

module.exports = app;
