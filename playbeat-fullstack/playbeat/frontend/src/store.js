import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── AUTH STORE ───────────────────────────────────────────────────────────────
export const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    token: null,
    setAuth: (user, token) => set({ user, token }),
    logout: () => set({ user: null, token: null }),
    isAdmin: () => get().user?.role === 'admin'
  }),
  { name: 'pb-auth', partialize: s => ({ user: s.user, token: s.token }) }
));

// ─── CART STORE ───────────────────────────────────────────────────────────────
export const useCartStore = create(persist(
  (set, get) => ({
    items: [],
    coupon: null,

    addItem: (product, qty = 1) => {
      const items = get().items;
      const existing = items.find(i => i.productId === product._id);
      if (existing) {
        set({ items: items.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + qty } : i) });
      } else {
        set({ items: [...items, { productId: product._id, name: product.name, price: product.price, image: product.thumbnail, category: product.category, quantity: qty }] });
      }
    },

    removeItem: (productId) => set({ items: get().items.filter(i => i.productId !== productId) }),

    updateQty: (productId, qty) => {
      if (qty < 1) return get().removeItem(productId);
      set({ items: get().items.map(i => i.productId === productId ? { ...i, quantity: qty } : i) });
    },

    clearCart: () => set({ items: [], coupon: null }),

    setCoupon: (coupon) => set({ coupon }),
    removeCoupon: () => set({ coupon: null }),

    get subtotal() { return get().items.reduce((s, i) => s + i.price * i.quantity, 0); },
    get itemCount() { return get().items.reduce((s, i) => s + i.quantity, 0); },
    get discount() {
      const c = get().coupon;
      const sub = get().items.reduce((s, i) => s + i.price * i.quantity, 0);
      if (!c) return 0;
      return c.type === 'percent' ? sub * c.value / 100 : c.value;
    },
    get total() {
      const sub = get().items.reduce((s, i) => s + i.price * i.quantity, 0);
      const c = get().coupon;
      const disc = c ? (c.type === 'percent' ? sub * c.value / 100 : c.value) : 0;
      return Math.max(0, sub - disc);
    }
  }),
  { name: 'pb-cart' }
));

// ─── TOAST STORE ─────────────────────────────────────────────────────────────
export const useToastStore = create(set => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
}));
