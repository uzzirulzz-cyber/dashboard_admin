import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password, api);
    if (success) {
      toast.success('Logged in successfully!');
      navigate('/admin', { replace: true });
    } else {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '70vh', padding: '40px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
            PLAY<span style={{ color: 'var(--accent)' }}>BEAT</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: 16, marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
