import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../components/ProductCard';
import api from '../../utils/api';

export default function CategoryPage({ category, title, icon, description }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { category, sort, page, limit: 24 };
      if (search) params.search = search;
      const { data } = await api.get('/api/products', { params });
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) {
      console.error(e);
      // Show demo products if API unavailable
      setProducts(getDemoProducts(category));
      setPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, sort, page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,var(--panel),var(--panel2))',
        borderBottom: '1px solid var(--line)',
        padding: '40px 0'
      }}>
        <div className="wrap">
          <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>{title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>{description}</p>
          <div style={{ marginTop: 8, color: 'var(--accent)', fontWeight: 600 }}>{total} products available</div>
        </div>
      </div>

      <div className="wrap" style={{ padding: '32px 0' }}>
        {/* Filters */}
        <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <input
            className="input"
            style={{ maxWidth: 320 }}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
          <div className="flex gap-8">
            {['newest', 'popular', 'price-asc', 'price-desc', 'rating'].map(s => (
              <button
                key={s}
                onClick={() => { setSort(s); setPage(1); }}
                className="btn btn-sm"
                style={{
                  background: sort === s ? 'var(--accent)' : 'rgba(255,255,255,.07)',
                  color: sort === s ? '#07111f' : 'var(--text)'
                }}
              >
                {s === 'newest' ? 'New' : s === 'popular' ? 'Popular' : s === 'price-asc' ? '$ Low' : s === 'price-desc' ? '$ High' : 'Rating'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex-center" style={{ minHeight: 300 }}><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="flex-center" style={{ minHeight: 300, flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p style={{ color: 'var(--muted)' }}>No products found</p>
          </div>
        ) : (
          <div className="grid-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex-center gap-8" style={{ marginTop: 32 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>Page {page} of {pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function getDemoProducts(category) {
  const demos = {
    'games': [
      { _id: '1', name: 'Valorant Points 1000 VP', price: 9.99, comparePrice: 12.99, category, badge: 'HOT', ratings: { average: 5, count: 234 }, region: 'Global' },
      { _id: '2', name: 'Steam Gift Card $50', price: 47.99, category, badge: 'SALE', ratings: { average: 4.8, count: 156 }, region: 'Global' },
      { _id: '3', name: 'PlayStation Plus 12 Months', price: 54.99, comparePrice: 69.99, category, badge: 'TRENDING', ratings: { average: 4.9, count: 312 } },
    ],
    'ai-tools': [
      { _id: '4', name: 'ChatGPT Plus 1 Month', price: 19.99, category, badge: 'HOT', ratings: { average: 5, count: 567 } },
      { _id: '5', name: 'Midjourney Basic Plan', price: 9.99, category, badge: 'NEW', ratings: { average: 4.7, count: 234 } },
    ],
    'subscriptions': [
      { _id: '6', name: 'Netflix Premium 1 Month', price: 15.99, category, badge: 'HOT', ratings: { average: 4.9, count: 890 } },
      { _id: '7', name: 'Spotify Premium 3 Months', price: 29.99, comparePrice: 44.97, category, badge: 'SALE', ratings: { average: 4.8, count: 445 } },
    ],
  };
  return demos[category] || [
    { _id: 'd1', name: `${category} Product 1`, price: 19.99, category, ratings: { average: 4.5, count: 50 } },
    { _id: 'd2', name: `${category} Product 2`, price: 34.99, category, ratings: { average: 4.8, count: 80 } },
  ];
}
