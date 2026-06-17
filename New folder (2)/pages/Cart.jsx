import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useToastStore } from '../store';
import api from '../utils/api';

export default function Cart() {
  const { items, removeItem, updateQty, coupon, setCoupon, removeCoupon, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = coupon ? (coupon.type === 'percent' ? subtotal * coupon.value / 100 : coupon.value) : 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/api/orders/validate-coupon', { code: couponInput, cartTotal: subtotal });
      setCoupon(data.coupon);
      addToast(`Coupon applied! Saved $${data.coupon.discount.toFixed(2)}`, 'success');
    } catch (e) {
      addToast(e.response?.data?.message || 'Invalid coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 64 }}>🛒</div>
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--muted)' }}>Browse our store and add some products!</p>
        <Link to="/" className="btn btn-primary btn-lg">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>🛒 Shopping Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        {/* Items */}
        <div>
          {items.map(item => (
            <div key={item.productId} className="card" style={{ padding: '20px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                {{'games':'🎮','gift-cards':'🎁','software':'💻','ai-tools':'🤖','game-items':'⚔️','accounts':'👤','subscriptions':'📺','top-up':'⚡'}[item.category] || '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{item.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{item.category?.replace('-', ' ')}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,.05)', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => updateQty(item.productId, item.quantity - 1)} style={{ padding: '8px 14px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}>−</button>
                <span style={{ padding: '8px 12px', fontWeight: 700 }}>{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, item.quantity + 1)} style={{ padding: '8px 14px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}>+</button>
              </div>
              <div style={{ fontWeight: 800, fontSize: 20, minWidth: 80, textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</div>
              <button onClick={() => removeItem(item.productId)} style={{ background: 'rgba(255,107,107,.15)', border: 'none', borderRadius: 10, padding: '8px 12px', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}>🗑</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: '24px', position: 'sticky', top: 90 }}>
          <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Order Summary</h3>
          <div className="flex-between" style={{ marginBottom: 12 }}><span style={{ color: 'var(--muted)' }}>Subtotal</span><span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span></div>
          {discount > 0 && <div className="flex-between" style={{ marginBottom: 12 }}><span style={{ color: 'var(--good)' }}>Discount</span><span style={{ color: 'var(--good)', fontWeight: 600 }}>-${discount.toFixed(2)}</span></div>}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginBottom: 20 }}>
            <div className="flex-between"><span style={{ fontWeight: 700, fontSize: 18 }}>Total</span><span style={{ fontWeight: 900, fontSize: 24, color: 'var(--accent)' }}>${total.toFixed(2)}</span></div>
          </div>

          {/* Coupon */}
          {coupon ? (
            <div style={{ background: 'rgba(56,211,159,.1)', border: '1px solid rgba(56,211,159,.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: 'var(--good)', fontWeight: 700, fontSize: 14 }}>🎉 {coupon.code} applied!</span>
              <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
          ) : (
            <div className="flex gap-8" style={{ marginBottom: 16 }}>
              <input className="input" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Coupon code" style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
              <button className="btn btn-secondary btn-sm" onClick={applyCoupon} disabled={couponLoading}>{couponLoading ? '...' : 'Apply'}</button>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16 }} onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
          <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'var(--muted)', fontSize: 14 }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
