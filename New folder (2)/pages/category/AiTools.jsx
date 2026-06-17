import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { t, Page, PageHeader, Card, Loading, EmptyState } from '../components/ui/primitives';
import ProductCard from '../components/ProductCard';

export default function AITools() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchAIProducts = async () => {
      setLoading(true);
      try {
        const params = { category: 'ai-tools', search, page, limit: 20 };
        const { data } = await api.get('/products', { params });
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (e) {
        // Handle error, e.g., show toast
      } finally {
        setLoading(false);
      }
    };
    fetchAIProducts();
  }, [search, page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <Page>
      <PageHeader title="AI Tools" subtitle="Browse our selection of AI-powered products" />
      
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Search AI tools..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ width: '100%', maxWidth: 400, padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.line2}`, fontSize: 14, color: t.text }}
        />
      </div>

      {loading ? (
        <Loading />
      ) : products.length === 0 ? (
        <EmptyState icon="🤖" title="No AI Tools found" subtitle="Try adjusting your search or check back later." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {products.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: `1px solid ${pageNum === page ? t.accent : t.line2}`,
                    background: pageNum === page ? t.accent : 'transparent',
                    color: pageNum === page ? t.bg : t.text,
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Page>
  );
}
