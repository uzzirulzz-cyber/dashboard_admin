const router = require('express').Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');

// ─── STRIPE ──────────────────────────────────────────────────────────────────
const getStripe = () => require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/stripe/create-checkout', optionalAuth, async (req, res) => {
  try {
    const stripe = getStripe();
    const { items, couponCode, customerEmail, customerName, customerPhone, customerCountry } = req.body;

    // Build line items & verify stock
    const lineItems = [];
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.active) return res.status(400).json({ success: false, message: `Product ${item.productId} unavailable` });
      if (!product.unlimited && product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${product.name} out of stock` });
      }
      const price = product.price;
      subtotal += price * item.quantity;
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: product.name, images: product.thumbnail ? [product.thumbnail] : [], metadata: { productId: product._id.toString() } },
          unit_amount: Math.round(price * 100)
        },
        quantity: item.quantity
      });
      orderItems.push({ product: product._id, name: product.name, image: product.thumbnail, price, quantity: item.quantity });
    }

    // Create order in pending state
    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      subtotal,
      total: subtotal,
      currency: 'USD',
      paymentMethod: 'stripe',
      customerEmail: customerEmail || req.user?.email,
      customerName: customerName || req.user?.name,
      customerPhone,
      customerCountry,
      ipAddress: req.ip
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?cancelled=1`,
      customer_email: order.customerEmail,
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true }
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ success: true, sessionId: session.id, sessionUrl: session.url, orderNumber: order.orderNumber });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Stripe webhook
router.post('/stripe/webhook', require('express').raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await Order.findById(session.metadata.orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.stripePaymentIntentId = session.payment_intent;
      order.paymentId = session.payment_intent;
      order.completedAt = new Date();
      // Auto-deliver keys
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product && product.deliveryType === 'instant') {
          const keyObj = product.keys.find(k => !k.used);
          if (keyObj) {
            keyObj.used = true;
            keyObj.usedAt = new Date();
            item.deliveredKey = keyObj.key;
            item.deliveryStatus = 'delivered';
            product.stock = product.keys.filter(k => !k.used).length;
            await product.save();
          }
        }
        await Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.quantity } });
      }
      order.status = 'completed';
      await order.save();
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    await Order.findOneAndUpdate({ stripePaymentIntentId: pi.id }, { paymentStatus: 'failed', status: 'cancelled' });
  }

  res.json({ received: true });
});

// Stripe payment intent (embedded)
router.post('/stripe/create-intent', optionalAuth, async (req, res) => {
  try {
    const stripe = getStripe();
    const { amount, currency = 'usd', orderId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true }
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── BANK ALFALAH ─────────────────────────────────────────────────────────────
router.post('/alfalah/initiate', optionalAuth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const merchantId = process.env.ALFAPAY_MERCHANT_ID;
    const storeId = process.env.ALFAPAY_STORE_ID;
    const channelId = process.env.ALFAPAY_CHANNEL_ID;
    const returnUrl = process.env.ALFAPAY_RETURN_URL;
    const dateTime = new Date().toISOString().replace(/[-:T]/g, '').substr(0, 14);
    const txnRefNo = `PB${order.orderNumber}${dateTime}`;

    const hashStr = `${process.env.ALFAPAY_KEY_1}&${channelId}&${merchantId}&${storeId}&${txnRefNo}&${amount}&PKR&${returnUrl}&${process.env.ALFAPAY_KEY_2}`;
    const hash = crypto.createHash('sha256').update(hashStr).digest('hex').toUpperCase();

    const payload = {
      HS_ChannelId: channelId,
      HS_MerchantId: merchantId,
      HS_StoreId: storeId,
      HS_ReturnURL: returnUrl,
      HS_MerchantHash: hash,
      HS_MerchantUsername: process.env.ALFAPAY_MERCHANT_USERNAME,
      HS_MerchantPassword: process.env.ALFAPAY_MERCHANT_PASSWORD,
      HS_TransactionReferenceNo: txnRefNo,
      HS_RequestHash: hash,
      HS_IsRedirectionRequest: '0',
      HS_TransactionAmount: amount.toString(),
      HS_TransactionCurrency: 'PKR',
      HS_TransactionDateTime: dateTime,
      HS_BillReference: order.orderNumber,
      HS_Description: `PlayBeat Order ${order.orderNumber}`
    };

    order.paymentDetails = { provider: 'alfalah', txnRefNo };
    await order.save();

    res.json({ success: true, payload, apiUrl: process.env.ALFAPAY_API_URL });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/alfalah/callback', async (req, res) => {
  try {
    const data = req.body;
    const responseCode = data.HS_ResponseCode;
    const txnRef = data.HS_TransactionReferenceNo;
    const order = await Order.findOne({ 'paymentDetails.txnRefNo': txnRef });
    if (order) {
      if (responseCode === '00') {
        order.paymentStatus = 'paid';
        order.status = 'completed';
        order.paymentId = txnRef;
        order.completedAt = new Date();
      } else {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
      }
      await order.save();
    }
    res.redirect(`${process.env.FRONTEND_URL}/order-success?order=${order?.orderNumber || ''}`);
  } catch (e) {
    res.redirect(`${process.env.FRONTEND_URL}/checkout?error=1`);
  }
});

// ─── MEEZAN BANK ──────────────────────────────────────────────────────────────
router.post('/meezan/initiate', optionalAuth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const txnRef = `PB-MEZ-${order.orderNumber}`;
    order.paymentDetails = { provider: 'meezan', txnRef };
    await order.save();

    // Meezan PayPak / MezPay integration
    const payload = {
      username: process.env.MEZPAY_USERNAME,
      password: process.env.MEZPAY_PASSWORD,
      orderRef: txnRef,
      amount: amount.toString(),
      currency: 'PKR',
      successCallback: process.env.MEZPAY_SUCCESS_CALLBACK,
      failedCallback: process.env.MEZPAY_FAILED_CALLBACK,
      description: `PlayBeat Order ${order.orderNumber}`,
      iban: process.env.MEEZAN_IBAN,
      accountTitle: process.env.MEEZAN_ACCOUNT_TITLE
    };

    res.json({ success: true, payload, txnRef, bankDetails: { iban: process.env.MEEZAN_IBAN, title: process.env.MEEZAN_ACCOUNT_TITLE, amount } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/meezan/success', async (req, res) => {
  try {
    const { orderRef } = req.query;
    const order = await Order.findOne({ 'paymentDetails.txnRef': orderRef });
    if (order) { order.paymentStatus = 'paid'; order.status = 'completed'; order.completedAt = new Date(); await order.save(); }
    res.redirect(`${process.env.FRONTEND_URL}/order-success?order=${order?.orderNumber || ''}`);
  } catch (e) {
    res.redirect(`${process.env.FRONTEND_URL}/checkout?error=1`);
  }
});

router.get('/meezan/failed', async (req, res) => {
  const { orderRef } = req.query;
  const order = await Order.findOne({ 'paymentDetails.txnRef': orderRef });
  if (order) { order.paymentStatus = 'failed'; order.status = 'cancelled'; await order.save(); }
  res.redirect(`${process.env.FRONTEND_URL}/checkout?error=payment_failed`);
});

// ─── JAZZCASH ─────────────────────────────────────────────────────────────────
router.post('/jazzcash/initiate', optionalAuth, async (req, res) => {
  try {
    const { orderId, amount, mobileNumber } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const now = new Date();
    const formatDate = d => d.toISOString().replace(/[-:T.Z]/g, '').substr(0, 14);
    const txnDateTime = formatDate(now);
    const expiry = formatDate(new Date(now.getTime() + 3600000));
    const txnRefNo = `T${txnDateTime}`;
    const amountInPaisa = Math.round(amount * 100).toString();

    const hashStr = `${process.env.JAZZCASH_HASHKEY}&${amountInPaisa}&&${process.env.JAZZCASH_MERCHANTID}&${mobileNumber || process.env.JAZZCASH_MOBILE}&${process.env.JAZZCASH_MPIN}&PKR&${process.env.JAZZCASH_RETURNURL}&${txnRefNo}&${txnDateTime}&${expiry}&OTP&${order.orderNumber}`;
    const hash = crypto.createHmac('sha256', process.env.JAZZCASH_HASHKEY).update(hashStr).digest('hex');

    const payload = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: process.env.JAZZCASH_MERCHANTID,
      pp_Password: process.env.JAZZCASH_PASSWORD,
      pp_MobileNumber: mobileNumber || process.env.JAZZCASH_MOBILE,
      pp_CNIC: '',
      pp_Amount: amountInPaisa,
      pp_TxnRefNo: txnRefNo,
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiry,
      pp_ReturnURL: process.env.JAZZCASH_RETURNURL,
      pp_BillReference: order.orderNumber,
      pp_Description: `PlayBeat Order ${order.orderNumber}`,
      pp_SecureHash: hash,
      ppmpf_1: '', ppmpf_2: '', ppmpf_3: '', ppmpf_4: '', ppmpf_5: ''
    };

    order.paymentDetails = { provider: 'jazzcash', txnRefNo };
    await order.save();

    const apiUrl = process.env.JAZZCASH_PAYMENTMODE === 'production'
      ? process.env.JAZZCASH_PRODUCTION_URL
      : process.env.JAZZCASH_SANDBOX_URL;

    res.json({ success: true, payload, apiUrl });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/jazzcash/callback', async (req, res) => {
  try {
    const data = req.body;
    const responseCode = data.pp_ResponseCode;
    const txnRef = data.pp_TxnRefNo;
    const order = await Order.findOne({ 'paymentDetails.txnRefNo': txnRef });
    if (order) {
      if (responseCode === '000') {
        order.paymentStatus = 'paid';
        order.status = 'completed';
        order.paymentId = txnRef;
        order.completedAt = new Date();
      } else {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
      }
      await order.save();
    }
    res.redirect(`${process.env.FRONTEND_URL}/order-success?order=${order?.orderNumber || ''}`);
  } catch (e) {
    res.redirect(`${process.env.FRONTEND_URL}/checkout?error=1`);
  }
});

// ─── ADMIN: MANUAL PAYMENT CONFIRM ────────────────────────────────────────────
router.post('/manual/confirm', require('../middleware/auth').protect, require('../middleware/auth').admin, async (req, res) => {
  try {
    const { orderId, paymentRef } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.paymentStatus = 'paid';
    order.status = 'completed';
    order.paymentId = paymentRef;
    order.completedAt = new Date();
    await order.save();
    res.json({ success: true, order });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
