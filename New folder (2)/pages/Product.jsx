import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCartStore, useToastStore } from '../store';
import api from '../utils/api';

export default function Product() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products/${slug}`);
        setProduct(data.product);
      } catch {
        // demo product
        setProduct({ _id: slug, name: 'Product', price: 19.99, description: 'Digital product', category: 'games', ratings: { average: 5, count: 100 } });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) return <div className="flex-center" style={{ minHeight:'60vh' }}><div className="spinner" /></div>;
  if (!product) return <div className="flex-center" style={{ minHeight:'60vh' }}><p>Product not found</p></div>;

  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <div className="wrap" style={{ padding:'40px 0' }}>
      <div style={{ marginBottom:24 }}>
        <Link to="/" style={{ color:'var(--muted)', fontSize:14 }}>Home</Link>
        <span style={{ color:'var(--muted)', margin:'0 8px' }}>/</span>
        <Link to={`/${product.category}`} style={{ color:'var(--muted)', fontSize:14 }}>{product.category}</Link>
        <span style={{ color:'var(--muted)', margin:'0 8px' }}>/</span>
        <span style={{ fontSize:14 }}>{product.name}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
        {/* Image */}
        <div>
          <div style={{ height:360, borderRadius:20, background: product.thumbnail ? `url(${product.thumbnail}) center/cover` : 'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, position:'relative', border:'1px solid var(--line)' }}>
            {!product.thumbnail && ({'games':'🎮','gift-cards':'🎁','software':'💻','ai-tools':'🤖','game-items':'⚔️','accounts':'👤','subscriptions':'📺','top-up':'⚡'}[product.category] || '📦')}
            {product.badge && <span className={`badge badge-${product.badge.toLowerCase()}`} style={{ position:'absolute', top:16, left:16, fontSize:13 }}>{product.badge}</span>}
            {discount > 0 && <span className="badge" style={{ position:'absolute', top:16, right:16, background:'#22c55e', color:'white', fontSize:13 }}>-{discount}%</span>}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize:12, color:'var(--accent2)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>{product.category?.replace('-',' ')}</div>
          <h1 style={{ fontSize:32, fontWeight:900, lineHeight:1.2, marginBottom:12 }}>{product.name}</h1>

          <div style={{ color:'#f59e0b', fontSize:16, marginBottom:8 }}>
            {'★'.repeat(Math.round(product.ratings?.average || 5))}
            <span style={{ color:'var(--muted)', marginLeft:8, fontSize:14 }}>{product.ratings?.average?.toFixed(1) || '5.0'} ({product.ratings?.count || 0} reviews)</span>
          </div>

          {product.region && <div style={{ marginBottom:12, fontSize:14, color:'var(--muted)' }}>🌍 Region: <strong style={{ color:'var(--text)' }}>{product.region}</strong></div>}

          <div className="flex gap-16" style={{ alignItems:'center', marginBottom:24 }}>
            <span style={{ fontSize:40, fontWeight:900 }}>${product.price}</span>
            {product.comparePrice && <span style={{ textDecoration:'line-through', color:'var(--muted)', fontSize:20 }}>${product.comparePrice}</span>}
            {discount > 0 && <span style={{ background:'#22c55e', color:'white', padding:'4px 12px', borderRadius:999, fontSize:14, fontWeight:700 }}>Save {discount}%</span>}
          </div>

          <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:24, fontSize:15 }}>{product.description}</p>

          <div className="flex gap-12" style={{ alignItems:'center', marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:0, background:'rgba(255,255,255,.05)', borderRadius:12, overflow:'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ padding:'12px 16px', background:'none', border:'none', color:'white', fontSize:18, cursor:'pointer' }}>−</button>
              <span style={{ padding:'12px 16px', fontWeight:700, fontSize:16 }}>{qty}</span>
              <button onClick={() => setQty(q => q+1)} style={{ padding:'12px 16px', background:'none', border:'none', color:'white', fontSize:18, cursor:'pointer' }}>+</button>
            </div>
          </div>

          <div className="flex gap-12">
            <button className="btn btn-primary btn-lg" style={{ flex:1 }}
              onClick={() => { addItem(product, qty); addToast(`${product.name} added to cart!`, 'success'); }}>
              🛒 Add to Cart
            </button>
          </div>

          <div style={{ marginTop:24, padding:'16px', background:'rgba(56,211,159,.08)', border:'1px solid rgba(56,211,159,.2)', borderRadius:14 }}>
            <div style={{ color:'var(--good)', fontWeight:700, marginBottom:8 }}>✅ Instant Digital Delivery</div>
            <div style={{ color:'var(--muted)', fontSize:14, lineHeight:1.6 }}>Your product will be delivered instantly after payment confirmation. Check your email and orders page.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
