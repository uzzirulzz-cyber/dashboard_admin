import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store';
import api from '../utils/api';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const method = searchParams.get('method');
  const [order, setOrder] = useState(null);
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
    if (orderNumber) {
      api.get(`/api/orders/${orderNumber}`)
        .then(({ data }) => setOrder(data.order))
        .catch(() => {}); // You may add error handling here
    }
  }, [orderNumber, clearCart]);

  return (
    <div className="flex-center" style={{ minHeight:'70vh', flexDirection:'column', gap:20, padding:'40px 20px', textAlign:'center' }}>
      <div style={{ fontSize:80 }}>🎉</div>
      <h1 style={{ fontSize:36, fontWeight:900 }}>Order Confirmed!</h1>
      
      {orderNumber && (
        <div style={{ background:'var(--panel)', border:'1px solid var(--line)', borderRadius:14, padding:'12px 24px' }}>
          <span style={{ color:'var(--muted)', fontSize:14 }}>Order Number: </span>
          <strong style={{ color:'var(--accent)', fontSize:18 }}>{orderNumber}</strong>
        </div>
      )}

      {method === 'bank' ? (
        <div style={{ background:'rgba(245,166,35,.1)', border:'1px solid rgba(245,166,35,.3)', borderRadius:16, padding:24, maxWidth:480 }}>
          <h3 style={{ color:'var(--accent)', marginBottom:12 }}>⏳ Awaiting Payment Confirmation</h3>
          <p style={{ color:'var(--muted)', lineHeight:1.7, fontSize:15 }}>
            Please complete your bank transfer. Your order will be processed within 2 hours after payment confirmation.
            Check your email for bank transfer details.
          </p>
        </div>
      ) : (
        <div style={{ background:'rgba(56,211,159,.1)', border:'1px solid rgba(56,211,159,.3)', borderRadius:16, padding:24, maxWidth:480 }}>
          <h3 style={{ color:'var(--good)', marginBottom:12 }}>✅ Payment Successful</h3>
          <p style={{ color:'var(--muted)', lineHeight:1.7, fontSize:15 }}>
            Your payment was processed successfully. Your digital products have been delivered to your email and are available in your orders page.
          </p>
        </div>
      )}

      {order?.items?.some(i => i.deliveredKey) && (
        <div style={{ background:'var(--panel)', border:'1px solid var(--line)', borderRadius:16, padding:24, maxWidth:480, width:'100%' }}>
          <h3 style={{ marginBottom:16 }}>🔑 Your Product Keys</h3>
          {order.items.filter(i => i.deliveredKey).map((item, idx) => (
            <div key={idx} style={{ marginBottom:12, padding:'12px 16px', background:'rgba(255,255,255,.04)', borderRadius:12 }}>
              <div style={{ fontSize:14, color:'var(--muted)', marginBottom:4 }}>{item.name}</div>
              <div style={{ fontFamily:'monospace', fontSize:16, fontWeight:700, color:'var(--accent2)', userSelect:'all', letterSpacing:'.05em' }}>
                {item.deliveredKey}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-16" style={{ marginTop:16 }}>
        <Link to="/my-orders" className="btn btn-secondary btn-lg">My Orders</Link>
        <Link to="/" className="btn btn-primary btn-lg">Continue Shopping</Link>
      </div>
    </div>
  );
}
