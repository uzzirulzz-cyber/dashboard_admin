import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE } from '../../store/index';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      const user = data.user || data.data?.user;
      const token = data.token || data.data?.token;
      if (!user || !token) throw new Error('Invalid response from server');
      if (user.role !== 'admin' && user.role !== 'super_admin') throw new Error('Admin access required');
      setAuth(user, token);
      navigate('/admin/overview');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8,
    padding: '10px 14px', color: '#e8e8e8', fontSize: 14, width: '100%',
    outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: 24 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: '#f97316', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff' }}>N</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0' }}>NexusAdmin</div>
            <div style={{ fontSize: 11, color: '#555' }}>PlayBeat Enterprise</div>
          </div>
        </div>

        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 28 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 600, color: '#f5f5f5' }}>Sign in</h1>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: '#777' }}>Admin access only</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12, color: '#777', marginBottom: 6, fontWeight: 500 }}>Email</span>
              <input style={inp} type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@playbeat.digital" />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12, color: '#777', marginBottom: 6, fontWeight: 500 }}>Password</span>
              <input style={inp} type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" />
            </label>
            <button type="submit" disabled={loading} style={{
              background: loading ? '#7c4a1e' : '#f97316', border: 'none', borderRadius: 8,
              padding: '11px', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, transition: 'background 0.15s',
            }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#444' }}>
          <a href="/" style={{ color: '#555', textDecoration: 'none' }}>← Back to storefront</a>
        </div>
      </div>
    </div>
  );
}
