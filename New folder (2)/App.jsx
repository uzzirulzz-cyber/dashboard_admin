import { useState, useEffect, useCallback } from "react";

// ─── Design Tokens (Premium Silver Edition) ───────────────────────────────────
const T = {
  bg: "#050B18",
  surface: "#0B1424",
  surface2: "#111C30",
  border: "rgba(192,192,192,0.12)",
  border2: "rgba(192,192,192,0.20)",
  text: "#FFFFFF",
  muted: "#A8B3C7",
  accent: "#C0C0C0",
  accentGlow: "rgba(192,192,192,0.15)",
  accentBorder: "rgba(192,192,192,0.35)",
  cyan: "#DCE7F3",
  purple: "#8EA7C8",
  green: "#9FE2BF",
  red: "#FF6B81",
  r: "14px",
  rLg: "20px",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: "games",         label: "Games",         icon: "🎮", color: "#0d1f40", accent: "#8EA7C8" },
  { slug: "gift-cards",    label: "Gift Cards",    icon: "🎁", color: "#2a0f1a", accent: "#FF6B81" },
  { slug: "software",      label: "Software",      icon: "💻", color: "#0a1a2e", accent: "#DCE7F3" },
  { slug: "ai-tools",      label: "AI Tools",      icon: "🤖", color: "#160d2e", accent: "#8EA7C8" },
  { slug: "game-items",    label: "Game Items",    icon: "⚔️", color: "#1e1005", accent: "#C0C0C0" },
  { slug: "accounts",      label: "Accounts",      icon: "👤", color: "#0a2018", accent: "#9FE2BF" },
  { slug: "subscriptions", label: "Subscriptions", icon: "📺", color: "#1a0a1a", accent: "#8EA7C8" },
  { slug: "top-up",        label: "Top Up",        icon: "⚡", color: "#1a1a00", accent: "#C0C0C0" },
];

const PRODUCTS = [
  { id: "1",  name: "ChatGPT Plus 1 Month",     price: 19.99, comparePrice: null,  category: "ai-tools",      badge: "HOT",      rating: 5.0, reviews: 567,  slug: "chatgpt-plus-1m" },
  { id: "2",  name: "Netflix Premium 1 Month",  price: 15.99, comparePrice: 22.99, category: "subscriptions", badge: "SALE",     rating: 4.9, reviews: 890,  slug: "netflix-premium-1m" },
  { id: "3",  name: "Steam $50 Gift Card",       price: 47.99, comparePrice: null,  category: "gift-cards",    badge: "NEW",      rating: 4.8, reviews: 312,  slug: "steam-50-gift-card" },
  { id: "4",  name: "Valorant 1000 VP",          price: 9.99,  comparePrice: 12.99, category: "games",         badge: "TRENDING", rating: 5.0, reviews: 1234, slug: "valorant-1000-vp" },
  { id: "5",  name: "Adobe CC All Apps",         price: 54.99, comparePrice: 89.99, category: "software",      badge: "SALE",     rating: 4.7, reviews: 445,  slug: "adobe-cc" },
  { id: "6",  name: "Spotify Premium 3 Months", price: 29.99, comparePrice: 44.97, category: "subscriptions", badge: "HOT",      rating: 4.8, reviews: 678,  slug: "spotify-3m" },
  { id: "7",  name: "Midjourney Basic",          price: 9.99,  comparePrice: null,  category: "ai-tools",      badge: "NEW",      rating: 4.9, reviews: 234,  slug: "midjourney-basic" },
  { id: "8",  name: "PS Plus 12 Months",         price: 54.99, comparePrice: 69.99, category: "games",         badge: "SALE",     rating: 4.9, reviews: 789,  slug: "ps-plus-12m" },
  { id: "9",  name: "GitHub Copilot 1 Month",    price: 9.99,  comparePrice: 13.99, category: "software",      badge: "NEW",      rating: 4.8, reviews: 156,  slug: "github-copilot" },
  { id: "10", name: "Xbox Game Pass 3 Months",   price: 39.99, comparePrice: 59.99, category: "games",         badge: "HOT",      rating: 4.9, reviews: 921,  slug: "xbox-gamepass" },
  { id: "11", name: "Google Play $25",           price: 23.99, comparePrice: null,  category: "gift-cards",    badge: null,       rating: 4.7, reviews: 203,  slug: "google-play-25" },
  { id: "12", name: "Fortnite 2800 V-Bucks",    price: 19.99, comparePrice: 24.99, category: "games",         badge: "TRENDING", rating: 5.0, reviews: 432,  slug: "fortnite-2800" },
];

const BADGE_COLORS = {
  HOT:      { bg: "linear-gradient(135deg,#FF6B81,#cc4060)", text: "#fff" },
  SALE:     { bg: "linear-gradient(135deg,#C0C0C0,#8ea7c8)", text: "#050B18" },
  NEW:      { bg: "linear-gradient(135deg,#8EA7C8,#6b8aaa)", text: "#fff" },
  TRENDING: { bg: "linear-gradient(135deg,#9FE2BF,#6bbf99)", text: "#050B18" },
};

const CAT_COLOR = {
  "games":         "linear-gradient(135deg,#0d1f40,#0a1428)",
  "gift-cards":    "linear-gradient(135deg,#2a0f1a,#1a0a12)",
  "software":      "linear-gradient(135deg,#0a1a2e,#091522)",
  "ai-tools":      "linear-gradient(135deg,#160d2e,#0e0820)",
  "game-items":    "linear-gradient(135deg,#1e1005,#140b03)",
  "accounts":      "linear-gradient(135deg,#0a2018,#071510)",
  "subscriptions": "linear-gradient(135deg,#1a0a1a,#110710)",
  "top-up":        "linear-gradient(135deg,#1a1a00,#111100)",
};

const CAT_ICON = { games:"🎮","gift-cards":"🎁","software":"💻","ai-tools":"🤖","game-items":"⚔️","accounts":"👤","subscriptions":"📺","top-up":"⚡" };

// ─── State ────────────────────────────────────────────────────────────────────
let cartState = [];
let cartListeners = [];
const getCart = () => cartState;
const setCart = (fn) => {
  cartState = fn(cartState);
  cartListeners.forEach(l => l(cartState));
};
const useCart = () => {
  const [cart, setLocalCart] = useState(cartState);
  useEffect(() => {
    cartListeners.push(setLocalCart);
    return () => { cartListeners = cartListeners.filter(l => l !== setLocalCart); };
  }, []);
  return cart;
};
const addToCart = (product) => {
  setCart(items => {
    const existing = items.find(i => i.id === product.id);
    if (existing) return items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
    return [...items, { ...product, qty: 1 }];
  });
};
const removeFromCart = (id) => setCart(items => items.filter(i => i.id !== id));
const updateQty = (id, qty) => {
  if (qty < 1) { removeFromCart(id); return; }
  setCart(items => items.map(i => i.id === id ? { ...i, qty } : i));
};
const clearCart = () => setCart(() => []);

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastState = [];
let toastListeners = [];
const addToast = (msg, type = "info") => {
  const id = Date.now();
  toastState = [...toastState, { id, msg, type }];
  toastListeners.forEach(l => l(toastState));
  setTimeout(() => {
    toastState = toastState.filter(t => t.id !== id);
    toastListeners.forEach(l => l(toastState));
  }, 3000);
};
const useToasts = () => {
  const [toasts, setToasts] = useState(toastState);
  useEffect(() => {
    toastListeners.push(setToasts);
    return () => { toastListeners = toastListeners.filter(l => l !== setToasts); };
  }, []);
  return toasts;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: ${T.bg}; color: ${T.text}; min-height: 100vh; overflow-x: hidden; }
  a { text-decoration: none; color: inherit; }
  button { font-family: inherit; cursor: pointer; border: none; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${T.surface}; }
  ::-webkit-scrollbar-thumb { background: rgba(192,192,192,0.2); border-radius: 3px; }

  .wrap { width: min(1280px, calc(100% - 32px)); margin: 0 auto; }

  /* Buttons — silver-first palette */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; transition: all 0.18s; white-space: nowrap; border: none; cursor: pointer; }
  .btn-primary { background: linear-gradient(135deg, #d8d8d8, #a0a8b8); color: #050B18; }
  .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(192,192,192,0.25); }
  .btn-secondary { background: rgba(192,192,192,0.08); color: ${T.text}; border: 1px solid ${T.border2}; }
  .btn-secondary:hover { background: rgba(192,192,192,0.14); border-color: ${T.accentBorder}; }
  .btn-ghost { background: transparent; color: ${T.muted}; }
  .btn-ghost:hover { color: ${T.text}; background: rgba(192,192,192,0.06); }
  .btn-lg { padding: 14px 28px; font-size: 15px; border-radius: 12px; }
  .btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 8px; }
  .btn-danger { background: rgba(255,107,129,0.12); color: ${T.red}; border: 1px solid rgba(255,107,129,0.3); }
  .btn-danger:hover { background: rgba(255,107,129,0.22); }

  .card { background: ${T.surface}; border-radius: ${T.rLg}; border: 1px solid ${T.border}; }

  .input { width: 100%; padding: 11px 14px; border-radius: 10px; background: rgba(192,192,192,0.05); border: 1px solid ${T.border2}; color: ${T.text}; font-size: 14px; font-family: inherit; transition: border-color 0.2s; outline: none; }
  .input:focus { border-color: ${T.accentBorder}; background: rgba(192,192,192,0.08); box-shadow: 0 0 0 3px rgba(192,192,192,0.08); }
  .input::placeholder { color: ${T.muted}; }

  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  @media (max-width: 1100px) { .grid-4 { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 768px) { .grid-4, .grid-3 { grid-template-columns: repeat(2, 1fr); } .grid-2 { grid-template-columns: 1fr; } }
  @media (max-width: 480px) { .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; } }

  .product-card { transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s; cursor: pointer; overflow: hidden; }
  .product-card:hover { transform: translateY(-6px); border-color: rgba(192,192,192,0.30); box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(192,192,192,0.08); }

  /* Silver shimmer ticker */
  .ticker { overflow: hidden; white-space: nowrap; padding: 9px 0; background: linear-gradient(90deg, rgba(192,192,192,0.06), rgba(142,167,200,0.08), rgba(192,192,192,0.06)); border-bottom: 1px solid ${T.border}; font-size: 12px; color: ${T.accent}; font-weight: 500; letter-spacing: 0.03em; }
  .ticker-inner { display: inline-block; animation: marquee 36s linear infinite; }
  .ticker-inner span { padding: 0 32px; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  .spinner { width: 34px; height: 34px; border-radius: 50%; border: 3px solid rgba(192,192,192,0.1); border-top-color: ${T.accent}; animation: spin 0.75s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .toast-item { padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; backdrop-filter: blur(20px); animation: toastIn 0.25s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.5); cursor: pointer; }
  @keyframes toastIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .nav-link { padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; white-space: nowrap; transition: all 0.18s; color: ${T.muted}; background: transparent; }
  .nav-link:hover { color: ${T.text}; background: rgba(192,192,192,0.07); }
  .nav-link.active { background: rgba(192,192,192,0.12); color: ${T.text}; border: 1px solid ${T.accentBorder}; }

  .section { padding: 64px 0; }
  .section-title { font-size: 26px; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.02em; }
  .section-sub { color: ${T.muted}; font-size: 14px; margin-bottom: 28px; }

  .star-row { color: #C0C0C0; font-size: 12px; letter-spacing: 1px; }
  .badge-pill { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; }
  .tag { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; background: rgba(192,192,192,0.07); color: ${T.muted}; border: 1px solid ${T.border}; }

  .page-fade { animation: fadein 0.28s ease; }
  @keyframes fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .qty-btn { width: 34px; height: 34px; border-radius: 8px; background: rgba(192,192,192,0.08); border: none; color: ${T.text}; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .qty-btn:hover { background: rgba(192,192,192,0.16); }

  .cart-badge { position: absolute; top: -7px; right: -7px; background: ${T.red}; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; }

  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; text-align: center; }

  /* Sheen effect on product card image */
  .card-img-wrap { position: relative; overflow: hidden; }
  .card-img-wrap::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) 80%); pointer-events: none; }

  /* Silver divider */
  .silver-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(192,192,192,0.2), transparent); margin: 0; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="star-row">
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

function Badge({ type }) {
  if (!type) return null;
  const c = BADGE_COLORS[type] || { bg: "#555", text: "#fff" };
  return <span className="badge-pill" style={{ background: c.bg, color: c.text }}>{type}</span>;
}

function ProductCard({ product, onClick }) {
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    addToast(`${product.name} added to cart!`, "success");
  };

  return (
    <div className="card product-card" onClick={() => onClick(product)}>
      <div className="card-img-wrap" style={{ height: 180, background: CAT_COLOR[product.category] || "linear-gradient(135deg,#0d1a30,#1a0d30)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 52, opacity: 0.35, filter: "drop-shadow(0 0 20px rgba(192,192,192,0.15))" }}>{CAT_ICON[product.category] || "📦"}</span>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          <Badge type={product.badge} />
        </div>
        {discount > 0 && (
          <span style={{ position: "absolute", top: 10, right: 10, background: T.green, color: "#050B18", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>-{discount}%</span>
        )}
        <button
          onClick={handleAdd}
          style={{ position: "absolute", bottom: 10, right: 10, width: 36, height: 36, borderRadius: "50%", background: "rgba(192,192,192,0.15)", border: `1px solid rgba(192,192,192,0.35)`, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s", backdropFilter: "blur(8px)" }}
          title="Add to cart"
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.background = "rgba(192,192,192,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "rgba(192,192,192,0.15)"; }}
        >🛒</button>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 10, color: T.purple, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>
          {product.category.replace(/-/g, " ")}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {product.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Stars rating={product.rating} />
          <span style={{ color: T.muted, fontSize: 11 }}>({product.reviews})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: T.text }}>${product.price}</span>
            {product.comparePrice && <span style={{ textDecoration: "line-through", color: T.muted, fontSize: 13 }}>${product.comparePrice}</span>}
          </div>
          <button onClick={handleAdd} className="btn btn-primary btn-sm">Add</button>
        </div>
      </div>
    </div>
  );
}

function Toasts() {
  const toasts = useToasts();
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-item" style={{
          background: t.type === "error" ? "rgba(255,107,129,0.12)" : t.type === "success" ? "rgba(159,226,191,0.12)" : "rgba(192,192,192,0.12)",
          border: `1px solid ${t.type === "error" ? "rgba(255,107,129,0.4)" : t.type === "success" ? "rgba(159,226,191,0.4)" : "rgba(192,192,192,0.3)"}`,
          color: t.type === "error" ? T.red : t.type === "success" ? T.green : T.accent,
        }}>
          {t.type === "error" ? "✕ " : t.type === "success" ? "✓ " : "· "}{t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage({ setPage }) {
  return (
    <div className="page-fade">
      {/* Hero */}
      <section style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(142,167,200,0.12) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(159,226,191,0.07) 0%, transparent 50%), linear-gradient(160deg, #07112a 0%, #050B18 100%)", padding: "96px 0 80px", borderBottom: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
        {/* Ambient silver orbs */}
        <div style={{ position: "absolute", top: "10%", right: "8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(192,192,192,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(142,167,200,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 56, alignItems: "center", position: "relative" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accentGlow, border: `1px solid ${T.accentBorder}`, borderRadius: 999, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 24, letterSpacing: "0.1em" }}>
              ✦ INTERNATIONAL DIGITAL MARKETPLACE
            </div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 20, letterSpacing: "-0.03em" }}>
              Your Gateway to<br />
              <span style={{ background: `linear-gradient(90deg, ${T.text}, ${T.accent}, ${T.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Digital Products</span>
            </h1>
            <p style={{ color: T.muted, fontSize: 17, lineHeight: 1.75, maxWidth: 520, marginBottom: 36 }}>
              Games, Gift Cards, AI Tools, Software & Subscriptions. Instant delivery. Trusted payments. Global access.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg" onClick={() => setPage("category", "games")}>🎮 Shop Games</button>
              <button className="btn btn-secondary btn-lg" onClick={() => setPage("trending")}>🔥 Trending Now</button>
            </div>
            <div style={{ display: "flex", gap: 36, marginTop: 40, flexWrap: "wrap" }}>
              {[["10K+","Products"],["500K+","Customers"],["Instant","Delivery"],["24/7","Support"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{v}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {CATEGORIES.slice(0, 6).map(c => (
              <button key={c.slug} onClick={() => setPage("category", c.slug)} style={{
                background: `${CAT_COLOR[c.slug]}, rgba(192,192,192,0.02)`,
                border: `1px solid rgba(192,192,192,0.10)`, borderRadius: T.r, padding: "18px 12px",
                textAlign: "center", cursor: "pointer", transition: "all 0.22s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = `rgba(192,192,192,0.30)`; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(192,192,192,0.10)"; e.currentTarget.style.boxShadow = ""; }}
              >
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text, letterSpacing: "0.03em" }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="silver-divider" />

      {/* Category strip */}
      <section style={{ padding: "20px 0", background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <div className="wrap">
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
            {CATEGORIES.map(c => (
              <button key={c.slug} onClick={() => setPage("category", c.slug)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
                background: "rgba(192,192,192,0.05)", border: `1px solid ${T.border}`,
                borderRadius: 10, whiteSpace: "nowrap", fontWeight: 600, fontSize: 13,
                color: T.muted, cursor: "pointer", flexShrink: 0, transition: "all 0.18s"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.accentGlow; e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.color = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(192,192,192,0.05)"; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section">
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h2 className="section-title">✦ Featured Products</h2>
              <p className="section-sub">Handpicked deals across all categories</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setPage("trending")}>View All →</button>
          </div>
          <div className="grid-4">
            {PRODUCTS.slice(0, 8).map(p => <ProductCard key={p.id} product={p} onClick={(prod) => setPage("product", prod.slug, prod)} />)}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section style={{ paddingBottom: 64 }}>
        <div className="wrap">
          <div style={{ background: `linear-gradient(135deg, rgba(192,192,192,0.07), rgba(142,167,200,0.10))`, border: `1px solid ${T.accentBorder}`, borderRadius: T.rLg, padding: "44px 52px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -40, top: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(192,192,192,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>✦ Special Offer</div>
              <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.01em" }}>Get 20% Off Your First Order</h3>
              <p style={{ color: T.muted }}>Use code <strong style={{ color: T.text, background: "rgba(192,192,192,0.1)", padding: "2px 8px", borderRadius: 6, border: `1px solid ${T.border2}` }}>PLAYBEAT20</strong> at checkout. New customers only.</p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => setPage("register")}>Claim Offer →</button>
          </div>
        </div>
      </section>

      {/* Payment methods */}
      <section style={{ paddingBottom: 64 }}>
        <div className="wrap">
          <h3 style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 24 }}>Trusted Payment Methods</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            {[{icon:"💳",name:"Stripe",sub:"Int'l Cards"},{icon:"🏦",name:"Bank Alfalah",sub:"PKR"},{icon:"🕌",name:"Meezan",sub:"Islamic"},{icon:"📱",name:"JazzCash",sub:"Mobile"}].map(p => (
              <div key={p.name} className="card" style={{ padding: "16px 24px", textAlign: "center", minWidth: 120, transition: "border-color 0.18s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.accentBorder}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{p.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryPage({ category, setPage }) {
  const cat = CATEGORIES.find(c => c.slug === category) || CATEGORIES[0];
  const products = PRODUCTS.filter(p => p.category === category);
  const allIfEmpty = products.length === 0 ? PRODUCTS : products;

  return (
    <div className="page-fade">
      <div style={{ background: `linear-gradient(135deg, rgba(142,167,200,0.08), ${T.surface})`, padding: "52px 0 40px", borderBottom: `1px solid ${T.border}` }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 72, height: 72, borderRadius: T.r, background: "rgba(192,192,192,0.08)", border: `1px solid ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
              {cat.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Browse</div>
              <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.02em" }}>{cat.label}</h1>
              <div style={{ color: T.muted, fontSize: 14, marginTop: 4 }}>{allIfEmpty.length} products available</div>
            </div>
          </div>
        </div>
      </div>
      <section className="section">
        <div className="wrap">
          {allIfEmpty.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 64 }}>{cat.icon}</span>
              <h2>Coming soon</h2>
              <p style={{ color: T.muted }}>Products in this category are being added.</p>
              <button className="btn btn-primary" onClick={() => setPage("home")}>Back to Home</button>
            </div>
          ) : (
            <div className="grid-4">
              {allIfEmpty.map(p => <ProductCard key={p.id} product={p} onClick={(prod) => setPage("product", prod.slug, prod)} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductPage({ product, setPage }) {
  const [qty, setQty] = useState(1);
  const discount = product?.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  if (!product) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: 64 }}>📦</span>
        <h2>Product not found</h2>
        <button className="btn btn-primary" onClick={() => setPage("home")}>Back to Home</button>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    addToast(`${product.name} added to cart!`, "success");
  };

  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="page-fade">
      <div className="wrap" style={{ padding: "40px 0" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.muted, fontSize: 13, marginBottom: 36 }}>
          <button className="btn-ghost" style={{ padding: "4px 0", fontSize: 13, background: "none", color: T.muted }} onClick={() => setPage("home")}>Home</button>
          <span style={{ color: T.border2 }}>/</span>
          <button className="btn-ghost" style={{ padding: "4px 0", fontSize: 13, background: "none", color: T.muted }} onClick={() => setPage("category", product.category)}>{product.category.replace(/-/g," ")}</button>
          <span style={{ color: T.border2 }}>/</span>
          <span style={{ color: T.text }}>{product.name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "start" }}>
          {/* Image */}
          <div>
            <div className="card-img-wrap" style={{ height: 360, borderRadius: T.rLg, background: CAT_COLOR[product.category] || "linear-gradient(135deg,#0d1a30,#1a0d30)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 90, position: "relative", border: `1px solid ${T.border}` }}>
              <span style={{ opacity: 0.35, filter: "drop-shadow(0 0 40px rgba(192,192,192,0.2))" }}>{CAT_ICON[product.category] || "📦"}</span>
              {product.badge && <div style={{ position: "absolute", top: 16, left: 16 }}><Badge type={product.badge} /></div>}
              {discount > 0 && (
                <span style={{ position: "absolute", top: 16, right: 16, background: T.green, color: "#050B18", borderRadius: 999, padding: "4px 12px", fontSize: 13, fontWeight: 800 }}>Save {discount}%</span>
              )}
            </div>

            {/* Trust badges */}
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[["✅","Instant","Delivery"],["🔒","Secure","Payment"],["🌍","Global","Access"]].map(([icon, l1, l2]) => (
                <div key={l1} className="card" style={{ padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{l1}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{l2}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ fontSize: 11, color: T.purple, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              {product.category.replace(/-/g, " ")}
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 14, letterSpacing: "-0.02em" }}>{product.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Stars rating={product.rating} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{product.rating.toFixed(1)}</span>
              <span style={{ color: T.muted, fontSize: 13 }}>({product.reviews} reviews)</span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 26 }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: T.text }}>${product.price}</span>
              {product.comparePrice && <span style={{ textDecoration: "line-through", color: T.muted, fontSize: 20 }}>${product.comparePrice}</span>}
              {discount > 0 && (
                <span style={{ background: "rgba(159,226,191,0.12)", color: T.green, border: `1px solid rgba(159,226,191,0.3)`, borderRadius: 999, padding: "3px 12px", fontSize: 13, fontWeight: 700 }}>Save {discount}%</span>
              )}
            </div>

            <p style={{ color: T.muted, lineHeight: 1.75, marginBottom: 26, fontSize: 14 }}>
              Instant digital delivery. Works globally. Authentic key/code guaranteed. Questions? Our support team responds in minutes.
            </p>

            {/* Qty + Add */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 0, background: "rgba(192,192,192,0.06)", borderRadius: 10, border: `1px solid ${T.border2}`, overflow: "hidden" }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span style={{ padding: "0 16px", fontWeight: 700, fontSize: 16, minWidth: 44, textAlign: "center" }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button className="btn btn-primary" style={{ flex: 1, padding: "13px", fontSize: 15 }} onClick={handleAdd}>
                🛒 Add to Cart
              </button>
            </div>

            <div style={{ background: "rgba(159,226,191,0.06)", border: `1px solid rgba(159,226,191,0.2)`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: T.green, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>✅ Instant Digital Delivery</div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>Delivered instantly after payment. Check your email and orders page.</div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h2 className="section-title">Related Products</h2>
            <p className="section-sub">More in {product.category.replace(/-/g," ")}</p>
            <div className="grid-4">
              {related.map(p => <ProductCard key={p.id} product={p} onClick={(prod) => setPage("product", prod.slug, prod)} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CartPage({ setPage }) {
  const cart = useCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="empty-state page-fade">
        <span style={{ fontSize: 72 }}>🛒</span>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Your cart is empty</h2>
        <p style={{ color: T.muted }}>Browse our store and find something you love.</p>
        <button className="btn btn-primary btn-lg" onClick={() => setPage("home")}>Shop Now</button>
      </div>
    );
  }

  return (
    <div className="wrap page-fade" style={{ padding: "40px 0" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 32, letterSpacing: "-0.02em" }}>🛒 Shopping Cart</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cart.map(item => (
            <div key={item.id} className="card" style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", transition: "border-color 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.border2}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              <div style={{ width: 64, height: 64, borderRadius: 12, background: CAT_COLOR[item.category] || "linear-gradient(135deg,#0d1a30,#1a0d30)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {CAT_ICON[item.category] || "📦"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                <div style={{ color: T.muted, fontSize: 12, textTransform: "capitalize" }}>{item.category?.replace(/-/g," ")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, background: "rgba(192,192,192,0.06)", borderRadius: 9, border: `1px solid ${T.border}`, overflow: "hidden" }}>
                <button className="qty-btn" style={{ width: 30, height: 30, borderRadius: "7px 0 0 7px" }} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                <span style={{ padding: "0 10px", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                <button className="qty-btn" style={{ width: 30, height: 30, borderRadius: "0 7px 7px 0" }} onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, minWidth: 70, textAlign: "right" }}>${(item.price * item.qty).toFixed(2)}</div>
              <button className="btn-danger btn" style={{ padding: "6px 10px", fontSize: 14 }} onClick={() => removeFromCart(item.id)}>🗑</button>
            </div>
          ))}
          <button className="btn btn-ghost" style={{ alignSelf: "flex-start", color: T.red, fontSize: 13 }} onClick={clearCart}>Clear cart</button>
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: "24px", position: "sticky", top: 90 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, letterSpacing: "-0.01em" }}>Order Summary</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: T.muted }}>{item.name} ×{item.qty}</span>
              <span style={{ fontWeight: 600 }}>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: 26, color: T.text }}>${subtotal.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={() => setPage("checkout")}>
            Proceed to Checkout →
          </button>
          <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10, fontSize: 13 }} onClick={() => setPage("home")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ setPage }) {
  const cart = useCart();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", country: "PK", address: "", method: "stripe" });
  const [loading, setLoading] = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const placeOrder = () => {
    setLoading(true);
    setTimeout(() => {
      clearCart();
      addToast("Order placed! Check your email.", "success");
      setPage("order-success");
    }, 1500);
  };

  if (cart.length === 0) {
    setPage("cart");
    return null;
  }

  return (
    <div className="wrap page-fade" style={{ padding: "40px 0" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.02em" }}>Checkout</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 36 }}>
        {[1, 2].map(s => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: step >= s ? T.text : T.muted }}>
            <span style={{ width: 26, height: 26, borderRadius: "50%", background: step >= s ? "linear-gradient(135deg,#d8d8d8,#a0a8b8)" : T.surface2, border: `2px solid ${step >= s ? T.accentBorder : T.border2}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: step >= s ? "#050B18" : T.muted, fontWeight: 800 }}>{s}</span>
            {s === 1 ? "Details" : "Payment"}
            {s < 2 && <span style={{ color: T.border2, marginLeft: 2 }}>—</span>}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
        <div className="card" style={{ padding: "28px" }}>
          {step === 1 ? (
            <div>
              <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Your Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[["Full Name","text","name","John Doe"],["Email Address","email","email","you@example.com"]].map(([label, type, key, ph]) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <input className="input" type={type} value={form[key]} onChange={upd(key)} placeholder={ph} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 600 }}>Country</label>
                  <select className="input" value={form.country} onChange={upd("country")}>
                    <option value="PK">Pakistan</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AE">UAE</option>
                    <option value="IN">India</option>
                    <option value="SA">Saudi Arabia</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 24, padding: "13px 28px" }} disabled={!form.name || !form.email} onClick={() => setStep(2)}>
                Continue to Payment →
              </button>
            </div>
          ) : (
            <div>
              <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Payment Method</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[{value:"stripe",label:"💳 Credit / Debit Card (Stripe)"},{value:"bank",label:"🏦 Bank Alfalah Transfer"},{value:"jazzcash",label:"📱 JazzCash Mobile Wallet"}].map(m => (
                  <label key={m.value} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: form.method === m.value ? T.accentGlow : "rgba(192,192,192,0.04)", border: `1px solid ${form.method === m.value ? T.accentBorder : T.border}`, cursor: "pointer", transition: "all 0.15s", fontSize: 14, fontWeight: 600 }}>
                    <input type="radio" value={m.value} checked={form.method === m.value} onChange={upd("method")} style={{ accentColor: T.accent }} />
                    {m.label}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1, padding: "13px" }} onClick={placeOrder} disabled={loading}>
                  {loading ? "Processing..." : `Place Order · $${subtotal.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mini order summary */}
        <div>
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Order Summary</div>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: T.muted }}>{item.name} ×{item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: T.text }}>${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(159,226,191,0.06)", border: `1px solid rgba(159,226,191,0.2)`, borderRadius: 10 }}>
            <div style={{ color: T.green, fontSize: 12, fontWeight: 700 }}>🔒 Secure & Encrypted</div>
            <div style={{ color: T.muted, fontSize: 11, marginTop: 3 }}>Your payment is protected by SSL encryption</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSuccessPage({ setPage }) {
  return (
    <div className="empty-state page-fade">
      <div style={{ fontSize: 80 }}>🎉</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>Order Confirmed!</h2>
      <p style={{ color: T.muted, maxWidth: 360, textAlign: "center", lineHeight: 1.7 }}>
        Your digital products will be delivered to your email instantly. Check your inbox and the orders page.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => setPage("account")}>My Orders</button>
        <button className="btn btn-primary" onClick={() => setPage("home")}>Continue Shopping</button>
      </div>
    </div>
  );
}

function TrendingPage({ setPage }) {
  const sorted = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews);
  return (
    <div className="page-fade">
      <div style={{ background: `linear-gradient(135deg, rgba(255,107,129,0.08), ${T.surface})`, padding: "52px 0 40px", borderBottom: `1px solid ${T.border}` }}>
        <div className="wrap">
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.02em" }}>🔥 Trending Now</h1>
          <p style={{ color: T.muted, marginTop: 6 }}>Most popular picks right now</p>
        </div>
      </div>
      <section className="section">
        <div className="wrap">
          <div className="grid-4">
            {sorted.map(p => <ProductCard key={p.id} product={p} onClick={(prod) => setPage("product", prod.slug, prod)} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function AuthPage({ mode, setPage }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      addToast(mode === "login" ? "Welcome back!" : "Account created! Welcome.", "success");
      setLoading(false);
      setPage("home");
    }, 900);
  };

  return (
    <div className="page-fade" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, letterSpacing: "0.06em" }}>
            PLAY<span style={{ color: T.accent }}>BEAT</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.01em" }}>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 5 }}>{mode === "login" ? "Sign in to your account" : "Join PlayBeat Digital"}</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 600 }}>Full Name</label>
              <input className="input" value={form.name} onChange={upd("name")} placeholder="John Doe" required />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 600 }}>Email</label>
            <input className="input" type="email" value={form.email} onChange={upd("email")} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 600 }}>Password</label>
            <input className="input" type="password" value={form.password} onChange={upd("password")} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ padding: "13px", marginTop: 4 }} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: T.muted }}>
          {mode === "login" ? (
            <>No account? <button className="btn-ghost" style={{ color: T.text, fontWeight: 700, fontSize: 13, padding: 0, background: "none", textDecoration: "underline", textUnderlineOffset: 3 }} onClick={() => setPage("register")}>Sign up</button></>
          ) : (
            <>Already have one? <button className="btn-ghost" style={{ color: T.text, fontWeight: 700, fontSize: 13, padding: 0, background: "none", textDecoration: "underline", textUnderlineOffset: 3 }} onClick={() => setPage("login")}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Layout / Shell ───────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "✦ Valorant Elderflame Bundle","⚡ ChatGPT Plus 1M — $20","🎮 PS Plus 12M — $59",
  "✦ Adobe CC All Apps — $54","🤖 Midjourney Basic — $10","🎁 Free Gift Card on $50+ Orders",
  "🔒 SSL Secured · Instant Delivery","🌍 International Payments Accepted"
];

function Header({ currentPage, setPage, searchQuery, setSearchQuery }) {
  const cart = useCart();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchQuery(search.trim());
      setPage("home");
    }
  };

  const ticker = [...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => <span key={i}>{t}</span>);

  return (
    <>
      <div className="ticker">
        <div className="ticker-inner">{ticker}</div>
      </div>
      <header style={{ background: "rgba(5,11,24,0.96)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div className="wrap">
          <div style={{ padding: "14px 0", display: "flex", alignItems: "center", gap: 16 }}>
            {/* Logo */}
            <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "0.08em", color: T.text }}>
                PLAY<span style={{ color: T.accent, textShadow: "0 0 20px rgba(192,192,192,0.3)" }}>BEAT</span>
              </span>
              <span style={{ fontSize: 9, color: T.muted, letterSpacing: "2.8px", textTransform: "uppercase" }}>DIGITAL STORE</span>
            </button>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 460, display: "flex", gap: 0 }}>
              <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games, AI tools, subscriptions..." style={{ borderRadius: "10px 0 0 10px", borderRight: "none" }} />
              <button type="submit" style={{ padding: "0 18px", background: "linear-gradient(135deg,#d8d8d8,#a0a8b8)", border: "none", borderRadius: "0 10px 10px 0", color: "#050B18", fontWeight: 800, cursor: "pointer", fontSize: 14, transition: "opacity 0.18s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >🔍</button>
            </form>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
              <button className="btn btn-secondary btn-sm" style={{ position: "relative" }} onClick={() => setPage("cart")}>
                🛒 Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage("login")}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => setPage("register")}>Sign Up</button>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 2, paddingBottom: 10, overflowX: "auto", scrollbarWidth: "none" }}>
            <button className={`nav-link ${currentPage === "home" ? "active" : ""}`} onClick={() => setPage("home")}>🏠 Home</button>
            {CATEGORIES.slice(0, 7).map(c => (
              <button key={c.slug} className={`nav-link ${currentPage === "category" ? "active" : ""}`} onClick={() => setPage("category", c.slug)}>{c.icon} {c.label}</button>
            ))}
            <button className={`nav-link ${currentPage === "trending" ? "active" : ""}`} onClick={() => setPage("trending")}>🔥 Trending</button>
          </nav>
        </div>
      </header>
    </>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={{ background: T.surface, borderTop: `1px solid ${T.border}`, padding: "52px 0 28px", marginTop: "auto" }}>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 36, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 12, letterSpacing: "0.08em" }}>PLAY<span style={{ color: T.accent }}>BEAT</span></div>
            <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.75 }}>Trusted source for digital games, software, AI tools, subscriptions and more. Instant delivery worldwide.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, marginBottom: 14 }}>Categories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {CATEGORIES.slice(0, 5).map(c => (
                <button key={c.slug} className="btn-ghost" style={{ textAlign: "left", padding: "0", fontSize: 13, color: T.muted, background: "none", width: "fit-content", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.text}
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}
                  onClick={() => setPage("category", c.slug)}>{c.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, marginBottom: 14 }}>Account</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[["Login","login"],["Register","register"],["My Orders","account"],["Cart","cart"]].map(([l, p]) => (
                <button key={p} className="btn-ghost" style={{ textAlign: "left", padding: "0", fontSize: 13, color: T.muted, background: "none", width: "fit-content", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.text}
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}
                  onClick={() => setPage(p)}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, marginBottom: 14 }}>Payments</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["💳 Stripe","🏦 Bank Alfalah","🕌 Meezan","📱 JazzCash"].map(p => (
                <span key={p} className="tag">{p}</span>
              ))}
            </div>
            <div style={{ marginTop: 16, color: T.muted, fontSize: 12, lineHeight: 1.8 }}>
              🔒 SSL Secured · Instant Delivery<br />
              📧 support@playbeat.digital
            </div>
          </div>
        </div>
        <div className="silver-divider" style={{ marginBottom: 20 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ color: T.muted, fontSize: 12 }}>© {new Date().getFullYear()} PlayBeat Digital (Pvt.) Ltd. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: T.muted }}>
            {["Privacy Policy","Terms of Service","Refund Policy"].map(link => (
              <span key={link} style={{ cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = T.text}
                onMouseLeave={e => e.currentTarget.style.color = T.muted}
              >{link}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPageState] = useState({ name: "home", slug: null, data: null });
  const [searchQuery, setSearchQuery] = useState("");

  const setPage = useCallback((name, slug = null, data = null) => {
    setPageState({ name, slug, data });
    window.scrollTo(0, 0);
  }, []);

  const renderPage = () => {
    switch (page.name) {
      case "home":        return <HomePage setPage={setPage} searchQuery={searchQuery} />;
      case "category":   return <CategoryPage category={page.slug} setPage={setPage} />;
      case "product":    return <ProductPage product={page.data || PRODUCTS.find(p => p.slug === page.slug)} setPage={setPage} />;
      case "trending":   return <TrendingPage setPage={setPage} />;
      case "cart":       return <CartPage setPage={setPage} />;
      case "checkout":   return <CheckoutPage setPage={setPage} />;
      case "order-success": return <OrderSuccessPage setPage={setPage} />;
      case "login":      return <AuthPage mode="login" setPage={setPage} />;
      case "register":   return <AuthPage mode="register" setPage={setPage} />;
      case "account":    return <OrderSuccessPage setPage={setPage} />;
      default:           return <HomePage setPage={setPage} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header currentPage={page.name} setPage={setPage} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main style={{ flex: 1 }}>
          {renderPage()}
        </main>
        <Footer setPage={setPage} />
      </div>
      <Toasts />
    </>
  );
}
