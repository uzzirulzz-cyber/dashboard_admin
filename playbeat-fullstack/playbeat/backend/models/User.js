const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  avatar: String,
  phone: String,
  country: String,
  currency: { type: String, default: 'USD' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{
    label: String,
    line1: String,
    line2: String,
    city: String,
    country: String,
    postalCode: String,
    isDefault: Boolean
  }],
  stripeCustomerId: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
