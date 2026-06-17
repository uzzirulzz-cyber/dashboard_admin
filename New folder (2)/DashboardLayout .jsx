import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store';  // your existing stores
import axios from 'axios';

const navItems = [
  // your navItems unchanged
];

const API_BASE = "https://xtra11111111.onrender.com/api"; // backend base URL

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const activeId = navItems.flatMap(g => g.items).find(i => location.pathname.startsWith(i.path))?.id;

  useEffect(() => {
    // Fetch unread orders count from backend (adjust endpoint as needed)
    async function fetchUnread() {
      try {
        const res = await axios.get(`${API_BASE}/admin/orders/unread-count`, {
          headers: {
            Authorization: `Bearer ${user?.token}`, // if needed
          },
        });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch unread orders count", err);
        setUnreadCount(0);
      }
    }
    if(user) fetchUnread();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Navigate to a search results page or filter list
    navigate(`/admin/search?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', color: '#e8e8e8', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64, minWidth: sidebarOpen ? 220 : 64,
        background: '#111', borderRight: '1px solid #222',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease, min-width 0.2s ease', overflow: 'hidden'
      }}>
        {/* logo and nav — keep your existing markup */}
        {/* include unreadCount badge for orders nav item */}
        {/* ... your nav rendering code ... */}
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#111', borderBottom: '1px solid #222', flexShrink: 0 }}>
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: 18, padding: 4 }}>☰</button>
          <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
            <input
              type="search"
              placeholder="Search products, orders, customers…"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '7px 14px', color: '#e0e0e0', fontSize: 13, width: '100%', outline: 'none' }}
            />
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8,
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#888', position: 'relative'
            }}>
              🔔
              {unreadCount > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />}
            </button>
            <button onClick={() => window.open('/', '_blank')} style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8,
              padding: '7px 12px', color: '#888', fontSize: 12, cursor: 'pointer'
            }}>
              🛒 Storefront ↗
            </button>
            <button onClick={() => navigate('/admin/products/new')} style={{
              background: '#f97316', border: 'none', borderRadius: 8,
              padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}>
              + Add Product
            </button>
          </div>
        </header>

        {/* Outlet for nested routes */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#0a0a0a' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
