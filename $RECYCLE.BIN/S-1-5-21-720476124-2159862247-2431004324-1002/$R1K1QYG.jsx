import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import DashboardLayout from './DashboardLayout';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CategoriesPage from './pages/CategoriesPage';
import HomepageBuilderPage from './pages/HomepageBuilderPage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import SettingsPage from './pages/SettingsPage';

function RequireAdmin({ children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: '#e8e8e8', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Access Denied</div>
        <div style={{ color: '#777', fontSize: 14 }}>Admin privileges required.</div>
        <a href="/" style={{ marginTop: 8, fontSize: 13, color: '#f97316' }}>← Back to storefront</a>
      </div>
    );
  }
  return children;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="" element={<RequireAdmin><DashboardLayout /></RequireAdmin>}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview"          element={<OverviewPage />} />
        <Route path="products"          element={<ProductsPage />} />
        <Route path="products/new"      element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="inventory"         element={<InventoryPage />} />
        <Route path="orders"            element={<OrdersPage />} />
        <Route path="customers"         element={<CustomersPage />} />
        <Route path="analytics"         element={<AnalyticsPage />} />
        <Route path="categories"        element={<CategoriesPage />} />
        <Route path="homepage"          element={<HomepageBuilderPage />} />
        <Route path="media"             element={<MediaLibraryPage />} />
        <Route path="settings"          element={<SettingsPage />} />
        <Route path="*"                 element={<Navigate to="overview" replace />} />
      </Route>
    </Routes>
  );
}
