import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('auth_token', token);
    set({ user, token, isAuthenticated: true, error: null });
  },

  clearAuth: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  login: async (email, password, api) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.user && res.data.token) {
        localStorage.setItem('auth_token', res.data.token);
        set({ user: res.data.user, token: res.data.token, isAuthenticated: true, loading: false });
        return true;
      } else {
        set({ error: 'Invalid login response', loading: false });
        return false;
      }
    } catch (e) {
      set({ error: e.response?.data?.message || e.message || 'Login failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async (api) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    set({ loading: true });
    try {
      const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      set({ user: res.data.user, token, isAuthenticated: true, loading: false });
    } catch {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  }
}));
