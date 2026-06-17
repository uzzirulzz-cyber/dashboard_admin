import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useToastStore } from '../../store';
import api from '../../utils/api';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      setAuth(data.user, data.token);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight:'70vh', padding:'40px 20px' }}>
      <div className="card" style={{ width:'100%', maxWidth:420, padding:36 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>PLAY<span style={{ color:'var(--accent)' }}>BEAT</span></div>
          <h2 style={{ fontSize:26, fontWeight:800 }}>Welcome Back</h2>
          <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>Sign in to your account</p>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Email</label>
            <input className="input" type="email" value={form.email} onChange={upd('email')} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Password</label>
            <input className="input" type="password" value={form.password} onChange={upd('password')} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ width:'100%', padding:16, marginTop:8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--muted)' }}>
          No account? <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', country: 'PK' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', form);
      setAuth(data.user, data.token);
      addToast(`Account created! Welcome, ${data.user.name}!`, 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight:'70vh', padding:'40px 20px' }}>
      <div className="card" style={{ width:'100%', maxWidth:420, padding:36 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>PLAY<span style={{ color:'var(--accent)' }}>BEAT</span></div>
          <h2 style={{ fontSize:26, fontWeight:800 }}>Create Account</h2>
          <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>Join PlayBeat Digital</p>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Full Name</label>
            <input className="input" value={form.name} onChange={upd('name')} placeholder="John Doe" required />
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Email</label>
            <input className="input" type="email" value={form.email} onChange={upd('email')} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Password</label>
            <input className="input" type="password" value={form.password} onChange={upd('password')} placeholder="Min 6 characters" required minLength={6} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'var(--muted)', marginBottom:6 }}>Country</label>
            <select className="input" value={form.country} onChange={upd('country')}>
              <option value="PK">Pakistan</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AE">UAE</option>
              <option value="SA">Saudi Arabia</option>
              <option value="IN">India</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width:'100%', padding:16, marginTop:8 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--muted)' }}>
          Have an account? <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
