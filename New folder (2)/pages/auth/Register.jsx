import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import api from '../utils/api';
import { t, Button, Input } from '../components/ui/primitives';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', country: 'PK' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const updateField = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', form);
      setAuth(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}! Your account was created.`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '70vh', padding: '40px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
            PLAY<span style={{ color: 'var(--accent)' }}>BEAT</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Join PlayBeat Digital</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              Full Name
            </label>
            <Input
              value={form.name}
              onChange={updateField('name')}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              Email
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              Password
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={updateField('password')}
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              Country
            </label>
            <select
              className="input"
              value={form.country}
              onChange={updateField('country')}
            >
              <option value="PK">Pakistan</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AE">UAE</option>
              <option value="SA">Saudi Arabia</option>
              <option value="IN">India</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Button type="submit" size="lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </Button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 14,
            color: 'var(--muted)',
          }}
        >
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
