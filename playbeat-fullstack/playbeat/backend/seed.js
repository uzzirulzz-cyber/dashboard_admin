/**
 * PlayBeat Seed Script
 * Creates admin user, sample categories, and demo products
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User    = require('./models/User');
const Product = require('./models/Product');
const { Category } = require('./models/Misc');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/playbeat';

const CATEGORIES = [
  { name:'Games',         slug:'games',         icon:'🎮', color:'#3b82f6' },
  { name:'Gift Cards',    slug:'gift-cards',     icon:'🎁', color:'#f59e0b' },
  { name:'Software',      slug:'software',       icon:'💻', color:'#8b5cf6' },
  { name:'AI Tools',      slug:'ai-tools',       icon:'🤖', color:'#06b6d4' },
  { name:'Game Items',    slug:'game-items',     icon:'⚔️',  color:'#ef4444' },
  { name:'Accounts',      slug:'accounts',       icon:'👤', color:'#22c55e' },
  { name:'Subscriptions', slug:'subscriptions',  icon:'📺', color:'#ec4899' },
  { name:'Top Up',        slug:'top-up',         icon:'💎', color:'#f97316' },
];

const PRODUCTS = [
  { name:'FIFA 25 PC Key', category:'games', price:29.99, originalPrice:59.99, stock:50, badges:['HOT'], description:'FIFA 25 Steam key, instant digital delivery.' },
  { name:'Netflix 1 Month Premium', category:'subscriptions', price:4.99, originalPrice:9.99, stock:100, badges:['BESTSELLER'], description:'Netflix Premium 4K account, 1 month.' },
  { name:'$50 Amazon Gift Card', category:'gift-cards', price:47.99, originalPrice:50, stock:30, badges:['TRENDING'], description:'USA Amazon Gift Card code - email delivery.' },
  { name:'Windows 11 Pro Key', category:'software', price:12.99, originalPrice:199, stock:80, badges:['SALE'], description:'Genuine Windows 11 Pro activation key.' },
  { name:'ChatGPT Plus 1 Month', category:'ai-tools', price:18.99, originalPrice:20, stock:20, badges:['NEW'], description:'ChatGPT Plus subscription code.' },
  { name:'PUBG 6300 UC', category:'top-up', price:7.99, originalPrice:9.99, stock:200, badges:['HOT'], description:'PUBG Mobile UC top-up, instant delivery.' },
  { name:'Fortnite Skull Trooper Account', category:'accounts', price:89.99, originalPrice:149, stock:5, badges:['RARE'], description:'OG Fortnite account with rare skins.' },
  { name:'Valorant Knife Bundle', category:'game-items', price:19.99, originalPrice:35, stock:15, badges:['TRENDING'], description:'Valorant in-game knife skin code.' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Admin user
  const existing = await User.findOne({ email: 'admin@playbeat.digital' });
  if (!existing) {
    await User.create({
      name: 'PlayBeat Admin',
      email: 'admin@playbeat.digital',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin created — email: admin@playbeat.digital  password: Admin@123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Categories
  for (const cat of CATEGORIES) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }
  console.log(`✅ ${CATEGORIES.length} categories seeded`);

  // Products
  for (const p of PRODUCTS) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    await Product.findOneAndUpdate({ slug }, { ...p, slug, keys:[], ratings:[], numReviews:0 }, { upsert: true, new: true });
  }
  console.log(`✅ ${PRODUCTS.length} demo products seeded`);

  await mongoose.disconnect();
  console.log('🎉 Seed complete!');
}

seed().catch(e => { console.error(e); process.exit(1); });
