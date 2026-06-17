import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import Sidebar from './Sidebar';  // your sidebar component
import Dashboard from './Dashboard';  // all your admin page components
import Products from './Products';
// ... import other admin page components ...

export default function AdminLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  // Get current route segment after /admin/
  const currentSection = location.pathname.replace('/admin', '').replace(/^\//, '').split('/')[0];

  // Check if user is authorized
  const allowedRoles = ['admin', 'super_admin', 'manager', 'support', 'content_manager'];

  if (!user || !allowedRoles.includes(user.role)) {
    // Show Access Denied if no user or unauthorized role
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0f', color: '#5a5a72' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 18, color: '#e2e2f0', marginBottom: 8 }}>Access Denied</div>
          <div style={{ fontSize: 13 }}>Admin privileges required</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', color: '#e2e2f0', overflow: 'hidden' }}>
      {/* Sidebar with navigation, passing current path and user role */}
      <Sidebar current={currentSection} userRole={user.role} />

      {/* Main area with admin pages */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          {/* Add other admin routes here */}
          {/* Example: */}
          {/* <Route path="/orders" element={<Orders />} /> */}
          {/* <Route path="/customers" element={<Customers />} /> */}
          {/* ... */}
        </Routes>
      </main>
    </div>
  );
}
