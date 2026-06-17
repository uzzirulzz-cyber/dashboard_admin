import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page, PageHeader, Card, Button, Input, Select, Field, t } from '../../primitives';
import { useProductsStore, useCategoriesStore } from '../../store';
import { apiFetch } from '../../store/index';

const EMPTY = {
  name: '', description: '', price: '', comparePrice: '', sku: '', category: '',
  status: 'active', stock: '', thumbnail: '', tags: ''
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { createProduct, updateProduct } = useProductsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load product details if editing
  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    apiFetch(`/products/${id}`)
      .then(data => {
        const p = data.product ?? data;
        setForm({
          name: p.name || '',
          description: p.description || '',
          price: p.price ?? '',
          comparePrice: p.comparePrice ?? '',
          sku: p.sku || '',
          category: p.category?._id || p.category || '',
          status: p.status || 'active',
          stock: p.stock ?? '',
          thumbnail: p.thumbnail || '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: form.stock !== '' ? Number(form.stock) : undefined,
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await updateProduct(id, body);
      } else {
        await createProduct(body);
      }
      navigate('/admin/products');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Page><div style={{ color: t.muted, fontSize: 13 }}>Loading product…</div></Page>;

  return (
    <Page>
      <PageHeader
        title={isEdit ? 'Edit Product' : 'New Product'}
        actions={<Button variant="secondary" onClick={() => navigate('/admin/products')}>← Back</Button>}
      />

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: t.red, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 16 }}>Product Details</div>
              <Field label="Name *">
                <Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Product name" />
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Product description…"
                  style={{
                    background: t.panel2, border: `1px solid ${t.line2}`, borderRadius: 8,
                    padding: '8px 12px', color: t.text, fontSize: 13,
                    width: '100%', minHeight: 120, resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </Field>
              <Field label="Tags (comma-separated)">
                <Input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="games, key, instant" />
              </Field>
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 16 }}>Pricing</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Price *">
                  <Input required type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="19.99" />
                </Field>
                <Field label="Compare-at price">
                  <Input type="number" step="0.01" min="0" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} placeholder="24.99" />
                </Field>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 16 }}>Organisation</div>
              <Field label="Category">
                <Select value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
              <Field label="SKU">
                <Input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="PROD-001" />
              </Field>
              <Field label="Stock (leave blank for unlimited)">
                <Input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="100" />
              </Field>
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 16 }}>Media</div>
              <Field label="Thumbnail URL">
                <Input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://…" />
              </Field>
              {form.thumbnail && (
                <img src={form.thumbnail} alt="" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 160, marginTop: 8 }} />
              )}
            </Card>

            <Button type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
              {loading ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Product')}
            </Button>
          </div>
        </div>
      </form>
    </Page>
  );
}
