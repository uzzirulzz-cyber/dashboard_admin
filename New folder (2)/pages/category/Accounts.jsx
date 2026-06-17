import React, { useState } from 'react';
import { useAuthStore, useToastStore } from '../../store';
import api from '../../utils/api';

export function Account() {
  const { user, setAuth } = useAuthStore();
  const { addToast } = useToastStore();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || 'PK'
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field) => (e) => setForm(form => ({ ...form, [field]: e.target.value }));

  const save = async (e) => {
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
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--muted)' }}>
              Full Name
              <input className="input" value={form.name} onChange={updateField('name')} required />
            </label>

            <label style={{ fontSize: 13, color: 'var(--muted)' }}>
              Phone
              <input className="input" value={form.phone} onChange={updateField('phone')} placeholder="+92 300 1234567" />
            </label>

            <label style={{ fontSize: 13, color: 'var(--muted)' }}>
              Country
              <select className="input" value={form.country} onChange={updateField('country')}>
                <option value="PK">Pakistan</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="AE">UAE</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label style={{ fontSize: 13, color: 'var(--muted)', opacity: 0.6 }}>
              Email (read-only)
              <input className="input" value={user?.email || ''} readOnly />
            </label>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Account;
