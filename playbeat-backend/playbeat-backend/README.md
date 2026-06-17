# PlayBeat Backend — Render + MongoDB Atlas

## One-time Setup

### 1. MongoDB Atlas
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create cluster → free M0 tier is fine
3. Database Access → Add User: `admin` / strong password
4. Network Access → Add IP: `0.0.0.0/0` (allow all — Render IPs are dynamic)
5. Connect → Drivers → copy the URI:
   `mongodb+srv://admin:<password>@playbeat.umqpdyx.mongodb.net/playbeat?appName=playbeat`

### 2. Deploy to Render
1. Push this folder to a GitHub repo (`playbeat-backend`)
2. [render.com](https://render.com) → New → Web Service → connect repo
3. Settings auto-detected from `render.yaml`:
   - Build: `npm install`
   - Start: `node server.js`
4. Set these **Environment Variables** in Render dashboard:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://admin:PASSWORD@...` |
| `JWT_SECRET` | `RLTJLDFGLDJFGVC` (or generate a stronger one) |
| `FRONTEND_URL` | `https://playbeat.vercel.app` (your Vercel URL) |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From Stripe dashboard after adding webhook |
| `JAZZCASH_MERCHANTID` | Your JazzCash merchant ID |
| `JAZZCASH_PASSWORD` | Your JazzCash password |
| `JAZZCASH_HASHKEY` | Your JazzCash hash key |
| `ALFAPAY_MERCHANT_USERNAME` | Alfalah username |
| `ALFAPAY_MERCHANT_PASSWORD` | Alfalah password |
| `ALFAPAY_MERCHANT_HASH` | Alfalah hash |
| `ALFAPAY_KEY_1` | Alfalah key 1 |
| `ALFAPAY_KEY_2` | Alfalah key 2 |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password |

5. Deploy → your API will be at `https://playbeat-backend.onrender.com`

### 3. Seed the database (run once)
In Render dashboard → your service → Shell:
```bash
node seed.js
```
Or locally pointing at Atlas:
```bash
MONGODB_URI="mongodb+srv://..." node seed.js
```

Creates:
- Super Admin: `admin@playbeat.digital` / `Admin@123` ← **change immediately**
- Support: `support@playbeat.digital` / `Support@123`
- 8 categories, 4 subscription plans, 8 demo products, homepage blocks

### 4. Stripe Webhook
Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://playbeat-backend.onrender.com/api/payments/stripe/webhook`
- Events: `checkout.session.completed`, `payment_intent.payment_failed`
- Copy the `whsec_...` secret → set as `STRIPE_WEBHOOK_SECRET`

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/products` | — | List products |
| GET | `/api/products/:slug` | — | Product detail |
| GET | `/api/orders/my` | JWT | My orders |
| POST | `/api/orders/create-pending` | optional | Create order |
| POST | `/api/payments/stripe/create-checkout` | optional | Stripe checkout |
| POST | `/api/payments/jazzcash/initiate` | optional | JazzCash |
| POST | `/api/payments/alfalah/initiate` | optional | Alfalah |
| POST | `/api/payments/meezan/initiate` | optional | Meezan |
| GET | `/api/admin/dashboard` | admin | Dashboard stats |
| GET | `/api/analytics/dashboard` | staff | Analytics |
| GET | `/api/subscriptions/plans` | — | Plans list |
| POST | `/api/support` | optional | Create ticket |
| GET | `/health` | — | Health check |

## Local Development
```bash
cp .env.example .env   # fill in values
npm install
node seed.js           # seed database
npm run dev            # starts on :3000
```
