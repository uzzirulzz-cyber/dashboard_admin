import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store'; // your auth management
import api from '../../utils/api'; // configured axios with your API base URL

const NAV = [
  { path: '', icon: '📊', label: 'Dashboard', roles: ['super_admin', 'admin', 'manager', 'support', 'content_manager'] },
  { path: 'products', icon: '📦', label: 'Products', roles: ['super_admin', 'admin', 'manager', 'content_manager'] },
  // ... add rest of your routes here with roles ...
];

const COLORS = {
  bg: '#0a0a0f', panel: '#0f0f1a', border: '#1a1a2e', accent: '#7c6cff',
  text: '#e2e2f0', muted: '#5a5a72',
};

function Sidebar({ current, userRole }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const visibleNav = NAV.filter(n => n.roles.includes(userRole));
  return (
    <aside style={{
      width: 220, background: COLORS.bg, borderRight: `1px solid ${COLORS.border}`,
      display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0, overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 16px', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, background: COLORS.accent, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>PlayBeat</div>
            <div style={{
              fontSize: 10, color: COLORS.muted,
              textTransform: 'uppercase', letterSpacing: '.06em'
            }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {visibleNav.map(n => {
          const active = current === n.path || (n.path && current?.startsWith(n.path));
          return (
            <Link key={n.path} to={`/admin/${n.path}`} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
              textDecoration: 'none',
              color: active ? COLORS.text : COLORS.muted,
              background: active ? 'rgba(124,108,255,.15)' : 'transparent',
              borderLeft: active ? `2px solid ${COLORS.accent}` : '2px solid transparent',
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              transition: 'all .15s'
            }}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${COLORS.border}` }}>
        <button onClick={() => { logout(); navigate('/login'); }} style={{
          width: '100%', padding: '8px',
          background: 'rgba(239,68,68,.1)', border: `1px solid rgba(239,68,68,.3)`,
          borderRadius: 8, color: COLORS.danger, fontSize: 13, cursor: 'pointer'
        }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const { user } = useAuthStore();
  const location = useLocation();
  const currentPath = location.pathname.replace('/admin', '').replace(/^\//, '').split('/')[0];

  if (!user || !['admin', 'super_admin', 'manager', 'support', 'content_manager'].includes(user.role)) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: COLORS.bg, color: COLORS.muted,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 18, color: COLORS.text, marginBottom: 8 }}>Access Denied</div>
          <div style={{ fontSize: 13 }}>Admin privileges required</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: COLORS.bg, color: COLORS.text, overflow: 'hidden' }}>
      <Sidebar current={currentPath} userRole={user.role} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          {/* Add other routes here */}
        </Routes>
      </main>
    </div>
  );
}
