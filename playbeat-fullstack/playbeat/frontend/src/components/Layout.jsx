import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';

const NAV = [
  { to: '/',              label: '🏠 Home' },
  { to: '/games',         label: '🎮 Games' },
  { to: '/gift-cards',    label: '🎁 Gift Cards' },
  { to: '/software',      label: '💻 Software' },
  { to: '/ai-tools',      label: '🤖 AI Tools' },
  { to: '/game-items',    label: '⚔️ Game Items' },
  { to: '/accounts',      label: '👤 Accounts' },
  { to: '/subscriptions', label: '📺 Subscriptions' },
  { to: '/top-up',        label: '⚡ Top Up' },
  { to: '/trending',      label: '🔥 Trending' },
  { to: '/best-value',    label: '💎 Global' }
];

const TICKER_ITEMS = [
  '🔥 Valorant Elderflame Bundle — $89','⚡ ChatGPT Plus 1M — $20','🎮 PS Plus 12M — $59',
  '💎 Adobe CC All Apps — $54','🤖 Midjourney Basic — $10','🆓 Free Gift Card on Orders $50+',
  '🔒 SSL Secured · Instant Delivery','🌍 International Payments Accepted','📦 Auto Digital Delivery'
];

export default function Layout() {
  const { itemCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  const ticker = [...TICKER_ITEMS, ...TICKER_ITEMS].map((t,i) => <span key={i}>{t}</span>);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search)}`);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-inner">{ticker}</div>
      </div>

      {/* Header */}
      <header style={{ background:'rgba(8,15,28,.95)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,.08)', position:'sticky', top:0, zIndex:100 }}>
        <div className="wrap">
          <div className="flex-between" style={{ padding:'14px 0', gap:16, flexWrap:'wrap' }}>
            {/* Logo */}
            <Link to="/" style={{ display:'flex', flexDirection:'column', textDecoration:'none' }}>
              <span style={{ fontSize:24, fontWeight:900, letterSpacing:'.8px' }}>
                PLAY<span style={{ color:'var(--accent)' }}>BEAT</span>
              </span>
              <span style={{ fontSize:10, color:'#6f86b1', letterSpacing:'2px', textTransform:'uppercase' }}>DIGITAL STORE</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ flex:1, maxWidth:480, display:'flex', gap:0 }}>
              <input
                className="input" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search games, subscriptions, AI tools..."
                style={{ borderRadius:'12px 0 0 12px', borderRight:'none' }}
              />
              <button type="submit" style={{ padding:'0 18px', background:'var(--accent)', border:'none', borderRadius:'0 12px 12px 0', color:'#07111f', fontWeight:700, cursor:'pointer', fontSize:18 }}>🔍</button>
            </form>

            {/* Actions */}
            <div className="flex gap-12" style={{ alignItems:'center' }}>
              <Link to="/cart" style={{ position:'relative', display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.07)', padding:'10px 16px', borderRadius:12, fontWeight:600, fontSize:14 }}>
                🛒 Cart
                {itemCount > 0 && (
                  <span style={{ position:'absolute', top:-6, right:-6, background:'var(--danger)', color:'white', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800 }}>{itemCount}</span>
                )}
              </Link>
              {user ? (
                <div className="flex gap-8" style={{ alignItems:'center' }}>
                  {user.role === 'admin' && <Link to="/admin" style={{ padding:'10px 14px', background:'rgba(139,92,246,.2)', border:'1px solid rgba(139,92,246,.4)', borderRadius:12, fontSize:13, fontWeight:600 }}>⚙️ Admin</Link>}
                  <Link to="/account" style={{ padding:'10px 14px', background:'rgba(255,255,255,.07)', borderRadius:12, fontSize:13, fontWeight:600 }}>👤 {user.name?.split(' ')[0]}</Link>
                  <button onClick={() => { logout(); navigate('/'); }} style={{ padding:'10px 14px', background:'rgba(255,107,107,.15)', border:'none', borderRadius:12, color:'var(--danger)', fontSize:13, fontWeight:600, cursor:'pointer' }}>Out</button>
                </div>
              ) : (
                <div className="flex gap-8">
                  <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                </div>
              )}
              <button onClick={() => setMobileMenu(m => !m)} style={{ display:'none', background:'none', border:'none', color:'white', fontSize:22, cursor:'pointer' }} className="hamburger">☰</button>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display:'flex', gap:4, padding:'0 0 10px', overflowX:'auto', scrollbarWidth:'none' }}>
            {NAV.map(n => (
              <Link key={n.to} to={n.to} style={{
                padding:'8px 14px', borderRadius:10, fontSize:13, fontWeight:600, whiteSpace:'nowrap',
                background: location.pathname === n.to ? 'linear-gradient(135deg,var(--accent),#ffd36b)' : 'rgba(255,255,255,.05)',
                color: location.pathname === n.to ? '#07111f' : 'var(--muted)',
                transition:'all .2s'
              }}>{n.label}</Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex:1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background:'var(--panel)', borderTop:'1px solid rgba(255,255,255,.06)', padding:'48px 0 24px' }}>
        <div className="wrap">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32, marginBottom:32 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:900, marginBottom:12 }}>PLAY<span style={{ color:'var(--accent)' }}>BEAT</span></div>
              <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>Your trusted source for digital games, software, AI tools, subscriptions and more. Instant delivery worldwide.</p>
            </div>
            <div>
              <div style={{ fontWeight:700, marginBottom:12 }}>Categories</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {['Games','Gift Cards','Software','AI Tools','Subscriptions'].map(c => (
                  <Link key={c} to={`/${c.toLowerCase().replace(' ','-')}`} style={{ color:'var(--muted)', fontSize:14 }}>{c}</Link>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight:700, marginBottom:12 }}>Account</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[['Login','/login'],['Register','/register'],['My Orders','/my-orders'],['Account','/account']].map(([l,t]) => (
                  <Link key={t} to={t} style={{ color:'var(--muted)', fontSize:14 }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight:700, marginBottom:12 }}>Payments</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8 }}>
                {['💳 Stripe','🏦 Bank Alfalah','🕌 Meezan','📱 JazzCash'].map(p => (
                  <span key={p} style={{ background:'rgba(255,255,255,.05)', padding:'6px 12px', borderRadius:8, fontSize:12, color:'var(--muted)' }}>{p}</span>
                ))}
              </div>
              <div style={{ marginTop:16, color:'var(--muted)', fontSize:12, lineHeight:1.6 }}>
                🔒 SSL Secured · Instant Delivery<br/>
                🌍 International Payments Accepted<br/>
                📧 support@playbeat.digital
              </div>
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <span style={{ color:'var(--muted)', fontSize:13 }}>© {new Date().getFullYear()} PlayBeat Digital (Private Limited). All rights reserved.</span>
            <div className="flex gap-12" style={{ fontSize:13, color:'var(--muted)' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Refund Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
