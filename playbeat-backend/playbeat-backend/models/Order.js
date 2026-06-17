const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    default: () => 'PB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase()
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String,
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    deliveredKey: String,
    deliveryStatus: { type: String, enum: ['pending','delivered','failed'], default: 'pending' }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: String,
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ['pending','processing','completed','cancelled','refunded','disputed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe','paypal','paddle','skrill','wise','revolut','jazzcash','easypaisa','alfalah','meezan','raast','bank_transfer','crypto_btc','crypto_eth','crypto_usdt_trc20','crypto_usdt_erc20','crypto_ltc','manual'],
    required: true
  },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paymentId: String,
  paymentDetails: mongoose.Schema.Types.Mixed,
  stripeSessionId: String,
  stripePaymentIntentId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  customerCountry: String,
  ipAddress: String,
  userAgent: String,
  adminNotes: String,
  deliveryNotes: String,
  invoiceUrl: String,
  completedAt: Date,
  refundedAt: Date,
  refundReason: String,
  refundAmount: Number
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
