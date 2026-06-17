import React, { useState, useEffect } from 'react';
import { useAuthStore, useToastStore } from '../../store';
import api from '../../utils/api';

export function Account() {
  const { user, setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', country: user?.country || '' });
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wrap" style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>👤 My Account</h1>
      <div style={{ maxWidth: 520 }}>
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--accent),var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: '#07111f'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{user?.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>{user?.email}</div>
              <div style={{
                display: 'inline-block',
                background: user?.role === 'admin' ? 'rgba(139,92,246,.2)' : 'rgba(56,211,159,.1)',
                border: `1px solid ${user?.role === 'admin' ? 'rgba(139,92,246,.4)' : 'rgba(56,211,159,.3)'}`,
                borderRadius: 999, padding: '2px 10px',
                fontSize: 12, fontWeight: 700, color: user?.role === 'admin' ? '#a78bfa' : 'var(--good)',
                marginTop: 4
              }}>
                {user?.role === 'admin' ? '⚙️ Admin' : '👤 Customer'}
              </div>
            </div>
          </div>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 5 }}>Full Name</label>
              <input className="input" value={form.name} onChange={upd('name')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 5 }}>Phone</label>
              <input className="input" value={form.phone} onChange={upd('phone')} placeholder="+92 300 1234567" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 5 }}>Country</label>
              <select className="input" value={form.country} onChange={upd('country')}>
                <option value="PK">Pakistan</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="AE">UAE</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 5 }}>Email</label>
              <input className="input" value={user?.email} readOnly style={{ opacity: 0.6 }} />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
