import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';

const CATEGORIES = [
  { slug:'games',         label:'Games',         icon:'🎮', color:'#1a3a6b' },
  { slug:'gift-cards',    label:'Gift Cards',    icon:'🎁', color:'#6b1a1a' },
  { slug:'software',      label:'Software',      icon:'💻', color:'#1a4a6b' },
  { slug:'ai-tools',      label:'AI Tools',      icon:'🤖', color:'#4a1a6b' },
  { slug:'game-items',    label:'Game Items',    icon:'⚔️', color:'#6b4a1a' },
  { slug:'accounts',      label:'Accounts',      icon:'👤', color:'#1a6b4a' },
  { slug:'subscriptions', label:'Subscriptions', icon:'📺', color:'#6b1a6b' },
  { slug:'top-up',        label:'Top Up',        icon:'⚡', color:'#6b6b1a' },
  { slug:'trending',      label:'🔥 Trending',   icon:'🔥', color:'#6b1a1a' },
  { slug:'best-value',    label:'💎 Global',     icon:'💎', color:'#1a4a4a' }
];

const DEMO_FEATURED = [
  { _id:'f1', name:'ChatGPT Plus 1 Month', price:19.99, category:'ai-tools', badge:'HOT', ratings:{average:5,count:567}, slug:'chatgpt-plus-1-month' },
  { _id:'f2', name:'Netflix Premium 1M', price:15.99, comparePrice:22.99, category:'subscriptions', badge:'SALE', ratings:{average:4.9,count:890}, slug:'netflix-premium-1m' },
  { _id:'f3', name:'Steam $50 Gift Card', price:47.99, category:'gift-cards', badge:'NEW', ratings:{average:4.8,count:312}, slug:'steam-50-gift-card' },
  { _id:'f4', name:'Valorant 1000 VP', price:9.99, comparePrice:12.99, category:'games', badge:'TRENDING', ratings:{average:5,count:1234}, slug:'valorant-1000-vp' },
  { _id:'f5', name:'Adobe CC All Apps', price:54.99, comparePrice:89.99, category:'software', badge:'SALE', ratings:{average:4.7,count:445}, slug:'adobe-cc-all-apps' },
  { _id:'f6', name:'Spotify Premium 3M', price:29.99, comparePrice:44.97, category:'subscriptions', badge:'HOT', ratings:{average:4.8,count:678}, slug:'spotify-premium-3m' },
  { _id:'f7', name:'Midjourney Basic', price:9.99, category:'ai-tools', badge:'NEW', ratings:{average:4.9,count:234}, slug:'midjourney-basic' },
  { _id:'f8', name:'PS Plus 12 Months', price:54.99, comparePrice:69.99, category:'games', badge:'SALE', ratings:{average:4.9,count:789}, slug:'ps-plus-12-months' }
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const params = { featured: true, limit: 8 };
        if (searchQuery) params.search = searchQuery;
        const { data } = await api.get('/api/products', { params });
        setFeatured(data.products?.length > 0 ? data.products : DEMO_FEATURED);
      } catch {
        setFeatured(DEMO_FEATURED);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [searchQuery]);

  return (
    <div>
      {/* Hero */}
      <section style={{ background:'radial-gradient(circle at 70% 50%,rgba(139,92,246,.25),transparent 60%),linear-gradient(135deg,#071224,#0f1f38)', padding:'80px 0', borderBottom:'1px solid var(--line)' }}>
        <div className="wrap" style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:40, alignItems:'center' }}>
          <div>
            <div style={{ display:'inline-block', background:'rgba(245,166,35,.15)', border:'1px solid rgba(245,166,35,.3)', borderRadius:999, padding:'6px 16px', fontSize:12, fontWeight:700, color:'var(--accent)', marginBottom:20 }}>🌍 INTERNATIONAL DIGITAL MARKETPLACE</div>
            <h1 style={{ fontSize:'clamp(32px,5vw,62px)', fontWeight:900, lineHeight:1.05, marginBottom:20 }}>
              Your Gateway to<br/><span style={{ background:'linear-gradient(90deg,var(--accent),#ffd36b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Digital Products</span>
            </h1>
            <p style={{ color:'var(--muted)', fontSize:18, lineHeight:1.7, maxWidth:560, marginBottom:32 }}>
              Games, Gift Cards, AI Tools, Software & Subscriptions. Instant delivery. Trusted payments. Global access.
            </p>
            <div className="flex gap-16" style={{ flexWrap:'wrap' }}>
              <Link to="/games" className="btn btn-primary btn-lg">🎮 Shop Now</Link>
              <Link to="/trending" className="btn btn-secondary btn-lg">🔥 Trending</Link>
            </div>
            <div className="flex gap-24" style={{ marginTop:32, flexWrap:'wrap' }}>
              {[['10,000+','Products'],['500K+','Customers'],['Instant','Delivery'],['24/7','Support']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize:22, fontWeight:800, color:'var(--accent)' }}>{v}</div>
                  <div style={{ fontSize:13, color:'var(--muted)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, maxWidth:280 }}>
            {CATEGORIES.slice(0,6).map(c => (
              <Link key={c.slug} to={`/${c.slug}`} style={{ background:`linear-gradient(135deg,${c.color},${c.color}aa)`, border:'1px solid rgba(255,255,255,.1)', borderRadius:14, padding:'16px', textAlign:'center', textDecoration:'none', transition:'transform .2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                onMouseLeave={e=>e.currentTarget.style.transform=''}>
                <div style={{ fontSize:26, marginBottom:4 }}>{c.icon}</div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{c.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <section style={{ padding:'32px 0', background:'var(--panel)', borderBottom:'1px solid var(--line)' }}>
        <div className="wrap">
          <div style={{ display:'flex', gap:12, overflowX:'auto', scrollbarWidth:'none', paddingBottom:4 }}>
            {CATEGORIES.map(c => (
              <Link key={c.slug} to={`/${c.slug}`} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, whiteSpace:'nowrap', fontWeight:600, fontSize:14, textDecoration:'none', transition:'all .2s', flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(245,166,35,.15)';e.currentTarget.style.borderColor='rgba(245,166,35,.4)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.05)';e.currentTarget.style.borderColor='rgba(255,255,255,.08)';}}>
                {c.icon} {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="wrap">
          <div className="flex-between mb-24">
            <div>
              <h2 className="section-title">{searchQuery ? `Results for "${searchQuery}"` : '⭐ Featured Products'}</h2>
              <p style={{ color:'var(--muted)', fontSize:15 }}>Handpicked deals across all categories</p>
            </div>
            <Link to="/trending" className="btn btn-secondary">View All →</Link>
          </div>
          {loading ? (
            <div className="flex-center" style={{ minHeight:200 }}><div className="spinner" /></div>
          ) : (
            <div className="grid-4">{featured.map(p => <ProductCard key={p._id} product={p} />)}</div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section style={{ padding:'0 0 60px' }}>
        <div className="wrap">
          <div style={{ background:'linear-gradient(135deg,rgba(245,166,35,.2),rgba(139,92,246,.2))', border:'1px solid rgba(245,166,35,.3)', borderRadius:20, padding:'40px', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--accent)', marginBottom:8 }}>🎉 SPECIAL OFFER</div>
              <h3 style={{ fontSize:28, fontWeight:900, marginBottom:10 }}>Get 20% Off Your First Order</h3>
              <p style={{ color:'var(--muted)', lineHeight:1.6 }}>Use code <strong style={{ color:'var(--accent)' }}>PLAYBEAT20</strong> at checkout. Valid for new customers only.</p>
            </div>
            <Link to="/register" className="btn btn-primary btn-lg">Claim Offer →</Link>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section style={{ padding:'0 0 60px' }}>
        <div className="wrap">
          <h3 style={{ textAlign:'center', fontSize:20, fontWeight:700, marginBottom:24, color:'var(--muted)' }}>Trusted Payment Methods</h3>
          <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            {[
              { logo:'💳', name:'Stripe', sub:'International Cards' },
              { logo:'🏦', name:'Bank Alfalah', sub:'PKR Payments' },
              { logo:'🕌', name:'Meezan Bank', sub:'Islamic Banking' },
              { logo:'📱', name:'JazzCash', sub:'Mobile Wallet' }
            ].map(p => (
              <div key={p.name} style={{ background:'var(--panel)', border:'1px solid var(--line)', borderRadius:14, padding:'16px 24px', textAlign:'center', minWidth:140 }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{p.logo}</div>
                <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{p.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
