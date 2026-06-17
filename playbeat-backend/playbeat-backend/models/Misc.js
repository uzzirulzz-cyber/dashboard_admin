const mongoose = require('mongoose');

// ─── COUPON ────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent','fixed'], default: 'percent' },
  discountType: { type: String, enum: ['percent','fixed'], default: 'percent' },
  value: { type: Number, required: true },
  discountValue: { type: Number },
  minOrderAmount: { type: Number, default: 0 },
  maxUses: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  categories: [String],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  expiresAt: Date,
  active: { type: Boolean, default: true }
}, { timestamps: true });

// ─── SETTINGS ──────────────────────────────────────────────────────────
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  group: String
}, { timestamps: true });

// ─── CATEGORY ──────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: String,
  color: String,
  description: String,
  image: String,
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  seoTitle: String,
  seoDescription: String
}, { timestamps: true });

// ─── BANNER ────────────────────────────────────────────────────────────
const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  image: String,
  link: String,
  badge: String,
  ctaText: String,
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  type: { type: String, enum: ['hero','promo','announcement','slider'], default: 'promo' },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

// ─── HOMEPAGE BLOCK ────────────────────────────────────────────────────
const homepageBlockSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: String,
  type: { type: String, enum: ['hero','featured','categories','promo','announcements','slider','custom'], default: 'custom' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  data: mongoose.Schema.Types.Mixed  // flexible JSON content
}, { timestamps: true });

// ─── ANNOUNCEMENT ──────────────────────────────────────────────────────
const announcementSchema = new mongoose.Schema({
  text: { type: String, required: true },
  link: String,
  type: { type: String, enum: ['info','success','warning','danger'], default: 'info' },
  active: { type: Boolean, default: true },
  expiresAt: Date
}, { timestamps: true });

// ─── SUPPORT TICKET ────────────────────────────────────────────────────
const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String,
  guestName: String,
  subject: { type: String, required: true },
  category: { type: String, enum: ['billing','technical','general','refund','account'], default: 'general' },
  priority: { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  status: { type: String, enum: ['open','in_progress','waiting','resolved','closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    senderRole: String,
    content: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  resolvedAt: Date,
  closedAt: Date
}, { timestamps: true });

ticketSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    this.ticketNumber = 'TKT-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

// ─── SUBSCRIPTION PLAN ────────────────────────────────────────────────
const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  type: { type: String, enum: ['iptv','gaming','membership','software'], required: true },
  interval: { type: String, enum: ['monthly','quarterly','annual','lifetime'], required: true },
  price: { type: Number, required: true },
  comparePrice: Number,
  currency: { type: String, default: 'USD' },
  features: [String],
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  active: { type: Boolean, default: true },
  autoRenew: { type: Boolean, default: true },
  stripePriceId: String,
  trialDays: { type: Number, default: 0 }
}, { timestamps: true });

// ─── USER SUBSCRIPTION ────────────────────────────────────────────────
const userSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  planName: String,
  planInterval: String,
  status: { type: String, enum: ['active','cancelled','expired','paused','trial'], default: 'active' },
  autoRenew: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  trialEndsAt: Date,
  lastBilledAt: Date,
  nextBillingAt: Date,
  cancelledAt: Date,
  amount: Number,
  currency: { type: String, default: 'USD' },
  paymentMethod: String,
  stripeSubscriptionId: String,
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

// ─── AUDIT LOG ────────────────────────────────────────────────────────
const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: String,
  userRole: String,
  action: { type: String, required: true },
  resource: String,
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  success: { type: Boolean, default: true }
}, { timestamps: true });

// ─── PAYMENT LOG ──────────────────────────────────────────────────────
const paymentLogSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: String,
  gateway: { type: String, required: true },
  event: String,
  amount: Number,
  currency: String,
  status: String,
  gatewayRef: String,
  rawData: mongoose.Schema.Types.Mixed,
  ipAddress: String
}, { timestamps: true });

module.exports = {
  Coupon:           mongoose.model('Coupon', couponSchema),
  Settings:         mongoose.model('Settings', settingsSchema),
  Category:         mongoose.model('Category', categorySchema),
  Banner:           mongoose.model('Banner', bannerSchema),
  HomepageBlock:    mongoose.model('HomepageBlock', homepageBlockSchema),
  Announcement:     mongoose.model('Announcement', announcementSchema),
  SupportTicket:    mongoose.model('SupportTicket', ticketSchema),
  SubscriptionPlan: mongoose.model('SubscriptionPlan', subscriptionPlanSchema),
  UserSubscription: mongoose.model('UserSubscription', userSubscriptionSchema),
  AuditLog:         mongoose.model('AuditLog', auditLogSchema),
  PaymentLog:       mongoose.model('PaymentLog', paymentLogSchema),
};
