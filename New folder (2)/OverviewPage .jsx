import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader, Card, Badge, Table, Td, money, Loading, statusColor, t } from '../../primitives';
import { useAnalyticsStore, useOrdersStore } from '../../store';

// StatCard component left unchanged (you can import it if shared)

const StatCard = ({ label, value, sub, icon, color = t.accent }) => (
  <Card style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#f0f0f0', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  </Card>
);

export default function OverviewPage() {
  const navigate = useNavigate();
  const { overview, topProducts, loading, error, fetchAnalytics } = useAnalyticsStore();
  const { orders, loading: loadingOrders, fetchOrders } = useOrdersStore();

  useEffect(() => {
    fetchAnalytics();
    fetchOrders();
  }, [fetchAnalytics, fetchOrders]);

  if (loading && !overview) return <Loading label="Loading dashboard…" />;

  const ov = overview || { revenue: 0, orders: 0, customers: 0, products: 0, revenueChange: 0, ordersChange: 0 };
  const recentOrders = orders.slice(0, 6);

  return (
    <Page>
      <PageHeader
        title="Overview"
        subtitle="Welcome back — here's what's happening today."
        actions={
          <button
            onClick={() => navigate('/admin/orders')}
            style={{
              background: t.panel2,
              border: `1px solid ${t.line2}`,
              borderRadius: 8,
              padding: '7px 14px',
              color: t.text,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            View All Orders
          </button>
        }
      />

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: t.red, marginBottom: 20 }}>
          ⚠ Could not reach API: {error}. Showing cached or empty data.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Revenue (30d)"
          value={money(ov.revenue)}
          sub={ov.revenueChange >= 0 ? `+${ov.revenueChange}% vs last month` : `${ov.revenueChange}% vs last month`}
          icon="💰"
          color={t.green}
        />
        <StatCard
          label="Orders (30d)"
          value={ov.orders?.toLocaleString() ?? '—'}
          sub={ov.ordersChange >= 0 ? `+${ov.ordersChange}% vs last month` : `${ov.ordersChange}%`}
          icon="🧾"
          color={t.blue}
        />
        <StatCard label="Customers" value={ov.customers?.toLocaleString() ?? '—'} sub="Total registered" icon="👥" color={t.accent} />
        <StatCard label="Products" value={ov.products?.toLocaleString() ?? '—'} sub="Active listings" icon="📦" color={t.yellow} />
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>Recent Orders</div>
          <button onClick={() => navigate('/admin/orders')} style={{ fontSize: 12, color: t.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
            View all →
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: t.muted, fontSize: 13 }}>
            {loadingOrders ? 'Loading orders…' : 'No orders yet.'}
          </div>
        ) : (
          <Table head={['Order', 'Customer', 'Items', 'Total', 'Status', 'Date']}>
            {recentOrders.map(order => (
              <tr key={order._id}>
                <Td>
                  <span style={{ color: t.accent, fontWeight: 500, fontSize: 12 }}>#{order._id?.slice(-6).toUpperCase()}</span>
                </Td>
                <Td>{order.user?.name || order.customerName || '—'}</Td>
                <Td>{order.items?.length ?? '—'}</Td>
                <Td>
                  <span style={{ fontWeight: 600, color: '#f0f0f0' }}>{money(order.total)}</span>
                </Td>
                <Td>
                  <Badge color={statusColor(order.status)}>{order.status}</Badge>
                </Td>
                <Td style={{ color: t.muted, fontSize: 12 }}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {topProducts?.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', marginBottom: 16 }}>Top Products</div>
          <Table head={['Product', 'Category', 'Units Sold', 'Revenue']}>
            {topProducts.slice(0, 5).map((p, i) => (
              <tr key={p._id || i}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: t.muted, width: 18 }}>#{i + 1}</span>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </Td>
                <Td>
                  <Badge color="muted">{p.category}</Badge>
                </Td>
                <Td>{p.sold?.toLocaleString() ?? '—'}</Td>
                <Td>
                  <span style={{ fontWeight: 600, color: t.green }}>{money(p.revenue)}</span>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </Page>
  );
}
