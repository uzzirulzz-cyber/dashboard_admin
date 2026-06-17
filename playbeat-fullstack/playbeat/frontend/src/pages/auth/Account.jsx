import React, { useState } from 'react';
import { useAuthStore, useToastStore } from '../../store';
import api from '../../utils/api';

export function Account() {
  const { user, setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', country: user?.country||'' });
  const [saving, setSaving] = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/api/auth/me', form);
      setAuth(data.user, useAuthStore.getState().token);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div className="wrap" style={{ padding:'40px 0' }}>
      <h1 style={{ fontSize:32, fontWeight:900, marginBottom:32 }}>👤 My Account</h1>
      <div style={{ maxWidth:520 }}>
        <div className="card" style={{ padding:28, marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#07111f' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:20 }}>{user?.name}</div>
              <div style={{ color:'var(--muted)', fontSize:14 }}>{user?.email}</div>
              <div style={{ display:'inline-block', background: user?.role==='admin' ? 'rgba(139,92,246,.2)' : 'rgba(56,211,159,.1)', border:`1px solid ${user?.role==='admin'?'rgba(139,92,246,.4)':'rgba(56,211,159,.3)'}`, borderRadius:999, padding:'2px 10px', fontSize:12, fontWeight:700, color: user?.role==='admin' ? '#a78bfa' : 'var(--good)', marginTop:4 }}>
                {user?.role === 'admin' ? '⚙️ Admin' : '👤 Customer'}
              </div>
            </div>
          </div>
          <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:5 }}>Full Name</label>
              <input className="input" value={form.name} onChange={upd('name')} /></div>
            <div><label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:5 }}>Phone</label>
              <input className="input" value={form.phone} onChange={upd('phone')} placeholder="+92 300 1234567" /></div>
            <div><label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:5 }}>Country</label>
              <select className="input" value={form.country} onChange={upd('country')}>
                <option value="PK">Pakistan</option><option value="US">United States</option>
                <option value="GB">United Kingdom</option><option value="AE">UAE</option>
                <option value="other">Other</option>
              </select></div>
            <div><label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:5 }}>Email</label>
              <input className="input" value={user?.email} readOnly style={{ opacity:.6 }} /></div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    api.get('/api/orders/my').then(({ data }) => setOrders(data.orders || [])).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  const statusColor = { pending:'#f59e0b', processing:'var(--accent2)', completed:'var(--good)', cancelled:'var(--danger)', refunded:'var(--muted)' };

  return (
    <div className="wrap" style={{ padding:'40px 0' }}>
      <h1 style={{ fontSize:32, fontWeight:900, marginBottom:32 }}>📦 My Orders</h1>
      {loading ? (
        <div className="flex-center" style={{ minHeight:200 }}><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="flex-center" style={{ minHeight:200, flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:48 }}>📦</div><p style={{ color:'var(--muted)' }}>No orders yet</p>
        </div>
      ) : orders.map(o => (
        <div key={o._id} className="card" style={{ padding:'20px', marginBottom:16 }}>
          <div className="flex-between" style={{ marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:800, fontSize:16 }}>{o.orderNumber}</div>
              <div style={{ color:'var(--muted)', fontSize:13 }}>{new Date(o.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:20, fontWeight:900, color:'var(--accent)' }}>${o.total.toFixed(2)}</div>
              <span style={{ display:'inline-block', background:`${statusColor[o.status]}22`, border:`1px solid ${statusColor[o.status]}55`, borderRadius:999, padding:'3px 12px', fontSize:12, fontWeight:700, color:statusColor[o.status] }}>{o.status.toUpperCase()}</span>
            </div>
          </div>
          {o.items?.map((item, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid rgba(255,255,255,.05)', fontSize:14 }}>
              <span style={{ color:'var(--muted)' }}>{item.name} x{item.quantity}</span>
              <span style={{ fontWeight:600 }}>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {o.items?.some(i => i.deliveredKey) && (
            <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(56,211,159,.08)', border:'1px solid rgba(56,211,159,.2)', borderRadius:10 }}>
              <div style={{ fontSize:13, color:'var(--good)', fontWeight:700, marginBottom:6 }}>🔑 Delivered Keys:</div>
              {o.items.filter(i => i.deliveredKey).map((item, i) => (
                <div key={i} style={{ fontFamily:'monospace', fontSize:14, color:'var(--accent2)', userSelect:'all' }}>{item.deliveredKey}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Account;
