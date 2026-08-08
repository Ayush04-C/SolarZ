import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#2C5530', '#D4AF37', '#8B9D83', '#C5C5C5', '#10b981'];

const SellerAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [showRecentOrders, setShowRecentOrders] = useState(true);
  const [orderPage, setOrderPage] = useState(1);

  useEffect(() => {
    setOrderPage(1);
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/seller/analytics?range=${range}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  const ranges = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'All Time', value: 'all' }
  ];

  if (loading && !data) return <div className="loading-state">Loading analytics...</div>;
  if (!data) return null;

  const { summary, revenueTrend, topProducts, categoryBreakdown, recentOrders } = data;
  const hasData = summary.totalOrders > 0;

  const ITEMS_PER_PAGE = 5;
  const totalOrderPages = recentOrders ? Math.ceil(recentOrders.length / ITEMS_PER_PAGE) : 0;
  const paginatedOrders = recentOrders ? recentOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE) : [];

  return (
    <div className="analytics-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>Seller Analytics</h2>
        
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--color-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: 'none',
                backgroundColor: range === r.value ? 'var(--color-primary)' : 'transparent',
                color: range === r.value ? '#fff' : 'var(--color-text)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Total Revenue</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>${summary.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Total Orders</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-text)' }}>{summary.totalOrders}</p>
        </div>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Avg Order Value</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-accent)' }}>${summary.averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="card stat-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Units Sold</h3>
          <p className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-text)' }}>{summary.totalUnitsSold}</p>
        </div>
      </div>

      {!hasData ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No sales data yet for this period.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)', gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>Revenue Trend</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)' }} tickMargin={10} minTickGap={30} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)' }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>Top Products (Revenue)</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" tickFormatter={(val) => `$${val}`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'var(--color-text)', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>Category Breakdown</h3>
            <div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="category"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                {categoryBreakdown.map((c, i) => (
                  <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{ width: 12, height: 12, backgroundColor: COLORS[i % COLORS.length], borderRadius: '50%' }}></div>
                    <span>{c.category} ({c.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', gridColumn: '1 / -1' }}>
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowRecentOrders(!showRecentOrders)}
            >
              <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Recent Orders</h3>
              <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>{showRecentOrders ? '▲' : '▼'}</span>
            </div>
            
            {showRecentOrders && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                {(!data.recentOrders || data.recentOrders.length === 0) ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>No recent orders in this period.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: '600' }}>Customer</th>
                          <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: '600' }}>Product</th>
                          <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: '600' }}>Qty</th>
                          <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: '600' }}>Revenue</th>
                          <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: '600' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map((order, idx) => (
                          <tr key={`${order.orderId}-${idx}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: 'var(--space-3)' }}>{order.buyerName}</td>
                            <td style={{ padding: 'var(--space-3)' }}>{order.productName}</td>
                            <td style={{ padding: 'var(--space-3)' }}>{order.quantity}</td>
                            <td style={{ padding: 'var(--space-3)', color: 'var(--color-accent)', fontWeight: '600' }}>${order.revenue.toFixed(2)}</td>
                            <td style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)' }}>{new Date(order.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {totalOrderPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 'var(--space-4)', gap: 'var(--space-4)' }}>
                        <button 
                          className="btn-secondary" 
                          onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                          disabled={orderPage === 1}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          Prev
                        </button>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                          Page {orderPage} of {totalOrderPages}
                        </span>
                        <button 
                          className="btn-secondary" 
                          onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))}
                          disabled={orderPage === totalOrderPages}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAnalytics;
