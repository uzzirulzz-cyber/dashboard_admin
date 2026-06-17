const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, country, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, country, phone });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = signToken(user._id);
    res.json({ success: true, token, user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, country, currency } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, country, currency }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { current, newPass } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!await user.comparePassword(current)) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = newPass;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Wishlist
router.get('/wishlist', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json({ success: true, wishlist: user.wishlist });
});

router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    const idx = user.wishlist.indexOf(pid);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(pid);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
