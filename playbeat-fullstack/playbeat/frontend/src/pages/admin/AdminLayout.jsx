import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useToastStore } from '../../store';
import api from '../../utils/api';

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { path:'',           icon:'📊', label:'Dashboard' },
  { path:'products',   icon:'📦', label:'Products' },
  { path:'orders',     icon:'🛒', label:'Orders' },
  { path:'users',      icon:'👥', label:'Users' },
  { path:'inventory',  icon:'🔑', label:'Inventory' },
  { path:'coupons',    icon:'🎟', label:'Coupons' },
  { path:'payments',   icon:'💳', label:'Payments' },
  { path:'settings',   icon:'⚙️', label:'Settings' }
];

function Sidebar({ current }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <aside style={{ width:220, background:'#0a0a0f', borderRight:'1px solid #1a1a2a', display:'flex', flexDirection:'column', height:'100vh', flexShrink:0 }}>
      <div style={{ padding:'20px 16px', borderBottom:'1px solid #1a1a2a' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, background:'#7c6cff', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⚡</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700 }}>PlayBeat</div>
            <div style={{ fontSize:11, color:'#5a5a72', textTransform:'uppercase', letterSpacing:'.06em' }}>Admin Panel</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1, padding:'16px 12px', overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
        {NAV.map(n => (
          <Link key={n.path} to={`/admin/${n.path}`}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, fontSize:14, fontWeight:500, textDecoration:'none', background: current===n.path ? '#7c6cff22' : 'transparent', color: current===n.path ? '#a78bfa' : '#9898b0', border: current===n.path ? '1px solid #7c6cff44' : '1px solid transparent', transition:'all .15s' }}>
            <span>{n.icon}</span>{n.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding:'12px', borderTop:'1px solid #1a1a2a' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, fontSize:14, color:'#9898b0', textDecoration:'none' }}>🌐 View Store</Link>
        <button onClick={() => { logout(); navigate('/'); }} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, fontSize:14, color:'#ff5a5a', background:'none', border:'none', cursor:'pointer', width:'100%' }}>🚪 Sign Out</button>
      </div>
    </aside>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/dashboard').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label:'Total Revenue', value: stats ? `$${stats.stats?.revenue?.toFixed(2)||'0.00'}` : '...', icon:'💰', color:'#22d68a' },
    { label:'Total Orders', value: stats?.stats?.orders || '...', icon:'🛒', color:'#4fa0ff' },
    { label:'Products', value: stats?.stats?.products || '...', icon:'📦', color:'#f5a623' },
    { label:'Customers', value: stats?.stats?.users || '...', icon:'👥', color:'#7c6cff' }
  ];

  return (
    <div>
      <h1 style={{ fontSize:26, fontWeight:700, marginBottom:24 }}>Dashboard</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:12, color:'#9898b0', marginBottom:8 }}>{c.label}</div>
                <div style={{ fontSize:28, fontWeight:800, color:c.color }}>{loading ? '...' : c.value}</div>
              </div>
              <span style={{ fontSize:28 }}>{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, padding:'20px' }}>
        <h3 style={{ marginBottom:16, fontWeight:700 }}>Recent Orders</h3>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #2a2a3a' }}>
              {['Order #','Customer','Total','Method','Status','Date'].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'#9898b0', fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats?.recentOrders?.map(o => (
              <tr key={o._id} style={{ borderBottom:'1px solid #1a1a24' }}>
                <td style={{ padding:'10px 12px', fontWeight:600, color:'#7c6cff' }}>{o.orderNumber}</td>
                <td style={{ padding:'10px 12px', color:'#e8e8f0' }}>{o.customerEmail}</td>
                <td style={{ padding:'10px 12px', fontWeight:700 }}>${o.total?.toFixed(2)}</td>
                <td style={{ padding:'10px 12px', color:'#9898b0' }}>{o.paymentMethod}</td>
                <td style={{ padding:'10px 12px' }}>
                  <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background: o.status==='completed'?'#22d68a22':'#f5a62322', color: o.status==='completed'?'#22d68a':'#f5a623' }}>{o.status}</span>
                </td>
                <td style={{ padding:'10px 12px', color:'#9898b0', fontSize:12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PRODUCTS ADMIN ──────────────────────────────────────────────────────────
function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToastStore();
  const [form, setForm] = useState({ name:'', description:'', category:'games', price:'', comparePrice:'', stock:'0', badge:'', featured:false, region:'Global', deliveryType:'instant', unlimited:false });

  useEffect(() => {
    api.get('/api/products', { params:{ limit:100 } }).then(({ data }) => setProducts(data.products||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const save = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/products', form);
      setProducts(p => [data.product, ...p]);
      setShowForm(false);
      addToast('Product created!', 'success');
      setForm({ name:'', description:'', category:'games', price:'', comparePrice:'', stock:'0', badge:'', featured:false, region:'Global', deliveryType:'instant', unlimited:false });
    } catch(err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const del = async id => {
    if (!confirm('Deactivate product?')) return;
    await api.delete(`/api/products/${id}`);
    setProducts(p => p.filter(x => x._id !== id));
    addToast('Product deactivated', 'info');
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Products</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>+ Add Product</button>
      </div>

      {showForm && (
        <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, padding:24, marginBottom:24 }}>
          <h3 style={{ marginBottom:18, fontWeight:700 }}>New Product</h3>
          <form onSubmit={save} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[['name','Name *'],['price','Price *'],['comparePrice','Compare Price'],['stock','Stock'],['region','Region'],['badge','Badge (HOT/NEW/SALE/TRENDING)']].map(([k,l]) => (
              <div key={k}>
                <label style={{ display:'block', fontSize:12, color:'#9898b0', marginBottom:4 }}>{l}</label>
                <input className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0' }} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} required={k==='name'||k==='price'} />
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:12, color:'#9898b0', marginBottom:4 }}>Category</label>
              <select className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0' }} value={form.category} onChange={e => setForm(f => ({...f,category:e.target.value}))}>
                {['games','gift-cards','software','ai-tools','game-items','accounts','subscriptions','top-up'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, color:'#9898b0', marginBottom:4 }}>Delivery Type</label>
              <select className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0' }} value={form.deliveryType} onChange={e => setForm(f => ({...f,deliveryType:e.target.value}))}>
                <option value="instant">Instant (auto key delivery)</option>
                <option value="manual">Manual</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ display:'block', fontSize:12, color:'#9898b0', marginBottom:4 }}>Description</label>
              <textarea className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0', resize:'vertical', minHeight:80 }} value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} required />
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:16, alignItems:'center' }}>
              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, cursor:'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f,featured:e.target.checked}))} /> Featured
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, cursor:'pointer' }}>
                <input type="checkbox" checked={form.unlimited} onChange={e => setForm(f => ({...f,unlimited:e.target.checked}))} /> Unlimited Stock
              </label>
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:12' }}>
              <button type="submit" className="btn btn-primary btn-sm">Save Product</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'#1a1a24' }}>
              {['Name','Category','Price','Stock','Badge','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#9898b0', fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:'#9898b0' }}>Loading...</td></tr>
              : products.map(p => (
              <tr key={p._id} style={{ borderBottom:'1px solid #1a1a24' }}>
                <td style={{ padding:'12px 16px', fontWeight:600 }}>{p.name}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0' }}>{p.category}</td>
                <td style={{ padding:'12px 16px', fontWeight:700, color:'#22d68a' }}>${p.price}</td>
                <td style={{ padding:'12px 16px' }}>{p.unlimited ? '∞' : p.stock}</td>
                <td style={{ padding:'12px 16px' }}>{p.badge && <span style={{ background:'#ef444422', color:'#ff7777', padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:700 }}>{p.badge}</span>}</td>
                <td style={{ padding:'12px 16px' }}><span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background: p.active?'#22d68a22':'#ff5a5a22', color: p.active?'#22d68a':'#ff5a5a' }}>{p.active?'Active':'Inactive'}</span></td>
                <td style={{ padding:'12px 16px' }}>
                  <button onClick={() => del(p._id)} style={{ background:'#ff5a5a22', border:'none', color:'#ff5a5a', borderRadius:8, padding:'6px 12px', fontSize:12, cursor:'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ORDERS ADMIN ─────────────────────────────────────────────────────────────
function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { addToast } = useToastStore();

  useEffect(() => {
    const params = {};
    if (filter) params.status = filter;
    api.get('/api/orders', { params }).then(({ data }) => setOrders(data.orders||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/orders/${id}/status`, { status });
      setOrders(o => o.map(x => x._id===id ? {...x, status} : x));
      addToast('Order updated', 'success');
    } catch { addToast('Error updating order', 'error'); }
  };

  const statusColor = { pending:'#f5a623', processing:'#4fa0ff', completed:'#22d68a', cancelled:'#ff5a5a', refunded:'#9898b0' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Orders</h1>
        <div style={{ display:'flex', gap:8 }}>
          {['','pending','processing','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, background: filter===s ? '#7c6cff' : '#1a1a24', color: filter===s ? 'white' : '#9898b0' }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'#1a1a24' }}>
              {['Order #','Customer','Total','Payment','Status','Date','Actions'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#9898b0', fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:'#9898b0' }}>Loading...</td></tr>
              : orders.map(o => (
              <tr key={o._id} style={{ borderBottom:'1px solid #1a1a24' }}>
                <td style={{ padding:'12px 16px', fontWeight:700, color:'#7c6cff', fontSize:13 }}>{o.orderNumber}</td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{o.customerName||o.user?.name}</div>
                  <div style={{ fontSize:12, color:'#9898b0' }}>{o.customerEmail||o.user?.email}</div>
                </td>
                <td style={{ padding:'12px 16px', fontWeight:800, color:'#22d68a' }}>${o.total?.toFixed(2)}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0', fontSize:13 }}>{o.paymentMethod}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:`${statusColor[o.status]}22`, color:statusColor[o.status] }}>{o.status}</span>
                </td>
                <td style={{ padding:'12px 16px', color:'#9898b0', fontSize:12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding:'12px 16px' }}>
                  <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                    style={{ padding:'4px 8px', background:'#1a1a24', border:'1px solid #2a2a3a', borderRadius:6, color:'#e8e8f0', fontSize:12, cursor:'pointer' }}>
                    {['pending','processing','completed','cancelled','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PAYMENTS PANEL ──────────────────────────────────────────────────────────
function PaymentsPanel() {
  const [tab, setTab] = useState('stripe');
  const [stats, setStats] = useState(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    api.get('/api/orders/admin/stats').then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>Payment Gateway Management</h1>
      <p style={{ color:'#9898b0', fontSize:14, marginBottom:24 }}>Manage payment processors, view transactions and configure gateway settings.</p>

      {/* Revenue summary */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
          {[
            { label:'Total Revenue', value:`$${stats.totalRevenue?.toFixed(2)||'0'}`, icon:'💰', color:'#22d68a' },
            { label:'Completed Orders', value:stats.completedOrders||0, icon:'✅', color:'#4fa0ff' },
            { label:'Pending Orders', value:stats.pendingOrders||0, icon:'⏳', color:'#f5a623' }
          ].map(c => (
            <div key={c.label} style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:12, padding:20 }}>
              <div style={{ fontSize:12, color:'#9898b0', marginBottom:6 }}>{c.label}</div>
              <div style={{ fontSize:26, fontWeight:800, color:c.color }}>{c.icon} {c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Gateway tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['stripe','alfalah','meezan','jazzcash'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'8px 18px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, background: tab===t ? '#7c6cff' : '#1a1a24', color: tab===t ? 'white' : '#9898b0', textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Gateway info cards — LOGOS ONLY, no credentials displayed */}
      <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, padding:24 }}>
        {tab === 'stripe' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:52, height:52, background:'#635bff', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>💳</div>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>Stripe Payment Gateway</div>
                <div style={{ color:'#9898b0', fontSize:14 }}>International card payments · Instant checkout</div>
                <span style={{ display:'inline-block', background:'#22d68a22', color:'#22d68a', padding:'2px 10px', borderRadius:999, fontSize:12, fontWeight:700, marginTop:4 }}>● CONNECTED</span>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[['Mode','Test Mode (sandbox)'],['Account','acct_1TMvCGG...'],['Currency','USD (International)'],['Methods','Visa, Mastercard, Amex, Apple Pay']].map(([k,v]) => (
                <div key={k} style={{ padding:'12px 16px', background:'#1a1a24', borderRadius:10 }}>
                  <div style={{ fontSize:12, color:'#9898b0', marginBottom:4 }}>{k}</div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(99,91,255,.1)', border:'1px solid rgba(99,91,255,.3)', borderRadius:10, fontSize:13, color:'#9898b0' }}>
              🔒 API keys are stored securely in environment variables. Keys are never exposed in the UI.
            </div>
          </div>
        )}
        {tab === 'alfalah' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:52, height:52, background:'#1e5c9b', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🏦</div>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>Bank Alfalah — AlfaPay</div>
                <div style={{ color:'#9898b0', fontSize:14 }}>PLAYBEAT DIGITAL (PRIVATE LIMITED)</div>
                <span style={{ display:'inline-block', background:'#f5a62322', color:'#f5a623', padding:'2px 10px', borderRadius:999, fontSize:12, fontWeight:700, marginTop:4 }}>⚙️ SANDBOX MODE</span>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[['Merchant ID','••••••'],['Store ID','••••••'],['Channel ID','1002'],['Currency','PKR'],['Account No','00681011050474'],['Mode','Sandbox']].map(([k,v]) => (
                <div key={k} style={{ padding:'12px 16px', background:'#1a1a24', borderRadius:10 }}>
                  <div style={{ fontSize:12, color:'#9898b0', marginBottom:4 }}>{k}</div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'meezan' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:52, height:52, background:'#2ecc71', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🕌</div>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>Meezan Bank — MezPay</div>
                <div style={{ color:'#9898b0', fontSize:14 }}>PLAYBEAT DIGITAL PRIVATE LIMITED</div>
                <span style={{ display:'inline-block', background:'#22d68a22', color:'#22d68a', padding:'2px 10px', borderRadius:999, fontSize:12, fontWeight:700, marginTop:4 }}>● CONFIGURED</span>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[['IBAN','PK86MEZN001504...'],['Account Title','PLAYBEAT DIGITAL PVT LTD'],['Bank','Meezan Bank Ltd'],['Currency','PKR']].map(([k,v]) => (
                <div key={k} style={{ padding:'12px 16px', background:'#1a1a24', borderRadius:10 }}>
                  <div style={{ fontSize:12, color:'#9898b0', marginBottom:4 }}>{k}</div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'jazzcash' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:52, height:52, background:'#c0392b', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>📱</div>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>JazzCash — Mobile Wallet</div>
                <div style={{ color:'#9898b0', fontSize:14 }}>PLAYBEAT ARENA MERCHANT ACCOUNT</div>
                <span style={{ display:'inline-block', background:'#f5a62322', color:'#f5a623', padding:'2px 10px', borderRadius:999, fontSize:12, fontWeight:700, marginTop:4 }}>⚙️ SANDBOX MODE</span>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[['Mobile','03318333368'],['Merchant ID','••••••'],['Currency','PKR'],['Mode','Sandbox'],['Timezone','Asia/Karachi']].map(([k,v]) => (
                <div key={k} style={{ padding:'12px 16px', background:'#1a1a24', borderRadius:10 }}>
                  <div style={{ fontSize:12, color:'#9898b0', marginBottom:4 }}>{k}</div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
function Inventory() {
  const [inv, setInv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [keysInput, setKeysInput] = useState('');
  const { addToast } = useToastStore();

  useEffect(() => {
    api.get('/api/admin/inventory').then(({ data }) => setInv(data.inventory||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const addKeys = async () => {
    if (!selected || !keysInput.trim()) return;
    const keys = keysInput.split('\n').map(k => k.trim()).filter(Boolean);
    try {
      await api.post(`/api/products/${selected}/keys`, { keys });
      addToast(`Added ${keys.length} keys!`, 'success');
      setKeysInput('');
      setSelected(null);
      api.get('/api/admin/inventory').then(({ data }) => setInv(data.inventory||[]));
    } catch(err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>Key Inventory</h1>
      {selected && (
        <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, padding:20, marginBottom:20 }}>
          <h3 style={{ marginBottom:12 }}>Add Keys to: {inv.find(i=>i._id===selected)?.name}</h3>
          <textarea value={keysInput} onChange={e => setKeysInput(e.target.value)}
            placeholder="Paste keys here, one per line:&#10;XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY"
            style={{ width:'100%', minHeight:120, background:'#1a1a24', border:'1px solid #2a2a3a', borderRadius:10, padding:12, color:'#e8e8f0', fontFamily:'monospace', fontSize:14, resize:'vertical' }} />
          <div style={{ display:'flex', gap:10, marginTop:10 }}>
            <button className="btn btn-primary btn-sm" onClick={addKeys}>Add Keys</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'#1a1a24' }}>
              {['Product','Category','Available Keys','Used Keys','Delivery','Actions'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#9898b0', fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#9898b0' }}>Loading...</td></tr>
              : inv.map(i => (
              <tr key={i._id} style={{ borderBottom:'1px solid #1a1a24' }}>
                <td style={{ padding:'12px 16px', fontWeight:600 }}>{i.name}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0' }}>{i.category}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ color: i.availableKeys > 5 ? '#22d68a' : i.availableKeys > 0 ? '#f5a623' : '#ff5a5a', fontWeight:700 }}>
                    {i.stock === 'Unlimited' ? '∞' : i.availableKeys}
                  </span>
                </td>
                <td style={{ padding:'12px 16px', color:'#9898b0' }}>{i.usedKeys}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0' }}>{i.deliveryType}</td>
                <td style={{ padding:'12px 16px' }}>
                  <button onClick={() => setSelected(i._id)} style={{ background:'#7c6cff22', border:'none', color:'#a78bfa', borderRadius:8, padding:'6px 12px', fontSize:12, cursor:'pointer' }}>+ Add Keys</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── COUPONS ─────────────────────────────────────────────────────────────────
function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code:'', type:'percent', value:'', minOrderAmount:'0', maxUses:'', expiresAt:'' });
  const { addToast } = useToastStore();

  useEffect(() => {
    api.get('/api/admin/coupons').then(({ data }) => setCoupons(data.coupons||[])).catch(()=>{});
  }, []);

  const save = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/admin/coupons', form);
      setCoupons(c => [data.coupon, ...c]);
      setShowForm(false);
      addToast('Coupon created!', 'success');
      setForm({ code:'', type:'percent', value:'', minOrderAmount:'0', maxUses:'', expiresAt:'' });
    } catch(err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const del = async id => {
    await api.delete(`/api/admin/coupons/${id}`);
    setCoupons(c => c.filter(x => x._id !== id));
    addToast('Coupon deleted', 'info');
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Coupons</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>+ Create Coupon</button>
      </div>
      {showForm && (
        <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, padding:20, marginBottom:20 }}>
          <form onSubmit={save} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
            {[['code','Code (e.g. SAVE20)'],['value','Value'],['minOrderAmount','Min Order $']].map(([k,l]) => (
              <div key={k}>
                <label style={{ display:'block', fontSize:12, color:'#9898b0', marginBottom:4 }}>{l}</label>
                <input className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0' }} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} required={k==='code'||k==='value'} />
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:12, color:'#9898b0', marginBottom:4 }}>Type</label>
              <select className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0' }} value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, color:'#9898b0', marginBottom:4 }}>Max Uses</label>
              <input className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0' }} type="number" value={form.maxUses} onChange={e => setForm(f => ({...f,maxUses:e.target.value}))} placeholder="Unlimited" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, color:'#9898b0', marginBottom:4 }}>Expires At</label>
              <input className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0' }} type="date" value={form.expiresAt} onChange={e => setForm(f => ({...f,expiresAt:e.target.value}))} />
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">Create</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'#1a1a24' }}>
              {['Code','Type','Value','Used','Min Order','Expires','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#9898b0', fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c._id} style={{ borderBottom:'1px solid #1a1a24' }}>
                <td style={{ padding:'12px 16px', fontWeight:800, color:'#7c6cff', fontFamily:'monospace' }}>{c.code}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0' }}>{c.type}</td>
                <td style={{ padding:'12px 16px', fontWeight:700 }}>{c.type==='percent'?`${c.value}%`:`$${c.value}`}</td>
                <td style={{ padding:'12px 16px' }}>{c.usedCount}/{c.maxUses||'∞'}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0' }}>${c.minOrderAmount}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0', fontSize:12 }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                <td style={{ padding:'12px 16px' }}><span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background: c.active?'#22d68a22':'#ff5a5a22', color: c.active?'#22d68a':'#ff5a5a' }}>{c.active?'Active':'Inactive'}</span></td>
                <td style={{ padding:'12px 16px' }}>
                  <button onClick={() => del(c._id)} style={{ background:'#ff5a5a22', border:'none', color:'#ff5a5a', borderRadius:8, padding:'6px 12px', fontSize:12, cursor:'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── USERS ADMIN ─────────────────────────────────────────────────────────────
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/users').then(({ data }) => setUsers(data.users||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>Users</h1>
      <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'#1a1a24' }}>
              {['Name','Email','Country','Role','Joined','Status'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#9898b0', fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding:40, textAlign:'center' }}>Loading...</td></tr>
              : users.map(u => (
              <tr key={u._id} style={{ borderBottom:'1px solid #1a1a24' }}>
                <td style={{ padding:'12px 16px', fontWeight:600 }}>{u.name}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0' }}>{u.email}</td>
                <td style={{ padding:'12px 16px', color:'#9898b0' }}>{u.country || '—'}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ padding:'2px 10px', borderRadius:999, fontSize:11, fontWeight:700, background: u.role==='admin'?'#7c6cff22':'#22d68a22', color: u.role==='admin'?'#a78bfa':'#22d68a' }}>{u.role}</span>
                </td>
                <td style={{ padding:'12px 16px', color:'#9898b0', fontSize:12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ padding:'2px 10px', borderRadius:999, fontSize:11, fontWeight:700, background: u.isActive?'#22d68a22':'#ff5a5a22', color: u.isActive?'#22d68a':'#ff5a5a' }}>{u.isActive?'Active':'Banned'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function AdminSettings() {
  const { addToast } = useToastStore();
  const save = () => addToast('Settings saved!', 'success');
  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>Settings</h1>
      <div style={{ background:'#111118', border:'1px solid #2a2a3a', borderRadius:14, padding:24, maxWidth:600 }}>
        <h3 style={{ marginBottom:18, fontWeight:700 }}>Store Configuration</h3>
        {[['Store Name','PlayBeat Digital'],['Support Email','support@playbeat.digital'],['Currency','USD'],['Timezone','Asia/Karachi']].map(([l,v]) => (
          <div key={l} style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:13, color:'#9898b0', marginBottom:6 }}>{l}</label>
            <input className="input" style={{ background:'#1a1a24', border:'1px solid #2a2a3a', color:'#e8e8f0' }} defaultValue={v} />
          </div>
        ))}
        <button className="btn btn-primary btn-sm" onClick={save}>Save Settings</button>
      </div>
    </div>
  );
}

// ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const location = useLocation();
  const current = location.pathname.replace('/admin/', '').replace('/admin', '') || '';

  return (
    <div style={{ display:'flex', height:'100vh', background:'#0a0a0f', color:'#e8e8f0', overflow:'hidden', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <Sidebar current={current} />
      <main style={{ flex:1, overflow:'auto', padding:28 }}>
        <Routes>
          <Route index     element={<Dashboard />} />
          <Route path="products"  element={<Products />} />
          <Route path="orders"    element={<AdminOrders />} />
          <Route path="users"     element={<Users />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="coupons"   element={<Coupons />} />
          <Route path="payments"  element={<PaymentsPanel />} />
          <Route path="settings"  element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
}
