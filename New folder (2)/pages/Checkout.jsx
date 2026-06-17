import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore, useToastStore } from '../store';
import api from '../utils/api';

const PAYMENT_METHODS = [
  { id:'stripe',   icon:'💳', label:'Card Payment', sub:'Visa, Mastercard, Amex (International)', color:'#635bff' },
  { id:'jazzcash', icon:'📱', label:'JazzCash',     sub:'Mobile Wallet — Pakistan',               color:'#c0392b' },
  { id:'alfalah',  icon:'🏦', label:'Bank Alfalah', sub:'Internet Banking — Pakistan',            color:'#1e5c9b' },
  { id:'meezan',   icon:'🕌', label:'Meezan Bank',  sub:'Islamic Banking — IBAN Transfer',        color:'#2ecc71' }
];

export default function Checkout() {
  const { items, coupon, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [method, setMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || 'PK',
    mobile: ''
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = coupon ? (coupon.type === 'percent' ? subtotal * coupon.value / 100 : coupon.value) : 0;
  const total = Math.max(0, subtotal - discount);

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCheckout = async () => {
    if (!form.name || !form.email) { addToast('Please fill in name and email', 'error'); return; }
    if (items.length === 0) { addToast('Cart is empty', 'error'); return; }
    setLoading(true);

    try {
      const orderItems = items.map(i => ({ productId: i.productId, quantity: i.quantity }));

      if (method === 'stripe') {
        const { data } = await api.post('/api/payments/stripe/create-checkout', {
          items: orderItems, customerEmail: form.email, customerName: form.name,
          customerPhone: form.phone, customerCountry: form.country
        });
        // Redirect to Stripe hosted checkout
        if (data.sessionUrl) window.location.href = data.sessionUrl;
        else addToast('Stripe session error', 'error');

      } else if (method === 'jazzcash') {
        // Create order first then redirect to JazzCash
        const orderRes = await api.post('/api/orders/create-pending', {
          items: orderItems, paymentMethod: 'jazzcash', customerEmail: form.email,
          customerName: form.name, customerPhone: form.phone
        });
        const { data } = await api.post('/api/payments/jazzcash/initiate', {
          orderId: orderRes.data.order._id, amount: total, mobileNumber: form.mobile || form.phone
        });
        // Build and submit form to JazzCash
        const form2 = document.createElement('form');
        form2.method = 'POST';
        form2.action = data.apiUrl;
        Object.entries(data.payload).forEach(([k,v]) => {
          const input = document.createElement('input');
          input.type = 'hidden'; input.name = k; input.value = v;
          form2.appendChild(input);
        });
        document.body.appendChild(form2);
        form2.submit();

      } else if (method === 'alfalah') {
        const orderRes = await api.post('/api/orders/create-pending', {
          items: orderItems, paymentMethod: 'alfalah', customerEmail: form.email,
          customerName: form.name, customerPhone: form.phone
        });
        const { data } = await api.post('/api/payments/alfalah/initiate', {
          orderId: orderRes.data.order._id, amount: total
        });
        const form2 = document.createElement('form');
        form2.method = 'POST';
        form2.action = data.apiUrl;
        Object.entries(data.payload).forEach(([k,v]) => {
          const input = document.createElement('input');
          input.type = 'hidden'; input.name = k; input.value = v;
          form2.appendChild(input);
        });
        document.body.appendChild(form2);
        form2.submit();

      } else if (method === 'meezan') {
        const orderRes = await api.post('/api/orders/create-pending', {
          items: orderItems, paymentMethod: 'meezan', customerEmail: form.email,
          customerName: form.name, customerPhone: form.phone
        });
        const { data } = await api.post('/api/payments/meezan/initiate', {
          orderId: orderRes.data.order._id, amount: total
        });
        // Show bank transfer details
        addToast(`Transfer PKR ${(total * 280).toFixed(0)} to IBAN: ${data.bankDetails.iban}`, 'info');
        navigate(`/order-success?order=${orderRes.data.order.orderNumber}&method=bank`);
      }
    } catch (e) {
      addToast(e.response?.data?.message || 'Checkout error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="wrap" style={{ padding:'40px 0' }}>
      <h1 style={{ fontSize:32, fontWeight:900, marginBottom:32 }}>Checkout</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:32, alignItems:'start' }}>

        {/* Left */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {/* Customer Info */}
          <div className="card" style={{ padding:24 }}>
            <h3 style={{ fontWeight:800, marginBottom:20 }}>Contact Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Full Name *</label>
                <input className="input" value={form.name} onChange={update('name')} placeholder="John Doe" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Email *</label>
                <input className="input" type="email" value={form.email} onChange={update('email')} placeholder="john@email.com" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Phone</label>
                <input className="input" value={form.phone} onChange={update('phone')} placeholder="+92 300 1234567" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Country</label>
                <select className="input" value={form.country} onChange={update('country')}>
                  <option value="PK">Pakistan</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AE">UAE</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="IN">India</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card" style={{ padding:24 }}>
            <h3 style={{ fontWeight:800, marginBottom:20 }}>Payment Method</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {PAYMENT_METHODS.map(m => (
                <div key={m.id} onClick={() => setMethod(m.id)}
                  style={{ display:'flex', alignItems:'center', gap:16, padding:'16px', borderRadius:14, border:`2px solid ${method===m.id ? m.color : 'rgba(255,255,255,.08)'}`, background: method===m.id ? `${m.color}18` : 'rgba(255,255,255,.02)', cursor:'pointer', transition:'all .2s' }}>
                  <span style={{ fontSize:26 }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{m.label}</div>
                    <div style={{ fontSize:13, color:'var(--muted)' }}>{m.sub}</div>
                  </div>
                  <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${method===m.id ? m.color : 'rgba(255,255,255,.3)'}`, background: method===m.id ? m.color : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {method===m.id && <div style={{ width:8, height:8, borderRadius:'50%', background:'white' }} />}
                  </div>
                </div>
              ))}
            </div>

            {/* JazzCash mobile number */}
            {method === 'jazzcash' && (
              <div style={{ marginTop:16 }}>
                <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>JazzCash Mobile Number</label>
                <input className="input" value={form.mobile} onChange={update('mobile')} placeholder="03XXXXXXXXX" />
              </div>
            )}

            {/* Meezan bank details */}
            {method === 'meezan' && (
              <div style={{ marginTop:16, padding:16, background:'rgba(46,204,113,.08)', border:'1px solid rgba(46,204,113,.2)', borderRadius:12, fontSize:14, lineHeight:1.8 }}>
                <div style={{ fontWeight:700, marginBottom:8, color:'var(--good)' }}>🕌 Meezan Bank Transfer Details:</div>
                <div>IBAN: <strong>PK86MEZN0015040115102971</strong></div>
                <div>Account Title: <strong>PLAYBEAT DIGITAL PRIVATE LIMITED</strong></div>
                <div style={{ marginTop:8, color:'var(--muted)', fontSize:12 }}>Transfer the exact amount and your order will be confirmed within 2 hours.</div>
              </div>
            )}

            {/* Alfalah note */}
            {method === 'alfalah' && (
              <div style={{ marginTop:16, padding:16, background:'rgba(30,92,155,.1)', border:'1px solid rgba(30,92,155,.3)', borderRadius:12, fontSize:14 }}>
                <div style={{ fontWeight:700, marginBottom:4, color:'var(--accent2)' }}>🏦 Bank Alfalah Payment</div>
                <div style={{ color:'var(--muted)', fontSize:13 }}>You will be redirected to Bank Alfalah's secure payment gateway to complete your payment in PKR.</div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding:24, position:'sticky', top:90 }}>
          <h3 style={{ fontWeight:800, marginBottom:20 }}>Order Summary</h3>
          {items.map(i => (
            <div key={i.productId} className="flex-between" style={{ marginBottom:12, gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, lineHeight:1.3 }}>{i.name}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>x{i.quantity}</div>
              </div>
              <div style={{ fontWeight:700 }}>${(i.price * i.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--line)', paddingTop:16, marginTop:8 }}>
            <div className="flex-between" style={{ marginBottom:8 }}>
              <span style={{ color:'var(--muted)' }}>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && <div className="flex-between" style={{ marginBottom:8 }}>
              <span style={{ color:'var(--good)' }}>Discount</span><span style={{ color:'var(--good)' }}>-${discount.toFixed(2)}</span>
            </div>}
            <div className="flex-between" style={{ marginTop:12 }}>
              <span style={{ fontWeight:800, fontSize:18 }}>Total</span>
              <span style={{ fontWeight:900, fontSize:26, color:'var(--accent)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width:'100%', padding:'16px', fontSize:16, marginTop:20 }}
            onClick={handleCheckout} disabled={loading}>
            {loading ? '⏳ Processing...' : `Pay $${total.toFixed(2)} →`}
          </button>
          <div style={{ marginTop:16, fontSize:12, color:'var(--muted)', textAlign:'center', lineHeight:1.6 }}>
            🔒 Secure checkout · SSL encrypted<br/>By placing an order you agree to our Terms of Service
          </div>
        </div>
      </div>
    </div>
  );
}
