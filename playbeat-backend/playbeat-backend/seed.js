/**
 * PlayBeat Digital v2 — Seed Script
 * Creates super admin, staff roles, categories, subscription plans, homepage blocks, demo products
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User    = require('./models/User');
const Product = require('./models/Product');
const { Category, HomepageBlock, Announcement, Banner, SubscriptionPlan, Settings } = require('./models/Misc');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/playbeat';

const CATEGORIES = [
  { name:'Games',         slug:'games',         icon:'🎮', color:'#3b82f6', order:1 },
  { name:'Gift Cards',    slug:'gift-cards',     icon:'🎁', color:'#f59e0b', order:2 },
  { name:'Software',      slug:'software',       icon:'💻', color:'#8b5cf6', order:3 },
  { name:'AI Tools',      slug:'ai-tools',       icon:'🤖', color:'#06b6d4', order:4 },
  { name:'Game Items',    slug:'game-items',     icon:'⚔️',  color:'#ef4444', order:5 },
  { name:'Accounts',      slug:'accounts',       icon:'👤', color:'#22c55e', order:6 },
  { name:'Subscriptions', slug:'subscriptions',  icon:'📺', color:'#ec4899', order:7 },
  { name:'Top Up',        slug:'top-up',         icon:'💎', color:'#f97316', order:8 },
];

const PRODUCTS = [
  { name:'FIFA 25 PC Key', category:'games', price:29.99, comparePrice:59.99, stock:50, badge:'HOT', description:'FIFA 25 Steam key. Instant digital delivery.' },
  { name:'Netflix 1 Month Premium', category:'subscriptions', price:4.99, comparePrice:9.99, stock:100, badge:'BESTSELLER', description:'Netflix Premium 4K account, 1 month.' },
  { name:'$50 Amazon Gift Card', category:'gift-cards', price:47.99, comparePrice:50, stock:30, badge:'TRENDING', description:'USA Amazon Gift Card code.' },
  { name:'Windows 11 Pro Key', category:'software', price:12.99, comparePrice:199, stock:80, badge:'SALE', description:'Genuine Windows 11 Pro activation key.' },
  { name:'ChatGPT Plus 1 Month', category:'ai-tools', price:18.99, comparePrice:20, stock:20, badge:'NEW', description:'ChatGPT Plus subscription code.' },
  { name:'PUBG 6300 UC', category:'top-up', price:7.99, comparePrice:9.99, stock:200, badge:'HOT', description:'PUBG Mobile UC top-up, instant delivery.' },
  { name:'Fortnite OG Account', category:'accounts', price:89.99, comparePrice:149, stock:5, badge:'RARE', description:'OG Fortnite account with rare skins.' },
  { name:'Valorant Knife Bundle', category:'game-items', price:19.99, comparePrice:35, stock:15, badge:'TRENDING', description:'Valorant in-game knife skin code.' },
];

const HOMEPAGE_BLOCKS = [
  { key:'hero',       label:'Hero Banner',     type:'hero',       active:true, order:1, data:{ title:'Level Up Your Gaming', subtitle:'Instant digital delivery on keys, subscriptions & more' } },
  { key:'ticker',     label:'Announcement Ticker', type:'announcements', active:true, order:2, data:{} },
  { key:'categories', label:'Category Grid',   type:'categories', active:true, order:3, data:{} },
  { key:'featured',   label:'Featured Products', type:'featured', active:true, order:4, data:{} },
  { key:'promo1',     label:'Promo Banner 1',  type:'promo',      active:true, order:5, data:{ text:'🔥 Hot Deals Every Day', cta:'Shop Now', link:'/trending' } },
  { key:'trending',   label:'Trending Section', type:'featured',  active:true, order:6, data:{ title:'Trending This Week' } },
];

const SUBSCRIPTION_PLANS = [
  { name:'IPTV Monthly', type:'iptv', interval:'monthly', price:4.99, comparePrice:8.99, features:['1000+ Channels','HD & 4K Quality','7-Day Replay','24/7 Support'], autoRenew:true, active:true },
  { name:'IPTV Annual', type:'iptv', interval:'annual', price:39.99, comparePrice:79.99, features:['1000+ Channels','HD & 4K Quality','7-Day Replay','Priority Support','Free Updates'], autoRenew:true, active:true },
  { name:'Gaming Monthly', type:'gaming', interval:'monthly', price:9.99, comparePrice:14.99, features:['100+ Games','Cloud Saves','Multiplayer','Monthly New Titles'], autoRenew:true, active:true },
  { name:'Gaming Annual', type:'gaming', interval:'annual', price:79.99, comparePrice:119.99, features:['200+ Games','Cloud Saves','Multiplayer','Monthly New Titles','Exclusive Discounts','Early Access'], autoRenew:true, active:true },
];

const DEFAULT_SETTINGS = [
  { key:'store_name', value:'PlayBeat Digital', group:'general' },
  { key:'store_tagline', value:'Your trusted source for digital games & more', group:'general' },
  { key:'store_email', value:'support@playbeat.digital', group:'general' },
  { key:'store_currency', value:'USD', group:'general' },
  { key:'store_tax_rate', value:0, group:'general' },
  { key:'maintenance_mode', value:'off', group:'general' },
  { key:'order_prefix', value:'PB', group:'orders' },
  { key:'gateway_stripe_enabled', value:true, group:'gateway' },
  { key:'gateway_jazzcash_enabled', value:true, group:'gateway' },
  { key:'gateway_alfalah_enabled', value:true, group:'gateway' },
  { key:'gateway_meezan_enabled', value:true, group:'gateway' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Super Admin
  let superAdmin = await User.findOne({ email: 'admin@playbeat.digital' });
  if (!superAdmin) {
    superAdmin = await User.create({ name:'PlayBeat Super Admin', email:'admin@playbeat.digital', password:'Admin@123', role:'super_admin', isVerified:true });
    console.log('✅ Super Admin: admin@playbeat.digital / Admin@123  ← CHANGE THIS!');
  } else {
    superAdmin.role = 'super_admin';
    await superAdmin.save();
    console.log('ℹ️  Super Admin already exists — role updated to super_admin');
  }

  // Demo staff
  const staffUsers = [
    { name:'Support Agent', email:'support@playbeat.digital', password:'Support@123', role:'support' },
    { name:'Content Manager', email:'content@playbeat.digital', password:'Content@123', role:'content_manager' },
  ];
  for (const u of staffUsers) {
    const exists = await User.findOne({ email:u.email });
    if (!exists) { await User.create({ ...u, isVerified:true }); console.log(`✅ Staff: ${u.email} / ${u.password}`); }
  }

  // Categories
  for (const cat of CATEGORIES) {
    await Category.findOneAndUpdate({ slug:cat.slug }, cat, { upsert:true, new:true });
  }
  console.log(`✅ ${CATEGORIES.length} categories`);

  // Subscription plans
  for (const plan of SUBSCRIPTION_PLANS) {
    const slug = plan.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    await SubscriptionPlan.findOneAndUpdate({ slug }, { ...plan, slug }, { upsert:true, new:true });
  }
  console.log(`✅ ${SUBSCRIPTION_PLANS.length} subscription plans`);

  // Homepage blocks
  for (const block of HOMEPAGE_BLOCKS) {
    await HomepageBlock.findOneAndUpdate({ key:block.key }, block, { upsert:true, new:true });
  }
  console.log(`✅ ${HOMEPAGE_BLOCKS.length} homepage blocks`);

  // Default announcement
  const ann = await Announcement.findOne({ text: /PlayBeat/ });
  if (!ann) {
    await Announcement.create({ text:'🎉 Welcome to PlayBeat Digital — Instant delivery on all orders!', type:'success', active:true });
    console.log('✅ Welcome announcement');
  }

  // Default settings
  for (const s of DEFAULT_SETTINGS) {
    await Settings.findOneAndUpdate({ key:s.key }, s, { upsert:true });
  }
  console.log(`✅ ${DEFAULT_SETTINGS.length} default settings`);

  // Demo products
  for (const p of PRODUCTS) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    await Product.findOneAndUpdate({ slug }, { ...p, slug, keys:[], numReviews:0, featured: ['FIFA 25 PC Key','Netflix 1 Month Premium'].includes(p.name), active:true }, { upsert:true, new:true });
  }
  console.log(`✅ ${PRODUCTS.length} demo products`);

  await mongoose.disconnect();
  console.log('\n🎉 PlayBeat v2 seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin URL: https://your-domain.com/admin');
  console.log('Super Admin: admin@playbeat.digital');
  console.log('Password: Admin@123  ← CHANGE IMMEDIATELY');
}

seed().catch(e => { console.error(e); process.exit(1); });
