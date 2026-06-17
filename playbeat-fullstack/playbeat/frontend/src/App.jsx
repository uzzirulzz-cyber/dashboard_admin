import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useToastStore } from './store';
import Layout from './components/Layout';

const Home          = lazy(() => import('./pages/Home'));
const Games         = lazy(() => import('./pages/category/Games'));
const GiftCards     = lazy(() => import('./pages/category/GiftCards'));
const Software      = lazy(() => import('./pages/category/Software'));
const AiTools       = lazy(() => import('./pages/category/AiTools'));
const GameItems     = lazy(() => import('./pages/category/GameItems'));
const Accounts      = lazy(() => import('./pages/category/Accounts'));
const Subscriptions = lazy(() => import('./pages/category/Subscriptions'));
const TopUp         = lazy(() => import('./pages/category/TopUp'));
const Trending      = lazy(() => import('./pages/Trending'));
const BestValue     = lazy(() => import('./pages/BestValue'));
const Product       = lazy(() => import('./pages/Product'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const OrderSuccess  = lazy(() => import('./pages/OrderSuccess'));
const Login         = lazy(() => import('./pages/auth/Login'));
const Register      = lazy(() => import('./pages/auth/Register'));
const Account       = lazy(() => import('./pages/auth/Account'));
const Orders        = lazy(() => import('./pages/auth/Orders'));
const AdminLayout   = lazy(() => import('./pages/admin/AdminLayout'));

const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
    <div className="spinner" />
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

function Toasts() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span style={{ fontSize:14, fontWeight:500 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toasts />
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Storefront */}
          <Route element={<Layout />}>
            <Route path="/"               element={<Home />} />
            <Route path="/games"          element={<Games />} />
            <Route path="/gift-cards"     element={<GiftCards />} />
            <Route path="/software"       element={<Software />} />
            <Route path="/ai-tools"       element={<AiTools />} />
            <Route path="/game-items"     element={<GameItems />} />
            <Route path="/accounts"       element={<Accounts />} />
            <Route path="/subscriptions"  element={<Subscriptions />} />
            <Route path="/top-up"         element={<TopUp />} />
            <Route path="/trending"       element={<Trending />} />
            <Route path="/best-value"     element={<BestValue />} />
            <Route path="/product/:slug"  element={<Product />} />
            <Route path="/cart"           element={<Cart />} />
            <Route path="/checkout"       element={<Checkout />} />
            <Route path="/order-success"  element={<OrderSuccess />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/account"        element={<PrivateRoute><Account /></PrivateRoute>} />
            <Route path="/my-orders"      element={<PrivateRoute><Orders /></PrivateRoute>} />
          </Route>

          {/* Admin */}
          <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}
