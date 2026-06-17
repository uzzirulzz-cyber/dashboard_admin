require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// CORS configuration to allow only your frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected — playbeat.digital'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  role: String,
  name: String,
});
const User = mongoose.model('User', userSchema);

// Create default admin user if not exists
async function createAdminUser() {
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log('Admin user already exists');
    return;
  }
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await User.create({
    email: process.env.ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
    name: 'PlayBeat Admin',
  });
  console.log('Admin user created');
}
createAdminUser().catch(console.error);

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Authenticated user info
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// TODO: Add other routes like products, orders, subscriptions

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`PlayBeat.digital API listening on port ${PORT}`);
});
