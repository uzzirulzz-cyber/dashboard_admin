import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader, Card, Badge, Table, Td, Button, Input, Select, money, Loading, EmptyState, t, statusColor } from '../../primitives';
import { useProductsStore, useCategoriesStore } from '../../store';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { products, total, page, loading, error, filters, fetchProducts, setFilters, setPage, deleteProduct } = useProductsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <Page>
      <PageHeader
        title="Products"
        subtitle={`${total} products total`}
        actions={<Button onClick={() => navigate('/admin/products/new')}>+ New Product</Button>}
      />

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: t.red, marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Input placeholder="Search products…" value={filters.search} onChange={e => setFilters({ search: e.target.value })} style={{ maxWidth: 260 }} />
          <Select value={filters.category} onChange={e => setFilters({ category: e.target.value })} style={{ width: 160 }}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
          <Select value={filters.status} onChange={e => setFilters({ status: e.target.value })} style={{ width: 140 }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
          <Select value={filters.sort} onChange={e => setFilters({ sort: e.target.value })} style={{ width: 160 }}>
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="-price">Price: high → low</option>
            <option value="price">Price: low → high</option>
            <option value="name">Name A–Z</option>
          </Select>
        </div>
      </Card>

      <Card pad={0}>
        {loading && products.length === 0 ? (
          <Loading />
        ) : products.length === 0 ? (
          <EmptyState icon="📦" title="No products yet" subtitle="Add your first product to start selling." action={<Button onClick={() => navigate('/admin/products/new')}>Add Product</Button>} />
        ) : (
          <Table head={['Product', 'Category', 'Price', 'Status', 'Stock', '']}>
            {products.map(p => (
              <tr key={p._id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.thumbnail && <img src={p.thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: t.panel2 }} />}
                    <div>
                      <div style={{ fontWeight: 500, color: '#e8e8e8' }}>{p.name}</div>
                      {p.sku && <div style={{ fontSize: 11, color: t.muted }}>SKU: {p.sku}</div>}
                    </div>
                  </div>
                </Td>
                <Td><Badge color="muted">{p.category?.name || p.category || '—'}</Badge></Td>
                <Td>
                  <span style={{ fontWeight: 600, color: '#f0f0f0' }}>{money(p.price)}</span>
                  {p.comparePrice && <div style={{ fontSize: 11, color: t.muted, textDecoration: 'line-through' }}>{money(p.comparePrice)}</div>}
                </Td>
                <Td><Badge color={statusColor(p.status)}>{p.status || 'active'}</Badge></Td>
                <Td style={{ color: (p.stock ?? 0) < 5 ? t.red : t.muted }}>
                  {p.stock ?? '∞'}
                </Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/products/${p._id}/edit`)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(p._id)} disabled={deleting === p._id}>
                      {deleting === p._id ? '…' : 'Delete'}
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <Button variant="secondary" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>← Prev</Button>
          <span style={{ fontSize: 13, color: t.muted }}>Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next →</Button>
        </div>
      )}
    </Page>
  );
}
