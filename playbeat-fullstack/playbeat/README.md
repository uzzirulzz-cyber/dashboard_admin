# PlayBeat Digital — Deployment Guide

## 🏗 Stack
| Layer | Service | URL |
|-------|---------|-----|
| Frontend (React + Vite) | Vercel | `https://playbeat.digital` |
| Backend (Node/Express) | Render | `https://api.playbeat.digital` |
| Database | MongoDB Atlas | `playbeat.umqpdyx.mongodb.net` |

---

## 🚀 Backend — Deploy to Render

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial PlayBeat backend"
git remote add origin https://github.com/YOUR_ORG/playbeat-backend.git
git push -u origin main
```

### 2. Create Render Web Service
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Node Version:** 18+

### 3. Set Environment Variables on Render
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@playbeat.umqpdyx.mongodb.net/playbeat?appName=playbeat
JWT_SECRET=RLTJLDFGLDJFGVC
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://playbeat.digital

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ACCOUNT_ID=acct_1TMvCGGTlnWXlnXp

# Bank Alfalah
ALFAPAY_API_URL=https://payments.bankalfalah.com/HS/api/HSAPI/HSAPI
ALFAPAY_MODE=production
ALFAPAY_CHANNEL_ID=1002
ALFAPAY_MERCHANT_ID=197
ALFAPAY_STORE_ID=000001
ALFAPAY_RETURN_URL=https://api.playbeat.digital/api/payments/alfalah/callback
ALFAPAY_MERCHANT_USERNAME=your_username
ALFAPAY_MERCHANT_PASSWORD=your_password
ALFAPAY_MERCHANT_HASH=your_hash
ALFAPAY_KEY_1=your_key_1
ALFAPAY_KEY_2=your_key_2

# Meezan Bank
MEZPAY_USERNAME=your_username
MEZPAY_PASSWORD=your_password
MEZPAY_SUCCESS_CALLBACK=https://playbeat.digital/order-success
MEZPAY_FAILED_CALLBACK=https://playbeat.digital/order-success?status=failed

# JazzCash
JAZZCASH_PRODUCTION_URL=https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction
JAZZCASH_SANDBOX_URL=https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction
JAZZCASH_MERCHANTID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_HASHKEY=your_hash_key
JAZZCASH_RETURNURL=https://api.playbeat.digital/api/payments/jazzcash/callback
JAZZCASH_PAYMENTMODE=production
JAZZCASH_MPIN=your_mpin
JAZZCASH_TIMEZONE=Asia/Karachi

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@playbeat.digital
```

### 4. Seed the Database
```bash
# Run locally pointing at Atlas:
MONGODB_URI=mongodb+srv://admin:PASSWORD@playbeat.umqpdyx.mongodb.net/playbeat node seed.js
```
This creates:
- Admin user: `admin@playbeat.digital` / `Admin@123` ← **change this immediately**
- 8 categories
- 8 demo products

### 5. Register Stripe Webhook
In Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://api.playbeat.digital/api/payments/stripe/webhook`
- Events: `checkout.session.completed`, `payment_intent.payment_failed`

---

## 🎨 Frontend — Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial PlayBeat frontend"
git remote add origin https://github.com/YOUR_ORG/playbeat-frontend.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

### 3. Set Environment Variables on Vercel
```
VITE_API_URL=https://api.playbeat.digital
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 4. Custom Domain
In Vercel → Settings → Domains → Add `playbeat.digital`

---

## 📁 Project Structure

```
playbeat/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT protect / admin / optionalAuth
│   ├── models/
│   │   ├── User.js          # Users, bcrypt, wishlist
│   │   ├── Product.js       # Products, keys, ratings
│   │   ├── Order.js         # Orders, payment tracking
│   │   └── Misc.js          # Coupon, Category, Banner, Settings
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── products.js      # CRUD + reviews + key management
│   │   ├── orders.js        # Orders + create-pending + admin stats
│   │   ├── payments.js      # Stripe, Alfalah, Meezan, JazzCash
│   │   └── admin.js         # Dashboard, users, coupons, settings
│   ├── server.js            # Express app entry
│   ├── seed.js              # Initial data seeder
│   ├── render.yaml          # Render deployment config
│   └── .env.example         # Environment variable template
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx       # Header + nav + footer
    │   │   └── ProductCard.jsx  # Product card component
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Product.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx     # Multi-gateway checkout
    │   │   ├── OrderSuccess.jsx
    │   │   ├── Trending.jsx
    │   │   ├── BestValue.jsx
    │   │   ├── category/        # Games, GiftCards, Software...
    │   │   ├── auth/            # Login, Register, Account, Orders
    │   │   └── admin/
    │   │       └── AdminLayout.jsx  # Full admin panel
    │   ├── store.js             # Zustand (auth + cart + toast)
    │   ├── utils/api.js         # Axios instance
    │   ├── App.jsx              # All routes
    │   └── index.css            # Design system / CSS vars
    ├── index.html
    ├── vite.config.js
    └── vercel.json
```

---

## 💳 Payment Gateway Summary

| Gateway | Type | Region | Status Display |
|---------|------|--------|----------------|
| **Stripe** | Card / International | Global | Logo shown, key hidden |
| **Bank Alfalah** | Bank Transfer | Pakistan | Logo shown, creds hidden |
| **Meezan Bank** | IBAN Transfer | Pakistan | IBAN shown at checkout |
| **JazzCash** | Mobile Wallet | Pakistan | Logo shown, creds hidden |

All gateway credentials live in server-side `.env` only — the frontend shows logos only. Admin panel has a Payments section showing gateway status and revenue, with no credentials visible.

---

## 🔐 Admin Panel
URL: `https://playbeat.digital/admin`

| Section | Description |
|---------|-------------|
| Dashboard | Revenue stats, recent orders |
| Products | Add/edit/delete products |
| Orders | View, update status, deliver keys |
| Users | Manage customers |
| Inventory | Add/view digital keys per product |
| Coupons | Create discount codes |
| Payments | Gateway status + revenue (no creds) |
| Settings | Store name, currency, etc. |

---

## 🛠 Local Development

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
npm install
node seed.js           # seed database
npm run dev            # nodemon server.js

# Frontend
cd frontend
npm install
npm run dev            # Vite dev server → http://localhost:5173
```

---

## 🔗 Nav Links
| Label | URL |
|-------|-----|
| Home | / |
| Games | /games |
| Gift Cards | /gift-cards |
| Software | /software |
| AI Tools | /ai-tools |
| Game Items | /game-items |
| Accounts | /accounts |
| Subscriptions | /subscriptions |
| Top Up | /top-up |
| 🔥 Trending | /trending |
| 💎 Global | /best-value |
