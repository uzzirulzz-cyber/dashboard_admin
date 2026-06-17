import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore, useToastStore } from '../store';

const CAT_COLORS = {
  'games':         'linear-gradient(135deg,#1a3a6b,#2d1b69)',
  'gift-cards':    'linear-gradient(135deg,#6b1a1a,#6b4a1a)',
  'software':      'linear-gradient(135deg,#1a4a6b,#1a6b3a)',
  'ai-tools':      'linear-gradient(135deg,#4a1a6b,#1a4a6b)',
  'game-items':    'linear-gradient(135deg,#6b4a1a,#6b1a4a)',
  'accounts':      'linear-gradient(135deg,#1a6b4a,#1a3a6b)',
  'subscriptions': 'linear-gradient(135deg,#6b1a6b,#1a1a6b)',
  'top-up':        'linear-gradient(135deg,#6b6b1a,#4a6b1a)'
};

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    addToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <Link to={`/product/${product.slug || product._id}`} style={{ textDecoration:'none' }}>
      <div className="card" style={{ transition:'all .25s', cursor:'pointer', overflow:'hidden' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.borderColor='rgba(59,130,246,.35)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor=''; }}>

        {/* Image */}
        <div style={{ height:200, background: product.thumbnail ? `url(${product.thumbnail}) center/cover` : (CAT_COLORS[product.category] || 'linear-gradient(135deg,#2563eb,#7c3aed)'), position:'relative' }}>
          {product.badge && (
            <span className={`badge badge-${product.badge.toLowerCase()}`} style={{ position:'absolute', top:12, left:12 }}>{product.badge}</span>
          )}
          {discount > 0 && (
            <span className="badge" style={{ position:'absolute', top:12, right:12, background:'#22c55e', color:'white' }}>-{discount}%</span>
          )}
          <div style={{ position:'absolute', bottom:12, right:12, display:'flex', gap:8 }}>
            <button onClick={handleAdd} style={{ width:38, height:38, borderRadius:'50%', background:'rgba(245,166,35,.9)', border:'none', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="Add to cart">🛒</button>
          </div>
          {/* Category icon overlay */}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:48, opacity: product.thumbnail ? 0 : .3 }}>
            {{'games':'🎮','gift-cards':'🎁','software':'💻','ai-tools':'🤖','game-items':'⚔️','accounts':'👤','subscriptions':'📺','top-up':'⚡'}[product.category] || '📦'}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'16px' }}>
          <div style={{ fontSize:11, color:'var(--accent2)', fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>{product.category?.replace('-',' ')}</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:6, lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{product.name}</div>
          {product.region && product.region !== 'Global' && (
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:6 }}>🌍 {product.region}</div>
          )}
          <div style={{ color:'#f59e0b', fontSize:13, marginBottom:10 }}>
            {'★'.repeat(Math.round(product.ratings?.average || 5))}{'☆'.repeat(5 - Math.round(product.ratings?.average || 5))}
            <span style={{ color:'var(--muted)', marginLeft:4 }}>({product.ratings?.count || 0})</span>
          </div>
          <div className="flex-between" style={{ alignItems:'center' }}>
            <div className="flex gap-8" style={{ alignItems:'center' }}>
              <span style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>${product.price}</span>
              {product.comparePrice && <span style={{ textDecoration:'line-through', color:'var(--muted)', fontSize:14 }}>${product.comparePrice}</span>}
            </div>
            <button onClick={handleAdd} className="btn btn-primary btn-sm">Add</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
